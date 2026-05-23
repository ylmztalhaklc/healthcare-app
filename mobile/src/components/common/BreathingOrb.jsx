/**
 * BreathingOrb — smooth ping-pong nefes animasyonu.
 *
 * scale + opacity → useNativeDriver: true (native thread, buttery smooth)
 * backgroundColor → statik renk (animasyonsuz = driver çakışması yok)
 *
 * Animated.loop + Animated.sequence: döngü native thread'de kalır,
 * JS round-trip olmaz → sıfır takılma.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function BreathingOrb({
  color = '#00C9A7',
  size = 280,
  duration = 3800,
  style,
  opacity = 0.18,
}) {
  const { isDark } = useTheme();
  // Her iki modda da boost — dark modda üst sınır daha yüksek (neon renkler)
  // Dark modda neon renk arka plana yüksek kontrast yaratır → max düşürülür
  const effectiveOpacity = Math.min(opacity * 2.2, isDark ? 0.38 : 0.35);
  // Dark modda min oranı yüksek → delta dar → geçiş daha az dramatik = daha smooth
  const opacityMinRatio  = isDark ? 0.76 : 0.52;
  // Dark modda scale daha küçük → neon kenarın hareketi daha az hissedilir
  const scaleMax         = isDark ? 1.04 : 1.08;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animated.loop → tüm döngü native thread'de kalır, JS round-trip yok → sıfır takılma
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scaleAnim   = anim.interpolate({ inputRange: [0, 1], outputRange: [1, scaleMax] });
  const opacityAnim = anim.interpolate({ inputRange: [0, 1], outputRange: [effectiveOpacity * opacityMinRatio, effectiveOpacity] });

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
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

// ─── Dekoratif watermark bileşenleri ──────────────────────────

/** Tıbbi artı (+) işareti watermark — orijinal tasarım */
export function PlusWatermark({ color = '#00C9A7', size = 60, style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', opacity: 0.055 }, style]}>
      <View style={{ position: 'absolute', width: size * 0.2, height: size, borderRadius: 4, backgroundColor: color, left: size * 0.4 }} />
      <View style={{ position: 'absolute', width: size, height: size * 0.2, borderRadius: 4, backgroundColor: color, top: size * 0.4 }} />
    </View>
  );
}

/** EKG / kalp ritmi bar watermark — orijinal tasarım */
export function EkgWatermark({ color = '#00C9A7', style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', opacity: 0.07, flexDirection: 'row', alignItems: 'center', gap: 3 }, style]}>
      {[1, 0.4, 1.8, 0.6, 2.4, 0.5, 1.2, 0.3, 0.8].map((h, i) => (
        <View key={i} style={{ width: 3, height: 10 + h * 18, borderRadius: 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

