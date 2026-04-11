import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICON_MAP = {
  tasks:    { focused: 'checkmark-circle',        unfocused: 'checkmark-circle-outline' },
  messages: { focused: 'chatbubble-ellipses',     unfocused: 'chatbubble-ellipses-outline' },
  stats:    { focused: 'bar-chart',               unfocused: 'bar-chart-outline' },
  notifications: { focused: 'notifications',      unfocused: 'notifications-outline' },
  home:     { focused: 'home',                    unfocused: 'home-outline' },
};

export default function TabBarIcon({ name, focused, color, size = 22 }) {
  const map = ICON_MAP[name] || { focused: 'ellipse', unfocused: 'ellipse-outline' };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={focused ? map.focused : map.unfocused} size={size} color={color} />
    </View>
  );
}
