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

import { register } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

const accentColor = '#3498db';
const backgroundColor = '#f5f6fa';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: data => {
      setAuth(data);
      setErrorMessage(null);
      router.replace('/(tabs)');
    },
    onError: () => setErrorMessage('Unable to create account'),
  });

  const isLoading = registerMutation.isPending;

  const isEmailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()),
    [email]
  );

  const isPasswordValid = useMemo(
    () => password.trim().length >= 6,
    [password]
  );

  const handleSubmit = () => {
    const trimmed = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    if (!trimmed.firstName || !trimmed.lastName) {
      setErrorMessage('Please enter your first and last name');
      return;
    }

    if (!trimmed.email || !trimmed.password) {
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
    registerMutation.reset();
    registerMutation.mutate({
      email: trimmed.email,
      password: trimmed.password,
      fname: trimmed.firstName,
      lname: trimmed.lastName,
    });
  };

  const handleGoToLogin = () => {
    router.navigate('/login');
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
                Create your MyEx account
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Set up your profile and start tracking smarter within seconds.
              </ThemedText>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.fieldGroupHalf}>
                  <ThemedText style={styles.label}>First name</ThemedText>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Alex"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldGroupHalf}>
                  <ThemedText style={styles.label}>Last name</ThemedText>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Taylor"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
              </View>

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
                accessibilityLabel="Create account"
                accessibilityHint="Creates a new MyEx account with the provided details"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Create account</ThemedText>
                )}
              </Pressable>
            </View>

            <View style={styles.footerRow}>
              <ThemedText style={styles.footerText}>
                Already have an account?{' '}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Log in"
                accessibilityHint="Opens the login screen"
                onPress={handleGoToLogin}>
                <ThemedText style={styles.footerLink}>Log in</ThemedText>
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldGroupHalf: {
    flex: 1,
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

