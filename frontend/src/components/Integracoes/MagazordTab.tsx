"use client";

import { useState, useEffect } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { Save, ShoppingBag, CheckCircle, AlertCircle } from "lucide-react";

interface MagazordIntegration {
  id: string;
  tipo: string;
  nome: string;
  config: {
    user: string;
    hasKey: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MagazordTab() {
  const { apiCall } = useApiToken();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [integration, setIntegration] = useState<MagazordIntegration | null>(null);
  const [formData, setFormData] = useState({
    user: "",
    key: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar integração existente
  const fetchIntegration = async () => {
    setLoading(true);
    try {
      const response = await apiCall<{ success: boolean; data: MagazordIntegration[] }>("/integracoes");
      if (response.success && response.data) {
        const magazordIntegration = response.data.find((int) => int.tipo === "magazord");
        if (magazordIntegration) {
          setIntegration(magazordIntegration);
          setFormData({
            user: magazordIntegration.config.user,
            key: "", // Não exibimos a chave por segurança
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar integração:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegration();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const response = await apiCall<{ success: boolean; data: MagazordIntegration }>(
        "/integracoes/magazord",
        {
          method: "POST",
          body: JSON.stringify({
            user: formData.user,
            key: formData.key,
          }),
        }
      );

      if (response.success) {
        setMessage({ type: "success", text: "Integração salva com sucesso!" });
        setIntegration(response.data);
        setFormData({ ...formData, key: "" }); // Limpar a chave após salvar
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao salvar integração",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-6 h-6 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Integração Magazord</h3>
        </div>
        <p className="text-sm text-gray-600">
          Configure as credenciais de acesso para integrar com sua loja Magazord e receber pedidos automaticamente.
        </p>
      </div>

      {/* Status da integração */}
      {integration && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Integração configurada</p>
            <p className="text-sm text-green-700 mt-1">
              Última atualização: {new Date(integration.updatedAt).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg flex items-start ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            />
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
            Usuário da API
          </label>
          <input
            type="text"
            id="user"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o usuário da API do Magazord"
            required
          />
        </div>

        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
            Chave da API
          </label>
          <input
            type="password"
            id="key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={integration ? "Digite uma nova chave para atualizar" : "Digite a chave da API"}
            required={!integration}
          />
          {integration && (
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para manter a chave atual
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Salvar Configurações"}</span>
          </button>
        </div>
      </form>

      {/* Informações adicionais */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Como obter as credenciais?</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Acesse o painel administrativo do Magazord</li>
          <li>Vá em Configurações → API → Chaves de Acesso</li>
          <li>Crie uma nova chave ou use uma existente</li>
          <li>Copie o usuário e a chave gerados</li>
        </ol>
      </div>
    </div>
  );
}