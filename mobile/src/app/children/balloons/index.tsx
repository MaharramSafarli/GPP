import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { memo, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { GameTopBar } from '@/components/game-top-bar';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import {
  BALLOON_COLORS,
  COLS,
  ROWS,
  ROW_H,
  type Board,
  cellCenter,
  cloneBoard,
  colorsLeft,
  count,
  dropFloating,
  group,
  levelConfig,
  lost,
  makeBoard,
  pushRow,
  snapCell,
  trace,
} from '@/games/balloons/engine';
import { loadJSON, saveJSON } from '@/lib/storage';
import { playSound, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

const DEADLINE = 1 + (ROWS - 1) * ROW_H; // bottom edge of the last row, in balloon units
const LAUNCH = { x: COLS / 2, y: DEADLINE + 1.15 };
const NEXT = { x: COLS / 2 - 2.2, y: DEADLINE + 1.35 };
const BOARD_H = DEADLINE + 2.2;
const SPEED = 0.42; // units per frame

const pickColor = (b: Board, n: number) => {
  const left = colorsLeft(b);
  return left.length ? left[Math.floor(Math.random() * left.length)] : Math.floor(Math.random() * n);
};

const Balloon = memo(function Balloon({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const d = size * 0.94;
  return (
    <View style={[styles.balloonWrap, { left: x - d / 2, top: y - d / 2, width: d, height: d }]}>
      <View style={[styles.knot, { borderTopColor: color, bottom: -d * 0.1, borderLeftWidth: d * 0.09, borderRightWidth: d * 0.09, borderTopWidth: d * 0.14 }]} />
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: color }}>
        <View
          style={{
            position: 'absolute',
            left: d * 0.2,
            top: d * 0.14,
            width: d * 0.26,
            height: d * 0.34,
            borderRadius: d * 0.15,
            backgroundColor: 'rgba(255,255,255,0.55)',
            transform: [{ rotate: '25deg' }],
          }}
        />
      </View>
    </View>
  );
});

type Fx = { key: string; x: number; y: number; color: string; fall: boolean };

/** A popping (grow + fade) or falling balloon. */
function Effect({ fx, size, onDone }: { fx: Fx; size: number; onDone: (key: string) => void }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: fx.fall ? 650 : 280,
      easing: fx.fall ? Easing.in(Easing.quad) : Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => onDone(fx.key));
  }, [fx, onDone, t]);
  const d = size * 0.94;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: fx.x - d / 2,
        top: fx.y - d / 2,
        width: d,
        height: d,
        borderRadius: d / 2,
        backgroundColor: fx.color,
        opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: fx.fall
          ? [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, size * 8] }) }]
          : [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
      }}
    />
  );
}

export default function BalloonsScreen() {
  useKeepAwake();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<Board>(() => makeBoard(1));
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startCount, setStartCount] = useState(() => count(board));
  const [aim, setAim] = useState<{ x: number; y: number }[] | null>(null);
  const [flying, setFlying] = useState(false);
  const [fx, setFx] = useState<Fx[]>([]);
  const [result, setResult] = useState<'won' | 'lost' | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const cfg = levelConfig(level);
  const availH = height - insets.top - insets.bottom - 190;
  const size = Math.floor(Math.min((Math.min(width, 520) - 32) / COLS, availH / BOARD_H));
  const boardW = size * COLS;
  const boardH = size * BOARD_H;

  const ball = useRef(new Animated.ValueXY({ x: LAUNCH.x * size, y: LAUNCH.y * size })).current;
  const boardRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const live = useRef({ board, current, next, flying, result, size, cfg, misses, level });
  live.current = { board, current, next, flying, result, size, cfg, misses, level };

  const start = (lvl: number) => {
    const b = makeBoard(lvl);
    const c = levelConfig(lvl);
    setLevel(lvl);
    setBoard(b);
    setCurrent(pickColor(b, c.colors));
    setNext(pickColor(b, c.colors));
    setScore(0);
    setShots(0);
    setMisses(0);
    setStartCount(count(b));
    setAim(null);
    setFx([]);
    setResult(null);
  };

  useEffect(() => {
    loadJSON('balloons', { level: 1 }).then((v) => {
      start(Math.max(1, Number(v.level) || 1));
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!flying) ball.setValue({ x: LAUNCH.x * size, y: LAUNCH.y * size });
  }, [size, flying, ball]);

  const removeFx = useMemo(() => (key: string) => setFx((list) => list.filter((f) => f.key !== key)), []);

  const land = (x: number, y: number) => {
    const L = live.current;
    const b = cloneBoard(L.board);
    const spot = snapCell(b, x, y);
    setShots((s) => s + 1);
    if (!spot) {
      setFlying(false);
      return;
    }
    const [r, c] = spot;
    b.grid[r][c] = L.current;
    const effects: Fx[] = [];
    const stamp = Date.now();
    const toFx = (rr: number, cc: number, color: number, fall: boolean) => {
      const p = cellCenter(b, rr, cc);
      effects.push({
        key: `${stamp}-${rr}-${cc}-${fall ? 'f' : 'p'}`,
        x: p.x * L.size,
        y: p.y * L.size,
        color: BALLOON_COLORS[color],
        fall,
      });
    };

    const g = group(b, r, c);
    let missesNext = L.misses;
    if (g.length >= 3) {
      g.forEach(([rr, cc]) => {
        toFx(rr, cc, b.grid[rr][cc]!, false);
        b.grid[rr][cc] = null;
      });
      const dropped = dropFloating(b);
      dropped.forEach((d) => toFx(d.r, d.c, d.color, true));
      setScore((s) => s + g.length * 10 + dropped.length * 20);
      playSound(dropped.length ? 'win' : 'match');
      vibrate('medium');
    } else {
      playSound('flip');
      missesNext += 1;
      if (missesNext >= L.cfg.shotsPerDrop) {
        missesNext = 0;
        pushRow(b, L.cfg.colors);
        vibrate('light');
      }
    }
    setMisses(missesNext);
    setFx((list) => [...list, ...effects]);
    setBoard(b);

    if (count(b) === 0) {
      setResult('won');
      setConfetti((k) => k + 1);
      playSound('win');
      vibrate('success');
      saveJSON('balloons', { level: L.level + 1 });
    } else if (lost(b)) {
      setResult('lost');
      playSound('wrong');
      vibrate('error');
    }
    setCurrent(colorsLeft(b).includes(L.next) ? L.next : pickColor(b, L.cfg.colors));
    setNext(pickColor(b, L.cfg.colors));
    setFlying(false);
  };

  const shoot = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return;
    setFlying(true);
    setAim(null);
    playSound('tap');
    const S = live.current.size;
    let i = 0;
    const per = Math.max(1, Math.round(SPEED / 0.12));
    const frame = () => {
      i = Math.min(pts.length - 1, i + per);
      ball.setValue({ x: pts[i].x * S, y: pts[i].y * S });
      if (i >= pts.length - 1) land(pts[i].x, pts[i].y);
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const aimAt = (pageX: number, pageY: number) => {
    const L = live.current;
    const x = (pageX - origin.current.x) / L.size;
    const y = (pageY - origin.current.y) / L.size;
    let dx = x - LAUNCH.x;
    let dy = y - LAUNCH.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.3 || dy > -0.15) return null;
    dx /= len;
    dy /= len;
    // Keep the shot from going almost sideways.
    if (dy > -0.17) {
      dy = -0.17;
      dx = Math.sign(dx) * Math.sqrt(1 - dy * dy);
    }
    return trace(L.board, LAUNCH.x, LAUNCH.y, dx, dy);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !live.current.flying && !live.current.result,
      onMoveShouldSetPanResponder: () => !live.current.flying && !live.current.result,
      onPanResponderGrant: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        boardRef.current?.measureInWindow((x, y) => {
          origin.current = { x: x + 3, y: y + 3 };
          setAim(aimAt(pageX, pageY));
        });
      },
      onPanResponderMove: (e) => setAim(aimAt(e.nativeEvent.pageX, e.nativeEvent.pageY)),
      onPanResponderRelease: (e) => {
        const L = live.current;
        const x = (e.nativeEvent.pageX - origin.current.x) / L.size;
        const y = (e.nativeEvent.pageY - origin.current.y) / L.size;
        if (Math.hypot(x - NEXT.x, y - NEXT.y) < 0.9) {
          // Tapping the waiting balloon swaps it with the one in the launcher.
          playSound('flip');
          setCurrent(L.next);
          setNext(L.current);
          setAim(null);
          return;
        }
        const pts = aimAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (pts) shoot(pts);
        else setAim(null);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => setAim(null),
    }),
  ).current;

  const stars = shots <= startCount * 0.4 ? 3 : shots <= startCount * 0.65 ? 2 : 1;
  const dots = aim ? aim.filter((_, i) => i % 5 === 4).slice(0, 60) : [];

  return (
    <Screen scroll={false}>
      <GameTopBar title="Şarları partlat" />
      <View style={styles.info}>
        <Text style={styles.pill}>🎯 Səviyyə {level}</Text>
        <Text style={styles.pill}>⭐ {score}</Text>
        <View style={styles.pillRow}>
          {Array.from({ length: cfg.shotsPerDrop }, (_, i) => (
            <View key={i} style={[styles.dropDot, i < cfg.shotsPerDrop - misses && styles.dropDotOn]} />
          ))}
        </View>
      </View>

      <View
        ref={boardRef}
        nativeID="balloon-board"
        {...responder.panHandlers}
        style={[styles.board, { width: boardW + 6, height: boardH + 6 }]}>
        {loaded &&
          board.grid.map((row, r) =>
            row.map((col, c) => {
              if (col === null) return null;
              const p = cellCenter(board, r, c);
              return (
                <Balloon
                  key={`${r}-${c}-${board.parity}`}
                  x={p.x * size}
                  y={p.y * size}
                  size={size}
                  color={BALLOON_COLORS[col]}
                />
              );
            }),
          )}
        <View style={[styles.deadline, { top: DEADLINE * size }]} />
        {dots.map((p, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={[
              styles.dot,
              {
                left: p.x * size - 3,
                top: p.y * size - 3,
                backgroundColor: BALLOON_COLORS[current],
              },
            ]}
          />
        ))}
        {fx.map((f) => (
          <Effect key={f.key} fx={f} size={size} onDone={removeFx} />
        ))}
        {loaded && (
          <>
            <View
              style={[
                styles.launcher,
                { left: LAUNCH.x * size - size * 0.75, top: LAUNCH.y * size - size * 0.75, width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 },
              ]}
            />
            <Balloon x={NEXT.x * size} y={NEXT.y * size} size={size * 0.8} color={BALLOON_COLORS[next]} />
            <Text style={[styles.swap, { left: NEXT.x * size - size, top: NEXT.y * size + size * 0.35, width: size * 2 }]}>
              🔄
            </Text>
            <Animated.View
              pointerEvents="none"
              nativeID={`current-${current}`}
              style={{ position: 'absolute', left: 0, top: 0, transform: ball.getTranslateTransform() }}>
              <Balloon x={0} y={0} size={size} color={BALLOON_COLORS[current]} />
            </Animated.View>
          </>
        )}
      </View>
      <Text style={styles.hint}>Barmağını sürüşdür, nişan al və burax 🎈</Text>

      <Confetti burst={confetti} count={90} />
      <ModalCard visible={result === 'won'} icon="🎈" title="Afərin!">
        <Text style={styles.stars}>
          {'⭐'.repeat(stars)}
          <Text style={styles.dim}>{'⭐'.repeat(3 - stars)}</Text>
        </Text>
        <Text style={styles.resultText}>
          Səviyyə {level} keçildi! Xal: {score}
        </Text>
        <BigButton label="➡️ Növbəti səviyyə" color={colors.correct} onPress={() => start(level + 1)} />
        <BigButton label="🏠 Oyunlara qayıt" color="#FF7A59" onPress={() => router.dismissTo('/')} />
      </ModalCard>
      <ModalCard visible={result === 'lost'} icon="😮" title="Şarlar aşağı çatdı!">
        <Text style={styles.resultText}>Yenidən cəhd et — hər dəfə yeni şarlar düzülür.</Text>
        <BigButton label="🔁 Yenidən oyna" color={colors.correct} onPress={() => start(level)} />
        <BigButton label="🏠 Oyunlara qayıt" color="#FF7A59" onPress={() => router.dismissTo('/')} />
      </ModalCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: -8 },
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
  pillRow: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  dropDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E3DEF5' },
  dropDotOn: { backgroundColor: colors.primary },
  board: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    userSelect: 'none',
  },
  balloonWrap: { position: 'absolute', alignItems: 'center' },
  knot: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  deadline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FF4D6D',
    opacity: 0.6,
  },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, opacity: 0.8 },
  launcher: { position: 'absolute', backgroundColor: '#E9E3FF', borderWidth: 3, borderColor: '#fff' },
  swap: { position: 'absolute', textAlign: 'center', fontSize: 12 },
  hint: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center', marginTop: -8 },
  stars: { fontSize: 40, textAlign: 'center', letterSpacing: 4 },
  dim: { opacity: 0.2 },
  resultText: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
});
