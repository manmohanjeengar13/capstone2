'use client';
import { usePathname } from 'next/navigation';
import { Dna } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/analyze':   'Analyze Repository',
  '/reports':   'Reports',
};

export function Topbar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? Object.entries(PAGE_TITLES).find(([p]) => pathname.startsWith(p + '/'))?.at(1) ?? 'DNA Analyzer';
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      <h1 className="text-sm font-semibold">{title}</h1>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Dna className="h-3.5 w-3.5 text-primary/60" />
        <span className="hidden sm:inline">DNA Analyzer v1.0</span>
      </div>
    </header>
  );
}
