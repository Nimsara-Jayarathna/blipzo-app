import { API_VERSION, apiClient } from '@/api/client';
import type { AuthCredentials, AuthResponse, SessionResponse } from '@/types';
import { clearDb } from '@/utils/local-db';
import { runFullSync } from '@/utils/sync-service';

export const login = async (credentials: AuthCredentials) => {
  const { data } = await apiClient.post<AuthResponse>(`/api/${API_VERSION}/auth/login`, credentials);
  void runFullSync(data?.user);
  return data;
};

export const register = async (credentials: AuthCredentials) => {
  const { data } = await apiClient.post<AuthResponse>(`/api/${API_VERSION}/auth/register`, credentials);
  return data;
};

export const getSession = async () => {
  const { data } = await apiClient.get<SessionResponse>(`/api/${API_VERSION}/auth/session`);
  return data;
};

export const refreshSession = async () => {
  const { data } = await apiClient.post<AuthResponse>(`/api/${API_VERSION}/auth/refresh`);
  void runFullSync(data?.user);
  return data;
};

export const logoutSession = async () => {
  try {
    await apiClient.post(`/api/${API_VERSION}/auth/logout`);
  } finally {
    await clearDb();
  }
};

