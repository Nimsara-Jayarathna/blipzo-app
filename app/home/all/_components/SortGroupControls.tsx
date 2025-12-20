import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import type { AllFilters, Grouping } from '../_hooks/useTransactionLogic';

interface Props {
  filters: AllFilters;
  grouping: Grouping;
  onChangeFilter: (f: AllFilters) => void;
  onChangeGrouping: (g: Grouping) => void;
}

export function SortGroupControls({
  filters,
  grouping,
  onChangeFilter,
  onChangeGrouping,
}: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.grid}>
      {/* Sort: three criteria + separate direction */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.surface1,
            borderColor: colors.borderSoft,
            shadowColor: colors.textMain,
          },
        ]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSubtle }]}>Sort</ThemedText>

        <View style={styles.buttonRow}>
          {(['date', 'amount', 'category'] as const).map(field => (
            <ControlButton
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              isActive={filters.sortField === field}
              colors={colors}
              onPress={() =>
                onChangeFilter({
                  ...filters,
                  sortField: field,
                })
              }
            />
          ))}
        </View>

        <View style={[styles.buttonRow, styles.directionRow]}>
          <ControlButton
            label="Asc ↑"
            isActive={filters.sortDirection === 'asc'}
            colors={colors}
            onPress={() =>
              onChangeFilter({
                ...filters,
                sortDirection: 'asc',
              })
            }
          />
          <ControlButton
            label="Desc ↓"
            isActive={filters.sortDirection === 'desc'}
            colors={colors}
            onPress={() =>
              onChangeFilter({
                ...filters,
                sortDirection: 'desc',
              })
            }
          />
        </View>
      </View>

      {/* Grouping */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.surface1,
            borderColor: colors.borderSoft,
            shadowColor: colors.textMain,
          },
        ]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSubtle }]}>
          Group by
        </ThemedText>
        <View style={styles.buttonRow}>
          {(['none', 'month', 'category'] as const).map(g => (
            <ControlButton
              key={g}
              label={g === 'none' ? 'None' : g.charAt(0).toUpperCase() + g.slice(1)}
              isActive={grouping === g}
              colors={colors}
              onPress={() => onChangeGrouping(g)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const ControlButton = ({
  label,
  isActive,
  colors,
  onPress,
}: {
  label: string;
  isActive: boolean;
  colors: {
    surface1: string;
    borderSoft: string;
    primaryAccent: string;
    textMain: string;
    textMuted: string;
  };
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.button,
      { backgroundColor: 'transparent', borderColor: 'transparent' },
      isActive && {
        backgroundColor: colors.primaryAccent,
        borderColor: colors.primaryAccent,
        shadowColor: colors.primaryAccent,
      },
    ]}>
    <ThemedText
      style={[
        styles.buttonText,
        { color: colors.textMuted },
        isActive && styles.buttonTextActive,
      ]}>
      {label}
    </ThemedText>
  </Pressable>
);

const styles = StyleSheet.create({
  grid: { gap: 12, marginTop: 12 },
  section: {
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  directionRow: {
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  buttonActive: {
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: { fontSize: 12, fontWeight: '500' },
  buttonTextActive: { color: '#fff' },
});
