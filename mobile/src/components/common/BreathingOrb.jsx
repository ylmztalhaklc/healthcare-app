/**
 * BreathingOrb — Nefes alan, pulse veren dekoratif filigran bileşeni.
 * Login, home ekranlarına arka plan derinliği katar.
 *
 * Kullanım:
 *   <BreathingOrb color={colors.primary} size={320} style={{ top: -80, right: -80 }} />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function BreathingOrb({
  color = '#00C9A7',
  size = 280,
  duration = 3800,
  style,
  opacity = 0.18,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const fade  = useRef(new Animated.Value(opacity * 0.6)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration, useNativeDriver: true, easing: t => Math.sin(t * Math.PI / 2) }),
          Animated.timing(fade,  { toValue: opacity, duration, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration, useNativeDriver: true, easing: t => 1 - Math.cos(t * Math.PI / 2) }),
          Animated.timing(fade,  { toValue: opacity * 0.5, duration, useNativeDriver: true }),
        ]),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [duration, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
          opacity: fade,
        },
        style,
      ]}
    />
  );
}

/**
 * HealthWatermark — Sağlık ikonları filigranı.
 * Arka plana EKG çizgisi veya artı sembolü ekler.
 */
export function PlusWatermark({ color = '#00C9A7', size = 60, style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', opacity: 0.055 }, style]}>
      {/* Dikey çubuk */}
      <View style={{ position: 'absolute', width: size * 0.2, height: size, borderRadius: 4, backgroundColor: color, left: size * 0.4 }} />
      {/* Yatay çubuk */}
      <View style={{ position: 'absolute', width: size, height: size * 0.2, borderRadius: 4, backgroundColor: color, top: size * 0.4 }} />
    </View>
  );
}

/**
 * EkgLine — EKG / kalp atışı filigranı (soyut çizgiler).
 */
export function EkgWatermark({ color = '#00C9A7', style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', opacity: 0.07, flexDirection: 'row', alignItems: 'center', gap: 3 }, style]}>
      {[1, 0.4, 1.8, 0.6, 2.4, 0.5, 1.2, 0.3, 0.8].map((h, i) => (
        <View key={i} style={{ width: 3, height: 10 + h * 18, borderRadius: 2, backgroundColor: color }} />
      ))}
    </View>
  );
}
