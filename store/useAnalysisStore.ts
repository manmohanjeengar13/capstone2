'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { JobStatus, AnalysisProgress } from '@/types/analysis';

interface State { jobId: string|null; status: JobStatus|null; progress: number; currentStep: string; reportId: string|null; error: string|null; repoUrl: string|null; }
interface Actions { startJob(jobId: string, repoUrl?: string): void; updateProgress(p: AnalysisProgress): void; completeJob(reportId: string): void; failJob(error: string): void; reset(): void; isActive(): boolean; }
const init: State = { jobId:null, status:null, progress:0, currentStep:'', reportId:null, error:null, repoUrl:null };

export const useAnalysisStore = create<State & Actions>()(persist(
  (set, get) => ({
    ...init,
    startJob: (jobId, repoUrl) => set({ ...init, jobId, status:'PENDING', currentStep:'Queued', repoUrl:repoUrl??null }),
    updateProgress: (p) => set({ status:p.status, progress:p.progress, currentStep:p.currentStep, reportId:p.reportId??null, error:p.errorMsg??null }),
    completeJob: (reportId) => set({ status:'COMPLETED', progress:100, currentStep:'Complete', reportId }),
    failJob: (error) => set({ status:'FAILED', error, currentStep:'Failed' }),
    reset: () => set(init),
    isActive: () => { const { status } = get(); return status==='PENDING'||status==='RUNNING'; },
  }),
  { name:'dna-analysis', storage: createJSONStorage(()=>typeof window!=='undefined'?sessionStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}) }
));
