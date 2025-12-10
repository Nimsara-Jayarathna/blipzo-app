import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onAdd: () => void;
  activeTab: 'income' | 'expense';
  isFull: boolean;
  isLoading: boolean;
};

export function AddCategoryInput({
  value,
  onChangeText,
  onAdd,
  activeTab,
  isFull,
  isLoading,
}: Props) {
  const isDisabled = !value.trim() || isFull || isLoading;

  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`New ${activeTab} category...`}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onAdd}
          returnKeyType="done"
          editable={!isFull && !isLoading}
        />
        <TouchableOpacity
          style={[styles.addButton, isDisabled && styles.addButtonDisabled]}
          onPress={onAdd}
          disabled={isDisabled}>
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
        </TouchableOpacity>
      </View>

      {isFull && (
        <ThemedText style={styles.limitWarning}>
          Maximum limit reached for {activeTab} categories.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});