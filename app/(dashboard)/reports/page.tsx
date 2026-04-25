'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Trash2, Eye, ChevronLeft, ChevronRight, Dna } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDate, scoreToColor, gradeToClasses } from '@/lib/utils';
import type { HealthGrade } from '@/types/report';

export default function ReportsPage() {
  const { reports, pagination, isLoading, sort, fetchReports, deleteReport } = useReports();
  const [deleteTarget, setDeleteTarget] = useState<string|null>(null);
  const [localSort, setLocalSort] = useState(sort);

  useEffect(() => { fetchReports(1, localSort); }, []); // eslint-disable-line

  const handleSortChange = (s: string) => { setLocalSort(s); fetchReports(1, s); };
  const handleDelete = async () => { if (!deleteTarget) return; await deleteReport(deleteTarget); setDeleteTarget(null); fetchReports(pagination.page, localSort); };
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pagination.total} report{pagination.total!==1?'s':''} total</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={localSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-44 text-xs h-9"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
              <SelectItem value="createdAt_asc">Oldest First</SelectItem>
              <SelectItem value="healthScore_desc">Score: High→Low</SelectItem>
              <SelectItem value="healthScore_asc">Score: Low→High</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" asChild><Link href="/analyze"><Dna className="mr-1.5 h-3.5 w-3.5"/>New Analysis</Link></Button>
        </div>
      </div>

      {isLoading && !reports.length ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-14 w-full rounded-lg"/>)}</div>
      ) : !reports.length ? (
        <EmptyState icon={FileText} title="No reports yet" description="Analyze a GitHub repository to generate your first DNA report." action={<Button asChild><Link href="/analyze"><Dna className="mr-2 h-4 w-4"/>Analyze a Repository</Link></Button>}/>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <p className="font-medium font-mono text-sm">{report.repoOwner}/{report.repoName}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{formatDate(report.createdAt)}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(report.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden hidden md:block">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{width:`${report.healthScore}%`}}/>
                          </div>
                          <span className={cn('font-mono text-sm font-semibold', scoreToColor(report.healthScore))}>{report.healthScore}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn('border', gradeToClasses(report.grade as HealthGrade))}>{report.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild><Link href={`/reports/${report.id}`}><Eye className="h-3.5 w-3.5 mr-1"/>View</Link></Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10" onClick={() => setDeleteTarget(report.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Page {pagination.page} of {totalPages} · {pagination.total} total</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page<=1||isLoading} onClick={()=>fetchReports(pagination.page-1,localSort)}>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1"/>Prev
                </Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasMore||isLoading} onClick={()=>fetchReports(pagination.page+1,localSort)}>
                  Next<ChevronRight className="h-3.5 w-3.5 ml-1"/>
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Report" description="Are you sure? This action cannot be undone." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)}/>
    </div>
  );
}
