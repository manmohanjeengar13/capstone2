// components/analyze/RepoSearchInput.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Search, Star, GitFork, Loader2, X } from 'lucide-react';
import { useGithubSearch } from '@/hooks/useGithubSearch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { GithubRepo } from '@/types/github';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (repo: GithubRepo) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function RepoSearchInput({ value, onChange, onSelect, placeholder = 'https://github.com/owner/repo', error, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const { search, results, isSearching, clearResults } = useGithubSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (!v.startsWith('https://') && v.length >= 2) { search(v); setOpen(true); }
    else { clearResults(); setOpen(false); }
  };

  const handleSelect = (repo: GithubRepo) => {
    onChange(repo.url); clearResults(); setOpen(false); onSelect?.(repo);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showDropdown = open && (results.length > 0 || isSearching);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        {isSearching && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
        <Input
          type="url"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={cn('pl-10 pr-9 font-mono text-sm', error && 'border-red-500 focus-visible:ring-red-500')}
          aria-label="Repository URL"
        />
        {value && (
          <button type="button" onClick={() => { onChange(''); clearResults(); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-400 font-mono">{error}</p>}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border border-border bg-popover shadow-2xl overflow-hidden">
          {isSearching && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching GitHub…
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((repo) => (
                <li key={repo.id}>
                  <button type="button" onClick={() => handleSelect(repo)} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground font-mono truncate">{repo.fullName}</span>
                        {repo.language && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground shrink-0">{repo.language}</span>}
                      </div>
                      {repo.description && <p className="text-xs text-muted-foreground truncate">{repo.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks.toLocaleString()}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
