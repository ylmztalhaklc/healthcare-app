import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme';

export default function PlaceholderScreen({ title }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.headingMD, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[typography.bodyMD, { color: colors.textMuted, marginTop: 8 }]}>
        Bu ekran henüz geliştirme aşamasındadır.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
