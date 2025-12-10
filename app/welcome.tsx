import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  AccessibilityInfo,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

const accentColor = '#3498db';
const incomeColor = '#2ecc71';
const expenseColor = '#e74c3c';
const backgroundColor = '#f5f6fa';
const bottomSheetColor = 'rgba(255,255,255,0.96)';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const sheetTranslateY = useRef(new Animated.Value(40)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(10)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let reduceMotion = false;

    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      reduceMotion = value;

      if (reduceMotion) {
        sheetTranslateY.setValue(0);
        sheetOpacity.setValue(1);
        logoTranslateY.setValue(0);
        logoOpacity.setValue(1);
        return;
      }

      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [logoOpacity, logoTranslateY, sheetOpacity, sheetTranslateY]);

  const handleLoginPress = () => {
    router.navigate('/login'); // TODO: Implement /login screen
  };

  const handleRegisterPress = () => {
    router.navigate('/register'); // TODO: Implement /register screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Soft hero background similar to web */}
        <View style={styles.topGlow} pointerEvents="none" />
        <View style={styles.bottomGlow} pointerEvents="none" />

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}>
          {/* TODO: Replace with real logo asset */}
          <View style={styles.logoCircle}>
            <View style={styles.logoAccentDot} />
            <View style={styles.logoIncomeDot} />
            <View style={styles.logoExpenseDot} />
          </View>
          <ThemedText type="title" style={styles.appTitle}>
            MyEx
          </ThemedText>
          <ThemedText style={styles.tagline}>
            Everything you earn and spend, beautifully organized.
          </ThemedText>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log in"
            accessibilityHint="Opens the login screen so you can access your account"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLoginPress}>
            <ThemedText style={styles.primaryButtonText}>Log in</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create account"
            accessibilityHint="Opens the registration screen so you can create a new account"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRegisterPress}>
            <ThemedText style={styles.secondaryButtonText}>Create account</ThemedText>
          </Pressable>
        </Animated.View>
      </ThemedView>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: accentColor,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAccentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: accentColor,
    position: 'absolute',
    top: 18,
    left: 22,
  },
  logoIncomeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: incomeColor,
    position: 'absolute',
    bottom: 18,
    right: 18,
  },
  logoExpenseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: expenseColor,
    position: 'absolute',
    bottom: 22,
    left: 32,
  },
  appTitle: {
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  spacer: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: bottomSheetColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.select({ ios: 32, android: 24 }),
    borderWidth: 1,
    borderColor: 'rgba(211,216,224,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  primaryButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: accentColor,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
