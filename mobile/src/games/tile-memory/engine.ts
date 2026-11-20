/**
 * "Xanaları xatırla": some tiles light up for a moment; tap the same tiles.
 * A perfect round makes the next one harder (more tiles, bigger grid);
 * a mistake makes it one step easier.
 */
export const TRIALS = 12;

/** [rows, cols, lit tiles] for each difficulty step. */
export const STEPS: [number, number, number][] = [
  [3, 3, 3],
  [3, 4, 4],
  [4, 4, 5],
  [4, 4, 6],
  [4, 5, 7],
  [5, 5, 8],
  [5, 5, 9],
  [5, 6, 10],
  [6, 6, 11],
  [6, 6, 12],
  [6, 7, 13],
  [7, 7, 14],
];

/** `count` different random cells out of rows × cols. */
export function makePattern(rows: number, cols: number, count: number, rand: () => number = Math.random): number[] {
  const cells = Array.from({ length: rows * cols }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, count).sort((a, b) => a - b);
}

/** How long the pattern stays visible (ms). */
export const showMs = (tiles: number) => 1100 + tiles * 120;

export const nextStep = (step: number, perfect: boolean) =>
  perfect ? Math.min(STEPS.length - 1, step + 1) : Math.max(0, step - 1);

export const STATS_KEY = 'tile-memory';
export type TileStats = { best: number; bestTiles: number };
export const EMPTY_STATS: TileStats = { best: 0, bestTiles: 0 };
