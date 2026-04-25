import { Ghost, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { ContributorInsight } from '@/types/report';

interface Props { contributors: ContributorInsight[]; }

export function ContributorMatrix({ contributors }: Props) {
  if (!contributors.length) return <p className="text-sm text-muted-foreground text-center py-8">No contributor data available.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contributor</TableHead>
          <TableHead className="text-right">Commits</TableHead>
          <TableHead className="hidden sm:table-cell">Ownership</TableHead>
          <TableHead className="text-right hidden md:table-cell">Churn</TableHead>
          <TableHead className="text-right hidden lg:table-cell">Last Active</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributors.map((c) => (
          <TableRow key={c.login}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7 border border-border shrink-0">
                  <AvatarImage src={c.avatarUrl} alt={c.login}/>
                  <AvatarFallback className="text-xs">{c.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium font-mono text-sm">{c.login}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-mono">{c.commitCount}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex items-center gap-2">
                <Progress value={Math.min(c.ownershipPercent,100)} className="w-20 h-1.5"/>
                <span className="text-xs text-muted-foreground font-mono w-10 text-right">{c.ownershipPercent}%</span>
              </div>
            </TableCell>
            <TableCell className="text-right hidden md:table-cell">
              <span className={cn('font-mono text-sm',c.churnRatio>1.5?'text-orange-400':'text-muted-foreground')}>
                {c.churnRatio>1.5&&<TrendingUp className="h-3 w-3 inline mr-1"/>}{c.churnRatio.toFixed(2)}x
              </span>
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground hidden lg:table-cell font-mono">{formatRelativeDate(c.lastActiveAt)}</TableCell>
            <TableCell className="text-center">
              {c.isGhost
                ? <Badge variant="danger" className="gap-1"><Ghost className="h-3 w-3"/>Ghost</Badge>
                : <Badge variant="success" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>Active</Badge>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
