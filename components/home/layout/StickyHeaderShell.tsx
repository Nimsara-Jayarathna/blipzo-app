import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

type StickyHeaderShellProps = {
  expandedHeight: number;
  collapsedHeight: number;
  renderExpanded: () => ReactNode;
  renderCollapsed: () => ReactNode;
  contentTopPadding?: number;
  children: (props: {
    onScroll: ReturnType<typeof useAnimatedScrollHandler>;
    contentContainerStyle: ViewStyle;
  }) => ReactNode;
};

export function StickyHeaderShell({
  expandedHeight,
  collapsedHeight,
  renderExpanded,
  renderCollapsed,
  contentTopPadding = 12,
  children,
}: StickyHeaderShellProps) {
  const scrollY = useSharedValue(0);
  const collapseDistance = Math.max(expandedHeight - collapsedHeight, 1);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const progress = useDerivedValue(() =>
    interpolate(scrollY.value, [0, collapseDistance], [0, 1], Extrapolate.CLAMP)
  );

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, collapseDistance],
      [expandedHeight, collapsedHeight],
      Extrapolate.CLAMP
    ),
  }));

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -8], Extrapolate.CLAMP) },
      { scale: interpolate(progress.value, [0, 1], [1, 0.96], Extrapolate.CLAMP) },
    ],
  }));

  const collapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [8, 0], Extrapolate.CLAMP) },
      { scale: interpolate(progress.value, [0, 1], [0.96, 1], Extrapolate.CLAMP) },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.View style={[styles.expandedSlot, expandedStyle]}>
          {renderExpanded()}
        </Animated.View>
        <Animated.View style={[styles.collapsedSlot, collapsedStyle]}>
          {renderCollapsed()}
        </Animated.View>
      </Animated.View>
      {children({
        onScroll,
        contentContainerStyle: {
          paddingTop: expandedHeight + contentTopPadding,
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  expandedSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  collapsedSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});
