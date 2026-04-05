import React from 'react';
import { View, Text } from 'react-native';

const ICONS = {
  home:          { focused: '🏠', unfocused: '🏠' },
  tasks:         { focused: '✓', unfocused: '✓' },
  messages:      { focused: '✉', unfocused: '✉' },
  stats:         { focused: '▤', unfocused: '▤' },
  notifications: { focused: '🔔', unfocused: '🔕' },
};

export default function TabBarIcon({ name, focused, color, size = 22 }) {
  const icon = ICONS[name] || {};
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size, color }}>{focused ? icon.focused : icon.unfocused}</Text>
    </View>
  );
}
