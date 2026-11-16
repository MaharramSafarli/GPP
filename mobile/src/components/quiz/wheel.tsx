import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { QUIZ_CATEGORIES } from '@/data/quiz-questions';
import { WHEEL, spinWheel, type Slice } from '@/games/quiz/engine';
import { playSound, vibrate } from '@/lib/sound';
import { fonts } from '@/theme';

const STEP = 360 / WHEEL.length;

export function sliceInfo(slice: Slice) {
  if (slice === 'star') return { emoji: '⭐', title: 'Nişan', color: '#FFB703' };
  const c = QUIZ_CATEGORIES.find((x) => x.id === slice)!;
  return { emoji: c.emoji, title: c.title, color: c.color };
}

/** The category wheel. Tap the centre to spin; calls onResult with the slice under the pointer. */
export function Wheel({ size, onResult, disabled }: { size: number; onResult: (s: Slice) => void; disabled?: boolean }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const current = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const r = size / 2;
  const bubble = size * 0.22;

  const spin = () => {
    if (spinning || disabled) return;
    setSpinning(true);
    playSound('flip');
    vibrate('light');
    const { index, slice } = spinWheel();
    const base = current.current;
    const align = (((-index * STEP - base) % 360) + 360) % 360;
    const target = base + 360 * 5 + align;
    current.current = target;
    let ticks = 0;
    const ticker = setInterval(() => {
      ticks++;
      if (ticks % (1 + Math.floor(ticks / 6)) === 0) playSound('tick');
    }, 110);
    Animated.timing(rotation, {
      toValue: target,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      clearInterval(ticker);
      setSpinning(false);
      playSound('correct');
      vibrate('medium');
      setTimeout(() => onResult(slice), 500);
    });
  };

  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: size, height: size + 18, alignItems: 'center' }}>
      <Animated.View style={[styles.wheel, { width: size, height: size, borderRadius: r, transform: [{ rotate }] }]}>
        {WHEEL.map((slice, i) => {
          const info = sliceInfo(slice);
          const angle = (i * STEP * Math.PI) / 180;
          const dist = r - bubble * 0.72;
          return (
            <View key={slice} style={StyleSheet.absoluteFill} pointerEvents="none">
              {/* Spoke */}
              <View
                style={[
                  styles.spoke,
                  { height: r, left: r - 2, transform: [{ translateY: r / 2 }, { rotate: `${i * STEP + STEP / 2}deg` }, { translateY: -r / 2 }] },
                ]}
              />
              <View
                style={[
                  styles.bubble,
                  {
                    width: bubble,
                    height: bubble,
                    borderRadius: bubble / 2,
                    backgroundColor: info.color,
                    left: r + Math.sin(angle) * dist - bubble / 2,
                    top: r - Math.cos(angle) * dist - bubble / 2,
                    transform: [{ rotate: `${i * STEP}deg` }],
                  },
                ]}>
                <Text style={{ fontSize: bubble * 0.5 }}>{info.emoji}</Text>
              </View>
            </View>
          );
        })}
      </Animated.View>
      <View style={styles.pointer} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fırlat"
        onPress={spin}
        style={({ pressed }) => [
          styles.hub,
          { width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16, top: r - size * 0.16 },
          (spinning || disabled) && { opacity: 0.85 },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}>
        <Text style={styles.hubText}>{spinning ? '...' : 'FIRLAT'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    backgroundColor: '#fff',
    borderWidth: 8,
    borderColor: '#7B5CFF',
    shadowColor: '#2D2A6E',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  spoke: { position: 'absolute', top: 0, width: 4, backgroundColor: '#EFEAFF' },
  bubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  pointer: {
    position: 'absolute',
    top: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF4D6D',
  },
  hub: {
    position: 'absolute',
    backgroundColor: '#FFB703',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#fff',
    elevation: 7,
  },
  hubText: { fontFamily: fonts.display, color: '#fff', fontSize: 18 },
});
