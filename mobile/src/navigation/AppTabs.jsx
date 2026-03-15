import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/config';

// Relative screens
import RelativeTasksScreen from '../screens/relative/RelativeTasksScreen';
import RelativeMessagesScreen from '../screens/relative/RelativeMessagesScreen';
import RelativeStatsScreen from '../screens/relative/RelativeStatsScreen';
import RelativeNotificationsScreen from '../screens/relative/RelativeNotificationsScreen';

// Caregiver screens
import CaregiverTasksScreen from '../screens/caregiver/CaregiverTasksScreen';
import CaregiverMessagesScreen from '../screens/caregiver/CaregiverMessagesScreen';
import CaregiverStatsScreen from '../screens/caregiver/CaregiverStatsScreen';
import CaregiverNotificationsScreen from '../screens/caregiver/CaregiverNotificationsScreen';

import TabBarIcon from '../components/common/TabBarIcon';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const isRelative = user?.role === ROLES.RELATIVE;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      {isRelative ? (
        <>
          <Tab.Screen
            name="Tasks"
            component={RelativeTasksScreen}
            options={{ title: 'Görevler', tabBarIcon: p => <TabBarIcon name="tasks" {...p} /> }}
          />
          <Tab.Screen
            name="Messages"
            component={RelativeMessagesScreen}
            options={{ title: 'Mesajlar', tabBarIcon: p => <TabBarIcon name="messages" {...p} /> }}
          />
          <Tab.Screen
            name="Stats"
            component={RelativeStatsScreen}
            options={{ title: 'İstatistik', tabBarIcon: p => <TabBarIcon name="stats" {...p} /> }}
          />
          <Tab.Screen
            name="Notifications"
            component={RelativeNotificationsScreen}
            options={{ title: 'Bildirimler', tabBarIcon: p => <TabBarIcon name="notifications" {...p} /> }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Tasks"
            component={CaregiverTasksScreen}
            options={{ title: 'Görevler', tabBarIcon: p => <TabBarIcon name="tasks" {...p} /> }}
          />
          <Tab.Screen
            name="Messages"
            component={CaregiverMessagesScreen}
            options={{ title: 'Mesajlar', tabBarIcon: p => <TabBarIcon name="messages" {...p} /> }}
          />
          <Tab.Screen
            name="Stats"
            component={CaregiverStatsScreen}
            options={{ title: 'İstatistik', tabBarIcon: p => <TabBarIcon name="stats" {...p} /> }}
          />
          <Tab.Screen
            name="Notifications"
            component={CaregiverNotificationsScreen}
            options={{ title: 'Bildirimler', tabBarIcon: p => <TabBarIcon name="notifications" {...p} /> }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}
