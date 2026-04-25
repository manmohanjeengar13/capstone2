'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Search, FileText, LogOut, Dna, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href:'/dashboard', label:'Dashboard', icon:LayoutDashboard },
  { href:'/analyze',   label:'Analyze',   icon:Search },
  { href:'/reports',   label:'Reports',   icon:FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try { await signOut(); router.push('/login'); toast.success('Signed out'); }
    catch { toast.error('Failed to sign out'); }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Dna className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold text-sm tracking-tight">DNA Analyzer</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={cn('nav-item group', isActive && 'active')}>
              <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3 w-3 text-primary/60" />}
            </Link>
          );
        })}
        <Separator className="my-3" />
        <Link href="/api-docs" className="nav-item group">
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          <span className="flex-1">API Docs</span>
        </Link>
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        {session?.user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? 'User'} />
              <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                {(session.user.name ?? session.user.email ?? 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{session.user.name ?? 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />Sign Out
        </Button>
      </div>
    </aside>
  );
}
