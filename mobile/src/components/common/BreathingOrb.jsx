/**
 * BreathingOrb — smooth ping-pong nefes animasyonu.
 * Callback zinciri: Animated.loop/sequence kullanmaz,
 * dolayısıyla Android loop-boundary stutter sorunu olmaz.
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View } from 'react-native';

export default function BreathingOrb({
  color = '#00C9A7',
  size = 280,
  duration = 3800,
  style,
  opacity = 0.18,
}) {
  // Wall-clock phase → ilk frame doğru fazda başlar, mount sıçraması olmaz
  const initPhase = useMemo(() => {
    const cycle = duration * 2;
    const e = Date.now() % cycle;
    return e < duration ? e / duration : 1 - (e - duration) / duration;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const anim    = useRef(new Animated.Value(initPhase)).current;
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;

    const cycle    = duration * 2;
    const e        = Date.now() % cycle;
    const expanding = e < duration;
    // Kalan süre: mevcut yarım döngüyü tamamlamak için
    const remaining = Math.max(30, expanding ? duration - e : cycle - e);

    // Her timing kendi callback'inde bir sonrakini başlatır → seamless ping-pong
    const step = (toValue, dur) => {
      Animated.timing(anim, {
        toValue,
        duration: dur,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }).start(({ finished }) => {
        if (finished && !stopped.current) {
          step(toValue === 1 ? 0 : 1, duration);
        }
      });
    };

    step(expanding ? 1 : 0, remaining);

    return () => { stopped.current = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scaleAnim   = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const opacityAnim = anim.interpolate({ inputRange: [0, 1], outputRange: [opacity * 0.28, opacity] });

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

export function PlusWatermark({ color = '#00C9A7', size = 60, style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', opacity: 0.055 }, style]}>
      <View style={{ position: 'absolute', width: size * 0.2, height: size, borderRadius: 4, backgroundColor: color, left: size * 0.4 }} />
      <View style={{ position: 'absolute', width: size, height: size * 0.2, borderRadius: 4, backgroundColor: color, top: size * 0.4 }} />
    </View>
  );
}

export function EkgWatermark({ color = '#00C9A7', style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', opacity: 0.07, flexDirection: 'row', alignItems: 'center', gap: 3 }, style]}>
      {[1, 0.4, 1.8, 0.6, 2.4, 0.5, 1.2, 0.3, 0.8].map((h, i) => (
        <View key={i} style={{ width: 3, height: 10 + h * 18, borderRadius: 2, backgroundColor: color }} />
      ))}
    </View>
  );
}
