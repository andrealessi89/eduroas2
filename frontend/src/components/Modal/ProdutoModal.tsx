"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Produto } from "@/hooks/useProdutos";

interface ProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; sku: string; custo: number }) => Promise<void>;
  produto?: Produto | null;
  mode: "create" | "edit";
}

export default function ProdutoModal({
  isOpen,
  onClose,
  onSave,
  produto,
  mode,
}: ProdutoModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    custo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (produto && mode === "edit") {
      setFormData({
        nome: produto.nome,
        sku: produto.sku,
        custo: produto.custo.toString(),
      });
    } else {
      setFormData({
        nome: "",
        sku: "",
        custo: "",
      });
    }
  }, [produto, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        nome: formData.nome,
        sku: formData.sku,
        custo: parseFloat(formData.custo),
      };

      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Novo Produto" : "Editar Produto"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome do Produto
            </label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="sku"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SKU
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={mode === "edit"}
            />
            {mode === "edit" && (
              <p className="text-xs text-gray-500 mt-1">
                SKU não pode ser alterado
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="custo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Custo (R$)
            </label>
            <input
              type="number"
              id="custo"
              value={formData.custo}
              onChange={(e) =>
                setFormData({ ...formData, custo: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}