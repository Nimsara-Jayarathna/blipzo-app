import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthResponse, UserProfile } from '@/types';

const SESSION_CACHE_KEY = 'has_valid_session';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSessionChecked: boolean;
  setAuth: (payload: AuthResponse) => void;
  markSessionChecked: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  isSessionChecked: false,
  setAuth: ({ user }: AuthResponse) =>
    set(() => {
      void AsyncStorage.setItem(SESSION_CACHE_KEY, 'true');
      return {
        user,
        isAuthenticated: true,
        isSessionChecked: true,
      };
    }),
  markSessionChecked: () =>
    set(state => ({
      ...state,
      isSessionChecked: true,
    })),
  logout: () =>
    set(() => {
      void AsyncStorage.setItem(SESSION_CACHE_KEY, 'false');
      return {
        user: null,
        isAuthenticated: false,
        isSessionChecked: true,
      };
    }),
}));

