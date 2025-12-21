import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';
import { HomeShell } from '@/components/home/layout/HomeShell';

export default function HomeTabLayout() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <HomeShell user={user ? { name: user.name ?? user.email, avatarUrl: undefined } : null}>
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="all" options={{ title: 'All' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </HomeShell>
  );
}
