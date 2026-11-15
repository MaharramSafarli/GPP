import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Screen } from '@/components/screen';
import { CATEGORIES, EXPLAIN_IT_WORDS, type CategoryId } from '@/data/explain-it-words';
import { colors, fonts } from '@/theme';

const ROUND_OPTIONS = [30, 60, 90];

const RULES = [
  '📱 Bir oyunçu telefonu tutur və sözü görür.',
  '🗣️ Sözü elə izah et ki, dostların tapsın.',
  '🚫 Sözün özünü və 5 qadağan sözü demək olmaz!',
  '⏱️ Vaxt bitənə qədər çoxlu söz tap.',
];

export default function ExplainItSetupScreen() {
  const [seconds, setSeconds] = useState(60);
  const [selected, setSelected] = useState<CategoryId[]>(CATEGORIES.map((c) => c.id));

  const toggle = (id: CategoryId) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const wordCount = EXPLAIN_IT_WORDS.filter((w) => selected.includes(w.category)).length;

  return (
    <Screen>
      <Text style={styles.title}>Necə oynanılır?</Text>
      <View style={styles.card}>
        {RULES.map((rule) => (
          <Text key={rule} style={styles.rule}>
            {rule}
          </Text>
        ))}
      </View>

      <Text style={styles.subtitle}>Mövzular</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => {
          const on = selected.includes(c.id);
          return (
            <Pressable
              key={c.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(c.id)}
              style={[styles.chip, on ? { backgroundColor: c.color, borderColor: c.color } : null]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {c.emoji} {c.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.subtitle}>Raund vaxtı</Text>
      <View style={styles.options}>
        {ROUND_OPTIONS.map((option) => {
          const on = option === seconds;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setSeconds(option)}
              style={[styles.option, on && styles.optionOn]}>
              <Text style={[styles.optionText, on && styles.optionTextOn]}>{option} san</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.count}>
        {wordCount > 0 ? `${wordCount} söz hazırdır` : 'Ən azı bir mövzu seç'}
      </Text>

      <BigButton
        label="Başla! 🚀"
        color={colors.primary}
        disabled={wordCount === 0}
        onPress={() =>
          router.push({
            pathname: '/children/explain-it/play',
            params: { seconds: String(seconds), categories: selected.join(',') },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontFamily: fonts.display, color: colors.text, lineHeight: 42 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    gap: 10,
    borderWidth: 3,
    borderColor: '#E9E3FF',
  },
  rule: { fontSize: 17, fontFamily: fonts.body, color: colors.text, lineHeight: 24 },
  subtitle: { fontSize: 22, fontFamily: fonts.heading, color: colors.text, lineHeight: 28 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: '#E9E3FF',
  },
  chipText: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted },
  chipTextOn: { color: '#fff' },
  options: { flexDirection: 'row', gap: 10 },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E9E3FF',
  },
  optionOn: { borderColor: colors.primary, backgroundColor: '#EFEAFF' },
  optionText: { fontSize: 18, fontFamily: fonts.bold, color: colors.muted },
  optionTextOn: { color: colors.primary },
  count: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
});
