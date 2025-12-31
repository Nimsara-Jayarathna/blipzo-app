import { useEffect } from 'react';

import { apiClient } from '@/api/client';
import { useOffline } from '@/context/OfflineContext';
import { withRetry } from '@/utils/api-retry';

const SESSION_TIMEOUT_MS = 8000;

export const useStartupSessionCheck = () => {
  const { offlineMode, promptToGoOffline } = useOffline();

  useEffect(() => {
    if (offlineMode) return;

    let cancelled = false;

    const checkSession = async () => {
      try {
        // Startup: verify server reachability before normal navigation.
        await withRetry(
          () => apiClient.get('/api/auth/session', { timeout: SESSION_TIMEOUT_MS }),
          1
        );
      } catch {
        if (!cancelled) {
          promptToGoOffline('Session check failed.', async () => {
            await withRetry(
              () => apiClient.get('/api/auth/session', { timeout: SESSION_TIMEOUT_MS }),
              1
            );
          });
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [offlineMode, promptToGoOffline]);
};
