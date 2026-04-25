import type { GithubCommit } from '@/types/github';
import type { GithubTree } from '@/types/github';
import type { RiskArea, RiskSeverity } from '@/types/report';
import { clamp } from '@/lib/utils';

export interface RiskResult { riskScore: number; riskAreas: RiskArea[]; }
const TODO_RE = /\b(TODO|FIXME|HACK|XXX|BUG|WORKAROUND)\b/i;
const LOCKFILES = new Set(['package-lock.json','yarn.lock','pnpm-lock.yaml','Gemfile.lock','poetry.lock','Pipfile.lock','go.sum','Cargo.lock']);

export function analyzeRisk(commits: GithubCommit[], tree: GithubTree): RiskResult {
  if(!commits.length) return { riskScore:0, riskAreas:[] };
  const riskAreas: RiskArea[] = [];
  let score = 0;
  const todoCount = commits.filter(c=>TODO_RE.test(c.message)).length;
  const todoRatio = todoCount/commits.length;
  if(todoRatio>0.2){riskAreas.push({file:'Repository-wide',severity:'HIGH',reason:`${Math.round(todoRatio*100)}% of commit messages contain TODO/FIXME markers.`,metric:`${todoCount}/${commits.length} commits`});score+=20;}
  else if(todoRatio>0.1){riskAreas.push({file:'Repository-wide',severity:'MEDIUM',reason:`${Math.round(todoRatio*100)}% of commits mention tech-debt markers.`,metric:`${todoCount}/${commits.length} commits`});score+=10;}
  else if(todoRatio>0){riskAreas.push({file:'Repository-wide',severity:'LOW',reason:'Minor TODO/FIXME markers in commit history.',metric:`${todoCount} commits`});score+=5;}
  const paths=new Set(tree.tree.map(e=>e.path));
  const hasPkg=paths.has('package.json')||paths.has('Pipfile')||paths.has('Gemfile')||paths.has('Cargo.toml');
  const hasLock=tree.tree.some(e=>LOCKFILES.has(e.path.split('/').pop()??''));
  if(hasPkg&&!hasLock){riskAreas.push({file:'Project root',severity:'HIGH',reason:'Dependency manifest found but no lockfile — non-reproducible builds.',metric:'Missing lockfile'});score+=20;}
  const sorted=[...commits].sort((a,b)=>new Date(b.committedAt).getTime()-new Date(a.committedAt).getTime());
  const days=Math.floor((Date.now()-new Date(sorted[0].committedAt).getTime())/86400000);
  if(days>365){riskAreas.push({file:'Repository-wide',severity:'CRITICAL',reason:`Repository inactive for ${days} days — likely abandoned.`,metric:`Last commit: ${sorted[0].committedAt.slice(0,10)}`});score+=25;}
  else if(days>180){riskAreas.push({file:'Repository-wide',severity:'HIGH',reason:`No commits in ${days} days.`,metric:`Last commit: ${sorted[0].committedAt.slice(0,10)}`});score+=15;}
  else if(days>90){riskAreas.push({file:'Repository-wide',severity:'MEDIUM',reason:`Repository has been quiet for ${days} days.`,metric:`Last commit: ${sorted[0].committedAt.slice(0,10)}`});score+=8;}
  return { riskScore: clamp(Math.round(score),0,100), riskAreas };
}
