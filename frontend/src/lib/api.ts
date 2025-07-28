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
    list: (params?: { url?: string; startDate?: string; endDate?: string; limit?: number; offset?: number; status?: string }, token?: string) => {
      if (params?.url) {
        return apiFetch(params.url.replace(API_BASE_URL, ''), { token });
      }
      
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status) queryParams.append('status', params.status);
      
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
    
    semCusto: (token?: string) => 
      apiFetch('/pedidos/sem-custo', { token }),
    
    reprocessarCustos: (id: string, token?: string) =>
      apiFetch(`/pedidos/${id}/reprocessar-custos`, {
        method: 'POST',
        token,
      }),
  },

  // Google Ads
  googleAds: {
    list: (params?: { startDate?: string; endDate?: string; accountId?: string; limit?: number; offset?: number }, token?: string) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.accountId) queryParams.append('accountId', params.accountId);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString();
      return apiFetch(`/google-ads${queryString ? '?' + queryString : ''}`, { token });
    },
    
    get: (id: string, token?: string) => 
      apiFetch(`/google-ads/${id}`, { token }),
    
    delete: (id: string, token?: string) =>
      apiFetch(`/google-ads/${id}`, {
        method: 'DELETE',
        token,
      }),
      
    accounts: (token?: string) =>
      apiFetch('/google-ads/accounts/list', { token }),
  },
};