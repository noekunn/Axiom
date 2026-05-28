import { NextRequest, NextResponse } from 'next/server';
import { db, Expert, TaskSubmission, RoyaltyPayout } from './db';
import { evaluateWithGroqScore, evaluateWithOpenAIStructured } from '../../lib/llm';
import { executeFullPayoutFlow } from '../../lib/razorpay';

// Route handler for handling unified simulated actions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'pools') {
    // Only return ACTIVE and COMPLETED pools to the marketplace, excluding ARCHIVED (exclusive buyout)
    const activePools = db.pools.filter(p => p.status !== 'ARCHIVED');
    return NextResponse.json({ success: true, pools: activePools });
  }

  if (action === 'expert') {
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const expert = db.experts.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (!expert) {
      return NextResponse.json({ success: false, error: 'Expert not found' }, { status: 404 });
    }

    const submissions = db.submissions.filter(s => s.expertId === expert.id);
    const payouts = db.royaltyLedger.filter(p => p.expertId === expert.id);

    return NextResponse.json({
      success: true,
      expert,
      submissions,
      payouts
    });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  const body = await req.json().catch(() => ({}));

  if (action === 'signup') {
    const { name, email, upiId, tier } = body;
    if (!name || !email || !upiId || !tier) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    // Check if expert already exists
    const expert = db.experts.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (expert) {
      // Log in existing
      return NextResponse.json({ success: true, message: 'LoggedIn successfully', expert });
    }

    // Create new expert
    const newExpert: Expert = {
      id: `exp_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      tier,
      upiId,
      points: 0,
      totalEarnings: 0,
      razorpayStatus: 'CONNECTED'
    };

    db.experts.push(newExpert);

    return NextResponse.json({ success: true, message: 'Signup successful', expert: newExpert });
  }

  if (action === 'submit') {
    const { expertId, poolId, prompt, response, difficultyMultiplier } = body;
    if (!expertId || !poolId || !prompt || !response || !difficultyMultiplier) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const expert = db.experts.find(e => e.id === expertId);
    const pool = db.pools.find(p => p.id === poolId);

    if (!expert || !pool) {
      return NextResponse.json({ success: false, error: 'Expert or Pool not found' }, { status: 404 });
    }

    // Execute Groq and OpenAI evaluations concurrently
    console.log(`[API Submit] Running consensus evaluations for prompt: "${prompt.substring(0, 50)}..."`);
    const [groqScore, openaiResult] = await Promise.all([
      evaluateWithGroqScore(response, pool.description || undefined),
      evaluateWithOpenAIStructured(response, pool.description || undefined)
    ]);

    console.log(`[API Submit] Groq Score Result: ${groqScore}`);
    console.log(`[API Submit] OpenAI Result: Score=${openaiResult.score}, Reasoning="${openaiResult.reasoning_text}"`);

    // Status is strictly updated to APPROVED as requested
    const status: TaskSubmission['status'] = 'APPROVED';

    // Calculate quality score scaled to 100
    const avgScoreDecimal = (groqScore + openaiResult.score) / 2;
    const finalQualityScore = Math.round(avgScoreDecimal * 100);

    // Calculate points: basePoints (10) * diffMultiplier * tierMultiplier * qualityMultiplier
    const basePoints = 10;
    const tierMultipliers = { BRONZE: 1.0, SILVER: 1.2, GOLD: 1.5, SENIOR: 1.7, ELITE: 2.0 };
    const tierMultiplier = tierMultipliers[expert.tier] || 1.0;
    
    let qualityMultiplier = avgScoreDecimal >= 0.9 ? 1.2 : (avgScoreDecimal >= 0.8 ? 1.0 : 0.8);
    const pointsEarned = parseFloat((basePoints * difficultyMultiplier * tierMultiplier * qualityMultiplier).toFixed(2));

    const newSubmission: TaskSubmission = {
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      expertId,
      expertName: expert.name,
      expertTier: expert.tier,
      poolId,
      poolTitle: pool.title,
      prompt,
      response,
      difficultyMultiplier,
      qualityScore: finalQualityScore,
      pointsEarned,
      status,
      timestamp: new Date().toISOString(),
      evaluations: [
        {
          provider: 'Groq (Llama 3.3)',
          modelName: 'llama-3.3-70b-versatile',
          score: Math.round(groqScore * 100), // scaled score
          verdict: groqScore >= 0.8 ? 'APPROVED' : 'BORDERLINE',
          reasoning: `Groq Llama 3.3 score output: ${groqScore.toFixed(2)}`
        },
        {
          provider: 'OpenAI (GPT-4o)',
          modelName: 'gpt-4o',
          score: Math.round(openaiResult.score * 100),
          verdict: openaiResult.score >= 0.8 ? 'APPROVED' : 'BORDERLINE',
          reasoning: openaiResult.reasoning_text
        }
      ]
    };

    db.submissions.push(newSubmission);

    // Add points to expert and pool
    expert.points += pointsEarned;
    pool.totalPoints += pointsEarned;

    // Simulate immediate UPI payout
    const immediateUpfrontPay = parseFloat((pointsEarned * 120).toFixed(0)); // e.g. ₹120 per point
    expert.totalEarnings += immediateUpfrontPay;

    // Add payout logs
    const baselinePayout: RoyaltyPayout = {
      id: `payout_upfront_${Math.random().toString(36).substring(2, 9)}`,
      expertId,
      expertName: expert.name,
      poolId,
      poolTitle: pool.title,
      licenseType: 'SHARED',
      grossRoyalty: immediateUpfrontPay,
      netRoyalty: parseFloat((immediateUpfrontPay * 0.98).toFixed(2)), // 2% fee
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      payoutTransactionId: `rzp_pay_base_${Math.random().toString(36).substring(2, 10)}`
    };
    db.royaltyLedger.push(baselinePayout);

    // Calculate 5% passive royalty stake from pool base price
    const poolBasePriceINR = pool.basePrice * 83; // Convert USD to INR (~₹83/USD)
    const royaltyPoolINR = poolBasePriceINR * 0.05; // 5% of pool base price
    const expertSharePercentage = pool.totalPoints > 0 ? (expert.points / pool.totalPoints) : 1;
    const passiveRoyaltyGross = parseFloat((royaltyPoolINR * expertSharePercentage).toFixed(2));
    const passiveRoyaltyNet = parseFloat((passiveRoyaltyGross * 0.98).toFixed(2)); // 2% gateway fee

    // Create passive royalty ledger entry as PENDING (awaiting Razorpay webhook)
    const passiveRoyaltyId = `payout_royalty_${Math.random().toString(36).substring(2, 9)}`;

    // Initiate real Razorpay X payout (or simulate if credentials are placeholder)
    let razorpayPayoutId = `rzp_pending_${Math.random().toString(36).substring(2, 10)}`;
    try {
      const payoutResult = await executeFullPayoutFlow(
        { id: expert.id, name: expert.name, email: expert.email, upiId: expert.upiId },
        passiveRoyaltyNet,
        passiveRoyaltyId
      );
      razorpayPayoutId = payoutResult.payoutId;
      console.log(`[API Submit] Razorpay payout initiated: ${razorpayPayoutId} (status: ${payoutResult.status})`);
    } catch (err: any) {
      console.error(`[API Submit] Razorpay payout initiation failed:`, err?.message || err);
    }

    const passiveRoyaltyPayout: RoyaltyPayout = {
      id: passiveRoyaltyId,
      expertId,
      expertName: expert.name,
      poolId,
      poolTitle: pool.title,
      licenseType: 'SHARED',
      grossRoyalty: passiveRoyaltyGross,
      netRoyalty: passiveRoyaltyNet,
      timestamp: new Date().toISOString(),
      status: 'PENDING', // Will be updated to SUCCESS via Razorpay webhook
      payoutTransactionId: razorpayPayoutId
    };
    db.royaltyLedger.push(passiveRoyaltyPayout);

    return NextResponse.json({ success: true, submission: newSubmission });
  }

  if (action === 'buy') {
    const { poolId, licenseType, buyerEmail } = body;
    if (!poolId || !licenseType || !buyerEmail) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const pool = db.pools.find(p => p.id === poolId);
    if (!pool) {
      return NextResponse.json({ success: false, error: 'Pool not found' }, { status: 404 });
    }

    // Premium buyout check
    if (licenseType === 'EXCLUSIVE') {
      pool.status = 'ARCHIVED'; // archive and remove from marketplace
    }

    pool.licenseCount += 1;

    // Distribute 5% perpetual royalty pool in INR
    const priceUSD = licenseType === 'EXCLUSIVE' ? pool.exclusivePrice : pool.basePrice;
    const royaltyPoolUSD = priceUSD * 0.05;
    const royaltyPoolINR = royaltyPoolUSD * 83; // Converted roughly to INR

    // Get all experts who contributed to this pool
    // To make it functional, find experts who have submissions in this pool
    const contributors = db.experts.filter(e => {
      return db.submissions.some(s => s.expertId === e.id && s.poolId === pool.id && (s.status === 'APPROVED' || s.status === 'BORDERLINE'));
    });

    // If no one has contributed to this pool yet, allocate to seeded experts who have points!
    const activeContributors = contributors.length > 0 ? contributors : db.experts;

    // Calculate total points of all contributors for this pool in DB
    const totalPointsForPool = pool.totalPoints || 100;

    const distributedPayouts: RoyaltyPayout[] = [];

    // Distribute pro-rata
    activeContributors.forEach(expert => {
      // Expert points inside this pool (simulated pro-rata: use expert's share of total pool points)
      // Since it's mock, we give Dr. Ananya 50%, Rahul 30%, Priya 20% if multiple, or compute based on their relative points
      const expertSharePercentage = expert.points / totalPointsForPool;
      const share = expertSharePercentage > 0 ? expertSharePercentage : (1 / activeContributors.length);

      const grossRoyalty = parseFloat((royaltyPoolINR * share).toFixed(2));
      const netRoyalty = parseFloat((grossRoyalty * 0.98).toFixed(2)); // minus 2% network and gateway processing fee

      expert.totalEarnings += grossRoyalty;

      const payoutRecord: RoyaltyPayout = {
        id: `payout_royalty_${Math.random().toString(36).substring(2, 9)}`,
        expertId: expert.id,
        expertName: expert.name,
        poolId: pool.id,
        poolTitle: pool.title,
        licenseType,
        grossRoyalty,
        netRoyalty,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        payoutTransactionId: `rzp_royalty_${Math.random().toString(36).substring(2, 10)}`
      };

      db.royaltyLedger.push(payoutRecord);
      distributedPayouts.push(payoutRecord);
    });

    return NextResponse.json({
      success: true,
      message: `Licensed successfully under ${licenseType} model! ₹${royaltyPoolINR.toLocaleString()} distributed.`,
      pool,
      payouts: distributedPayouts
    });
  }

  if (action === 'finetune') {
    const { poolId } = body;
    if (!poolId) {
      return NextResponse.json({ success: false, error: 'Pool ID is required' }, { status: 400 });
    }

    const pool = db.pools.find(p => p.id === poolId);
    if (!pool) {
      return NextResponse.json({ success: false, error: 'Pool not found' }, { status: 404 });
    }

    // Simulate OpenAI Fine-tuning triggered
    return NextResponse.json({
      success: true,
      message: `OpenAI Supervised Fine-Tuning triggered for gpt-4o using licensed dataset ${pool.title}!`,
      jobId: `ftjob-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      status: 'validating_dataset'
    });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
