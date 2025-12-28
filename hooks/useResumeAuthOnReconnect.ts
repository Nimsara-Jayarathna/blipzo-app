import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

import { getSession, refreshSession } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/context/OfflineContext';
import { isAuthError, isNetworkOrTimeoutError } from '@/utils/api-retry';

export const useResumeAuthOnReconnect = () => {
  const router = useRouter();
  const { setAuth, logout } = useAuth();
  const {
    networkConnected,
    startupOfflineTaken,
    setStartupOfflineTaken,
    setOfflineMode,
  } = useOffline();
  const isResumingRef = useRef(false);

  useEffect(() => {
    if (!startupOfflineTaken || !networkConnected || isResumingRef.current) {
      return;
    }

    const run = async () => {
      isResumingRef.current = true;
      try {
        const session = await getSession();
        if (!session?.user) {
          throw new Error('UNAUTH');
        }

        let authData = session;
        try {
          const refreshed = await refreshSession();
          if (refreshed?.user) authData = refreshed;
        } catch {
          // Ignore refresh error; session may still be valid.
        }

        setAuth(authData);
        setOfflineMode(false);
        setStartupOfflineTaken(false);
        router.replace('/home' as any);
      } catch (error) {
        if (isNetworkOrTimeoutError(error)) {
          return;
        }
        if (isAuthError(error) || (error instanceof Error && error.message === 'UNAUTH')) {
          logout();
          setOfflineMode(false);
          setStartupOfflineTaken(false);
          router.replace('/welcome');
        }
      } finally {
        isResumingRef.current = false;
      }
    };

    void run();
  }, [
    networkConnected,
    router,
    setAuth,
    logout,
    setOfflineMode,
    startupOfflineTaken,
    setStartupOfflineTaken,
  ]);
};
