"use client";

import { useState, useEffect } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { 
  Facebook, 
  Calendar,
  TrendingUp,
  DollarSign,
  MousePointer,
  Eye,
  Target,
  RefreshCw,
  Download,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

interface Totals {
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
}

interface Metrics {
  cpc: number;
  cpa: number;
  roas: number;
  ctr: number;
}

export default function FacebookAdsPage() {
  const { apiCall, loading: tokenLoading } = useApiToken();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<FacebookAdsData[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    // Sempre inicia com o dia atual
    const today = new Date().toISOString().split("T")[0];
    
    return {
      startDate: today,
      endDate: today,
    };
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await apiCall<{
        success: boolean;
        data: FacebookAdsData[];
        totals: Totals;
        metrics: Metrics;
      }>(`/facebook-ads${params.toString() ? `?${params.toString()}` : ''}`, {
        method: "GET",
      });

      if (response.success) {
        console.log('[FacebookAds] Dados recebidos:', response.data.length, 'registros');
        setData(response.data);
        setTotals(response.totals);
        setMetrics(response.metrics);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiCall("/facebook-ads/sync", {
        method: "POST",
        body: JSON.stringify({ date: dateRange.startDate }),
      });
      await fetchData();
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!tokenLoading) {
      fetchData();
    }
  }, [tokenLoading, dateRange.startDate, dateRange.endDate]);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  if (loading || tokenLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Facebook className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Facebook Ads</h1>
                <p className="text-gray-600">Dados das suas campanhas do Meta</p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </div>
        </div>

        {/* Filtros de data */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="space-y-4">
            {/* Atalhos de período */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    startDate: today.toISOString().split("T")[0],
                    endDate: today.toISOString().split("T")[0],
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hoje
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDateRange({
                    startDate: yesterday.toISOString().split("T")[0],
                    endDate: yesterday.toISOString().split("T")[0],
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Ontem
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const last7Days = new Date(today);
                  last7Days.setDate(last7Days.getDate() - 7);
                  setDateRange({
                    startDate: last7Days.toISOString().split("T")[0],
                    endDate: today.toISOString().split("T")[0],
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const last30Days = new Date(today);
                  last30Days.setDate(last30Days.getDate() - 30);
                  setDateRange({
                    startDate: last30Days.toISOString().split("T")[0],
                    endDate: today.toISOString().split("T")[0],
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Últimos 30 dias
              </button>
            </div>
            
            {/* Campos de data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data final
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <p className="text-sm text-gray-500">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Mostrando dados do período selecionado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        {totals && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.cost)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Impressões</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.impressions)}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cliques</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.clicks)}</p>
                  <p className="text-sm text-gray-500">CTR: {metrics.ctr.toFixed(2)}%</p>
                </div>
                <MousePointer className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CPC Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.cpc)}</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabela de dados */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Dados</h2>
          </div>

          {data.length === 0 ? (
            <div className="p-12 text-center">
              <Facebook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
              <p className="text-gray-600 mb-4">
                Configure suas integrações e selecione contas de anúncio para começar a receber dados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conta
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investimento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressões
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliques
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPC
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{record.accountName}</p>
                          <p className="text-xs text-gray-500">{record.accountId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(record.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(record.impressions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(record.clicks)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(record.averageCpc)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {record.impressions > 0
                          ? ((record.clicks / record.impressions) * 100).toFixed(2)
                          : "0.00"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre os dados</p>
            <p>
              Os dados são coletados automaticamente a cada hora das contas de anúncio selecionadas.
              Você também pode forçar uma sincronização manual clicando no botão "Sincronizar".
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}