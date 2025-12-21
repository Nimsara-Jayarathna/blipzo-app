import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { logoutSession } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { HomeBackground } from '@/components/home/HomeBackground';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch {
      // silent
    }
    logout();
  };

  return (
    <HomeBackground>
      <View style={styles.container}>
        {/* TODO: Implement full profile management (edit name, avatar, etc.) */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceGlassThick, borderColor: colors.borderGlass },
          ]}>
          <ThemedText style={[styles.label, { color: colors.textMuted }]}>Name</ThemedText>
          <ThemedText style={styles.value}>{user?.name ?? 'Not set'}</ThemedText>

          <ThemedText style={[styles.label, { color: colors.textMuted }]}>Email</ThemedText>
          <ThemedText style={styles.value}>{user?.email ?? 'Not set'}</ThemedText>

          <ThemedText style={[styles.label, { color: colors.textMuted }]}>Theme</ThemedText>
          <ThemeSwitcher />
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            accessibilityHint="Signs you out of your MyEx account"
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: colors.primaryAccent },
              pressed && styles.logoutButtonPressed,
            ]}>
            <ThemedText style={styles.logoutText}>Log out</ThemedText>
          </Pressable>
        </View>
      </View>
    </HomeBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
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
