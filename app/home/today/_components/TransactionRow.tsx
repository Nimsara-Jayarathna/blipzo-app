import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import type { Transaction } from '@/types';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { colors, resolvedTheme } = useAppTheme();
  const isIncome = transaction.type === 'income';
  const color = resolvedTheme === 'dark'
    ? isIncome
      ? '#22c55e'
      : '#ef4444'
    : isIncome
      ? '#16a34a'
      : '#dc2626';
  const dotBackground = resolvedTheme === 'dark'
    ? isIncome
      ? 'rgba(34, 197, 94, 0.2)'
      : 'rgba(239, 68, 68, 0.2)'
    : isIncome
      ? '#d4efdf'
      : '#fadbd8';
  const displayTitle = transaction.title || transaction.categoryName || 'Untitled';
  const timeString = dayjs(transaction.date).format('h:mm A');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceGlass, borderColor: colors.borderSoft },
      ]}>
      <View
        style={[
          styles.iconDot,
          { backgroundColor: dotBackground },
        ]}
      >
        <View style={[styles.innerDot, { backgroundColor: color }]} />
      </View>

      <View style={styles.info}>
        <ThemedText style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>
          {displayTitle}
        </ThemedText>
        <ThemedText style={[styles.meta, { color: colors.textMuted }]}>
          {transaction.categoryName ? `${transaction.categoryName} • ` : ''}
          {timeString}
        </ThemedText>
      </View>

      <ThemedText style={[styles.amount, { color }]}>
        {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TransactionRow;
