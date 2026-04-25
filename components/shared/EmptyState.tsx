import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
export function EmptyState({ icon:Icon=FolderOpen, title, description, action, className }:{icon?:LucideIcon;title:string;description?:string;action?:React.ReactNode;className?:string}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center',className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border mb-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
