import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '../../../../lib/razorpay';
import { db } from '../../db';

// ==========================================
// Razorpay Webhook Endpoint
// ==========================================
// URL: POST /api/webhooks/razorpay
//
// This endpoint receives webhook events from Razorpay X.
// For local testing with ngrok, expose this as:
//   ngrok http 3000
//   → Webhook URL: https://<your-ngrok-id>.ngrok-free.app/api/webhooks/razorpay
//
// Configure this URL in:
//   Razorpay Dashboard → Settings → Webhooks → Add New Webhook
//   Events to subscribe: payout.processed, payout.reversed, payout.failed
//
// @see https://razorpay.com/docs/webhooks/

/**
 * POST /api/webhooks/razorpay
 *
 * Handles Razorpay X payout webhook events.
 * Verifies the HMAC-SHA256 signature before processing any event.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body as text (required for HMAC verification — NOT parsed JSON)
    const rawBody = await req.text();

    // 2. Extract the signature header
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('[Webhook] Missing x-razorpay-signature header.');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    // 3. Verify HMAC-SHA256 signature using crypto.timingSafeEqual
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error('[Webhook] Signature verification FAILED — rejecting webhook.');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[Webhook] ✅ Signature verified successfully.');

    // 4. Parse the verified payload
    const payload = JSON.parse(rawBody);
    const eventType: string = payload.event || '';
    const payoutEntity = payload.payload?.payout?.entity;

    console.log(`[Webhook] Event received: ${eventType}`);
    console.log(`[Webhook] Payout ID: ${payoutEntity?.id}, Status: ${payoutEntity?.status}`);

    // 5. Handle specific payout events
    switch (eventType) {
      case 'payout.processed': {
        await handlePayoutProcessed(payoutEntity);
        break;
      }
      case 'payout.reversed': {
        await handlePayoutFailed(payoutEntity, 'REVERSED');
        break;
      }
      case 'payout.failed': {
        await handlePayoutFailed(payoutEntity, 'FAILED');
        break;
      }
      default: {
        console.log(`[Webhook] Unhandled event type: ${eventType} — acknowledging.`);
      }
    }

    // 6. Always return 200 to acknowledge receipt (Razorpay retries on non-2xx)
    return NextResponse.json({ status: 'ok', event: eventType }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error?.message || error);
    // Still return 200 to prevent Razorpay from retrying on parse errors
    return NextResponse.json({ status: 'error', message: 'Internal error' }, { status: 200 });
  }
}

// ==========================================
// Event Handlers
// ==========================================

/**
 * Handle `payout.processed` — the payout was successfully completed.
 * Updates the ledger entry from PENDING/PROCESSING → SUCCESS (PAID).
 */
async function handlePayoutProcessed(payoutEntity: any) {
  if (!payoutEntity?.id) {
    console.warn('[Webhook] payout.processed received but missing payout ID.');
    return;
  }

  const razorpayPayoutId: string = payoutEntity.id;
  const referenceId: string = payoutEntity.reference_id || '';
  const amountPaisa: number = payoutEntity.amount || 0;
  const amountINR = amountPaisa / 100;

  console.log(`[Webhook] Processing payout.processed: ${razorpayPayoutId}, ref: ${referenceId}, ₹${amountINR}`);

  // Update in-memory mock database
  const ledgerEntry = db.royaltyLedger.find(
    (entry) =>
      entry.payoutTransactionId === razorpayPayoutId ||
      entry.id === referenceId
  );

  if (ledgerEntry) {
    const previousStatus = ledgerEntry.status;
    ledgerEntry.status = 'SUCCESS';

    // If the payout was PENDING, add the net royalty to expert's total earnings
    if (previousStatus === 'PENDING') {
      const expert = db.experts.find((e) => e.id === ledgerEntry.expertId);
      if (expert) {
        expert.totalEarnings += ledgerEntry.netRoyalty;
        console.log(`[Webhook] Expert ${expert.name} earnings updated: +₹${ledgerEntry.netRoyalty} → ₹${expert.totalEarnings}`);
      }
    }

    console.log(`[Webhook] Ledger entry ${ledgerEntry.id} updated: ${previousStatus} → SUCCESS`);
  } else {
    console.warn(`[Webhook] No matching ledger entry found for payout ${razorpayPayoutId} / ref ${referenceId}`);
  }

  // Update Prisma database (if connected)
  try {
    const { prisma } = await import('../../../../lib/prisma');

    // Find by payout transaction ID
    const prismaLedger = await prisma.royaltyLedger.findFirst({
      where: { payoutTransactionId: razorpayPayoutId },
    });

    if (prismaLedger) {
      await prisma.royaltyLedger.update({
        where: { id: prismaLedger.id },
        data: {
          payoutStatus: 'PAID',
          paidAt: new Date(),
        },
      });

      // Increment expert's total earnings
      if (prismaLedger.payoutStatus !== 'PAID') {
        await prisma.expertProfile.update({
          where: { id: prismaLedger.expertId },
          data: {
            totalPoints: { increment: Number(prismaLedger.netRoyalty) },
          },
        });
      }

      console.log(`[Webhook] Prisma ledger ${prismaLedger.id} updated to PAID.`);
    }
  } catch (err: any) {
    console.warn('[Webhook] Prisma update skipped (likely DB offline):', err?.message);
  }
}

/**
 * Handle `payout.failed` or `payout.reversed` — the payout did not complete.
 * Updates the ledger entry to FAILED status.
 */
async function handlePayoutFailed(payoutEntity: any, reason: 'FAILED' | 'REVERSED') {
  if (!payoutEntity?.id) {
    console.warn(`[Webhook] ${reason} event received but missing payout ID.`);
    return;
  }

  const razorpayPayoutId: string = payoutEntity.id;
  const referenceId: string = payoutEntity.reference_id || '';
  const failureReason: string = payoutEntity.failure_reason || reason;

  console.log(`[Webhook] Processing payout.${reason.toLowerCase()}: ${razorpayPayoutId}, reason: ${failureReason}`);

  // Update in-memory mock database
  const ledgerEntry = db.royaltyLedger.find(
    (entry) =>
      entry.payoutTransactionId === razorpayPayoutId ||
      entry.id === referenceId
  );

  if (ledgerEntry) {
    ledgerEntry.status = 'FAILED';
    console.log(`[Webhook] Ledger entry ${ledgerEntry.id} marked as FAILED.`);
  }

  // Update Prisma database (if connected)
  try {
    const { prisma } = await import('../../../../lib/prisma');

    const prismaLedger = await prisma.royaltyLedger.findFirst({
      where: { payoutTransactionId: razorpayPayoutId },
    });

    if (prismaLedger) {
      await prisma.royaltyLedger.update({
        where: { id: prismaLedger.id },
        data: {
          payoutStatus: 'FAILED',
          failureReason,
        },
      });
      console.log(`[Webhook] Prisma ledger ${prismaLedger.id} marked as FAILED.`);
    }
  } catch (err: any) {
    console.warn('[Webhook] Prisma update skipped (likely DB offline):', err?.message);
  }
}
