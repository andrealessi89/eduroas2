import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useApiToken() {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Buscar token do usuário
        const userTokenResponse = await fetch('/api/user/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: session.user.email }),
        });

        if (userTokenResponse.ok) {
          const data = await userTokenResponse.json();
          setToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching API token:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [session]);

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    if (!token) {
      throw new Error('Token não disponível');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${apiUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `Erro na requisição: ${response.status}`);
    }

    return response.json();
  }, [token]);

  return { token, loading, apiCall };
}