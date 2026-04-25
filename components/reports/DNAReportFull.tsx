// components/reports/DNAReportFull.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Printer, ExternalLink, GitBranch, Calendar, Users, Bus, AlertTriangle, Activity, Code2, GitCommit, Database } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HealthScoreGauge } from './HealthScoreGauge';
import { SubScoreCards } from './SubScoreCards';
import { ActivityGrid } from './ActivityGrid';
import { RiskAreasList } from './RiskAreasList';
import { ContributorMatrix } from './ContributorMatrix';
import { DeveloperInsights } from './DeveloperInsights';
import { LanguageBreakdown } from './LanguageBreakdown';
import { ComplexityFileList } from './ComplexityFileList';
import { cn, formatDate, scoreToColor, gradeToClasses } from '@/lib/utils';
import type { Report, HealthGrade } from '@/types/report';

interface Props {
  report: Report & { rawData?: unknown };
}

export function DNAReportFull({ report }: Props) {
  const criticalRisks = report.riskAreas.filter(r => r.severity === 'CRITICAL').length;
  const highRisks = report.riskAreas.filter(r => r.severity === 'HIGH').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top bar */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Reports</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />Print / Export
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">{report.repoOwner}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-lg font-bold font-mono">{report.repoName}</span>
              </div>
              <a href={report.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline font-mono">
                {report.repoUrl}<ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('px-3 py-1 text-sm font-bold border', gradeToClasses(report.grade as HealthGrade))}>Grade {report.grade}</Badge>
              <span className={cn('text-2xl font-bold font-mono', scoreToColor(report.healthScore))}>{report.healthScore}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{report.summary}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="gap-1.5"><Calendar className="h-3 w-3" />Analyzed {formatDate(report.createdAt)}</Badge>
            <Badge variant="secondary" className="gap-1.5"><Users className="h-3 w-3" />{report.contributorInsights.length} contributors</Badge>
            <Badge variant={report.busFactor <= 1 ? 'danger' : report.busFactor <= 2 ? 'warning' : 'success'} className="gap-1.5">
              <Bus className="h-3 w-3" />Bus factor: {report.busFactor}
            </Badge>
            {(criticalRisks + highRisks) > 0 && (
              <Badge variant="danger" className="gap-1.5"><AlertTriangle className="h-3 w-3" />{criticalRisks} critical · {highRisks} high</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score section */}
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        <Card className="p-6 flex justify-center">
          <HealthScoreGauge score={report.healthScore} grade={report.grade as HealthGrade} size={180} />
        </Card>
        <SubScoreCards subScores={report.subScores} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex w-full h-auto flex-wrap gap-1 p-1 bg-secondary/50 rounded-xl">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm"><Code2 className="h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="commits" className="flex items-center gap-1.5 text-xs sm:text-sm"><GitCommit className="h-3.5 w-3.5" />Commits</TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <AlertTriangle className="h-3.5 w-3.5" />Risk
            {report.riskAreas.length > 0 && <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1">{report.riskAreas.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="contributors" className="flex items-center gap-1.5 text-xs sm:text-sm"><Users className="h-3.5 w-3.5" />Contributors</TabsTrigger>
          <TabsTrigger value="raw" className="flex items-center gap-1.5 text-xs sm:text-sm"><Database className="h-3.5 w-3.5" />Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6 space-y-8">
              <div><CardTitle className="text-sm mb-4 flex items-center gap-2"><Code2 className="h-4 w-4 text-primary" />Language Breakdown</CardTitle><LanguageBreakdown languages={report.languageBreakdown} /></div>
              <Separator />
              <div><CardTitle className="text-sm mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Most Complex Files</CardTitle><ComplexityFileList files={report.topComplexFiles} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commits">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Commit Score', value: `${report.subScores.commits}/100`, color: scoreToColor(report.subScores.commits) },
                  { label: 'Bus Factor', value: `${report.busFactor} person${report.busFactor !== 1 ? 's' : ''}`, color: report.busFactor <= 1 ? 'text-red-400' : 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-0.5 px-4 py-2.5 rounded-lg bg-secondary border border-border">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={cn('font-mono font-semibold text-sm', color)}>{value}</span>
                  </div>
                ))}
              </div>
              <div><CardTitle className="text-sm mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Activity Heatmap</CardTitle><ActivityGrid heatmap={report.activityHeatmap} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" />Risk Areas — Score: <span className={cn('font-mono', report.subScores.risk >= 60 ? 'text-red-400' : report.subScores.risk >= 30 ? 'text-amber-400' : 'text-emerald-400')}>{report.subScores.risk}/100</span></CardTitle></CardHeader>
            <CardContent><RiskAreasList riskAreas={report.riskAreas} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors">
          <Card>
            <CardContent className="p-6 space-y-8">
              <div><CardTitle className="text-sm mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Contributor Overview</CardTitle><ContributorMatrix contributors={report.contributorInsights} /></div>
              <Separator />
              <DeveloperInsights contributors={report.contributorInsights} teamHealthSignals={[]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4 text-primary" />Raw Analysis Data</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { const blob = new Blob([JSON.stringify(report.rawData,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${report.repoOwner}-${report.repoName}-dna.json`; a.click(); }}>Download JSON</Button>
              </div>
            </CardHeader>
            <CardContent><pre className="code-block max-h-[600px] overflow-auto text-xs text-muted-foreground">{JSON.stringify(report.rawData,null,2)}</pre></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
