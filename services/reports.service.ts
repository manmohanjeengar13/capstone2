import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { PaginatedResponse } from '@/types/api';
import type { Report, ContributorInsight, RiskArea, ActivityHeatmap, SubScores, HealthGrade } from '@/types/report';

type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'healthScore_desc' | 'healthScore_asc';

function reportCacheKey(userId: string, reportId: string): string {
  return `report:${userId}:${reportId}`;
}

function mapDb(r: Record<string, unknown>): Report {
  return {
    id: r.id as string,
    jobId: r.jobId as string,
    repoUrl: r.repoUrl as string,
    repoName: r.repoName as string,
    repoOwner: r.repoOwner as string,
    healthScore: r.healthScore as number,
    grade: r.grade as HealthGrade,
    subScores: r.subScores as SubScores,
    busFactor: r.busFactor as number,
    topComplexFiles: r.topComplexFiles as string[],
    riskAreas: r.riskAreas as RiskArea[],
    contributorInsights: r.contributors as ContributorInsight[],
    activityHeatmap: r.heatmap as ActivityHeatmap,
    languageBreakdown: r.languages as Record<string, number>,
    summary: r.summary as string,
    createdAt: (r.createdAt as Date).toISOString(),
  };
}

export async function listReports(
  userId: string,
  page: number,
  limit: number,
  sort: SortOption,
): Promise<PaginatedResponse<Report>> {
  const [field, direction] = sort.split('_') as [string, 'asc' | 'desc'];
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { userId, deletedAt: null },
      orderBy: { [field]: direction },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, jobId: true, repoUrl: true, repoName: true, repoOwner: true,
        healthScore: true, grade: true, subScores: true, busFactor: true,
        topComplexFiles: true, riskAreas: true, contributors: true, heatmap: true,
        languages: true, summary: true, createdAt: true,
      },
    }),
    prisma.report.count({ where: { userId, deletedAt: null } }),
  ]);
  return {
    data: reports.map(r => mapDb(r as unknown as Record<string, unknown>)),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function getReport(id: string, userId: string): Promise<Report & { rawData: unknown }> {
  const cacheKey = reportCacheKey(userId, id);
  const cached = await cacheGet<Report & { rawData: unknown }>(cacheKey);
  if (cached) {
    logger.debug('Cache hit', { reportId: id, userId });
    return cached;
  }

  const report = await prisma.report.findFirst({ where: { id, userId, deletedAt: null } });
  if (!report) throw new AppError('Report not found', 404, 'ERR_REPORT_NOT_FOUND');

  const dto = { ...mapDb(report as unknown as Record<string, unknown>), rawData: report.rawData };
  await cacheSet(cacheKey, dto, 3600);
  return dto;
}

export async function softDeleteReport(id: string, userId: string): Promise<void> {
  const report = await prisma.report.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true },
  });
  if (!report) throw new AppError('Report not found', 404, 'ERR_REPORT_NOT_FOUND');

  await prisma.report.update({ where: { id }, data: { deletedAt: new Date() } });
  await cacheDel(reportCacheKey(userId, id));
}

export async function getDashboardStats(userId: string) {
  const [totalReports, avg, recentReports] = await Promise.all([
    prisma.report.count({ where: { userId, deletedAt: null } }),
    prisma.report.aggregate({ where: { userId, deletedAt: null }, _avg: { healthScore: true } }),
    prisma.report.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, jobId: true, repoUrl: true, repoName: true, repoOwner: true,
        healthScore: true, grade: true, subScores: true, busFactor: true,
        topComplexFiles: true, riskAreas: true, contributors: true, heatmap: true,
        languages: true, summary: true, createdAt: true,
      },
    }),
  ]);
  return {
    totalReports,
    avgHealthScore: Math.round(avg._avg.healthScore ?? 0),
    recentReports: recentReports.map(r => mapDb(r as unknown as Record<string, unknown>)),
  };
}