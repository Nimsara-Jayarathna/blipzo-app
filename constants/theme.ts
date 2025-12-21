/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

type ThemePalette = {
  pageBg: string;
  pageFg: string;
  surfaceGlass: string;
  surfaceGlassThick: string;
  pageOverlayStrong: string;
  pageOverlaySoft: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  borderGlass: string;
  borderSoft: string;
  borderStrong: string;
  textMain: string;
  textMuted: string;
  textSubtle: string;
  inputBg: string;
  inputBorder: string;
  primaryAccent: string;
  chipBg: string;
};

export const ThemeColors: Record<'light' | 'dark', ThemePalette> = {
  light: {
    pageBg: '#f8fafc',
    pageFg: '#0f172a',
    surfaceGlass: 'rgba(255, 255, 255, 0.75)',
    surfaceGlassThick: 'rgba(255, 255, 255, 0.95)',
    pageOverlayStrong: 'rgba(255, 255, 255, 0.9)',
    pageOverlaySoft: 'rgba(255, 255, 255, 0.65)',
    surface1: '#ffffff',
    surface2: '#f1f5f9',
    surface3: '#e2e8f0',
    surface4: '#cbd5e1',
    borderGlass: 'rgba(148, 163, 184, 0.35)',
    borderSoft: 'rgba(15, 23, 42, 0.08)',
    borderStrong: 'rgba(15, 23, 42, 0.14)',
    textMain: '#1e293b',
    textMuted: '#64748b',
    textSubtle: '#94a3b8',
    inputBg: 'rgba(255, 255, 255, 0.5)',
    inputBorder: '#cbd5e1',
    primaryAccent: '#3b82f6',
    chipBg: '#e2e8f0',
  },
  dark: {
    pageBg: '#020617',
    pageFg: '#f1f5f9',
    surfaceGlass: 'rgba(15, 23, 42, 0.6)',
    surfaceGlassThick: 'rgba(15, 23, 42, 0.85)',
    pageOverlayStrong: 'rgba(15, 23, 42, 0.85)',
    pageOverlaySoft: 'rgba(15, 23, 42, 0.6)',
    surface1: '#0f172a',
    surface2: '#1e293b',
    surface3: '#334155',
    surface4: '#475569',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    borderSoft: 'rgba(255, 255, 255, 0.05)',
    borderStrong: 'rgba(255, 255, 255, 0.12)',
    textMain: '#f1f5f9',
    textMuted: '#94a3b8',
    textSubtle: '#64748b',
    inputBg: 'rgba(15, 23, 42, 0.4)',
    inputBorder: '#334155',
    primaryAccent: '#60a5fa',
    chipBg: '#334155',
  },
};

export const Colors = {
  light: {
    text: ThemeColors.light.textMain,
    background: ThemeColors.light.pageBg,
    tint: ThemeColors.light.primaryAccent,
    icon: ThemeColors.light.textMuted,
    tabIconDefault: ThemeColors.light.textMuted,
    tabIconSelected: ThemeColors.light.primaryAccent,
  },
  dark: {
    text: ThemeColors.dark.textMain,
    background: ThemeColors.dark.pageBg,
    tint: ThemeColors.dark.primaryAccent,
    icon: ThemeColors.dark.textMuted,
    tabIconDefault: ThemeColors.dark.textMuted,
    tabIconSelected: ThemeColors.dark.primaryAccent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
