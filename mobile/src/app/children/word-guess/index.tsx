import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Screen } from '@/components/screen';
import { EMPTY_STATS, STATS_KEY, type WordGuessStats } from '@/games/word-guess/engine';
import { playSound } from '@/lib/sound';
import { loadJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

const RULES = [
  { icon: '🔤', title: '11 söz, 1 oyun', text: 'Əvvəl 3 hərfli sözlər gəlir, sonra sözlər uzanır: 4, 5, 6… 9 hərfə qədər.' },
  { icon: '⏱', title: 'Hər söz üçün 1 dəqiqə', text: 'Vaxt bitəndə cavab göstərilir və növbəti sözə keçirsən.' },
  { icon: '⭐', title: 'Hər hərf 100 xal', text: '3 hərfli söz 300 xal, 9 hərfli söz 900 xal qazandırır.' },
  { icon: '💡', title: 'Hərf ala bilərsən', text: 'Hər alınan hərf qazancı 100 azaldır. Sözü tapmasan, aldığın hərflərin xalı çıxılır.' },
  { icon: '🔁', title: 'Səhv etsən, yenə yaz', text: 'Cavab səhv olsa, xanalar silinir — vaxt bitənə qədər yenidən cəhd et.' },
];

export default function WordGuessHome() {
  const [stats, setStats] = useState<WordGuessStats>(EMPTY_STATS);

  useFocusEffect(
    useCallback(() => {
      loadJSON(STATS_KEY, EMPTY_STATS).then(setStats);
    }, []),
  );

  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : null;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Söz ustası</Text>
          <Text style={styles.heroSub}>İpucunu oxu, sözü tap! İslami və gündəlik sözlər.</Text>
        </View>
        <Text style={styles.heroEmoji}>🔤</Text>
      </View>

      <View style={styles.stats}>
        <Stat icon="🏆" label="Rekord" value={String(stats.best)} />
        <Stat icon="🎮" label="Oyun" value={String(stats.played)} />
        <Stat icon="🎯" label="Dəqiqlik" value={accuracy === null ? '—' : `${accuracy}%`} />
      </View>

      <BigButton
        label="▶️ Oynamağa başla"
        color={colors.correct}
        onPress={() => {
          playSound('tap');
          router.push('/children/word-guess/play');
        }}
      />

      <Text style={styles.heading}>Necə oynanılır?</Text>
      {RULES.map((r) => (
        <View key={r.title} style={styles.rule}>
          <Text style={styles.ruleIcon}>{r.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.ruleTitle}>{r.title}</Text>
            <Text style={styles.ruleText}>{r.text}</Text>
          </View>
        </View>
      ))}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>NÜMUNƏ</Text>
        <Text style={styles.exampleText}>3 hərfli söz → 300 xal.</Text>
        <Text style={styles.exampleText}>1 hərf alsan, qazanc 200 olur.</Text>
        <Text style={styles.exampleText}>
          Tapsan <Text style={styles.plus}>+200</Text>, tapmasan <Text style={styles.minus}>−100</Text>.
        </Text>
      </View>
    </Screen>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0FA3B1',
    borderRadius: 26,
    padding: 18,
    borderWidth: 4,
    borderColor: '#fff',
  },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 28, fontFamily: fonts.display, color: '#fff', lineHeight: 36 },
  heroSub: { fontSize: 15, fontFamily: fonts.body, color: '#fff', lineHeight: 20 },
  heroEmoji: { fontSize: 56 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 10, alignItems: 'center' },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 24, fontFamily: fonts.display, color: colors.text, lineHeight: 32 },
  statLabel: { fontSize: 13, fontFamily: fonts.bold, color: colors.muted },
  heading: { fontSize: 24, fontFamily: fonts.display, color: colors.text, lineHeight: 32 },
  rule: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 14, alignItems: 'center' },
  ruleIcon: { fontSize: 30 },
  ruleTitle: { fontSize: 18, fontFamily: fonts.display, color: colors.text, lineHeight: 24 },
  ruleText: { fontSize: 15, fontFamily: fonts.body, color: colors.muted, lineHeight: 20 },
  example: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0FA3B1',
    backgroundColor: 'rgba(255,255,255,0.6)',
    gap: 2,
  },
  exampleTitle: { fontSize: 13, fontFamily: fonts.bold, color: '#0FA3B1', letterSpacing: 2 },
  exampleText: { fontSize: 16, fontFamily: fonts.body, color: colors.text },
  plus: { fontFamily: fonts.bold, color: '#1F8A4C' },
  minus: { fontFamily: fonts.bold, color: colors.foul },
});
