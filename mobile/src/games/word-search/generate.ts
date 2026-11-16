import { AZ_ALPHABET, toLetters } from '@/lib/az';
import { shuffle } from '@/games/explain-it/shuffle';

export type Placed = { word: string; letters: string[]; cells: { r: number; c: number }[] };
export type WordSearch = { size: number; grid: string[][]; words: Placed[] };

// Right, down, diagonal down-right, diagonal up-right (kid-friendly: no backwards words).
const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
];

export function generateWordSearch(words: string[], size = 10, count = 8): WordSearch {
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const placed: Placed[] = [];
  const pool = shuffle(words.filter((w) => toLetters(w).length >= 3 && toLetters(w).length <= size));

  for (const word of pool) {
    if (placed.length >= count) break;
    const letters = toLetters(word);
    if (placed.some((p) => p.letters.join('') === letters.join(''))) continue;
    let done = false;
    for (let t = 0; t < 80 && !done; t++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r0 = Math.floor(Math.random() * size);
      const c0 = Math.floor(Math.random() * size);
      const cells = letters.map((_, i) => ({ r: r0 + dr * i, c: c0 + dc * i }));
      const ok = cells.every(
        ({ r, c }, i) =>
          r >= 0 && r < size && c >= 0 && c < size && (grid[r][c] === null || grid[r][c] === letters[i]),
      );
      if (!ok) continue;
      cells.forEach(({ r, c }, i) => (grid[r][c] = letters[i]));
      placed.push({ word, letters, cells });
      done = true;
    }
  }

  const filled = grid.map((row) =>
    row.map((l) => l ?? AZ_ALPHABET[Math.floor(Math.random() * AZ_ALPHABET.length)]),
  );
  return { size, grid: filled, words: placed };
}
