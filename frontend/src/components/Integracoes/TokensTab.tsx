"use client";

import { useState, useEffect } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ApiToken {
  id: string;
  name: string;
  token?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TokensTab() {
  const { apiCall, loading: tokenLoading } = useApiToken();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<ApiToken | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar tokens existentes
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await apiCall<{ success: boolean; data: ApiToken[] }>("/integracoes/tokens");
      if (response.success && response.data) {
        setTokens(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch tokens after the auth token is loaded
    if (!tokenLoading) {
      fetchTokens();
    }
  }, [tokenLoading]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const response = await apiCall<{ success: boolean; data: ApiToken }>(
        "/integracoes/generate-token",
        {
          method: "POST",
          body: JSON.stringify({ name: newTokenName }),
        }
      );

      if (response.success && response.data) {
        setNewToken(response.data);
        setNewTokenName("");
        await fetchTokens();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao gerar token",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleTokenStatus = async (id: string, isActive: boolean) => {
    try {
      const endpoint = isActive
        ? `/integracoes/tokens/${id}/deactivate`
        : `/integracoes/tokens/${id}/activate`;

      const response = await apiCall<{ success: boolean }>(endpoint, {
        method: "PATCH",
      });

      if (response.success) {
        await fetchTokens();
        setMessage({
          type: "success",
          text: isActive ? "Token desativado com sucesso" : "Token ativado com sucesso",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao alterar status do token",
      });
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewToken(null);
    setNewTokenName("");
  };

  if (loading || tokenLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando tokens...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Tokens da API</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie os tokens de acesso para integração com a API do sistema
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Token</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-start ${
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

      {/* Lista de tokens */}
      {tokens.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum token criado</h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro token para começar a usar a API
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Token</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{token.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        token.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {token.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(token.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleTokenStatus(token.id, token.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          token.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={token.isActive ? "Desativar" : "Ativar"}
                      >
                        {token.isActive ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Novo Token</h3>

              {!newToken ? (
                <form onSubmit={handleCreateToken}>
                  <div className="mb-4">
                    <label
                      htmlFor="tokenName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome do Token
                    </label>
                    <input
                      type="text"
                      id="tokenName"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Integração E-commerce"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use um nome descritivo para identificar onde o token será usado
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {creating ? "Criando..." : "Criar Token"}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Token criado com sucesso!
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Copie o token abaixo. Ele não será mostrado novamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seu novo token
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newToken.token || ""}
                        readOnly
                        className="w-full px-3 py-2 pr-10 border rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(newToken.token || "", newToken.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedId === newToken.id ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Guarde este token em um local seguro. Por questões de segurança, ele não
                        poderá ser visualizado novamente.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informações de uso */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Como usar os tokens?</h4>
        <p className="text-sm text-gray-600 mb-2">
          Use o token no header Authorization das suas requisições:
        </p>
        <div className="bg-gray-800 text-gray-300 rounded p-3 font-mono text-xs">
          Authorization: Bearer SEU_TOKEN_AQUI
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Exemplo de endpoint: POST /pedidos/webhook
        </p>
      </div>
    </div>
  );
}