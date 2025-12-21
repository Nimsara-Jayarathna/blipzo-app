import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  activeTab: 'income' | 'expense';
  onTabChange: (tab: 'income' | 'expense') => void;
  incomeCount: number;
  expenseCount: number;
  maxCount: number;
};

export function CategoryTabs({
  activeTab,
  onTabChange,
  incomeCount,
  expenseCount,
  maxCount,
}: Props) {
  const { colors, resolvedTheme } = useAppTheme();
  const incomeBg = resolvedTheme === 'dark' ? 'rgba(34, 197, 94, 0.18)' : '#e8f5e9';
  const expenseBg = resolvedTheme === 'dark' ? 'rgba(239, 68, 68, 0.18)' : '#ffebee';

  return (
    <View
      style={[
        styles.tabContainer,
        { backgroundColor: colors.surfaceGlass, borderColor: colors.borderSoft },
      ]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'income' && { backgroundColor: incomeBg }]}
        onPress={() => onTabChange('income')}>
        <ThemedText
          style={[
            styles.tabText,
            { color: colors.textMuted },
            activeTab === 'income' && { color: '#22c55e' },
          ]}>
          Income ({incomeCount}/{maxCount})
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'expense' && { backgroundColor: expenseBg }]}
        onPress={() => onTabChange('expense')}>
        <ThemedText
          style={[
            styles.tabText,
            { color: colors.textMuted },
            activeTab === 'expense' && { color: '#ef4444' },
          ]}>
          Expense ({expenseCount}/{maxCount})
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontWeight: '600',
  },
});
