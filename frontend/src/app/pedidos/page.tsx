"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ResponsiveLayout from "@/components/Layout/ResponsiveLayout";
import PedidoModal from "@/components/Modal/PedidoModal";
import { usePedidos } from "@/hooks/usePedidos";
import {
  Search,
  RefreshCw,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  Eye,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PedidosPage() {
  const { data: session, status } = useSession();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "com-erro" | "sem-erro">("todos");
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  
  const {
    pedidos,
    loading,
    error,
    totals,
    refresh,
    reprocessarCustos,
    fetchPedidos,
  } = usePedidos();

  // Buscar pedidos ao montar o componente e quando os filtros mudarem
  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      fetchPedidos({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      });
    }
  }, [dateFilter.startDate, dateFilter.endDate, fetchPedidos]);

  // Filtrar pedidos localmente (busca e status)
  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch = 
      searchTerm === "" || 
      pedido.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.pessoaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.pessoaEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "todos" ||
      (statusFilter === "com-erro" && pedido.statusProcessamento.temErros) ||
      (statusFilter === "sem-erro" && !pedido.statusProcessamento.temErros);

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (pedido: any) => {
    setSelectedPedido(pedido);
    setModalOpen(true);
  };

  const handleReprocessar = async (pedidoId: string) => {
    setReprocessingId(pedidoId);
    try {
      await reprocessarCustos(pedidoId);
      await refresh();
    } finally {
      setReprocessingId(null);
    }
  };

  const getSituacaoBadge = (situacao: number, descricao: string) => {
    const badges: Record<number, { color: string; icon: any }> = {
      4: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      3: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      5: { color: "bg-blue-100 text-blue-800", icon: Package },
    };

    const badge = badges[situacao] || { color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {descricao}
      </span>
    );
  };

  const getStatusBadge = (temErros: boolean) => {
    if (temErros) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Com Erros
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Processado
      </span>
    );
  };

  const getMargemColor = (margem: number) => {
    if (margem < 20) return "text-red-600";
    if (margem < 30) return "text-yellow-600";
    return "text-green-600";
  };

  if (status === "loading") {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm md:text-base text-gray-600">
            Gerencie seus pedidos e acompanhe o status de processamento
          </p>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totals?.count || 0}</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(totals?.valorTotal || 0)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency((totals?.valorTotal || 0) / (totals?.count || 1))}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos com Erro</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {totals?.pedidosComErro || 0}
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* Filtros e busca */}
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Busca */}
                <div className="relative md:col-span-2">
                  <input
                    type="text"
                    placeholder="Buscar por código, nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Filtro de status */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="sem-erro">Processados</option>
                    <option value="com-erro">Com Erros</option>
                  </select>
                </div>

                {/* Data início */}
                <div>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Data fim */}
                <div>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Botão refresh */}
              <div className="flex justify-end">
                <button
                  onClick={() => fetchPedidos({
                    startDate: dateFilter.startDate,
                    endDate: dateFilter.endDate,
                  })}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de pedidos */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lucro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Situação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && !filteredPedidos.length ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPedidos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredPedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{pedido.codigo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(pedido.dataHora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pedido.pessoaNome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pedido.pessoaEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(pedido.valorTotal)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Frete: {formatCurrency(pedido.valorFrete)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(pedido.statusProcessamento.lucroTotal)}
                            </div>
                            <div className={`text-xs font-medium ${getMargemColor(pedido.statusProcessamento.margemLucro)}`}>
                              {pedido.statusProcessamento.margemLucro.toFixed(1)}% margem
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSituacaoBadge(pedido.situacao, pedido.situacaoDescricao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(pedido.statusProcessamento.temErros)}
                          {pedido.statusProcessamento.temErros && (
                            <div className="text-xs text-red-600 mt-1">
                              {pedido.statusProcessamento.produtosSemCusto.length} produto(s)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(pedido)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Ver detalhes"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {pedido.statusProcessamento.temErros && (
                              <button
                                onClick={() => handleReprocessar(pedido.id)}
                                disabled={reprocessingId === pedido.id}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                                title="Reprocessar custos"
                              >
                                <RotateCcw 
                                  className={`h-5 w-5 ${reprocessingId === pedido.id ? 'animate-spin' : ''}`} 
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de detalhes */}
          {modalOpen && selectedPedido && (
            <PedidoModal
              pedido={selectedPedido}
              isOpen={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setSelectedPedido(null);
              }}
              onReprocessar={() => handleReprocessar(selectedPedido.id)}
            />
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}