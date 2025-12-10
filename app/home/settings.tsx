import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
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
import { ProfileHeader } from '@/components/ProfileHeader';
import { useAuth } from '@/hooks/useAuth';
import type { Category } from '@/types';
import { HomeBackground } from './_components/HomeBackground';

const categoryKey = ['categories'];

// Helper to handle inconsistent API ID types
const getCategoryId = (cat: Category) => cat._id ?? cat.id ?? '';

export default function SettingsScreen() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // UX: Use a tab system instead of side-by-side columns for mobile
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [newCategoryName, setNewCategoryName] = useState('');

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

  // Derived state
  const incomeCategories = useMemo(
    () => (categories ?? []).filter(item => item.type === 'income'),
    [categories]
  );
  const expenseCategories = useMemo(
    () => (categories ?? []).filter(item => item.type === 'expense'),
    [categories]
  );

  // Calculate defaults on the fly
  const defaultIncomeId =
    incomeCategories.find(c => c.isDefault)?._id ??
    incomeCategories.find(c => c.isDefault)?.id;
  const defaultExpenseId =
    expenseCategories.find(c => c.isDefault)?._id ??
    expenseCategories.find(c => c.isDefault)?.id;

  const MAX_PER_TYPE = 10;
  const currentList = activeTab === 'income' ? incomeCategories : expenseCategories;
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
    if (!id) return;

    // Match web behavior: do not delete default categories.
    if (category.isDefault) {
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleSetDefault = (category: Category) => {
    const id = getCategoryId(category);
    if (!id) return;

    const currentDefault = category.type === 'income' ? defaultIncomeId : defaultExpenseId;
    if (id === currentDefault) return;

    setDefaultMutation.mutate(id);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim() || isFull) return;
    createMutation.mutate();
  };

  const isBusy =
    createMutation.isPending || deleteMutation.isPending || setDefaultMutation.isPending;

  return (
    <HomeBackground>
      <ProfileHeader
        user={user ? { name: user.name ?? user.email, avatarUrl: undefined } : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & busy state */}
          <View style={styles.headerRow}>
            {isBusy && <ActivityIndicator size="small" />}
          </View>

          {isError && (
            <TouchableOpacity onPress={() => refetch()} style={styles.errorBox}>
              <ThemedText style={styles.errorText}>
                Failed to load. Tap to retry.
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Type toggles (tabs) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'income' && styles.tabActiveIncome]}
              onPress={() => setActiveTab('income')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'income' && styles.tabTextActiveIncome,
                ]}
              >
                Income ({incomeCategories.length}/{MAX_PER_TYPE})
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'expense' && styles.tabActiveExpense]}
              onPress={() => setActiveTab('expense')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'expense' && styles.tabTextActiveExpense,
                ]}
              >
                Expense ({expenseCategories.length}/{MAX_PER_TYPE})
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Input area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`New ${activeTab} category...`}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              onSubmitEditing={handleCreateCategory}
              returnKeyType="done"
              editable={!isFull && !createMutation.isPending}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                (!newCategoryName.trim() || isFull) && styles.addButtonDisabled,
              ]}
              onPress={handleCreateCategory}
              disabled={!newCategoryName.trim() || isFull}
            >
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {isFull && (
            <ThemedText style={styles.limitWarning}>
              Maximum limit reached for {activeTab} categories.
            </ThemedText>
          )}

          {/* List */}
          <View style={styles.listContainer}>
            {isLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
              currentList.map(item => {
                const id = getCategoryId(item);
                const isDefault =
                  activeTab === 'income'
                    ? id === defaultIncomeId
                    : id === defaultExpenseId;
                const canDelete = !isDefault;
                const isDeleting =
                  deleteMutation.isPending && deleteMutation.variables === id;

                return (
                  <CategoryRow
                    key={id}
                    category={item}
                    isDefault={isDefault}
                    canDelete={canDelete}
                    isDeleting={isDeleting}
                    onDelete={() => {
                      if (canDelete && !isDeleting) {
                        handleDelete(item);
                      }
                    }}
                    onSetDefault={() => handleSetDefault(item)}
                  />
                );
              })
            )}

            {!isLoading && currentList.length === 0 && (
              <ThemedText style={styles.emptyText}>
                No {activeTab} categories yet.
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </HomeBackground>
  );
}

const CategoryRow = ({
  category,
  isDefault,
  canDelete,
  isDeleting,
  onDelete,
  onSetDefault,
}: {
  category: Category;
  isDefault: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onSetDefault: () => void;
}) => {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryInfo}>
        <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
      </View>

      <View style={styles.categoryActions}>
        {/* Default star: ★ when default, ☆ otherwise */}
        <TouchableOpacity
          onPress={!isDefault ? onSetDefault : undefined}
          disabled={isDefault}
          style={styles.iconButton}
        >
          <ThemedText style={[styles.iconDefault, isDefault && styles.iconDefaultActive]}>
            {isDefault ? '★' : '☆'}
          </ThemedText>
        </TouchableOpacity>

        {/* Delete cross: red when deletable, black/disabled when not */}
        <TouchableOpacity
          onPress={onDelete}
          disabled={!canDelete || isDeleting}
          style={styles.iconButton}
        >
          {isDeleting && canDelete ? (
            <ActivityIndicator size="small" color="#e74c3c" />
          ) : (
            <ThemedText
              style={[
                styles.iconDelete,
                (!canDelete || isDeleting) && styles.iconDeleteDisabled,
              ]}
            >
              ×
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorBox: {
    padding: 10,
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActiveIncome: {
    backgroundColor: '#e8f5e9',
  },
  tabActiveExpense: {
    backgroundColor: '#ffebee',
  },
  tabText: {
    fontWeight: '600',
    color: '#7f8c8d',
  },
  tabTextActiveIncome: {
    color: '#2ecc71',
  },
  tabTextActiveExpense: {
    color: '#e74c3c',
  },
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  limitWarning: {
    fontSize: 12,
    color: '#e67e22',
    marginBottom: 8,
    textAlign: 'center',
  },
  // List Styles
  listContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 16,
    minHeight: 200,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  iconDefault: {
    fontSize: 26,
    lineHeight: 26,
    color: '#f1c40f',
  },
  iconDefaultActive: {
    opacity: 0.85,
  },
  iconDelete: {
    fontSize: 26,
    lineHeight: 26,
    color: '#e74c3c',
  },
  iconDeleteDisabled: {
    color: '#000000',
  },
});

