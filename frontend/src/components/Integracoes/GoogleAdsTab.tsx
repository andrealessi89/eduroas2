"use client";

import { useState, useEffect } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import {
  TrendingUp,
  Plus,
  Key,
  Copy,
  Calendar,
  Check,
  X,
  AlertCircle,
  Code,
  ExternalLink,
} from "lucide-react";

interface GoogleAdsToken {
  id: string;
  name: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GoogleAdsTab() {
  const { apiCall, loading: tokenLoading } = useApiToken();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<GoogleAdsToken[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [currentToken, setCurrentToken] = useState<GoogleAdsToken | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar tokens existentes
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await apiCall<{ success: boolean; data: GoogleAdsToken[] }>("/integracoes/google-ads/tokens");
      
      if (response.success && response.data) {
        setTokens(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar tokens:", error);
      setMessage({
        type: "error",
        text: "Erro ao buscar tokens. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tokenLoading) {
      fetchTokens();
    }
  }, [tokenLoading]);

  const generateToken = async () => {
    if (!tokenName.trim()) {
      setMessage({
        type: "error",
        text: "Por favor, insira um nome para o token"
      });
      return;
    }

    try {
      const response = await apiCall<{ success: boolean; data: GoogleAdsToken }>(
        "/integracoes/google-ads/generate-token",
        {
          method: "POST",
          body: JSON.stringify({ name: tokenName }),
        }
      );

      if (response.success && response.data) {
        setCurrentToken(response.data);
        setShowModal(false);
        setShowScriptModal(true);
        setTokenName("");
        await fetchTokens();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao gerar token"
      });
    }
  };

  const toggleTokenStatus = async (id: string, isActive: boolean) => {
    try {
      const endpoint = isActive 
        ? `/integracoes/google-ads/tokens/${id}/deactivate` 
        : `/integracoes/google-ads/tokens/${id}/activate`;

      const response = await apiCall<{ success: boolean }>(endpoint, {
        method: "PATCH",
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: isActive ? "Token desativado com sucesso" : "Token ativado com sucesso"
        });
        await fetchTokens();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao alterar status do token"
      });
    }
  };

  const copyToClipboard = async (text: string, type: "token" | "script") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "token") {
        setCopiedTokenId(text);
        setTimeout(() => setCopiedTokenId(null), 2000);
      } else {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erro ao copiar. Tente novamente."
      });
    }
  };

  const generateScript = (token: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return `// === CONFIGURAÇÃO ===
const BACKEND_URL   = '${backendUrl}/integracoes/google-ads/webhook';
const BACKEND_TOKEN = '${token}';

function main() {
  const acct = AdsApp.currentAccount();
  const date = Utilities.formatDate(new Date(), acct.getTimeZone(), "yyyy-MM-dd");

  const report = AdsApp.report(\`
    SELECT CampaignName, ConversionTypeName, ConversionValue, Conversions
    FROM CAMPAIGN_PERFORMANCE_REPORT
    WHERE CampaignStatus = ENABLED
    DURING TODAY
  \`);

  const rows = report.rows();
  let totalConversionValue = 0;

  while (rows.hasNext()) {
    const row = rows.next();
    Logger.log(\`Conversão: \${row.ConversionTypeName}, Valor: \${row.ConversionValue}\`);
    totalConversionValue += parseFloat((row.ConversionValue || "0").replace(",", ""));
  }

  const stats = acct.getStatsFor('TODAY');

  const payload = {
    date: date,
    accountId: acct.getCustomerId(),
    accountName: acct.getName(),
    cost: stats.getCost(),
    impressions: stats.getImpressions(),
    clicks: stats.getClicks(),
    conversions: stats.getConversions(),
    averageCpc: Number(stats.getAverageCpc().toFixed(2)),
    conversionValue: Number(totalConversionValue.toFixed(2))
  };

  UrlFetchApp.fetch(BACKEND_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + BACKEND_TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log('Payload enviado:\\n' + JSON.stringify(payload, null, 2));
}`;
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
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Google Ads</h3>
            </div>
            <p className="text-sm text-gray-600">
              Gere tokens e scripts para integrar suas campanhas do Google Ads
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Novo Token</span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum token criado
          </h3>
          <p className="text-gray-600 mb-4">
            Gere tokens para integrar suas campanhas do Google Ads
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Primeiro Token</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.map((token) => (
                <tr key={token.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {token.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {token.token.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(token.token, "token")}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copiar token"
                      >
                        {copiedTokenId === token.token ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        token.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {token.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(token.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentToken(token);
                          setShowScriptModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        title="Ver script"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleTokenStatus(token.id, token.isActive)}
                        className={`text-sm font-medium ${
                          token.isActive
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {token.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de criar token */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gerar Novo Token
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTokenName("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="tokenName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome do Token
                  </label>
                  <input
                    type="text"
                    id="tokenName"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Conta Principal Google Ads"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use um nome descritivo para identificar este token
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTokenName("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={generateToken}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Gerar Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de script */}
      {showScriptModal && currentToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Script do Google Ads
                </h3>
                <button
                  onClick={() => {
                    setShowScriptModal(false);
                    setCurrentToken(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Copie este script e cole no Google Ads Scripts
              </p>
            </div>

            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-100 font-mono overflow-x-auto">
                  <code>{generateScript(currentToken.token)}</code>
                </pre>
              </div>

              <button
                onClick={() => copyToClipboard(generateScript(currentToken.token), "script")}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-4 h-4" />
                    Script Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Script
                  </>
                )}
              </button>

              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Como usar este script:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse sua conta do Google Ads</li>
                  <li>Vá para Ferramentas → Ações em massa → Scripts</li>
                  <li>Clique em "+ NOVO SCRIPT"</li>
                  <li>Cole o código gerado acima</li>
                  <li>Configure a frequência para executar por hora</li>
                  <li>Salve e autorize o script</li>
                </ol>
                <div className="mt-3">
                  <a
                    href="https://ads.google.com/aw/bulk/scripts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    Abrir Google Ads Scripts
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}