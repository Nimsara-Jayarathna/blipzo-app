import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { logoutSession } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { HomeContent } from '@/components/home/layout/HomeContent';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<'menu' | 'profile'>('menu');

  useEffect(() => {
    navigation.setOptions({ headerShown: activeSection !== 'profile' });
  }, [activeSection, navigation]);

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch {
      // silent
    }
    logout();
  };

  return (
    <HomeContent
      style={
        activeSection === 'profile'
          ? { paddingTop: insets.top + 12 }
          : undefined
      }
    >
      {activeSection === 'menu' ? (
        <>
          <View
            style={[
              styles.groupCard,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <Pressable
              onPress={() => setActiveSection('profile')}
              style={styles.listRow}
              accessibilityRole="button"
              accessibilityLabel="Profile setting"
            >
              <View style={styles.listRowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: colors.surface2 }]}>
                  <MaterialIcons name="person" size={18} color={colors.textMuted} />
                </View>
                <ThemedText style={styles.listLabel}>Profile setting</ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
            <View style={[styles.rowDivider, { backgroundColor: colors.borderSoft }]} />
            <Pressable
              onPress={() => router.navigate('/home/settings')}
              style={styles.listRow}
              accessibilityRole="button"
              accessibilityLabel="Category setting"
            >
              <View style={styles.listRowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: colors.surface2 }]}>
                  <MaterialIcons name="category" size={18} color={colors.textMuted} />
                </View>
                <ThemedText style={styles.listLabel}>Category setting</ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* TODO: Implement full profile management (edit name, avatar, etc.) */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <ThemedText style={[styles.label, { color: colors.textMuted }]}>Theme</ThemedText>
            <ThemeSwitcher />
          </View>
        </>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Pressable
              onPress={() => setActiveSection('menu')}
              style={styles.backLink}
              accessibilityRole="button"
              accessibilityLabel="Back to profile menu"
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
                Profile setting
              </ThemedText>
            </Pressable>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <ThemedText style={[styles.label, { color: colors.textMuted }]}>Name</ThemedText>
            <ThemedText style={styles.value}>{user?.name ?? 'Not set'}</ThemedText>

            <ThemedText style={[styles.label, { color: colors.textMuted }]}>Email</ThemedText>
            <ThemedText style={styles.value}>{user?.email ?? 'Not set'}</ThemedText>

            <ThemedText style={[styles.label, { color: colors.textMuted }]}>Theme</ThemedText>
            <ThemeSwitcher />
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityHint="Signs you out of your Blipzo account"
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: '#ef4444' },
            pressed && styles.logoutButtonPressed,
          ]}>
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </Pressable>
      </View>
    </HomeContent>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 6,
    marginBottom: 16,
  },
  listRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
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
    fontSize: 19,
    fontWeight: '500',
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  label: {
    marginTop: 12,
    fontSize: 13,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 24,
  },
  logoutButton: {
    width: '100%',
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  logoutButtonPressed: {
    opacity: 0.85,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
