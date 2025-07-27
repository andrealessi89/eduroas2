import { useState, useEffect, useCallback } from 'react';
import { useApiToken } from './useApiToken';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface PedidoItem {
  id: string;
  produtoDerivacaoId: number;
  produtoDerivacaoCodigo: string;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorItem: number;
  custoUnitario: number;
  lucroItem: number;
}

export interface Pedido {
  id: string;
  idPedido: string;
  codigo: string;
  dataHora: string;
  valorProduto: number;
  valorFrete: number;
  valorDesconto: number;
  valorTotal: number;
  pessoaNome: string;
  pessoaEmail: string;
  formaPagamento: string;
  situacao: number;
  situacaoDescricao: string;
  cupomCodigo?: string;
  cupomDesconto: number;
  itens: PedidoItem[];
  statusProcessamento: {
    processado: boolean;
    temErros: boolean;
    produtosSemCusto: Array<{
      codigo: string;
      nome: string;
      quantidade: number;
      valorItem?: number;
    }>;
    custoTotal: number;
    lucroTotal: number;
    margemLucro: number;
    fretePercentual?: number;
  };
  createdAt: string;
}

export interface PedidosTotals {
  count: number;
  valorTotal: number;
  valorFrete: number;
  valorProdutos: number;
  pedidosComErro: number;
}

interface PedidosFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  status?: string;
}

export function usePedidos(filters?: PedidosFilters) {
  const { token, loading: tokenLoading } = useApiToken();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [totals, setTotals] = useState<PedidosTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async (customFilters?: PedidosFilters) => {
    if (!token || tokenLoading) return;

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      const activeFilters = customFilters || filters || {};
      
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
      if (activeFilters.status) params.append('status', activeFilters.status);
      if (activeFilters.limit) params.append('limit', activeFilters.limit.toString());
      if (activeFilters.offset) params.append('offset', activeFilters.offset.toString());
      
      const response = await api.pedidos.list({ 
        url: `/pedidos?${params.toString()}` 
      }, token);
      
      if (response.success) {
        setPedidos(response.data || []);
        setTotals(response.totals || null);
      } else {
        throw new Error(response.error || 'Erro ao buscar pedidos');
      }
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar pedidos';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token, tokenLoading, filters]);

  const fetchPedidoById = async (id: string): Promise<Pedido | null> => {
    if (!token) return null;

    try {
      const response = await api.pedidos.get(id, token);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao buscar pedido');
      }
    } catch (err: any) {
      const message = err.message || 'Erro ao buscar pedido';
      toast.error(message);
      return null;
    }
  };

  const reprocessarCustos = async (pedidoId: string) => {
    if (!token) return;

    try {
      const response = await api.pedidos.reprocessarCustos(pedidoId, token);
      
      if (response.success) {
        toast.success('Custos reprocessados com sucesso');
        
        // Atualizar o pedido específico na lista
        const pedidoAtualizado = await fetchPedidoById(pedidoId);
        if (pedidoAtualizado) {
          setPedidos(prev => prev.map(p => p.id === pedidoId ? pedidoAtualizado : p));
        }
        
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao reprocessar custos');
      }
    } catch (err: any) {
      const message = err.message || 'Erro ao reprocessar custos';
      toast.error(message);
      throw err;
    }
  };

  const refresh = useCallback(() => {
    return fetchPedidos();
  }, [fetchPedidos]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  return {
    pedidos,
    totals,
    loading: loading || tokenLoading,
    error,
    refresh,
    fetchPedidos,
    fetchPedidoById,
    reprocessarCustos,
  };
}