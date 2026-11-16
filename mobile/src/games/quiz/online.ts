import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore';

import { ensureSignedIn, getDb } from '@/lib/firebase';
import { loadJSON, saveJSON } from '@/lib/storage';

import { joinGame, newGame, type GameDoc } from './engine';

export type Profile = { name: string; avatar: string };
export const AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐨', '🐸', '🐵', '🦄', '🐬', '🦉', '🐢', '🐝'];
const PROFILE_KEY = 'gpp.quiz.profile.v1';

export async function loadProfile(): Promise<Profile> {
  return loadJSON<Profile>(PROFILE_KEY, { name: '', avatar: AVATARS[0] });
}

export async function saveProfile(p: Profile) {
  await saveJSON(PROFILE_KEY, p);
}

const games = () => collection(getDb(), 'games');

export async function createGame(
  profile: Profile,
  opts: { open: boolean; maxRounds: number; timeLimit: number },
): Promise<GameDoc> {
  const uid = await ensureSignedIn();
  const ref = doc(games());
  const game = newGame({ id: ref.id, uid, name: profile.name, avatar: profile.avatar, ...opts });
  await setDoc(ref, game);
  return game;
}

async function join(gameId: string, profile: Profile): Promise<GameDoc> {
  const uid = await ensureSignedIn();
  return runTransaction(getDb(), async (tx) => {
    const ref = doc(games(), gameId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Oyun tapılmadı');
    const g = snap.data() as GameDoc;
    if (g.players.includes(uid)) return g;
    if (g.status !== 'waiting' || g.players.length !== 1) throw new Error('Bu oyun artıq başlayıb');
    const joined = joinGame(g, uid, profile.name, profile.avatar);
    tx.set(ref, joined);
    return joined;
  });
}

/** Join a friend's game with its 6-letter code. */
export async function joinByCode(code: string, profile: Profile): Promise<GameDoc> {
  await ensureSignedIn();
  const q = query(games(), where('code', '==', code.trim().toUpperCase()), where('status', '==', 'waiting'), limit(1));
  const res = await getDocs(q);
  if (res.empty) throw new Error('Bu kodla gözləyən oyun tapılmadı');
  return join(res.docs[0].id, profile);
}

/** Join someone waiting for a random opponent, or open a new game and wait. */
export async function findRandomOpponent(
  profile: Profile,
  opts: { maxRounds: number; timeLimit: number },
): Promise<GameDoc> {
  const uid = await ensureSignedIn();
  const q = query(games(), where('status', '==', 'waiting'), where('open', '==', true), limit(20));
  const res = await getDocs(q);
  const candidates = res.docs.map((d) => d.data() as GameDoc).filter((g) => !g.players.includes(uid));
  for (const g of candidates) {
    try {
      return await join(g.id, profile);
    } catch {
      // Someone else joined first — try the next one.
    }
  }
  const mine = res.docs.map((d) => d.data() as GameDoc).find((g) => g.players.includes(uid));
  if (mine) return mine;
  return createGame(profile, { open: true, ...opts });
}

export function watchGame(id: string, onChange: (g: GameDoc | null) => void) {
  return onSnapshot(
    doc(games(), id),
    (snap) => onChange(snap.exists() ? (snap.data() as GameDoc) : null),
    () => onChange(null),
  );
}

export function watchMyGames(uid: string, onChange: (list: GameDoc[]) => void) {
  return onSnapshot(
    query(games(), where('players', 'array-contains', uid)),
    (snap) =>
      onChange(snap.docs.map((d) => d.data() as GameDoc).sort((a, b) => b.updatedAt - a.updatedAt)),
    () => onChange([]),
  );
}

/** Saves the game, but only if it is still this player's turn (protects against double moves). */
export async function saveMove(next: GameDoc, uid: string) {
  await runTransaction(getDb(), async (tx) => {
    const ref = doc(games(), next.id);
    const snap = await tx.get(ref);
    const current = snap.data() as GameDoc | undefined;
    if (!current || current.turn !== uid || current.status !== 'active') {
      throw new Error('Növbə sənin deyil');
    }
    tx.set(ref, next);
  });
}

/** Give up a game (the other player wins). */
export async function resign(game: GameDoc, uid: string) {
  await runTransaction(getDb(), async (tx) => {
    const ref = doc(games(), game.id);
    const snap = await tx.get(ref);
    const g = snap.data() as GameDoc;
    if (!g || g.status === 'finished') return;
    const winner = g.players.find((p) => p !== uid) ?? null;
    tx.set(ref, {
      ...g,
      status: 'finished',
      winner,
      lastEvent: `${g.names[uid] ?? 'Oyunçu'} oyunu tərk etdi`,
      updatedAt: Date.now(),
    });
  });
}
