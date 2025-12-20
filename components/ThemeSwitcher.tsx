import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme, type ThemePreference } from '@/context/ThemeContext';

const options: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function ThemeSwitcher() {
  const { colors, preference, setPreference, resolvedTheme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.surface2, borderColor: colors.borderSoft },
        ]}>
        {options.map(option => {
          const isActive = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="button"
              accessibilityLabel={`Switch theme to ${option.label}`}
              accessibilityHint={`Sets theme to ${option.label.toLowerCase()}`}
              style={({ pressed }) => [
                styles.option,
                isActive && {
                  backgroundColor: colors.surface1,
                  borderColor: colors.borderGlass,
                },
                pressed && styles.optionPressed,
              ]}>
              <ThemedText
                style={[
                  styles.optionText,
                  {
                    color: isActive ? colors.textMain : colors.textMuted,
                  },
                ]}>
                {option.label}
                {option.value === 'system' ? ` (${resolvedTheme})` : ''}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  track: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  option: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
