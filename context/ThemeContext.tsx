import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { ThemeColors } from '@/constants/theme';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  resolvedTheme: 'light' | 'dark';
  colors: typeof ThemeColors.light;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [preference, setPreference] = useState<ThemePreference>('system');
  const resolvedTheme = preference === 'system' ? systemScheme : preference;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      resolvedTheme,
      colors: ThemeColors[resolvedTheme],
    }),
    [preference, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return value;
}
