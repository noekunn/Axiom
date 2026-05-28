import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { prisma } from '../lib/prisma';
import { evaluateWithOpenAI, evaluateWithGroq, evaluateWithGroqScore, evaluateWithOpenAIStructured } from '../lib/llm';
import { db as mockDb } from '../app/api/db';
import { ConsensusStatus, EvaluationVerdict, ModelProvider } from '@prisma/client';
import { executeFullPayoutFlow } from '../lib/razorpay';

dotenv.config();

// ==========================================
// 1. Redis / BullMQ Connection Configuration
// ==========================================
// Optimize connection settings for cloud Upstash Redis instances:
// - Enable TLS if requested.
// - Must set maxRetriesPerRequest to null for compatibility with BullMQ.
// - Configure robust reconnection settings.
const redisConnectionOptions: any = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
      keepAlive: 30000,
      retryStrategy(times: number) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    })
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USERNAME || 'default',
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      maxRetriesPerRequest: null,
    };

// Shared redis instance for connection sharing.
// Cast to any to resolve version discrepancies in peer typings.
const sharedRedis: any = typeof redisConnectionOptions === 'object' && 'host' in redisConnectionOptions
  ? new Redis({ ...(redisConnectionOptions as any), maxRetriesPerRequest: null })
  : (redisConnectionOptions as any);

// ==========================================
// 2. Queue Declarations
// ==========================================
// Main queue for initial consensus QA routing
export const qaConsensusQueue = new Queue('qa-consensus', {
  connection: sharedRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

// Queue for individual parallel model evaluations
export const modelCheckQueue = new Queue('model-check', {
  connection: sharedRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000, // Longer backoff to handle rate limits gracefully
    },
    removeOnComplete: true,
  },
});

// Queue for dataset compilation and synthesis
export const datasetGenerationQueue = new Queue('dataset-generation', {
  connection: sharedRedis,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 30000,
    },
    removeOnComplete: true,
  },
});

// ==========================================
// 3. Worker Implementations & Consensuses
// ==========================================

/**
 * WORKER 1: QA Consensus Director
 * Initiates the multi-model check by creating database tracks and enqueuing parallel tasks.
 */
export const qaConsensusWorker = new Worker(
  'qa-consensus',
  async (job: Job<{ submissionId: string }>) => {
    const { submissionId } = job.data;
    console.log(`[QA Worker] Starting consensus QA for submission ID: ${submissionId}`);

    try {
      // 1. Fetch from Prisma database
      let submissionPrisma = null;
      try {
        submissionPrisma = await prisma.taskSubmission.findUnique({
          where: { id: submissionId },
          include: { task: { include: { assetPool: true } } },
        });
      } catch (err) {
        console.warn(`[QA Worker] Prisma fetch failed (likely dev DB offline):`, err);
      }

      // 2. Fetch from simulated database
      const submissionMock = mockDb.submissions.find(s => s.id === submissionId);

      if (!submissionPrisma && !submissionMock) {
        throw new Error(`Submission ID ${submissionId} not found in database.`);
      }

      const content = submissionPrisma ? submissionPrisma.content : (submissionMock ? submissionMock.response : "");
      const poolDescription = submissionPrisma ? (submissionPrisma.task.assetPool.description || undefined) : undefined;

      console.log(`[QA Worker] Content to evaluate (first 100 chars): "${content.substring(0, 100)}..."`);

      // 3. Call both APIs concurrently
      console.log(`[QA Worker] Initiating Groq Llama 3.3 and OpenAI GPT-4o API requests...`);
      const [groqScore, openaiResult] = await Promise.all([
        evaluateWithGroqScore(content, poolDescription),
        evaluateWithOpenAIStructured(content, poolDescription)
      ]);

      console.log(`[QA Worker] Groq Score Result: ${groqScore}`);
      console.log(`[QA Worker] OpenAI Score Result: ${openaiResult.score}, Reasoning: "${openaiResult.reasoning_text}"`);

      // Calculate final combined quality score (scaled to 0-100)
      const avgScore = (groqScore + openaiResult.score) / 2;
      const qualityScoreHundred = Math.round(avgScore * 100);

      // 4. Update Prisma Database (if exists)
      if (submissionPrisma) {
        console.log(`[QA Worker] Updating Prisma TaskSubmission status to APPROVED`);
        await prisma.taskSubmission.update({
          where: { id: submissionId },
          data: {
            qualityScore: qualityScoreHundred,
            consensusStatus: ConsensusStatus.APPROVED
          }
        });

        // Add model evaluation logs to Prisma
        await prisma.consensusEvaluation.createMany({
          data: [
            {
              taskSubmissionId: submissionId,
              provider: ModelProvider.GROQ,
              modelName: 'llama-3.3-70b-versatile',
              score: groqScore * 100,
              verdict: groqScore >= 0.8 ? EvaluationVerdict.APPROVE : EvaluationVerdict.BORDERLINE,
              reasoning: `Groq Llama 3.3 score output: ${groqScore}`
            },
            {
              taskSubmissionId: submissionId,
              provider: ModelProvider.OPENAI,
              modelName: 'gpt-4o',
              score: openaiResult.score * 100,
              verdict: openaiResult.score >= 0.8 ? EvaluationVerdict.APPROVE : EvaluationVerdict.BORDERLINE,
              reasoning: openaiResult.reasoning_text
            }
          ]
        });
      }

      // 5. Update Simulated In-Memory Database (crucial for local web app demo)
      if (submissionMock) {
        console.log(`[QA Worker] Updating Simulated DB TaskSubmission status to APPROVED`);
        submissionMock.status = 'APPROVED';
        submissionMock.qualityScore = qualityScoreHundred;
        
        submissionMock.evaluations = [
          {
            provider: 'Groq (Llama 3.3)',
            modelName: 'llama-3.3-70b-versatile',
            score: Math.round(groqScore * 100),
            verdict: groqScore >= 0.8 ? 'APPROVED' : 'BORDERLINE',
            reasoning: `Groq evaluated with score: ${groqScore.toFixed(2)}`
          },
          {
            provider: 'OpenAI (GPT-4o)',
            modelName: 'gpt-4o',
            score: Math.round(openaiResult.score * 100),
            verdict: openaiResult.score >= 0.8 ? 'APPROVED' : 'BORDERLINE',
            reasoning: openaiResult.reasoning_text
          }
        ];

        // Process points and payouts in the mock database
        const expert = mockDb.experts.find(e => e.id === submissionMock.expertId);
        const pool = mockDb.pools.find(p => p.id === submissionMock.poolId);
        
        if (expert && pool) {
          const basePoints = 10;
          const tierMultipliers = { BRONZE: 1.0, SILVER: 1.2, GOLD: 1.5, SENIOR: 1.7, ELITE: 2.0 };
          const tierMultiplier = tierMultipliers[expert.tier] || 1.0;
          const qualityMultiplier = avgScore >= 0.9 ? 1.2 : (avgScore >= 0.8 ? 1.0 : 0.8);
          const pointsEarned = parseFloat((basePoints * submissionMock.difficultyMultiplier * tierMultiplier * qualityMultiplier).toFixed(2));

          submissionMock.pointsEarned = pointsEarned;
          expert.points += pointsEarned;
          pool.totalPoints += pointsEarned;

          const immediateUpfrontPay = parseFloat((pointsEarned * 120).toFixed(0));
          expert.totalEarnings += immediateUpfrontPay;

          mockDb.royaltyLedger.push({
            id: `payout_upfront_${Math.random().toString(36).substring(2, 9)}`,
            expertId: expert.id,
            expertName: expert.name,
            poolId: pool.id,
            poolTitle: pool.title,
            licenseType: 'SHARED',
            grossRoyalty: immediateUpfrontPay,
            netRoyalty: parseFloat((immediateUpfrontPay * 0.98).toFixed(2)),
            timestamp: new Date().toISOString(),
            status: 'SUCCESS',
            payoutTransactionId: `rzp_pay_base_${Math.random().toString(36).substring(2, 10)}`
          });

          // 5% passive royalty stake entry (awaiting Razorpay webhook)
          const poolBasePriceINR = pool.basePrice * 83;
          const royaltyPoolINR = poolBasePriceINR * 0.05;
          const expertSharePct = pool.totalPoints > 0 ? (expert.points / pool.totalPoints) : 1;
          const passiveGross = parseFloat((royaltyPoolINR * expertSharePct).toFixed(2));
          const passiveNet = parseFloat((passiveGross * 0.98).toFixed(2));
          const passiveId = `payout_royalty_${Math.random().toString(36).substring(2, 9)}`;

          let rzpPayoutId = `rzp_pending_${Math.random().toString(36).substring(2, 10)}`;
          try {
            const payoutResult = await executeFullPayoutFlow(
              { id: expert.id, name: expert.name, email: expert.email || '', upiId: expert.upiId },
              passiveNet,
              passiveId
            );
            rzpPayoutId = payoutResult.payoutId;
            console.log(`[QA Worker] Razorpay payout initiated: ${rzpPayoutId}`);
          } catch (rzpErr: any) {
            console.error(`[QA Worker] Razorpay payout failed:`, rzpErr?.message || rzpErr);
          }

          mockDb.royaltyLedger.push({
            id: passiveId,
            expertId: expert.id,
            expertName: expert.name,
            poolId: pool.id,
            poolTitle: pool.title,
            licenseType: 'SHARED',
            grossRoyalty: passiveGross,
            netRoyalty: passiveNet,
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            payoutTransactionId: rzpPayoutId
          });
        }
      }

      console.log(`[QA Worker] Consensus QA pipeline completed successfully for ID ${submissionId}`);

    } catch (err: any) {
      console.error(`[QA Worker Critical Failure] Consensus QA process encountered an error:`, err);
      throw err;
    }
  },
  { connection: sharedRedis, concurrency: 5 }
);


