import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AZ_ALPHABET } from '@/lib/az';
import { fonts } from '@/theme';

type Props = {
  onKey: (letter: string) => void;
  onErase: () => void;
  color?: string;
  disabled?: boolean;
  /** Shorter keys for short screens. */
  compact?: boolean;
};

/** On-screen Azerbaijani keyboard (all 32 letters, 3 rows) with a delete key. */
export function AzKeyboard({ onKey, onErase, color = '#2F6F62', disabled, compact }: Props) {
  const keyH = compact ? 36 : 42;
  const { width } = useWindowDimensions();
  const rows = [AZ_ALPHABET.slice(0, 11), AZ_ALPHABET.slice(11, 22), AZ_ALPHABET.slice(22)];
  // 11 keys per row (+ a 1.5× wide delete key on the last row) inside 16px of keyboard padding.
  const keyW = Math.floor((Math.min(width, 520) - 32 - 16 - 10 * 4) / 11.5);
  return (
    <View style={[styles.keyboard, { backgroundColor: color }, compact && styles.compact, disabled && styles.disabled]}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((l) => (
            <Pressable
              key={l}
              disabled={disabled}
              onPress={() => onKey(l)}
              style={({ pressed }) => [styles.key, { width: keyW, height: keyH }, pressed && styles.pressed]}>
              <Text style={styles.text}>{l}</Text>
            </Pressable>
          ))}
          {i === 2 && (
            <Pressable
              disabled={disabled}
              onPress={onErase}
              accessibilityLabel="Sil"
              style={({ pressed }) => [styles.key, styles.erase, { width: keyW * 1.5, height: keyH }, pressed && styles.pressed]}>
              <Text style={styles.text}>⌫</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { borderRadius: 18, padding: 8, gap: 6 },
  compact: { padding: 6, gap: 4 },
  disabled: { opacity: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  key: {
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  erase: { backgroundColor: '#FF4D6D' },
  pressed: { backgroundColor: 'rgba(255,255,255,0.45)' },
  text: { fontSize: 18, fontFamily: fonts.display, color: '#fff' },
});
