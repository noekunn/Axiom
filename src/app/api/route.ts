import { NextRequest, NextResponse } from 'next/server';
import { db, Expert, TaskSubmission, RoyaltyPayout } from './db';

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

    // Dynamic points calculation based on quality and tier multipliers
    // Simulate high-speed model structure check & premium model reasoning check
    const isReasoningGood = response.trim().length > 100;
    const score = isReasoningGood 
      ? Math.floor(Math.random() * (100 - 90 + 1)) + 90 // 90 to 100
      : Math.floor(Math.random() * (88 - 70 + 1)) + 70; // 70 to 88

    let status: TaskSubmission['status'] = 'PENDING';
    if (score >= 92) {
      status = 'APPROVED';
    } else if (score >= 85) {
      status = 'BORDERLINE';
    } else {
      status = 'HUMAN_REVIEW_REQUIRED';
    }

    // Calculate points: basePoints (10) * diffMultiplier * tierMultiplier * qualityMultiplier
    const basePoints = 10;
    const tierMultipliers = { BRONZE: 1.0, SILVER: 1.2, GOLD: 1.5, SENIOR: 1.7, ELITE: 2.0 };
    const tierMultiplier = tierMultipliers[expert.tier] || 1.0;
    
    let qualityMultiplier = 0.5;
    if (score >= 95) qualityMultiplier = 1.2;
    else if (score >= 90) qualityMultiplier = 1.0;
    else if (score >= 80) qualityMultiplier = 0.8;

    const pointsEarned = parseFloat((basePoints * difficultyMultiplier * tierMultiplier * qualityMultiplier).toFixed(2));

    const llamaVerdict = score >= 90 ? 'APPROVED' : 'BORDERLINE';
    const claudeVerdict = score >= 92 ? 'APPROVED' : (score >= 85 ? 'BORDERLINE' : 'REJECTED');

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
      qualityScore: score,
      pointsEarned: status === 'APPROVED' || status === 'BORDERLINE' ? pointsEarned : 0,
      status,
      timestamp: new Date().toISOString(),
      evaluations: [
        {
          provider: 'Llama 3.3 (Groq)',
          modelName: 'llama-3.3-70b-versatile',
          score: Math.min(100, score + 2),
          verdict: llamaVerdict,
          reasoning: score >= 90 
            ? 'Response adheres to structure, uses appropriate code-mixed Indic vocabulary.' 
            : 'Response is somewhat sparse and could benefit from deeper reasoning steps.'
        },
        {
          provider: 'Claude 3.5 Sonnet',
          modelName: 'claude-3-5-sonnet-20241022',
          score: score,
          verdict: claudeVerdict,
          reasoning: score >= 92 
            ? 'Robust reasoning trace. Clear semantic layout and high local language calibration.' 
            : 'Fails to explore complex logic alternatives. Truncated output.'
        }
      ]
    };

    db.submissions.push(newSubmission);

    if (status === 'APPROVED' || status === 'BORDERLINE') {
      // Add points to expert and pool
      expert.points += pointsEarned;
      pool.totalPoints += pointsEarned;

      // Simulate a small upfront payment payout directly via Razorpay UPI!
      const immediateUpfrontPay = parseFloat((pointsEarned * 120).toFixed(0)); // e.g. ₹120 per point baseline payout
      expert.totalEarnings += immediateUpfrontPay;

      // Add payout logs if approved
      const baselinePayout: RoyaltyPayout = {
        id: `payout_upfront_${Math.random().toString(36).substring(2, 9)}`,
        expertId,
        expertName: expert.name,
        poolId,
        poolTitle: pool.title,
        licenseType: 'SHARED', // base payouts labeled shared
        grossRoyalty: immediateUpfrontPay,
        netRoyalty: parseFloat((immediateUpfrontPay * 0.98).toFixed(2)), // 2% fees
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        payoutTransactionId: `rzp_pay_base_${Math.random().toString(36).substring(2, 10)}`
      };
      db.royaltyLedger.push(baselinePayout);
    }

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
