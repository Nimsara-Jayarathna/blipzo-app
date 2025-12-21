import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { deleteTransaction, getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction } from '@/types';
import { TransactionRow } from '@/components/home/TransactionRow';
import { HOME_LIST_BOTTOM_PADDING, HOME_LIST_ITEM_GAP } from '@/components/home/layout/spacing';
import { HomeContent } from '@/components/home/layout/HomeContent';
import { HomeStickyHeader } from '@/components/home/layout/HomeStickyHeader';

const transactionKey = ['transactions'];

export default function TodayScreen() {
  const { isAuthenticated } = useAuth();
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const todayDate = dayjs().format('YYYY-MM-DD');
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

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
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryAccent} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.center}>
          <ThemedText>Unable to load dashboard data.</ThemedText>
          <ThemedText
            onPress={() => refetch()}
            style={[styles.retryText, { color: colors.primaryAccent }]}>
            Tap to retry
          </ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <ThemedText style={styles.emptyText}>No activity today.</ThemedText>
        <ThemedText style={[styles.emptySubText, { color: colors.textMuted }]}>
          Tap the + button to add one.
        </ThemedText>
      </View>
    );
  };

  return (
    <HomeContent bleedBottom>
      <HomeStickyHeader variant="today" income={income} expense={expense} balance={balance}>
        {({ onScroll, contentContainerStyle }) => (
          <Pressable style={styles.listWrapper} onPress={() => setOpenNoteId(null)}>
            <Animated.FlatList
              data={transactions}
              keyExtractor={getKey}
              contentContainerStyle={[
                styles.listContent,
                contentContainerStyle,
                transactions.length === 0 ? styles.listEmptyContent : null,
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={colors.primaryAccent}
                />
              }
              onScroll={onScroll}
              scrollEventThrottle={16}
              ListEmptyComponent={renderEmptyState}
              renderItem={({ item }) => {
                const id = item._id ?? item.id ?? '';
                return (
                  <TransactionRow
                    transaction={item}
                    mode="today"
                    onDelete={(deleteId) => deleteMutation.mutate(deleteId)}
                    isNoteOpen={Boolean(id && openNoteId === id)}
                    onToggleNote={() =>
                      setOpenNoteId(current => (current === id ? null : id))
                    }
                    onRowPress={() => setOpenNoteId(null)}
                  />
                );
              }}
            />
          </Pressable>
        )}
      </HomeStickyHeader>
    </HomeContent>
  );
}

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1,
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
    gap: HOME_LIST_ITEM_GAP,
  },
  listEmptyContent: {
    flexGrow: 1,
  },
});
