/**
 * "Şarları partlat" – a bubble-shooter style game on a hex grid.
 * Rows alternate between COLS cells and COLS - 1 cells (shifted half a cell).
 * Units: 1 = one balloon diameter.
 */
export const COLS = 9;
export const ROWS = 13; // rows that fit on the board; a balloon in the last row = game over
export const ROW_H = Math.sqrt(3) / 2;

export const BALLOON_COLORS = ['#FF4D6D', '#FFB703', '#22C55E', '#4D96FF', '#9B5DE5', '#00C2D1'];

export type Grid = (number | null)[][]; // color index or empty

export type Board = {
  grid: Grid;
  /** 0 or 1: whether row 0 is a "short" (shifted) row. Flips when a row is pushed in. */
  parity: number;
};

export const isShort = (b: Board, r: number) => (r + b.parity) % 2 === 1;
export const rowLen = (b: Board, r: number) => (isShort(b, r) ? COLS - 1 : COLS);

export function cellCenter(b: Board, r: number, c: number) {
  return { x: 0.5 + c + (isShort(b, r) ? 0.5 : 0), y: 0.5 + r * ROW_H };
}

export function neighbors(b: Board, r: number, c: number): [number, number][] {
  const out: [number, number][] = [
    [r, c - 1],
    [r, c + 1],
  ];
  const shift = isShort(b, r) ? 0 : -1;
  for (const rr of [r - 1, r + 1]) out.push([rr, c + shift], [rr, c + shift + 1]);
  return out.filter(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < rowLen(b, rr));
}

export type LevelConfig = { rows: number; colors: number; shotsPerDrop: number };

export function levelConfig(level: number): LevelConfig {
  return {
    rows: Math.min(4 + Math.floor((level + 1) / 2), 8),
    colors: Math.min(3 + Math.floor((level - 1) / 3), BALLOON_COLORS.length),
    shotsPerDrop: level < 3 ? 8 : level < 6 ? 7 : level < 10 ? 6 : 5,
  };
}

const PATTERNS = ['full', 'diamond', 'gaps', 'zigzag', 'pyramid'] as const;

/** A fresh random board — different every time, even for the same level. */
export function makeBoard(level: number, rand: () => number = Math.random): Board {
  const cfg = levelConfig(level);
  const pattern = level <= 2 ? 'full' : PATTERNS[Math.floor(rand() * PATTERNS.length)];
  const b: Board = { grid: [], parity: rand() < 0.5 ? 0 : 1 };
  for (let r = 0; r < ROWS; r++) b.grid.push(Array.from({ length: rowLen(b, r) }, () => null));
  for (let r = 0; r < cfg.rows; r++) {
    const len = rowLen(b, r);
    for (let c = 0; c < len; c++) {
      const mid = (len - 1) / 2;
      let keep = true;
      if (pattern === 'diamond') keep = Math.abs(c - mid) <= mid - Math.abs(r - cfg.rows / 2) + 1.5;
      else if (pattern === 'gaps') keep = r < 2 || (c + r) % 4 !== 0;
      else if (pattern === 'zigzag') keep = r < 2 || Math.floor(c / 2 + r / 2) % 2 === 0;
      else if (pattern === 'pyramid') keep = Math.abs(c - mid) <= cfg.rows - r + 0.5;
      if (r === 0) keep = true; // a full top row keeps everything attached
      if (!keep) continue;
      // Copy a neighbor's color now and then so that small groups form.
      const left = c > 0 ? b.grid[r][c - 1] : null;
      const up = r > 0 ? b.grid[r - 1][Math.min(c, rowLen(b, r - 1) - 1)] : null;
      const roll = rand();
      b.grid[r][c] =
        roll < 0.3 && left !== null ? left : roll < 0.5 && up !== null ? up : Math.floor(rand() * cfg.colors);
    }
  }
  dropFloating(b);
  return b;
}

export function count(b: Board) {
  return b.grid.reduce((n, row) => n + row.filter((x) => x !== null).length, 0);
}

export function colorsLeft(b: Board): number[] {
  const set = new Set<number>();
  b.grid.forEach((row) => row.forEach((x) => x !== null && set.add(x)));
  return [...set];
}

/** Removes balloons no longer connected to the top; returns them. */
export function dropFloating(b: Board): { r: number; c: number; color: number }[] {
  const seen = new Set<string>();
  const stack: [number, number][] = [];
  b.grid[0].forEach((x, c) => {
    if (x !== null) {
      stack.push([0, c]);
      seen.add(`0,${c}`);
    }
  });
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [rr, cc] of neighbors(b, r, c)) {
      const k = `${rr},${cc}`;
      if (!seen.has(k) && b.grid[rr][cc] !== null) {
        seen.add(k);
        stack.push([rr, cc]);
      }
    }
  }
  const dropped: { r: number; c: number; color: number }[] = [];
  b.grid.forEach((row, r) =>
    row.forEach((x, c) => {
      if (x !== null && !seen.has(`${r},${c}`)) {
        dropped.push({ r, c, color: x });
        row[c] = null;
      }
    }),
  );
  return dropped;
}

/** The same-color group containing (r, c). */
export function group(b: Board, r: number, c: number): [number, number][] {
  const color = b.grid[r][c];
  const out: [number, number][] = [[r, c]];
  const seen = new Set([`${r},${c}`]);
  for (let i = 0; i < out.length; i++) {
    for (const [rr, cc] of neighbors(b, out[i][0], out[i][1])) {
      const k = `${rr},${cc}`;
      if (!seen.has(k) && b.grid[rr][cc] === color) {
        seen.add(k);
        out.push([rr, cc]);
      }
    }
  }
  return out;
}

/** The empty cell, touching the top or another balloon, closest to (x, y). */
export function snapCell(b: Board, x: number, y: number): [number, number] | null {
  let best: [number, number] | null = null;
  let bestD = Infinity;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < rowLen(b, r); c++) {
      if (b.grid[r][c] !== null) continue;
      if (r > 0 && !neighbors(b, r, c).some(([rr, cc]) => b.grid[rr][cc] !== null)) continue;
      const p = cellCenter(b, r, c);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = [r, c];
      }
    }
  }
  return best;
}

/** Does a ball at (x, y) touch the ceiling or a balloon? */
export function hits(b: Board, x: number, y: number): boolean {
  if (y <= 0.5) return true;
  const r0 = Math.max(0, Math.floor((y - 0.5) / ROW_H) - 1);
  for (let r = r0; r <= Math.min(ROWS - 1, r0 + 3); r++) {
    for (let c = 0; c < rowLen(b, r); c++) {
      if (b.grid[r][c] === null) continue;
      const p = cellCenter(b, r, c);
      if ((p.x - x) ** 2 + (p.y - y) ** 2 < 0.8 * 0.8) return true;
    }
  }
  return false;
}

/** Pushes a new random row in from the top (everything moves down one row). */
export function pushRow(b: Board, nColors: number, rand: () => number = Math.random) {
  b.parity = 1 - b.parity;
  const pool = colorsLeft(b);
  const pick = () => (pool.length ? pool[Math.floor(rand() * pool.length)] : Math.floor(rand() * nColors));
  b.grid.pop();
  b.grid.unshift(Array.from({ length: rowLen(b, 0) }, pick));
  // Row lengths alternate, so re-fit every row to its new length.
  b.grid = b.grid.map((row, r) => {
    const len = rowLen(b, r);
    return row.length === len ? row : row.length > len ? row.slice(0, len) : [...row, null];
  });
}

export function lost(b: Board) {
  return b.grid[ROWS - 1].some((x) => x !== null);
}

/**
 * Traces the shot from the launcher at (x0, y0) with direction (dx, dy),
 * bouncing off the side walls. Returns the path points (for the aiming dots)
 * and where it stops.
 */
export function trace(b: Board, x0: number, y0: number, dx: number, dy: number, step = 0.12) {
  let x = x0;
  let y = y0;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 2000; i++) {
    x += dx * step;
    y += dy * step;
    if (x < 0.5) {
      x = 1 - x;
      dx = -dx;
    } else if (x > COLS - 0.5) {
      x = 2 * (COLS - 0.5) - x;
      dx = -dx;
    }
    pts.push({ x, y });
    if (hits(b, x, y)) break;
  }
  return pts;
}

export function cloneBoard(b: Board): Board {
  return { parity: b.parity, grid: b.grid.map((row) => [...row]) };
}
