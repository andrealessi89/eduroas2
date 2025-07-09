import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useApiToken } from './useApiToken';

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  custo: number;
  createdAt: string;
  updatedAt: string;
}

export function useProdutos() {
  const { token, loading: tokenLoading } = useApiToken();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.produtos.list(token);
      setProdutos(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tokenLoading && token) {
      fetchProdutos();
    }
  }, [token, tokenLoading]);

  const createProduto = async (data: { nome: string; sku: string; custo: number }) => {
    if (!token) throw new Error('No token available');
    
    try {
      const result = await api.produtos.create(data, token);
      setProdutos([...produtos, result.data]);
      return result.data;
    } catch (err) {
      throw err;
    }
  };

  const updateProduto = async (id: string, data: Partial<{ nome: string; sku: string; custo: number }>) => {
    if (!token) throw new Error('No token available');
    
    try {
      const result = await api.produtos.update(id, data, token);
      setProdutos(produtos.map(p => p.id === id ? result.data : p));
      return result.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduto = async (id: string) => {
    if (!token) throw new Error('No token available');
    
    try {
      await api.produtos.delete(id, token);
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    produtos,
    loading: loading || tokenLoading,
    error,
    createProduto,
    updateProduto,
    deleteProduto,
    refresh: fetchProdutos,
  };
}