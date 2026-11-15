import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { EXPLAIN_IT_WORDS, type WordCard } from '@/data/explain-it-words';
import { shuffle } from '@/games/explain-it/shuffle';
import { colors } from '@/theme';

type Outcome = 'correct' | 'skip' | 'foul';
type Result = { card: WordCard; outcome: Outcome };

export default function ExplainItPlayScreen() {
  useKeepAwake();
  const params = useLocalSearchParams<{ seconds?: string }>();
  const roundSeconds = Number(params.seconds) || 60;

  const [deck, setDeck] = useState(() => shuffle(EXPLAIN_IT_WORDS));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [endsAt, setEndsAt] = useState(() => Date.now() + roundSeconds * 1000);
  const [now, setNow] = useState(() => Date.now());

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const finished = remaining === 0 || index >= deck.length;

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (finished) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [finished]);

  const answer = (outcome: Outcome) => {
    if (finished) return;
    Haptics.impactAsync(
      outcome === 'correct' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    );
    setResults((prev) => [...prev, { card: deck[index], outcome }]);
    setIndex((i) => i + 1);
  };

  const playAgain = () => {
    setDeck(shuffle(EXPLAIN_IT_WORDS));
    setIndex(0);
    setResults([]);
    const start = Date.now();
    setNow(start);
    setEndsAt(start + roundSeconds * 1000);
  };

  if (finished) {
    return <ResultsView results={results} onPlayAgain={playAgain} />;
  }

  const card = deck[index];
  const lowTime = remaining <= 10;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={[styles.timer, lowTime && { color: colors.foul }]}>⏱ {remaining}s</Text>
        <Text style={styles.score}>
          ⭐ {results.filter((r) => r.outcome === 'correct').length}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.word} adjustsFontSizeToFit numberOfLines={2}>
          {card.word}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.dontSay}>Don&apos;t say:</Text>
        {card.forbidden.map((w) => (
          <Text key={w} style={styles.forbidden}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <BigButton label="✓ Correct" color={colors.correct} onPress={() => answer('correct')} />
        <View style={styles.row}>
          <BigButton label="Skip" color={colors.skip} onPress={() => answer('skip')} flex />
          <BigButton
            label="Said it! ✗"
            color={colors.foul}
            onPress={() => answer('foul')}
            flex
          />
        </View>
      </View>
    </View>
  );
}

function ResultsView({ results, onPlayAgain }: { results: Result[]; onPlayAgain: () => void }) {
  const count = (o: Outcome) => results.filter((r) => r.outcome === o).length;
  const label: Record<Outcome, string> = { correct: '✓', skip: '→', foul: '✗' };
  const color: Record<Outcome, string> = {
    correct: colors.correct,
    skip: colors.skip,
    foul: colors.foul,
  };

  return (
    <ScrollView contentContainerStyle={styles.results}>
      <Text style={styles.resultsEmoji}>🎉</Text>
      <Text style={styles.resultsTitle}>Time&apos;s up!</Text>
      <Text style={styles.bigScore}>{count('correct')}</Text>
      <Text style={styles.bigScoreLabel}>correct words</Text>

      <View style={styles.statsRow}>
        <Stat label="Skipped" value={count('skip')} color={colors.skip} />
        <Stat label="Forbidden" value={count('foul')} color={colors.foul} />
      </View>

      {results.length > 0 && (
        <View style={styles.list}>
          {results.map((r, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.listMark, { color: color[r.outcome] }]}>
                {label[r.outcome]}
              </Text>
              <Text style={styles.listWord}>{r.card.word}</Text>
            </View>
          ))}
        </View>
      )}

      <BigButton label="Play again" color={colors.primary} onPress={onPlayAgain} />
      <BigButton label="Back to games" color={colors.muted} onPress={() => router.dismissTo('/children')} />
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.stat, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: { fontSize: 28, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  score: { fontSize: 28, fontWeight: '800', color: colors.text },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  word: { fontSize: 48, fontWeight: '900', color: colors.primary, textAlign: 'center' },
  divider: { height: 3, width: '60%', backgroundColor: colors.background, marginVertical: 12 },
  dontSay: { fontSize: 16, fontWeight: '700', color: colors.foul, textTransform: 'uppercase' },
  forbidden: { fontSize: 24, fontWeight: '700', color: colors.text },
  actions: { gap: 12, paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  results: { padding: 16, gap: 16, alignItems: 'stretch' },
  resultsEmoji: { fontSize: 64, textAlign: 'center' },
  resultsTitle: { fontSize: 32, fontWeight: '900', color: colors.text, textAlign: 'center' },
  bigScore: { fontSize: 80, fontWeight: '900', color: colors.correct, textAlign: 'center' },
  bigScoreLabel: { fontSize: 18, color: colors.muted, textAlign: 'center', marginTop: -16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 3,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 32, fontWeight: '900' },
  statLabel: { fontSize: 15, color: colors.muted },
  list: { backgroundColor: colors.card, borderRadius: 20, padding: 16, gap: 8 },
  listRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  listMark: { fontSize: 20, fontWeight: '900', width: 24, textAlign: 'center' },
  listWord: { fontSize: 18, color: colors.text },
});
