'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import type { ApiResponse } from '@/types/api';
import type { AnalysisProgress } from '@/types/analysis';

export function useAnalysis() {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorCountRef = useRef(0);

  const {
    jobId, status, progress, currentStep, error, reportId,
    startJob, updateProgress, completeJob, failJob, reset, isActive,
  } = useAnalysisStore();

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollJob = useCallback((id: string) => {
    stopPolling();
    errorCountRef.current = 0;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<AnalysisProgress>>(`/api/analyze/${id}`);
        if (!data.data) return;

        errorCountRef.current = 0;
        const p = data.data;
        updateProgress(p);

        if (p.status === 'COMPLETED' && p.reportId) {
          stopPolling();
          completeJob(p.reportId);
          toast.success('Analysis complete!');
          setTimeout(() => router.push(`/reports/${p.reportId}`), 800);
        } else if (p.status === 'FAILED') {
          stopPolling();
          failJob(p.errorMsg ?? 'Analysis failed');
          toast.error(p.errorMsg ?? 'Analysis failed');
        }
      } catch {
        errorCountRef.current += 1;
        if (errorCountRef.current >= 5) {
          stopPolling();
          failJob('Lost connection to server. Please refresh.');
          toast.error('Lost connection to server. Please refresh.');
        }
      }
    }, 3000);
  }, [stopPolling, updateProgress, completeJob, failJob, router]);

  // Resume polling if the component mounts and a job is already in progress
  useEffect(() => {
    if (jobId && isActive()) pollJob(jobId);
    return stopPolling;
  }, [jobId, isActive, pollJob, stopPolling]);

  const submitRepo = useCallback(async (repoUrl: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ jobId: string }>>('/api/analyze', { repoUrl });
      if (!data.data?.jobId) throw new Error('No job ID returned');
      startJob(data.data.jobId, repoUrl);
      toast.success('Analysis started!');
      pollJob(data.data.jobId);
      return data.data.jobId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start';
      toast.error(msg);
      throw err;
    }
  }, [startJob, pollJob]);

  const cancelAnalysis = useCallback(() => {
    stopPolling();
    reset();
    toast.info('Analysis cancelled');
  }, [stopPolling, reset]);

  return { jobId, status, progress, currentStep, error, reportId, submitRepo, cancelAnalysis, isActive: isActive(), reset };
}