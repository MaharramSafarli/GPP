import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { PixelCanvas } from '@/components/coloring/pixel-canvas';
import { ShapeCanvas } from '@/components/coloring/shape-canvas';
import { Screen } from '@/components/screen';
import { FREE_PICTURES } from '@/data/coloring-pictures';
import { NUMBER_PICTURES, cellIndexes } from '@/data/coloring-numbers';
import { loadDone, loadFills } from '@/lib/coloring-store';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

const NUMBER_CELLS = NUMBER_PICTURES.map(cellIndexes);

export default function ColoringMenu() {
  const { width } = useWindowDimensions();
  const [done, setDone] = useState<Record<string, string>>({});
  const [fills, setFills] = useState<Record<string, string[]>>({});

  // Reload saved work every time the menu is shown, so thumbnails stay current.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const d: Record<string, string> = {};
        for (const [i, p] of NUMBER_PICTURES.entries()) d[p.id] = await loadDone(p.id, NUMBER_CELLS[i].length);
        const f: Record<string, string[]> = {};
        for (const p of FREE_PICTURES) f[p.id] = await loadFills(p.id);
        if (alive) {
          setDone(d);
          setFills(f);
        }
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
          <Text style={styles.heroSub}>Rəqəmlərlə və ya özün seçdiyin rənglərlə şəkilləri rənglə!</Text>
        </View>
        <Text style={styles.heroEmoji}>🎨</Text>
      </View>

      <Text style={styles.heading}>🔢 Rəqəmlə rənglə</Text>
      <Text style={styles.sub}>Hər rəqəmin öz rəngi var. Müqəddəs məscidləri rənglə!</Text>
      <View style={styles.grid}>
        {NUMBER_PICTURES.map((p, i) => {
          const d = done[p.id] ?? '';
          const total = NUMBER_CELLS[i].length;
          const count = [...d].filter((x) => x === '1').length;
          const pct = total ? Math.round((count / total) * 100) : 0;
          const cols = p.rows[0].length;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              onPress={() => {
                playSound('tap');
                router.push({ pathname: '/children/coloring/number/[id]', params: { id: p.id } });
              }}
              style={({ pressed }) => [styles.card, { width: thumbW + 16 }, pressed && styles.pressed]}>
              <PixelCanvas
                cols={cols}
                rows={p.rows.length}
                cells={NUMBER_CELLS[i]}
                colors={p.palette.map((x) => x.color)}
                done={d || '0'.repeat(total)}
                cell={Math.floor((thumbW - 4) / cols)}
              />
              <Text style={styles.cardTitle} numberOfLines={2}>
                {p.title}
              </Text>
              <Text style={[styles.badge, pct === 100 && styles.badgeDone]}>
                {pct === 100 ? '✅ Hazırdır' : `${pct}%`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.heading}>🖍️ Sərbəst rənglə</Text>
      <Text style={styles.sub}>Rəngi seç və şəklin istədiyin hissəsinə toxun. Şəkillərin burada saxlanır.</Text>
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
            <ShapeCanvas shapes={p.shapes} fills={fills[p.id] ?? []} width={thumbW} />
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
  heading: { fontSize: 24, fontFamily: fonts.display, color: colors.text, lineHeight: 32, marginBottom: -12 },
  sub: { fontSize: 14, fontFamily: fonts.body, color: colors.muted, lineHeight: 19 },
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
  badge: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.primary,
    backgroundColor: '#EFEAFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  badgeDone: { color: '#1F7A3F', backgroundColor: '#DDF7E6' },
});
