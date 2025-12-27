import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

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
  HOME_BOTTOM_BAR_CLEARANCE,
  HOME_CONTENT_PADDING_H,
} from '@/components/home/layout/spacing';

// Importing components directly from their files
import { CategoryTabs } from '@/components/home/settings/CategoryTabs';
import { AddCategoryInput } from '@/components/home/settings/AddCategoryInput';
import { CategoryList } from '@/components/home/settings/CategoryList';

const categoryKey = ['categories'];
const getCategoryId = (cat: Category) => cat._id ?? cat.id ?? '';
const DEFAULT_CATEGORY_LIMIT = 10;

export default function SettingsScreen() {
  const { isAuthenticated } = useAuth();
  const { resolvedTheme, colors } = useAppTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fixedHeaderHeight, setFixedHeaderHeight] = useState(0);

  // State
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Data Fetching
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: categoryKey,
    queryFn: getCategories,
    enabled: isAuthenticated,
  });

  // Derived State
  const categories = data?.categories ?? [];
  const limit = data?.limit ?? DEFAULT_CATEGORY_LIMIT;

  const incomeCategories = useMemo(
    () => categories.filter(item => item.type === 'income'),
    [categories]
  );
  const expenseCategories = useMemo(
    () => categories.filter(item => item.type === 'expense'),
    [categories]
  );

  const defaultIncomeId =
    incomeCategories.find(c => c.isDefault)?._id ??
    incomeCategories.find(c => c.isDefault)?.id;

  const defaultExpenseId =
    expenseCategories.find(c => c.isDefault)?._id ??
    expenseCategories.find(c => c.isDefault)?.id;

  const currentList = activeTab === 'income' ? incomeCategories : expenseCategories;
  const currentDefaultId = activeTab === 'income' ? defaultIncomeId : defaultExpenseId;
  const isFull = currentList.length >= limit;
  const currentCount = currentList.length;
  const normalizedNewName = newCategoryName.trim().toLowerCase();
  const isDuplicateName =
    normalizedNewName.length > 0 &&
    currentList.some(item => item.name.trim().toLowerCase() === normalizedNewName);

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
    if (isDuplicateName) {
      Alert.alert('Duplicate category', 'That category already exists for this type.');
      return;
    }
    createMutation.mutate();
  };

  const deletingId = deleteMutation.isPending ? deleteMutation.variables : undefined;

  const isDark = resolvedTheme === 'dark';
  const headerBlurIntensity = isDark ? 30 : 22;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <View style={styles.screen}>
        <View
          style={styles.fixedHeader}
          onLayout={event => setFixedHeaderHeight(event.nativeEvent.layout.height)}
        >
          <View
            style={[
              styles.backHeaderSafe,
              { backgroundColor: colors.surface1, paddingTop: insets.top },
            ]}
          >
            <View
              style={[
                styles.backHeaderShadow,
                { backgroundColor: colors.surface1, shadowColor: colors.textMain },
              ]}
            >
              <View style={styles.backHeaderContent}>
                <Pressable
                  onPress={() => router.navigate('/home/profile')}
                  style={styles.backLink}
                  accessibilityRole="button"
                  accessibilityLabel="Back to category setting"
                >
                  <View
                    style={[
                      styles.backIconCircle,
                      { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
                    ]}
                  >
                    <MaterialIcons name="chevron-left" size={18} color={colors.textMain} />
                  </View>
                  <ThemedText style={[styles.backLabel, { color: colors.textMain }]}>
                    Category setting
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={[styles.blurredControls, { paddingHorizontal: HOME_CONTENT_PADDING_H }]}>
            <BlurView
              intensity={headerBlurIntensity}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View>
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
                        resolvedTheme === 'dark'
                          ? 'rgba(239, 68, 68, 0.16)'
                          : 'rgba(231,76,60,0.1)',
                      borderColor:
                        resolvedTheme === 'dark'
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(231,76,60,0.2)',
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
                maxCount={limit}
              />

              {/* Input Field */}
              <AddCategoryInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                onAdd={handleCreateCategory}
                activeTab={activeTab}
                isFull={isFull}
                isLoading={createMutation.isPending}
                currentCount={currentCount}
                maxCount={limit}
                isDuplicate={isDuplicateName}
              />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: fixedHeaderHeight + 12,
              paddingBottom: HOME_BOTTOM_BAR_CLEARANCE,
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backHeaderSafe: {
    width: '100%',
  },
  backHeaderShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  backHeaderContent: {
    paddingHorizontal: HOME_CONTENT_PADDING_H,
    paddingVertical: 10,
  },
  blurredControls: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 0,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: '500',
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
  listContent: {
    paddingHorizontal: HOME_CONTENT_PADDING_H,
  },
});
