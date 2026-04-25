import Bull from 'bull';
import type { AnalysisJobPayload } from '@/types/analysis';

export const analysisQueue = new Bull<AnalysisJobPayload>('analysis', {
  redis: process.env.REDIS_URL ?? 'redis://localhost:6379',
  defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: { age: 86400, count: 1000 }, removeOnFail: { age: 259200 }, timeout: 10*60*1000 },
});

export async function addAnalysisJob(payload: AnalysisJobPayload): Promise<void> {
  await analysisQueue.add(payload, { jobId: payload.jobId });
}
