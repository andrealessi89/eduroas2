"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  PieChart,
  AlertCircle,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useDashboard } from "@/hooks/useDashboard";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import PedidosSemCusto from "@/components/PedidosSemCusto";

// Cores para gráficos
const COLORS = {
  produtos: '#F59E0B',
  frete: '#EF4444',
  taxas: '#8B5CF6',
  marketing: '#3B82F6',
  lucro: '#10B981'
};

// Componente de filtros
function DashboardFilters({ filters, onFilterChange }: any) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  return (
    <div className="space-y-4">
      {/* Atalhos de período */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            onFilterChange({
              ...filters,
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
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayYear = yesterday.getFullYear();
            const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
            const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
            const yesterdayStr = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;
            onFilterChange({
              ...filters,
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
            const last7Days = new Date(today);
            last7Days.setDate(last7Days.getDate() - 7);
            const last7Year = last7Days.getFullYear();
            const last7Month = String(last7Days.getMonth() + 1).padStart(2, '0');
            const last7Day = String(last7Days.getDate()).padStart(2, '0');
            const last7Str = `${last7Year}-${last7Month}-${last7Day}`;
            onFilterChange({
              ...filters,
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
            const last30Days = new Date(today);
            last30Days.setDate(last30Days.getDate() - 30);
            const last30Year = last30Days.getFullYear();
            const last30Month = String(last30Days.getMonth() + 1).padStart(2, '0');
            const last30Day = String(last30Days.getDate()).padStart(2, '0');
            const last30Str = `${last30Year}-${last30Month}-${last30Day}`;
            onFilterChange({
              ...filters,
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
        {/* Filtro de plataforma */}
        <div>
          <select
            value={filters.platform || 'all'}
            onChange={(e) => onFilterChange({ ...filters, platform: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as plataformas</option>
            <option value="google">Google Ads</option>
            <option value="facebook">Facebook Ads</option>
          </select>
        </div>

        {/* Data início */}
        <div>
          <input
            type="date"
            value={filters.startDate || todayStr}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Data fim */}
        <div>
          <input
            type="date"
            value={filters.endDate || todayStr}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botão de atualizar */}
        <div className="flex items-center justify-end">
          <button 
            onClick={() => onFilterChange({ ...filters })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  growth, 
  growthLabel, 
  icon: Icon, 
  prefix = "", 
  suffix = "",
  color = "blue"
}: any) {
  const isPositive = growth >= 0;
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2 lg:mb-3">
        <div className={`p-2 lg:p-2.5 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 lg:w-5 h-4 lg:h-5" />
        </div>
        {growth !== undefined && (
          <span className={`text-[10px] lg:text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}{growth.toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs lg:text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-base lg:text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
        </p>
        {growthLabel && (
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1">{growthLabel}</p>
        )}
      </div>
    </div>
  );
}

function AdCard({ platform, data }: any) {
  const isGoogle = platform === 'Google';
  const bgColor = isGoogle ? 'bg-red-50' : 'bg-blue-50';
  const textColor = isGoogle ? 'text-red-600' : 'text-blue-600';
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
            {isGoogle ? (
              <svg className="w-7 h-7" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ) : (
              <svg className="w-7 h-7" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{platform} Ads</h3>
            <p className={`text-sm ${textColor} font-medium`}>ROAS: {data.roas.toFixed(2)}x</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Investimento</p>
          <p className="text-lg font-semibold text-gray-900">
            R$ {data.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Vendas Geradas</p>
          <p className="text-lg font-semibold text-green-600">
            {data.conversions ? Math.floor(data.conversions).toLocaleString('pt-BR') : '0'} vendas
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return {
      startDate: todayStr,
      endDate: todayStr
    };
  });
  const { data, loading, error, refresh } = useDashboard(filters);

  // Calcular métricas derivadas
  const metrics = useMemo(() => {
    if (!data) return null;

    // Calcular crescimento (mockado por enquanto - idealmente compararia com período anterior)
    const pedidosGrowth = 15.2; // Placeholder
    const vendasGrowth = 18.5; // Placeholder
    const sessoesGrowth = 12.5; // Placeholder

    return {
      pedidos: {
        value: data.pedidos.count,
        growth: pedidosGrowth,
        previousPeriod: "vs. período anterior"
      },
      pedidosRS: {
        value: data.pedidos.valorTotal,
        growth: vendasGrowth,
        previousPeriod: "vs. período anterior"
      },
      pedidosPagos: {
        value: data.pedidos.count, // Por enquanto usando o mesmo valor
        growth: vendasGrowth,
        previousPeriod: "vs. período anterior"
      },
      pedidosPagosRS: {
        value: data.pedidos.valorProdutos,
        growth: vendasGrowth,
        previousPeriod: "vs. período anterior"
      },
      sessoes: {
        value: data.google.clicks + data.facebook.clicks, // Aproximação
        growth: sessoesGrowth,
        previousPeriod: "vs. período anterior"
      }
    };
  }, [data]);

  // Preparar dados para gráficos
  const chartData = useMemo(() => {
    if (!data) return { evolution: [], distribution: [], profitMargin: [] };

    // Dados de evolução ROAS
    const evolution = data.evolution || [];

    // Distribuição de custos
    const total = data.vendasTotais;
    const distribution = [
      { name: 'Produtos', value: ((data.custos.produtos / total) * 100).toFixed(1), color: COLORS.produtos },
      { name: 'Frete', value: ((data.custos.frete / total) * 100).toFixed(1), color: COLORS.frete },
      { name: 'Marketing', value: ((data.custos.anuncios / total) * 100).toFixed(1), color: COLORS.marketing },
      { name: 'Lucro', value: ((data.lucroLiquido / total) * 100).toFixed(1), color: COLORS.lucro }
    ];

    // Evolução de lucro e margem (mockado por enquanto)
    const profitMargin = [
      { month: 'Mês 1', lucro: data.lucroLiquido * 0.7, margem: 15 },
      { month: 'Mês 2', lucro: data.lucroLiquido * 0.8, margem: 17 },
      { month: 'Mês 3', lucro: data.lucroLiquido * 0.9, margem: 18 },
      { month: 'Atual', lucro: data.lucroLiquido, margem: ((data.lucroLiquido / data.vendasTotais) * 100).toFixed(1) }
    ];

    return { evolution, distribution, profitMargin };
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Sem sessão ativa</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">Erro ao carregar dados: {error}</div>
      </div>
    );
  }

  if (!data || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Nenhum dado disponível</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Bem vindo(a)</p>
                <h1 className="text-2xl font-semibold text-gray-900">{session.user?.name || 'Usuário'}</h1>
              </div>
              <button 
                onClick={refresh}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Bem vindo(a)</p>
                <h1 className="text-3xl font-semibold text-gray-900">{session.user?.name || 'Usuário'}</h1>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <DashboardFilters filters={filters} onFilterChange={(newFilters: any) => {
              setFilters(newFilters);
              refresh();
            }} />
          </div>

          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 lg:p-6 mb-6 text-white shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 lg:mb-4">
              <h2 className="text-lg lg:text-2xl font-bold">Dashboard Financeiro</h2>
              <div className="text-xs lg:text-sm text-blue-100 mt-1 lg:mt-0">
                {filters.startDate && filters.endDate 
                  ? `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`
                  : 'Últimos 30 dias'
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:gap-8">
              <div>
                <p className="text-xs lg:text-sm text-blue-100 mb-1">Lucro Líquido</p>
                <p className="text-base lg:text-3xl font-bold break-all">
                  {data.lucroLiquido < 0 ? '-' : ''}R$ {Math.abs(data.lucroLiquido).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-blue-100 mb-1">ROAS Geral</p>
                <p className="text-xl lg:text-3xl font-bold">{data.roasGeral.toFixed(2)}x</p>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
            <MetricCard
              title="Pedidos"
              value={metrics.pedidos.value}
              growth={metrics.pedidos.growth}
              growthLabel={metrics.pedidos.previousPeriod}
              icon={ShoppingCart}
              color="blue"
            />
            <MetricCard
              title="Pedidos"
              value={(metrics.pedidosRS.value / 1000).toFixed(1) + 'k'}
              growth={metrics.pedidosRS.growth}
              growthLabel={metrics.pedidosRS.previousPeriod}
              icon={DollarSign}
              prefix="R$ "
              color="green"
            />
            <MetricCard
              title="Pedidos Pagos"
              value={metrics.pedidosPagos.value}
              growth={metrics.pedidosPagos.growth}
              growthLabel={metrics.pedidosPagos.previousPeriod}
              icon={Package}
              color="purple"
            />
            <MetricCard
              title="Pedidos Pagos R$"
              value={(metrics.pedidosPagosRS.value / 1000).toFixed(1) + 'k'}
              growth={metrics.pedidosPagosRS.growth}
              growthLabel={metrics.pedidosPagosRS.previousPeriod}
              icon={DollarSign}
              prefix="R$ "
              color="orange"
            />
            <div className="col-span-2 lg:col-span-1">
              <MetricCard
                title="Sessões"
                value={metrics.sessoes.value}
                growth={metrics.sessoes.growth}
                growthLabel={metrics.sessoes.previousPeriod}
                icon={Users}
                color="blue"
              />
            </div>
          </div>

          {/* Avisos de produtos sem custo */}
          <PedidosSemCusto />

          {/* Ads Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance por Plataforma</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(!filters.platform || filters.platform === 'all' || filters.platform === 'facebook') && (
                <AdCard platform="Facebook" data={{...data.facebook, conversions: data.facebook.conversions}} />
              )}
              {(!filters.platform || filters.platform === 'all' || filters.platform === 'google') && (
                <AdCard platform="Google" data={{...data.google, conversions: data.google.conversions}} />
              )}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                <h3 className="text-purple-900 font-medium mb-3">Investimento Total</h3>
                <p className="text-2xl lg:text-3xl font-bold text-purple-900 mb-4">
                  R$ {data.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="bg-purple-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-purple-700 text-sm">ROAS Geral</span>
                  <span className="text-xl font-bold text-purple-900">{data.roasGeral.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Costs Cards */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Métricas Financeiras</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Custo Produtos</p>
                <p className="text-lg lg:text-xl font-bold text-gray-900">
                  R$ {(data.custos.produtos / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {((data.custos.produtos / data.vendasTotais) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Custo Frete</p>
                <p className="text-lg lg:text-xl font-bold text-gray-900">
                  R$ {data.pedidos.valorFrete >= 1000 
                    ? (data.pedidos.valorFrete / 1000).toFixed(1) + 'k' 
                    : data.pedidos.valorFrete.toFixed(0)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {((data.pedidos.valorFrete / data.vendasTotais) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Ticket Médio</p>
                <p className="text-lg lg:text-xl font-bold text-gray-900">
                  R$ {data.pedidos.ticketMedio.toFixed(0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Margem</p>
                <p className="text-lg lg:text-xl font-bold text-gray-900">
                  {((data.lucroLiquido / data.vendasTotais) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-xs text-green-700 mb-1">Taxa de Conversão</p>
              <p className="text-xl font-bold text-green-900">
                {((data.pedidos.count / (data.google.clicks + data.facebook.clicks)) * 100).toFixed(2)}%
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs text-blue-700 mb-1">CPA Médio</p>
              <p className="text-xl font-bold text-blue-900">
                R$ {(data.investimentoTotal / data.pedidos.count).toFixed(2)}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <p className="text-xs text-purple-700 mb-1">CPC Médio</p>
              <p className="text-xl font-bold text-purple-900">
                R$ {(data.investimentoTotal / (data.google.clicks + data.facebook.clicks)).toFixed(2)}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-xs text-orange-700 mb-1">ROI</p>
              <p className="text-xl font-bold text-orange-900">
                {((data.lucroLiquido / data.investimentoTotal) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Análises e Gráficos</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* ROAS Evolution Chart */}
              {chartData.evolution.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Evolução ROAS</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData.evolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                        iconSize={12}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="facebook" 
                        stroke="#3B82F6" 
                        name="Facebook"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="google" 
                        stroke="#EA4335" 
                        name="Google"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Cost Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Distribuição de Custos</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {chartData.distribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Dados em tempo real</p>
              <p className="text-blue-700">Os dados são atualizados automaticamente conforme novos registros são recebidos das plataformas.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}