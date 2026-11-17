# CLAUDE.md — working rules for this repo

Read this first, then read `PROJECT_STATE.md` (full context, decisions, and where we left off).

## The owner
- Talks to Claude mostly from the **Claude mobile app**; writes short messages in English. Has no computer set up for development, so everything is done in the cloud session and tested on their **Android** phone.
- Keep replies short, plain, and step-by-step. Give exact taps/links when they must do something.
- Use they/them if a pronoun is needed.

## Language & content
- **The app's UI and all game content are in Azerbaijani** (correct letters: ə, ğ, ı, İ, ö, ü, ç, ş). Code, comments and commit messages are in English.
- Use `azUpper()` from `src/lib/az.ts` for upper-casing (JS engines get i → İ / ı → I wrong).
- Islamic content must be **accurate and uncontroversial** (avoid questions where schools of thought differ). Always tell the owner which new content should be reviewed by someone knowledgeable.
- Use ﷺ after the Prophet Muhammad's name.

## Design rules
- Kid-friendly and bright: sky→yellow→pink gradient background (`Screen` component), big rounded cards and chunky buttons, emoji icons.
- Fonts: **Baloo 2** for headings, **Nunito** for body (both verified to contain all Azerbaijani letters — check glyph coverage before adding any other font).
- Colors/fonts come from `src/theme.ts`. Reuse existing components (`Screen`, `BigButton`, `ModalCard`, `controls.tsx`, `GameTopBar`, `WinModal`, `Confetti`, `FlipCard`).
- Do **not** clone existing commercial games (names, art, characters, look). Same *mechanics/genre* is fine, with our own name and design (e.g. "Bilik Çarxı" instead of a Trivia Crack copy).

## Tech rules (Expo SDK 58)
- Expo app lives in `mobile/`. Expo Router, routes in `mobile/src/app/`. Read `mobile/AGENTS.md` too: Expo APIs change every SDK — check the installed package's `.d.ts` instead of trusting memory.
- **Installing packages:** `npx expo install` can't reach Expo's API from this environment. Install the SDK-matched version manually:
  `node -p "require('expo/bundledNativeModules.json')['<pkg>']"` → `npm install <pkg>@<version>`.
- **Native vs OTA:** adding a package with native code (anything in bundledNativeModules that isn't already installed) needs a **new APK build** and a bump of `expo.version` (+ `android.versionCode`) in `app.json` — the runtime policy is `appVersion`, so a version bump keeps OTA updates from reaching an incompatible APK. Pure-JS changes ship as an **OTA update**.
- No `react-native-svg` (not in the installed APK) — draw with Views.
- Wrap audio/haptics/storage calls in try/catch; they must never crash a game.

## Verify before saying "done"
1. `cd mobile && npx tsc --noEmit` (if routes are "not assignable", start the dev server once to regenerate typed routes).
2. Run the web build and click through with Playwright at 390×844:
   `EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081` (add `--clear` if changes don't show up).
3. `EXPO_OFFLINE=1 npx expo export --platform android` must bundle.
4. Play each changed game to its end screen; send the owner screenshots.
Report honestly what was tested in a browser vs. not yet on a real phone.

## Shipping
- Branch: **`claude/mobile-app-android-ios-43dt5i`** — commit and push there only. Don't open PRs unless asked.
- Commit message footer (required):
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: <session link>
  ```
- Expo CLI auth: the Expo token is stored as a network secret for `api.expo.dev`; run EAS with a placeholder: `EXPO_TOKEN=proxy-injected npx eas-cli@latest ...`
- **OTA update** (JS only): `EXPO_TOKEN=proxy-injected npx eas-cli@latest update --branch preview --environment preview --platform android --non-interactive --message "..."`
- **New APK**: `EXPO_TOKEN=proxy-injected npx eas-cli@latest build --platform android --profile preview --non-interactive --no-wait`, then poll `eas-cli build:view <id> --json` in the background and send the owner the `.apk` link.
- Publishing an OTA update changes the owner's installed app — fine within this workflow, but say what was published.
