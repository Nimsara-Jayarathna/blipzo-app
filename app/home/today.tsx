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
import { SummaryCard } from '@/components/home/today/SummaryCard';
import { TransactionRow } from '@/components/home/TransactionRow';
import { HOME_LIST_BOTTOM_PADDING } from '@/components/home/layout/spacing';
import { HomeContent } from '@/components/home/layout/HomeContent';
import { StickyHeaderShell } from '@/components/home/layout/StickyHeaderShell';

const transactionKey = ['transactions'];
const SUMMARY_EXPANDED_HEIGHT = 224;
const SUMMARY_COLLAPSED_HEIGHT = 56;
const SUMMARY_LIST_GAP = 20;

export default function TodayScreen() {
  const { isAuthenticated } = useAuth();
  const { colors, resolvedTheme } = useAppTheme();
  const queryClient = useQueryClient();
  const todayDate = dayjs().format('YYYY-MM-DD');
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [summaryHeight, setSummaryHeight] = useState(0);
  const expenseColor = resolvedTheme === 'dark' ? '#ef4444' : '#dc2626';
  const formatMoney = (val: number) =>
    `$${(Number.isFinite(val) ? Math.abs(val) : 0).toFixed(2)}`;

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
      <StickyHeaderShell
        expandedHeight={Math.max(SUMMARY_EXPANDED_HEIGHT, summaryHeight + SUMMARY_LIST_GAP)}
        collapsedHeight={SUMMARY_COLLAPSED_HEIGHT}
        contentTopPadding={SUMMARY_LIST_GAP}
        renderExpanded={() => (
          <View
            style={styles.summaryWrapper}
            onLayout={(event) => setSummaryHeight(event.nativeEvent.layout.height)}
          >
            <SummaryCard income={income} expense={expense} balance={balance} />
          </View>
        )}
        renderCollapsed={() => (
          <View
            style={[
              styles.summaryCollapsed,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <ThemedText style={[styles.collapsedLabel, { color: colors.textSubtle }]}>
              Today's Balance
            </ThemedText>
            <ThemedText
              style={[
                styles.collapsedValue,
                { color: balance >= 0 ? colors.primaryAccent : expenseColor },
              ]}
            >
              {balance < 0 ? '-' : ''}{formatMoney(balance)}
            </ThemedText>
          </View>
        )}
      >
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
      </StickyHeaderShell>
    </HomeContent>
  );
}

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1,
  },
  summaryWrapper: {
    marginBottom: 0,
  },
  summaryCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SUMMARY_COLLAPSED_HEIGHT,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  collapsedLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  collapsedValue: {
    fontSize: 18,
    fontWeight: '700',
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
  listEmptyContent: {
    flexGrow: 1,
  },
});
