import { Code2, GitCommit, ShieldAlert, Zap } from 'lucide-react';
import { cn, scoreToColor, scoreToBg } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SubScores } from '@/types/report';

interface Props { subScores: SubScores; }
const CARDS = [
  { key:'complexity' as const, label:'Complexity', icon:Code2, desc:'Code structure health', stagger:'stagger-1' },
  { key:'commits' as const, label:'Commit Health', icon:GitCommit, desc:'Hygiene & velocity', stagger:'stagger-2' },
  { key:'risk' as const, label:'Risk Level', icon:ShieldAlert, desc:'Technical debt signals', invert:true, stagger:'stagger-3' },
  { key:'velocity' as const, label:'Velocity', icon:Zap, desc:'Development cadence', stagger:'stagger-4' },
];

export function SubScoreCards({ subScores }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon:Icon, desc, invert, stagger }) => {
        const raw = subScores[key];
        const display = invert ? 100-raw : raw;
        const col = scoreToColor(display);
        const bg = scoreToBg(display);
        return (
          <Card key={key} className={cn('card-glow', stagger)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary border border-border">
                  <Icon className={cn('h-4 w-4', col)} />
                </div>
                <span className={cn('text-2xl font-bold font-mono', col)}>{display}</span>
              </div>
              <p className="text-sm font-medium mb-0.5">{label}</p>
              <p className="text-xs text-muted-foreground mb-3">{desc}</p>
              <Progress value={display} className="h-1.5" />
              {invert && <p className="text-[10px] text-muted-foreground mt-1.5">Raw: {raw} · Lower is better</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
