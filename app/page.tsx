import Link from 'next/link';
import { Dna, BarChart3, GitCommit, Shield, Activity, ArrowRight, Star, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  { icon:BarChart3, title:'Complexity Analysis', desc:'Deep file tree scanning, language breakdown, and architectural complexity scoring.', color:'text-blue-400', bg:'bg-blue-500/10', border:'border-blue-500/20' },
  { icon:GitCommit, title:'Commit Patterns', desc:'Activity heatmaps, velocity trends, bus factor, burnout signals, and commit hygiene.', color:'text-emerald-400', bg:'bg-emerald-500/10', border:'border-emerald-500/20' },
  { icon:Shield, title:'Risk Areas', desc:'Missing lockfiles, stale repos, high-churn files, tech debt markers, binary bloat.', color:'text-amber-400', bg:'bg-amber-500/10', border:'border-amber-500/20' },
  { icon:Activity, title:'Health Score', desc:'Weighted composite 0–100 score with A–F grade and actionable summary.', color:'text-purple-400', bg:'bg-purple-500/10', border:'border-purple-500/20' },
];

const stats = [{ value:'10+', label:'Metrics' },{ value:'A–F', label:'Grades' },{ value:'500', label:'Commits' },{ value:'~60s', label:'Speed' }];

function DNAHelix() {
  const colors = [['text-blue-400','text-emerald-400'],['text-emerald-400','text-blue-400'],['text-purple-400','text-blue-400'],['text-blue-400','text-purple-400'],['text-cyan-400','text-emerald-400'],['text-emerald-400','text-cyan-400'],['text-blue-400','text-pink-400'],['text-pink-400','text-blue-400']];
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {colors.map(([c1,c2],i) => (
        <div key={i} className="dna-strand" style={{animationDelay:`${i*0.175}s`}}>
          <div className={`w-2.5 h-2.5 rounded-full bg-current ${c1}`} style={{boxShadow:'0 0 8px currentColor'}}/>
          <div className="w-0.5 h-5 bg-gradient-to-b from-blue-400/30 to-emerald-400/30 mx-auto"/>
          <div className={`w-2.5 h-2.5 rounded-full bg-current ${c2}`} style={{boxShadow:'0 0 8px currentColor'}}/>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none"/>
      <div className="fixed inset-0 radial-glow pointer-events-none"/>
      <nav className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20"><Dna className="h-4 w-4 text-primary"/></div>
            <span className="font-bold text-sm">DNA Analyzer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link href="/login">Sign In</Link></Button>
            <Button size="sm" asChild><Link href="/login"><ArrowRight className="mr-1.5 h-3.5 w-3.5"/>Get Started</Link></Button>
          </div>
        </div>
      </nav>
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <Badge variant="outline" className="mb-8 gap-1.5 border-primary/20 bg-primary/5 text-primary"><Zap className="h-3 w-3"/>Powered by GitHub API · Next.js 14 · Bull Queue</Badge>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
          Decode Your<br/><span className="gradient-text">Codebase DNA</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Analyze any GitHub repository and get a deep health report — complexity scores, commit patterns, risk signals, contributor insights, and an A–F letter-grade health score.
        </p>
        <div className="flex justify-center mb-10"><DNAHelix/></div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild className="hover:shadow-glow"><Link href="/login"><Dna className="mr-2 h-4 w-4"/>Start Analyzing<ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
          <Button size="lg" variant="outline" asChild><Link href="/api-docs">View API Docs</Link></Button>
        </div>
      </section>
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <Card key={label} className="card-glow text-center p-5">
              <div className="text-3xl font-bold text-primary font-mono mb-1">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </Card>
          ))}
        </div>
      </section>
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Every dimension of your project</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Four analysis engines working together for a complete picture of repository health.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon:Icon, title, desc, color, bg, border }, i) => (
            <Card key={title} className={`stagger-${i+1} card-glow relative overflow-hidden`}>
              <CardHeader>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} border ${border} mb-2`}><Icon className={`h-5 w-5 ${color}`}/></div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${bg} opacity-30 blur-2xl`}/>
            </Card>
          ))}
        </div>
      </section>
      <section className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-400"/>Tokens encrypted with AES-256-GCM</div>
          <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-400"/>Works with public and private repos</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-400"/>Next.js 14 · shadcn/ui · Bull · Prisma</div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Dna className="h-3.5 w-3.5 text-primary/60"/>DNA Analyzer</div>
          <span>Built for developers who care about code quality</span>
        </div>
      </footer>
    </div>
  );
}
