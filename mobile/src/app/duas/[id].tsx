import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DuaAudioButton } from '@/components/dua-audio-button';
import { DuaScene } from '@/components/dua-scene';
import { Screen } from '@/components/screen';
import { DUA_AUDIO } from '@/data/dua-audio';
import { DUAS } from '@/data/duas';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function DuaPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const index = Math.max(0, DUAS.findIndex((d) => d.id === id));
  const dua = DUAS[index];
  const prev = DUAS[index - 1];
  const next = DUAS[index + 1];

  const go = (target: (typeof DUAS)[number]) => {
    playSound('tap');
    router.replace({ pathname: '/duas/[id]', params: { id: target.id } });
  };

  return (
    <Screen>
      <DuaScene scene={dua.scene} color={dua.color} />
      <View style={{ gap: 2 }}>
        <Text style={styles.title}>{dua.title}</Text>
        <Text style={styles.when}>🕰 {dua.when}</Text>
      </View>

      {dua.note ? (
        <View style={[styles.note, { borderColor: dua.color }]}>
          <Text style={styles.noteText}>{dua.note}</Text>
        </View>
      ) : null}

      {dua.parts.map((p, i) => (
        <View key={i} style={styles.card}>
          {p.intro ? <Text style={styles.intro}>{p.intro}</Text> : null}
          <Text style={styles.arabic}>{p.arabic}</Text>
          <Text style={styles.translit}>{p.translit}</Text>
          <Text style={styles.meaning}>{p.meaning}</Text>
          <DuaAudioButton source={DUA_AUDIO[`${dua.id}-${i}`]} color={dua.color} />
        </View>
      ))}

      {dua.after ? <Text style={styles.after}>{dua.after}</Text> : null}

      <Text style={styles.source}>📚 Mənbə: {dua.source}</Text>

      <View style={styles.nav}>
        {prev ? (
          <Pressable onPress={() => go(prev)} style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}>
            <Text style={styles.navText} numberOfLines={1}>‹ {prev.title}</Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {next ? (
          <Pressable onPress={() => go(next)} style={({ pressed }) => [styles.navBtn, styles.navNext, pressed && styles.pressed]}>
            <Text style={[styles.navText, { textAlign: 'right' }]} numberOfLines={1}>{next.title} ›</Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontFamily: fonts.display, color: colors.text, lineHeight: 36 },
  when: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted },
  note: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18,
    borderLeftWidth: 6,
    padding: 12,
  },
  noteText: { fontSize: 15, fontFamily: fonts.body, color: colors.text, lineHeight: 21 },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 16, gap: 10 },
  intro: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted },
  // No custom font: the phone's Arabic font is used.
  arabic: { fontSize: 30, lineHeight: 54, color: '#1F1B4D', textAlign: 'right', writingDirection: 'rtl' },
  translit: { fontSize: 17, fontFamily: fonts.body, fontStyle: 'italic', color: '#3F3B78', lineHeight: 24 },
  meaning: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, lineHeight: 25 },
  after: { fontSize: 15, fontFamily: fonts.body, color: colors.text, lineHeight: 21 },
  source: { fontSize: 13, fontFamily: fonts.body, color: colors.muted, lineHeight: 18 },
  nav: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  navNext: {},
  navText: { fontSize: 15, fontFamily: fonts.bold, color: colors.primary },
  pressed: { transform: [{ scale: 0.96 }] },
});
