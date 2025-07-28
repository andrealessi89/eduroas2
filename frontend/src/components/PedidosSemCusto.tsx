'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProdutoSemCusto {
  produtoDerivacaoCodigo: string;
  produtoNome: string;
  quantidade: number;
  valorItem: number;
}

interface PedidoSemCusto {
  id: string;
  codigo: string;
  dataHora: string;
  valorTotal: number;
  produtosSemCusto: ProdutoSemCusto[];
}

export default function PedidosSemCusto() {
  const { data: session } = useSession();
  const [pedidos, setPedidos] = useState<PedidoSemCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState<string | null>(null);

  const fetchPedidosSemCusto = async () => {
    if (!session?.user?.token) return;
    
    try {
      setLoading(true);
      const response = await api.pedidos.semCusto(session.user.token);
      if (response.success) {
        setPedidos(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos sem custo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidosSemCusto();
  }, [session]);

  const handleReprocessar = async (pedidoId: string) => {
    if (!session?.user?.token) return;
    
    try {
      setReprocessing(pedidoId);
      const response = await api.pedidos.reprocessarCustos(pedidoId, session.user.token);
      
      if (response.success) {
        alert(`Custos reprocessados com sucesso! ${response.data.itensAtualizados} itens atualizados.`);
        // Recarregar a lista
        await fetchPedidosSemCusto();
      }
    } catch (error) {
      console.error('Erro ao reprocessar custos:', error);
      alert('Erro ao reprocessar custos');
    } finally {
      setReprocessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-yellow-600 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Pedidos com Produtos sem Custo
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            {pedidos.length} pedido(s) com produtos sem custo cadastrado na Magazord. 
            Atualize os custos na Magazord e clique em reprocessar.
          </p>
          
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Pedido #{pedido.codigo}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(pedido.dataHora).toLocaleDateString('pt-BR')} - 
                      R$ {pedido.valorTotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReprocessar(pedido.id)}
                    disabled={reprocessing === pedido.id}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={reprocessing === pedido.id ? 'animate-spin' : ''} />
                    <span>Reprocessar</span>
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Produtos sem custo:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {pedido.produtosSemCusto.map((produto, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {produto.produtoDerivacaoCodigo} - {produto.produtoNome} 
                          ({produto.quantidade}x)
                        </span>
                        <span>R$ {produto.valorItem.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}