import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import type { Category } from '@/types';
import { CategoryRow } from './CategoryRow';

// Helper for consistent ID handling
const getCategoryId = (cat: Category) => cat._id ?? cat.id ?? '';

type Props = {
  data: Category[];
  activeTab: 'income' | 'expense';
  isLoading: boolean;
  defaultId?: string;
  deletingId?: string;
  onDelete: (cat: Category) => void;
  onSetDefault: (cat: Category) => void;
};

export function CategoryList({
  data,
  activeTab,
  isLoading,
  defaultId,
  deletingId,
  onDelete,
  onSetDefault,
}: Props) {
  const { colors } = useAppTheme();
  if (isLoading) {
    return <ActivityIndicator style={styles.loading} color={colors.primaryAccent} />;
  }

  if (data.length === 0) {
    return (
      <View style={styles.listContainer}>
        <ThemedText style={styles.emptyText}>
          No {activeTab} categories yet.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.listContainer,
        { backgroundColor: colors.surfaceGlass, borderColor: colors.borderSoft },
      ]}>
      {data.map(item => {
        const id = getCategoryId(item);
        const isDefault = id === defaultId;
        const canDelete = !isDefault; // Cannot delete default category
        const isDeleting = deletingId === id;

        return (
          <CategoryRow
            key={id}
            category={item}
            isDefault={isDefault}
            canDelete={canDelete}
            isDeleting={isDeleting}
            onDelete={() => onDelete(item)}
            onSetDefault={() => onSetDefault(item)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 10,
    borderRadius: 20,
    padding: 16,
    minHeight: 200,
    borderWidth: 1,
  },
  loading: {
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
