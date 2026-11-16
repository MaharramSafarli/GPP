import { QUIZ_CATEGORIES, QUIZ_QUESTIONS, type QuizCategoryId, type QuizQuestion } from '@/data/quiz-questions';
import { shuffle } from '@/games/explain-it/shuffle';

/** The wheel: six categories plus the ⭐ "badge" slice. */
export type Slice = QuizCategoryId | 'star';
export const WHEEL: Slice[] = ['quran', 'prophets', 'star', 'sahabe', 'ibadet', 'tarix', 'exlaq'];

/** Correct answers needed to fill the progress bar and earn a badge question. */
export const METER_MAX = 3;

export type Helpers = { fifty: number; time: number; skip: number };
export const START_HELPERS: Helpers = { fifty: 2, time: 2, skip: 2 };

export type GameStatus = 'waiting' | 'active' | 'finished';

/** One game, stored as a single Firestore document (or in memory for solo play). */
export type GameDoc = {
  id: string;
  code: string;
  status: GameStatus;
  /** true = anyone can join through "random opponent" */
  open: boolean;
  players: string[];
  names: Record<string, string>;
  avatars: Record<string, string>;
  turn: string;
  round: number;
  maxRounds: number;
  timeLimit: number;
  badges: Record<string, QuizCategoryId[]>;
  meter: Record<string, number>;
  correct: Record<string, number>;
  answered: Record<string, number>;
  helpers: Record<string, Helpers>;
  used: string[];
  winner: string | null; // uid, 'draw' or null
  lastEvent: string;
  createdAt: number;
  updatedAt: number;
  /** solo practice only */
  lives?: number;
};

export const categoryOf = (id: QuizCategoryId) => QUIZ_CATEGORIES.find((c) => c.id === id)!;

export function emptyPlayerState(game: GameDoc, uid: string, name: string, avatar: string): GameDoc {
  return {
    ...game,
    names: { ...game.names, [uid]: name },
    avatars: { ...game.avatars, [uid]: avatar },
    badges: { ...game.badges, [uid]: [] },
    meter: { ...game.meter, [uid]: 0 },
    correct: { ...game.correct, [uid]: 0 },
    answered: { ...game.answered, [uid]: 0 },
    helpers: { ...game.helpers, [uid]: { ...START_HELPERS } },
  };
}

export function newGame(opts: {
  id: string;
  uid: string;
  name: string;
  avatar: string;
  open: boolean;
  maxRounds: number;
  timeLimit: number;
}): GameDoc {
  const now = Date.now();
  const base: GameDoc = {
    id: opts.id,
    code: makeCode(),
    status: 'waiting',
    open: opts.open,
    players: [opts.uid],
    names: {},
    avatars: {},
    turn: opts.uid,
    round: 1,
    maxRounds: opts.maxRounds,
    timeLimit: opts.timeLimit,
    badges: {},
    meter: {},
    correct: {},
    answered: {},
    helpers: {},
    used: [],
    winner: null,
    lastEvent: 'Oyun yaradıldı',
    createdAt: now,
    updatedAt: now,
  };
  return emptyPlayerState(base, opts.uid, opts.name, opts.avatar);
}

/** Second player joins; a random player starts. */
export function joinGame(game: GameDoc, uid: string, name: string, avatar: string): GameDoc {
  const g = emptyPlayerState(game, uid, name, avatar);
  const players = [game.players[0], uid];
  return {
    ...g,
    players,
    status: 'active',
    open: false,
    turn: players[Math.random() < 0.5 ? 0 : 1],
    lastEvent: `${name} oyuna qoşuldu`,
    updatedAt: Date.now(),
  };
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makeCode() {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
}

export function spinWheel(): { index: number; slice: Slice } {
  const index = Math.floor(Math.random() * WHEEL.length);
  return { index, slice: WHEEL[index] };
}

/** A question from `category` that hasn't been used in this game yet (reuses if all are used). */
export function pickQuestion(category: QuizCategoryId, used: string[]): QuizQuestion {
  const pool = QUIZ_QUESTIONS.filter((q) => q.category === category);
  const fresh = pool.filter((q) => !used.includes(q.id));
  const from = fresh.length ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)];
}

/** Shuffled answer options; returns them with the index of the correct one. */
export function shuffledOptions(q: QuizQuestion) {
  const order = shuffle([0, 1, 2, 3]);
  return { options: order.map((i) => q.options[i]), correctIndex: order.indexOf(0) };
}

export const otherPlayer = (g: GameDoc, uid: string) => g.players.find((p) => p !== uid) ?? uid;

export type AnswerKind = 'normal' | 'badge';

export type AnswerResult = {
  game: GameDoc;
  /** What should happen next for the current player. */
  next: 'spin' | 'chooseBadge' | 'turnOver' | 'gameOver';
};

/** Applies one answer and returns the updated game. */
export function applyAnswer(
  game: GameDoc,
  uid: string,
  q: QuizQuestion,
  correct: boolean,
  kind: AnswerKind,
  badgeCategory?: QuizCategoryId,
): AnswerResult {
  const solo = game.players.length === 1;
  const g: GameDoc = {
    ...game,
    used: game.used.includes(q.id) ? game.used : [...game.used, q.id],
    answered: { ...game.answered, [uid]: (game.answered[uid] ?? 0) + 1 },
    updatedAt: Date.now(),
  };
  const name = g.names[uid] ?? 'Oyunçu';

  if (correct) {
    g.correct = { ...g.correct, [uid]: (g.correct[uid] ?? 0) + 1 };
    if (kind === 'badge' && badgeCategory) {
      const mine = g.badges[uid] ?? [];
      g.badges = { ...g.badges, [uid]: mine.includes(badgeCategory) ? mine : [...mine, badgeCategory] };
      g.meter = { ...g.meter, [uid]: 0 };
      g.lastEvent = `${name} ${categoryOf(badgeCategory).title} nişanını qazandı! 🏅`;
      if (g.badges[uid].length >= QUIZ_CATEGORIES.length) {
        return { game: { ...g, status: 'finished', winner: uid, lastEvent: `${name} bütün nişanları topladı! 🏆` }, next: 'gameOver' };
      }
      return { game: g, next: 'spin' };
    }
    const meter = (g.meter[uid] ?? 0) + 1;
    if (meter >= METER_MAX) {
      g.meter = { ...g.meter, [uid]: 0 };
      return { game: g, next: 'chooseBadge' };
    }
    g.meter = { ...g.meter, [uid]: meter };
    return { game: g, next: 'spin' };
  }

  // Wrong answer.
  if (solo) {
    const lives = (g.lives ?? 3) - 1;
    if (lives <= 0) return { game: { ...g, lives: 0, status: 'finished', winner: null }, next: 'gameOver' };
    return { game: { ...g, lives }, next: 'spin' };
  }
  return passTurn(g, uid, `${name} səhv cavab verdi`);
}

/** Ends the current player's turn; finishes the game when the round limit is reached. */
export function passTurn(game: GameDoc, uid: string, event: string): AnswerResult {
  const next = otherPlayer(game, uid);
  const newRound = next === game.players[0] ? game.round + 1 : game.round;
  const g: GameDoc = { ...game, turn: next, round: newRound, lastEvent: event, updatedAt: Date.now() };
  if (newRound > game.maxRounds) return { game: finishByScore(g), next: 'gameOver' };
  return { game: g, next: 'turnOver' };
}

/** Most badges wins; tie → most correct answers; still tied → draw. */
export function finishByScore(game: GameDoc): GameDoc {
  const [a, b] = game.players;
  const score = (u: string) => (game.badges[u]?.length ?? 0) * 1000 + (game.correct[u] ?? 0);
  const winner = score(a) === score(b) ? 'draw' : score(a) > score(b) ? a : b;
  return {
    ...game,
    round: game.maxRounds,
    status: 'finished',
    winner,
    lastEvent: winner === 'draw' ? 'Oyun bərabərliklə bitdi' : `${game.names[winner]} qalib gəldi! 🏆`,
  };
}

export function spendHelper(game: GameDoc, uid: string, helper: keyof Helpers): GameDoc {
  const h = game.helpers[uid] ?? START_HELPERS;
  if (h[helper] <= 0) return game;
  return { ...game, helpers: { ...game.helpers, [uid]: { ...h, [helper]: h[helper] - 1 } } };
}

export function newSoloGame(name: string, avatar: string, timeLimit: number): GameDoc {
  return { ...newGame({ id: 'solo', uid: 'me', name, avatar, open: false, maxRounds: 999, timeLimit }), status: 'active', lives: 3 };
}
