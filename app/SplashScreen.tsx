import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getSession, refreshSession } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/useAuth';
import { HomeBackground } from './home/_components/HomeBackground';

const accentColor = '#3498db';
const incomeColor = '#2ecc71';
const expenseColor = '#e74c3c';

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
            router.replace('/home');
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
    <HomeBackground>
      <View style={styles.content}>
        <View style={styles.logoCard}>
          {/* TODO: Replace with real logo asset */}
          <View style={styles.logoCircle}>
            <View style={styles.logoAccentDot} />
            <View style={styles.logoIncomeDot} />
            <View style={styles.logoExpenseDot} />
          </View>
          <ThemedText type="title" style={styles.title}>
            MyEx
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Everything you earn and spend, beautifully organized.
          </ThemedText>
        </View>

        <View style={styles.loaderRow}>
          <ActivityIndicator color={accentColor} />
          <ThemedText style={styles.loaderText}>Loading your workspace...</ThemedText>
        </View>
      </View>
    </HomeBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoCard: {
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
    alignItems: 'center',
    maxWidth: 320,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoAccentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: accentColor,
    position: 'absolute',
    top: 18,
    left: 22,
  },
  logoIncomeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: incomeColor,
    position: 'absolute',
    bottom: 18,
    right: 18,
  },
  logoExpenseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: expenseColor,
    position: 'absolute',
    bottom: 22,
    left: 32,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  loaderRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
  },
});
