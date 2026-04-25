import type { GithubCommit } from '@/types/github';
import type { ActivityHeatmap } from '@/types/report';
import { clamp } from '@/lib/utils';

export interface CommitPatternResult { commitScore: number; weeklyVelocity: number; busFactor: number; activityHeatmap: ActivityHeatmap; burnoutSignal: number; commitHygieneScore: number; gaps: string[]; }

export function analyzeCommitPatterns(commits: GithubCommit[]): CommitPatternResult {
  if (!commits.length) return { commitScore:0, weeklyVelocity:0, busFactor:0, activityHeatmap:{grid:Array.from({length:7},()=>new Array(24).fill(0)),peakDay:0,peakHour:0}, burnoutSignal:0, commitHygieneScore:0, gaps:[] };
  const sorted = [...commits].sort((a,b) => new Date(a.committedAt).getTime()-new Date(b.committedAt).getTime());
  const grid: number[][] = Array.from({length:7},()=>new Array(24).fill(0));
  let weekend=0, afterHours=0;
  for (const c of sorted) { const d=new Date(c.committedAt); const day=d.getUTCDay(); const hr=d.getUTCHours(); grid[day][hr]++; if(day===0||day===6)weekend++; if(hr>=20||hr<6)afterHours++; }
  let peakDay=0,peakHour=0,peakVal=0;
  for(let d=0;d<7;d++) for(let h=0;h<24;h++) if(grid[d][h]>peakVal){peakVal=grid[d][h];peakDay=d;peakHour=h;}
  const burnoutSignal = Math.round(((weekend+afterHours)/(commits.length*2))*100);
  const twelveWeeksAgo = Date.now()-12*7*24*60*60*1000;
  const weeklyVelocity = Math.round(sorted.filter(c=>new Date(c.committedAt).getTime()>twelveWeeksAgo).length/12);
  const authorMap = new Map<string,number>();
  for(const c of commits){const k=c.authorLogin??c.authorEmail??'unknown';authorMap.set(k,(authorMap.get(k)??0)+1);}
  const busFactor = computeBus(authorMap,commits.length);
  const commitHygieneScore = Math.round((1-commits.filter(c=>c.message.trim().length<10).length/commits.length)*100);
  const gaps: string[] = [];
  for(let i=1;i<sorted.length;i++){const diff=Math.floor((new Date(sorted[i].committedAt).getTime()-new Date(sorted[i-1].committedAt).getTime())/(86400000));if(diff>30)gaps.push(`${diff}-day gap between ${sorted[i-1].committedAt.slice(0,10)} and ${sorted[i].committedAt.slice(0,10)}`);}
  const velocityScore=Math.min(weeklyVelocity*10,100);
  const commitScore=clamp(Math.round(velocityScore*0.4+commitHygieneScore*0.4-Math.min(burnoutSignal*0.3,30)-Math.min(gaps.length*5,20)),0,100);
  return { commitScore, weeklyVelocity, busFactor, activityHeatmap:{grid,peakDay,peakHour}, burnoutSignal, commitHygieneScore, gaps };
}
function computeBus(m: Map<string,number>, total: number): number {
  const sorted=[...m.values()].sort((a,b)=>b-a);let acc=0,count=0;const th=total*0.8;
  for(const v of sorted){acc+=v;count++;if(acc>=th)break;}
  return Math.max(count,1);
}
