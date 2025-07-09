const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  dashboard: {
    getData: (params?: { startDate?: string; endDate?: string; platform?: string }, token?: string) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.platform) queryParams.append('platform', params.platform);
      
      const queryString = queryParams.toString();
      return apiFetch(`/dashboard${queryString ? '?' + queryString : ''}`, { token });
    },
    
    getSummary: (token?: string) => 
      apiFetch('/dashboard/summary', { token }),
  },

  // Produtos
  produtos: {
    list: (token?: string) => 
      apiFetch('/produtos', { token }),
    
    get: (id: string, token?: string) => 
      apiFetch(`/produtos/${id}`, { token }),
    
    create: (data: { nome: string; sku: string; custo: number }, token?: string) =>
      apiFetch('/produtos', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    
    update: (id: string, data: Partial<{ nome: string; sku: string; custo: number }>, token?: string) =>
      apiFetch(`/produtos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),
    
    delete: (id: string, token?: string) =>
      apiFetch(`/produtos/${id}`, {
        method: 'DELETE',
        token,
      }),
  },

  // Facebook Ads
  facebookAds: {
    list: (params?: { startDate?: string; endDate?: string; accountId?: string }, token?: string) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.accountId) queryParams.append('accountId', params.accountId);
      
      const queryString = queryParams.toString();
      return apiFetch(`/facebook-ads${queryString ? '?' + queryString : ''}`, { token });
    },
    
    aggregated: (params?: { startDate?: string; endDate?: string; groupBy?: string }, token?: string) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.groupBy) queryParams.append('groupBy', params.groupBy);
      
      const queryString = queryParams.toString();
      return apiFetch(`/facebook-ads/aggregated${queryString ? '?' + queryString : ''}`, { token });
    },
  },

  // Pedidos
  pedidos: {
    list: (params?: { startDate?: string; endDate?: string; limit?: number; offset?: number }, token?: string) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString();
      return apiFetch(`/pedidos${queryString ? '?' + queryString : ''}`, { token });
    },
    
    get: (id: string, token?: string) => 
      apiFetch(`/pedidos/${id}`, { token }),
    
    stats: (params?: { startDate?: string; endDate?: string; groupBy?: string }, token?: string) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.groupBy) queryParams.append('groupBy', params.groupBy);
      
      const queryString = queryParams.toString();
      return apiFetch(`/pedidos/stats/aggregated${queryString ? '?' + queryString : ''}`, { token });
    },
  },

  // Google Ads (já existente)
  googleAds: {
    test: (token?: string) => 
      apiFetch('/webhook/test', { token }),
  },
};