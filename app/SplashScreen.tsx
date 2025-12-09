import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getSession, refreshSession } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function SplashScreen() {
  const router = useRouter();
  const { setAuth, logout } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // Keep splash visible for ~1–2 seconds
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Check existing session (cookie-based)
        const session = await getSession();

        if (session?.user) {
          let authData = session;

          // Try to refresh session/token if backend supports it
          try {
            const refreshed = await refreshSession();
            if (refreshed?.user) {
              authData = refreshed;
            }
          } catch {
            // If refresh fails, fall back to original session
          }

          if (!cancelled) {
            setAuth(authData);
            router.replace('/(tabs)');
          }
        } else if (!cancelled) {
          logout();
          router.replace('/welcome');
        }
      } catch {
        if (!cancelled) {
          logout();
          router.replace('/welcome');
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [logout, router, setAuth]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoBlock}>
        <ThemedText type="title" style={styles.title}>
          MyEx
        </ThemedText>
        <ThemedText style={styles.subtitle}>Loading your workspace...</ThemedText>
      </View>
      <ActivityIndicator />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
});

