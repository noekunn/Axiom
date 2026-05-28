import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface CalibrationSettings {
  agreementMargin: number;
  autoApprovalThreshold: number;
  humanEscalationMargin: number;
  retryLimit: number;
  strategy: 'strict' | 'highest_confidence' | 'groq_primary' | 'openai_primary';
  strictAlignment: boolean;
  logDiscrepancies: boolean;
  queues: Record<string, 'active' | 'paused'>;
}

// Memory fallback to survive runtime execution if fs write fails
let inMemorySettings: CalibrationSettings = {
  agreementMargin: 85,
  autoApprovalThreshold: 90,
  humanEscalationMargin: 70,
  retryLimit: 3,
  strategy: 'strict',
  strictAlignment: true,
  logDiscrepancies: false,
  queues: {
    'consensus-qa': 'active',
    'royalty-payouts': 'active',
    'webhook-ingestion': 'active'
  }
};

const getConfigPath = () => {
  return path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'calibration.json');
};

async function readSettings(): Promise<CalibrationSettings> {
  try {
    const configPath = getConfigPath();
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data) as CalibrationSettings;
  } catch {
    // If file doesn't exist or is invalid, use and write default settings
    await writeSettings(inMemorySettings);
    return inMemorySettings;
  }
}

async function writeSettings(settings: CalibrationSettings) {
  try {
    const configPath = getConfigPath();
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(settings, null, 2), 'utf8');
    inMemorySettings = settings;
  } catch (error) {
    console.error('Failed to write calibration settings to fs, falling back to memory:', error);
    inMemorySettings = settings;
  }
}

// Simulated High-Fidelity Transaction Data
const mockRoyaltyPayouts = [
  {
    id: 'RL-90281-STR',
    recipientName: 'Jane Miller',
    recipientEmail: 'jane.m@indiebeat.com',
    amount: 4250.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Paid',
    timestamp: '2026-05-27T23:58:12Z',
    payoutRef: 'po_str_1O2xF8LkdG9z0p'
  },
  {
    id: 'RL-90280-RAZ',
    recipientName: 'Aarav Sharma',
    recipientEmail: 'aarav@bollyhits.in',
    amount: 145000.00,
    currency: 'INR',
    gateway: 'Razorpay',
    status: 'Paid',
    timestamp: '2026-05-27T23:45:00Z',
    payoutRef: 'pout_raz_M1x78D9a2b'
  },
  {
    id: 'RL-90279-STR',
    recipientName: 'Lucas Dubois',
    recipientEmail: 'lucas@dubois-sync.fr',
    amount: 1200.00,
    currency: 'EUR',
    gateway: 'Stripe',
    status: 'Paid',
    timestamp: '2026-05-27T23:22:15Z',
    payoutRef: 'po_str_9v8d1xLkaP10a'
  },
  {
    id: 'RL-90278-STR',
    recipientName: 'BeatLab Inc.',
    recipientEmail: 'payouts@beatlab.co',
    amount: 9400.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Processing',
    timestamp: '2026-05-27T23:10:00Z',
    payoutRef: 'po_str_2b881aLkdG90xx'
  },
  {
    id: 'RL-90277-RAZ',
    recipientName: 'Priyanka Nair',
    recipientEmail: 'priya@raagsound.com',
    amount: 82500.00,
    currency: 'INR',
    gateway: 'Razorpay',
    status: 'Paid',
    timestamp: '2026-05-27T22:50:18Z',
    payoutRef: 'pout_raz_L8912zPqrS'
  },
  {
    id: 'RL-90276-STR',
    recipientName: 'David K.',
    recipientEmail: 'dave@davesound.net',
    amount: 350.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Failed',
    timestamp: '2026-05-27T22:42:01Z',
    payoutRef: 'po_str_fail_89a01x',
    failureReason: 'Gateway routing timeout; destination card expired.'
  },
  {
    id: 'RL-90275-STR',
    recipientName: 'Warner Publishing',
    recipientEmail: 'admin@warner-sub.com',
    amount: 18200.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Paid',
    timestamp: '2026-05-27T21:30:00Z',
    payoutRef: 'po_str_7a718cLkdM42x'
  },
  {
    id: 'RL-90274-RAZ',
    recipientName: 'Soundscape India',
    recipientEmail: 'finance@soundscape.in',
    amount: 340000.00,
    currency: 'INR',
    gateway: 'Razorpay',
    status: 'Processing',
    timestamp: '2026-05-27T21:12:00Z',
    payoutRef: 'pout_raz_T901aM2bcx'
  },
  {
    id: 'RL-90273-STR',
    recipientName: 'Oliver Smith',
    recipientEmail: 'oliver@smithloops.co.uk',
    amount: 290.00,
    currency: 'USD',
    gateway: 'Stripe',
    status: 'Paid',
    timestamp: '2026-05-27T20:55:40Z',
    payoutRef: 'po_str_5h882xLkqR09z'
  },
  {
    id: 'RL-90272-STR',
    recipientName: 'Clara Oswald',
    recipientEmail: 'clara@claramusic.de',
    amount: 1450.00,
    currency: 'EUR',
    gateway: 'Stripe',
    status: 'Failed',
    timestamp: '2026-05-27T20:18:22Z',
    payoutRef: 'po_str_fail_2b901z',
    failureReason: 'Account restricted; verification pending.'
  }
];

const mockWebhookLogs = [
  {
    id: 'evt_stripe_99a8b7',
    provider: 'Stripe',
    eventType: 'charge.succeeded',
    amount: 4250.00,
    currency: 'USD',
    status: 'SUCCESS',
    processingMs: 45,
    idempotency: 'Verified',
    timestamp: '2026-05-27T23:58:15Z',
    payload: JSON.stringify({
      id: 'evt_stripe_99a8b7',
      object: 'event',
      type: 'charge.succeeded',
      api_version: '2023-10-16',
      created: 1779993492,
      data: {
        object: {
          id: 'ch_3N19zBLkdG9z0p201x',
          amount: 425000,
          currency: 'usd',
          paid: true,
          status: 'succeeded',
          metadata: { ledger_id: 'RL-90281-STR' }
        }
      }
    }, null, 2)
  },
  {
    id: 'evt_razorpay_x7198a',
    provider: 'Razorpay',
    eventType: 'payment.captured',
    amount: 145000.00,
    currency: 'INR',
    status: 'SUCCESS',
    processingMs: 85,
    idempotency: 'Verified',
    timestamp: '2026-05-27T23:45:04Z',
    payload: JSON.stringify({
      entity: 'event',
      account_id: 'acc_7y128xNpq',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_M1x78D9a2b',
            amount: 14500000,
            currency: 'INR',
            status: 'captured',
            notes: { ledger_id: 'RL-90280-RAZ' }
          }
        }
      },
      created_at: 1779992704
    }, null, 2)
  },
  {
    id: 'evt_stripe_102ab8',
    provider: 'Stripe',
    eventType: 'charge.succeeded',
    amount: 1200.00,
    currency: 'EUR',
    status: 'SUCCESS',
    processingMs: 38,
    idempotency: 'Verified',
    timestamp: '2026-05-27T23:22:19Z',
    payload: JSON.stringify({
      id: 'evt_stripe_102ab8',
      type: 'charge.succeeded',
      data: {
        object: {
          id: 'ch_9v8d1xLkaP10a',
          amount: 120000,
          currency: 'eur',
          paid: true,
          status: 'succeeded',
          metadata: { ledger_id: 'RL-90279-STR' }
        }
      }
    }, null, 2)
  },
  {
    id: 'evt_stripe_918cc7',
    provider: 'Stripe',
    eventType: 'payment_intent.created',
    amount: 9400.00,
    currency: 'USD',
    status: 'SUCCESS',
    processingMs: 28,
    idempotency: 'Verified',
    timestamp: '2026-05-27T23:10:02Z',
    payload: JSON.stringify({
      id: 'evt_stripe_918cc7',
      type: 'payment_intent.created',
      data: {
        object: {
          id: 'pi_2b881aLkdG90xx',
          amount: 940000,
          currency: 'usd',
          status: 'processing'
        }
      }
    }, null, 2)
  },
  {
    id: 'evt_razorpay_w8912z',
    provider: 'Razorpay',
    eventType: 'payment.captured',
    amount: 82500.00,
    currency: 'INR',
    status: 'SUCCESS',
    processingMs: 94,
    idempotency: 'Verified',
    timestamp: '2026-05-27T22:50:23Z',
    payload: JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_L8912zPqrS',
            amount: 8250000,
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    }, null, 2)
  },
  {
    id: 'evt_stripe_failed_55',
    provider: 'Stripe',
    eventType: 'charge.failed',
    amount: 350.00,
    currency: 'USD',
    status: 'FAILED',
    processingMs: 56,
    idempotency: 'Verified',
    timestamp: '2026-05-27T22:42:04Z',
    error: 'card_declined: The card has expired.',
    payload: JSON.stringify({
      id: 'evt_stripe_failed_55',
      type: 'charge.failed',
      data: {
        object: {
          id: 'ch_failed_89a01x',
          amount: 35000,
          currency: 'usd',
          paid: false,
          outcome: {
            type: 'issuer_declined',
            reason: 'expired_card',
            seller_message: 'The card has expired.'
          }
        }
      }
    }, null, 2)
  },
  {
    id: 'evt_stripe_dup_99',
    provider: 'Stripe',
    eventType: 'charge.succeeded',
    amount: 4250.00,
    currency: 'USD',
    status: 'SUCCESS',
    processingMs: 8,
    idempotency: 'Replayed',
    timestamp: '2026-05-27T23:59:00Z',
    payload: JSON.stringify({
      note: 'Deduplicated event replay from cache.',
      original_event_id: 'evt_stripe_99a8b7',
      idempotency_key: 'idemp_stripe_ch_99a8b7'
    }, null, 2)
  },
  {
    id: 'evt_razorpay_dup_x7',
    provider: 'Razorpay',
    eventType: 'payment.captured',
    amount: 145000.00,
    currency: 'INR',
    status: 'SUCCESS',
    processingMs: 6,
    idempotency: 'Replayed',
    timestamp: '2026-05-27T23:46:12Z',
    payload: JSON.stringify({
      note: 'Deduplicated event replay from cache.',
      original_event_id: 'evt_razorpay_x7198a',
      idempotency_key: 'idemp_razorpay_cap_x7198a'
    }, null, 2)
  }
];

const mockIdempotencyEvents = [
  {
    key: 'idemp_stripe_ch_99a8b7',
    provider: 'Stripe',
    matchType: 'Cache Hit',
    resource: '/api/webhooks/stripe',
    timestamp: '2026-05-27T23:59:00Z'
  },
  {
    key: 'idemp_stripe_ch_99a8b7',
    provider: 'Stripe',
    matchType: 'New Registry Created',
    resource: '/api/webhooks/stripe',
    timestamp: '2026-05-27T23:58:12Z'
  },
  {
    key: 'idemp_razorpay_cap_x7198a',
    provider: 'Razorpay',
    matchType: 'Cache Hit',
    resource: '/api/webhooks/razorpay',
    timestamp: '2026-05-27T23:46:12Z'
  },
  {
    key: 'idemp_razorpay_cap_x7198a',
    provider: 'Razorpay',
    matchType: 'New Registry Created',
    resource: '/api/webhooks/razorpay',
    timestamp: '2026-05-27T23:45:00Z'
  },
  {
    key: 'idemp_stripe_ch_102ab8',
    provider: 'Stripe',
    matchType: 'New Registry Created',
    resource: '/api/webhooks/stripe',
    timestamp: '2026-05-27T23:22:15Z'
  },
  {
    key: 'idemp_stripe_pi_918cc7',
    provider: 'Stripe',
    matchType: 'New Registry Created',
    resource: '/api/webhooks/stripe',
    timestamp: '2026-05-27T23:10:00Z'
  },
  {
    key: 'idemp_razorpay_cap_w8912z',
    provider: 'Razorpay',
    matchType: 'New Registry Created',
    resource: '/api/webhooks/razorpay',
    timestamp: '2026-05-27T22:50:18Z'
  }
];

export async function GET() {
  const settings = await readSettings();

  // BullMQ Latency / Backlog Metrics with dynamic adjustments based on active/paused queues
  const isConsensusActive = settings.queues['consensus-qa'] === 'active';
  const isRoyaltyActive = settings.queues['royalty-payouts'] === 'active';
  const isWebhookActive = settings.queues['webhook-ingestion'] === 'active';

  const mockQueues = [
    {
      name: 'consensus-qa',
      avgLatencyMs: isConsensusActive ? 145 : 0,
      maxLatencyMs: isConsensusActive ? 450 : 0,
      backlog: isConsensusActive ? 12 : 0,
      activeRetries: isConsensusActive ? 2 : 0,
      status: settings.queues['consensus-qa'] || 'active',
      ratePerMin: isConsensusActive ? 128 : 0
    },
    {
      name: 'royalty-payouts',
      avgLatencyMs: isRoyaltyActive ? 850 : 0,
      maxLatencyMs: isRoyaltyActive ? 2400 : 0,
      backlog: isRoyaltyActive ? 0 : 0,
      activeRetries: isRoyaltyActive ? 0 : 0,
      status: settings.queues['royalty-payouts'] || 'active',
      ratePerMin: isRoyaltyActive ? 15 : 0
    },
    {
      name: 'webhook-ingestion',
      avgLatencyMs: isWebhookActive ? 28 : 0,
      maxLatencyMs: isWebhookActive ? 110 : 0,
      backlog: isWebhookActive ? 3 : 0,
      activeRetries: isWebhookActive ? 1 : 0,
      status: settings.queues['webhook-ingestion'] || 'active',
      ratePerMin: isWebhookActive ? 480 : 0
    }
  ];

  // Payout Summary Calculation
  const totalVolumeUSD = 1248500;
  const stripeVolume = 890200;
  const razorpayVolume = 358300;

  const totalPayoutMetrics = {
    totalVolume: totalVolumeUSD,
    paid: 1180000,
    processing: 48500,
    failed: 20000,
    successRate: 98.4,
    gateways: {
      stripe: { volume: stripeVolume, percentage: 71.3 },
      razorpay: { volume: razorpayVolume, percentage: 28.7 }
    }
  };

  return NextResponse.json({
    settings,
    queues: mockQueues,
    payoutMetrics: totalPayoutMetrics,
    webhookLogs: mockWebhookLogs,
    payouts: mockRoyaltyPayouts,
    idempotencyEvents: mockIdempotencyEvents,
    serverTime: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await readSettings();

    // Standard properties update
    if (body.agreementMargin !== undefined) settings.agreementMargin = Number(body.agreementMargin);
    if (body.autoApprovalThreshold !== undefined) settings.autoApprovalThreshold = Number(body.autoApprovalThreshold);
    if (body.humanEscalationMargin !== undefined) settings.humanEscalationMargin = Number(body.humanEscalationMargin);
    if (body.retryLimit !== undefined) settings.retryLimit = Number(body.retryLimit);
    if (body.strategy !== undefined) settings.strategy = body.strategy as CalibrationSettings['strategy'];
    if (body.strictAlignment !== undefined) settings.strictAlignment = Boolean(body.strictAlignment);
    if (body.logDiscrepancies !== undefined) settings.logDiscrepancies = Boolean(body.logDiscrepancies);

    // Save changes
    await writeSettings(settings);

    return NextResponse.json({
      success: true,
      message: 'Consensus QA calibration updated successfully.',
      settings
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid Request payload';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action, queueName } = body;
    const settings = await readSettings();

    if (!queueName || !action) {
      return NextResponse.json({ success: false, error: 'Missing queueName or action' }, { status: 400 });
    }

    if (!settings.queues) {
      settings.queues = {};
    }

    if (action === 'pause') {
      settings.queues[queueName] = 'paused';
    } else if (action === 'resume') {
      settings.queues[queueName] = 'active';
    } else {
      return NextResponse.json({ success: false, error: 'Unknown operational action' }, { status: 400 });
    }

    await writeSettings(settings);

    return NextResponse.json({
      success: true,
      message: `Queue '${queueName}' status updated to '${settings.queues[queueName]}'.`,
      settings
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid PATCH request';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
