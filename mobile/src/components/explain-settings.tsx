import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Segmented, SliderRow, ToggleRow } from '@/components/controls';
import { ModalCard } from '@/components/modal-card';
import { TIME_UP_SOUNDS, useSettings, type Settings } from '@/lib/settings';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export const MODE_OPTIONS = [
  { id: 'score' as const, label: 'Xal hədəfi' },
  { id: 'rounds' as const, label: 'Raund sayı' },
];

export const MODE_HELP = {
  score: 'Qalibiyyət xalına ilk çatan komanda qalib gəlir.',
  rounds: 'Raundlar bitəndə ən çox xal toplayan komanda qalib gəlir.',
};

/** "Oyun ayarları" pop-up for İzah et! */
export function ExplainSettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { settings, update } = useSettings();
  const [draft, setDraft] = useState<Settings>(settings);

  useEffect(() => {
    if (visible) setDraft(settings);
  }, [visible, settings]);

  const set = (patch: Partial<Settings>) => setDraft((d) => ({ ...d, ...patch }));

  const soundIndex = TIME_UP_SOUNDS.findIndex((s) => s.id === draft.timeUpSound);
  const nextSound = () => {
    const next = TIME_UP_SOUNDS[(soundIndex + 1) % TIME_UP_SOUNDS.length];
    set({ timeUpSound: next.id });
    playSound(next.id, true);
  };

  return (
    <ModalCard visible={visible} icon="⚙️" title="Oyun ayarları" onRequestClose={onClose}>
      <SliderRow
        icon="⏱️"
        label="Oyun müddəti"
        value={draft.roundSeconds}
        unit=" san"
        min={30}
        max={180}
        step={5}
        onChange={(v) => set({ roundSeconds: v })}
      />

      <Text style={styles.label}>🎯 Oyun rejimi</Text>
      <Segmented options={MODE_OPTIONS} value={draft.mode} onChange={(mode) => set({ mode })} />
      <Text style={styles.help}>{MODE_HELP[draft.mode]}</Text>

      {draft.mode === 'score' ? (
        <SliderRow
          icon="🏆"
          label="Qalibiyyət xalı"
          value={draft.targetScore}
          min={5}
          max={50}
          onChange={(v) => set({ targetScore: v })}
        />
      ) : (
        <SliderRow
          icon="🔁"
          label="Raund sayı"
          value={draft.roundCount}
          min={1}
          max={10}
          onChange={(v) => set({ roundCount: v })}
        />
      )}

      <SliderRow
        icon="⏭️"
        label="Pas haqqı"
        value={draft.passLimit}
        min={0}
        max={10}
        onChange={(v) => set({ passLimit: v })}
      />

      <ToggleRow icon="🎵" label="Fon musiqisi" value={draft.music} onChange={(music) => set({ music })} />
      <ToggleRow icon="🔊" label="Səs effektləri" value={draft.sfx} onChange={(sfx) => set({ sfx })} />
      <ToggleRow
        icon="📳"
        label="Vibrasiya"
        value={draft.vibration}
        onChange={(vibration) => set({ vibration })}
      />

      <Text style={styles.label}>⏰ Vaxt bitmə səsi</Text>
      <Pressable accessibilityRole="button" onPress={nextSound} style={styles.soundPicker}>
        <Text style={styles.soundText}>{TIME_UP_SOUNDS[Math.max(0, soundIndex)].label}</Text>
        <Text style={styles.soundHint}>dəyiş ▸</Text>
      </Pressable>

      <View style={styles.buttons}>
        <BigButton label="Ləğv et" color={colors.muted} onPress={onClose} flex />
        <BigButton
          label="Saxla"
          color={colors.skip}
          onPress={() => {
            update(draft);
            playSound('correct', true);
            onClose();
          }}
          flex
        />
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  help: { fontSize: 14, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  soundPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1EEFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  soundText: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  soundHint: { fontSize: 15, fontFamily: fonts.bold, color: colors.primary },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 4 },
});
