/**
 * Firebase web config for the online quiz.
 *
 * Fill these in from Firebase console → Project settings → Your apps → Web app.
 * These values are not secrets (they identify the project); access is protected
 * by Authentication + the rules in firestore.rules.
 */
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyDyi80bEVQAxP5JYoeCcYgpzp3BBSaz1qk',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'favaidkids.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'favaidkids',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'favaidkids.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '480792539343',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:480792539343:web:552f96e275f6111cc4c7ba',
};

/** For local testing with `firebase emulators:start`. */
export const EMULATOR_HOST = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? '';
