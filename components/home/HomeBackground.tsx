import React, { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/ThemeContext';

type HomeBackgroundProps = {
  children: ReactNode;
};

export function HomeBackground({ children }: HomeBackgroundProps) {
  const { colors, resolvedTheme } = useAppTheme();
  const accentGlow =
    resolvedTheme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.22)';
  const secondaryGlow =
    resolvedTheme === 'dark' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(46, 204, 113, 0.18)';

  return (
    <ThemedView style={[styles.root, { backgroundColor: colors.pageBg }]}>
      <LinearGradient
        pointerEvents="none"
        colors={[accentGlow, 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[secondaryGlow, 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.8, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
});
