import Razorpay from 'razorpay';
import crypto from 'crypto';

// ==========================================
// Razorpay X (Business Banking) Client
// ==========================================
// Used for creating Contacts, Fund Accounts, and initiating UPI Payouts.
// Docs: https://razorpay.com/docs/razorpay-x/api/

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

/**
 * Check if Razorpay credentials are real (not placeholder).
 * When false, payout calls will be skipped and logged as warnings.
 */
export function isRazorpayConfigured(): boolean {
  return (
    !!razorpayKeyId &&
    !razorpayKeyId.includes('placeholder') &&
    !!razorpayKeySecret &&
    !razorpayKeySecret.includes('placeholder')
  );
}

/**
 * Lazily initialize the Razorpay client only when credentials are valid.
 */
let _razorpayInstance: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (!_razorpayInstance) {
    if (!isRazorpayConfigured()) {
      throw new Error('[Razorpay] Cannot initialize client — credentials are placeholder.');
    }
    _razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  }
  return _razorpayInstance;
}

// ==========================================
// Contact Management (Razorpay X)
// ==========================================

export interface RazorpayContact {
  id: string;
  entity: string;
  name: string;
  email: string;
  type: string;
}

/**
 * Create a Razorpay Contact from an expert profile.
 * Contacts are required before creating Fund Accounts.
 *
 * @see https://razorpay.com/docs/razorpay-x/api/contacts/
 */
export async function createContact(expert: {
  name: string;
  email: string;
  id: string;
}): Promise<RazorpayContact> {
  const client = getRazorpayClient();
  
  console.log(`[Razorpay] Creating contact for: ${expert.name} (${expert.email})`);
  
  const contact = await (client as any).contacts.create({
    name: expert.name,
    email: expert.email,
    type: 'employee',
    reference_id: expert.id,
    notes: {
      platform: 'axiom',
      expert_id: expert.id,
    },
  });

  console.log(`[Razorpay] Contact created: ${contact.id}`);
  return contact as RazorpayContact;
}

// ==========================================
// Fund Account Management (Razorpay X)
// ==========================================

export interface RazorpayFundAccount {
  id: string;
  entity: string;
  contact_id: string;
  account_type: string;
}

/**
 * Create a UPI VPA Fund Account linked to a Razorpay Contact.
 *
 * @see https://razorpay.com/docs/razorpay-x/api/fund-accounts/
 */
export async function createFundAccount(
  contactId: string,
  upiVpa: string
): Promise<RazorpayFundAccount> {
  const client = getRazorpayClient();
  
  console.log(`[Razorpay] Creating UPI Fund Account: ${upiVpa} for contact ${contactId}`);

  const fundAccount = await (client as any).fundAccount.create({
    contact_id: contactId,
    account_type: 'vpa',
    vpa: {
      address: upiVpa,
    },
  });

  console.log(`[Razorpay] Fund Account created: ${fundAccount.id}`);
  return fundAccount as RazorpayFundAccount;
}

// ==========================================
// Payout Initiation (Razorpay X)
// ==========================================

export interface RazorpayPayout {
  id: string;
  entity: string;
  fund_account_id: string;
  amount: number;
  currency: string;
  status: string;
  reference_id: string;
}

/**
 * Initiate a UPI payout via Razorpay X.
 * Amount is in paisa (₹1 = 100 paisa).
 *
 * @param fundAccountId - Razorpay Fund Account ID
 * @param amountINR - Amount in INR (will be converted to paisa internally)
 * @param referenceId - Internal reference ID for tracking (e.g., payout ledger ID)
 * @param narration - Short description visible in UPI transaction
 *
 * @see https://razorpay.com/docs/razorpay-x/api/payouts/
 */
export async function initiatePayout(
  fundAccountId: string,
  amountINR: number,
  referenceId: string,
  narration: string = 'Axiom Royalty Payout'
): Promise<RazorpayPayout> {
  const client = getRazorpayClient();
  const amountPaisa = Math.round(amountINR * 100);

  console.log(`[Razorpay] Initiating payout: ₹${amountINR} (${amountPaisa} paisa) to fund account ${fundAccountId}`);

  const payout = await (client as any).payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || '',
    fund_account_id: fundAccountId,
    amount: amountPaisa,
    currency: 'INR',
    mode: 'UPI',
    purpose: 'payout',
    queue_if_low_balance: true,
    reference_id: referenceId,
    narration,
    notes: {
      platform: 'axiom',
      reference_id: referenceId,
    },
  });

  console.log(`[Razorpay] Payout initiated: ${payout.id} — status: ${payout.status}`);
  return payout as RazorpayPayout;
}

// ==========================================
// Webhook Signature Verification
// ==========================================

/**
 * Verify the Razorpay webhook signature using HMAC-SHA256.
 * Uses `crypto.timingSafeEqual` to prevent timing attacks.
 *
 * @param rawBody - The raw request body as a string (NOT parsed JSON)
 * @param signature - The `x-razorpay-signature` header value
 * @param secret - The webhook secret from Razorpay dashboard (defaults to env var)
 * @returns true if signature is valid
 *
 * @see https://razorpay.com/docs/webhooks/validate-test/
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string = razorpayWebhookSecret
): boolean {
  if (!secret || secret.includes('placeholder')) {
    console.warn('[Razorpay Webhook] Webhook secret is placeholder — skipping verification in dev mode.');
    return true; // Allow in dev mode with placeholder secrets
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    console.error('[Razorpay Webhook] Signature length mismatch — rejecting.');
    return false;
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    console.error('[Razorpay Webhook] HMAC signature mismatch — rejecting webhook.');
  }

  return isValid;
}

// ==========================================
// Orchestrator: Full Payout Flow
// ==========================================

/**
 * End-to-end helper that creates a Contact + Fund Account + Payout.
 * Falls back gracefully when Razorpay credentials are placeholder.
 *
 * @returns The Razorpay payout ID if successful, or a generated mock ID if in dev mode.
 */
export async function executeFullPayoutFlow(
  expert: { id: string; name: string; email: string; upiId: string },
  amountINR: number,
  referenceId: string
): Promise<{ payoutId: string; status: 'PROCESSING' | 'PENDING' | 'queued' }> {
  if (!isRazorpayConfigured()) {
    console.warn(`[Razorpay] Credentials are placeholder — running in DEV mode. Payout for ₹${amountINR} to ${expert.upiId} will be simulated.`);
    return {
      payoutId: `rzp_dev_${Math.random().toString(36).substring(2, 14)}`,
      status: 'PROCESSING',
    };
  }

  try {
    // Step 1: Create Contact
    const contact = await createContact(expert);

    // Step 2: Create Fund Account (UPI VPA)
    const fundAccount = await createFundAccount(contact.id, expert.upiId);

    // Step 3: Initiate Payout
    const payout = await initiatePayout(
      fundAccount.id,
      amountINR,
      referenceId,
      `Axiom 5% Royalty — ${referenceId}`
    );

    return {
      payoutId: payout.id,
      status: payout.status === 'queued' ? 'queued' : 'PROCESSING',
    };
  } catch (error: any) {
    console.error('[Razorpay] Full payout flow failed:', error?.message || error);
    return {
      payoutId: `rzp_err_${Math.random().toString(36).substring(2, 14)}`,
      status: 'PENDING',
    };
  }
}
