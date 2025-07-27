"use client";

import { useState, useEffect } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import {
  Facebook,
  Save,
  Edit2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

interface MetaAdsConfig {
  accessToken: string;
  adAccountId: string;
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
  const [editing, setEditing] = useState(false);
  const [integration, setIntegration] = useState<MetaAdsIntegration | null>(null);
  const [formData, setFormData] = useState<MetaAdsConfig>({
    accessToken: "",
    adAccountId: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar integração existente
  const fetchIntegration = async () => {
    setLoading(true);
    try {
      const response = await apiCall<{ success: boolean; data: any[] }>("/integracoes");
      
      if (response.success && response.data) {
        const metaIntegration = response.data.find(int => int.tipo === "meta");
        if (metaIntegration) {
          setIntegration(metaIntegration);
          setFormData({
            accessToken: metaIntegration.config.accessToken || "",
            adAccountId: metaIntegration.config.adAccountId || "",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar integração Meta Ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tokenLoading) {
      fetchIntegration();
    }
  }, [tokenLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!formData.accessToken || !formData.adAccountId) {
      setMessage({
        type: "error",
        text: "Por favor, preencha todos os campos",
      });
      setSaving(false);
      return;
    }

    try {
      const response = await apiCall<{ success: boolean; data: MetaAdsIntegration }>(
        "/integracoes/meta",
        {
          method: "POST",
          body: JSON.stringify({
            accessToken: formData.accessToken,
            adAccountId: formData.adAccountId,
          }),
        }
      );

      if (response.success && response.data) {
        setEditing(false);
        setMessage({
          type: "success",
          text: "Integração Meta Ads salva com sucesso!",
        });
        // Recarregar dados após salvar
        await fetchIntegration();
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

  const handleCancel = () => {
    setEditing(false);
    if (integration) {
      setFormData({
        accessToken: integration.config.accessToken || "",
        adAccountId: integration.config.adAccountId || "",
      });
    } else {
      setFormData({
        accessToken: "",
        adAccountId: "",
      });
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
        <div className="flex items-center gap-3 mb-2">
          <Facebook className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Meta Ads</h3>
        </div>
        <p className="text-sm text-gray-600">
          Configure sua integração com o Meta Ads (Facebook Ads)
        </p>
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

      <form onSubmit={handleSave} className="bg-white border rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-gray-900">Credenciais da API</h4>
            {integration && !editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            ) : editing ? (
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-700 flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
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
                disabled={integration && !editing}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Insira seu token de acesso do Meta Ads"
              />
              <p className="text-xs text-gray-500 mt-1">
                Token de acesso da API do Meta Business
              </p>
            </div>

            <div>
              <label
                htmlFor="adAccountId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ad Account ID
              </label>
              <input
                type="text"
                id="adAccountId"
                value={formData.adAccountId}
                onChange={(e) =>
                  setFormData({ ...formData, adAccountId: e.target.value })
                }
                disabled={integration && !editing}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ex: act_123456789"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID da conta de anúncios do Meta Ads
              </p>
            </div>
          </div>
        </div>

        {(!integration || editing) && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        )}

        {integration && !editing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Integração configurada com sucesso
              </p>
              <p className="text-sm text-green-700 mt-1">
                Última atualização: {new Date(integration.updatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        )}
      </form>

      {/* Informações de ajuda */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Como obter suas credenciais?</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Acesse o Meta Business Suite</li>
          <li>Vá para Configurações → Integrações de Negócios</li>
          <li>Crie ou selecione um app</li>
          <li>Gere um token de acesso de longo prazo</li>
          <li>Copie o ID da sua conta de anúncios (act_XXXXXX)</li>
        </ol>
      </div>
    </div>
  );
}