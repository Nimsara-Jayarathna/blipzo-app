import React, { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';
import { HomeShell } from '@/components/home/layout/HomeShell';
import { useOffline } from '@/context/OfflineContext';

export default function HomeTabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, user } = useAuth();
  const { offlineMode, capabilities } = useOffline();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Offline route guard: keep users out of blocked sections.
    if (!offlineMode) return;
    if (!capabilities.canAccessMainSections) {
      router.replace('/home/today');
      return;
    }

    const [, route] = segments;
    if (route === 'all' || route === 'settings') {
      router.replace('/home/today');
    }
  }, [offlineMode, capabilities, router, segments]);

  if (!isAuthenticated) return null;

  return (
    <HomeShell user={user ? { name: user.name ?? user.email, avatarUrl: undefined } : null}>
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="all" options={{ title: 'All' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: null, headerShown: false }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </HomeShell>
  );
}
