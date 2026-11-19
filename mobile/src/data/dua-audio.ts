import type { AudioSource } from 'expo-audio';

/**
 * Recordings for the duas, keyed `<dua id>-<part index>` (part index starts at 0),
 * e.g. 'rain-0': require('../../assets/sounds/duas/rain-0.mp3').
 * Duas without a recording show "Səs tezliklə" instead of a play button.
 */
export const DUA_AUDIO: Record<string, AudioSource> = {};
