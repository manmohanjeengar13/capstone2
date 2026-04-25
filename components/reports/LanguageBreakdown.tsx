import { formatBytes } from '@/lib/utils';

interface Props { languages: Record<string, number>; }
const LANG_COLORS: Record<string,string> = { TypeScript:'#3178c6',JavaScript:'#f1e05a',Python:'#3572A5',Go:'#00ADD8',Rust:'#dea584',Java:'#b07219','C++':'#f34b7d',C:'#555555','C#':'#178600',PHP:'#4F5D95',Ruby:'#701516',Swift:'#F05138',Kotlin:'#A97BFF',Vue:'#41B883',Svelte:'#ff3e00',HTML:'#e34c26',CSS:'#563d7c',Shell:'#89e051' };
const FALLBACKS = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16','#06b6d4','#a855f7'];
const getColor = (l:string,i:number) => LANG_COLORS[l] ?? FALLBACKS[i%FALLBACKS.length];

export function LanguageBreakdown({ languages }: Props) {
  const entries = Object.entries(languages).sort((a,b)=>b[1]-a[1]);
  const total = entries.reduce((s,[,v])=>s+v,0);
  if (!total || !entries.length) return <p className="text-sm text-muted-foreground text-center py-4">No language data.</p>;
  const top = entries.slice(0,7);
  const other = entries.slice(7).reduce((s,[,v])=>s+v,0);
  if (other>0) top.push(['Other',other]);
  return (
    <div className="space-y-4">
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {top.map(([l,b],i) => { const p=(b/total)*100; if(p<0.5)return null; return <div key={l} className="h-full transition-all" style={{width:`${p}%`,backgroundColor:l==='Other'?'#4b5563':getColor(l,i)}} title={`${l}: ${p.toFixed(1)}%`}/>; })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {top.map(([l,b],i) => {
          const pct = ((b/total)*100).toFixed(1);
          const color = l==='Other'?'#4b5563':getColor(l,i);
          return (
            <div key={l} className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{backgroundColor:color}}/>
              <span className="text-xs font-medium truncate">{l}</span>
              <span className="text-xs text-muted-foreground font-mono ml-auto shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground font-mono">Total: {formatBytes(total)} · {entries.length} language{entries.length!==1?'s':''}</p>
    </div>
  );
}
