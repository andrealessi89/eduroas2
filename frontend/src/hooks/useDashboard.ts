import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useApiToken } from './useApiToken';

interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  platform?: 'all' | 'google' | 'facebook';
}

export function useDashboard(filters?: DashboardFilters) {
  const { token, loading: tokenLoading } = useApiToken();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenLoading || !token) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        const result = await api.dashboard.getData(filters, token);
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [token, tokenLoading, filters?.startDate, filters?.endDate, filters?.platform]);

  const refresh = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.dashboard.getData(filters, token);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading: loading || tokenLoading,
    error,
    refresh,
  };
}