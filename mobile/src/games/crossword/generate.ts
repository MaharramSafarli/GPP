import { toLetters } from '@/lib/az';
import { shuffle } from '@/games/explain-it/shuffle';

export type Dir = 'across' | 'down';

export type PlacedWord = {
  word: string; // display form, e.g. "Namaz"
  letters: string[]; // upper-case letters
  row: number;
  col: number;
  dir: Dir;
};

export type Crossword = {
  rows: number;
  cols: number;
  words: PlacedWord[];
  /** solution[r][c] = letter or null for blocked cells */
  solution: (string | null)[][];
};

type Grid = Map<string, string>;
const key = (r: number, c: number) => `${r},${c}`;

function cellsOf(w: { letters: string[]; row: number; col: number; dir: Dir }) {
  return w.letters.map((l, i) => ({
    r: w.row + (w.dir === 'down' ? i : 0),
    c: w.col + (w.dir === 'across' ? i : 0),
    l,
  }));
}

/** Can `w` be placed without clashing or touching other words side by side? */
function fits(grid: Grid, w: { letters: string[]; row: number; col: number; dir: Dir }) {
  const dr = w.dir === 'down' ? 1 : 0;
  const dc = w.dir === 'across' ? 1 : 0;
  // Cells just before and after the word must be empty.
  if (grid.has(key(w.row - dr, w.col - dc))) return false;
  const n = w.letters.length;
  if (grid.has(key(w.row + dr * n, w.col + dc * n))) return false;

  let crossings = 0;
  for (const { r, c, l } of cellsOf(w)) {
    const existing = grid.get(key(r, c));
    if (existing) {
      if (existing !== l) return false;
      crossings++;
      continue;
    }
    // Empty cell: its side neighbours (perpendicular) must be empty too.
    if (grid.has(key(r + dc, c + dr)) || grid.has(key(r - dc, c - dr))) return false;
  }
  return crossings > 0 && crossings < n;
}

function bounds(grid: Grid) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const k of grid.keys()) {
    const [r, c] = k.split(',').map(Number);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }
  return { minR, maxR, minC, maxC };
}

function attempt(pool: string[], target: number, maxCols: number, maxRows: number) {
  const grid: Grid = new Map();
  const placed: PlacedWord[] = [];
  const [first, ...rest] = pool;
  const firstLetters = toLetters(first);
  const start: PlacedWord = { word: first, letters: firstLetters, row: 0, col: 0, dir: 'across' };
  placed.push(start);
  for (const { r, c, l } of cellsOf(start)) grid.set(key(r, c), l);

  for (const word of rest) {
    if (placed.length >= target) break;
    const letters = toLetters(word);
    if (placed.some((p) => p.letters.join('') === letters.join(''))) continue;

    const options: PlacedWord[] = [];
    for (const p of placed) {
      const dir: Dir = p.dir === 'across' ? 'down' : 'across';
      p.letters.forEach((pl, pi) => {
        letters.forEach((l, li) => {
          if (l !== pl) return;
          const pr = p.row + (p.dir === 'down' ? pi : 0);
          const pc = p.col + (p.dir === 'across' ? pi : 0);
          const cand: PlacedWord = {
            word,
            letters,
            dir,
            row: pr - (dir === 'down' ? li : 0),
            col: pc - (dir === 'across' ? li : 0),
          };
          if (!fits(grid, cand)) return;
          // Keep the puzzle within phone-friendly bounds.
          const trial = new Map(grid);
          for (const x of cellsOf(cand)) trial.set(key(x.r, x.c), x.l);
          const b = bounds(trial);
          if (b.maxC - b.minC + 1 > maxCols || b.maxR - b.minR + 1 > maxRows) return;
          options.push(cand);
        });
      });
    }
    if (!options.length) continue;
    const pick = options[Math.floor(Math.random() * options.length)];
    placed.push(pick);
    for (const { r, c, l } of cellsOf(pick)) grid.set(key(r, c), l);
  }
  return { grid, placed };
}

/** Builds a random crossword from `words`, trying several times and keeping the best. */
export function generateCrossword(
  words: string[],
  { target = 9, maxCols = 11, maxRows = 13, tries = 40 } = {},
): Crossword {
  let best: ReturnType<typeof attempt> | null = null;
  const usable = words.filter((w) => {
    const n = toLetters(w).length;
    return n >= 3 && n <= Math.min(maxCols, maxRows);
  });

  for (let t = 0; t < tries; t++) {
    const pool = shuffle(usable);
    // Start with a longer word so others have more letters to cross.
    const long = pool.findIndex((w) => toLetters(w).length >= 6);
    if (long > 0) [pool[0], pool[long]] = [pool[long], pool[0]];
    const res = attempt(pool.slice(0, 80), target, maxCols, maxRows);
    if (!best || res.placed.length > best.placed.length) best = res;
    if (best.placed.length >= target) break;
  }

  const { grid, placed } = best!;
  const b = bounds(grid);
  const rows = b.maxR - b.minR + 1;
  const cols = b.maxC - b.minC + 1;
  const solution: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const [k, l] of grid) {
    const [r, c] = k.split(',').map(Number);
    solution[r - b.minR][c - b.minC] = l;
  }
  return {
    rows,
    cols,
    solution,
    words: placed.map((p) => ({ ...p, row: p.row - b.minR, col: p.col - b.minC })),
  };
}

export function wordCells(w: PlacedWord) {
  return cellsOf(w);
}
