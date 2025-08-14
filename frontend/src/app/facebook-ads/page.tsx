"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ResponsiveLayout from "@/components/Layout/ResponsiveLayout";
import { useFacebookAds } from "@/hooks/useFacebookAds";
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointer,
  Eye,
  ShoppingCart,
  Calendar,
  Filter,
  BarChart3,
  Download,
  Target,
  Facebook,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function FacebookAdsPage() {
  const { data: session, status } = useSession();
  const [dateFilter, setDateFilter] = useState(() => {
    // Sempre inicia com o dia atual no horário local
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return {
      startDate: todayStr,
      endDate: todayStr,
    };
  });
  const [accountFilter, setAccountFilter] = useState("");
  const [chartView, setChartView] = useState<"cost" | "performance" | "conversions">("cost");
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [periodView, setPeriodView] = useState<"day" | "week" | "month">("day");

  // Função para calcular tempo decorrido
  const getTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'há menos de 1 minuto';
      if (diffMins === 1) return 'há 1 minuto';
      if (diffMins < 60) return `há ${diffMins} minutos`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return 'há 1 hora';
      if (diffHours < 24) return `há ${diffHours} horas`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'há 1 dia';
      return `há ${diffDays} dias`;
    } catch {
      return '';
    }
  };

  // Função auxiliar para formatar datas de forma segura
  const formatDateSafely = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    
    try {
      // Se a data está no formato YYYY-MM-DD, formata diretamente sem criar Date object
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Para outros formatos, tenta criar uma data válida
      const date = new Date(dateStr);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dateStr);
        return dateStr; // Retorna a string original se não conseguir processar
      }
      
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', dateStr, error);
      return dateStr || '-';
    }
  };

  const {
    data,
    metrics,
    loading,
    error,
    refresh,
    fetchAggregatedData,
  } = useFacebookAds({
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
    accountId: accountFilter,
  });

  // Buscar dados agregados quando mudar o período
  useEffect(() => {
    const loadAggregatedData = async () => {
      const result = await fetchAggregatedData(periodView);
      if (result) {
        setAggregatedData(result);
      }
    };
    loadAggregatedData();
  }, [fetchAggregatedData, periodView]);

  // Debug: log primeiro item para ver formato dos dados
  useEffect(() => {
    if (data.length > 0) {
      console.log('[FacebookAds Page] Formato dos dados:', data[0]);
      console.log('[FacebookAds Page] Campos disponíveis:', Object.keys(data[0]));
      console.log('[FacebookAds Page] updatedAt presente?', 'updatedAt' in data[0]);
      console.log('[FacebookAds Page] Valor de updatedAt:', data[0].updatedAt);
    }
  }, [data]);

  // Obter lista única de contas
  const accounts = Array.from(new Set(data.map(item => item.accountName)));

  // Filtrar dados
  const filteredData = data.filter(item => {
    if (accountFilter && item.accountName !== accountFilter) return false;
    return true;
  });

  const getMetricIcon = (value: number, isPositive: boolean = true) => {
    const Icon = value >= 0 ? TrendingUp : TrendingDown;
    const color = isPositive 
      ? (value >= 0 ? "text-green-500" : "text-red-500")
      : (value >= 0 ? "text-red-500" : "text-green-500");
    return <Icon className={`h-4 w-4 ${color}`} />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  if (status === "loading") {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Você precisa estar autenticado para ver esta página.</p>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                <Facebook className="h-8 w-8 mr-2 text-blue-600" />
                Facebook Ads
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Acompanhe o desempenho das suas campanhas do Meta
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-4">
              {/* Atalhos de período */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    const todayStr = `${year}-${month}-${day}`;
                    setDateFilter({
                      startDate: todayStr,
                      endDate: todayStr,
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
                    const year = yesterday.getFullYear();
                    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
                    const day = String(yesterday.getDate()).padStart(2, '0');
                    const yesterdayStr = `${year}-${month}-${day}`;
                    setDateFilter({
                      startDate: yesterdayStr,
                      endDate: yesterdayStr,
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
                    
                    const todayYear = today.getFullYear();
                    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                    const todayDay = String(today.getDate()).padStart(2, '0');
                    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
                    
                    const last7Year = last7Days.getFullYear();
                    const last7Month = String(last7Days.getMonth() + 1).padStart(2, '0');
                    const last7Day = String(last7Days.getDate()).padStart(2, '0');
                    const last7Str = `${last7Year}-${last7Month}-${last7Day}`;
                    
                    setDateFilter({
                      startDate: last7Str,
                      endDate: todayStr,
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
                    
                    const todayYear = today.getFullYear();
                    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                    const todayDay = String(today.getDate()).padStart(2, '0');
                    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
                    
                    const last30Year = last30Days.getFullYear();
                    const last30Month = String(last30Days.getMonth() + 1).padStart(2, '0');
                    const last30Day = String(last30Days.getDate()).padStart(2, '0');
                    const last30Str = `${last30Year}-${last30Month}-${last30Day}`;
                    
                    setDateFilter({
                      startDate: last30Str,
                      endDate: todayStr,
                    });
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Últimos 30 dias
                </button>
              </div>

              {/* Campos de filtro */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtro de conta */}
                <div>
                  <select
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as contas</option>
                    {accounts.map(account => (
                      <option key={account} value={account}>{account}</option>
                    ))}
                  </select>
                </div>

                {/* Data início */}
                <div>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Data fim */}
                <div>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Última atualização */}
                <div className="flex items-center justify-end text-sm text-gray-500">
                  {data.length > 0 && data[0].updatedAt && (
                    <span>
                      Atualizado {getTimeAgo(data[0].updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card de Receita destacado */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-lg font-medium opacity-90">Receita Total</p>
                <p className="mt-2 text-4xl font-bold">
                  {formatCurrency(metrics?.totalConversionValue || 0)}
                </p>
                <p className="text-sm opacity-80 mt-2">
                  ROAS: {metrics?.roas.toFixed(2) || '0.00'}x
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Investimento */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Total</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics?.totalCost || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </div>


            {/* Cliques */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cliques</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatNumber(metrics?.totalClicks || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CPC: {formatCurrency(metrics?.averageCpc || 0)}
                  </p>
                </div>
                <MousePointer className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            {/* Conversões */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversões</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {metrics?.totalConversions.toFixed(0) || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CPA: {formatCurrency(metrics?.averageCpa || 0)}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            {/* CTR */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CTR</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {metrics?.ctr.toFixed(2) || '0.00'}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(metrics?.totalImpressions || 0)} impressões
                  </p>
                </div>
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Análise de Performance</h3>
              <div className="flex space-x-2">
                {/* Seletor de período */}
                <select
                  value={periodView}
                  onChange={(e) => setPeriodView(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="day">Diário</option>
                  <option value="week">Semanal</option>
                  <option value="month">Mensal</option>
                </select>
                
                {/* Seletor de visualização */}
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setChartView("cost")}
                    className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                      chartView === "cost"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Investimento
                  </button>
                  <button
                    onClick={() => setChartView("performance")}
                    className={`px-3 py-1 text-sm font-medium ${
                      chartView === "performance"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Performance
                  </button>
                  <button
                    onClick={() => setChartView("conversions")}
                    className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                      chartView === "conversions"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Conversões
                  </button>
                </div>
              </div>
            </div>

            <div className="h-96">
              {aggregatedData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === "cost" ? (
                    <AreaChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        name="Investimento"
                        stroke="#1877f2"
                        fill="#1877f2"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="conversionValue"
                        name="Receita"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  ) : chartView === "performance" ? (
                    <LineChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="clicks"
                        name="Cliques"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ctr"
                        name="CTR (%)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="conversions" name="Conversões" fill="#10b981" />
                      <Bar dataKey="conversionRate" name="Taxa de Conversão (%)" fill="#f59e0b" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabela de dados */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Histórico de Dados</h3>
              <div className="text-sm text-gray-500">
                Total de registros: {filteredData.length}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                      Cliques
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPC
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversões
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPA
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && !filteredData.length ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        Nenhum dado encontrado para o período
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const cpa = item.conversions > 0 ? item.cost / item.conversions : 0;
                      const roas = item.cost > 0 ? item.conversionValue / item.cost : 0;
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDateSafely(item.date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(item.updatedAt || item.receivedAt) ? 
                                (() => {
                                  try {
                                    const date = new Date(item.updatedAt || item.receivedAt);
                                    return isNaN(date.getTime()) ? '-' : format(date, 'HH:mm:ss', { locale: ptBR });
                                  } catch {
                                    return '-';
                                  }
                                })() : '-'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.accountName}</div>
                            <div className="text-xs text-gray-500">ID: {item.accountId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(item.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {item.clicks.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(item.averageCpc)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {item.conversions.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(cpa)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(item.conversionValue)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Métricas adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Performance por conta */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance por Conta</h3>
              <div className="space-y-3">
                {accounts.map(account => {
                  const accountData = filteredData.filter(item => item.accountName === account);
                  const accountMetrics = accountData.reduce(
                    (acc, item) => ({
                      cost: acc.cost + item.cost,
                      conversions: acc.conversions + item.conversions,
                      conversionValue: acc.conversionValue + item.conversionValue,
                    }),
                    { cost: 0, conversions: 0, conversionValue: 0 }
                  );
                  const accountRoas = accountMetrics.cost > 0 ? accountMetrics.conversionValue / accountMetrics.cost : 0;
                  
                  return (
                    <div key={account} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{account}</p>
                        <p className="text-xs text-gray-500">
                          Investimento: {formatCurrency(accountMetrics.cost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${accountRoas >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          ROAS: {accountRoas.toFixed(2)}x
                        </p>
                        <p className="text-xs text-gray-500">
                          {accountMetrics.conversions.toFixed(0)} conversões
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Taxa de conversão por período */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Taxa de Conversão</h3>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100">
                  <span className="text-3xl font-bold text-blue-600">
                    {metrics?.conversionRate.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  {metrics?.totalConversions.toFixed(0) || '0'} conversões de {metrics?.totalClicks.toLocaleString('pt-BR') || '0'} cliques
                </p>
              </div>
            </div>

            {/* Resumo de custos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo de Custos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CPC Médio</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(metrics?.averageCpc || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CPA Médio</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(metrics?.averageCpa || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CPM Médio</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency((metrics?.totalCost || 0) / (metrics?.totalImpressions || 1) * 1000)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info sobre sincronização */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-start">
            <Facebook className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Sincronização automática</p>
              <p>
                Os dados do Facebook Ads são atualizados automaticamente a cada hora. 
                Se você também possui Google Ads configurado, os dados são sincronizados 
                em conjunto quando o Google envia as atualizações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}