import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 24,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 44 },
  text: { flex: 1, gap: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  description: { fontSize: 15, color: '#fff', opacity: 0.9 },
});
