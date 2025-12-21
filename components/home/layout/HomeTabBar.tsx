import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { colors, resolvedTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const extraBottom = Math.max(insets.bottom, 0);

  const visibleRoutes = state.routes.filter((route: any) =>
    ['today', 'all'].includes(route.name)
  );
  const todayRoute = visibleRoutes.find((route: any) => route.name === 'today');
  const allRoute = visibleRoutes.find((route: any) => route.name === 'all');

  return (
    <View
      style={[
        styles.barWrapper,
        {
          paddingBottom: extraBottom + HOME_TAB_BAR_MARGIN,
        },
      ]}
    >
      <BlurView
        intensity={resolvedTheme === 'dark' ? 25 : 35}
        tint={resolvedTheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          'transparent',
          resolvedTheme === 'dark'
            ? 'rgba(2, 6, 23, 0.45)'
            : 'rgba(248, 250, 252, 0.7)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[
          styles.tabBarContainer,
          {
            borderColor: colors.borderGlass,
            height: HOME_TAB_BAR_HEIGHT,
          },
        ]}
      >
        <BlurView
          intensity={resolvedTheme === 'dark' ? 45 : 60}
          tint={resolvedTheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: HOME_TAB_BAR_MARGIN,
    paddingTop: HOME_TAB_BAR_MARGIN,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
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
