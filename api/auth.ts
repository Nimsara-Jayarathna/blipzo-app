import { apiClient } from '@/api/client';
import type { AuthCredentials, AuthResponse, SessionResponse } from '@/types';
import { runFullSync } from '@/utils/sync-service';

export const login = async (credentials: AuthCredentials) => {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
  return data;
};

export const register = async (credentials: AuthCredentials) => {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', credentials);
  return data;
};

export const getSession = async () => {
  const { data } = await apiClient.get<SessionResponse>('/api/v1/auth/session');
  return data;
};

export const refreshSession = async () => {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/refresh');
  void runFullSync(data?.user);
  return data;
};

export const logoutSession = async () => {
  await apiClient.post('/api/v1/auth/logout');
};

