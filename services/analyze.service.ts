import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { addAnalysisJob } from '@/queue/analysis.queue';
import type { AnalysisProgress } from '@/types/analysis';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
type User = { id: string; email: string; githubLogin: string | null; };

export function parseGithubUrl(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) throw new AppError('Invalid GitHub URL. Expected: https://github.com/owner/repo', 400, 'ERR_INVALID_REPO_URL');
  return { owner: match[1], repo: match[2] };
}

export async function createAndEnqueueJob(repoUrl: string, user: User, decryptedToken: string): Promise<string> {
  const { owner, repo } = parseGithubUrl(repoUrl);
  const job = await prisma.analysisJob.create({ data: { userId: user.id, repoUrl, repoOwner: owner, repoName: repo, status: 'PENDING', progress: 0, currentStep: 'Queued' } });
  logger.info('Analysis job created', { jobId: job.id, repoUrl, userId: user.id });
  await addAnalysisJob({ jobId: job.id, repoUrl, repoOwner: owner, repoName: repo, userId: user.id, encryptedToken: encrypt(decryptedToken, ENCRYPTION_KEY) });
  return job.id;
}

export async function getJobProgress(jobId: string, userId: string): Promise<AnalysisProgress> {
  const job = await prisma.analysisJob.findFirst({ where: { id: jobId, userId }, include: { report: { select: { id: true } } } });
  if (!job) throw new AppError('Analysis job not found', 404, 'ERR_JOB_NOT_FOUND');
  return { jobId: job.id, status: job.status as AnalysisProgress['status'], progress: job.progress, currentStep: job.currentStep ?? '', reportId: job.report?.id, errorMsg: job.errorMsg ?? undefined };
}
