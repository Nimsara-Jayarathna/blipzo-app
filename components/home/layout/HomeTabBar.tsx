import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/context/ThemeContext';
import {
  HOME_TAB_BAR_HEIGHT,
  HOME_TAB_BAR_MARGIN,
} from '@/components/home/layout/spacing';

type HomeTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
  onAddPress: () => void;
};

export function HomeTabBar({ state, descriptors, navigation, onAddPress }: HomeTabBarProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { colors, resolvedTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const extraBottom = Math.max(insets.bottom, 0);

  const visibleRoutes = state.routes.filter((route: any) =>
    ['today', 'all'].includes(route.name)
  );

  const slotCount = visibleRoutes.length + 1;
  const tabWidth = dimensions.width / slotCount;
  const translateX = useSharedValue(0);
  const todayRoute = visibleRoutes.find((route: any) => route.name === 'today');
  const allRoute = visibleRoutes.find((route: any) => route.name === 'all');

  useEffect(() => {
    const activeRouteName = state.routes[state.index].name;
    const activeIndex = visibleRoutes.findIndex((r: any) => r.name === activeRouteName);
    const activeSlot = activeIndex === 0 ? 0 : activeIndex === 1 ? 2 : -1;

    if (activeSlot >= 0 && tabWidth > 0) {
      translateX.value = withTiming(activeSlot * tabWidth, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [state.index, tabWidth, visibleRoutes, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth,
    };
  });

  return (
    <View
      style={[
        styles.barWrapper,
        {
          backgroundColor: colors.surface1,
          paddingBottom: extraBottom + HOME_TAB_BAR_MARGIN,
        },
      ]}
    >
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: colors.surface1,
            borderColor: colors.borderSoft,
            shadowColor: colors.textMain,
            height: HOME_TAB_BAR_HEIGHT,
          },
        ]}
        onLayout={(e) => setDimensions(e.nativeEvent.layout)}
      >
      {dimensions.width > 0 && (
        <Animated.View
          style={[
            styles.slidingBubble,
            {
              backgroundColor:
                resolvedTheme === 'dark'
                  ? 'rgba(96, 165, 250, 0.22)'
                  : 'rgba(59, 130, 246, 0.16)',
            },
            animatedStyle,
          ]}
        />
      )}

      {todayRoute && (() => {
        const route = todayRoute;
        const { options } = descriptors[route.key];
        const isFocused = state.routes[state.index].key === route.key;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: React.ComponentProps<typeof MaterialIcons>['name'] = 'circle';
        if (route.name === 'today') iconName = 'today';
        if (route.name === 'all') iconName = 'list-alt';

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={iconName}
                size={22}
                color={isFocused ? colors.primaryAccent : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primaryAccent : colors.textMuted },
                ]}
              >
                {options.title}
              </Text>
            </View>
          </Pressable>
        );
      })()}

      <Pressable
        onPress={onAddPress}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        accessibilityHint="Opens the add transaction form"
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="add-circle-outline" size={24} color={colors.primaryAccent} />
          <Text style={[styles.tabLabel, { color: colors.textMuted }]}>Add</Text>
        </View>
      </Pressable>

      {allRoute && (() => {
        const route = allRoute;
        const { options } = descriptors[route.key];
        const isFocused = state.routes[state.index].key === route.key;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: React.ComponentProps<typeof MaterialIcons>['name'] = 'circle';
        if (route.name === 'today') iconName = 'today';
        if (route.name === 'all') iconName = 'list-alt';

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={iconName}
                size={22}
                color={isFocused ? colors.primaryAccent : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primaryAccent : colors.textMuted },
                ]}
              >
                {options.title}
              </Text>
            </View>
          </Pressable>
        );
      })()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    width: '100%',
    paddingHorizontal: HOME_TAB_BAR_MARGIN,
    paddingTop: HOME_TAB_BAR_MARGIN,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: HOME_TAB_BAR_HEIGHT,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  slidingBubble: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(52,152,219,0.12)',
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
