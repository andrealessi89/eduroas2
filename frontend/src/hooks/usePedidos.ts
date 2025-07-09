import { useState, useEffect } from 'react';
import { useApiToken } from './useApiToken';
import { api } from '@/lib/api';

export interface Pedido {
  id: string;
  codigo: string;
  pessoaNome: string;
  pessoaEmail: string;
  valorTotal: number;
  situacao: number;
  situacaoDescricao: string;
  createdAt: string;
}

interface PedidosFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export function usePedidos(filters?: PedidosFilters) {
  const { token, loading: tokenLoading } = useApiToken();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = async () => {
    if (!token || tokenLoading) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await api.pedidos.list({
        ...filters,
        limit: filters?.limit || 10,
      }, token);
      
      setPedidos(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [token, tokenLoading, filters?.startDate, filters?.endDate]);

  return {
    pedidos,
    loading: loading || tokenLoading,
    error,
    refresh: fetchPedidos,
  };
}