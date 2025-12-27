import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { apiClient } from '@/api/client';
import { registerOfflinePrompt, type OfflinePromptPayload } from '@/utils/offline-prompt';

export type Capabilities = {
  canAdd: boolean;
  canSelectCategory: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canManageCategories: boolean;
  canAccessMainSections: boolean;
  canAccessProfileSettings: boolean;
};

type OfflineContextValue = {
  offlineMode: boolean;
  setOfflineMode: (next: boolean) => void;
  promptToGoOffline: (
    reason: string,
    onRetry?: () => Promise<void>,
    options?: { allowOffline?: boolean; primaryLabel?: string; onConfirm?: () => void; force?: boolean }
  ) => void;
  prompt: { visible: boolean; reason: string; allowOffline: boolean; primaryLabel: string };
  isPromptRetrying: boolean;
  confirmOfflineMode: () => void;
  retryConnection: () => void;
  tryGoOnline: () => Promise<boolean>;
  startupOfflineLock: boolean;
  setStartupOfflineLock: (next: boolean) => void;
  capabilities: Capabilities;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export const OfflineProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Offline state combines manual override + device connectivity.
  const [networkConnected, setNetworkConnected] = useState(true);
  const [manualOffline, setManualOffline] = useState(false);
  const [promptState, setPromptState] = useState<{
    visible: boolean;
    reason: string;
    onRetry?: () => Promise<void>;
    allowOffline: boolean;
    primaryLabel: string;
    onConfirm?: () => void;
  }>({ visible: false, reason: '', allowOffline: true, primaryLabel: 'Retry' });
  const [isPromptRetrying, setIsPromptRetrying] = useState(false);
  const [startupOfflineLock, setStartupOfflineLock] = useState(false);

  const offlineMode = manualOffline;

  const openPrompt = useCallback((
    reason: string,
    onRetry?: () => Promise<void>,
    allowOffline = true,
    primaryLabel = 'Retry',
    onConfirm?: () => void,
    force = false
  ) => {
    if (manualOffline) {
      return;
    }
    setPromptState(prev => {
      if (prev.visible && !force) {
        return prev;
      }
      return { visible: true, reason, onRetry, allowOffline, primaryLabel, onConfirm };
    });
  }, [manualOffline]);

  const promptToGoOffline = useCallback(
    (
      reason: string,
      onRetry?: () => Promise<void>,
      options?: { allowOffline?: boolean; primaryLabel?: string; onConfirm?: () => void; force?: boolean }
    ) => {
      openPrompt(
        reason,
        onRetry,
        options?.allowOffline ?? true,
        options?.primaryLabel ?? 'Retry',
        options?.onConfirm,
        options?.force ?? false
      );
    },
    [openPrompt]
  );

  const confirmOfflineMode = useCallback(() => {
    if (!promptState.allowOffline) {
      return;
    }
    setManualOffline(true);
    setPromptState(prev => ({ ...prev, visible: false }));
    promptState.onConfirm?.();
  }, [promptState.allowOffline, promptState.onConfirm]);

  const retryConnection = useCallback(async () => {
    if (!promptState.onRetry) {
      setPromptState(prev => ({ ...prev, visible: false }));
      return;
    }

    setIsPromptRetrying(true);
    try {
      await promptState.onRetry();
      setManualOffline(false);
      setPromptState(prev => ({ ...prev, visible: false }));
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'AUTH_INVALID'
          ? 'You need to be online to sign in.'
          : 'Retry failed. Please check your connection.';
      setPromptState(prev => ({
        ...prev,
        reason: message,
        visible: true,
      }));
    } finally {
      setIsPromptRetrying(false);
    }
  }, [promptState.onRetry]);

  const tryGoOnline = useCallback(async () => {
    try {
      await apiClient.get('/health', { timeout: 5000 });
      setManualOffline(false);
      return true;
    } catch {
      openPrompt('Still offline. Please check your connection.', async () => {
        await apiClient.get('/health', { timeout: 5000 });
      });
      return false;
    }
  }, [openPrompt]);

  useEffect(() => {
    // NetInfo: fast local signal for online/offline mode.
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkConnected(Boolean(state.isConnected));
    });

    const unregister = registerOfflinePrompt((payload: OfflinePromptPayload) => {
      openPrompt(
        payload.reason,
        payload.onRetry,
        payload.allowOffline ?? true,
        payload.primaryLabel ?? 'Retry',
        payload.onConfirm
      );
    });

    return () => {
      unregister();
      unsubscribe();
    };
  }, [openPrompt]);

  useEffect(() => {
    // Surface connection loss without auto-enabling offline mode.
    if (!networkConnected && !manualOffline) {
      openPrompt('Connection lost.', async () => {
        await apiClient.get('/health', { timeout: 5000 });
      }, true, 'Retry');
    }
  }, [networkConnected, manualOffline, openPrompt]);

  useEffect(() => {
    if (!manualOffline && startupOfflineLock) {
      setStartupOfflineLock(false);
    }
  }, [manualOffline, startupOfflineLock]);

  const capabilities = useMemo<Capabilities>(() => {
    if (offlineMode) {
      return {
        // Offline: allow Add Record flow and profile/settings only.
        canAdd: true,
        canSelectCategory: true,
        canDelete: false,
        canEdit: false,
        canManageCategories: false,
        canAccessMainSections: true, // Today stays visible; other sections are blocked elsewhere.
        canAccessProfileSettings: true,
      };
    }

    // Online: full access.
    return {
      canAdd: true,
      canSelectCategory: true,
      canDelete: true,
      canEdit: true,
      canManageCategories: true,
      canAccessMainSections: true,
      canAccessProfileSettings: true,
    };
  }, [offlineMode]);

  return (
    <OfflineContext.Provider
      value={{
        offlineMode,
        setOfflineMode: setManualOffline,
        promptToGoOffline,
        prompt: {
          visible: promptState.visible,
          reason: promptState.reason,
          allowOffline: promptState.allowOffline,
          primaryLabel: promptState.primaryLabel,
        },
        isPromptRetrying,
        confirmOfflineMode,
        retryConnection,
        tryGoOnline,
        startupOfflineLock,
        setStartupOfflineLock,
        capabilities,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
};
