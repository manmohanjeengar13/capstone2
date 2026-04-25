import { cn } from '@/lib/utils';
interface Props { files: string[]; }
const EXT_COLORS: Record<string,string> = { '.ts':'text-blue-400 bg-blue-400/10','.tsx':'text-blue-300 bg-blue-300/10','.js':'text-yellow-400 bg-yellow-400/10','.jsx':'text-yellow-300 bg-yellow-300/10','.py':'text-green-400 bg-green-400/10','.java':'text-orange-400 bg-orange-400/10','.go':'text-cyan-400 bg-cyan-400/10','.rs':'text-orange-300 bg-orange-300/10','.cs':'text-purple-400 bg-purple-400/10','.rb':'text-red-400 bg-red-400/10' };
const RANK_COLOR = (r:number) => r===1?'bg-amber-500/20 text-amber-400 border-amber-500/30':r===2?'bg-slate-400/20 text-slate-300 border-slate-400/30':r===3?'bg-orange-700/20 text-orange-400/80 border-orange-700/30':'bg-secondary text-muted-foreground border-border';
const getExt = (p:string) => { const i=p.lastIndexOf('.'); return i===-1?'':p.slice(i).toLowerCase(); };

export function ComplexityFileList({ files }: Props) {
  if (!files.length) return <p className="text-sm text-muted-foreground text-center py-4">No complex files detected.</p>;
  return (
    <div className="space-y-1.5">
      {files.map((file,i) => {
        const rank=i+1, ext=getExt(file), parts=file.split('/'), name=parts.pop()??file, dir=parts.join('/');
        return (
          <div key={file} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors">
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold border shrink-0',RANK_COLOR(rank))}>{rank}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium font-mono truncate">{name}</span>
                {ext && <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0',EXT_COLORS[ext]??'text-muted-foreground bg-secondary')}>{ext}</span>}
              </div>
              {dir && <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{dir}/</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
