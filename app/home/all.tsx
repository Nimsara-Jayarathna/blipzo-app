import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { ProfileHeader } from '@/components/ProfileHeader';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { HomeBackground } from '@/components/home/HomeBackground';
import { AddTransactionSheet } from '@/components/home/AddTransactionSheet';
import { TransactionList } from '@/components/home/all/TransactionList';
import SmartFilterHeader from '@/components/home/all/SmartFilterHeader';
import {
  type AllFilters,
  type Grouping,
  useGroupedTransactions,
  useTransactionCategories,
} from '@/hooks/home/useTransactionLogic';
import { AllFiltersSheet } from '@/components/home/all/AllFiltersSheet';

export default function AllTransactionsScreen() {
  const { isAuthenticated, user } = useAuth();
  const { colors } = useAppTheme();
  const today = dayjs().format('YYYY-MM-DD');

  const [filters, setFilters] = useState<AllFilters>({
    startDate: today,
    endDate: today,
    typeFilter: 'all',
    categoryFilter: 'all',
    sortField: 'date',
    sortDirection: 'desc',
  });
  const [grouping, setGrouping] = useState<Grouping>('none');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'all', filters],
    queryFn: () =>
      getTransactionsFiltered({
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: filters.typeFilter === 'all' ? undefined : filters.typeFilter,
        sortBy: filters.sortField,
        sortDir: filters.sortDirection,
      } as TransactionFilters),
    enabled: isAuthenticated,
  });

  const transactions = data?.transactions ?? [];

  const filteredTransactions = transactions.filter(txn => {
    if (filters.categoryFilter === 'all') return true;
    const catId =
      typeof txn.category === 'string'
        ? txn.category
        : txn.category?.id ?? txn.category?._id;
    return catId === filters.categoryFilter;
  });

  const { categoriesForType } = useTransactionCategories(filters, setFilters);
  const groupedData = useGroupedTransactions(filteredTransactions, grouping);

  const typeLabel =
    filters.typeFilter === 'all'
      ? 'All types'
      : filters.typeFilter === 'income'
      ? 'Income'
      : 'Expense';

  const sortLabel =
    filters.sortField === 'date'
      ? `Date (${filters.sortDirection === 'asc' ? '↑' : '↓'})`
      : filters.sortField === 'amount'
      ? `Amount (${filters.sortDirection === 'asc' ? '↑' : '↓'})`
      : `Category (${filters.sortDirection === 'asc' ? '↑' : '↓'})`;

  const groupLabel =
    grouping === 'none' ? 'None' : grouping === 'month' ? 'Month' : 'Category';

  return (
    <HomeBackground>
      <ProfileHeader
        user={
          user ? { name: user.name ?? user.email, avatarUrl: undefined } : null
        }
      />

      <View style={styles.container}>
        <View style={styles.summaryWrapper}>
          <SmartFilterHeader
            filters={filters}
            grouping={grouping}
            isLoading={isLoading}
            onOpenFilters={() => setIsFiltersOpen(true)}
          />
        </View>

        <TransactionList
          data={filteredTransactions}
          groupedData={groupedData}
          HeaderComponent={() => null}
        />

        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primaryAccent },
            pressed && styles.fabPressed,
          ]}
          onPress={() => setIsAddOpen(true)}
        >
          <ThemedText style={styles.fabText}>+</ThemedText>
        </Pressable>
      </View>

      <AddTransactionSheet visible={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <AllFiltersSheet
        visible={isFiltersOpen}
        filters={filters}
        grouping={grouping}
        categories={categoriesForType}
        onClose={() => setIsFiltersOpen(false)}
        onApply={(nextFilters, nextGrouping) => {
          setFilters(nextFilters);
          setGrouping(nextGrouping);
        }}
      />
    </HomeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  summaryWrapper: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  fabText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '400',
    marginTop: -2,
  },
});
