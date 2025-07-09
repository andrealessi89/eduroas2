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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            type="date"
            value={filters.startDate || thirtyDaysAgo.toISOString().split('T')[0]}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="bg-transparent text-xs lg:text-sm outline-none w-28 lg:w-auto"
          />
          <span className="text-gray-400 text-xs lg:text-sm">até</span>
          <input
            type="date"
            value={filters.endDate || today.toISOString().split('T')[0]}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="bg-transparent text-xs lg:text-sm outline-none w-28 lg:w-auto"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={filters.platform || 'all'}
            onChange={(e) => onFilterChange({ ...filters, platform: e.target.value })}
            className="bg-transparent text-xs lg:text-sm outline-none"
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
  const Icon = platform === 'Facebook' ? '📘' : '🔍';
  const bgColor = platform === 'Facebook' ? 'bg-blue-100' : 'bg-red-100';
  const textColor = platform === 'Facebook' ? 'text-blue-600' : 'text-red-600';
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center text-2xl`}>
            {Icon}
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
            R$ {data.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
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
              <button 
                onClick={refresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Sincronizar Dados
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <DashboardFilters filters={filters} onFilterChange={setFilters} />
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
              title="Pedidos R$"
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

          {/* Ads Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance por Plataforma</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(!filters.platform || filters.platform === 'all' || filters.platform === 'facebook') && (
                <AdCard platform="Facebook" data={data.facebook} />
              )}
              {(!filters.platform || filters.platform === 'all' || filters.platform === 'google') && (
                <AdCard platform="Google" data={data.google} />
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
                  R$ {(data.pedidos.valorFrete / 1000).toFixed(0)}k
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