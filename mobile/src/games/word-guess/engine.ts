import { GUESS_WORDS, type GuessWord } from '@/data/word-guess-words';
import { toLetters } from '@/lib/az';

/** Word lengths of one game, in order (11 questions). */
export const SCHEDULE = [3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 9];
export const SECONDS_PER_WORD = 60;
export const POINTS_PER_LETTER = 100;

export type Question = GuessWord & { letters: string[] };

/** Picks a fresh random set of words following SCHEDULE. */
export function pickQuestions(rand: () => number = Math.random): Question[] {
  const used = new Set<string>();
  return SCHEDULE.map((len) => {
    const pool = GUESS_WORDS.filter((w) => toLetters(w.word).length === len && !used.has(w.word));
    const w = pool[Math.floor(rand() * pool.length)];
    used.add(w.word);
    return { ...w, letters: toLetters(w.word) };
  });
}

/** What a correct answer is worth after `hints` revealed letters. */
export const prizeFor = (len: number, hints: number) => (len - hints) * POINTS_PER_LETTER;

/** Points lost when the word is passed or time runs out: the revealed letters' cost. */
export const penaltyFor = (hints: number) => hints * POINTS_PER_LETTER;

/** A random position not yet revealed, or -1. At least one letter always stays hidden. */
export function hintPosition(len: number, revealed: Set<number>, rand: () => number = Math.random): number {
  const free = Array.from({ length: len }, (_, i) => i).filter((i) => !revealed.has(i));
  if (free.length <= 1) return -1;
  return free[Math.floor(rand() * free.length)];
}

export type Outcome = 'correct' | 'pass' | 'timeout';
export type RoundResult = { word: string; len: number; outcome: Outcome; points: number; hints: number };

/** Saved totals shown on the game's start page. */
export const STATS_KEY = 'word-guess';
export type WordGuessStats = { best: number; played: number; correct: number; answered: number };
export const EMPTY_STATS: WordGuessStats = { best: 0, played: 0, correct: 0, answered: 0 };
