import { useEffect, useRef } from 'react';

import { apiClient } from '@/api/client';
import { useOffline } from '@/context/OfflineContext';
import { isNetworkOrTimeoutError } from '@/utils/api-retry';

const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_TIMEOUT_MS = 5000;
const HEARTBEAT_FAILURE_LIMIT = 3;

export const useHeartbeat = () => {
  const { offlineMode, promptToGoOffline } = useOffline();
  const failureCount = useRef(0);

  useEffect(() => {
    if (offlineMode) return;

    const timer = setInterval(async () => {
      try {
        // Heartbeat: lightweight check to detect server outages mid-session.
        await apiClient.get('/health', { timeout: HEARTBEAT_TIMEOUT_MS });
        failureCount.current = 0;
      } catch (error) {
        if (!isNetworkOrTimeoutError(error)) {
          return;
        }
        failureCount.current += 1;
        if (failureCount.current >= HEARTBEAT_FAILURE_LIMIT) {
          promptToGoOffline('Server is unreachable.', async () => {
            await apiClient.get('/health', { timeout: HEARTBEAT_TIMEOUT_MS });
            failureCount.current = 0;
          });
        }
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [offlineMode, promptToGoOffline]);
};
