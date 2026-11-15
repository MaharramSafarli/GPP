import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { EXPLAIN_IT_WORDS } from '@/data/explain-it-words';
import { colors } from '@/theme';

const ROUND_OPTIONS = [30, 60, 90];

export default function ExplainItSetupScreen() {
  const [seconds, setSeconds] = useState(60);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>🗣️</Text>
      <Text style={styles.title}>How to play</Text>
      <View style={styles.card}>
        <Text style={styles.rule}>1. One player holds the phone and sees the word.</Text>
        <Text style={styles.rule}>2. Explain the word so your friends can guess it.</Text>
        <Text style={styles.rule}>
          3. Don&apos;t say the word or any of the 5 forbidden words!
        </Text>
        <Text style={styles.rule}>4. Get as many words as you can before time runs out.</Text>
      </View>

      <Text style={styles.subtitle}>Round time</Text>
      <View style={styles.options}>
        {ROUND_OPTIONS.map((option) => {
          const selected = option === seconds;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setSeconds(option)}
              style={[styles.option, selected && styles.optionSelected]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option}s
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.count}>{EXPLAIN_IT_WORDS.length} words available</Text>

      <BigButton
        label="Start!"
        color={colors.primary}
        onPress={() =>
          router.push({
            pathname: '/children/explain-it/play',
            params: { seconds: String(seconds) },
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  emoji: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 20, gap: 10 },
  rule: { fontSize: 17, color: colors.text, lineHeight: 24 },
  subtitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  options: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.primary },
  optionText: { fontSize: 18, fontWeight: '700', color: colors.muted },
  optionTextSelected: { color: colors.primary },
  count: { fontSize: 15, color: colors.muted, textAlign: 'center' },
});
