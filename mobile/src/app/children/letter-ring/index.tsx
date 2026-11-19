import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Screen } from '@/components/screen';
import { EMPTY_STATS, STATS_KEY, type RingStats } from '@/games/letter-ring/engine';
import { playSound } from '@/lib/sound';
import { loadJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

const ACCENT = '#E8743B';

const RULES = [
  { icon: '🔠', title: '32 hərfli dairə', text: 'Əlifbanın bütün hərfləri dairədə düzülüb. Hər hərf üçün bir sual var.' },
  { icon: '❓', title: 'Hər hərfə bir sual', text: 'Cavab adətən o hərflə başlayır. Bəzi suallarda isə hərf sözün içində olur (məsələn, Ğ).' },
  { icon: '⌨️', title: 'Cavabı yaz', text: 'Cavabı klaviaturada yaz və «Göndər» düyməsinə bas. Bilmirsənsə, «Pas» de.' },
  { icon: '🎨', title: 'Rəngli dairə', text: 'Düz cavab yaşıl, səhv cavab qırmızı, pas keçdiyin hərf boz olur.' },
  { icon: '🔁', title: 'Pas keçdiyin hərflər', text: 'Dairə bitəndə pas keçdiyin hərflər yenidən gəlir — vaxt bitənə qədər.' },
  { icon: '⏱', title: 'Vaxt və xal', text: 'Ümumi vaxt 5 dəqiqədir. Hər düz cavab 100 xal qazandırır.' },
];

export default function LetterRingHome() {
  const [stats, setStats] = useState<RingStats>(EMPTY_STATS);

  useFocusEffect(
    useCallback(() => {
      loadJSON(STATS_KEY, EMPTY_STATS).then(setStats);
    }, []),
  );

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Hərf dairəsi</Text>
          <Text style={styles.heroSub}>A-dan Z-yə hər hərf üçün bir sual. Neçəsini tapa bilərsən?</Text>
        </View>
        <Text style={styles.heroEmoji}>🔠</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>{stats.best}</Text>
          <Text style={styles.statLabel}>Rekord</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>🎮</Text>
          <Text style={styles.statValue}>{stats.played}</Text>
          <Text style={styles.statLabel}>Oyun</Text>
        </View>
      </View>

      <BigButton
        label="▶️ Oynamağa başla"
        color={colors.correct}
        onPress={() => {
          playSound('tap');
          router.push('/children/letter-ring/play');
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
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
});
