import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { login } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

const accentColor = '#3498db';
const backgroundColor = '#f5f6fa';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: data => {
      setAuth(data);
      setErrorMessage(null);
      router.replace('/home');
    },
    onError: () => setErrorMessage('Invalid email or password'),
  });

  const isLoading = loginMutation.isPending;

  const isEmailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()),
    [email]
  );

  const isPasswordValid = useMemo(
    () => password.trim().length >= 6,
    [password]
  );

  const handleSubmit = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Email and password are required');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password should be at least 6 characters');
      return;
    }

    setErrorMessage(null);
    loginMutation.reset();
    loginMutation.mutate({
      email: trimmedEmail,
      password: trimmedPassword,
    });
  };

  const handleGoToRegister = () => {
    router.navigate('/register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ThemedView style={styles.container}>
          <View style={styles.topGlow} pointerEvents="none" />
          <View style={styles.bottomGlow} pointerEvents="none" />

          <View style={styles.content}>
            <View style={styles.logoBlock}>
              {/* TODO: Replace with real logo asset */}
              <View style={styles.logoCircle} />
              <ThemedText type="title" style={styles.title}>
                Welcome back
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Log in to review today&apos;s income, expenses, and balance.
              </ThemedText>
            </View>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {errorMessage ? (
                <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Log in"
                accessibilityHint="Attempts to log in with the provided email and password"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Log in</ThemedText>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
                accessibilityHint="Starts the password reset process"
                onPress={handleForgotPassword}
                style={styles.forgotPasswordButton}>
                <ThemedText style={styles.forgotPasswordText}>
                  Forgot password?
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.footerRow}>
              <ThemedText style={styles.footerText}>
                Don&apos;t have an account?{' '}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create account"
                accessibilityHint="Opens the registration screen"
                onPress={handleGoToRegister}>
                <ThemedText style={styles.footerLink}>Create one</ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor,
  },
  container: {
    flex: 1,
    backgroundColor,
  },
  topGlow: {
    position: 'absolute',
    top: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(52,152,219,0.16)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -140,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(46,204,113,0.14)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: accentColor,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde1eb',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 10,
    color: '#e74c3c',
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 4,
    height: 48,
    borderRadius: 999,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  forgotPasswordButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    color: accentColor,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
