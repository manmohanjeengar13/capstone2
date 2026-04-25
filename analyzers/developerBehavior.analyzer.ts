import type { GithubCommit, GithubContributor } from '@/types/github';
import type { ContributorInsight } from '@/types/report';

export interface DeveloperBehaviorResult { contributorInsights: ContributorInsight[]; teamHealthSignals: string[]; }
const GHOST_MS = 90*24*60*60*1000;

export function analyzeDeveloperBehavior(commits: GithubCommit[], contributors: GithubContributor[]): DeveloperBehaviorResult {
  if(!commits.length) return { contributorInsights:[], teamHealthSignals:[] };
  const now=Date.now();
  const map=new Map<string,GithubCommit[]>();
  for(const c of commits){const k=c.authorLogin??c.authorEmail??'unknown';if(!map.has(k))map.set(k,[]);map.get(k)!.push(c);}
  const avatarMap=new Map(contributors.map(c=>[c.login,c.avatarUrl]));
  const total=commits.length;
  const sorted=[...map.entries()].sort((a,b)=>b[1].length-a[1].length).slice(0,10);
  const contributorInsights: ContributorInsight[] = sorted.map(([login,cs])=>{
    const last=cs.reduce((l,c)=>new Date(c.committedAt)>new Date(l.committedAt)?c:l);
    const linesAdded=cs.reduce((s,c)=>s+c.additions,0);
    const linesDeleted=cs.reduce((s,c)=>s+c.deletions,0);
    return { login, avatarUrl: avatarMap.get(login)??`https://avatars.githubusercontent.com/u/0?v=4`, commitCount:cs.length, linesAdded, linesDeleted, churnRatio:linesAdded>0?Math.round((linesDeleted/linesAdded)*100)/100:0, lastActiveAt:last.committedAt, isGhost:now-new Date(last.committedAt).getTime()>GHOST_MS, ownershipPercent:Math.round((cs.length/total)*10000)/100 };
  });
  const signals: string[]=[];
  const ghosts=contributorInsights.filter(c=>c.isGhost);
  if(ghosts.length)signals.push(`${ghosts.length} contributor(s) inactive for 90+ days: ${ghosts.map(g=>g.login).join(', ')}.`);
  const top=contributorInsights[0];
  if(top&&top.ownershipPercent>60)signals.push(`${top.login} owns ${top.ownershipPercent}% of commits — high bus factor risk.`);
  const highChurn=contributorInsights.filter(c=>c.churnRatio>1.5&&c.commitCount>5);
  if(highChurn.length)signals.push(`High churn detected for: ${highChurn.map(c=>c.login).join(', ')}.`);
  if(contributorInsights.length===1)signals.push('Single contributor — single point of failure.');
  return { contributorInsights, teamHealthSignals: signals };
}
