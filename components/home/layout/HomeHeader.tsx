import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileHeader } from '@/components/ProfileHeader';

type HomeHeaderProps = {
  user: { name: string; avatarUrl?: string } | null;
};

export function HomeHeader({ user }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      <ProfileHeader user={user} />
    </View>
  );
}
