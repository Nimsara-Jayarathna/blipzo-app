import React, { useState, type ReactNode } from 'react';
import { Tabs } from 'expo-router';

import { AddTransactionSheet } from '@/components/home/AddTransactionSheet';
import { HomeBackground } from '@/components/home/HomeBackground';
import { HomeHeader } from '@/components/home/layout/HomeHeader';
import { HomeTabBar } from '@/components/home/layout/HomeTabBar';

type HomeShellProps = {
  user: { name: string; avatarUrl?: string } | null;
  children: ReactNode;
};

export function HomeShell({ user, children }: HomeShellProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <HomeBackground>
      <Tabs
        tabBar={(props) => (
          <HomeTabBar {...props} onAddPress={() => setIsAddOpen(true)} />
        )}
        screenOptions={{
          header: () => <HomeHeader user={user} />,
          headerShadowVisible: false,
        }}
      >
        {children}
      </Tabs>
      <AddTransactionSheet visible={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </HomeBackground>
  );
}
