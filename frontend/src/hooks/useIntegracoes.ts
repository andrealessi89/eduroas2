import { useState, useEffect } from "react";
import { useApiToken } from "./useApiToken";

export interface Integracao {
  id: string;
  tipo: string;
  nome: string;
  config: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  token?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useIntegracoes() {
  const { apiCall } = useApiToken();
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegracoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall<{ success: boolean; data: Integracao[] }>("/integracoes");
      if (response.success && response.data) {
        setIntegracoes(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar integrações");
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall<{ success: boolean; data: ApiToken[] }>("/integracoes/tokens");
      if (response.success && response.data) {
        setTokens(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar tokens");
    } finally {
      setLoading(false);
    }
  };

  const saveMagazord = async (data: { user: string; key: string }) => {
    const response = await apiCall<{ success: boolean; data: Integracao }>("/integracoes/magazord", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.success) {
      await fetchIntegracoes();
    }
    return response;
  };

  const generateToken = async (name: string) => {
    const response = await apiCall<{ success: boolean; data: ApiToken }>("/integracoes/generate-token", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (response.success) {
      await fetchTokens();
    }
    return response;
  };

  const toggleToken = async (id: string, isActive: boolean) => {
    const endpoint = isActive ? `/integracoes/tokens/${id}/deactivate` : `/integracoes/tokens/${id}/activate`;
    const response = await apiCall<{ success: boolean }>(endpoint, {
      method: "PATCH",
    });
    if (response.success) {
      await fetchTokens();
    }
    return response;
  };

  useEffect(() => {
    fetchIntegracoes();
    fetchTokens();
  }, []);

  return {
    integracoes,
    tokens,
    loading,
    error,
    saveMagazord,
    generateToken,
    toggleToken,
    refresh: () => {
      fetchIntegracoes();
      fetchTokens();
    },
  };
}