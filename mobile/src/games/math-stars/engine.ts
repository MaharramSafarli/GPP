/**
 * "Hesab ulduzları": arithmetic problems fall as stars; type the answer before
 * they reach the sea. Every few right answers the level goes up: stars fall
 * faster, come more often, and new operations / bigger numbers unlock.
 */
export type Op = '+' | '−' | '×' | '÷';
export type Problem = { a: number; b: number; op: Op; answer: number };

export const CORRECT_PER_LEVEL = 5;
export const LIVES = 3;

const rnd = (min: number, max: number, rand: () => number) => min + Math.floor(rand() * (max - min + 1));

/** Operations and number ranges for a level (1-based). */
export function levelRules(level: number) {
  const ops: Op[] = level <= 1 ? ['+'] : level <= 2 ? ['+', '−'] : level <= 4 ? ['+', '−', '×'] : ['+', '−', '×', '÷'];
  const addMax = level <= 2 ? 10 : level <= 4 ? 20 : level <= 6 ? 50 : 99;
  const mulMax = level <= 4 ? 5 : level <= 6 ? 9 : 12;
  return {
    ops,
    addMax,
    mulMax,
    /** Seconds a star needs to reach the sea. */
    fallSeconds: Math.max(5, 12 - level * 0.8),
    /** Seconds between new stars. */
    spawnSeconds: Math.max(1.6, 4.6 - level * 0.4),
  };
}

export function makeProblem(level: number, rand: () => number = Math.random): Problem {
  const r = levelRules(level);
  const op = r.ops[Math.floor(rand() * r.ops.length)];
  if (op === '+') {
    const a = rnd(1, r.addMax - 1, rand);
    const b = rnd(1, Math.max(1, r.addMax - a), rand);
    return { a, b, op, answer: a + b };
  }
  if (op === '−') {
    const a = rnd(2, r.addMax, rand);
    const b = rnd(1, a - 1, rand);
    return { a, b, op, answer: a - b };
  }
  if (op === '×') {
    const a = rnd(2, r.mulMax, rand);
    const b = rnd(1, r.mulMax, rand);
    return { a, b, op, answer: a * b };
  }
  // Division always comes out whole.
  const b = rnd(2, r.mulMax, rand);
  const answer = rnd(1, r.mulMax, rand);
  return { a: b * answer, b, op, answer };
}

/** Points for a right answer: harder levels and faster answers score more. */
export const pointsFor = (level: number, golden: boolean) => (golden ? 50 : 10) * level;

export const STATS_KEY = 'math-stars';
export type MathStats = { best: number; bestLevel: number };
export const EMPTY_STATS: MathStats = { best: 0, bestLevel: 0 };
