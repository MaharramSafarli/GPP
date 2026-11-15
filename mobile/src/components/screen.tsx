import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

/** Soft floating shapes that make the background feel playful. */
const DECOR = [
  { emoji: '☁️', top: '4%', left: '6%', size: 46, opacity: 0.7 },
  { emoji: '⭐', top: '12%', right: '8%', size: 26, opacity: 0.55 },
  { emoji: '🎈', top: '46%', left: '-3%', size: 38, opacity: 0.3 },
  { emoji: '☁️', top: '58%', right: '-4%', size: 54, opacity: 0.5 },
  { emoji: '✨', bottom: '8%', left: '10%', size: 26, opacity: 0.5 },
  { emoji: '🌈', bottom: '3%', right: '8%', size: 36, opacity: 0.35 },
] as const;

type Props = { children: ReactNode; scroll?: boolean };

export function Screen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const padding = { paddingBottom: 16 + insets.bottom };

  return (
    <View style={styles.root}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {DECOR.map((d, i) => {
          const { emoji, size, opacity, ...pos } = d;
          return (
            <Text key={i} style={[styles.decor, pos, { fontSize: size, opacity }]}>
              {emoji}
            </Text>
          );
        })}
      </View>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, padding]}>{children}</ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, padding]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  fill: { flex: 1 },
  content: { padding: 16, gap: 16 },
  decor: { position: 'absolute' },
});
