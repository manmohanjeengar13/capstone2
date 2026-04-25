'use client';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RiskArea, RiskSeverity } from '@/types/report';

interface Props { riskAreas: RiskArea[]; }
const SEV: Record<RiskSeverity,{icon:React.ElementType;badge:string;border:string;bg:string}> = {
  CRITICAL:{icon:AlertOctagon,badge:'danger',border:'border-l-red-500',bg:'bg-red-500/5'},
  HIGH:{icon:AlertTriangle,badge:'warning',border:'border-l-orange-500',bg:'bg-orange-500/5'},
  MEDIUM:{icon:Info,badge:'warning',border:'border-l-amber-500',bg:'bg-amber-500/5'},
  LOW:{icon:Info,badge:'secondary',border:'border-l-blue-500',bg:'bg-blue-500/5'},
};
const ORDER: RiskSeverity[] = ['CRITICAL','HIGH','MEDIUM','LOW'];

export function RiskAreasList({ riskAreas }: Props) {
  if (!riskAreas.length) return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-400"/>
      </div>
      <p className="text-sm font-medium">No significant risks detected</p>
      <p className="text-xs text-muted-foreground mt-1">This repository looks clean!</p>
    </div>
  );

  const sorted = [...riskAreas].sort((a,b)=>ORDER.indexOf(a.severity)-ORDER.indexOf(b.severity));
  return (
    <Accordion type="multiple" className="space-y-2">
      {sorted.map((area,i) => {
        const cfg = SEV[area.severity];
        const Icon = cfg.icon;
        return (
          <AccordionItem key={`${area.file}-${i}`} value={`item-${i}`}
            className={cn('rounded-lg border border-border border-l-2 overflow-hidden',cfg.border)}>
            <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 hover:no-underline [&[data-state=open]]:bg-secondary/30">
              <div className="flex items-center gap-3 text-left w-full mr-2">
                <Icon className={cn('h-4 w-4 shrink-0',area.severity==='CRITICAL'?'text-red-400':area.severity==='HIGH'?'text-orange-400':'text-amber-400')}/>
                <span className="flex-1 text-sm font-medium font-mono truncate">{area.file}</span>
                <Badge variant={cfg.badge as 'danger'|'warning'|'secondary'} className="shrink-0 text-[10px]">{area.severity}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className={cn('px-4 pb-4',cfg.bg)}>
              <p className="text-sm leading-relaxed mb-2 mt-1">{area.reason}</p>
              <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">{area.metric}</code>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
