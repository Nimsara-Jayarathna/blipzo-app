import dayjs from 'dayjs';
import React from 'react';
import { FlatList, SectionList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { HOME_LIST_BOTTOM_PADDING } from '@/components/home/layout/spacing';
import type { Transaction } from '@/types';
import type { GroupedSection } from '@/hooks/home/useTransactionLogic';
import { TransactionRow } from '@/components/home/TransactionRow';

interface Props {
  data: Transaction[];
  groupedData: GroupedSection[] | null;
  HeaderComponent: React.ComponentType<any>;
}

export function TransactionList({ data, groupedData, HeaderComponent }: Props) {
  const { colors } = useAppTheme();
  // If grouped, use SectionList
  if (groupedData) {
    return (
      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        ListHeaderComponent={HeaderComponent}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title, data } }) => (
          <View
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.surfaceGlassThick,
                borderBottomColor: colors.borderSoft,
              },
            ]}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionAccentBar, { backgroundColor: colors.primaryAccent }]} />
              <ThemedText style={[styles.sectionTitle, { color: colors.textMain }]}>
                GROUP: {title}
              </ThemedText>
            </View>
            <View
              style={[
                styles.sectionBadge,
                { backgroundColor: colors.surface1, borderColor: colors.borderGlass },
              ]}>
              <ThemedText style={[styles.sectionBadgeText, { color: colors.primaryAccent }]}>
                {data.length} ITEMS
              </ThemedText>
            </View>
          </View>
        )}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    );
  }

  // Otherwise, standard FlatList
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id ?? Math.random().toString()}
      ListHeaderComponent={HeaderComponent}
      renderItem={({ item }) => <TransactionRow transaction={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.center}>
          <ThemedText>No transactions found.</ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: HOME_LIST_BOTTOM_PADDING, gap: 12 },
  center: { padding: 40, alignItems: 'center' },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccentBar: { width: 4, height: 16, borderRadius: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  sectionBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  sectionBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
