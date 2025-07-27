"use client";

import { useState, useEffect } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import {
  Facebook,
  Plus,
  Save,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

interface AdAccount {
  id: string;
  name: string;
  status: number;
  balance: string;
  currency: string;
  spendCap: string;
}

interface MetaAdsConfig {
  name: string;
  accessToken: string;
  adAccounts?: AdAccount[];
  selectedAccounts?: string[];
}

interface MetaAdsIntegration {
  id: string;
  nome: string;
  config: MetaAdsConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MetaAdsTab() {
  const { apiCall, loading: tokenLoading } = useApiToken();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [integrations, setIntegrations] = useState<MetaAdsIntegration[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<MetaAdsIntegration | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MetaAdsConfig>({
    name: "",
    accessToken: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Buscar integrações existentes
  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await apiCall<{ success: boolean; data: any[] }>("/integracoes/meta");
      
      if (response.success && response.data) {
        setIntegrations(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar integrações Meta Ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tokenLoading) {
      fetchIntegrations();
    }
  }, [tokenLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!formData.name || !formData.accessToken) {
      setMessage({
        type: "error",
        text: "Por favor, preencha todos os campos",
      });
      setSaving(false);
      return;
    }

    try {
      const endpoint = editingId ? `/integracoes/meta/${editingId}` : "/integracoes/meta";
      const method = editingId ? "PUT" : "POST";

      const response = await apiCall<{ success: boolean; data: MetaAdsIntegration }>(
        endpoint,
        {
          method,
          body: JSON.stringify(formData),
        }
      );

      if (response.success) {
        setMessage({
          type: "success",
          text: editingId ? "Integração atualizada com sucesso!" : "Integração criada com sucesso!",
        });
        setShowModal(false);
        setEditingId(null);
        setFormData({
          name: "",
          accessToken: "",
        });
        await fetchIntegrations();
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

  const handleEdit = (integration: MetaAdsIntegration) => {
    setEditingId(integration.id);
    setFormData({
      name: integration.config.name || integration.nome,
      accessToken: integration.config.accessToken || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta integração?")) {
      return;
    }

    try {
      const response = await apiCall<{ success: boolean }>(
        `/integracoes/meta/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        setMessage({
          type: "success",
          text: "Integração excluída com sucesso!",
        });
        await fetchIntegrations();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao excluir integração",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      accessToken: "",
    });
  };

  const handleManageAccounts = (integration: MetaAdsIntegration) => {
    setSelectedIntegration(integration);
    setSelectedAccounts(integration.config.selectedAccounts || []);
    setShowAccountsModal(true);
  };

  const handleSaveSelectedAccounts = async () => {
    if (!selectedIntegration) return;

    try {
      const response = await apiCall<{ success: boolean }>(
        `/integracoes/meta/${selectedIntegration.id}/accounts`,
        {
          method: "PATCH",
          body: JSON.stringify({ selectedAccounts }),
        }
      );

      if (response.success) {
        setMessage({
          type: "success",
          text: "Contas selecionadas atualizadas com sucesso!",
        });
        setShowAccountsModal(false);
        await fetchIntegrations();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao atualizar contas",
      });
    }
  };

  const getAccountStatusText = (status: number) => {
    switch (status) {
      case 1: return "Ativa";
      case 2: return "Desativada";
      case 3: return "Não solicitada";
      default: return "Desconhecido";
    }
  };

  if (loading || tokenLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Facebook className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Meta Ads</h3>
            </div>
            <p className="text-sm text-gray-600">
              Configure suas integrações com o Meta Ads (Facebook Ads)
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Integração</span>
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

      {/* Lista de integrações */}
      {integrations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Facebook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma integração configurada
          </h3>
          <p className="text-gray-600 mb-4">
            Configure suas contas de anúncios do Meta para começar a receber dados
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Integração</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white border rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    {integration.config.name || integration.nome}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Token:</span>{" "}
                      {integration.config.accessToken
                        ? integration.config.accessToken.substring(0, 10) + "..."
                        : "Não configurado"}
                    </p>
                    <p>
                      <span className="font-medium">Contas disponíveis:</span>{" "}
                      {integration.config.adAccounts?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium">Contas selecionadas:</span>{" "}
                      {integration.config.selectedAccounts?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Última atualização: {new Date(integration.updatedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {integration.config.adAccounts && integration.config.adAccounts.length > 0 && (
                    <button
                      onClick={() => handleManageAccounts(integration)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Gerenciar contas de anúncio →
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(integration)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Editar Integração" : "Nova Integração Meta Ads"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome da Integração
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Conta Principal"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identificação para diferenciar suas integrações
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="accessToken"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Token de Acesso
                  </label>
                  <input
                    type="text"
                    id="accessToken"
                    value={formData.accessToken}
                    onChange={(e) =>
                      setFormData({ ...formData, accessToken: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Insira seu token de acesso do Meta Ads"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Token de acesso da API do Meta Business
                  </p>
                </div>


                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingId ? "Atualizar" : "Criar"} Integração
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gerenciar contas */}
      {showAccountsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gerenciar Contas de Anúncio
                </h3>
                <button
                  onClick={() => setShowAccountsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Selecione as contas que deseja monitorar
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="space-y-3">
                {selectedIntegration.config.adAccounts?.map((account) => (
                  <label
                    key={account.id}
                    className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAccounts([...selectedAccounts, account.id]);
                        } else {
                          setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                        }
                      }}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-600">ID: {account.id}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Status: {getAccountStatusText(account.status)}</span>
                        <span>Saldo: {account.currency} {(parseInt(account.balance) / 100).toFixed(2)}</span>
                        {account.spendCap !== "0" && (
                          <span>Limite: {account.currency} {(parseInt(account.spendCap) / 100).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowAccountsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSelectedAccounts}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Seleção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informações de ajuda */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Como obter suas credenciais?</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Acesse o Meta Business Suite</li>
          <li>Vá para Configurações → Integrações de Negócios</li>
          <li>Crie ou selecione um app</li>
          <li>Gere um token de acesso de longo prazo</li>
        </ol>
        <p className="text-sm text-blue-800 mt-2 font-medium">
          Você pode adicionar múltiplas integrações para diferentes Business Managers ou contas de anúncios.
        </p>
      </div>
    </div>
  );
}