import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { MEMORY_LEVELS } from '@/data/memory-levels';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function MemoryLevels() {
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Kartları tap</Text>
          <Text style={styles.heroSub}>
            Əvvəl kartları öyrən, sonra cütlərini tap! İslami biliklər əyləncəli oyunla.
          </Text>
        </View>
        <Text style={styles.heroEmoji}>🃏</Text>
      </View>

      <Text style={styles.heading}>Səviyyələr</Text>
      <View style={styles.grid}>
        {MEMORY_LEVELS.map((level) => (
          <Pressable
            key={level.id}
            accessibilityRole="button"
            onPress={() => {
              playSound('tap');
              router.push({ pathname: '/children/memory/[level]', params: { level: level.id } });
            }}
            style={({ pressed }) => [
              styles.tile,
              { borderColor: level.color },
              pressed && { transform: [{ scale: 0.95 }] },
            ]}>
            <View style={[styles.tileIcon, { backgroundColor: level.color }]}>
              <Text style={styles.tileEmoji}>{level.emoji}</Text>
            </View>
            <Text style={styles.tileTitle} numberOfLines={3}>
              {level.title}
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
    backgroundColor: '#4D96FF',
    borderRadius: 26,
    padding: 18,
    borderWidth: 4,
    borderColor: '#fff',
  },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 28, fontFamily: fonts.display, color: '#fff', lineHeight: 36 },
  heroSub: { fontSize: 15, fontFamily: fonts.body, color: '#fff', lineHeight: 20 },
  heroEmoji: { fontSize: 64 },
  heading: { fontSize: 26, fontFamily: fonts.display, color: colors.text, lineHeight: 34 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '30.5%',
    flexGrow: 1,
    aspectRatio: 0.85,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 3,
    borderBottomWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  tileIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  tileEmoji: { fontSize: 32 },
  tileTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
});
