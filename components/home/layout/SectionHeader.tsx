import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/ThemeContext';

type SectionHeaderProps = {
  title: string;
  onBack: () => void;
  accessibilityLabel?: string;
};

export function SectionHeader({ title, onBack, accessibilityLabel }: SectionHeaderProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.surface1, paddingTop: insets.top }]}>
      <ThemedView
        style={[
          styles.headerShadowWrapper,
          { backgroundColor: colors.surface1, shadowColor: colors.textMain },
        ]}
      >
        <ThemedView style={[styles.header, { backgroundColor: colors.surface1 }]}>
          <Pressable
            onPress={onBack}
            style={styles.leftContent}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? 'Back'}
          >
            <View
              style={[
                styles.backIconCircle,
                { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
              ]}
            >
              <MaterialIcons name="chevron-left" size={18} color={colors.textMain} />
            </View>
            <ThemedText style={[styles.title, { color: colors.textMain }]}>{title}</ThemedText>
          </Pressable>
          <View style={styles.trailingSpacer} />
        </ThemedView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  headerShadowWrapper: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  leftContent: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  trailingSpacer: {
    width: 36,
    height: 36,
  },
});
