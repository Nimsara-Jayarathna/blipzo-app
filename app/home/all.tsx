import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { deleteTransaction, getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { TransactionList } from '@/components/home/all/TransactionList';
import SmartFilterHeader from '@/components/home/all/SmartFilterHeader';
import { HomeContent } from '@/components/home/layout/HomeContent';
import { StickyHeaderShell } from '@/components/home/layout/StickyHeaderShell';
import {
  type AllFilters,
  type Grouping,
  useGroupedTransactions,
  useTransactionCategories,
} from '@/hooks/home/useTransactionLogic';
import { AllFiltersSheet } from '@/components/home/all/AllFiltersSheet';

const FILTER_EXPANDED_HEIGHT = 196;
const FILTER_COLLAPSED_HEIGHT = 52;

export default function AllTransactionsScreen() {
  const { isAuthenticated } = useAuth();
  const { colors } = useAppTheme();
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

  const formatRange = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (start.isSame(end, 'day')) return start.format('DD MMM YYYY');
    if (start.isSame(end, 'month')) {
      return `${start.format('DD')}–${end.format('DD MMM YYYY')}`;
    }
    if (start.isSame(end, 'year')) {
      return `${start.format('DD MMM')}–${end.format('DD MMM YYYY')}`;
    }
    return `${start.format('DD MMM YYYY')}–${end.format('DD MMM YYYY')}`;
  };

  const collapsedSummary = `${formatRange(filters.startDate, filters.endDate)} • ${typeLabel}`;

  return (
    <HomeContent bleedBottom>
      <StickyHeaderShell
        expandedHeight={FILTER_EXPANDED_HEIGHT}
        collapsedHeight={FILTER_COLLAPSED_HEIGHT}
        renderExpanded={() => (
          <View style={styles.summaryWrapper}>
            <SmartFilterHeader
              filters={filters}
              grouping={grouping}
              isLoading={isLoading}
              onOpenFilters={() => setIsFiltersOpen(true)}
            />
          </View>
        )}
        renderCollapsed={() => (
          <Pressable
            onPress={() => setIsFiltersOpen(true)}
            style={[
              styles.filterCollapsed,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <ThemedText style={[styles.collapsedLabel, { color: colors.textSubtle }]}>
              Filters summary
            </ThemedText>
            <ThemedText
              style={[styles.collapsedValue, { color: colors.textMain }]}
              numberOfLines={1}
            >
              {collapsedSummary}
            </ThemedText>
          </Pressable>
        )}
      >
        {({ onScroll, contentContainerStyle }) => (
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
              contentContainerStyle={contentContainerStyle}
              onScroll={onScroll}
            />
          </Pressable>
        )}
      </StickyHeaderShell>

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
  filterCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    height: FILTER_COLLAPSED_HEIGHT,
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
    fontSize: 14,
    fontWeight: '600',
  },
  listWrapper: {
    flex: 1,
  },
});
