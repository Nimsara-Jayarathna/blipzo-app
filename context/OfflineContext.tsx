import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { registerOfflinePrompt } from '@/utils/offline-prompt';

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
  promptToGoOffline: (reason: string) => void;
  capabilities: Capabilities;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export const OfflineProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Offline state combines manual override + device connectivity.
  const [networkConnected, setNetworkConnected] = useState(true);
  const [manualOffline, setManualOffline] = useState(false);
  const offlineMode = manualOffline || !networkConnected;

  const promptToGoOffline = useCallback((reason: string) => {
    Alert.alert(
      'Offline mode',
      `${reason}\n\nContinue in offline mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go offline', onPress: () => setManualOffline(true) },
      ]
    );
  }, []);

  useEffect(() => {
    // NetInfo: fast local signal for online/offline mode.
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkConnected(Boolean(state.isConnected));
    });

    const unregister = registerOfflinePrompt(promptToGoOffline);

    return () => {
      unregister();
      unsubscribe();
    };
  }, [promptToGoOffline]);

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
