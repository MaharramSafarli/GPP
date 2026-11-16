import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { GameTopBar } from '@/components/game-top-bar';
import { Screen } from '@/components/screen';
import { WinModal, starsFor } from '@/components/win-modal';
import { ISLAMIC_TERMS } from '@/data/islamic-terms';
import { generateWordSearch, type WordSearch } from '@/games/word-search/generate';
import { azUpper } from '@/lib/az';
import { playSound, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

type Pos = { r: number; c: number };
const FOUND_COLORS = ['#B9F6CA', '#FFE0B2', '#F8BBD0', '#B3E5FC', '#E1BEE7', '#FFF59D', '#C8E6C9', '#FFCCBC'];

/** Cells on the straight line from a to b (snapped to the nearest of 8 directions). */
function lineCells(a: Pos, b: Pos, size: number): Pos[] {
  let dr = b.r - a.r;
  let dc = b.c - a.c;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [a];
  const angle = Math.atan2(dr, dc);
  const oct = Math.round(angle / (Math.PI / 4));
  dr = Math.round(Math.sin((oct * Math.PI) / 4));
  dc = Math.round(Math.cos((oct * Math.PI) / 4));
  const out: Pos[] = [];
  for (let i = 0; i <= len; i++) {
    const r = a.r + dr * i;
    const c = a.c + dc * i;
    if (r < 0 || c < 0 || r >= size || c >= size) break;
    out.push({ r, c });
  }
  return out;
}

export default function WordSearchScreen() {
  useKeepAwake();
  const { width } = useWindowDimensions();
  const [puzzle, setPuzzle] = useState<WordSearch>(() => generateWordSearch(ISLAMIC_TERMS));
  const [found, setFound] = useState<{ word: string; cells: Pos[]; color: string }[]>([]);
  const [selection, setSelection] = useState<Pos[]>([]);
  const [pending, setPending] = useState<Pos | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [confetti, setConfetti] = useState(0);

  const gridRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const start = useRef<Pos | null>(null);
  const state = useRef({ puzzle, found, pending, won });
  state.current = { puzzle, found, pending, won };

  const gridSize = Math.min(width - 32, 460);
  const cell = (gridSize - 6) / puzzle.size; // 3px border on each side
  const cellRef = useRef(cell);
  cellRef.current = cell;

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [won]);

  const posAt = (pageX: number, pageY: number): Pos => {
    const size = state.current.puzzle.size;
    const c = Math.floor((pageX - origin.current.x) / cellRef.current);
    const r = Math.floor((pageY - origin.current.y) / cellRef.current);
    return { r: Math.max(0, Math.min(size - 1, r)), c: Math.max(0, Math.min(size - 1, c)) };
  };

  const finishSelection = (cells: Pos[]) => {
    const { puzzle: p, found: f } = state.current;
    const text = cells.map(({ r, c }) => p.grid[r][c]).join('');
    const reversed = [...text].reverse().join('');
    const hit = p.words.find(
      (w) => !f.some((x) => x.word === w.word) && (w.letters.join('') === text || w.letters.join('') === reversed),
    );
    setSelection([]);
    if (!hit) {
      if (cells.length > 1) {
        playSound('wrong');
        vibrate('light');
      }
      return;
    }
    const next = [...f, { word: hit.word, cells, color: FOUND_COLORS[f.length % FOUND_COLORS.length] }];
    setFound(next);
    if (next.length === p.words.length) {
      setWon(true);
      playSound('win');
      vibrate('success');
      setConfetti((x) => x + 1);
    } else {
      playSound('match');
      vibrate('medium');
      setConfetti((x) => x + 1);
    }
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !state.current.won,
      onMoveShouldSetPanResponder: () => !state.current.won,
      onPanResponderGrant: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        gridRef.current?.measureInWindow((x, y) => {
          origin.current = { x: x + 3, y: y + 3 };
          const p = posAt(pageX, pageY);
          const pend = state.current.pending;
          start.current = pend ?? p;
          setSelection(lineCells(start.current, p, state.current.puzzle.size));
        });
      },
      onPanResponderMove: (e) => {
        if (!start.current) return;
        const p = posAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
        setSelection(lineCells(start.current, p, state.current.puzzle.size));
      },
      onPanResponderRelease: (e) => {
        if (!start.current) return;
        const p = posAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
        const cells = lineCells(start.current, p, state.current.puzzle.size);
        if (cells.length === 1 && !state.current.pending) {
          // A single tap marks the first letter; the next tap picks the last letter.
          playSound('tap');
          setPending(p);
          setSelection([p]);
        } else {
          setPending(null);
          finishSelection(cells);
        }
        start.current = null;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        start.current = null;
        setSelection([]);
      },
    }),
  ).current;

  const restart = () => {
    setPuzzle(generateWordSearch(ISLAMIC_TERMS));
    setFound([]);
    setSelection([]);
    setPending(null);
    setSeconds(0);
    setWon(false);
    setConfetti(0);
  };

  const colorAt = new Map<string, string>();
  found.forEach((f) => f.cells.forEach(({ r, c }) => colorAt.set(`${r},${c}`, f.color)));
  const selected = new Set(selection.map(({ r, c }) => `${r},${c}`));

  return (
    <Screen scroll={false}>
      <GameTopBar title="Söz tap" seconds={seconds} />
      <Text style={styles.hint}>Barmağını hərflərin üstündə sürüşdür 👆</Text>

      <View
        ref={gridRef}
        {...responder.panHandlers}
        style={[styles.grid, { width: gridSize, height: gridSize }]}>
        {puzzle.grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((l, c) => {
              const k = `${r},${c}`;
              const bg = selected.has(k) ? '#FFB703' : colorAt.get(k);
              return (
                <View
                  key={k}
                  style={[styles.cell, { width: cell, height: cell }, bg ? { backgroundColor: bg } : null]}>
                  <Text style={[styles.letter, { fontSize: cell * 0.5, lineHeight: cell * 0.75 }]}>{l}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.bank}>
        {puzzle.words.map((w) => {
          const f = found.find((x) => x.word === w.word);
          return (
            <View key={w.word} style={[styles.chip, f && { backgroundColor: f.color }]}>
              <Text style={[styles.chipText, f && styles.chipDone]}>{azUpper(w.word)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.progress}>
        {found.length} / {puzzle.words.length} söz tapıldı
      </Text>

      <BigButton label="🔄 Yeni oyun" color={colors.primary} onPress={restart} />

      <Confetti burst={confetti} count={won ? 90 : 30} />
      <WinModal
        visible={won}
        stars={starsFor(seconds, puzzle.words.length * 15)}
        seconds={seconds}
        extra={`${puzzle.words.length} söz tapdın!`}
        onPlayAgain={restart}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
  grid: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#7BC67E',
    userSelect: 'none',
  },
  row: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.display, color: '#3F3D56' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#E9E3FF',
  },
  chipText: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  chipDone: { textDecorationLine: 'line-through', color: '#2D6A4F' },
  progress: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
});
