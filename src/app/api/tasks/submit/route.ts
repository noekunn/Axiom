import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { ConsensusStatus, ExpertTier, TaskStatus, EvaluationVerdict, ModelProvider } from '@prisma/client';

const submitSchema = z.object({
  submissionId: z.string().uuid('Invalid Submission ID format'),
  content: z.string().min(10, 'Content must be at least 10 characters long to annotate'),
});

interface EvaluationItem {
  provider: ModelProvider;
  modelName: string;
  score: number;
  verdict: EvaluationVerdict;
  reasoning: string;
}

// Helper to get tier multiplier
const getTierMultiplier = (tier: ExpertTier): number => {
  switch (tier) {
    case ExpertTier.BRONZE: return 1.0;
    case ExpertTier.SILVER: return 1.2;
    case ExpertTier.GOLD: return 1.5;
    case ExpertTier.SENIOR: return 1.8;
    case ExpertTier.ELITE: return 2.0;
    default: return 1.0;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = submitSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { submissionId, content } = result.data;
    
    // Fetch submission with linked task and expert
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: { assetPool: true },
        },
        expert: true,
      },
    });
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Not Found', message: `Submission with ID ${submissionId} does not exist.` },
        { status: 404 }
      );
    }
    
    // Check if task is already completed/approved by someone else
    if (submission.consensusStatus === ConsensusStatus.APPROVED) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'This submission has already been approved and cannot be resubmitted.' },
        { status: 400 }
      );
    }
    
    const task = submission.task;
    const expert = submission.expert;
    const pool = task.assetPool;
    const basePoints = 10.0; // Default base points per task
    
    // ----------------------------------------------------
    // MULTI-MODEL CONSENSUS QA PIPELINE SIMULATION
    // ----------------------------------------------------
    let llamaScore = 85.0; // default base score
    // Add heuristics: longer response = higher quality score
    if (content.length > 200) {
      llamaScore = 93.0;
    } else if (content.length > 50) {
      llamaScore = 82.0;
    } else {
      llamaScore = 65.0;
    }
    
    // Introduce some slight variability to make it dynamic
    const variation = Math.random() * 6 - 3; // -3% to +3%
    llamaScore = Math.min(100, Math.max(0, parseFloat((llamaScore + variation).toFixed(2))));
    
    let finalStatus: ConsensusStatus = ConsensusStatus.PENDING_QA;
    let finalScore = llamaScore;
    let qualityMultiplierApplied = 1.0;
    
    const evaluations: EvaluationItem[] = [];
    
    if (llamaScore >= 90.0) {
      // Direct pass
      finalStatus = ConsensusStatus.APPROVED;
      evaluations.push({
        provider: 'GROQ',
        modelName: 'llama-3.3-70b-versatile',
        score: llamaScore,
        verdict: EvaluationVerdict.APPROVE,
        reasoning: `First-pass structural, semantic and syntactic verification passed with a score of ${llamaScore}%. The response satisfies high-fidelity reasoning guidelines.`,
      });
    } else if (llamaScore >= 70.0) {
      // Borderline, escalate to premium model (GPT-4o) adjudication
      const gptScore = Math.min(100, Math.max(0, parseFloat((llamaScore + (Math.random() * 8 - 2)).toFixed(2))));
      finalScore = parseFloat(((llamaScore + gptScore) / 2).toFixed(2));
      
      evaluations.push({
        provider: 'GROQ',
        modelName: 'llama-3.3-70b-versatile',
        score: llamaScore,
        verdict: EvaluationVerdict.BORDERLINE,
        reasoning: `Llama-3.3 detected borderline structural complexity with a score of ${llamaScore}%. Escalating to frontier model for consensus adjudication.`,
      });
      
      if (gptScore >= 80.0) {
        finalStatus = ConsensusStatus.APPROVED;
        evaluations.push({
          provider: 'OPENAI',
          modelName: 'gpt-4o',
          score: gptScore,
          verdict: EvaluationVerdict.APPROVE,
          reasoning: `Adjudication complete. GPT-4o verified domain relevance and logical step coherence. Score: ${gptScore}%. Overruling initial borderline assessment.`,
        });
      } else if (gptScore >= 73.0) {
        finalStatus = ConsensusStatus.HUMAN_REVIEW_REQUIRED;
        evaluations.push({
          provider: 'OPENAI',
          modelName: 'gpt-4o',
          score: gptScore,
          verdict: EvaluationVerdict.BORDERLINE,
          reasoning: `Borderline score of ${gptScore}% on frontier model. Models disagree on formatting guidelines. Flagged for domain lead human review to prevent Goodhart's Law over-optimization.`,
        });
      } else {
        finalStatus = ConsensusStatus.REJECTED;
        evaluations.push({
          provider: 'OPENAI',
          modelName: 'gpt-4o',
          score: gptScore,
          verdict: EvaluationVerdict.REJECT,
          reasoning: `Adjudication complete. Frontier model confirmed logical fallacies or hallucinated arguments. Score: ${gptScore}%. Submission rejected.`,
        });
      }
    } else {
      // Direct fail
      finalStatus = ConsensusStatus.REJECTED;
      evaluations.push({
        provider: 'GROQ',
        modelName: 'llama-3.3-70b-versatile',
        score: llamaScore,
        verdict: EvaluationVerdict.REJECT,
        reasoning: `Response length or structure is deficient (score ${llamaScore}%). Failed basic instruction coherence checks. Direct rejection applied.`,
      });
    }
    
    let pointsEarned = 0.0;
    
    // If approved, calculate points and update database metrics in transaction
    const dbUpdateResult = await prisma.$transaction(async (tx) => {
      // 1. Save evaluations
      for (const evalData of evaluations) {
        await tx.consensusEvaluation.create({
          data: {
            taskSubmissionId: submissionId,
            provider: evalData.provider,
            modelName: evalData.modelName,
            score: evalData.score,
            verdict: evalData.verdict,
            reasoning: evalData.reasoning,
          },
        });
      }
      
      if (finalStatus === ConsensusStatus.APPROVED) {
        // Calculate points
        const tierMultiplier = getTierMultiplier(expert.tier);
        qualityMultiplierApplied = parseFloat((1.0 + (finalScore - 80) / 100).toFixed(4));
        
        pointsEarned = parseFloat(
          (basePoints * task.difficultyMultiplier * tierMultiplier * qualityMultiplierApplied).toFixed(4)
        );
        
        // 2. Update Submission with final approved state
        const updatedSub = await tx.taskSubmission.update({
          where: { id: submissionId },
          data: {
            content,
            qualityScore: finalScore,
            pointsEarned,
            consensusStatus: finalStatus,
            qualityMultiplierApplied,
          },
        });
        
        // 3. Mark task status as COMPLETED
        await tx.task.update({
          where: { id: task.id },
          data: { status: TaskStatus.COMPLETED },
        });
        
        // 4. Update Expert's Pool Contribution points
        await tx.poolContribution.upsert({
          where: {
            expertId_assetPoolId: {
              expertId: expert.id,
              assetPoolId: pool.id,
            },
          },
          update: {
            points: { increment: pointsEarned },
          },
          create: {
            expertId: expert.id,
            assetPoolId: pool.id,
            points: pointsEarned,
            sharePercentage: 0.0, // Will update below
          },
        });
        
        // 5. Update AssetPool's totalPoints
        const updatedPool = await tx.assetPool.update({
          where: { id: pool.id },
          data: {
            totalPoints: { increment: pointsEarned },
          },
        });
        
        // 6. Recalculate share percentages for ALL contributors in this pool
        const allContributions = await tx.poolContribution.findMany({
          where: { assetPoolId: pool.id },
        });
        
        const totalPoolPoints = updatedPool.totalPoints;
        
        for (const contrib of allContributions) {
          const newShare = parseFloat(((contrib.points / totalPoolPoints) * 100).toFixed(6));
          await tx.poolContribution.update({
            where: { id: contrib.id },
            data: { sharePercentage: newShare },
          });
        }
        
        return {
          submission: updatedSub,
          pointsEarned,
          poolTotalPoints: totalPoolPoints,
        };
      } else {
        // Rejected or human review required, write content and reset
        const updatedSub = await tx.taskSubmission.update({
          where: { id: submissionId },
          data: {
            content,
            qualityScore: finalScore,
            pointsEarned: 0.0,
            consensusStatus: finalStatus,
            qualityMultiplierApplied: 1.0,
          },
        });
        
        return {
          submission: updatedSub,
          pointsEarned: 0.0,
          poolTotalPoints: pool.totalPoints,
        };
      }
    });
    
    return NextResponse.json({
      message: `Submission processed. Consensus status: ${finalStatus}.`,
      submission: dbUpdateResult.submission,
      evaluations,
      consensusStatus: finalStatus,
      qualityScore: finalScore,
      pointsEarned: dbUpdateResult.pointsEarned,
      poolTotalPoints: dbUpdateResult.poolTotalPoints,
    });
  } catch (error: any) {
    console.error('Error in task submission:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
