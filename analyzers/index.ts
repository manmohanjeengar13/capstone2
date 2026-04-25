import { prisma } from '@/lib/prisma';
import { cacheSet } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { getRepoMetadata, getLanguages, getCommits, getFileTree, getContributors } from '@/services/github.service';
import { analyzeComplexity } from './complexity.analyzer';
import { analyzeCommitPatterns } from './commitPattern.analyzer';
import { analyzeRisk } from './risk.analyzer';
import { analyzeDeveloperBehavior } from './developerBehavior.analyzer';
import { calculateHealthScore } from './healthScore.calculator';

export type ProgressUpdater = (progress: number, step: string) => Promise<void>;

export async function runAnalysisPipeline(
  jobId: string,
  repoOwner: string,
  repoName: string,
  githubToken: string,
  updateProgress: ProgressUpdater,
): Promise<void> {
  logger.info('Pipeline started', { jobId, repoOwner, repoName });

  try {
    await updateProgress(5, 'Fetching repository metadata');
    const [repoMeta, languages] = await Promise.all([
      getRepoMetadata(repoOwner, repoName, githubToken),
      getLanguages(repoOwner, repoName, githubToken),
    ]);

    await updateProgress(20, 'Analyzing file complexity');
    const fileTree = await getFileTree(repoOwner, repoName, repoMeta.defaultBranch, githubToken);
    const complexityResult = analyzeComplexity(fileTree, languages);

    await updateProgress(45, 'Analyzing commit patterns');
    const commits = await getCommits(repoOwner, repoName, 500, githubToken);
    const commitResult = analyzeCommitPatterns(commits);

    await updateProgress(65, 'Identifying risk areas');
    const riskResult = analyzeRisk(commits, fileTree);

    await updateProgress(80, 'Profiling developer behavior');
    const contributors = await getContributors(repoOwner, repoName, githubToken);
    const devResult = analyzeDeveloperBehavior(commits, contributors);

    await updateProgress(95, 'Calculating health score');
    const healthResult = calculateHealthScore(
      complexityResult.complexityScore,
      commitResult.commitScore,
      riskResult.riskScore,
      commitResult.weeklyVelocity,
    );
    logger.info('Health score', { jobId, healthScore: healthResult.healthScore, grade: healthResult.grade });

    await updateProgress(98, 'Saving report');
    const job = await prisma.analysisJob.findUnique({
      where: { id: jobId },
      select: { userId: true, repoUrl: true },
    });
    if (!job) throw new Error(`Job ${jobId} not found`);

    const rawData = {
      repoMeta, languages, complexityResult, commitResult,
      riskResult, devResult, healthResult, analyzedAt: new Date().toISOString(),
    };

    const report = await prisma.report.create({
      data: {
        jobId,
        userId: job.userId,
        repoUrl: job.repoUrl,
        repoName,
        repoOwner,
        healthScore: healthResult.healthScore,
        grade: healthResult.grade,
        subScores: healthResult.subScores,
        busFactor: commitResult.busFactor,
        riskAreas: riskResult.riskAreas,
        contributors: devResult.contributorInsights,
        heatmap: commitResult.activityHeatmap,
        languages,
        topComplexFiles: complexityResult.topComplexFiles,
        teamHealthSignals: devResult.teamHealthSignals,
        summary: healthResult.summary,
        rawData,
      },
    });

    const reportDto = {
      id: report.id,
      jobId: report.jobId,
      repoUrl: report.repoUrl,
      repoName,
      repoOwner,
      healthScore: healthResult.healthScore,
      grade: healthResult.grade,
      subScores: healthResult.subScores,
      busFactor: commitResult.busFactor,
      topComplexFiles: complexityResult.topComplexFiles,
      riskAreas: riskResult.riskAreas,
      contributorInsights: devResult.contributorInsights,
      teamHealthSignals: devResult.teamHealthSignals,
      activityHeatmap: commitResult.activityHeatmap,
      languageBreakdown: languages,
      summary: report.summary,
      createdAt: report.createdAt.toISOString(),
      rawData,
    };

    // Cache is scoped to userId to prevent cross-user data leaks
    await cacheSet(`report:${job.userId}:${report.id}`, reportDto, 3600);
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', progress: 100, currentStep: 'Complete' },
    });
    logger.info('Pipeline complete', { jobId, reportId: report.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Pipeline failed', { jobId, error: message });
    // Guard against losing the original error if the DB update itself fails
    try {
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorMsg: message, currentStep: 'Failed' },
      });
    } catch (dbError) {
      logger.error('Failed to persist FAILED status — job may be stuck in RUNNING', {
        jobId,
        dbError: dbError instanceof Error ? dbError.message : 'Unknown',
      });
    }
    throw error;
  }
}