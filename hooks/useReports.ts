'use client';
import { useCallback } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { useReportsStore } from '@/store/useReportsStore';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Report } from '@/types/report';

export function useReports() {
  const { reports, currentReport, pagination, isLoading, sort, setReports, setCurrentReport, removeReport, setLoading, setSort } = useReportsStore();

  const fetchReports = useCallback(async (page = 1, newSort?: string) => {
    const s = newSort ?? sort;
    setLoading(true);
    try {
      const { data } = await apiClient.get<PaginatedResponse<Report>>('/api/reports', { params: { page, limit:10, sort:s } });
      setReports(data.data, { page:data.page, total:data.total, hasMore:data.hasMore, limit:data.limit });
      if (newSort) setSort(newSort);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to load reports'); }
    finally { setLoading(false); }
  }, [sort, setReports, setLoading, setSort]);

  const fetchReport = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse<Report & { rawData: unknown }>>(`/api/reports/${id}`);
      if (data.data) setCurrentReport(data.data);
      return data.data;
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to load report'); return null; }
    finally { setLoading(false); }
  }, [setCurrentReport, setLoading]);

  const deleteReport = useCallback(async (id: string) => {
    try { await apiClient.delete(`/api/reports/${id}`); removeReport(id); toast.success('Report deleted'); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to delete'); return false; }
  }, [removeReport]);

  return { reports, currentReport, pagination, isLoading, sort, fetchReports, fetchReport, deleteReport };
}
