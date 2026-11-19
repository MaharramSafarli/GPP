import { RING_CLUES, type RingClue } from '@/data/letter-ring-clues';
import { AZ_ALPHABET, azUpper } from '@/lib/az';

export const TOTAL_SECONDS = 5 * 60;
export const POINTS = 100;

export type Status = 'open' | 'passed' | 'correct' | 'wrong';
export type Slot = { letter: string; clue: RingClue; status: Status; given?: string };

/** Upper case, letters only (spaces, hyphens and punctuation ignored). */
export function normalize(text: string): string {
  return azUpper(text).replace(/[^A-ZÇƏĞIİÖŞÜ]/g, '');
}

/** One random clue per letter of the alphabet, never the same answer twice. */
export function makeRing(rand: () => number = Math.random): Slot[] {
  const used = new Set<string>();
  return AZ_ALPHABET.map((letter) => {
    const pool = RING_CLUES.filter((c) => c.letter === letter && !used.has(normalize(c.answer)));
    const clue = pool[Math.floor(rand() * pool.length)];
    used.add(normalize(clue.answer));
    return { letter, clue, status: 'open' as Status };
  });
}

export function isCorrect(clue: RingClue, given: string): boolean {
  const g = normalize(given);
  return !!g && [clue.answer, ...(clue.alt ?? [])].some((a) => normalize(a) === g);
}

/** Next slot to ask after `from`: open or passed letters, going round the ring. -1 = none left. */
export function nextSlot(slots: Slot[], from: number): number {
  for (let k = 1; k <= slots.length; k++) {
    const i = (from + k) % slots.length;
    if (slots[i].status === 'open' || slots[i].status === 'passed') return i;
  }
  return -1;
}

export const STATS_KEY = 'letter-ring';
export type RingStats = { best: number; played: number };
export const EMPTY_STATS: RingStats = { best: 0, played: 0 };
