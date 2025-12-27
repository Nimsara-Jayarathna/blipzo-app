import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

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
  capabilities: Capabilities;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export const OfflineProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Offline state driven by device connectivity (server reachability can be layered in later).
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    // NetInfo: fast local signal for online/offline mode.
    const unsubscribe = NetInfo.addEventListener(state => {
      setOfflineMode(!state.isConnected);
    });

    // TODO: Add a lightweight session ping to /api/auth/session with a timeout
    // to treat server downtime as offline/degraded mode.

    return () => unsubscribe();
  }, []);

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
    <OfflineContext.Provider value={{ offlineMode, capabilities }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
};
