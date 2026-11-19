import { StyleSheet, Text, View } from 'react-native';

/** A simple emoji picture that shows children when the dua is said. */
export function DuaScene({ scene, color, size = 1 }: { scene: string[]; color: string; size?: number }) {
  return (
    <View style={[styles.scene, { backgroundColor: color, paddingVertical: 14 * size, borderRadius: 22 * size }]}>
      <View style={[styles.glow, { width: 120 * size, height: 120 * size, borderRadius: 60 * size }]} />
      <View style={styles.row}>
        {scene.map((e, i) => (
          <Text key={i} style={{ fontSize: (i === 1 ? 54 : 40) * size, lineHeight: (i === 1 ? 70 : 54) * size }}>
            {e}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.3)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
