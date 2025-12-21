import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { deleteTransaction, getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { useAuth } from '@/hooks/useAuth';
import { TransactionList } from '@/components/home/all/TransactionList';
import SmartFilterHeader from '@/components/home/all/SmartFilterHeader';
import { HomeContent } from '@/components/home/layout/HomeContent';
import {
  type AllFilters,
  type Grouping,
  useGroupedTransactions,
  useTransactionCategories,
} from '@/hooks/home/useTransactionLogic';
import { AllFiltersSheet } from '@/components/home/all/AllFiltersSheet';

export default function AllTransactionsScreen() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

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
    <HomeContent>
      <View style={styles.summaryWrapper}>
        <SmartFilterHeader
          filters={filters}
          grouping={grouping}
          isLoading={isLoading}
          onOpenFilters={() => setIsFiltersOpen(true)}
        />
      </View>

      <Pressable style={styles.listWrapper} onPress={() => setOpenNoteId(null)}>
        <TransactionList
          data={filteredTransactions}
          groupedData={groupedData}
          HeaderComponent={() => null}
          onDelete={(id) => deleteMutation.mutate(id)}
          openNoteId={openNoteId}
          onToggleNote={(id) =>
            setOpenNoteId(current => (current === id ? null : id))
          }
          onRowPress={() => setOpenNoteId(null)}
        />
      </Pressable>

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
    </HomeContent>
  );
}

const styles = StyleSheet.create({
  summaryWrapper: {
    marginBottom: 12,
  },
  listWrapper: {
    flex: 1,
  },
});
