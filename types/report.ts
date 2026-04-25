// types/report.ts
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface SubScores {
  complexity: number;
  commits: number;
  risk: number;
  velocity: number;
}

export interface RiskArea {
  file: string;
  severity: RiskSeverity;
  reason: string;
  metric: string;
}

export interface ContributorInsight {
  login: string;
  avatarUrl: string;
  commitCount: number;
  linesAdded: number;
  linesDeleted: number;
  churnRatio: number;
  lastActiveAt: string;
  isGhost: boolean;
  ownershipPercent: number;
}

export interface ActivityHeatmap {
  grid: number[][];
  peakDay: number;
  peakHour: number;
}

export interface Report {
  id: string;
  jobId: string;
  repoUrl: string;
  repoName: string;
  repoOwner: string;
  healthScore: number;
  grade: HealthGrade;
  subScores: SubScores;
  busFactor: number;
  topComplexFiles: string[];
  riskAreas: RiskArea[];
  contributorInsights: ContributorInsight[];
  activityHeatmap: ActivityHeatmap;
  languageBreakdown: Record<string, number>;
  summary: string;
  createdAt: string;
}
