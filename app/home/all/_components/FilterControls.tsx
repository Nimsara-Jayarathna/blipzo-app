import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { AllFilters, TransactionTypeFilter } from '../_hooks/useTransactionLogic';

interface Props {
  filters: AllFilters;
  categories: { id: string; name: string; type: string }[];
  onChange: (f: AllFilters) => void;
}

export function FilterControls({ filters, categories, onChange }: Props) {
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Helper to update a single field
  const update = (overrides: Partial<AllFilters>) => onChange({ ...filters, ...overrides });

  return (
    <View style={styles.container}>
      {/* 1. Date Range (Simple Inputs for MVP - Replace with DateTimePicker in Prod) */}
      <ControlCard title="Date Range">
        <View style={styles.dateColumn}>
          <View style={styles.dateRow}>
            <ThemedText style={styles.dateLabel}>From</ThemedText>
            <DateInput
              value={filters.startDate}
              onChange={(v) => update({ startDate: v })}
            />
          </View>
          <View style={styles.dateRow}>
            <ThemedText style={styles.dateLabel}>To</ThemedText>
            <DateInput
              value={filters.endDate}
              onChange={(v) => update({ endDate: v })}
            />
          </View>
        </View>
      </ControlCard>

      {/* 2. Type Filter */}
      <ControlCard title="Type">
        <View style={styles.row}>
          {(['all', 'income', 'expense'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => update({ typeFilter: t, categoryFilter: 'all' })}
              style={[styles.pill, filters.typeFilter === t && styles.pillActive]}
            >
              <ThemedText style={[styles.pillText, filters.typeFilter === t && styles.pillTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ControlCard>

      {/* 3. Category Filter */}
      <ControlCard title="Category">
        <Pressable style={styles.dropdownTrigger} onPress={() => setIsCatModalOpen(true)}>
          <ThemedText>
            {filters.categoryFilter === 'all'
              ? 'All categories'
              : categories.find((c) => c.id === filters.categoryFilter)?.name ?? 'Select'}
          </ThemedText>
          <ThemedText style={styles.arrow}>▼</ThemedText>
        </Pressable>
      </ControlCard>

      {/* Category Selection Modal */}
      <Modal visible={isCatModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Select Category</ThemedText>
            <ScrollView contentContainerStyle={styles.modalList}>
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  update({ categoryFilter: 'all' });
                  setIsCatModalOpen(false);
                }}
              >
                <ThemedText>All categories</ThemedText>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[styles.modalItem, filters.categoryFilter === cat.id && styles.modalItemActive]}
                  onPress={() => {
                    update({ categoryFilter: cat.id });
                    setIsCatModalOpen(false);
                  }}
                >
                  <ThemedText>{cat.name}</ThemedText>
                  {/* Tiny badge in modal */}
                  <View style={[styles.tinyBadge, cat.type === 'income' ? styles.badgeIncome : styles.badgeExpense]}>
                     <ThemedText style={[styles.tinyBadgeText, cat.type === 'income' ? styles.textIncome : styles.textExpense]}>
                       {cat.type.charAt(0).toUpperCase()}
                     </ThemedText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setIsCatModalOpen(false)}>
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Sub Components ---

const ControlCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.card}>
    <ThemedText style={styles.cardTitle}>{title}</ThemedText>
    {children}
  </View>
);

const DateInput = ({ value, onChange }: { value: string; onChange: (t: string) => void }) => (
  <TextInput
    style={styles.dateInput}
    value={value}
    onChangeText={onChange}
    placeholder="YYYY-MM-DD"
    placeholderTextColor="#999"
  />
);

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#95a5a6',
    marginBottom: 8,
    fontWeight: '600',
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  dateColumn: {
    width: '100%',
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    width: 40,
    fontSize: 12,
    color: '#95a5a6',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    minWidth: 100,
    textAlign: 'center',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  pillActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  pillText: { fontSize: 13, color: '#333', fontWeight: '500' },
  pillTextActive: { color: '#fff' },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
  },
  arrow: { fontSize: 10, opacity: 0.5 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalTitle: { textAlign: 'center', marginBottom: 16 },
  modalList: { paddingBottom: 20 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemActive: { backgroundColor: '#f0f9ff' },
  tinyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  badgeIncome: { backgroundColor: 'rgba(46,204,113,0.1)', borderColor: 'rgba(46,204,113,0.2)' },
  badgeExpense: { backgroundColor: 'rgba(231,76,60,0.1)', borderColor: 'rgba(231,76,60,0.2)' },
  tinyBadgeText: { fontSize: 10, fontWeight: '700' },
  textIncome: { color: '#2ecc71' },
  textExpense: { color: '#e74c3c' },
  closeButton: { marginTop: 10, backgroundColor: '#f0f0f0', padding: 14, borderRadius: 12, alignItems: 'center' },
  closeButtonText: { fontWeight: '600' },
});
