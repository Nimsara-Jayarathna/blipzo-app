import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ProfileHeader } from '@/components/ProfileHeader';
import { getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction } from '@/types';
import { SummaryCard } from './today/_components/SummaryCard';
import { TransactionRow } from './today/_components/TransactionRow';
import { AddTransactionSheet } from './_components/AddTransactionSheet';

const transactionKey = ['transactions'];

export default function TodayScreen() {
  const { user, isAuthenticated } = useAuth();
  const todayDate = dayjs().format('YYYY-MM-DD');

  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [todayBalance, setTodayBalance] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const {
    data: todayData,
    isLoading: isTodayLoading,
    isError: isTodayError,
  } = useQuery({
    queryKey: [...transactionKey, 'today', todayDate],
    queryFn: () =>
      getTransactionsFiltered({
        startDate: todayDate,
        endDate: todayDate,
      } as TransactionFilters),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const items = todayData?.transactions ?? [];
    setTodayTransactions(items);
    const income = items
      .filter(item => item.type === 'income')
      .reduce((total, item) => total + item.amount, 0);
    const expense = items
      .filter(item => item.type === 'expense')
      .reduce((total, item) => total + item.amount, 0);
    setTodayIncome(income);
    setTodayExpense(expense);
    setTodayBalance(income - expense);
  }, [todayData]);

  return (
    <ThemedView style={styles.screen}>
      <ProfileHeader user={user ? { name: user.name ?? user.email, avatarUrl: undefined } : null} />

      <View style={styles.container}>
        <View style={styles.summaryRow}>
          <SummaryCard label="Income" value={todayIncome} color="#2ecc71" />
          <SummaryCard label="Expenses" value={todayExpense} color="#e74c3c" />
          <SummaryCard label="Balance" value={todayBalance} color="#3498db" />
        </View>

        {isTodayLoading && (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        )}

        {isTodayError && (
          <View style={styles.center}>
            <ThemedText>Unable to load dashboard data.</ThemedText>
          </View>
        )}

        {!isTodayLoading && !isTodayError && todayTransactions.length === 0 ? (
          <View style={styles.center}>
            <ThemedText>
              No activity today. Add a transaction on the web to see it here.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={todayTransactions}
            keyExtractor={item =>
              String(item.id ?? `${item.date}-${item.amount}-${item.title}`)
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <TransactionRow transaction={item} />}
          />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          onPress={() => setIsAddOpen(true)}>
          <ThemedText style={styles.fabText}>+</ThemedText>
        </Pressable>
      </View>

      <AddTransactionSheet
        visible={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    // kept for backwards-compatibility if needed elsewhere;
    // SummaryCard now owns its own styles.
  },
  summaryLabel: {
    // moved into SummaryCard component
  },
  summaryValue: {
    // moved into SummaryCard component
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  listContent: {
    paddingBottom: 4,
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
  },
});
