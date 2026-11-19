import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { VOICE } from '@/data/voice';

const SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  flip: require('../../assets/sounds/flip.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  skip: require('../../assets/sounds/skip.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  match: require('../../assets/sounds/match.wav'),
  win: require('../../assets/sounds/win.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  'timeup-bell': require('../../assets/sounds/timeup-bell.wav'),
  'timeup-whistle': require('../../assets/sounds/timeup-whistle.wav'),
  'timeup-horn': require('../../assets/sounds/timeup-horn.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

let flags = { music: true, sfx: true, vibration: true };
const players = new Map<SoundName, AudioPlayer>();
let musicPlayer: AudioPlayer | null = null;
let musicWanted = false;
let configured = false;

function configure() {
  if (configured) return;
  configured = true;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
}

export function setSoundFlags(next: typeof flags) {
  flags = next;
  if (!flags.music) musicPlayer?.pause();
  else if (musicWanted) startMusic();
}

/** Plays a short sound effect (if sound effects are on). */
export function playSound(name: SoundName, force = false) {
  if (!flags.sfx && !force) return;
  try {
    configure();
    let p = players.get(name);
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players.set(name, p);
    }
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // Audio is optional; never crash the game.
  }
}

export function startMusic() {
  musicWanted = true;
  if (!flags.music) return;
  try {
    configure();
    if (!musicPlayer) {
      musicPlayer = createAudioPlayer(require('../../assets/sounds/music.mp3'));
      musicPlayer.loop = true;
      musicPlayer.volume = 0.35;
    }
    musicPlayer.play();
  } catch {}
}

export function stopMusic() {
  musicWanted = false;
  try {
    musicPlayer?.pause();
  } catch {}
}

type Buzz = 'light' | 'medium' | 'success' | 'error';

export function vibrate(kind: Buzz = 'light') {
  if (!flags.vibration) return;
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else
      Haptics.impactAsync(
        kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
  } catch {}
}

let speechLang: string | null | undefined;

/** Picks an Azerbaijani voice if the phone has one, otherwise Turkish. */
async function pickSpeechLanguage(): Promise<string | null> {
  if (speechLang !== undefined) return speechLang;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const has = (code: string) => voices.some((v) => v.language?.toLowerCase().startsWith(code));
    speechLang = has('az') ? 'az-AZ' : has('tr') ? 'tr-TR' : 'az-AZ';
  } catch {
    speechLang = 'az-AZ';
  }
  return speechLang;
}

/** Reads text aloud (if sound effects are on). */
export async function speak(text: string) {
  if (!flags.sfx) return;
  const language = await pickSpeechLanguage();
  try {
    Speech.stop();
    Speech.speak(text, { language: language ?? undefined, rate: 0.9 });
  } catch {}
}

let voicePlayer: AudioPlayer | null = null;
const voicePlayers = new Map<string, AudioPlayer>();

/** Stops the phone voice and any recording that is playing. */
export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {}
  try {
    voicePlayer?.pause();
  } catch {}
}

/**
 * Plays the Jawad recording for `key` (see src/data/voice.ts); if there is
 * no recording yet, reads `fallbackText` with the phone's voice instead.
 */
export function sayVoice(key: string, fallbackText: string) {
  if (!flags.sfx) return;
  const source = VOICE[key];
  if (!source) {
    speak(fallbackText);
    return;
  }
  stopSpeaking();
  try {
    configure();
    let p = voicePlayers.get(key);
    if (!p) {
      p = createAudioPlayer(source);
      p.loop = false;
      voicePlayers.set(key, p);
    }
    voicePlayer = p;
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    speak(fallbackText);
  }
}
