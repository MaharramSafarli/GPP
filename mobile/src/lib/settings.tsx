import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { setSoundFlags } from '@/lib/sound';
import { loadJSON, saveJSON } from '@/lib/storage';

export type TimeUpSound = 'timeup-bell' | 'timeup-whistle' | 'timeup-horn';

export const TIME_UP_SOUNDS: { id: TimeUpSound; label: string }[] = [
  { id: 'timeup-bell', label: 'Zəng 🔔' },
  { id: 'timeup-whistle', label: 'Fit 📣' },
  { id: 'timeup-horn', label: 'Fanfar 🎺' },
];

export type GameMode = 'score' | 'rounds';

export type Settings = {
  /** Global */
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  /** İzah et! */
  roundSeconds: number;
  mode: GameMode;
  targetScore: number;
  roundCount: number;
  passLimit: number;
  timeUpSound: TimeUpSound;
  /** Bilik Çarxı */
  quizSeconds: number;
  quizRounds: number;
};

export const DEFAULT_SETTINGS: Settings = {
  music: true,
  sfx: true,
  vibration: true,
  roundSeconds: 60,
  mode: 'score',
  targetScore: 20,
  roundCount: 3,
  passLimit: 3,
  timeUpSound: 'timeup-bell',
  quizSeconds: 30,
  quizRounds: 15,
};

const KEY = 'gpp.settings.v1';

type Ctx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<Ctx>({ settings: DEFAULT_SETTINGS, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    loadJSON(KEY, DEFAULT_SETTINGS).then(setSettings);
  }, []);

  useEffect(() => {
    setSoundFlags({ music: settings.music, sfx: settings.sfx, vibration: settings.vibration });
  }, [settings.music, settings.sfx, settings.vibration]);

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(KEY, next);
      return next;
    });

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
