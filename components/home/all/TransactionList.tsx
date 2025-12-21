import dayjs from 'dayjs';
import React from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { HOME_LIST_ITEM_GAP } from '@/components/home/layout/spacing';
import type { Transaction } from '@/types';
import type { GroupedSection } from '@/hooks/home/useTransactionLogic';
import { TransactionRow } from '@/components/home/TransactionRow';

interface Props {
  data: Transaction[];
  groupedData: GroupedSection[] | null;
  HeaderComponent: React.ComponentType<any>;
  onDelete?: (id: string) => void;
  openNoteId?: string | null;
  onToggleNote?: (id: string) => void;
  onRowPress?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: any) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onContentSizeChange?: (width: number, height: number) => void;
  scrollEnabled?: boolean;
}

export function TransactionList({
  data,
  groupedData,
  HeaderComponent,
  onDelete,
  openNoteId,
  onToggleNote,
  onRowPress,
  contentContainerStyle,
  onScroll,
  onLayout,
  onContentSizeChange,
  scrollEnabled,
}: Props) {
  const { colors } = useAppTheme();
  // If grouped, use SectionList
  if (groupedData) {
    return (
      <Animated.SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        ListHeaderComponent={HeaderComponent}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title, data } }) => (
          <View
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.surfaceGlassThick,
                borderBottomColor: colors.borderSoft,
              },
            ]}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionAccentBar, { backgroundColor: colors.primaryAccent }]} />
              <ThemedText style={[styles.sectionTitle, { color: colors.textMain }]}>
                GROUP: {title}
              </ThemedText>
            </View>
            <View
              style={[
                styles.sectionBadge,
                { backgroundColor: colors.surface1, borderColor: colors.borderGlass },
              ]}>
              <ThemedText style={[styles.sectionBadgeText, { color: colors.primaryAccent }]}>
                {data.length} ITEMS
              </ThemedText>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const id = item._id ?? item.id ?? '';
          return (
            <TransactionRow
              transaction={item}
              mode="all"
              onDelete={onDelete}
              isNoteOpen={Boolean(id && openNoteId === id)}
              onToggleNote={() => onToggleNote?.(id)}
              onRowPress={onRowPress}
            />
          );
        }}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
        scrollEnabled={scrollEnabled}
        stickySectionHeadersEnabled={false}
      />
    );
  }

  // Otherwise, standard FlatList
  return (
    <Animated.FlatList
      data={data}
      keyExtractor={(item) => item.id ?? Math.random().toString()}
      ListHeaderComponent={HeaderComponent}
      renderItem={({ item }) => {
        const id = item._id ?? item.id ?? '';
        return (
          <TransactionRow
            transaction={item}
            mode="all"
            onDelete={onDelete}
            isNoteOpen={Boolean(id && openNoteId === id)}
            onToggleNote={() => onToggleNote?.(id)}
            onRowPress={onRowPress}
        />
      );
    }}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={[styles.listContent, contentContainerStyle]}
    onScroll={onScroll}
    scrollEventThrottle={16}
    onLayout={onLayout}
    onContentSizeChange={onContentSizeChange}
    scrollEnabled={scrollEnabled}
    ListEmptyComponent={
      <View style={styles.center}>
        <ThemedText>No transactions found.</ThemedText>
      </View>
    }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { gap: HOME_LIST_ITEM_GAP },
  center: { padding: 40, alignItems: 'center' },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccentBar: { width: 4, height: 16, borderRadius: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  sectionBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  sectionBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
