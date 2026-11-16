import { StyleSheet, Text, View } from 'react-native';

import { QUIZ_CATEGORIES } from '@/data/quiz-questions';
import { METER_MAX, type GameDoc } from '@/games/quiz/engine';
import { colors, fonts } from '@/theme';

/** A player's avatar, name, collected badges and progress bar. */
export function PlayerBoard({
  game,
  uid,
  active,
  label,
}: {
  game: GameDoc;
  uid: string;
  active: boolean;
  label?: string;
}) {
  const badges = game.badges[uid] ?? [];
  const meter = game.meter[uid] ?? 0;
  return (
    <View style={[styles.card, active && styles.active]}>
      <View style={styles.top}>
        <Text style={styles.avatar}>{game.avatars[uid] ?? '🙂'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {game.names[uid] ?? 'Oyunçu'}
            {label ? <Text style={styles.label}> · {label}</Text> : null}
          </Text>
          <View style={styles.meter}>
            {Array.from({ length: METER_MAX }, (_, i) => (
              <View key={i} style={[styles.meterDot, i < meter && styles.meterOn]} />
            ))}
            <Text style={styles.correct}>✓ {game.correct[uid] ?? 0}</Text>
          </View>
        </View>
      </View>
      <View style={styles.badges}>
        {QUIZ_CATEGORIES.map((c) => {
          const has = badges.includes(c.id);
          return (
            <View
              key={c.id}
              accessibilityLabel={`${c.title} nişanı${has ? ' qazanılıb' : ''}`}
              style={[styles.badge, { borderColor: c.color }, has && { backgroundColor: c.color }]}>
              <Text style={[styles.badgeEmoji, !has && { opacity: 0.25 }]}>{c.emoji}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 8,
    gap: 6,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  active: { backgroundColor: '#fff', borderColor: colors.primary },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { fontSize: 30 },
  name: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  label: { fontSize: 12, color: colors.muted },
  meter: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meterDot: { width: 14, height: 8, borderRadius: 4, backgroundColor: '#E6E2F5' },
  meterOn: { backgroundColor: '#FFB703' },
  correct: { fontSize: 12, fontFamily: fonts.bold, color: colors.muted, marginLeft: 4 },
  badges: { flexDirection: 'row', gap: 2, justifyContent: 'center' },
  badge: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  badgeEmoji: { fontSize: 11 },
});
