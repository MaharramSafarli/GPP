import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

type Props = {
  emoji: string;
  title: string;
  description: string;
  color: string;
  disabled?: boolean;
  onPress?: () => void;
};

/** A big, colorful, tappable card used for sections and games. */
export function Tile({ emoji, title, description, color, disabled, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: color, opacity: disabled ? 0.5 : 1 },
        pressed && styles.pressed,
      ]}>
      <View style={styles.bubble}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#2D2A6E',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  bubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 38 },
  text: { flex: 1 },
  title: { fontSize: 26, fontFamily: fonts.display, color: '#fff', lineHeight: 34 },
  description: { fontSize: 15, fontFamily: fonts.body, color: '#fff', lineHeight: 20 },
  arrow: { fontSize: 40, color: '#fff', fontFamily: fonts.display, opacity: 0.8 },
});
