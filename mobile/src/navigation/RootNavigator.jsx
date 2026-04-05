import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROLES } from '../constants/config';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';

// Import Notification Screens
import RelativeNotificationsScreen from '../screens/relative/RelativeNotificationsScreen';
import CaregiverNotificationsScreen from '../screens/caregiver/CaregiverNotificationsScreen';
import ChatScreen from '../screens/common/ChatScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isRelative = user?.role === ROLES.RELATIVE;

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen 
            name="Notifications" 
            component={isRelative ? RelativeNotificationsScreen : CaregiverNotificationsScreen} 
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
