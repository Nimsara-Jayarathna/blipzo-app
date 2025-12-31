import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { subscribeSync, type SyncState } from '@/utils/sync-state';

export function SyncOverlay() {
  const { colors } = useAppTheme();
  const [syncState, setSyncState] = useState<SyncState>({ isSyncing: false });

  useEffect(() => subscribeSync(setSyncState), []);

  if (!syncState.isSyncing) return null;

  const progressText = syncState.progress
    ? `${syncState.progress.current} / ${syncState.progress.total}`
    : null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.borderSoft }]}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
        <ThemedText style={styles.title}>Syncing...</ThemedText>
        {syncState.message ? (
          <ThemedText style={[styles.message, { color: colors.textMuted }]}>
            {syncState.message}
          </ThemedText>
        ) : null}
        {progressText ? (
          <ThemedText style={[styles.progress, { color: colors.textMuted }]}>
            {progressText}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    width: '78%',
    maxWidth: 320,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
  },
});
