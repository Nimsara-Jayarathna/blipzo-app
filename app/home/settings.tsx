import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createCategory,
  deleteCategory,
  getCategories,
  setDefaultCategory,
} from '@/api/categories';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import type { Category } from '@/types';

import {
  HOME_CONTENT_PADDING_H,
  HOME_CONTENT_PADDING_TOP,
  HOME_CONTENT_PADDING_BOTTOM,
} from '@/components/home/layout/spacing';

// Importing components directly from their files
import { CategoryTabs } from '@/components/home/settings/CategoryTabs';
import { AddCategoryInput } from '@/components/home/settings/AddCategoryInput';
import { CategoryList } from '@/components/home/settings/CategoryList';

const categoryKey = ['categories'];
const getCategoryId = (cat: Category) => cat._id ?? cat.id ?? '';

export default function SettingsScreen() {
  const { isAuthenticated } = useAuth();
  const { resolvedTheme } = useAppTheme();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Data Fetching
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: categoryKey,
    queryFn: getCategories,
    enabled: isAuthenticated,
  });

  // Derived State
  const incomeCategories = useMemo(
    () => (categories ?? []).filter(item => item.type === 'income'),
    [categories]
  );
  const expenseCategories = useMemo(
    () => (categories ?? []).filter(item => item.type === 'expense'),
    [categories]
  );

  const defaultIncomeId =
    incomeCategories.find(c => c.isDefault)?._id ??
    incomeCategories.find(c => c.isDefault)?.id;

  const defaultExpenseId =
    expenseCategories.find(c => c.isDefault)?._id ??
    expenseCategories.find(c => c.isDefault)?.id;

  const MAX_PER_TYPE = 10;
  const currentList = activeTab === 'income' ? incomeCategories : expenseCategories;
  const currentDefaultId = activeTab === 'income' ? defaultIncomeId : defaultExpenseId;
  const isFull = currentList.length >= MAX_PER_TYPE;

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKey }),
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCategory({
        name: newCategoryName.trim(),
        type: activeTab,
      }),
    onSuccess: () => {
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: categoryKey });
    },
  });

  // Handlers
  const handleDelete = (category: Category) => {
    const id = getCategoryId(category);
    if (!id || category.isDefault) return;
    deleteMutation.mutate(id);
  };

  const handleSetDefault = (category: Category) => {
    const id = getCategoryId(category);
    if (!id || id === currentDefaultId) return;
    setDefaultMutation.mutate(id);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim() || isFull) return;
    createMutation.mutate();
  };

  const deletingId = deleteMutation.isPending ? deleteMutation.variables : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          {createMutation.isPending && <ActivityIndicator size="small" />}
        </View>

        {/* Error Message */}
        {isError && (
          <TouchableOpacity
            onPress={() => refetch()}
            style={[
              styles.errorBox,
              {
                backgroundColor:
                  resolvedTheme === 'dark' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(231,76,60,0.1)',
                borderColor:
                  resolvedTheme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(231,76,60,0.2)',
              },
            ]}>
            <ThemedText style={[styles.errorText, { color: '#ef4444' }]}>
              Failed to load categories. Tap to retry.
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Tab Selection */}
        <CategoryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          incomeCount={incomeCategories.length}
          expenseCount={expenseCategories.length}
          maxCount={MAX_PER_TYPE}
        />

        {/* Input Field */}
        <AddCategoryInput
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          onAdd={handleCreateCategory}
          activeTab={activeTab}
          isFull={isFull}
          isLoading={createMutation.isPending}
        />

        {/* List Display */}
        <CategoryList
          data={currentList}
          activeTab={activeTab}
          isLoading={isLoading}
          defaultId={currentDefaultId}
          deletingId={deletingId}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: HOME_CONTENT_PADDING_H,
    paddingTop: HOME_CONTENT_PADDING_TOP,
    paddingBottom: HOME_CONTENT_PADDING_BOTTOM,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 20,
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  errorText: {
    textDecorationLine: 'underline',
  },
});
