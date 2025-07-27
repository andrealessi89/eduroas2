import { useState, useEffect, useCallback } from 'react';
import { useApiToken } from './useApiToken';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface GoogleAdsData {
  id: string;
  userId: string;
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
}

export interface GoogleAdsMetrics {
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

export interface GoogleAdsFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
}

export function useGoogleAds(filters?: GoogleAdsFilters) {
  const { token, loading: tokenLoading } = useApiToken();
  const [data, setData] = useState<GoogleAdsData[]>([]);
  const [metrics, setMetrics] = useState<GoogleAdsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = (adsData: GoogleAdsData[]): GoogleAdsMetrics => {
    if (adsData.length === 0) {
      return {
        totalCost: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalConversionValue: 0,
        averageCpc: 0,
        averageCpa: 0,
        ctr: 0,
        conversionRate: 0,
        roas: 0,
      };
    }

    const totals = adsData.reduce(
      (acc, item) => ({
        cost: acc.cost + item.cost,
        impressions: acc.impressions + item.impressions,
        clicks: acc.clicks + item.clicks,
        conversions: acc.conversions + item.conversions,
        conversionValue: acc.conversionValue + item.conversionValue,
      }),
      { cost: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 }
    );

    return {
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
    };
  };

  const fetchGoogleAdsData = useCallback(async () => {
    if (!token || tokenLoading) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados diretamente da rota do Google Ads
      const response = await api.googleAds.list(
        {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          accountId: filters?.accountId,
        },
        token
      );

      if (response.success) {
        setData(response.data || []);
        setMetrics(response.metrics || calculateMetrics(response.data || []));
      } else {
        throw new Error(response.error || 'Erro ao buscar dados do Google Ads');
      }
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar dados do Google Ads';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token, tokenLoading, filters?.startDate, filters?.endDate, filters?.accountId]);

  const fetchAggregatedData = useCallback(async (groupBy: 'day' | 'week' | 'month' = 'day') => {
    if (!token || !data.length) return null;

    try {
      // Agrupar dados localmente
      const aggregatedData = data.reduce((acc: any, item: GoogleAdsData) => {
        let key = item.date;
        
        if (groupBy === 'month') {
          key = item.date.substring(0, 7);
        } else if (groupBy === 'week') {
          const date = new Date(item.date);
          const weekNumber = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
          key = `${item.date.substring(0, 7)}-W${weekNumber}`;
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            cost: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            conversionValue: 0,
          };
        }

        acc[key].cost += item.cost;
        acc[key].impressions += item.impressions;
        acc[key].clicks += item.clicks;
        acc[key].conversions += item.conversions;
        acc[key].conversionValue += item.conversionValue;

        return acc;
      }, {});

      return Object.values(aggregatedData).map((item: any) => ({
        ...item,
        cpc: item.clicks > 0 ? item.cost / item.clicks : 0,
        cpa: item.conversions > 0 ? item.cost / item.conversions : 0,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        conversionRate: item.clicks > 0 ? (item.conversions / item.clicks) * 100 : 0,
        roas: item.cost > 0 ? item.conversionValue / item.cost : 0,
      }));
    } catch (err) {
      console.error('Erro ao agregar dados:', err);
      return null;
    }
  }, [data]);

  const refresh = useCallback(() => {
    return fetchGoogleAdsData();
  }, [fetchGoogleAdsData]);

  useEffect(() => {
    fetchGoogleAdsData();
  }, [fetchGoogleAdsData]);

  return {
    data,
    metrics,
    loading: loading || tokenLoading,
    error,
    refresh,
    fetchAggregatedData,
  };
}