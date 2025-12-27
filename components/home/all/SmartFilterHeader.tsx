import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import type { AllFilters, Grouping } from '@/hooks/home/useTransactionLogic';
import { HOME_STICKY_HEADER_CARD_MIN_HEIGHT } from '@/components/home/layout/spacing';

type SmartFilterHeaderProps = {
  filters: AllFilters;
  grouping: Grouping;
  isLoading: boolean;
  onOpenFilters: () => void;
};

export function SmartFilterHeader({
  filters,
  grouping,
  isLoading,
  onOpenFilters,
}: SmartFilterHeaderProps) {
  const { colors, resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const blurIntensity = isDark ? 40 : 65;
  const androidFallbackOverlay = isDark ? 'rgba(2, 6, 23, 0.7)' : 'rgba(226, 232, 240, 0.6)';
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.borderSoft;
  const cardBorderColor =
    Platform.OS === 'android'
      ? isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(15, 23, 42, 0.08)'
      : colors.borderGlass;
  const typeLabel =
    filters.typeFilter === 'all'
      ? 'All types'
      : filters.typeFilter === 'income'
      ? 'Income'
      : 'Expense';

  const sortLabel =
    filters.sortField === 'date'
      ? `Date (${filters.sortDirection === 'asc' ? '↑' : '↓'})`
      : filters.sortField === 'amount'
      ? `Amount (${filters.sortDirection === 'asc' ? '↑' : '↓'})`
      : `Category (${filters.sortDirection === 'asc' ? '↑' : '↓'})`;

  const groupLabel =
    grouping === 'none' ? 'None' : grouping === 'month' ? 'Month' : 'Category';

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surfaceGlassThick,
            borderColor: cardBorderColor,
            shadowColor: colors.textMain,
          },
          pressed && styles.cardPressed,
        ]}
        onPress={onOpenFilters}
      >
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {Platform.OS === 'android' && (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: androidFallbackOverlay }]}
          />
        )}
        <View style={styles.header}>
          <ThemedText style={[styles.label, { color: colors.textSubtle }]}>
            Filters overview
          </ThemedText>
          <ThemedText style={[styles.primary, { color: colors.textMain }]}>
            {filters.startDate} → {filters.endDate}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <View style={styles.row}>
          <View style={styles.column}>
            <ThemedText style={[styles.subLabel, { color: colors.textSubtle }]}>
              Type
            </ThemedText>
            <ThemedText style={[styles.valueAccent, { color: colors.primaryAccent }]}>
              {typeLabel}
            </ThemedText>
          </View>

          <View style={[styles.verticalDivider, { backgroundColor: dividerColor }]} />

          <View style={styles.column}>
            <ThemedText style={[styles.subLabel, { color: colors.textSubtle }]}>
              Sort / Group
            </ThemedText>
            <ThemedText style={[styles.valueMuted, { color: colors.textMuted }]} numberOfLines={1}>
              {sortLabel}
            </ThemedText>
            <ThemedText style={[styles.valueMuted, { color: colors.textMuted }]} numberOfLines={1}>
              Group: {groupLabel}
            </ThemedText>
          </View>
        </View>
      </Pressable>

      {isLoading && (
        <View style={styles.loadingRow}>
          {/* Caller renders ActivityIndicator beside this if desired */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: HOME_STICKY_HEADER_CARD_MIN_HEIGHT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.95,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  primary: {
    fontSize: 24,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  valueAccent: {
    fontSize: 18,
    fontWeight: '600',
  },
  valueMuted: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingRow: {
    marginTop: 8,
  },
});

export default SmartFilterHeader;
