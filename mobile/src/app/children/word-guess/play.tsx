import { useKeepAwake } from '@/lib/keep-awake';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AzKeyboard } from '@/components/az-keyboard';
import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { RoundButton } from '@/components/controls';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import {
  EMPTY_STATS,
  SECONDS_PER_WORD,
  STATS_KEY,
  hintPosition,
  penaltyFor,
  pickQuestions,
  prizeFor,
  type Outcome,
  type Question,
  type RoundResult,
  type WordGuessStats,
} from '@/games/word-guess/engine';
import { azUpper } from '@/lib/az';
import { useSettings } from '@/lib/settings';
import { playSound, speak, stopSpeaking, vibrate } from '@/lib/sound';
import { loadJSON, saveJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

const ACCENT = '#0FA3B1';

export default function WordGuessPlay() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { settings, update } = useSettings();

  const [questions, setQuestions] = useState<Question[]>(() => pickQuestions());
  const [index, setIndex] = useState(0);
  const [entries, setEntries] = useState<string[]>(() => questions[0].letters.map(() => ''));
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [seconds, setSeconds] = useState(SECONDS_PER_WORD);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [shown, setShown] = useState<RoundResult | null>(null);
  const [askExit, setAskExit] = useState(false);
  const [finished, setFinished] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const shake = useRef(new Animated.Value(0)).current;

  const q = questions[index];
  const paused = !!shown || askExit || finished;

  // Timer
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [paused, index]);

  useEffect(() => {
    if (paused) return;
    if (seconds <= 0) finishRound('timeout');
    else if (seconds <= 5) playSound('tick');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  // Android back button asks before leaving.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (finished) return false;
      setAskExit(true);
      return true;
    });
    return () => sub.remove();
  }, [finished]);

  useEffect(() => () => stopSpeaking(), []);

  const finishRound = (outcome: Outcome, finalEntries = entries, hints = revealed.size) => {
    const points = outcome === 'correct' ? prizeFor(q.letters.length, hints) : -penaltyFor(hints);
    const r: RoundResult = { word: q.word, len: q.letters.length, outcome, points, hints };
    setEntries(outcome === 'correct' ? finalEntries : q.letters);
    setScore((s) => s + points);
    setResults((list) => [...list, r]);
    setShown(r);
    stopSpeaking();
    if (outcome === 'correct') {
      playSound('correct');
      vibrate('success');
    } else {
      playSound(outcome === 'timeout' ? 'timeup-bell' : 'skip');
      vibrate('medium');
    }
  };

  const wrong = (rev = revealed) => {
    playSound('wrong');
    vibrate('error');
    Animated.sequence(
      [12, -12, 8, -8, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 60, useNativeDriver: true })),
    ).start(() => setEntries(q.letters.map((l, i) => (rev.has(i) ? l : ''))));
  };

  const type = (letter: string) => {
    if (paused) return;
    const i = entries.findIndex((e, k) => !e && !revealed.has(k));
    if (i < 0) return;
    const next = [...entries];
    next[i] = letter;
    setEntries(next);
    playSound('tap');
    if (next.every(Boolean)) {
      if (next.join('') === q.letters.join('')) finishRound('correct', next);
      else wrong();
    }
  };

  const erase = () => {
    if (paused) return;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i] && !revealed.has(i)) {
        const next = [...entries];
        next[i] = '';
        setEntries(next);
        return;
      }
    }
  };

  const hint = () => {
    if (paused) return;
    const pos = hintPosition(q.letters.length, revealed);
    if (pos < 0) return;
    playSound('flip');
    vibrate('light');
    const nextRevealed = new Set(revealed).add(pos);
    setRevealed(nextRevealed);
    const next = [...entries];
    // The revealed letter takes its box; a letter typed there moves back to the keyboard.
    next[pos] = q.letters[pos];
    setEntries(next);
    if (next.every(Boolean)) {
      if (next.join('') === q.letters.join('')) finishRound('correct', next, nextRevealed.size);
      else wrong(nextRevealed);
    }
  };

  const nextQuestion = async () => {
    setShown(null);
    if (index + 1 >= questions.length) {
      setFinished(true);
      const stats = await loadJSON<WordGuessStats>(STATS_KEY, EMPTY_STATS);
      const best = score > stats.best;
      setNewBest(best);
      if (best) setConfetti((c) => c + 1);
      playSound('win');
      saveJSON(STATS_KEY, {
        best: Math.max(stats.best, score),
        played: stats.played + 1,
        correct: stats.correct + results.filter((r) => r.outcome === 'correct').length,
        answered: stats.answered + results.length,
      });
      return;
    }
    const n = questions[index + 1];
    setIndex(index + 1);
    setEntries(n.letters.map(() => ''));
    setRevealed(new Set());
    setSeconds(SECONDS_PER_WORD);
  };

  const restart = () => {
    const qs = pickQuestions();
    setQuestions(qs);
    setIndex(0);
    setEntries(qs[0].letters.map(() => ''));
    setRevealed(new Set());
    setSeconds(SECONDS_PER_WORD);
    setScore(0);
    setResults([]);
    setFinished(false);
    setNewBest(false);
  };

  const leave = () => {
    stopSpeaking();
    router.dismissTo('/');
  };

  const prize = prizeFor(q.letters.length, revealed.size);
  const n = q.letters.length;
  const box = Math.min(54, Math.floor((Math.min(width, 520) - 32 - (n - 1) * 5) / n));
  const canHint = revealed.size < q.letters.length - 1;

  if (finished) {
    const correct = results.filter((r) => r.outcome === 'correct').length;
    return (
      <Screen>
        <View style={{ marginTop: insets.top, gap: 14 }}>
          <View style={styles.finalCard}>
            <Text style={styles.finalIcon}>{newBest ? '🏆' : '🎉'}</Text>
            <Text style={styles.finalTitle}>{newBest ? 'Yeni rekord!' : 'Oyun bitdi!'}</Text>
            <Text style={styles.finalScore}>{score} xal</Text>
            <Text style={styles.finalSub}>
              {correct} / {results.length} söz tapıldı · {results.reduce((n, r) => n + r.hints, 0)} hərf alındı
            </Text>
          </View>
          <View style={styles.list}>
            {results.map((r, i) => (
              <View key={i} style={[styles.listRow, i > 0 && styles.listBorder]}>
                <Text style={styles.listIcon}>{r.outcome === 'correct' ? '✅' : r.outcome === 'pass' ? '⏭️' : '⏰'}</Text>
                <Text style={styles.listWord}>
                  {azUpper(r.word)} <Text style={styles.listLen}>· {r.len} hərf</Text>
                </Text>
                <Text style={[styles.listPts, { color: r.points > 0 ? '#1F8A4C' : r.points < 0 ? colors.foul : colors.muted }]}>
                  {r.points > 0 ? `+${r.points}` : r.points}
                </Text>
              </View>
            ))}
          </View>
          <BigButton label="🔁 Yenə oyna" color={colors.correct} onPress={restart} />
          <BigButton label="🏠 Oyunlara qayıt" color="#FF7A59" onPress={leave} />
        </View>
        <Confetti burst={confetti} count={90} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={[styles.top, { marginTop: insets.top }]}>
        <RoundButton icon="🏠" label="Ana səhifə" color="#FF7A59" onPress={() => setAskExit(true)} />
        <View style={[styles.timer, seconds <= 10 && styles.timerLow]}>
          <Text style={[styles.timerText, seconds <= 10 && styles.timerTextLow]}>⏱ {Math.max(0, seconds)}</Text>
        </View>
        <RoundButton
          icon={settings.sfx ? '🔊' : '🔇'}
          label={settings.sfx ? 'Səsi bağla' : 'Səsi aç'}
          color={colors.skip}
          onPress={() => {
            update({ sfx: !settings.sfx });
            if (settings.sfx) stopSpeaking();
          }}
        />
      </View>

      <View style={styles.pills}>
        <Text style={styles.pill}>
          Sual {index + 1}/{questions.length} · {q.letters.length} hərf
        </Text>
        <Text style={styles.pill}>⭐ {score}</Text>
      </View>

      <View style={styles.clueCard}>
        <Text style={styles.clue}>{q.clue}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sualı oxu"
          onPress={() => speak(q.clue)}
          style={({ pressed }) => [styles.speak, pressed && { transform: [{ scale: 0.92 }] }]}>
          <Text style={styles.speakIcon}>🔈</Text>
        </Pressable>
      </View>

      <View style={styles.middle}>
        <Animated.View style={[styles.boxes, { transform: [{ translateX: shake }] }]}>
          {q.letters.map((_, i) => (
            <View
              key={i}
              style={[
                styles.box,
                { width: box, height: box * 1.15 },
                revealed.has(i) && styles.boxRevealed,
                !!entries[i] && !revealed.has(i) && styles.boxFilled,
              ]}>
              <Text style={[styles.boxText, { fontSize: box * 0.55, lineHeight: box * 0.8 }]}>{entries[i]}</Text>
            </View>
          ))}
        </Animated.View>
        <Text style={styles.prize}>
          Bu sualdan: <Text style={styles.prizeNum}>+{prize}</Text>
        </Text>
      </View>

      <AzKeyboard onKey={type} onErase={erase} color={ACCENT} disabled={paused} />

      <View style={styles.actions}>
        <BigButton label="⏭️ Pas" color={colors.primary} onPress={() => !paused && finishRound('pass')} flex />
        <BigButton label="💡 Hərf al −100" color={colors.skip} onPress={hint} disabled={!canHint} flex />
      </View>

      <ModalCard
        visible={!!shown}
        icon={shown?.outcome === 'correct' ? '✅' : shown?.outcome === 'pass' ? '⏭️' : '⏰'}
        title={shown?.outcome === 'correct' ? 'Düzdür!' : shown?.outcome === 'pass' ? 'Pas keçdin' : 'Vaxt bitdi!'}
        onRequestClose={nextQuestion}>
        {shown ? (
          <>
            <Text style={styles.answerLabel}>CAVAB</Text>
            <View style={styles.answer}>
              {q.letters.map((l, i) => (
                <View key={i} style={[styles.answerBox, shown.outcome !== 'correct' && styles.answerBoxMissed]}>
                  <Text style={styles.answerText}>{l}</Text>
                </View>
              ))}
            </View>
            <Text
              style={[
                styles.points,
                { color: shown.points > 0 ? '#1F8A4C' : shown.points < 0 ? colors.foul : colors.muted },
              ]}>
              {shown.points > 0 ? `+${shown.points} xal` : shown.points < 0 ? `${shown.points} xal` : 'Xal itmədi'}
            </Text>
            <BigButton
              label={index + 1 >= questions.length ? '🏁 Nəticələr' : '➡️ Davam et'}
              color={colors.correct}
              onPress={nextQuestion}
            />
          </>
        ) : null}
      </ModalCard>

      <ModalCard visible={askExit} icon="🚪" title="Oyundan çıxırsan?" onRequestClose={() => setAskExit(false)}>
        <Text style={styles.ask}>Bu oyundakı xalların itəcək.</Text>
        <BigButton label="Xeyr, davam et" color={colors.correct} onPress={() => setAskExit(false)} />
        <BigButton label="Bəli, çıx" color={colors.foul} onPress={leave} />
      </ModalCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.text,
    paddingHorizontal: 18,
    paddingVertical: 2,
  },
  timerLow: { borderColor: colors.foul, backgroundColor: '#FFE3E8' },
  timerText: { fontSize: 22, fontFamily: fonts.display, color: colors.text, fontVariant: ['tabular-nums'] },
  timerTextLow: { color: colors.foul },
  pills: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: -6 },
  pill: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  clueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 3,
    borderColor: ACCENT,
  },
  clue: { flex: 1, fontSize: 19, fontFamily: fonts.bold, color: colors.text, lineHeight: 26 },
  speak: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#D7F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakIcon: { fontSize: 22 },
  middle: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  boxes: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  box: {
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#BDE9EC',
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: ACCENT },
  boxRevealed: { backgroundColor: '#FFE9A8', borderColor: '#F2C230' },
  boxText: { fontFamily: fonts.display, color: colors.text },
  prize: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted },
  prizeNum: { fontSize: 22, fontFamily: fonts.display, color: '#1F8A4C' },
  actions: { flexDirection: 'row', gap: 10 },
  answerLabel: { fontSize: 13, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center', letterSpacing: 2 },
  answer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5 },
  answerBox: {
    width: 32,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.correct,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBoxMissed: { backgroundColor: colors.primary },
  answerText: { fontSize: 20, fontFamily: fonts.display, color: '#fff', lineHeight: 26 },
  points: { fontSize: 26, fontFamily: fonts.display, textAlign: 'center' },
  ask: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  finalCard: {
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 18,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: ACCENT,
  },
  finalIcon: { fontSize: 52 },
  finalTitle: { fontSize: 28, fontFamily: fonts.display, color: colors.text, lineHeight: 36 },
  finalScore: { fontSize: 40, fontFamily: fonts.display, color: ACCENT, lineHeight: 50 },
  finalSub: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
  list: { backgroundColor: colors.card, borderRadius: 22, paddingHorizontal: 14 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  listBorder: { borderTopWidth: 1, borderTopColor: '#EEE9FB' },
  listIcon: { fontSize: 20 },
  listWord: { flex: 1, fontSize: 17, fontFamily: fonts.display, color: colors.text },
  listLen: { fontSize: 13, fontFamily: fonts.body, color: colors.muted },
  listPts: { fontSize: 17, fontFamily: fonts.display },
});
