import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { deleteTransaction, getTransactionsFiltered, type TransactionFilters } from '@/api/transactions';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/context/OfflineContext';
import { TransactionList } from '@/components/home/all/TransactionList';
import { HomeContent } from '@/components/home/layout/HomeContent';
import { HomeStickyHeader } from '@/components/home/layout/HomeStickyHeader';
import {
  HOME_BOTTOM_BAR_CLEARANCE,
  HOME_STICKY_HEADER_COLLAPSED_HEIGHT,
  HOME_STICKY_HEADER_EXPANDED_HEIGHT,
} from '@/components/home/layout/spacing';
import {
  type AllFilters,
  type Grouping,
  useGroupedTransactions,
  useTransactionCategories,
} from '@/hooks/home/useTransactionLogic';
import { AllFiltersSheet } from '@/components/home/all/AllFiltersSheet';

export default function AllTransactionsScreen() {
  const { isAuthenticated } = useAuth();
  const { offlineMode, capabilities, startupOfflineLock } = useOffline();
  const queryClient = useQueryClient();
  const today = dayjs().format('YYYY-MM-DD');

  const [filters, setFilters] = useState<AllFilters>({
    startDate: today, endDate: today,
    typeFilter: 'all', categoryFilter: 'all',
    sortField: 'date', sortDirection: 'desc',
  });
  const [grouping, setGrouping] = useState<Grouping>('none');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const [listLayoutHeight, setListLayoutHeight] = useState(0); 
  const [contentHeight, setContentHeight] = useState(0); 

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'all', filters],
    queryFn: () => getTransactionsFiltered({
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.typeFilter === 'all' ? undefined : filters.typeFilter,
      sortBy: filters.sortField,
      sortDir: filters.sortDirection,
    } as TransactionFilters),
    // Offline: blocked by navigation guard; local data can be wired in later.
    enabled: isAuthenticated && !offlineMode,
  });

  const filteredTransactions = data?.transactions ?? [];
  const { categoriesForType } = useTransactionCategories(filters, setFilters);
  const groupedData = useGroupedTransactions(filteredTransactions, grouping);

  const typeLabel = filters.typeFilter === 'all' ? 'All types' : filters.typeFilter === 'income' ? 'Income' : 'Expense';
  const formatRange = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (start.isSame(end, 'day')) return start.format('DD MMM YYYY');
    return `${start.format('DD MMM')} – ${end.format('DD MMM YYYY')}`;
  };
  const collapsedSummary = `${formatRange(filters.startDate, filters.endDate)} • ${typeLabel}`;

  const { canScroll, enableTransition } = useMemo(() => {
    const distanceToCollapse = HOME_STICKY_HEADER_EXPANDED_HEIGHT - HOME_STICKY_HEADER_COLLAPSED_HEIGHT;
    const scrollRunway = contentHeight - listLayoutHeight;

    if (scrollRunway <= 1) return { canScroll: false, enableTransition: false };
    if (scrollRunway < (distanceToCollapse + 10)) return { canScroll: true, enableTransition: false };
    return { canScroll: true, enableTransition: true };
  }, [contentHeight, listLayoutHeight]);

  if (offlineMode && startupOfflineLock) {
    return <View style={styles.offlineBlock} />;
  }

  return (
    <HomeContent bleedBottom>
      <HomeStickyHeader
        variant="all"
        filters={filters}
        grouping={grouping}
        isLoading={isLoading}
        onOpenFilters={() => setIsFiltersOpen(true)}
        collapsedSummary={collapsedSummary}
        disableTransition={!enableTransition} // Apply switch
      >
        {({ onScroll, contentContainerStyle }) => (
          <View style={styles.listWrapper}>
            <TransactionList
              data={filteredTransactions}
              groupedData={groupedData}
              HeaderComponent={() => null}
              onDelete={(id) => deleteMutation.mutate(id)}
              canDelete={capabilities.canDelete}
              openNoteId={openNoteId}
              onToggleNote={(id) => setOpenNoteId(current => (current === id ? null : id))}
              onRowPress={() => setOpenNoteId(null)}
              scrollEnabled={canScroll}
              onScroll={enableTransition ? onScroll : undefined}
              contentContainerStyle={[contentContainerStyle, { paddingBottom: HOME_BOTTOM_BAR_CLEARANCE }]}
              onLayout={(event) => setListLayoutHeight(event.nativeEvent.layout.height)}
              onContentSizeChange={(_, height) => setContentHeight(height)}
            />
          </View>
        )}
      </HomeStickyHeader>

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
  listWrapper: { flex: 1 },
  offlineBlock: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
