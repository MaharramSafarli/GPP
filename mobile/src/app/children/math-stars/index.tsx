import { router } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { RoundButton } from '@/components/controls';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import {
  CORRECT_PER_LEVEL,
  EMPTY_STATS,
  LIVES,
  STATS_KEY,
  levelRules,
  makeProblem,
  pointsFor,
  type MathStats,
  type Problem,
} from '@/games/math-stars/engine';
import { useKeepAwake } from '@/lib/keep-awake';
import { playSound, vibrate } from '@/lib/sound';
import { loadJSON, saveJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

const STAR = 78;
const TICK_MS = 50;
const GOLDEN_EVERY = 12;

type Star = Problem & { id: number; x: number; born: number; fall: number; golden: boolean };
type Pop = { id: number; x: number; y: number; text: string; born: number };

type Game = {
  stars: Star[];
  pops: Pop[];
  now: number;
  nextSpawn: number;
  spawned: number;
  level: number;
  correct: number;
  score: number;
  lives: number;
  over: boolean;
  levelUpAt: number;
};

const newGame = (): Game => ({
  stars: [],
  pops: [],
  now: 0,
  nextSpawn: 600,
  spawned: 0,
  level: 1,
  correct: 0,
  score: 0,
  lives: LIVES,
  over: false,
  levelUpAt: -9999,
});

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '✓'];

const Keypad = memo(function Keypad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <View style={styles.keypad}>
      {KEYS.map((k) => (
        <Pressable
          key={k}
          accessibilityRole="button"
          accessibilityLabel={k === '⌫' ? 'Sil' : k === '✓' ? 'Yoxla' : k}
          onPress={() => onKey(k)}
          style={({ pressed }) => [
            styles.key,
            k === '✓' && styles.keyOk,
            k === '⌫' && styles.keyErase,
            pressed && styles.keyPressed,
          ]}>
          <Text style={styles.keyText}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
});

export default function MathStars() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const game = useRef<Game>(newGame());
  const [, setFrame] = useState(0);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [askExit, setAskExit] = useState(false);
  const [result, setResult] = useState<{ score: number; level: number; best: boolean } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [sky, setSky] = useState({ w: 0, h: 0 });
  const shake = useRef(new Animated.Value(0)).current;
  const idRef = useRef(1);
  const skyRef = useRef(sky);
  skyRef.current = sky;

  const running = started && !askExit && !result;

  const endGame = async () => {
    const g = game.current;
    g.over = true;
    playSound('timeup-horn');
    vibrate('error');
    const stats = await loadJSON<MathStats>(STATS_KEY, EMPTY_STATS);
    const best = g.score > stats.best;
    if (best && g.score > 0) setConfetti((c) => c + 1);
    saveJSON(STATS_KEY, { best: Math.max(stats.best, g.score), bestLevel: Math.max(stats.bestLevel, g.level) });
    setResult({ score: g.score, level: g.level, best });
  };

  // Game clock: spawn stars, move them, and lose a life when one reaches the sea.
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const g = game.current;
      if (g.over) return;
      g.now += TICK_MS;
      const rules = levelRules(g.level);
      if (g.now >= g.nextSpawn) {
        g.spawned += 1;
        const golden = g.spawned % GOLDEN_EVERY === 0;
        g.stars.push({
          ...makeProblem(g.level),
          id: idRef.current++,
          x: 0.08 + Math.random() * 0.84,
          born: g.now,
          fall: rules.fallSeconds * 1000,
          golden,
        });
        g.nextSpawn = g.now + rules.spawnSeconds * 1000 * (0.8 + Math.random() * 0.4);
      }
      const landed = g.stars.filter((s) => g.now - s.born >= s.fall);
      if (landed.length) {
        g.stars = g.stars.filter((s) => !landed.includes(s));
        g.lives = Math.max(0, g.lives - landed.length);
        playSound('wrong');
        vibrate('medium');
        if (g.lives === 0) endGame();
      }
      g.pops = g.pops.filter((p) => g.now - p.born < 700);
      setFrame((f) => f + 1);
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result || !started) return false;
      setAskExit(true);
      return true;
    });
    return () => sub.remove();
  }, [result, started]);

  const yOf = (s: Star) => ((game.current.now - s.born) / s.fall) * Math.max(0, skyRef.current.h - STAR);

  const submit = (value: string) => {
    const g = game.current;
    const n = Number(value);
    const hits = g.stars.filter((s) => s.answer === n);
    if (!value || !hits.length) {
      playSound('wrong');
      vibrate('light');
      Animated.sequence(
        [10, -10, 6, -6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true })),
      ).start();
      return;
    }
    // The star closest to the sea goes first.
    const target = hits.reduce((a, b) => (a.born < b.born ? a : b));
    const cleared = target.golden ? [...g.stars] : [target];
    let gained = 0;
    for (const s of cleared) {
      const pts = pointsFor(g.level, s.golden);
      gained += pts;
      g.pops.push({ id: s.id, x: s.x, y: yOf(s), text: `+${pts}`, born: g.now });
    }
    g.stars = g.stars.filter((s) => !cleared.includes(s));
    g.score += gained;
    g.correct += 1;
    playSound(target.golden ? 'win' : 'correct');
    vibrate(target.golden ? 'success' : 'light');
    if (g.correct % CORRECT_PER_LEVEL === 0) {
      g.level += 1;
      g.levelUpAt = g.now;
      playSound('match');
    }
    setFrame((f) => f + 1);
  };

  const inputRef = useRef('');
  inputRef.current = input;
  const onKey = (k: string) => {
    if (!running) return;
    const v = inputRef.current;
    let next = v;
    if (k === '⌫') next = v.slice(0, -1);
    else if (k === '✓') {
      submit(v);
      next = '';
    } else {
      next = v.length < 3 ? v + k : v;
      // Answer right away when it matches a star — no need to press ✓.
      if (game.current.stars.some((s) => String(s.answer) === next)) {
        submit(next);
        next = '';
      }
    }
    inputRef.current = next;
    setInput(next);
  };

  const restart = () => {
    game.current = newGame();
    setInput('');
    setResult(null);
    setStarted(true);
  };

  const g = game.current;
  const showLevelUp = g.now - g.levelUpAt < 1400;

  return (
    <Screen scroll={false}>
      <View style={[styles.top, { marginTop: insets.top }]}>
        <RoundButton icon="🏠" label="Ana səhifə" color="#FF7A59" onPress={() => (started && !result ? setAskExit(true) : router.dismissTo('/'))} />
        <View style={styles.pills}>
          <Text style={styles.pill}>🎯 {g.level}</Text>
          <Text style={styles.pill}>⭐ {g.score}</Text>
          <Text style={styles.pill}>{'❤️'.repeat(g.lives)}{'🤍'.repeat(LIVES - g.lives)}</Text>
        </View>
      </View>

      <View style={styles.sky} onLayout={(e) => setSky({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {sky.w > 0 &&
          g.stars.map((s) => (
            <View
              key={s.id}
              style={[
                styles.star,
                s.golden && styles.starGolden,
                { left: s.x * (sky.w - STAR), top: yOf(s) },
              ]}>
              <Text style={styles.starIcon}>{s.golden ? '🌟' : '⭐'}</Text>
              <Text style={styles.starText} numberOfLines={1} adjustsFontSizeToFit>
                {s.a} {s.op} {s.b}
              </Text>
            </View>
          ))}
        {g.pops.map((p) => (
          <Text
            key={`pop-${p.id}`}
            style={[
              styles.pop,
              { left: p.x * (sky.w - STAR) + 10, top: p.y - ((g.now - p.born) / 700) * 40, opacity: 1 - (g.now - p.born) / 700 },
            ]}>
            {p.text}
          </Text>
        ))}
        {showLevelUp ? (
          <View style={styles.levelUp}>
            <Text style={styles.levelUpText}>🚀 Səviyyə {g.level}!</Text>
          </View>
        ) : null}
        <View style={styles.sea}>
          <Text style={styles.seaText}>🌊🌊🌊🌊🌊🌊🌊</Text>
        </View>
      </View>

      <Animated.View style={[styles.input, { transform: [{ translateX: shake }] }]}>
        <Text style={[styles.inputText, !input && styles.placeholder]}>{input || 'Cavabı yaz…'}</Text>
      </Animated.View>
      <Keypad onKey={onKey} />

      <ModalCard visible={!started} icon="⭐" title="Hesab ulduzları">
        <Text style={styles.intro}>
          Ulduzlar üstündəki misallarla dənizə doğru düşür. Cavabı yaz və ulduzu dənizə çatmamış tut!
        </Text>
        <Text style={styles.intro}>
          🌟 Qızıl ulduz ekrandakı bütün ulduzları birdən tutur.{'\n'}❤️ 3 canın var.{'\n'}🚀 Hər 5 düz cavabda səviyyə artır: ulduzlar sürətlənir, misallar çətinləşir.
        </Text>
        <BigButton label="▶️ Başla" color={colors.correct} onPress={() => setStarted(true)} />
      </ModalCard>

      <ModalCard visible={askExit} icon="🚪" title="Oyundan çıxırsan?" onRequestClose={() => setAskExit(false)}>
        <BigButton label="Xeyr, davam et" color={colors.correct} onPress={() => setAskExit(false)} />
        <BigButton label="Bəli, çıx" color={colors.foul} onPress={() => router.dismissTo('/')} />
      </ModalCard>

      <ModalCard visible={!!result} icon={result?.best ? '🏆' : '🌊'} title={result?.best ? 'Yeni rekord!' : 'Oyun bitdi!'}>
        <Text style={styles.resultScore}>{result?.score} xal</Text>
        <Text style={styles.intro}>🎯 Çatdığın səviyyə: {result?.level}</Text>
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  sky: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 58, 138, 0.85)',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  star: {
    position: 'absolute',
    width: STAR,
    height: STAR,
    borderRadius: STAR / 2,
    backgroundColor: '#FFD93D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF4B8',
    paddingHorizontal: 6,
  },
  starGolden: { backgroundColor: '#FF9F1C', borderColor: '#FFE08A' },
  starIcon: { position: 'absolute', top: -12, fontSize: 20 },
  starText: { fontSize: 19, fontFamily: fonts.display, color: '#2D2A6E' },
  pop: { position: 'absolute', fontSize: 22, fontFamily: fonts.display, color: '#B9F6CA' },
  levelUp: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  levelUpText: { fontSize: 22, fontFamily: fonts.display, color: colors.primary },
  sea: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 26, backgroundColor: '#2EC4B6', alignItems: 'center' },
  seaText: { fontSize: 16, marginTop: -8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#BDE0FE',
  },
  inputText: { fontSize: 28, fontFamily: fonts.display, color: colors.text, lineHeight: 36 },
  placeholder: { fontSize: 17, fontFamily: fonts.bold, color: colors.muted },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-between' },
  key: {
    width: '32%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#3A86FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  keyOk: { backgroundColor: colors.correct },
  keyErase: { backgroundColor: colors.foul },
  keyPressed: { transform: [{ scale: 0.95 }], borderBottomWidth: 1 },
  keyText: { fontSize: 24, fontFamily: fonts.display, color: '#fff', lineHeight: 32 },
  intro: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, textAlign: 'center', lineHeight: 23 },
  resultScore: { fontSize: 40, fontFamily: fonts.display, color: colors.primary, textAlign: 'center', lineHeight: 50 },
});
