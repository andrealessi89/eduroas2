import { useState, useEffect, useCallback } from 'react';
import { useApiToken } from './useApiToken';

interface FacebookAdsData {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  averageCpc: number;
  conversionValue: number;
  receivedAt: string;
  updatedAt?: string;
}

interface FacebookAdsMetrics {
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalConversionValue: number;
  averageCpc: number;
  averageCpa: number;
  ctr: number;
  conversionRate: number;
  roas: number;
}

interface UseFacebookAdsProps {
  startDate?: string;
  endDate?: string;
  accountId?: string;
}

export function useFacebookAds({ startDate, endDate, accountId }: UseFacebookAdsProps = {}) {
  const { apiCall, loading: tokenLoading } = useApiToken();
  const [data, setData] = useState<FacebookAdsData[]>([]);
  const [metrics, setMetrics] = useState<FacebookAdsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (tokenLoading || !apiCall) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiCall<{
        success: boolean;
        data: FacebookAdsData[];
        totals: {
          cost: number;
          impressions: number;
          clicks: number;
          conversions: number;
          conversionValue: number;
        };
        metrics: {
          cpc: number;
          cpa: number;
          roas: number;
          ctr: number;
        };
      }>(`/facebook-ads${params.toString() ? `?${params.toString()}` : ''}`, {
        method: 'GET',
      });

      if (response.success) {
        // Filtrar por conta se necessário
        let filteredData = response.data;
        if (accountId) {
          filteredData = response.data.filter(item => item.accountId === accountId);
        }

        setData(filteredData);

        // Recalcular métricas com base nos dados filtrados
        const totals = filteredData.reduce((acc, item) => ({
          cost: acc.cost + item.cost,
          impressions: acc.impressions + item.impressions,
          clicks: acc.clicks + item.clicks,
          conversions: acc.conversions + item.conversions,
          conversionValue: acc.conversionValue + item.conversionValue,
        }), {
          cost: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversionValue: 0,
        });

        setMetrics({
          totalCost: totals.cost,
          totalImpressions: totals.impressions,
          totalClicks: totals.clicks,
          totalConversions: totals.conversions,
          totalConversionValue: totals.conversionValue,
          averageCpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
          averageCpa: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
          ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
          conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
          roas: totals.cost > 0 ? totals.conversionValue / totals.cost : 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      console.error('Erro ao buscar dados do Facebook Ads:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, tokenLoading, startDate, endDate, accountId]);

  const fetchAggregatedData = useCallback(async (period: 'day' | 'week' | 'month') => {
    if (tokenLoading || !apiCall) return null;

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiCall<{
        success: boolean;
        data: any[];
      }>(`/facebook-ads/aggregated/${period}${params.toString() ? `?${params.toString()}` : ''}`, {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar dados agregados:', err);
      return null;
    }
  }, [apiCall, tokenLoading, startDate, endDate]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    metrics,
    loading,
    error,
    refresh,
    fetchAggregatedData,
  };
}