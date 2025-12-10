import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTransaction } from '@/api/transactions';
import { getCategories } from '@/api/categories';
import { ThemedText } from '@/components/themed-text';
import type { Category, Transaction, TransactionInput } from '@/types';

type AddTransactionStep = 1 | 2;

type CategoryOption = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
};

type AddTransactionSheetProps = {
  visible: boolean;
  onClose: () => void;
  onTransactionCreated?: (transaction: Transaction) => void;
};

const transactionKey = ['transactions'];
const summaryKey = ['summary'];
const accentColor = '#3498db';

export function AddTransactionSheet({
  visible,
  onClose,
  onTransactionCreated,
}: AddTransactionSheetProps) {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [note, setNote] = useState('');
  const [step, setStep] = useState<AddTransactionStep>(1);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const isTodayDate = dayjs(date).isSame(dayjs(), 'day');

  useEffect(() => {
    if (visible) {
      setStep(1);
      setTransactionType('expense');
      setDate(dayjs().format('YYYY-MM-DD'));
      setAmount('');
      setSelectedCategory('');
      setNote('');
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || step !== 2) return;

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const result = await getCategories();
        const mapped: CategoryOption[] = (result ?? []).map((item: Category) => ({
          id: item.id ?? item._id ?? item.name,
          name: item.name,
          type: item.type,
          isDefault: item.isDefault,
        }));
        setCategories(mapped);
      } catch {
        Alert.alert('Error', 'Unable to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    void loadCategories();
  }, [visible, step]);

  useEffect(() => {
    if (!categories.length) {
      setFilteredCategories([]);
      setSelectedCategory('');
      return;
    }

    const nextFiltered = categories.filter(category => category.type === transactionType);
    setFilteredCategories(nextFiltered);

    if (!nextFiltered.length) {
      setSelectedCategory('');
      return;
    }

    const defaultForType = nextFiltered.find(category => category.isDefault);
    setSelectedCategory(defaultForType?.id ?? nextFiltered[0]?.id ?? '');
  }, [categories, transactionType]);

  const mutation = useMutation({
    mutationFn: (payload: TransactionInput) => createTransaction(payload),
    onSuccess: transaction => {
      queryClient.invalidateQueries({ queryKey: transactionKey });
      queryClient.invalidateQueries({ queryKey: summaryKey });
      onTransactionCreated?.(transaction);
      setAmount('');
      setNote('');
      onClose();
    },
    onError: () => {
      Alert.alert('Error', 'Unable to add transaction');
    },
  });

  const handleSubmit = () => {
    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount)) {
      Alert.alert('Validation', 'Please enter a valid amount');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Validation', 'Please select a category');
      return;
    }

    mutation.mutate({
      amount: numericAmount,
      type: transactionType,
      category: selectedCategory,
      date,
      note: note.trim() ? note.trim() : undefined,
    });
  };

  const handleSelectTypeAndContinue = (selectedType: 'income' | 'expense') => {
    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation', 'Enter a valid amount first');
      return;
    }
    setTransactionType(selectedType);
    setStep(2);
  };

  const handleBackToStepOne = () => {
    setStep(1);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ThemedText type="title" style={styles.title}>
            Add Transaction
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Quickly log income or expenses in two simple steps.
          </ThemedText>

          {step === 1 ? (
            <View style={styles.stepContainer}>
              <ThemedText style={styles.label}>Amount</ThemedText>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                style={styles.input}
              />

              <ThemedText style={[styles.label, styles.stepHint]}>
                Choose type after entering an amount
              </ThemedText>

              <View style={styles.typeRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select income"
                  style={({ pressed }) => [
                    styles.typePill,
                    styles.incomePill,
                    pressed && styles.pillPressed,
                  ]}
                  onPress={() => handleSelectTypeAndContinue('income')}>
                  <ThemedText style={styles.typePillText}>Income</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select expense"
                  style={({ pressed }) => [
                    styles.typePill,
                    styles.expensePill,
                    pressed && styles.pillPressed,
                  ]}
                  onPress={() => handleSelectTypeAndContinue('expense')}>
                  <ThemedText style={styles.typePillText}>Expense</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeaderRow}>
                <Pressable
                  onPress={handleBackToStepOne}
                  accessibilityRole="button"
                  accessibilityLabel="Back to amount step"
                  style={({ pressed }) => [
                    styles.backPill,
                    pressed && styles.pillPressed,
                  ]}>
                  <ThemedText style={styles.backPillText}>{'<'}</ThemedText>
                </Pressable>
                <ThemedText style={styles.stepTag}>
                  {transactionType === 'income' ? 'Income' : 'Expense'}
                </ThemedText>
              </View>

              <ThemedText style={styles.label}>Category</ThemedText>
              <View style={styles.categoriesRow}>
                {isLoadingCategories ? (
                  <ThemedText>Loading categories...</ThemedText>
                ) : filteredCategories.length === 0 ? (
                  <ThemedText>No categories for this type.</ThemedText>
                ) : (
                  filteredCategories.map(category => (
                    <Pressable
                      key={category.id}
                      style={({ pressed }) => [
                        styles.categoryPill,
                        selectedCategory === category.id && styles.categoryPillSelected,
                        pressed && styles.pillPressed,
                      ]}
                      onPress={() => setSelectedCategory(category.id)}>
                      <View style={styles.categoryContentRow}>
                        {category.isDefault && (
                          <ThemedText style={styles.defaultStar}>★</ThemedText>
                        )}
                        <ThemedText
                          style={[
                            styles.categoryPillText,
                            selectedCategory === category.id && styles.categoryPillTextSelected,
                          ]}>
                          {category.name}
                        </ThemedText>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>

              <ThemedText style={styles.label}>Date</ThemedText>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
              {isTodayDate && (
                <ThemedText style={styles.dateHint}>Using today&apos;s date</ThemedText>
              )}

              <ThemedText style={styles.label}>Note (optional)</ThemedText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a short note"
                style={[styles.input, styles.noteInput]}
                multiline
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add transaction"
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                ]}
                onPress={handleSubmit}
                disabled={mutation.isPending}>
                <ThemedText style={styles.submitText}>
                  {mutation.isPending ? 'Adding...' : 'Add transaction'}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
    backgroundColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 8,
  },
  title: {
    marginTop: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  dateHint: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 4,
  },
  stepHint: {
    opacity: 0.7,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  typePill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomePill: {
    backgroundColor: 'rgba(46,204,113,0.12)',
  },
  expensePill: {
    backgroundColor: 'rgba(231,76,60,0.12)',
  },
  typePillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pillPressed: {
    opacity: 0.85,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
  },
  backPillText: {
    fontSize: 13,
  },
  stepTag: {
    fontSize: 13,
    fontWeight: '600',
    color: accentColor,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryPill: {
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  categoryContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  defaultStar: {
    fontSize: 12,
    color: '#f1c40f',
  },
  categoryPillSelected: {
    borderColor: accentColor,
    backgroundColor: 'rgba(52,152,219,0.08)',
  },
  categoryPillText: {
    fontSize: 13,
  },
  categoryPillTextSelected: {
    fontWeight: '600',
    color: accentColor,
  },
  submitButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 999,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
