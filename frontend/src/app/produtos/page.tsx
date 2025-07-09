"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import ProdutoModal from "@/components/Modal/ProdutoModal";
import { useProdutos, Produto } from "@/hooks/useProdutos";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  AlertCircle,
} from "lucide-react";

export default function ProdutosPage() {
  const { data: session, status } = useSession();
  const {
    produtos,
    loading,
    error,
    createProduto,
    updateProduto,
    deleteProduto,
    refresh,
  } = useProdutos();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtrar produtos
  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setModalMode("create");
    setSelectedProduto(null);
    setModalOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    setModalMode("edit");
    setSelectedProduto(produto);
    setModalOpen(true);
  };

  const handleSave = async (data: {
    nome: string;
    sku: string;
    custo: number;
  }) => {
    if (modalMode === "create") {
      await createProduto(data);
    } else if (selectedProduto) {
      await updateProduto(selectedProduto.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduto(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
    }
  };

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
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produtos</h1>
          <p className="text-gray-600">
            Gerencie seus produtos e seus custos para cálculo preciso do lucro
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={refresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Produto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center text-gray-500">Carregando produtos...</div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center text-red-600">Erro: {error}</div>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? "Nenhum produto encontrado"
                  : "Nenhum produto cadastrado"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Tente buscar com outros termos"
                  : "Comece adicionando seu primeiro produto"}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Produto</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Custo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atualizado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProdutos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {produto.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {produto.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          R$ {produto.custo.toFixed(2).replace(".", ",")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(produto.updatedAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(produto)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {deleteConfirm === produto.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(produto.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(produto.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
              {filteredProdutos.length}{" "}
              {filteredProdutos.length === 1 ? "produto" : "produtos"}{" "}
              {searchTerm && "encontrado(s)"}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Importante sobre SKUs</p>
            <p>
              O SKU deve ser exatamente igual ao usado no seu e-commerce para
              que o cálculo de custo funcione corretamente.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProdutoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        produto={selectedProduto}
        mode={modalMode}
      />
    </DashboardLayout>
  );
}