import { cn, getDayName } from '@/lib/utils';
import type { ActivityHeatmap } from '@/types/report';

interface Props { heatmap: ActivityHeatmap; }
const HOUR_LABELS = ['12a','','','3a','','','6a','','','9a','','','12p','','','3p','','','6p','','','9p','',''];
const INTENSITY = ['bg-secondary','bg-blue-900/60','bg-blue-700/70','bg-blue-500/80','bg-blue-400'];

function getIntensity(v:number, max:number) { if(!max||!v)return 0; return Math.ceil((v/max)*4); }

export function ActivityGrid({ heatmap }: Props) {
  const { grid, peakDay, peakHour } = heatmap;
  const max = Math.max(1,...grid.flat());
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-5 shrink-0">
          {Array.from({length:7}).map((_,d) => (
            <div key={d} className="h-3 flex items-center text-[10px] text-muted-foreground w-7 font-mono">{getDayName(d)}</div>
          ))}
        </div>
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex gap-0.5 mb-1">
            {HOUR_LABELS.map((l,h) => <div key={h} className="text-[9px] text-muted-foreground font-mono" style={{width:'14px',flexShrink:0}}>{l}</div>)}
          </div>
          {grid.map((row,d) => (
            <div key={d} className="flex gap-0.5 mb-0.5">
              {row.map((v,h) => (
                <div key={h} title={`${getDayName(d,false)} ${h}:00 — ${v} commit${v!==1?'s':''}`}
                  className={cn('rounded-sm',INTENSITY[getIntensity(v,max)],d===peakDay&&h===peakHour&&'ring-1 ring-blue-300 ring-offset-1 ring-offset-background')}
                  style={{width:'14px',height:'12px',flexShrink:0}}/>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {INTENSITY.map((cls,i) => <div key={i} className={cn('w-3 h-3 rounded-sm',cls)}/>)}
        <span>More</span>
        <span className="ml-3 text-[10px]">Peak: {getDayName(peakDay,false)}s at {peakHour}:00</span>
      </div>
    </div>
  );
}
