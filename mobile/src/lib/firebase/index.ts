import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, signInAnonymously, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

import { makeAuth } from './auth';
import { EMULATOR_HOST, FIREBASE_CONFIG } from './config';

/** True when Firebase settings are present (or a local emulator is configured). */
export const ONLINE_AVAILABLE = Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) || Boolean(EMULATOR_HOST);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function init() {
  if (app) return;
  const config = EMULATOR_HOST
    ? { apiKey: 'demo-key', projectId: 'demo-gpp', authDomain: 'demo-gpp.firebaseapp.com' }
    : FIREBASE_CONFIG;
  app = getApps()[0] ?? initializeApp(config);
  auth = makeAuth(app);
  db = getFirestore(app);
  if (EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
  }
}

export function getDb(): Firestore {
  init();
  return db!;
}

let uidPromise: Promise<string> | null = null;

/** Signs in anonymously (once per device) and returns the user id. */
export function ensureSignedIn(): Promise<string> {
  init();
  if (!uidPromise) {
    uidPromise = (async () => {
      // Wait for a saved session first, so the same player keeps the same id.
      await auth!.authStateReady();
      if (auth!.currentUser) return auth!.currentUser.uid;
      const cred = await signInAnonymously(auth!);
      return cred.user.uid;
    })().catch((e) => {
      uidPromise = null;
      throw e;
    });
  }
  return uidPromise;
}
