import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { registerToast, type ToastPayload } from '@/utils/toast';

const AUTO_HIDE_MS = 1500;

export function AppToastHost() {
  const { colors, resolvedTheme } = useAppTheme();
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const backgroundColor = useMemo(() => {
    if (colors.surfaceGlassThick) return colors.surfaceGlassThick;
    return resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.75)';
  }, [colors, resolvedTheme]);
  const borderColor = useMemo(() => colors.borderGlass ?? colors.borderSoft, [colors]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const unregister = registerToast(payload => {
      setToast(payload);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, AUTO_HIDE_MS);
    });

    return () => {
      if (timeout) clearTimeout(timeout);
      unregister();
    };
  }, [opacity]);

  if (!toast) return null;

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor,
            borderColor,
            opacity,
          },
        ]}
      >
        <ThemedText style={[styles.text, { color: colors.textMain }]}>
          {toast.message}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  toast: {
    maxWidth: '88%',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    transform: [{ translateY: -20 }],
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
