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
import {
  HOME_BOTTOM_BAR_CLEARANCE,
  HOME_LIST_ITEM_GAP,
  HOME_STICKY_HEADER_COLLAPSED_HEIGHT,
  HOME_STICKY_HEADER_EXPANDED_HEIGHT,
} from '@/components/home/layout/spacing';
import { HomeContent } from '@/components/home/layout/HomeContent';
import { HomeStickyHeader } from '@/components/home/layout/HomeStickyHeader';

const transactionKey = ['transactions'];

export default function TodayScreen() {
  const { isAuthenticated } = useAuth();
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const todayDate = dayjs().format('YYYY-MM-DD');
  
  // PRECISION MEASUREMENTS
  const [listLayoutHeight, setListLayoutHeight] = useState(0); 
  const [contentHeight, setContentHeight] = useState(0); 
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

  // --- THE BULLETPROOF LOGIC (SAME AS ALL SCREEN) ---
  const { canScroll, enableTransition } = useMemo(() => {
    // 1. Distance header needs to move (168px)
    const distanceToCollapse = HOME_STICKY_HEADER_EXPANDED_HEIGHT - HOME_STICKY_HEADER_COLLAPSED_HEIGHT;

    // 2. The Total Available Scroll distance (Total Height minus the visible box)
    const totalAvailableScroll = contentHeight - listLayoutHeight;

    // CASE 1: Content fits perfectly within the window.
    if (totalAvailableScroll <= 1) {
      return { canScroll: false, enableTransition: false };
    }

    // CASE 2: Scrolling is possible, but NOT enough for full header transformation.
    // Buffer of 10px added for sub-pixel stability.
    if (totalAvailableScroll < (distanceToCollapse + 10)) {
      return { canScroll: true, enableTransition: false };
    }

    // CASE 3: Full transition allowed.
    return { canScroll: true, enableTransition: true };
  }, [contentHeight, listLayoutHeight]);

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
      <HomeStickyHeader 
        variant="today" 
        income={income} 
        expense={expense} 
        balance={balance}
        // MASTER SWITCH: Prevents halfway overlap in Case 2
        disableTransition={!enableTransition} 
      >
        {({ onScroll, contentContainerStyle }) => (
          <Pressable style={styles.listWrapper} onPress={() => setOpenNoteId(null)}>
            <Animated.FlatList
              data={transactions}
              keyExtractor={(item) => item._id ?? item.id ?? Math.random().toString()}
              
              // Apply Threshold Logic
              scrollEnabled={canScroll}
              onScroll={enableTransition ? onScroll : undefined}
              scrollEventThrottle={16}
              
              contentContainerStyle={[
                styles.listContent,
                contentContainerStyle,
                // Ensure list ends clearly above the navigation bar
                { paddingBottom: HOME_BOTTOM_BAR_CLEARANCE },
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
              
              // Measurement Hooks
              onLayout={(event) => setListLayoutHeight(event.nativeEvent.layout.height)}
              onContentSizeChange={(_, height) => setContentHeight(height)}
              
              ListEmptyComponent={renderEmptyState}
              renderItem={({ item }) => {
                const id = item._id ?? item.id ?? '';
                return (
                  <TransactionRow
                    transaction={item}
                    mode="today"
                    onDelete={(delId) => deleteMutation.mutate(delId)}
                    isNoteOpen={Boolean(id && openNoteId === id)}
                    onToggleNote={() => setOpenNoteId(curr => (curr === id ? null : id))}
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
    paddingVertical: 80,
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
    gap: HOME_LIST_ITEM_GAP,
  },
  listEmptyContent: {
    flexGrow: 1,
  },
});
