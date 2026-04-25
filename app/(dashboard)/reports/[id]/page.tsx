'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileSearch } from 'lucide-react';
import Link from 'next/link';
import { useReports } from '@/hooks/useReports';
import { DNAReportFull } from '@/components/reports/DNAReportFull';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><Skeleton className="h-4 w-28"/><Skeleton className="h-9 w-24 rounded-lg"/></div>
      <Skeleton className="h-40 w-full rounded-xl"/>
      <div className="grid md:grid-cols-[auto_1fr] gap-6"><Skeleton className="h-52 w-52 rounded-xl"/><div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-28 rounded-xl"/>)}</div></div>
      <Skeleton className="h-12 w-full rounded-xl"/>
      <Skeleton className="h-64 w-full rounded-xl"/>
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentReport, isLoading, fetchReport } = useReports();

  useEffect(() => { if (id) fetchReport(id); }, [id]); // eslint-disable-line

  if (isLoading && !currentReport) return <ReportSkeleton/>;
  if (!currentReport && !isLoading) return (
    <EmptyState icon={FileSearch} title="Report not found" description="This report may have been deleted or you don't have access to it."
      action={<Button asChild><Link href="/reports">Back to Reports</Link></Button>}/>
  );
  if (currentReport) return <DNAReportFull report={currentReport}/>;
  return <ReportSkeleton/>;
}
