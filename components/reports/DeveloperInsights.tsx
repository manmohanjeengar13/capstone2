import { Ghost, GitCommit, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeDate, formatNumber } from '@/lib/utils';
import type { ContributorInsight } from '@/types/report';

interface Props { contributors: ContributorInsight[]; teamHealthSignals: string[]; }

export function DeveloperInsights({ contributors, teamHealthSignals }: Props) {
  return (
    <div className="space-y-6">
      {teamHealthSignals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Team Health Signals</h3>
          {teamHealthSignals.map((s,i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-card border border-border text-sm text-muted-foreground">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{i+1}</span>
              {s}
            </div>
          ))}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold mb-3">Top Contributors <span className="font-normal text-muted-foreground">({contributors.length})</span></h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contributors.map((c) => (
            <Card key={c.login} className={cn('card-glow relative overflow-hidden', c.isGhost && 'border-red-500/20')}>
              {c.isGhost && <div className="absolute top-2 right-2"><Badge variant="danger" className="gap-1 text-[10px]"><Ghost className="h-2.5 w-2.5"/>Inactive</Badge></div>}
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={c.avatarUrl} alt={c.login}/>
                    <AvatarFallback className="text-xs font-bold">{c.login[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm font-mono truncate">{c.login}</p>
                    <p className="text-xs text-muted-foreground">{c.ownershipPercent}% ownership</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon:GitCommit, label:'Commits', value:formatNumber(c.commitCount), color:'text-blue-400' },
                    { icon:c.churnRatio>1?TrendingDown:TrendingUp, label:'Churn', value:`${c.churnRatio.toFixed(2)}x`, color:c.churnRatio>1.5?'text-orange-400':'text-emerald-400' },
                    { icon:TrendingUp, label:'Added', value:c.linesAdded>0?`+${formatNumber(c.linesAdded)}`:'—', color:'text-emerald-400' },
                    { icon:TrendingDown, label:'Deleted', value:c.linesDeleted>0?`-${formatNumber(c.linesDeleted)}`:'—', color:'text-red-400' },
                  ].map(({ icon:Icon, label, value, color }) => (
                    <div key={label} className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-1"><Icon className={cn('h-3 w-3',color)}/><span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span></div>
                      <span className={cn('font-mono text-sm font-semibold',color)}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3"/>Last active {formatRelativeDate(c.lastActiveAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
