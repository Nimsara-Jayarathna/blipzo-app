import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import {
  HOME_CONTENT_PADDING_BOTTOM,
  HOME_CONTENT_PADDING_H,
  HOME_CONTENT_PADDING_TOP,
} from '@/components/home/layout/spacing';

type HomeContentProps = {
  children: ReactNode;
  style?: ViewStyle;
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

export function HomeContent({ children, style }: HomeContentProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}
