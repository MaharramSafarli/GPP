import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Screen } from '@/components/screen';
import { CATEGORIES, EXPLAIN_IT_WORDS, type WordCard } from '@/data/explain-it-words';
import { shuffle } from '@/games/explain-it/shuffle';
import { colors, fonts } from '@/theme';

type Outcome = 'correct' | 'skip' | 'foul';
type Result = { card: WordCard; outcome: Outcome };

const categoryOf = (card: WordCard) => CATEGORIES.find((c) => c.id === card.category)!;

export default function ExplainItPlayScreen() {
  useKeepAwake();
  const params = useLocalSearchParams<{ seconds?: string; categories?: string }>();
  const roundSeconds = Number(params.seconds) || 60;
  const chosen = params.categories?.split(',') ?? CATEGORIES.map((c) => c.id);
  const pool = EXPLAIN_IT_WORDS.filter((w) => chosen.includes(w.category));

  const [deck, setDeck] = useState(() => shuffle(pool));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [endsAt, setEndsAt] = useState(() => Date.now() + roundSeconds * 1000);
  const [now, setNow] = useState(() => Date.now());

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const outOfWords = index >= deck.length;
  const finished = remaining === 0 || outOfWords;

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
    setDeck(shuffle(pool));
    setIndex(0);
    setResults([]);
    const start = Date.now();
    setNow(start);
    setEndsAt(start + roundSeconds * 1000);
  };

  if (finished) {
    return <ResultsView results={results} outOfWords={outOfWords} onPlayAgain={playAgain} />;
  }

  const card = deck[index];
  const category = categoryOf(card);
  const lowTime = remaining <= 10;
  const score = results.filter((r) => r.outcome === 'correct').length;

  return (
    <Screen scroll={false}>
      <View style={styles.topBar}>
        <View style={[styles.pill, lowTime && { backgroundColor: colors.foul }]}>
          <Text style={[styles.pillText, lowTime && { color: '#fff' }]}>⏱️ {remaining}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>⭐ {score}</Text>
        </View>
      </View>

      <View style={[styles.card, { borderColor: category.color }]}>
        <View style={[styles.tag, { backgroundColor: category.color }]}>
          <Text style={styles.tagText}>
            {category.emoji} {category.title}
          </Text>
        </View>
        <Text
          style={[styles.word, { color: category.color }]}
          adjustsFontSizeToFit
          numberOfLines={2}>
          {card.word}
        </Text>
        <View style={styles.forbiddenBox}>
          <Text style={styles.dontSay}>🚫 Demək olmaz</Text>
          {card.forbidden.map((w) => (
            <Text key={w} style={styles.forbidden}>
              {w}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <BigButton label="✓ Düzdür" color={colors.correct} onPress={() => answer('correct')} />
        <View style={styles.row}>
          <BigButton label="Keç →" color={colors.skip} onPress={() => answer('skip')} flex />
          <BigButton label="Qadağan ✗" color={colors.foul} onPress={() => answer('foul')} flex />
        </View>
      </View>
    </Screen>
  );
}

function ResultsView({
  results,
  outOfWords,
  onPlayAgain,
}: {
  results: Result[];
  outOfWords: boolean;
  onPlayAgain: () => void;
}) {
  const count = (o: Outcome) => results.filter((r) => r.outcome === o).length;
  const mark: Record<Outcome, string> = { correct: '✓', skip: '→', foul: '✗' };
  const color: Record<Outcome, string> = {
    correct: colors.correct,
    skip: colors.skip,
    foul: colors.foul,
  };

  return (
    <Screen>
      <Text style={styles.resultsEmoji}>🎉</Text>
      <Text style={styles.resultsTitle}>{outOfWords ? 'Sözlər bitdi!' : 'Vaxt bitdi!'}</Text>
      <View style={styles.scoreBubble}>
        <Text style={styles.bigScore}>{count('correct')}</Text>
        <Text style={styles.bigScoreLabel}>düzgün söz</Text>
      </View>

      <View style={styles.row}>
        <Stat label="Keçildi" value={count('skip')} color={colors.skip} />
        <Stat label="Qadağan" value={count('foul')} color={colors.foul} />
      </View>

      {results.length > 0 && (
        <View style={styles.list}>
          {results.map((r, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.listMark, { color: color[r.outcome] }]}>{mark[r.outcome]}</Text>
              <Text style={styles.listWord}>{r.card.word}</Text>
            </View>
          ))}
        </View>
      )}

      <BigButton label="Yenidən oyna 🔁" color={colors.primary} onPress={onPlayAgain} />
      <BigButton
        label="Oyunlara qayıt"
        color={colors.muted}
        onPress={() => router.dismissTo('/children')}
      />
    </Screen>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between' },
  pill: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 4,
    minWidth: 96,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 28,
    fontFamily: fonts.display,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 32,
    borderWidth: 5,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: '#2D2A6E',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  tag: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 },
  tagText: { fontSize: 15, fontFamily: fonts.bold, color: '#fff' },
  word: { fontSize: 50, fontFamily: fonts.display, textAlign: 'center', lineHeight: 62 },
  forbiddenBox: {
    alignSelf: 'stretch',
    backgroundColor: '#FFF0F3',
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  dontSay: { fontSize: 16, fontFamily: fonts.bold, color: colors.foul, marginBottom: 4 },
  forbidden: { fontSize: 22, fontFamily: fonts.heading, color: colors.text, lineHeight: 30 },
  actions: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  resultsEmoji: { fontSize: 64, textAlign: 'center' },
  resultsTitle: {
    fontSize: 38,
    fontFamily: fonts.display,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 48,
  },
  scoreBubble: {
    alignSelf: 'center',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.card,
    borderWidth: 6,
    borderColor: colors.correct,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigScore: { fontSize: 72, fontFamily: fonts.display, color: colors.correct, lineHeight: 84 },
  bigScoreLabel: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted, marginTop: -10 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 4,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 32, fontFamily: fonts.display, lineHeight: 40 },
  statLabel: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted },
  list: { backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 6 },
  listRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  listMark: { fontSize: 20, fontFamily: fonts.display, width: 24, textAlign: 'center' },
  listWord: { fontSize: 18, fontFamily: fonts.body, color: colors.text },
});
