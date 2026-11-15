import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts } from '@/theme';

type Props = {
  label: string;
  color: string;
  onPress: () => void;
  flex?: boolean;
  disabled?: boolean;
};

export function BigButton({ label, color, onPress, flex, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: disabled ? 0.45 : 1 },
        flex && styles.flex,
        pressed && styles.pressed,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 66,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.18)',
  },
  flex: { flex: 1 },
  pressed: { transform: [{ scale: 0.96 }], borderBottomWidth: 2 },
  label: { fontSize: 22, fontFamily: fonts.display, color: '#fff', textAlign: 'center' },
});
