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

const TAB_BAR_HEIGHT = 60;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { colors, resolvedTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const extraBottom = Math.max(insets.bottom, 8);
  
  // Filter to only show specific tabs
  const visibleRoutes = state.routes.filter((route: any) => 
    ['today', 'all'].includes(route.name)
  );

  const tabWidth = dimensions.width / visibleRoutes.length;
  const translateX = useSharedValue(0);

  useEffect(() => {
    const activeRouteName = state.routes[state.index].name;
    const activeIndex = visibleRoutes.findIndex((r: any) => r.name === activeRouteName);

    if (activeIndex >= 0 && tabWidth > 0) {
      // CHANGED: used withTiming instead of withSpring to remove the wobble
      translateX.value = withTiming(activeIndex * tabWidth, {
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
          height: TAB_BAR_HEIGHT + extraBottom,
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
      {visibleRoutes.map((route: any, index: number) => {
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
        if (route.name === 'settings') iconName = 'settings';

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
      })}
    </View>
  );
}

export default function HomeTabLayout() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
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
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
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
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 6,
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
