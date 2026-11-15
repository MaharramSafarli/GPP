import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  color: string;
  onPress: () => void;
  flex?: boolean;
};

export function BigButton({ label, color, onPress, flex }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color },
        flex && styles.flex,
        pressed && styles.pressed,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 64,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  label: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
});
