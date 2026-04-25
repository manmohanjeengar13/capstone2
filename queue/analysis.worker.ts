import { analysisQueue } from './analysis.queue';
import { runAnalysisPipeline } from '@/analyzers';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import type { AnalysisJobPayload } from '@/types/analysis';
import type { Job } from 'bull';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

async function shutdown(): Promise<void> {
  logger.info('Worker shutting down — draining queue');
  try {
    await analysisQueue.close();
    await prisma.$disconnect();
    logger.info('Worker shutdown complete');
  } catch (error) {
    logger.error('Error during worker shutdown', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export function startWorker(): void {
  analysisQueue.process(3, async (job: Job<AnalysisJobPayload>) => {
    const { jobId, repoOwner, repoName, encryptedToken } = job.data;
    logger.info('Worker processing job', { jobId });

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', currentStep: 'Starting', progress: 1 },
    });

    let token: string;
    try {
      token = decrypt(encryptedToken, ENCRYPTION_KEY);
    } catch (error) {
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorMsg: 'Failed to decrypt token.', currentStep: 'Failed' },
      });
      return;
    }

    const updateProgress = async (progress: number, step: string) => {
      await Promise.all([
        prisma.analysisJob.update({ where: { id: jobId }, data: { progress, currentStep: step } }),
        job.progress(progress),
      ]);
    };

    await runAnalysisPipeline(jobId, repoOwner, repoName, token, updateProgress);
  });

  analysisQueue.on('completed', (job: Job<AnalysisJobPayload>) =>
    logger.info('Job completed', { jobId: job.data?.jobId }),
  );
  analysisQueue.on('failed', (job: Job<AnalysisJobPayload> | undefined, err: Error) =>
    logger.error('Job failed', { jobId: job?.data?.jobId, error: err.message }),
  );
  analysisQueue.on('stalled', (job: Job<AnalysisJobPayload>) =>
    logger.warn('Job stalled', { jobId: job.data?.jobId }),
  );
  analysisQueue.on('error', (error: Error) =>
    logger.error('Queue error', { error: error.message }),
  );

  logger.info('Analysis worker started (concurrency: 3)');
}