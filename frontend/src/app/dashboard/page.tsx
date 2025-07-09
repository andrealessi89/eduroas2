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
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={filters.startDate || thirtyDaysAgo.toISOString().split('T')[0]}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-gray-500">até</span>
          <input
            type="date"
            value={filters.endDate || today.toISOString().split('T')[0]}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filters.platform || 'all'}
            onChange={(e) => onFilterChange({ ...filters, platform: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">Todas as plataformas</option>
            <option value="google">Google Ads</option>
            <option value="facebook">Facebook Ads</option>
          </select>
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
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
          </p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{growth.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">{growthLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdCard({ platform, data }: any) {
  const Icon = platform === 'Facebook' ? 'f' : 'G';
  const bgColor = platform === 'Facebook' ? 'bg-blue-500' : 'bg-red-500';
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg ${bgColor} text-white flex items-center justify-center font-bold mr-3`}>
            {Icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900">{platform} Ads</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{data.roas.toFixed(2)}x</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Investimento</span>
          <span className="text-sm font-medium text-gray-900">
            R$ {data.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Vendas Geradas</span>
          <span className="text-sm font-medium text-green-600">
            R$ {data.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [filters, setFilters] = useState({});
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
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <DashboardFilters filters={filters} onFilterChange={setFilters} />

        {/* Header Section */}
        <div className="bg-blue-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Financeiro e Performance</h2>
          <p className="text-blue-100">
            {filters.startDate && filters.endDate 
              ? `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`
              : 'Últimos 30 dias'
            } • {filters.platform === 'all' || !filters.platform ? 'Todas as plataformas' : filters.platform}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-8">
              <div>
                <p className="text-sm text-blue-100">Lucro Líquido</p>
                <p className="text-3xl font-bold text-white">
                  R$ {data.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-100">ROAS Geral</p>
                <p className="text-3xl font-bold text-white">{data.roasGeral.toFixed(2)}x</p>
              </div>
            </div>
            <button 
              onClick={refresh}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Pedidos"
            value={metrics.pedidos.value}
            growth={metrics.pedidos.growth}
            growthLabel={metrics.pedidos.previousPeriod}
            icon={ShoppingCart}
            color="blue"
          />
          <MetricCard
            title="Pedidos R$"
            value={metrics.pedidosRS.value}
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
            value={metrics.pedidosPagosRS.value}
            growth={metrics.pedidosPagosRS.growth}
            growthLabel={metrics.pedidosPagosRS.previousPeriod}
            icon={DollarSign}
            prefix="R$ "
            color="orange"
          />
          <MetricCard
            title="Sessões"
            value={metrics.sessoes.value}
            growth={metrics.sessoes.growth}
            growthLabel={metrics.sessoes.previousPeriod}
            icon={Users}
            color="blue"
          />
        </div>

        {/* Ads Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(!filters.platform || filters.platform === 'all' || filters.platform === 'facebook') && (
            <AdCard platform="Facebook" data={data.facebook} />
          )}
          {(!filters.platform || filters.platform === 'all' || filters.platform === 'google') && (
            <AdCard platform="Google" data={data.google} />
          )}
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Investimento Total em Anúncios</h3>
            <p className="text-3xl font-bold text-purple-600 mb-4">
              R$ {data.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="text-right">
              <p className="text-sm text-gray-600">ROAS Geral</p>
              <p className="text-2xl font-bold text-purple-600">{data.roasGeral.toFixed(2)}x</p>
            </div>
          </div>
        </div>

        {/* Costs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Custo dos Produtos</h3>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              R$ {data.custos.produtos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({((data.custos.produtos / data.vendasTotais) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Custo do Frete</h3>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              R$ {data.pedidos.valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({((data.pedidos.valorFrete / data.vendasTotais) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Ticket Médio</h3>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              R$ {data.pedidos.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-green-600">
              {((data.pedidos.count / (data.google.clicks + data.facebook.clicks)) * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">CPA Médio</h3>
            <p className="text-2xl font-bold text-gray-900">
              R$ {(data.investimentoTotal / data.pedidos.count).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">CPC Médio</h3>
            <p className="text-2xl font-bold text-gray-900">
              R$ {(data.investimentoTotal / (data.google.clicks + data.facebook.clicks)).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Margem de Lucro</h3>
            <p className="text-2xl font-bold text-blue-600">
              {((data.lucroLiquido / data.vendasTotais) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* ROAS Evolution Chart */}
          {chartData.evolution.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução ROAS por Plataforma</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.evolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="facebook" 
                    stroke="#3B82F6" 
                    name="Facebook"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="google" 
                    stroke="#EA4335" 
                    name="Google"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Cost Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Custos e Lucro</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={chartData.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {chartData.distribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dados em tempo real</p>
            <p>Os dados são atualizados automaticamente conforme novos registros são recebidos das plataformas.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}