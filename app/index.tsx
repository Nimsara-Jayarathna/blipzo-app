import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withRepeat, 
  withSequence 
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getSession, refreshSession } from '@/api/auth';
import { apiClient } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/useAuth';
import { HomeBackground } from '@/components/home/HomeBackground';
import { useOffline } from '@/context/OfflineContext';
import { isAuthError, isNetworkOrTimeoutError } from '@/utils/api-retry';
import { runFullSync } from '@/utils/sync-service';

const ACCENT_COLOR = '#3498db';
const SESSION_CACHE_KEY = 'has_valid_session';

export default function IndexScreen() {
  const router = useRouter();
  const { setAuth, logout } = useAuth();
  const { offlineMode, promptToGoOffline, setIsBooting, setStartupOfflineTaken } = useOffline();
  const hasNavigatedRef = useRef(false);
  const sessionCacheLoadedRef = useRef(false);
  const hasValidSessionRef = useRef(false);

  // Animation Values
  const logoScale = useSharedValue(0);
  const loadingOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Start Logo Animation
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    
    // 2. Pulse Loading Text
    loadingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    const loadSessionCache = async () => {
      if (sessionCacheLoadedRef.current) return;
      const cached = await AsyncStorage.getItem(SESSION_CACHE_KEY);
      hasValidSessionRef.current = cached === 'true';
      sessionCacheLoadedRef.current = true;
    };

    // 3. Run Auth Logic
    const runSessionCheck = async () => {
      try {
        const session = await getSession();
        if (!session?.user) {
          return { status: 'unauth' as const };
        }

        let authData = session;
        try {
          const refreshed = await refreshSession();
          if (refreshed?.user) authData = refreshed;
        } catch {
          // Ignore refresh error; session is still valid.
        }

        return { status: 'ok' as const, authData };
      } catch (e) {
        if (isNetworkOrTimeoutError(e)) {
          return { status: 'network' as const };
        }
        if (isAuthError(e)) {
          return { status: 'unauth' as const };
        }
        return { status: 'error' as const };
      }
    };

    const checkAuth = async (skipMinWait = false) => {
      try {
        // Minimum wait time for aesthetic purposes (1.5s)
        const minWait = skipMinWait ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, 1500));
        await minWait;

        await loadSessionCache();
        if (!hasValidSessionRef.current) {
          try {
            await apiClient.get('/health', { timeout: 5000 });
            hasNavigatedRef.current = true;
            router.replace('/welcome');
          } catch {
            promptToGoOffline(
              'You need to be online to sign in.',
              async () => {
                await apiClient.get('/health', { timeout: 5000 });
                hasNavigatedRef.current = true;
                router.replace('/welcome');
              },
              { allowOffline: false, primaryLabel: 'Go to sign in', force: true }
            );
          }
          return;
        }

        const result = await runSessionCheck();

        if (result.status === 'ok') {
          setAuth(result.authData);
          void runFullSync(result.authData.user);
          await AsyncStorage.setItem(SESSION_CACHE_KEY, 'true');
          hasNavigatedRef.current = true;
          router.replace('/home' as any);
          return;
        }

        if (result.status === 'unauth') {
          logout();
          await AsyncStorage.setItem(SESSION_CACHE_KEY, 'false');
          promptToGoOffline(
            'You need to be online to sign in.',
            async () => {
              await apiClient.get('/health', { timeout: 5000 });
              hasNavigatedRef.current = true;
              router.replace('/welcome');
            },
            { allowOffline: false, primaryLabel: 'Go to sign in' }
          );
          return;
        }

        if (result.status === 'network') {
          const allowOffline = hasValidSessionRef.current;
          promptToGoOffline(
            allowOffline
              ? 'Unable to reach the server.'
              : 'You need to be online to continue.',
            async () => {
              const retryResult = await runSessionCheck();
              if (retryResult.status === 'ok') {
                setAuth(retryResult.authData);
                await AsyncStorage.setItem(SESSION_CACHE_KEY, 'true');
                hasNavigatedRef.current = true;
                router.replace('/home' as any);
                return;
              }
              if (retryResult.status === 'unauth') {
                await AsyncStorage.setItem(SESSION_CACHE_KEY, 'false');
                promptToGoOffline(
                  'You need to be online to sign in.',
                  async () => {
                    await apiClient.get('/health', { timeout: 5000 });
                    hasNavigatedRef.current = true;
                    router.replace('/welcome');
                  },
                  { allowOffline: false, primaryLabel: 'Go to sign in' }
                );
                throw new Error('AUTH_INVALID');
              }
              throw new Error('NETWORK');
            },
            {
              allowOffline,
              primaryLabel: 'Retry',
              onConfirm: allowOffline
                ? () => {
                    setStartupOfflineTaken(true);
                    hasNavigatedRef.current = true;
                    router.replace('/home/today' as any);
                  }
                : undefined,
              force: true,
            }
          );
          return;
        }

        logout();
        await AsyncStorage.setItem(SESSION_CACHE_KEY, 'false');
        hasNavigatedRef.current = true;
        router.replace('/welcome');
      } catch {
        logout();
        await AsyncStorage.setItem(SESSION_CACHE_KEY, 'false');
        hasNavigatedRef.current = true;
        router.replace('/welcome');
      }
    };

    setIsBooting(true);
    void checkAuth().finally(() => setIsBooting(false));
  }, []);

  useEffect(() => {
    if (offlineMode && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.replace('/home' as any);
    }
  }, [offlineMode, router]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  return (
    <HomeBackground>
      <View style={styles.container}>
        
        {/* Animated Logo */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <View style={styles.logoGlow} />
          <View style={styles.logoCircle}>
            <MaterialIcons name="donut-large" size={48} color="#fff" />
          </View>
        </Animated.View>

        {/* Text */}
        <View style={styles.textWrapper}>
          <ThemedText type="title" style={styles.title}>Blipzo</ThemedText>
          <ThemedText style={styles.tagline}>Everything you earn and spend.</ThemedText>
        </View>

        {/* Loader Footer */}
        <Animated.View style={[styles.loaderContainer, textStyle]}>
          <ThemedText style={styles.loaderText}>Setting up your workspace...</ThemedText>
        </Animated.View>

      </View>
    </HomeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: ACCENT_COLOR,
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 28, // Squircle
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ rotate: '-10deg' }],
  },
  textWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: -1,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
  loaderText: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
