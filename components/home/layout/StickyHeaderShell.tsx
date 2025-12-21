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
  disableTransition?: boolean;
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
  disableTransition = false,
  children,
}: StickyHeaderShellProps) {
  const scrollY = useSharedValue(0);
  const collapseDistance = Math.max(expandedHeight - collapsedHeight, 1);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (!disableTransition) {
        scrollY.value = event.contentOffset.y;
      } else {
        scrollY.value = 0;
      }
    },
  });

  const activeScrollY = useDerivedValue(() => {
    return disableTransition ? 0 : scrollY.value;
  });

  const progress = useDerivedValue(() =>
    interpolate(activeScrollY.value, [0, collapseDistance], [0, 1], Extrapolate.CLAMP)
  );

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      activeScrollY.value,
      [0, collapseDistance],
      [expandedHeight, collapsedHeight],
      Extrapolate.CLAMP
    ),
    // THE FIX: Ensure no background color is applied to the header container
    backgroundColor: 'transparent', 
  }));

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -8], Extrapolate.CLAMP) },
    ],
  }));

  const collapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [8, 0], Extrapolate.CLAMP) },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* 
          The header container is now transparent. 
          The 'ash color' was the default background here.
      */}
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
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // Ensure no hidden overflow is causing visual artifacts
    backgroundColor: 'transparent',
  },
  expandedSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  collapsedSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});