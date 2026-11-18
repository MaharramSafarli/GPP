import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { PictureCanvas, pictureRatio } from '@/components/coloring/picture-canvas';
import { Screen } from '@/components/screen';
import { FREE_PICTURES } from '@/data/coloring-pictures';
import { loadFills } from '@/lib/coloring-store';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function ColoringMenu() {
  const { width } = useWindowDimensions();
  const [fills, setFills] = useState<Record<string, string[]>>({});

  // Reload saved work every time the menu is shown, so thumbnails stay current.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const f: Record<string, string[]> = {};
        for (const p of FREE_PICTURES) f[p.id] = await loadFills(p.id);
        if (alive) setFills(f);
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const content = Math.min(width, 520) - 32;
  const thumbW = (content - 12) / 2 - 16;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Şəkli rənglə</Text>
          <Text style={styles.heroSub}>Rəngi seç və şəklin istədiyin hissəsinə toxun. Şəkillərin burada saxlanır.</Text>
        </View>
        <Text style={styles.heroEmoji}>🎨</Text>
      </View>

      <View style={styles.grid}>
        {FREE_PICTURES.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => {
              playSound('tap');
              router.push({ pathname: '/children/coloring/free/[id]', params: { id: p.id } });
            }}
            style={({ pressed }) => [styles.card, { width: thumbW + 16 }, pressed && styles.pressed]}>
            <View style={{ width: thumbW, height: thumbW * 1.2, alignItems: 'center' }}>
              <PictureCanvas
                pic={p}
                fills={fills[p.id] ?? []}
                width={Math.min(thumbW, (thumbW * 1.2) / pictureRatio(p))}
              />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {p.emoji} {p.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8FC8',
    borderRadius: 26,
    padding: 18,
    borderWidth: 4,
    borderColor: '#fff',
  },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 28, fontFamily: fonts.display, color: '#fff', lineHeight: 36 },
  heroSub: { fontSize: 15, fontFamily: fonts.body, color: '#fff', lineHeight: 20 },
  heroEmoji: { fontSize: 56 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: '#E9E3FF',
    alignItems: 'center',
    padding: 8,
    gap: 6,
  },
  pressed: { transform: [{ scale: 0.96 }] },
  cardTitle: { fontSize: 15, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
});
