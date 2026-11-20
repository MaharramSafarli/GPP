import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { RoundButton } from '@/components/controls';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import {
  EMPTY_STATS,
  STATS_KEY,
  STEPS,
  TRIALS,
  makePattern,
  nextStep,
  showMs,
  type TileStats,
} from '@/games/tile-memory/engine';
import { useKeepAwake } from '@/lib/keep-awake';
import { playSound, vibrate } from '@/lib/sound';
import { loadJSON, saveJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

type Phase = 'ready' | 'count' | 'show' | 'input' | 'feedback' | 'done';
const LIT = '#2EC4B6';
const OFF = '#8D6E63';

export default function TileMemory() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('ready');
  const [trial, setTrial] = useState(0);
  const [step, setStep] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [picks, setPicks] = useState<Record<number, 'ok' | 'bad'>>({});
  const [score, setScore] = useState(0);
  const [bestTiles, setBestTiles] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [askExit, setAskExit] = useState(false);
  const [record, setRecord] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [rows, cols, tiles] = STEPS[step];
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'ready' || phase === 'done') return false;
      setAskExit(true);
      return true;
    });
    return () => sub.remove();
  }, [phase]);

  const startTrial = (s: number) => {
    const [r, c, t] = STEPS[s];
    setStep(s);
    setPattern(makePattern(r, c, t));
    setPicks({});
    setPhase('count');
    later(900, () => {
      setPhase('show');
      playSound('flip');
      later(showMs(t), () => setPhase('input'));
    });
  };

  const finishTrial = (perfect: boolean, nextPicks: Record<number, 'ok' | 'bad'>) => {
    setPhase('feedback');
    const okCount = Object.values(nextPicks).filter((v) => v === 'ok').length;
    const gained = okCount * 10 * (step + 1) + (perfect ? 50 * (step + 1) : 0);
    setScore((x) => x + gained);
    if (perfect) {
      setBestTiles((b) => Math.max(b, tiles));
      setPerfectCount((n) => n + 1);
      playSound('match');
      vibrate('success');
    } else {
      playSound('wrong');
      vibrate('error');
    }
    later(1100, async () => {
      if (trial + 1 >= TRIALS) {
        setPhase('done');
        playSound('win');
        const finalScore = score + gained;
        const finalBest = Math.max(bestTiles, perfect ? tiles : 0);
        const stats = await loadJSON<TileStats>(STATS_KEY, EMPTY_STATS);
        const isRecord = finalScore > stats.best;
        setRecord(isRecord);
        if (isRecord) setConfetti((c) => c + 1);
        saveJSON(STATS_KEY, { best: Math.max(stats.best, finalScore), bestTiles: Math.max(stats.bestTiles, finalBest) });
      } else {
        setTrial(trial + 1);
        startTrial(nextStep(step, perfect));
      }
    });
  };

  const tap = (cell: number) => {
    if (phase !== 'input' || picks[cell]) return;
    const ok = pattern.includes(cell);
    const next = { ...picks, [cell]: ok ? ('ok' as const) : ('bad' as const) };
    setPicks(next);
    if (ok) playSound('tap');
    else vibrate('light');
    const okCount = Object.values(next).filter((v) => v === 'ok').length;
    const used = Object.keys(next).length;
    if (okCount === pattern.length) finishTrial(used === pattern.length, next);
    else if (used >= pattern.length) finishTrial(false, next);
  };

  const restart = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTrial(0);
    setScore(0);
    setBestTiles(0);
    setPerfectCount(0);
    setRecord(false);
    startTrial(0);
  };

  const cell = Math.floor(
    Math.min(72, (Math.min(width, 520) - 32 - 24 - (cols - 1) * 6) / cols, (height - insets.top - insets.bottom - 260) / rows),
  );
  const leftTaps = pattern.length - Object.keys(picks).length;
  const okCount = Object.values(picks).filter((v) => v === 'ok').length;

  let hint = '';
  if (phase === 'show') hint = 'Yadda saxla! 👀';
  else if (phase === 'input') hint = `Yanan xanalara toxun. Daha ${leftTaps} xana aça bilərsən.`;
  else if (phase === 'feedback') hint = okCount === pattern.length && leftTaps === 0 ? 'Əla! Növbəti dəfə daha çətin 🚀' : 'Səhv oldu — növbəti dəfə bir az asan olacaq';

  return (
    <Screen scroll={false}>
      <View style={[styles.top, { marginTop: insets.top }]}>
        <RoundButton
          icon="🏠"
          label="Ana səhifə"
          color="#FF7A59"
          onPress={() => (phase === 'ready' || phase === 'done' ? router.dismissTo('/') : setAskExit(true))}
        />
        <View style={styles.pills}>
          <Text style={styles.pill}>
            Raund {Math.min(trial + 1, TRIALS)}/{TRIALS}
          </Text>
          <Text style={styles.pill}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.center}>
        {phase === 'count' ? (
          <View style={styles.countBubble}>
            <Text style={styles.countLabel}>XANA</Text>
            <Text style={styles.countNum}>{tiles}</Text>
          </View>
        ) : (
          <View style={[styles.board, { gap: 6 }]}>
            {Array.from({ length: rows }, (_, r) => (
              <View key={r} style={{ flexDirection: 'row', gap: 6 }}>
                {Array.from({ length: cols }, (_, c) => {
                  const i = r * cols + c;
                  const pick = picks[i];
                  const lit = phase === 'show' || (phase === 'feedback' && pattern.includes(i));
                  const bg = pick === 'bad' ? '#FF7A1A' : pick === 'ok' || lit ? LIT : OFF;
                  return (
                    <Pressable
                      key={c}
                      accessibilityLabel={`Xana ${i + 1}`}
                      onPress={() => tap(i)}
                      style={[styles.tile, { width: cell, height: cell, backgroundColor: phase === 'show' && !pattern.includes(i) ? OFF : bg }]}>
                      {phase === 'show' && pattern.includes(i) ? null : pick ? (
                        <Text style={[styles.mark, { fontSize: cell * 0.45 }]}>{pick === 'ok' ? '✓' : '✗'}</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}
        <Text style={styles.hint}>{hint}</Text>
      </View>

      <ModalCard visible={phase === 'ready'} icon="🧠" title="Xanaları xatırla">
        <Text style={styles.text}>
          Bir neçə xana bir anlıq yanacaq. Yadda saxla və sonra eyni xanalara toxun!
        </Text>
        <Text style={styles.text}>
          ✅ Hamısını düz tapsan, növbəti dəfə xanalar çoxalır.{'\n'}❌ Səhv etsən, bir az asanlaşır.{'\n'}🎯 {TRIALS} raund var.
        </Text>
        <BigButton label="▶️ Başla" color={colors.correct} onPress={() => startTrial(0)} />
      </ModalCard>

      <ModalCard visible={askExit} icon="🚪" title="Oyundan çıxırsan?" onRequestClose={() => setAskExit(false)}>
        <BigButton label="Xeyr, davam et" color={colors.correct} onPress={() => setAskExit(false)} />
        <BigButton label="Bəli, çıx" color={colors.foul} onPress={() => router.dismissTo('/')} />
      </ModalCard>

      <ModalCard visible={phase === 'done'} icon={record ? '🏆' : '🧠'} title={record ? 'Yeni rekord!' : 'Afərin!'}>
        <Text style={styles.resultScore}>{score} xal</Text>
        <Text style={styles.text}>
          🧩 Ən çox: {bestTiles} xana{'\n'}✅ Səhvsiz raund: {perfectCount} / {TRIALS}
        </Text>
        <BigButton label="🔁 Yenə oyna" color={colors.correct} onPress={restart} />
        <BigButton label="🏠 Oyunlara qayıt" color="#FF7A59" onPress={() => router.dismissTo('/')} />
      </ModalCard>
      <Confetti burst={confetti} count={90} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pills: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  board: { backgroundColor: '#4E342E', padding: 12, borderRadius: 18 },
  tile: { borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  mark: { color: '#fff', fontFamily: fonts.display },
  countBubble: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#D7CCC8',
  },
  countLabel: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted, letterSpacing: 2 },
  countNum: { fontSize: 64, fontFamily: fonts.display, color: colors.text, lineHeight: 76 },
  hint: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, textAlign: 'center', minHeight: 44, paddingHorizontal: 12 },
  text: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, textAlign: 'center', lineHeight: 23 },
  resultScore: { fontSize: 40, fontFamily: fonts.display, color: colors.primary, textAlign: 'center', lineHeight: 50 },
});
