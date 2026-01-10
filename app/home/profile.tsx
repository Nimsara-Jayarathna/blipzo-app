import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { logoutSession } from '@/api/auth';
import { HomeContent } from '@/components/home/layout/HomeContent';
import { SectionHeader } from '@/components/home/layout/SectionHeader';
import { HOME_CONTENT_PADDING_H } from '@/components/home/layout/spacing';
import { ThemedText } from '@/components/themed-text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useOffline } from '@/context/OfflineContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
  const { offlineMode, capabilities, tryGoOnline } = useOffline();
  const router = useRouter();
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState<'menu' | 'profile'>('menu');
  const [onlineCheckState, setOnlineCheckState] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');

  useEffect(() => {
    navigation.setOptions({ headerShown: activeSection !== 'profile' });
  }, [activeSection, navigation]);

  useEffect(() => {
    if (onlineCheckState === 'success' || onlineCheckState === 'failed') {
      const timer = setTimeout(() => setOnlineCheckState('idle'), 1600);
      return () => clearTimeout(timer);
    }
  }, [onlineCheckState]);

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch {
      // silent
    }
    logout();
    router.replace('/welcome');
  };

  return (
    <HomeContent
      style={
        activeSection === 'profile'
          ? { paddingTop: 0 }
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
              disabled={offlineMode || !capabilities.canManageCategories}
              style={styles.listRow}
              accessibilityRole="button"
              accessibilityLabel="Category setting"
              accessibilityState={{ disabled: offlineMode || !capabilities.canManageCategories }}
            >
              <View style={styles.listRowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: colors.surface2 }]}>
                  <MaterialIcons name="category" size={18} color={colors.textMuted} />
                </View>
                <ThemedText
                  style={[
                    styles.listLabel,
                    (offlineMode || !capabilities.canManageCategories) && { color: colors.textSubtle },
                  ]}
                >
                  Category setting
                </ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
            <View style={[styles.rowDivider, { backgroundColor: colors.borderSoft }]} />
            <Pressable
              onPress={() => router.navigate('/home/currency')}
              disabled={offlineMode}
              style={styles.listRow}
              accessibilityRole="button"
              accessibilityLabel="Currency setting"
              accessibilityState={{ disabled: offlineMode }}
            >
              <View style={styles.listRowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: colors.surface2 }]}>
                  <MaterialIcons name="attach-money" size={18} color={colors.textMuted} />
                </View>
                <ThemedText
                  style={[
                    styles.listLabel,
                    offlineMode && { color: colors.textSubtle },
                  ]}
                >
                  Currency setting
                </ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <ThemedText style={[styles.label, { color: colors.textMuted }]}>Theme</ThemedText>
            <ThemeSwitcher />
          </View>

          <View style={styles.sectionSpacer} />

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
            ]}
          >
            <ThemedText style={[styles.label, { color: colors.textMuted }]}>Connectivity</ThemedText>
            <Pressable
              onPress={async () => {
                if (!offlineMode || onlineCheckState === 'checking') return;
                setOnlineCheckState('checking');
                const success = await tryGoOnline();
                setOnlineCheckState(success ? 'success' : 'failed');
              }}
              disabled={!offlineMode || onlineCheckState === 'checking'}
              accessibilityRole="button"
              accessibilityLabel="Go online"
              accessibilityHint="Checks connection and exits offline mode if available"
              style={({ pressed }) => [
                styles.goOnlineButton,
                {
                  backgroundColor:
                    onlineCheckState === 'success'
                      ? '#22c55e'
                      : onlineCheckState === 'failed'
                        ? '#f59e0b'
                        : offlineMode
                          ? colors.primaryAccent
                          : colors.surface2,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {onlineCheckState === 'checking' ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ThemedText
                  style={[
                    styles.goOnlineText,
                    { color: offlineMode ? '#ffffff' : colors.textMuted },
                  ]}
                >
                  {onlineCheckState === 'success'
                    ? 'Online'
                    : onlineCheckState === 'failed'
                      ? 'Still offline'
                      : offlineMode
                        ? 'Go online'
                        : 'Online'}
                </ThemedText>
              )}
            </Pressable>
          </View>

          {/* TODO: Implement full profile management (edit name, avatar, etc.) */}
        </>
      ) : (
        <>
          <View style={[styles.sectionHeaderWrapper, { marginHorizontal: -HOME_CONTENT_PADDING_H }]}>
            <SectionHeader
              title="Profile setting"
              onBack={() => setActiveSection('menu')}
              accessibilityLabel="Back to profile menu"
            />
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
        <ThemedText style={[styles.versionText, { color: colors.textMuted }]}>
          Version {version}
        </ThemedText>
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
  sectionHeaderWrapper: {
    marginBottom: 12,
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
  sectionSpacer: {
    height: 12,
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
  goOnlineButton: {
    marginTop: 12,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goOnlineText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
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
  versionText: {
    marginTop: 24,
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
});
