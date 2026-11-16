import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Segmented, SliderRow } from '@/components/controls';
import { MODE_HELP, MODE_OPTIONS } from '@/components/explain-settings';
import { Screen } from '@/components/screen';
import { CATEGORIES, EXPLAIN_IT_WORDS, type CategoryId } from '@/data/explain-it-words';
import { TEAM_COLORS, TEAM_EMOJI } from '@/games/explain-it/teams';
import { useSettings } from '@/lib/settings';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function ExplainItSetup() {
  const { settings, update } = useSettings();
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [selected, setSelected] = useState<CategoryId[]>(CATEGORIES.map((c) => c.id));

  const toggle = (id: CategoryId) => {
    playSound('tap');
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const wordCount = EXPLAIN_IT_WORDS.filter((w) => selected.includes(w.category)).length;

  const start = () => {
    playSound('tap');
    router.replace({
      pathname: '/children/explain-it/play',
      params: {
        teamA: teamA.trim() || 'Komanda 1',
        teamB: teamB.trim() || 'Komanda 2',
        categories: selected.join(','),
      },
    });
  };

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.heading}>👥 Komanda adları</Text>
        <TeamInput value={teamA} onChange={setTeamA} placeholder="Komanda 1" index={0} />
        <View style={styles.vsRow}>
          <View style={styles.line} />
          <View style={styles.vs}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.line} />
        </View>
        <TeamInput value={teamB} onChange={setTeamB} placeholder="Komanda 2" index={1} />
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>🎯 Oyun rejimi</Text>
        <Segmented
          options={MODE_OPTIONS}
          value={settings.mode}
          onChange={(mode) => update({ mode })}
        />
        <Text style={styles.help}>{MODE_HELP[settings.mode]}</Text>
        {settings.mode === 'score' ? (
          <SliderRow
            icon="🏆"
            label="Qalibiyyət xalı"
            value={settings.targetScore}
            min={5}
            max={50}
            onChange={(targetScore) => update({ targetScore })}
          />
        ) : (
          <SliderRow
            icon="🔁"
            label="Raund sayı"
            value={settings.roundCount}
            min={1}
            max={10}
            onChange={(roundCount) => update({ roundCount })}
          />
        )}
        <Text style={styles.help}>
          ⏱️ {settings.roundSeconds} saniyə · ⏭️ {settings.passLimit} pas
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>📚 Mövzular</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const on = selected.includes(c.id);
            return (
              <Pressable
                key={c.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggle(c.id)}
                style={[styles.chip, on && { backgroundColor: c.color, borderColor: c.color }]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {c.emoji} {c.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.help}>
          {wordCount > 0 ? `${wordCount} söz hazırdır` : 'Ən azı bir mövzu seç'}
        </Text>
      </View>

      <BigButton label="▶ Oyuna başla" color={colors.skip} disabled={!wordCount} onPress={start} />
    </Screen>
  );
}

function TeamInput({
  value,
  onChange,
  placeholder,
  index,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  index: number;
}) {
  return (
    <View style={[styles.input, { backgroundColor: TEAM_COLORS[index] }]}>
      <Text style={styles.inputEmoji}>{TEAM_EMOJI[index]}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.7)"
        maxLength={16}
        style={styles.inputText}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 18,
    gap: 12,
    borderBottomWidth: 6,
    borderBottomColor: '#E2DBFF',
  },
  heading: { fontSize: 22, fontFamily: fonts.heading, color: colors.text, lineHeight: 28 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  inputEmoji: { fontSize: 26 },
  inputText: { flex: 1, fontSize: 19, fontFamily: fonts.bold, color: '#fff', paddingVertical: 10 },
  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 3, backgroundColor: '#EEEAFB', borderRadius: 2 },
  vs: {
    backgroundColor: colors.skip,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    transform: [{ rotate: '-6deg' }],
  },
  vsText: { fontSize: 22, fontFamily: fonts.display, color: '#fff' },
  help: { fontSize: 15, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: '#E9E3FF',
  },
  chipText: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted },
  chipTextOn: { color: '#fff' },
});
