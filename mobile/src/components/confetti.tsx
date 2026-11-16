import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const COLORS = ['#FF4D6D', '#FFB703', '#22C55E', '#4D96FF', '#9B5DE5', '#00C2D1', '#FF7A59'];

/** Falling paper confetti. Change `burst` to fire again. */
export function Confetti({ burst, count = 60 }: { burst: number; count?: number }) {
  const { width, height } = Dimensions.get('window');
  const progress = useRef(new Animated.Value(0)).current;

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: `${burst}-${i}`,
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 160,
        delay: Math.random() * 0.35,
        size: 6 + Math.random() * 8,
        spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720),
        color: COLORS[i % COLORS.length],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst, count, width],
  );

  useEffect(() => {
    if (!burst) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 2600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [burst, progress]);

  if (!burst) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p) => {
        const start = p.delay;
        const t = progress.interpolate({
          inputRange: [0, start, 1],
          outputRange: [0, 0, 1],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={p.key}
            style={{
              position: 'absolute',
              left: p.x,
              top: -20,
              width: p.size,
              height: p.size * 1.6,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity: t.interpolate({ inputRange: [0, 0.01, 0.85, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, height + 40] }) },
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                {
                  rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
