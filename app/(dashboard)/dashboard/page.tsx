'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { BarChart3, Dna, FileText, Plus, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/axios';
import { cn, formatDate, scoreToColor, gradeToClasses } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Report, HealthGrade } from '@/types/report';
import type { ApiResponse } from '@/types/api';

interface Stats { totalReports: number; avgHealthScore: number; recentReports: Report[]; }

function StatCard({ label, value, icon:Icon, colorClass }: { label:string; value:string|number; icon:React.ElementType; colorClass:string }) {
  return (
    <Card className="card-glow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-current/10 border border-current/20', colorClass)}>
            <Icon className={cn('h-4 w-4', colorClass)}/>
          </div>
        </div>
        <div className={cn('text-3xl font-bold font-mono', colorClass)}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ReportCard({ report }: { report: Report }) {
  return (
    <Link href={`/reports/${report.id}`} className="block">
      <Card className="card-glow hover:border-primary/30 transition-all group h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold font-mono truncate group-hover:text-primary transition-colors">{report.repoOwner}/{report.repoName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(report.createdAt)}</p>
            </div>
            <Badge className={cn('shrink-0 border', gradeToClasses(report.grade as HealthGrade))}>{report.grade}</Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Health</span>
              <span className={cn('font-mono font-bold', scoreToColor(report.healthScore))}>{report.healthScore}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{width:`${report.healthScore}%`}}/>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<Stats>>('/api/dashboard')
      .then(({ data }) => { if (data.data) setStats(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {name} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your repository analyses.</p>
        </div>
        <Button asChild><Link href="/analyze"><Plus className="mr-2 h-4 w-4"/>New Analysis</Link></Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-28 rounded-xl"/>)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Reports" value={stats?.totalReports??0} icon={FileText} colorClass="text-blue-400" />
            <StatCard label="Avg Health Score" value={stats?.avgHealthScore?`${stats.avgHealthScore}/100`:'—'} icon={TrendingUp} colorClass={stats?.avgHealthScore?scoreToColor(stats.avgHealthScore):'text-muted-foreground'} />
            <StatCard label="Repos Analyzed" value={stats?.totalReports??0} icon={BarChart3} colorClass="text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Reports</CardTitle>
              {(stats?.totalReports??0)>6&&<Link href="/reports" className="text-xs text-primary hover:underline">View all →</Link>}
            </div>
            {!stats?.recentReports?.length ? (
              <EmptyState icon={Dna} title="No analyses yet" description="Analyze your first GitHub repository to see health insights here." action={<Button asChild><Link href="/analyze"><Dna className="mr-2 h-4 w-4"/>Analyze a Repository</Link></Button>}/>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recentReports.map((r,i)=><div key={r.id} className={`stagger-${Math.min(i+1,6)}`}><ReportCard report={r}/></div>)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
