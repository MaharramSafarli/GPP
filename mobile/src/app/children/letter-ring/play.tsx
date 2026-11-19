import { useKeepAwake } from '@/lib/keep-awake';
import { router } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AzKeyboard } from '@/components/az-keyboard';
import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { RoundButton } from '@/components/controls';
import { formatTime } from '@/components/game-top-bar';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import {
  EMPTY_STATS,
  POINTS,
  STATS_KEY,
  TOTAL_SECONDS,
  isCorrect,
  makeRing,
  nextSlot,
  type RingStats,
  type Slot,
  type Status,
} from '@/games/letter-ring/engine';
import { azUpper } from '@/lib/az';
import { useSettings } from '@/lib/settings';
import { playSound, sayVoice, stopSpeaking, vibrate } from '@/lib/sound';
import { loadJSON, saveJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

const ACCENT = '#E8743B';
const STATUS_COLOR: Record<Status, string> = {
  open: '#FFFFFF',
  passed: '#B9B2D6',
  correct: '#22C55E',
  wrong: '#FF4D6D',
};

/** The 32 letters on a circle, with the current letter big in the middle. */
const Ring = memo(function Ring({
  slots,
  current,
  size,
  flash,
}: {
  slots: Slot[];
  current: number;
  size: number;
  flash: Status | null;
}) {
  const n = slots.length;
  const dot = Math.min(38, ((Math.PI * size) / n) * 0.92);
  const r = (size - dot) / 2;
  const inner = size - dot * 2 - 24;
  const center = flash ? STATUS_COLOR[flash] : ACCENT;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.centerBall,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            left: (size - inner) / 2,
            top: (size - inner) / 2,
            backgroundColor: center,
          },
        ]}>
        <Text style={[styles.centerLetter, { fontSize: inner * 0.5, lineHeight: inner * 0.66 }]}>
          {slots[current]?.letter}
        </Text>
      </View>
      {slots.map((s, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const active = i === current;
        const d = active ? dot * 1.25 : dot;
        return (
          <View
            key={s.letter}
            style={[
              styles.dot,
              {
                width: d,
                height: d,
                borderRadius: d / 2,
                left: size / 2 + Math.cos(a) * r - d / 2,
                top: size / 2 + Math.sin(a) * r - d / 2,
                backgroundColor: active ? colors.text : STATUS_COLOR[s.status],
              },
            ]}>
            <Text
              style={[
                styles.dotText,
                { fontSize: d * 0.5, lineHeight: d * 0.7 },
                (active || s.status === 'correct' || s.status === 'wrong') && { color: '#fff' },
              ]}>
              {s.letter}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

export default function LetterRingPlay() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { settings, update } = useSettings();

  const [slots, setSlots] = useState<Slot[]>(() => makeRing());
  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState('');
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [feedback, setFeedback] = useState<{ status: Status; answer: string } | null>(null);
  const [askExit, setAskExit] = useState(false);
  const [finished, setFinished] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [ringBox, setRingBox] = useState({ w: 0, h: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slot = slots[current];
  const paused = askExit || finished;
  const correct = slots.filter((s) => s.status === 'correct').length;
  const wrongN = slots.filter((s) => s.status === 'wrong').length;
  const passed = slots.filter((s) => s.status === 'passed').length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    if (finished) return;
    if (seconds <= 0) finish(slots, 'time');
    else if (seconds <= 5) playSound('tick');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (finished) return false;
      setAskExit(true);
      return true;
    });
    return () => sub.remove();
  }, [finished]);

  useEffect(
    () => () => {
      stopSpeaking();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const finish = async (final: Slot[], why: 'time' | 'done') => {
    if (timer.current) clearTimeout(timer.current);
    setFeedback(null);
    setFinished(true);
    stopSpeaking();
    playSound(why === 'time' ? 'timeup-bell' : 'win');
    const score = final.filter((s) => s.status === 'correct').length * POINTS;
    const stats = await loadJSON<RingStats>(STATS_KEY, EMPTY_STATS);
    const best = score > stats.best;
    setNewBest(best);
    if (best && score > 0) setConfetti((c) => c + 1);
    saveJSON(STATS_KEY, { best: Math.max(stats.best, score), played: stats.played + 1 });
  };

  /** Marks the current letter and moves on after a short look at the result. */
  const resolve = (status: Status, given = '') => {
    if (feedback || paused) return;
    const next = slots.map((s, i) => (i === current ? { ...s, status, given } : s));
    setSlots(next);
    setTyped('');
    stopSpeaking();
    if (status === 'correct') {
      playSound('correct');
      vibrate('success');
    } else if (status === 'wrong') {
      playSound('wrong');
      vibrate('error');
    } else {
      playSound('skip');
      vibrate('light');
    }
    setFeedback({ status, answer: slot.clue.answer });
    timer.current = setTimeout(
      () => {
        setFeedback(null);
        const n = nextSlot(next, current);
        if (n < 0) finish(next, 'done');
        else setCurrent(n);
      },
      status === 'passed' ? 500 : 1400,
    );
  };

  const submit = () => {
    if (!typed) return;
    resolve(isCorrect(slot.clue, typed) ? 'correct' : 'wrong', typed);
  };

  const restart = () => {
    setSlots(makeRing());
    setCurrent(0);
    setTyped('');
    setSeconds(TOTAL_SECONDS);
    setFinished(false);
    setNewBest(false);
  };

  const leave = () => {
    stopSpeaking();
    router.dismissTo('/');
  };

  if (finished) {
    return (
      <Screen>
        <View style={{ marginTop: insets.top, gap: 14 }}>
          <View style={styles.finalCard}>
            <Text style={styles.finalIcon}>{newBest ? '🏆' : '🎉'}</Text>
            <Text style={styles.finalTitle}>{newBest ? 'Yeni rekord!' : 'Oyun bitdi!'}</Text>
            <Text style={styles.finalScore}>{correct * POINTS} xal</Text>
            <Text style={styles.finalSub}>
              ✅ {correct} düz · ❌ {wrongN} səhv · ⏭️ {slots.length - correct - wrongN} cavabsız
            </Text>
          </View>
          <View style={styles.list}>
            {slots.map((s, i) => (
              <View key={s.letter} style={[styles.listRow, i > 0 && styles.listBorder]}>
                <View style={[styles.listDot, { backgroundColor: s.status === 'open' ? STATUS_COLOR.passed : STATUS_COLOR[s.status] }]}>
                  <Text style={styles.listDotText}>{s.letter}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listAnswer}>{azUpper(s.clue.answer)}</Text>
                  {s.status === 'wrong' ? <Text style={styles.listGiven}>Sənin cavabın: {s.given}</Text> : null}
                </View>
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

  const ringSize = Math.max(0, Math.min(ringBox.w, ringBox.h));
  const hint = slot.clue.mode === 'contains' ? `İçində ${slot.letter} var` : `${slot.letter} ilə başlayır`;

  return (
    <Screen scroll={false}>
      <View style={[styles.top, { marginTop: insets.top }]}>
        <RoundButton icon="🏠" label="Ana səhifə" color="#FF7A59" onPress={() => setAskExit(true)} />
        <View style={[styles.timer, seconds <= 30 && styles.timerLow]}>
          <Text style={[styles.timerText, seconds <= 30 && styles.timerTextLow]}>⏱ {formatTime(Math.max(0, seconds))}</Text>
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
        <Text style={styles.pill}>✅ {correct}</Text>
        <Text style={styles.pill}>❌ {wrongN}</Text>
        <Text style={styles.pill}>⏭️ {passed}</Text>
        <Text style={styles.pill}>⭐ {correct * POINTS}</Text>
      </View>

      <View style={styles.clueCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{slot.letter}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.clueHint}>{hint}</Text>
          <Text style={styles.clue}>{slot.clue.clue}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sualı oxu"
          onPress={() => sayVoice(`lr:${slot.clue.letter}:${slot.clue.answer}`, slot.clue.clue)}
          style={({ pressed }) => [styles.speak, pressed && { transform: [{ scale: 0.92 }] }]}>
          <Text style={styles.speakIcon}>🔈</Text>
        </Pressable>
      </View>

      <View style={styles.ringBox} onLayout={(e) => setRingBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {ringSize > 120 ? <Ring slots={slots} current={current} size={ringSize} flash={feedback?.status ?? null} /> : null}
      </View>

      {feedback && feedback.status !== 'passed' ? (
        <View style={[styles.banner, feedback.status === 'correct' ? styles.bannerOk : styles.bannerBad]}>
          <Text style={styles.bannerText}>
            {feedback.status === 'correct' ? '✅ Düzdür!' : '❌ Səhv!'} Cavab: {azUpper(feedback.answer)}
          </Text>
        </View>
      ) : (
        <View style={styles.answer}>
          <Text style={[styles.answerText, !typed && styles.placeholder]} numberOfLines={1}>
            {typed || 'Cavabını yaz…'}
          </Text>
        </View>
      )}

      <AzKeyboard
        onKey={(l) => !feedback && setTyped((t) => (t.length < 16 ? t + l : t))}
        onErase={() => setTyped((t) => t.slice(0, -1))}
        color={ACCENT}
        disabled={!!feedback}
      />

      <View style={styles.actions}>
        <BigButton label="⏭️ Pas" color={colors.primary} onPress={() => resolve('passed')} flex disabled={!!feedback} />
        <BigButton label="✔️ Göndər" color={colors.correct} onPress={submit} flex disabled={!typed || !!feedback} />
      </View>

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
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  timerLow: { borderColor: colors.foul, backgroundColor: '#FFE3E8' },
  timerText: { fontSize: 22, fontFamily: fonts.display, color: colors.text, fontVariant: ['tabular-nums'] },
  timerTextLow: { color: colors.foul },
  pills: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: -8 },
  pill: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  clueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 12,
    borderWidth: 3,
    borderColor: ACCENT,
    marginTop: -4,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 24, fontFamily: fonts.display, color: '#fff', lineHeight: 32 },
  clueHint: { fontSize: 12, fontFamily: fonts.bold, color: ACCENT, letterSpacing: 0.5 },
  clue: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, lineHeight: 22 },
  speak: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FDE6D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakIcon: { fontSize: 20 },
  ringBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: -6 },
  centerBall: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  centerLetter: { fontFamily: fonts.display, color: '#fff' },
  dot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(45,42,110,0.15)',
  },
  dotText: { fontFamily: fonts.display, color: colors.text },
  answer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#F6C9B0',
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  answerText: { fontSize: 22, fontFamily: fonts.display, color: colors.text, letterSpacing: 2 },
  placeholder: { fontSize: 17, fontFamily: fonts.bold, color: colors.muted, letterSpacing: 0 },
  banner: { borderRadius: 18, height: 52, justifyContent: 'center', paddingHorizontal: 16 },
  bannerOk: { backgroundColor: '#C9F2D6' },
  bannerBad: { backgroundColor: '#FFD3DB' },
  bannerText: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  actions: { flexDirection: 'row', gap: 10 },
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
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  listBorder: { borderTopWidth: 1, borderTopColor: '#EEE9FB' },
  listDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  listDotText: { fontSize: 17, fontFamily: fonts.display, color: '#fff', lineHeight: 22 },
  listAnswer: { fontSize: 17, fontFamily: fonts.display, color: colors.text },
  listGiven: { fontSize: 13, fontFamily: fonts.body, color: colors.foul },
});
