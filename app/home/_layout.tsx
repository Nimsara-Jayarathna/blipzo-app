import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { ProfileHeader } from '@/components/ProfileHeader';
import { AddTransactionSheet } from '@/components/home/AddTransactionSheet';
import { HomeBackground } from '@/components/home/HomeBackground';
import {
  HOME_TAB_BAR_HEIGHT,
  HOME_TAB_BAR_MARGIN,
} from '@/components/home/layout/spacing';

function CustomTabBar({ state, descriptors, navigation, onAddPress }: any) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { colors, resolvedTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const extraBottom = Math.max(insets.bottom, 0);
  
  // Filter to only show specific tabs
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
      // CHANGED: used withTiming instead of withSpring to remove the wobble
      translateX.value = withTiming(activeSlot * tabWidth, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [state.index, tabWidth, visibleRoutes]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth,
    };
  });

  return (
    <View 
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.surfaceGlassThick,
          borderColor: colors.borderGlass,
          shadowColor: colors.textMain,
          height: HOME_TAB_BAR_HEIGHT + extraBottom,
          paddingBottom: extraBottom,
        },
      ]}
      onLayout={(e) => setDimensions(e.nativeEvent.layout)}
    >
      {/* Sliding Background */}
      {dimensions.width > 0 && (
        <Animated.View
          style={[
            styles.slidingBubble,
            {
              backgroundColor:
                resolvedTheme === 'dark'
                  ? 'rgba(96, 165, 250, 0.18)'
                  : 'rgba(59, 130, 246, 0.12)',
            },
            animatedStyle,
          ]}
        />
      )}

      {/* Tabs */}
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
        if (route.name === 'all') iconName = 'list-alt';

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={iconName}
                size={22}
                color={isFocused ? colors.primaryAccent : colors.textMuted}
              />
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? colors.primaryAccent : colors.textMuted }
              ]}>
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
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={iconName}
                size={22}
                color={isFocused ? colors.primaryAccent : colors.textMuted}
              />
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? colors.primaryAccent : colors.textMuted }
              ]}>
                {options.title}
              </Text>
            </View>
          </Pressable>
        );
      })()}
    </View>
  );
}

export default function HomeTabLayout() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <HomeBackground>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} onAddPress={() => setIsAddOpen(true)} />
        )}
        screenOptions={{
          header: () => (
            <ProfileHeader
              user={user ? { name: user.name ?? user.email, avatarUrl: undefined } : null}
              showSettingsButton
            />
          ),
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen name="today" options={{ title: 'Today' }} />
        <Tabs.Screen name="all" options={{ title: 'All' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
      <AddTransactionSheet visible={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </HomeBackground>
  );
}

const styles = StyleSheet.create({
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
    marginHorizontal: HOME_TAB_BAR_MARGIN,
    marginBottom: HOME_TAB_BAR_MARGIN,
    marginTop: HOME_TAB_BAR_MARGIN,
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
