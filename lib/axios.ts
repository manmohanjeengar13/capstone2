'use client';
import axios from 'axios';
const apiClient = axios.create({ baseURL: '', timeout: 45000, withCredentials: true, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
apiClient.interceptors.response.use(
  (r) => r,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 && typeof window !== 'undefined') { window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`; return Promise.reject(new Error('Session expired')); }
      if (status === 429) return Promise.reject(new Error(`Rate limit exceeded.`));
      if (status && status >= 500) return Promise.reject(new Error('Server error. Please try again later.'));
      const apiError = error.response?.data?.error as string | undefined;
      if (apiError) return Promise.reject(new Error(apiError));
    }
    return Promise.reject(error);
  }
);
export default apiClient;
