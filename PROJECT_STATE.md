# PROJECT_STATE.md — GPP mobile app: everything so far

_Last updated: 2026-11-17. Read `CLAUDE.md` first for the working rules._

## 1. What we are building
A **platform-style mobile app (Android + iOS)** in **Azerbaijani**, made of **sections**. The first section is **"Uşaqlar" (Children)** with Islamic/educational games. More sections will come later; a **backend** is planned for the future (Firebase is already used for the online quiz and can grow into it).

## 2. Repository & accounts
| Thing | Value |
|---|---|
| GitHub repo | `MaharramSafarli/GPP` (also contains an unrelated old Java/Selenium test project in `src/`, `pom.xml` — leave it alone) |
| Working branch | `claude/mobile-app-android-ios-43dt5i` |
| App folder | `mobile/` |
| Expo account / project | `maharram95` / `@maharram95/gpp` — https://expo.dev/accounts/maharram95/projects/gpp |
| Expo project ID | `1c3f7869-e73f-49f2-bc3f-c79f0b72ce37` |
| App name / IDs | "GPP", Android package & iOS bundle `com.maharram95.gpp` |
| Signing key | Android keystore generated & stored by Expo (keep it there; updates must be signed with it) |
| Firebase project | `favaidkids` (config in `mobile/src/lib/firebase/config.ts`; Anonymous auth enabled; Firestore rules from `mobile/firestore.rules` published) |
| Cloud environment | Claude cloud env **"GPP"** (personal): allows Expo + Google storage hosts; Expo token saved as network secret for `api.expo.dev` |

## 3. Tech stack
Expo **SDK 58**, React Native 0.88, React 19.3, **Expo Router** (file routes in `mobile/src/app/`), TypeScript.
Packages added by us: expo-keep-awake, expo-haptics, expo-linear-gradient, expo-audio, expo-speech, @react-native-async-storage/async-storage, @react-native-community/slider, @expo-google-fonts/baloo-2, @expo-google-fonts/nunito, firebase (JS SDK 13), expo-updates.

## 4. Releases (what's on the owner's phone)
| Version | How | Notes |
|---|---|---|
| APK 1.0.0 (versionCode 1) | EAS build | first build; superseded |
| **APK 1.1.0 (versionCode 2)** | EAS build | **installed now**. Download: https://expo.dev/artifacts/eas/achVwJbBh8J2HDzkIJSi1N5xhrLZ9lOoRS8vavwJ3Tk.apk |
| OTA updates on `preview` channel/branch, runtime 1.1.0 | `eas update` | latest: "Bilik Çarxı online play (Firebase favaidkids)", commit 33b3bed |

- `eas.json`: profile **preview** = APK, internal distribution, channel `preview`; profile **production** = channel `production` (not used yet).
- `runtimeVersion.policy = appVersion` → bump `expo.version` whenever native modules change.
- **Expo Go does not work** for this project (the phone got "Failed to download remote update"; not fully diagnosed — `assets.eascdn.net` couldn't be tested from here because the owner declined adding that host). We switched to installing APKs instead. Don't go back to Expo Go.

## 5. App structure (`mobile/src/`)
```
app/                         routes (Expo Router)
  _layout.tsx                fonts, SettingsProvider, Stack (headers in Azerbaijani)
  index.tsx                  Home: "Salam!" + sections list
  children/index.tsx         Games list (from data/catalog.ts)
  children/explain-it/       index (menu), setup (teams/mode/topics), play (game)
  children/quiz/             index (lobby), [id] (game; id "solo" = practice)
  children/memory/           index (levels), [level] (learn → match)
  children/crossword/index.tsx
  children/word-search/index.tsx
components/                  Screen, BigButton, Tile, ModalCard, controls (SliderRow, ToggleRow,
                             Segmented, RoundButton, IconToggle), Confetti, FlipCard, GameTopBar,
                             WinModal, explain-settings, quiz/{wheel, question-card, player-board}
data/                        catalog.ts (sections & games), explain-it-words.ts, memory-levels.ts,
                             islamic-terms.ts, quiz-questions.ts
games/                       pure logic: quiz/engine.ts + quiz/online.ts, crossword/generate.ts,
                             word-search/generate.ts, explain-it/{shuffle,teams}.ts
lib/                         settings.tsx (saved settings context), sound.ts (effects, music, haptics,
                             speech), storage.ts (AsyncStorage JSON), az.ts (azUpper, alphabet),
                             firebase/ (config, init, anonymous sign-in; auth.native.ts uses RN persistence)
theme.ts                     colors + fonts
assets/sounds/               synthesized WAV effects + music.mp3 (made by a Python script, no copyright issues)
```
Other files in `mobile/`: `firebase.json` + `firestore.rules` (rules source of truth), `FIREBASE_SETUP.md`, `eas.json`, `app.json`.

## 6. The games (all Azerbaijani)
1. **İzah et!** (word explaining game, inspired by a Turkish "Anlat Bakalım" video the owner sent — our own design)
   - 200 cards × 5 forbidden words: 50 sadə, 100 ümumi, 20 səhabə, 10 peyğəmbər, 20 islami termin (`explain-it-words.ts`).
   - Menu → Ayarlar (round time 30–180 s, mode **Xal hədəfi** or **Raund sayı**, target score, round count, pass limit 0–10, music/sfx/vibration, time-up sound: Zəng/Fit/Fanfar) → Setup (2 team names with VS, mode, topic chips) → Play.
   - Play: team scoreboard, circular timer (ticks last 5 s), buttons **Qadağan (−1, min 0) / Pas (n) / Düzdür (+1)**, pause menu (music/sound/vibration toggles, Davam et, Ana səhifə), auto-pause on Android back / app background, turn summary, winner screen with confetti. Two teams on **one phone** (by design for this game).
2. **Bilik Çarxı** (Islamic trivia — same *genre* as Trivia Crack, our own name/design; owner asked for "exactly the same", we explained we can't copy it)
   - 150 questions, 6 categories × 25: Quran, Peyğəmbərlər, Səhabələr, İbadət, İslam tarixi, Əxlaq və ədəb (`quiz-questions.ts`; correct answer is written first, options shuffled at runtime; ids are `<category>-<index>` → **append new questions at the end** of a category).
   - Wheel: 6 categories + ⭐. Correct answer → spin again; 3 correct (METER_MAX) or ⭐ → choose a category → badge question → badge. 6 badges wins; otherwise after max rounds most badges, then most correct, else draw. Wrong answer → opponent's turn.
   - Helpers per player per game: 50:50 ×2, +15 s ×2, skip ×2. Settings: answer time 15/20/30/45, rounds 10/15/25.
   - **Online multiplayer, each player on their own phone** (owner's explicit requirement): Firebase anonymous sign-in + Firestore `games` collection, one document per game (`GameDoc` in `engine.ts`). Play a friend by 6-char code (Share button), random opponent (open waiting games), live updates (onSnapshot), turn-checked saves (transaction), resign with confirm, "Oyunlarım" list. Practice mode: solo, 3 lives, local best score.
   - Tested: emulator + real `favaidkids` project, full 2-player game in the real screens, rules block outsiders.
3. **Kartları tap** (card matching, from the owner's second video) — 6 levels: İslam (5 pillars), İman (6 pillars), Heyvanlar, Həşəratlar, Sünnə yeməkləri, Peyğəmbər hekayələri (`memory-levels.ts`). Learn phase (tap glowing card, explanation shown + read aloud by phone TTS: az-AZ, falls back to tr-TR) → match phase (timer, flips, confetti, stars, Afərin modal). Cards use emoji (no illustrations).
4. **Krossvord** — generated from 168 Islamic terms (`islamic-terms.ts`), 9 words, one given letter per word, Azerbaijani on-screen keyboard, hint button, word bank, new puzzle.
5. **Söz tap** (word search) — 10×10, 8 words (→, ↓, ↘, ↗), drag or tap first+last letter, colored found words.
6. **Şəkli rənglə** (coloring, from the owner's screenshot) — `children/coloring/`:
   - **Rəqəmlə rənglə** (color by number): pixel-art grids in `data/coloring-numbers.ts` — Məscidül-Həram, Məscidün-Nəbəvi, Məscidül-Əqsa (drawn as the grey-domed Qibli mosque, not the golden Dome of the Rock). Pick a number, tap/drag cells; only the matching number paints; auto-advances to the next color; progress saved.
   - **Sərbəst rənglə** (free): 8 pictures built from View shapes (`data/coloring-pictures.ts`, 100×120 canvas; kinds rect/circle/dome/triangle, `link` used to cut crescents) — Məscid, Kəbə, Ay və ulduzlar, Fənərlər, Xurma ağacı, Uşaqlar məsciddə (boy with cap, girl in hijab), Təbiət, Qurani-Kərim. Tap-to-fill, 18 colors, undo, clear. No animals (owner's rule).
   - **Line-drawing pictures** (owner-supplied images): `mobile/scripts/make-coloring-bitmap.py <id> <image>` splits the drawing into areas (scipy) → `assets/coloring/<id>/line.png` + one white mask PNG per area (tinted with `tintColor` when filled) + `src/data/coloring-bitmaps/<id>.ts` (positions + RLE tap map). Tiny neighbouring areas are grouped. Rendered by `components/coloring/bitmap-canvas.tsx`; 🔍 zoom button. First one: "Əlhəmdulillah" (source in `assets/coloring/source/`). To add another: run the script, add an entry to `FREE_PICTURES` with `bitmap`.
   - Saved work (AsyncStorage) shows as thumbnails in the menu = in-app gallery. Saving to the phone's photo gallery would need expo-media-library + react-native-view-shot (new APK) — not done.
7. **Şarları partlat** (bubble-shooter genre, own design, **no panda/characters**) — `games/balloons/engine.ts` (hex grid 9/8 cols × 13 rows, snap, groups ≥3 pop, floating ones drop, a new row pushes in after N non-popping shots) + `children/balloons/index.tsx`. Every level is randomly generated (5 layout patterns), difficulty grows with level (rows, colors, fewer shots per drop). Drag to aim (dotted guide with wall bounces), release to shoot, tap the small balloon to swap. Level saved in AsyncStorage `balloons`.

8. **Söz ustası** (word guessing from a clue — same *genre* as the owner's "Bul Bakalım" screenshots, our own name/design) — `children/word-guess/` (start page with rules + stats, `play.tsx`), logic in `games/word-guess/engine.ts`, words in `data/word-guess-words.ts` (105 words, 3–9 letters, Islamic + everyday, `islamic: true` marks religious ones). 11 words per game (2×3, 2×4, 2×5, 2×6, 7, 8, 9 letters), 60 s each, 100 points per letter; 💡 hint reveals a random letter (−100 from the prize, at least one letter stays hidden); correct → remaining prize; pass/time-up → minus 100 per hint taken; wrong answer → boxes shake and clear, try again. Typing via `components/az-keyboard.tsx` (all 32 letters). 🔈 reads the clue (expo-speech). Voice answers (microphone) not done — needs a speech-recognition native module (new APK). Stats in AsyncStorage `word-guess`.
9. **Hərf dairəsi** (letter-ring quiz — same *genre* as the owner's "Harf Çemberi" screenshots, our own name/design) — `children/letter-ring/` (start page + `play.tsx`), logic `games/letter-ring/engine.ts`, clues `data/letter-ring-clues.ts` (104 clues, 2–4 per letter for all 32 letters; Ğ and some I clues use `mode: 'contains'`; `alt` = accepted spellings; `islamic: true` marks religious ones). Ring of 32 letters drawn with Views, 5 minutes total, 100 points per correct answer; wrong = red (no retry), pass = grey and comes back after the ring, until time runs out. Typed answers only (owner: no voice answers); answers compared upper-cased with spaces/punctuation ignored. Stats in AsyncStorage `letter-ring`.

10. **Dualar** section (not a game; home screen tile above "🎮 Oyunlar") — `app/duas/index.tsx` (grid) + `app/duas/[id].tsx` (picture card, when to say it, virtue note, Arabic / transliteration / meaning per part, source, prev/next). Data in `data/duas.ts`: 16 duas copied from the owner's screenshots of a dua book (wake up, dressing, new clothes, undressing, toilet in/out, leave/enter home, start/end eating, sneezing, anger, surprise, fear, rain, wind). Pictures are emoji scenes (`components/dua-scene.tsx`). Arabic uses the phone's system font (no custom font). **Audio:** owner will send recordings later → put files in `assets/sounds/duas/` and add `'<dua id>-<part index>': require(...)` to `data/dua-audio.ts`; parts without audio show "Səs tezliklə" (`components/dua-audio-button.tsx`, expo-audio, OTA-safe).

## 7. Key decisions & why
- **Expo / React Native** — one codebase for Android + iOS; cloud builds (EAS) because the owner has no Mac/PC setup.
- **APK + OTA instead of Expo Go** — Expo Go failed on the phone; APK is reliable; OTA keeps small updates instant.
- **Azerbaijani-first**, kid-friendly bright design, Baloo 2 + Nunito (glyph-checked; Fredoka rejected — missing ə/ğ/ş).
- **Firebase** for online play — no own server needed yet, free tier, pure-JS SDK (no new APK), can become the future backend. Anonymous auth = no sign-up friction (trade-off: reinstall loses games).
- **Synthesized sounds** — no licensing issues; can be replaced with real recordings later.
- **No commercial clones** — mechanics yes, names/art/look no.
- Emoji instead of illustrations — no image assets/licensing; could be replaced with real art later.

## 8. Where we left off / next steps
0. Coloring + balloon games added (OTA). 2026-11-18: owner asked to keep only their uploaded drawing in coloring — the color-by-number masjids and the 8 shape pictures were removed (restore from git commit 476a756 if wanted; the shape renderer is kept). The app now opens straight on the games list (`app/index.tsx` uses `GAMES` from catalog; `/children` redirects to `/`; home buttons go to `/`). Routes still live under `children/`.
   - Owner wants **iOS too** and **store publishing**: needs Apple Developer Program ($99/yr) and Google Play Console ($25 once); then `eas build --profile production` + `eas submit`. Not started.
1. **⚠️ Waiting on the owner: "resolution / overflow issues"** on their phone in the 1.1.0 games. They said they'll send screenshots; fix them first. (Likely suspects: fixed font sizes on small screens, crossword grid/keyboard width, İzah et! card on short screens, word-search grid height, team names in scoreboard.)
2. Owner should test **Bilik Çarxı online** with a friend (friend installs the same APK).
3. Ideas offered, not yet requested: "your turn" **push notifications** (needs expo-notifications + Cloud Function + new APK), **duel/challenge mode** in Bilik Çarxı, treat leaving mid-question as a wrong answer, proper accounts, real voice recordings / illustrations, more sections.
4. Content review by a knowledgeable person: `explain-it-words.ts`, `memory-levels.ts`, `quiz-questions.ts`, `islamic-terms.ts`.
5. Test games left in Firestore by our tests (marked finished) — owner may delete them.

## 9. Useful commands (from `mobile/`)
```
npx tsc --noEmit
EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081 [--clear]
EXPO_OFFLINE=1 npx expo export --platform android --output-dir <scratch>
# local Firebase emulator (needs firebase-tools; Java 21 is installed):
npx firebase-tools emulators:start --project demo-gpp --only auth,firestore
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1 EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081 --clear
```
Playwright is pre-installed in the cloud container (`require('playwright')`); test at 390×844. For two online players use two browser contexts (separate storage = separate anonymous users).
