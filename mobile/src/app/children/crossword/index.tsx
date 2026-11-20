import { useKeepAwake } from '@/lib/keep-awake';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { GameTopBar } from '@/components/game-top-bar';
import { Screen } from '@/components/screen';
import { WinModal, starsFor } from '@/components/win-modal';
import { ISLAMIC_TERMS } from '@/data/islamic-terms';
import { generateCrossword, wordCells, type Crossword } from '@/games/crossword/generate';
import { AZ_ALPHABET, azUpper } from '@/lib/az';
import { playSound, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

type Pos = { r: number; c: number };

function newGame() {
  const puzzle = generateCrossword(ISLAMIC_TERMS);
  const entries = puzzle.solution.map((row) => row.map(() => ''));
  const fixed = new Set<string>();
  // Like a printed puzzle: one letter of each word is given as a hint.
  for (const w of puzzle.words) {
    const cells = wordCells(w);
    const pick = cells[Math.floor(Math.random() * cells.length)];
    entries[pick.r][pick.c] = pick.l;
    fixed.add(`${pick.r},${pick.c}`);
  }
  return { puzzle, entries, fixed };
}

export default function CrosswordScreen() {
  useKeepAwake();
  const { width } = useWindowDimensions();
  const [game, setGame] = useState(newGame);
  const [entries, setEntries] = useState(game.entries);
  const [fixed, setFixed] = useState(game.fixed);
  const [wordIdx, setWordIdx] = useState(0);
  const [cursor, setCursor] = useState<Pos | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [hints, setHints] = useState(0);
  const puzzle: Crossword = game.puzzle;

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [won]);

  const solved = useMemo(
    () => puzzle.words.map((w) => wordCells(w).every(({ r, c, l }) => entries[r][c] === l)),
    [puzzle, entries],
  );
  const wrongCells = useMemo(() => {
    const bad = new Set<string>();
    puzzle.words.forEach((w) => {
      const cells = wordCells(w);
      if (cells.every(({ r, c }) => entries[r][c]) && !cells.every(({ r, c, l }) => entries[r][c] === l))
        cells.forEach(({ r, c, l }) => entries[r][c] !== l && bad.add(`${r},${c}`));
    });
    return bad;
  }, [puzzle, entries]);

  const selected = puzzle.words[wordIdx];
  const selectedCells = new Set(wordCells(selected).map(({ r, c }) => `${r},${c}`));
  const solvedCells = new Set<string>();
  puzzle.words.forEach((w, i) => solved[i] && wordCells(w).forEach(({ r, c }) => solvedCells.add(`${r},${c}`)));

  const cell = Math.floor(Math.min((width - 32) / puzzle.cols, 36));

  const wordsAt = (p: Pos) =>
    puzzle.words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => wordCells(w).some(({ r, c }) => r === p.r && c === p.c));

  const tapCell = (p: Pos) => {
    const options = wordsAt(p);
    if (!options.length) return;
    playSound('tap');
    const sameCell = cursor?.r === p.r && cursor?.c === p.c;
    const current = options.find((o) => o.i === wordIdx);
    const other = options.find((o) => o.i !== wordIdx);
    if (sameCell && other) setWordIdx(other.i);
    else if (!current) setWordIdx(options[0].i);
    setCursor(p);
  };

  const checkWin = (next: string[][]) => {
    const all = puzzle.words.every((w) => wordCells(w).every(({ r, c, l }) => next[r][c] === l));
    const newly = puzzle.words.some(
      (w, i) => !solved[i] && wordCells(w).every(({ r, c, l }) => next[r][c] === l),
    );
    if (all) {
      setWon(true);
      playSound('win');
      vibrate('success');
      setConfetti((x) => x + 1);
    } else if (newly) {
      playSound('match');
      vibrate('medium');
    }
  };

  const advance = (from: Pos, step: 1 | -1) => {
    const cells = wordCells(selected);
    let i = cells.findIndex(({ r, c }) => r === from.r && c === from.c) + step;
    while (i >= 0 && i < cells.length && fixed.has(`${cells[i].r},${cells[i].c}`)) i += step;
    return i >= 0 && i < cells.length ? { r: cells[i].r, c: cells[i].c } : from;
  };

  const startPos = (): Pos => {
    const cells = wordCells(selected);
    const empty = cells.find(({ r, c }) => !entries[r][c]) ?? cells.find(({ r, c }) => !fixed.has(`${r},${c}`));
    return empty ? { r: empty.r, c: empty.c } : { r: cells[0].r, c: cells[0].c };
  };

  const type = (letter: string) => {
    if (won) return;
    let p = cursor && selectedCells.has(`${cursor.r},${cursor.c}`) ? cursor : startPos();
    if (fixed.has(`${p.r},${p.c}`)) p = advance(p, 1);
    if (fixed.has(`${p.r},${p.c}`)) return;
    playSound('tap');
    const next = entries.map((row) => [...row]);
    next[p.r][p.c] = letter;
    setEntries(next);
    setCursor(advance(p, 1));
    checkWin(next);
  };

  const erase = () => {
    if (won) return;
    let p = cursor && selectedCells.has(`${cursor.r},${cursor.c}`) ? cursor : startPos();
    const next = entries.map((row) => [...row]);
    if (!next[p.r][p.c] || fixed.has(`${p.r},${p.c}`)) p = advance(p, -1);
    if (fixed.has(`${p.r},${p.c}`)) return;
    playSound('tap');
    next[p.r][p.c] = '';
    setEntries(next);
    setCursor(p);
  };

  const hint = () => {
    if (won) return;
    const wrong = ({ r, c }: { r: number; c: number }) => entries[r][c] !== puzzle.solution[r][c];
    let cells = wordCells(selected);
    let target =
      (cursor && cells.find(({ r, c }) => r === cursor.r && c === cursor.c && wrong({ r, c }))) || cells.find(wrong);
    if (!target) {
      // The selected word is already complete: move on to the next unfinished word.
      const n = puzzle.words.length;
      for (let k = 1; k <= n && !target; k++) {
        const i = (wordIdx + k) % n;
        cells = wordCells(puzzle.words[i]);
        target = cells.find(wrong);
        if (target) {
          setWordIdx(i);
          setCursor(null);
        }
      }
    }
    if (!target) return;
    playSound('correct');
    const next = entries.map((row) => [...row]);
    next[target.r][target.c] = target.l;
    setEntries(next);
    setFixed(new Set(fixed).add(`${target.r},${target.c}`));
    setHints((h) => h + 1);
    checkWin(next);
  };

  const restart = () => {
    const g = newGame();
    setGame(g);
    setEntries(g.entries);
    setFixed(g.fixed);
    setWordIdx(0);
    setCursor(null);
    setSeconds(0);
    setHints(0);
    setWon(false);
    setConfetti(0);
  };

  const keyRows = [AZ_ALPHABET.slice(0, 11), AZ_ALPHABET.slice(11, 22), AZ_ALPHABET.slice(22)];
  // 11 keys per row (+ a 1.5× wide delete key on the last row) inside 16px of keyboard padding.
  const keyW = Math.floor((width - 32 - 16 - 10 * 4) / 11.5);

  return (
    <Screen>
      <GameTopBar title="Krossvord" seconds={seconds} />

      <View style={styles.board}>
        {puzzle.solution.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((sol, c) => {
              const k = `${r},${c}`;
              if (!sol) return <View key={k} style={{ width: cell, height: cell }} />;
              const isCursor = cursor?.r === r && cursor?.c === c;
              const startNo = puzzle.words.findIndex((w) => w.row === r && w.col === c);
              return (
                <Pressable
                  key={k}
                  accessibilityLabel={`Xana ${r + 1}-${c + 1}`}
                  onPress={() => tapCell({ r, c })}
                  style={[
                    styles.cell,
                    { width: cell, height: cell },
                    selectedCells.has(k) && styles.cellSelected,
                    solvedCells.has(k) && styles.cellSolved,
                    isCursor && styles.cellCursor,
                  ]}>
                  {startNo >= 0 && <Text style={styles.num}>{startNo + 1}</Text>}
                  <Text
                    style={[
                      styles.letter,
                      { fontSize: cell * 0.55, lineHeight: cell * 0.8 },
                      fixed.has(k) && styles.letterFixed,
                      wrongCells.has(k) && styles.letterWrong,
                    ]}>
                    {entries[r][c]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.bank}>
        {puzzle.words.map((w, i) => (
          <Text key={w.word} style={[styles.bankWord, solved[i] && styles.bankDone]}>
            {azUpper(w.word)}
          </Text>
        ))}
      </View>

      <View style={styles.keyboard}>
        {keyRows.map((row, i) => (
          <View key={i} style={styles.keyRow}>
            {row.map((l) => (
              <Pressable
                key={l}
                onPress={() => type(l)}
                style={({ pressed }) => [styles.key, { width: keyW }, pressed && styles.keyPressed]}>
                <Text style={styles.keyText}>{l}</Text>
              </Pressable>
            ))}
            {i === 2 && (
              <Pressable
                onPress={erase}
                accessibilityLabel="Sil"
                style={({ pressed }) => [styles.key, styles.keyErase, { width: keyW * 1.5 }, pressed && styles.keyPressed]}>
                <Text style={styles.keyText}>⌫</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <BigButton label="💡 İpucu" color={colors.skip} onPress={hint} flex />
        <BigButton label="🔄 Yeni" color={colors.primary} onPress={restart} flex />
      </View>

      <Confetti burst={confetti} count={90} />
      <WinModal
        visible={won}
        stars={starsFor(seconds + hints * 15, puzzle.words.length * 25)}
        seconds={seconds}
        extra={hints ? `${hints} ipucu istifadə olundu` : 'İpucusuz! 👏'}
        onPlayAgain={restart}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    padding: 8,
    borderBottomWidth: 6,
    borderBottomColor: '#2E7D32',
  },
  row: { flexDirection: 'row' },
  cell: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { backgroundColor: 'rgba(255,255,255,0.4)' },
  cellSolved: { backgroundColor: '#FFE68A' },
  cellCursor: { backgroundColor: '#FFB703' },
  num: { position: 'absolute', top: 0, right: 2, fontSize: 8, fontFamily: fonts.bold, color: '#fff' },
  letter: { fontFamily: fonts.display, color: '#1B4332' },
  letterFixed: { color: '#14532D', textDecorationLine: 'underline' },
  letterWrong: { color: colors.foul },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
  },
  bankWord: { fontSize: 15, fontFamily: fonts.bold, color: colors.text, paddingHorizontal: 4 },
  bankDone: { textDecorationLine: 'line-through', color: colors.correct },
  keyboard: { backgroundColor: '#2F6F62', borderRadius: 18, padding: 8, gap: 6 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  key: {
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyErase: { backgroundColor: colors.foul },
  keyPressed: { backgroundColor: 'rgba(255,255,255,0.4)' },
  keyText: { fontSize: 18, fontFamily: fonts.display, color: '#fff' },
  actions: { flexDirection: 'row', gap: 10 },
});
