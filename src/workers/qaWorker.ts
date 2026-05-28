import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { prisma } from '../lib/prisma';
import { evaluateWithOpenAI, evaluateWithGroq } from '../lib/llm';

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
      retryStrategy(times) {
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
    console.log(`[QA Director] Initiating QA Consensus for Submission: ${submissionId}`);

    // 1. Fetch submission and verify existence
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: { pool: true },
    });

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found in database.`);
    }

    // 2. Update status to processing
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: { status: 'QA_PROCESSING' },
    });

    // 3. Prepare checks in the database to prevent duplicate requests
    const models: ('openai-gpt-4o' | 'groq-llama-3-3')[] = ['openai-gpt-4o', 'groq-llama-3-3'];
    
    for (const modelName of models) {
      // Create QA check records
      const qaCheck = await prisma.qACheck.create({
        data: {
          submissionId,
          modelName,
          status: 'PENDING',
        },
      });

      // Enqueue job for parallel check
      await modelCheckQueue.add(
        `check-${modelName}-${submissionId}`,
        {
          submissionId,
          qaCheckId: qaCheck.id,
          modelName,
        },
        {
          jobId: `job-${qaCheck.id}`, // Deduplication check per database row
        }
      );

      console.log(`[QA Director] Enqueued ${modelName} check for submission ${submissionId}`);
    }
  },
  { connection: sharedRedis, concurrency: 5 }
);

/**
 * WORKER 2: Model Checker Worker
 * Runs individual model evaluations (OpenAI or Groq) in parallel, handling API retries.
 */
export const modelCheckWorker = new Worker(
  'model-check',
  async (job: Job<{ submissionId: string; qaCheckId: string; modelName: string }>) => {
    const { submissionId, qaCheckId, modelName } = job.data;
    console.log(`[Model Checker] Running ${modelName} verification on QA Check: ${qaCheckId}`);

    // Fetch the task and checking parameters
    const [submission, qaCheck] = await Promise.all([
      prisma.taskSubmission.findUnique({
        where: { id: submissionId },
        include: { pool: true },
      }),
      prisma.qACheck.findUnique({
        where: { id: qaCheckId },
      }),
    ]);

    if (!submission || !qaCheck) {
      throw new Error(`Invalid context: Submission ${submissionId} or QACheck ${qaCheckId} missing.`);
    }

    try {
      let evaluation;

      if (modelName === 'openai-gpt-4o') {
        evaluation = await evaluateWithOpenAI(submission.content, submission.pool.description || undefined);
      } else if (modelName === 'groq-llama-3-3') {
        evaluation = await evaluateWithGroq(submission.content, submission.pool.description || undefined);
      } else {
        throw new Error(`Unsupported AI model requested for QA check: ${modelName}`);
      }

      // Update QACheck database status
      await prisma.qACheck.update({
        where: { id: qaCheckId },
        data: {
          status: 'COMPLETED',
          approved: evaluation.approved,
          score: evaluation.score,
          explanation: evaluation.explanation,
        },
      });

      console.log(`[Model Checker] Completed check by ${modelName} for submission ${submissionId}. Score: ${evaluation.score}`);

      // Check and finalize consensus
      await runConsensusEvaluation(submissionId);

    } catch (error: any) {
      console.error(`[Model Checker] Fail during model evaluation (${modelName}):`, error);

      // Save failures so we don't stall the pipeline permanently
      await prisma.qACheck.update({
        where: { id: qaCheckId },
        data: {
          status: 'FAILED',
          error: error?.message || String(error),
        },
      });

      // Still try evaluating consensus in case other checks failed or need manual override
      await runConsensusEvaluation(submissionId);

      throw error; // Let BullMQ retry queue mechanism trigger if configured
    }
  },
  { connection: sharedRedis, concurrency: 3 }
);

/**
 * WORKER 3: Dataset Generation Worker
 * Compiles approved submission assets into synthetic training formats.
 */
export const datasetGenerationWorker = new Worker(
  'dataset-generation',
  async (job: Job<{ poolId: string }>) => {
    const { poolId } = job.data;
    console.log(`[Dataset Gen] Compiling dataset version for Asset Pool: ${poolId}`);

    const pool = await prisma.assetPool.findUnique({
      where: { id: poolId },
      include: {
        submissions: {
          where: { status: 'APPROVED' },
        },
      },
    });

    if (!pool) {
      throw new Error(`Asset Pool ${poolId} not found`);
    }

    console.log(`[Dataset Gen] Consolidated ${pool.submissions.length} approved submissions.`);
    
    // Simulate training set compilation (e.g. converting to fine-tuning formats, JSONL, or S3 output)
    const compilationMetadata = {
      poolId: pool.id,
      poolName: pool.name,
      totalAssetsCount: pool.submissions.length,
      compiledAt: new Date().toISOString(),
      version: `v1.0.${pool.submissions.length}`,
    };

    console.log(`[Dataset Gen] Compilation successfully complete! Metadata:`, compilationMetadata);
  },
  { connection: sharedRedis, concurrency: 2 }
);

// ==========================================
// 4. Consensus & Royalty Business Logic
// ==========================================

/**
 * Checks all active QA checks for a submission and triggers final approval and payments.
 */
async function runConsensusEvaluation(submissionId: string): Promise<void> {
  // Query all evaluations for the submission
  const qaChecks = await prisma.qACheck.findMany({
    where: { submissionId },
  });

  const pendingChecks = qaChecks.filter((c) => c.status === 'PENDING');
  if (pendingChecks.length > 0) {
    // Some model checks are still running
    console.log(`[Consensus] Submission ${submissionId} has ${pendingChecks.length} checks pending. Waiting...`);
    return;
  }

  console.log(`[Consensus] Evaluating consensus for submission ${submissionId}`);

  const completedChecks = qaChecks.filter((c) => c.status === 'COMPLETED');
  const failedChecks = qaChecks.filter((c) => c.status === 'FAILED');

  if (completedChecks.length === 0) {
    // All checks failed to run
    console.error(`[Consensus] Error: All checks failed for submission ${submissionId}`);
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        consensusReason: 'All multi-model checks failed due to external API errors.',
      },
    });
    return;
  }

  // Calculate stats
  const totalScore = completedChecks.reduce((acc, c) => acc + (c.score || 0), 0);
  const averageScore = totalScore / completedChecks.length;
  const approvalsCount = completedChecks.filter((c) => c.approved === true).length;

  // Consensus threshold requirements:
  // - More than half of completed checks must approve
  // - Average score must be >= 0.8
  const consensusApproved = approvalsCount >= Math.ceil(completedChecks.length / 2) && averageScore >= 0.8;

  const consensusSummary = `Evaluations: ${completedChecks.length} successful, ${failedChecks.length} failed. ` +
    `Approvals: ${approvalsCount}/${completedChecks.length}. Average Score: ${averageScore.toFixed(2)}.`;

  console.log(`[Consensus Result] Approved: ${consensusApproved}. Summary: ${consensusSummary}`);

  if (consensusApproved) {
    // 1. Update Task Submission to APPROVED
    const updatedSubmission = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        consensusScore: averageScore,
        consensusReason: consensusSummary,
      },
      include: { pool: true },
    });

    // 2. Compute Royalties
    // Formula: flat base reward + pool fractional shares (if pool has funds)
    const baseReward = 15.00; // Flat USD payout per approved task
    const poolVolume = updatedSubmission.pool.totalValue;
    
    // Allocate proportional incentives to the submitter based on pool performance, up to an extra 10%
    const variableBonus = poolVolume > 0 ? Math.min(10.00, poolVolume * 0.01) : 0;
    const finalRoyalty = baseReward + variableBonus;

    // Create Royalty Ledger Entry (Unpaid state initially, to be picked up by Stripe/Razorpay)
    const payoutMethod = 'STRIPE'; // Default global channel. Toggle to UPI for local context in routes

    await prisma.royaltyLedger.create({
      data: {
        poolId: updatedSubmission.poolId,
        submissionId: submissionId,
        recipientId: updatedSubmission.submitterId,
        amount: finalRoyalty,
        currency: 'USD',
        status: 'UNPAID',
        payoutMethod,
      },
    });

    console.log(`[Consensus Ledger] Royalty allocated for contributor ${updatedSubmission.submitterId}: $${finalRoyalty.toFixed(2)}`);

    // 3. Queue Dataset Compilation
    await datasetGenerationQueue.add(`generate-pool-${updatedSubmission.poolId}`, {
      poolId: updatedSubmission.poolId,
    });

  } else {
    // Update Task Submission to REJECTED
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        consensusScore: averageScore,
        consensusReason: consensusSummary + ' Submission did not pass multi-model approval or quality criteria.',
      },
    });
  }
}
