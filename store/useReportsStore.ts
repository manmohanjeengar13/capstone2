'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Report } from '@/types/report';

interface Pagination { page: number; total: number; hasMore: boolean; limit: number; }
interface State { reports: Report[]; currentReport: (Report & { rawData?: unknown })|null; pagination: Pagination; isLoading: boolean; sort: string; }
interface Actions { setReports(r: Report[], p: Pagination): void; setCurrentReport(r: (Report & { rawData?: unknown })|null): void; appendReports(r: Report[]): void; removeReport(id: string): void; setLoading(v: boolean): void; setSort(s: string): void; }

export const useReportsStore = create<State & Actions>()(persist(
  (set) => ({
    reports: [], currentReport: null, pagination: { page:1, total:0, hasMore:false, limit:10 }, isLoading: false, sort: 'createdAt_desc',
    setReports: (reports, pagination) => set({ reports, pagination }),
    setCurrentReport: (currentReport) => set({ currentReport }),
    appendReports: (newR) => set(s => ({ reports:[...s.reports,...newR.filter(r=>!s.reports.some(e=>e.id===r.id))] })),
    removeReport: (id) => set(s => ({ reports:s.reports.filter(r=>r.id!==id), currentReport:s.currentReport?.id===id?null:s.currentReport })),
    setLoading: (isLoading) => set({ isLoading }),
    setSort: (sort) => set({ sort }),
  }),
  { name:'dna-reports', storage: createJSONStorage(()=>typeof window!=='undefined'?localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}), partialize: s => ({ reports:s.reports.slice(0,20), pagination:s.pagination, sort:s.sort }) }
));
