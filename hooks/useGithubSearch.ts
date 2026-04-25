'use client';
import { useState, useRef, useCallback } from 'react';
import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { GithubRepo } from '@/types/github';

export function useGithubSearch() {
  const [results, setResults] = useState<GithubRepo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const cacheRef = useRef(new Map<string, GithubRepo[]>());
  const abortRef = useRef<AbortController|null>(null);

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    if (cacheRef.current.has(q)) { setResults(cacheRef.current.get(q)!); return; }
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setIsSearching(true);
      try {
        const { data } = await apiClient.get<ApiResponse<GithubRepo[]>>('/api/github/search', { params:{q}, signal: abortRef.current.signal });
        const repos = data.data ?? [];
        cacheRef.current.set(q, repos);
        setResults(repos);
      } catch (e) { if (e instanceof Error && e.name==='AbortError') return; setResults([]); }
      finally { setIsSearching(false); }
    }, 300);
  }, []);

  const clearResults = useCallback(() => { setResults([]); if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return { search, results, isSearching, clearResults };
}
