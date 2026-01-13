import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';

import { HomeShell } from '@/components/home/layout/HomeShell';
import { useOffline } from '@/context/OfflineContext';
import { useAuth } from '@/hooks/useAuth';

export default function HomeTabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, user } = useAuth();
  const { offlineMode, capabilities, tryGoOnline } = useOffline();

  useEffect(() => {
    if (!isAuthenticated && !offlineMode) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, offlineMode, router]);

  useEffect(() => {
    // Offline route guard: keep users out of blocked sections.
    if (!offlineMode) return;
    if (!capabilities.canAccessMainSections) {
      router.replace('/home/today');
      return;
    }

    const route = segments[1];
    if (route === 'all' || route === 'settings') {
      router.replace('/home/today');
    }
  }, [offlineMode, capabilities, router, segments]);

  if (!isAuthenticated && !offlineMode) return null;

  return (
    <HomeShell user={user ? { name: user.name ?? user.email, avatarUrl: undefined } : null}>
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen 
        name="all" 
        options={{ title: 'All' }} 
        listeners={{
          tabPress: (e) => {
            if (offlineMode) {
              e.preventDefault();
              Alert.alert(
                'You are offline',
                'You need to go online to view all transactions.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Go Online', 
                    onPress: async () => {
                      await tryGoOnline();
                    } 
                  }
                ]
              );
            }
          },
        }} 
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: null, headerShown: false }} />
      <Tabs.Screen name="currency" options={{ title: 'Currency', href: null, headerShown: false }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </HomeShell>
  );
}
