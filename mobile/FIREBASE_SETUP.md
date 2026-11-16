# Firebase setup for online "Bilik Çarxı"

1. Go to https://console.firebase.google.com → **Add project** → name it `gpp` (Google Analytics: off is fine).
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.**
3. **Build → Firestore Database → Create database** → choose a location close to your players (e.g. `europe-west`) → **Start in production mode**.
4. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules` in this folder, and press **Publish**.
5. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app named `gpp` (no hosting).
   Copy the `firebaseConfig` values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
   and send them to Claude — they are not secret; access is protected by the rules above.

## Local testing with the emulator

```
npx firebase-tools emulators:start --project demo-gpp --only auth,firestore
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1 npx expo start --web
```
