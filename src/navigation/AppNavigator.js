// Navigation Setup for HoopHub

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import {
  GamesScreen,
  GameDetailScreen,
  PlayersScreen,
  PlayerDetailScreen,
  NewsScreen,
  SettingsScreen,
  ReelsScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Default screen options
const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    ...typography.headline,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
};

// Games Stack
const GamesStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="GamesHome"
      component={GamesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GameDetail"
      component={GameDetailScreen}
      options={({ route }) => ({
        title: route.params?.game?.shortName || 'Game Details',
        headerBackTitle: 'Games',
      })}
    />
  </Stack.Navigator>
);

// Players Stack
const PlayersStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="PlayersHome"
      component={PlayersScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PlayerDetail"
      component={PlayerDetailScreen}
      options={({ route }) => ({
        title: route.params?.player?.fullName || 'Player Details',
        headerBackTitle: 'Players',
      })}
    />
  </Stack.Navigator>
);

// News Stack
const NewsStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="NewsHome"
      component={NewsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Settings Stack
const SettingsStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="SettingsHome"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Reels Stack
const ReelsStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="ReelsHome"
      component={ReelsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingTop: 8,
        height: 88,
      },
      tabBarActiveTintColor: colors.secondary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle: {
        ...typography.caption2,
        fontWeight: '500',
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        switch (route.name) {
          case 'Games':
            iconName = focused ? 'basketball' : 'basketball-outline';
            break;
          case 'Reels':
            iconName = focused ? 'play-circle' : 'play-circle-outline';
            break;
          case 'Players':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'News':
            iconName = focused ? 'newspaper' : 'newspaper-outline';
            break;
          case 'Settings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'ellipse';
        }
        
        return <Ionicons name={iconName} size={24} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Games" component={GamesStack} />
    <Tab.Screen name="Reels" component={ReelsStack} />
    <Tab.Screen name="Players" component={PlayersStack} />
    <Tab.Screen name="News" component={NewsStack} />
    <Tab.Screen name="Settings" component={SettingsStack} />
  </Tab.Navigator>
);

// Main Navigation Container
const AppNavigator = () => (
  <NavigationContainer>
    <TabNavigator />
  </NavigationContainer>
);

export default AppNavigator;
