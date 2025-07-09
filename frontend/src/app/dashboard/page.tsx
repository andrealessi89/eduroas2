"use client";

import { useSession } from "next-auth/react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  PieChart,
  AlertCircle
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

// Dados mockados
const mockData = {
  metrics: {
    pedidos: { value: 4250, growth: 15.2, previousPeriod: "vs. período anterior" },
    pedidosRS: { value: 425000.00, growth: 18.5, previousPeriod: "vs. período anterior" },
    pedidosPagos: { value: 3825, growth: 22.1, previousPeriod: "vs. período anterior" },
    pedidosPagosRS: { value: 382500.00, growth: 22.3, previousPeriod: "vs. período anterior" },
    sessoes: { value: 125000, growth: 12.5, previousPeriod: "vs. período anterior" }
  },
  ads: {
    facebook: {
      investimento: 28500.00,
      vendasGeradas: 88350.00,
      roas: 3.10
    },
    google: {
      investimento: 42000.00,
      vendasGeradas: 176400.00,
      roas: 4.20
    },
    totalInvestimento: 70500.00,
    roasGeral: 5.43
  },
  costs: {
    custoProdutos: { value: 153000.00, percentage: 40.0 },
    custoFrete: { value: 19125.00, percentage: 5.0 },
    ticketMedio: { value: 100.00 }
  },
  taxes: {
    conversaoReal: 3.40,
    cpa: 18.43,
    cps: 0.564
  },
  sales: {
    contribuicaoVenda: {
      value: 161797.50,
      percentage: 42.3,
      roiVenda: 229.5,
      roiTotal: 108.2
    },
    lucroLiquido: {
      value: 76297.50,
      margem: 19.9
    }
  },
  expenses: {
    taxasDescontos: {
      magazord: 8885.00,
      pagamento: 22950.00,
      impostos: 18742.50,
      custoFixo: 15000.00,
      total: 63577.50
    }
  }
};

// Dados para os gráficos
const roasChartData = [
  { month: 'Jan', facebook: 2.8, google: 3.5 },
  { month: 'Fev', facebook: 3.0, google: 3.8 },
  { month: 'Mar', facebook: 3.2, google: 4.0 },
  { month: 'Abr', facebook: 2.9, google: 4.1 },
  { month: 'Mai', facebook: 3.1, google: 4.2 },
  { month: 'Jun', facebook: 3.1, google: 4.2 }
];

const custosDistribuicao = [
  { name: 'Produtos', value: 40.0, color: '#F59E0B' },
  { name: 'Frete', value: 5.0, color: '#EF4444' },
  { name: 'Taxas', value: 12.7, color: '#8B5CF6' },
  { name: 'Marketing', value: 18.4, color: '#3B82F6' },
  { name: 'Lucro', value: 19.9, color: '#10B981' }
];

const COLORS = {
  produtos: '#F59E0B',
  frete: '#EF4444',
  taxas: '#8B5CF6',
  marketing: '#3B82F6',
  lucro: '#10B981'
};

const lucroMargemData = [
  { month: 'Jan', lucro: 65000, margem: 17 },
  { month: 'Fev', lucro: 70000, margem: 18 },
  { month: 'Mar', lucro: 72000, margem: 18.5 },
  { month: 'Abr', lucro: 75000, margem: 19 },
  { month: 'Mai', lucro: 76000, margem: 19.5 },
  { month: 'Jun', lucro: 76297, margem: 19.9 }
];

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
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
          </p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{growth}%
            </span>
            <span className="text-xs text-gray-500 ml-1">{growthLabel}</span>
          </div>
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
          <p className="text-2xl font-bold text-gray-900">{data.roas}x</p>
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
            R$ {data.vendasGeradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  R
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">ROAS Manager</h1>
                  <p className="text-xs text-gray-500">Analytics & Performance</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-blue-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Financeiro e Performance</h2>
          <p className="text-blue-100">Últimos 30 dias • Todas as plataformas</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-8">
              <div>
                <p className="text-sm text-blue-100">Lucro Líquido</p>
                <p className="text-3xl font-bold text-white">R$ 76.297,50</p>
              </div>
              <div>
                <p className="text-sm text-blue-100">ROI Empresa</p>
                <p className="text-3xl font-bold text-white">108,2%</p>
              </div>
            </div>
            <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Sincronizar
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Pedidos"
            value={mockData.metrics.pedidos.value}
            growth={mockData.metrics.pedidos.growth}
            growthLabel={mockData.metrics.pedidos.previousPeriod}
            icon={ShoppingCart}
            color="blue"
          />
          <MetricCard
            title="Pedidos R$"
            value={mockData.metrics.pedidosRS.value}
            growth={mockData.metrics.pedidosRS.growth}
            growthLabel={mockData.metrics.pedidosRS.previousPeriod}
            icon={DollarSign}
            prefix="R$ "
            color="green"
          />
          <MetricCard
            title="Pedidos Pagos"
            value={mockData.metrics.pedidosPagos.value}
            growth={mockData.metrics.pedidosPagos.growth}
            growthLabel={mockData.metrics.pedidosPagos.previousPeriod}
            icon={Package}
            color="purple"
          />
          <MetricCard
            title="Pedidos Pagos R$"
            value={mockData.metrics.pedidosPagosRS.value}
            growth={mockData.metrics.pedidosPagosRS.growth}
            growthLabel={mockData.metrics.pedidosPagosRS.previousPeriod}
            icon={DollarSign}
            prefix="R$ "
            color="orange"
          />
          <MetricCard
            title="Sessões"
            value={mockData.metrics.sessoes.value}
            growth={mockData.metrics.sessoes.growth}
            growthLabel={mockData.metrics.sessoes.previousPeriod}
            icon={Users}
            color="blue"
          />
        </div>

        {/* Ads Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <AdCard platform="Facebook" data={mockData.ads.facebook} />
          <AdCard platform="Google" data={mockData.ads.google} />
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Investimento Total em Anúncios</h3>
            <p className="text-3xl font-bold text-purple-600 mb-4">
              R$ {mockData.ads.totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="text-right">
              <p className="text-sm text-gray-600">ROAS Geral</p>
              <p className="text-2xl font-bold text-purple-600">{mockData.ads.roasGeral}x</p>
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
              R$ {mockData.costs.custoProdutos.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-gray-600 ml-2">({mockData.costs.custoProdutos.percentage}%)</span>
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
              R$ {mockData.costs.custoFrete.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-gray-600 ml-2">({mockData.costs.custoFrete.percentage}%)</span>
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
              R$ {mockData.costs.ticketMedio.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Tax and CPA/CPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Taxa de Conversão Real</h3>
            <p className="text-2xl font-bold text-green-600">{mockData.taxes.conversaoReal}%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">CPA - Custo por Aquisição</h3>
            <p className="text-2xl font-bold text-gray-900">R$ {mockData.taxes.cpa}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">CPS - Custo por Sessão</h3>
            <p className="text-2xl font-bold text-gray-900">R$ {mockData.taxes.cps}</p>
          </div>
        </div>

        {/* Sales and Profit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Contribuição de Venda
            </h3>
            <p className="text-sm text-gray-600 mb-2">Contribuição R$</p>
            <p className="text-3xl font-bold text-green-600 mb-4">
              R$ {mockData.sales.contribuicaoVenda.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">% Contribuição</p>
                <p className="font-semibold text-gray-900">{mockData.sales.contribuicaoVenda.percentage}%</p>
              </div>
              <div>
                <p className="text-gray-600">ROI Venda</p>
                <p className="font-semibold text-gray-900">{mockData.sales.contribuicaoVenda.roiVenda}%</p>
              </div>
              <div>
                <p className="text-gray-600">ROI Total</p>
                <p className="font-semibold text-gray-900">{mockData.sales.contribuicaoVenda.roiTotal}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Lucro Líquido Final
            </h3>
            <p className="text-sm text-gray-600 mb-2">Lucro Líquido</p>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              R$ {mockData.sales.lucroLiquido.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">% Margem</p>
                <p className="font-semibold text-gray-900">{mockData.sales.lucroLiquido.margem}%</p>
              </div>
              <div>
                <p className="text-gray-600">ROI Total</p>
                <p className="font-semibold text-gray-900">{mockData.sales.contribuicaoVenda.roiTotal}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taxes and Discounts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Taxas e Descontos</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Magazord (1.8%)</p>
              <p className="font-semibold text-gray-900">
                R$ {mockData.expenses.taxasDescontos.magazord.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pagamento (6%)</p>
              <p className="font-semibold text-gray-900">
                R$ {mockData.expenses.taxasDescontos.pagamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Impostos (4.9%)</p>
              <p className="font-semibold text-gray-900">
                R$ {mockData.expenses.taxasDescontos.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Fixo</p>
              <p className="font-semibold text-gray-900">
                R$ {mockData.expenses.taxasDescontos.custoFixo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-semibold text-gray-900">
                R$ {mockData.expenses.taxasDescontos.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* ROAS Evolution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução ROAS por Plataforma</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roasChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Facebook</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Google</span>
              </div>
            </div>
          </div>

          {/* Cost Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Custos e Lucro</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={custosDistribuicao}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {custosDistribuicao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {custosDistribuicao.map((item, index) => (
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

        {/* Profit and Margin Evolution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução de Lucro e Margem</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lucroMargemData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="lucro" 
                fill="#10B981" 
                name="Lucro (R$)"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="margem" 
                stroke="#8B5CF6" 
                name="Margem (%)"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Precisa de ajuda?</p>
            <p>Acesse nossa central de suporte ou entre em contato.</p>
          </div>
        </div>
      </div>
    </div>
  );
}