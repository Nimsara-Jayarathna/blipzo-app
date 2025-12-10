import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const [isFocused, setIsFocused] = useState(false);
  
  // Logic: Disable if empty, full, or currently submitting
  const isDisabled = !value.trim() || isFull || isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            isFull && styles.inputDisabled
          ]}
          placeholder={isFull ? `Limit reached` : `New ${activeTab} category...`}
          placeholderTextColor="#95a5a6"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={!isDisabled ? onAdd : undefined}
          returnKeyType="done"
          editable={!isFull && !isLoading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        <TouchableOpacity
          style={[
            styles.addButton,
            isDisabled && styles.addButtonDisabled,
            isLoading && styles.addButtonLoading
          ]}
          onPress={onAdd}
          activeOpacity={0.7}
          disabled={isDisabled}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <ThemedText style={styles.addButtonText}>
              {/* Plus icon using text for simplicity, or use an Icon lib */}
              + Add
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {isFull && (
        <View style={styles.warningBanner}>
          <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
          <ThemedText style={styles.warningText}>
            You have reached the maximum of 10 {activeTab} categories.
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch', // Ensures input and button are same height
    height: 50,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    color: '#2c3e50',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#3498db',
    backgroundColor: '#fbfdff',
    shadowOpacity: 0.1,
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#bdc3c7',
  },
  addButton: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 80,
    // Shadow for depth
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonLoading: {
    opacity: 0.8,
  },
  addButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowColor: 'transparent',
    elevation: 0,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  // Warning Banner Styles
  warningBanner: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
  },
  warningIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#d35400',
    fontWeight: '500',
    flex: 1,
  },
});