import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  View, 
  RefreshControl 
} from 'react-native';

import { getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction } from '@/types';
import { SummaryCard } from '@/components/home/today/SummaryCard';
import { TransactionRow } from '@/components/home/TransactionRow';
import { HOME_LIST_BOTTOM_PADDING } from '@/components/home/layout/spacing';
import { HomeContent } from '@/components/home/layout/HomeContent';

const transactionKey = ['transactions'];

export default function TodayScreen() {
  const { isAuthenticated } = useAuth();
  const { colors } = useAppTheme();
  const todayDate = dayjs().format('YYYY-MM-DD');

  const {
    data: todayData,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: [...transactionKey, 'today', todayDate],
    queryFn: () =>
      getTransactionsFiltered({
        startDate: todayDate,
        endDate: todayDate,
      } as TransactionFilters),
    enabled: isAuthenticated,
  });

  // PERF: Calculate derived state directly (no useEffect needed)
  const { transactions, income, expense, balance } = useMemo(() => {
    const items = todayData?.transactions ?? [];
    
    let inc = 0;
    let exp = 0;

    items.forEach(item => {
      if (item.type === 'income') inc += item.amount;
      else if (item.type === 'expense') exp += item.amount;
    });

    return {
      transactions: items,
      income: inc,
      expense: exp,
      balance: inc - exp,
    };
  }, [todayData]);

  // Helper for IDs
  const getKey = (item: Transaction) => item._id ?? item.id ?? Math.random().toString();

  return (
    <HomeContent>
      <View style={styles.summaryWrapper}>
        <SummaryCard income={income} expense={expense} balance={balance} />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryAccent} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <ThemedText>Unable to load dashboard data.</ThemedText>
          <ThemedText
            onPress={() => refetch()}
            style={[styles.retryText, { color: colors.primaryAccent }]}>
            Tap to retry
          </ThemedText>
        </View>
      )}

      {!isLoading && !isError && transactions.length === 0 ? (
        <View style={styles.center}>
          <ThemedText style={styles.emptyText}>No activity today.</ThemedText>
          <ThemedText style={[styles.emptySubText, { color: colors.textMuted }]}>
            Tap the + button to add one.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={getKey}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primaryAccent}
            />
          }
          renderItem={({ item }) => <TransactionRow transaction={item} />}
        />
      )}
    </HomeContent>
  );
}

const styles = StyleSheet.create({
  summaryWrapper: {
    marginBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  retryText: {
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    opacity: 0.6,
  },
  listContent: {
    paddingBottom: HOME_LIST_BOTTOM_PADDING,
    gap: 12,
  },
});
