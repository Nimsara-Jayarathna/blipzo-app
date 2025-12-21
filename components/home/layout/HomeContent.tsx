import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import {
  HOME_CONTENT_PADDING_BOTTOM,
  HOME_CONTENT_PADDING_H,
  HOME_CONTENT_PADDING_TOP,
  HOME_TAB_BAR_MARGIN,
} from '@/components/home/layout/spacing';

type HomeContentProps = {
  children: ReactNode;
  style?: ViewStyle;
  bleedBottom?: boolean;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: HOME_CONTENT_PADDING_H,
    paddingTop: HOME_CONTENT_PADDING_TOP,
    paddingBottom: HOME_CONTENT_PADDING_BOTTOM,
  },
  scrollContent: {
    paddingHorizontal: HOME_CONTENT_PADDING_H,
    paddingTop: HOME_CONTENT_PADDING_TOP,
    paddingBottom: HOME_CONTENT_PADDING_BOTTOM,
  },
});

export const homeContentStyles = styles;

export function HomeContent({ children, style, bleedBottom = false }: HomeContentProps) {
  return (
    <View
      style={[
        styles.container,
        bleedBottom ? { paddingBottom: HOME_TAB_BAR_MARGIN } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
