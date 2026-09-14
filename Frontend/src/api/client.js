export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('vault_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}