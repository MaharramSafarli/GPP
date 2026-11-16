import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

type Props = {
  faceUp: boolean;
  emoji: string;
  name: string;
  size: number;
  matched?: boolean;
  highlight?: boolean;
  onPress?: () => void;
};

/** A card that flips between a green "?" back and its emoji face. */
export function FlipCard({ faceUp, emoji, name, size, matched, highlight, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [shown, setShown] = useState(faceUp);

  useEffect(() => {
    if (faceUp === shown) return;
    Animated.timing(scale, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setShown(faceUp);
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    });
  }, [faceUp, shown, scale]);

  useEffect(() => {
    if (!highlight) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [highlight, pulse]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shown ? name : 'Bağlı kart'}
      disabled={!onPress}
      onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          { width: size, height: size, transform: [{ scaleX: scale }, { scale: pulse }] },
          shown ? styles.face : styles.back,
          matched && styles.matched,
          highlight && styles.glow,
        ]}>
        {shown ? (
          <>
            <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
            <Text style={[styles.name, { fontSize: Math.max(11, size * 0.12) }]} numberOfLines={2}>
              {name}
            </Text>
          </>
        ) : (
          <View style={styles.backInner}>
            <Text style={[styles.q, { fontSize: size * 0.55, lineHeight: size * 0.7 }]}>?</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#14532D',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  back: { backgroundColor: '#22A447', borderBottomWidth: 6, borderBottomColor: '#15803D' },
  backInner: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  q: { fontFamily: 'Baloo2_800ExtraBold', color: '#fff' },
  face: { backgroundColor: '#fff', borderWidth: 3, borderColor: '#E9E3FF' },
  matched: { borderColor: '#22C55E', backgroundColor: '#F0FFF4' },
  glow: { borderColor: '#FFB703', borderWidth: 4 },
  name: { fontFamily: fonts.bold, color: '#2D2A6E', textAlign: 'center', marginTop: 2 },
});
