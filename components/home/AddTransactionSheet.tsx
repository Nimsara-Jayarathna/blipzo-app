import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTransaction } from '@/api/transactions';
import { getCategories } from '@/api/categories';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
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

export function AddTransactionSheet({
  visible,
  onClose,
  onTransactionCreated,
}: AddTransactionSheetProps) {
  const queryClient = useQueryClient();
  const { colors, resolvedTheme } = useAppTheme();

  // --- STATE ---
  const [step, setStep] = useState<AddTransactionStep>(1);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Date State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [note, setNote] = useState('');

  // Reset on Open
  useEffect(() => {
    if (visible) {
      setStep(1);
      setTransactionType('expense');
      setDate(new Date());
      setAmount('');
      setSelectedCategory('');
      setNote('');
    }
  }, [visible]);

  // Load Categories on Step 2
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

  // Filter Categories
  useEffect(() => {
    if (!categories.length) {
      setFilteredCategories([]);
      setSelectedCategory('');
      return;
    }

    const nextFiltered = categories.filter(category => category.type === transactionType);
    setFilteredCategories(nextFiltered);

    // Auto-select default
    if (nextFiltered.length > 0) {
      const defaultForType = nextFiltered.find(category => category.isDefault);
      setSelectedCategory(defaultForType?.id ?? nextFiltered[0]?.id ?? '');
    }
  }, [categories, transactionType]);

  const mutation = useMutation({
    mutationFn: (payload: TransactionInput) => createTransaction(payload),
    onSuccess: transaction => {
      queryClient.invalidateQueries({ queryKey: transactionKey });
      queryClient.invalidateQueries({ queryKey: summaryKey });
      onTransactionCreated?.(transaction);
      onClose();
    },
    onError: () => Alert.alert('Error', 'Unable to add transaction'),
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
      date: dayjs(date).format('YYYY-MM-DD'),
      note: note.trim() || undefined,
    });
  };

  const handleNextStep = (type: 'income' | 'expense') => {
    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation', 'Enter a valid amount first');
      return;
    }
    setTransactionType(type);
    setStep(2);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Android closes automatically, iOS needs manual toggle logic if in modal
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropTouchable} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface1, borderColor: colors.borderSoft },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.borderSoft }]} />
          <View style={styles.header}>
            <ThemedText type="title">New Transaction</ThemedText>
            {step === 2 && (
              <Pressable onPress={() => setStep(1)} style={styles.backButton}>
                <ThemedText style={[styles.backText, { color: colors.primaryAccent }]}>
                  Edit Amount
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            {/* --- STEP 1: AMOUNT --- */}
            {step === 1 ? (
              <View style={styles.stepContainer}>
                <View style={styles.amountWrapper}>
                  <ThemedText style={[styles.currencySymbol, { color: colors.textMain }]}>
                    $
                  </ThemedText>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.textSubtle}
                    style={[styles.amountInput, { color: colors.textMain }]}
                  />
                </View>

                <ThemedText style={[styles.hintText, { color: colors.textMuted }]}>
                  Select type to continue
                </ThemedText>

                <View style={styles.typeRow}>
                  <Pressable
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          resolvedTheme === 'dark'
                            ? 'rgba(34, 197, 94, 0.18)'
                            : 'rgba(46, 204, 113, 0.1)',
                      },
                    ]}
                    onPress={() => handleNextStep('income')}>
                    <MaterialIcons name="arrow-upward" size={20} color="#22c55e" />
                    <ThemedText style={[styles.typeText, { color: '#22c55e' }]}>
                      Income
                    </ThemedText>
                  </Pressable>
                  
                  <Pressable
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          resolvedTheme === 'dark'
                            ? 'rgba(239, 68, 68, 0.18)'
                            : 'rgba(231, 76, 60, 0.1)',
                      },
                    ]}
                    onPress={() => handleNextStep('expense')}>
                    <MaterialIcons name="arrow-downward" size={20} color="#ef4444" />
                    <ThemedText style={[styles.typeText, { color: '#ef4444' }]}>
                      Expense
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              
              /* --- STEP 2: DETAILS --- */
              <View style={styles.stepContainer}>
                
                {/* Category Selection */}
                <View style={styles.section}>
                  <ThemedText style={[styles.label, { color: colors.textSubtle }]}>
                    Category
                  </ThemedText>
                  <View style={styles.categoriesGrid}>
                    {isLoadingCategories ? (
                      <ActivityIndicator color={colors.primaryAccent} />
                    ) : filteredCategories.map(cat => (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.catPill,
                          {
                            backgroundColor: colors.surface2,
                            borderColor: colors.borderSoft,
                          },
                          selectedCategory === cat.id && [
                            styles.catPillActive,
                            {
                              backgroundColor:
                                resolvedTheme === 'dark'
                                  ? 'rgba(96, 165, 250, 0.16)'
                                  : 'rgba(59, 130, 246, 0.12)',
                              borderColor: colors.primaryAccent,
                            },
                          ],
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}>
                        <ThemedText 
                          style={[
                            styles.catText,
                            { color: colors.textMain },
                            selectedCategory === cat.id && [
                              styles.catTextActive,
                              { color: colors.primaryAccent },
                            ],
                          ]}>
                          {cat.name}
                        </ThemedText>
                        {cat.isDefault && <MaterialIcons name="star" size={10} color="#f1c40f" style={{marginLeft:4}} />}
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Date Picker */}
                <View style={styles.section}>
                  <ThemedText style={[styles.label, { color: colors.textSubtle }]}>Date</ThemedText>
                  <Pressable 
                    style={[
                      styles.dateInput,
                      { backgroundColor: colors.surface2, borderColor: colors.borderSoft },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons name="calendar-today" size={18} color={colors.textMuted} />
                    <ThemedText style={[styles.dateText, { color: colors.textMain }]}>
                      {dayjs(date).format('MMMM D, YYYY')}
                    </ThemedText>
                  </Pressable>

                  {/* Native Picker Logic */}
                  {showDatePicker && (
                     Platform.OS === 'ios' ? (
                       <View
                         style={[
                           styles.iosPickerContainer,
                           { backgroundColor: colors.surface2 },
                         ]}>
                         <DateTimePicker
                           value={date}
                           mode="date"
                           display="spinner"
                           onChange={handleDateChange}
                           textColor={resolvedTheme === 'dark' ? '#f1f5f9' : '#0f172a'}
                         />
                         <Pressable
                           onPress={() => setShowDatePicker(false)}
                           style={[styles.closePicker, { backgroundColor: colors.surface3 }]}>
                           <ThemedText style={{color: colors.primaryAccent, fontWeight:'bold'}}>
                             Done
                           </ThemedText>
                         </Pressable>
                       </View>
                     ) : (
                       <DateTimePicker
                         value={date}
                         mode="date"
                         display="default"
                         onChange={handleDateChange}
                       />
                     )
                  )}
                </View>

                {/* Note Input */}
                <View style={styles.section}>
                  <ThemedText style={[styles.label, { color: colors.textSubtle }]}>
                    Note (Optional)
                  </ThemedText>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="What was this for?"
                    placeholderTextColor={colors.textSubtle}
                    style={[
                      styles.noteInput,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: colors.borderSoft,
                        color: colors.textMain,
                      },
                    ]}
                    multiline
                  />
                </View>

                {/* Submit */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={mutation.isPending}
                  style={[
                    styles.submitBtn,
                    { backgroundColor: colors.primaryAccent, shadowColor: colors.primaryAccent },
                    mutation.isPending && {opacity: 0.7},
                  ]}>
                  {mutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.submitText}>Save Transaction</ThemedText>
                  )}
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingTop: 12,
    borderWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Step wrappers
  stepContainer: {
    gap: 20,
    marginBottom: 8,
  },

  // Step 1
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    minWidth: 100,
    textAlign: 'center',
  },
  hintText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  typeButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeText: { fontSize: 16, fontWeight: '700' },

  // Step 2
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: { fontSize: 14 },
  catTextActive: { fontWeight: '600' },
  
  // Date Picker
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  dateText: { fontSize: 16 },
  iosPickerContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  closePicker: {
    alignItems: 'flex-end',
    padding: 10,
  },
  
  // Note
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Submit
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
