import dayjs from 'dayjs';
import React from 'react';
import { FlatList, SectionList, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { Transaction } from '@/types';
import type { GroupedSection } from '../_hooks/useTransactionLogic';

interface Props {
  data: Transaction[];
  groupedData: GroupedSection[] | null;
  HeaderComponent: React.ComponentType<any>;
}

export function TransactionList({ data, groupedData, HeaderComponent }: Props) {
  // If grouped, use SectionList
  if (groupedData) {
    return (
      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        ListHeaderComponent={HeaderComponent}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionAccentBar} />
              <ThemedText style={styles.sectionTitle}>GROUP: {title}</ThemedText>
            </View>
            <View style={styles.sectionBadge}>
              <ThemedText style={styles.sectionBadgeText}>{data.length} ITEMS</ThemedText>
            </View>
          </View>
        )}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false} // Clean card look
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
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.center}>
          <ThemedText>No transactions found.</ThemedText>
        </View>
      }
    />
  );
}

// --- Row Component (Matching Web Design) ---
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';
  const displayCategory =
    typeof transaction.category === 'string'
      ? transaction.category
      : transaction.category?.name ?? transaction.title ?? 'Uncategorised';

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <ThemedText style={styles.dateText}>
          {dayjs(transaction.date).format('MMM D, YYYY')}
        </ThemedText>
        <View style={[styles.typeBadge, isIncome ? styles.bgIncome : styles.bgExpense]}>
          <ThemedText style={[styles.typeText, isIncome ? styles.textIncome : styles.textExpense]}>
            {isIncome ? 'INCOME' : 'EXPENSE'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rowMiddle}>
        <ThemedText style={styles.categoryText} numberOfLines={1}>
          {displayCategory}
        </ThemedText>
        {transaction.note && (
          <ThemedText style={styles.noteText} numberOfLines={1}>
            {transaction.note}
          </ThemedText>
        )}
      </View>

      <View style={styles.rowRight}>
        <ThemedText style={[styles.amountText, isIncome ? styles.textIncome : styles.textExpense]}>
          {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 40 },
  center: { padding: 40, alignItems: 'center' },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginTop: 16,
    borderRadius: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccentBar: { width: 4, height: 16, borderRadius: 2, backgroundColor: '#3498db' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: '#2c3e50', textTransform: 'uppercase' },
  sectionBadge: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(52,152,219,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  sectionBadgeText: { fontSize: 10, fontWeight: '700', color: '#3498db', letterSpacing: 0.5 },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  rowLeft: { width: 80, gap: 4 },
  dateText: { fontSize: 11, color: '#7f8c8d' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  bgIncome: { backgroundColor: 'rgba(46,204,113,0.1)', borderColor: 'rgba(46,204,113,0.2)' },
  bgExpense: { backgroundColor: 'rgba(231,76,60,0.1)', borderColor: 'rgba(231,76,60,0.2)' },
  typeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  textIncome: { color: '#2ecc71' },
  textExpense: { color: '#e74c3c' },
  rowMiddle: { flex: 1, paddingHorizontal: 8 },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#2c3e50' },
  noteText: { fontSize: 11, color: '#95a5a6', fontStyle: 'italic' },
  rowRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 14, fontWeight: '700' },
});