import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryOf, shuffledOptions, type Helpers } from '@/games/quiz/engine';
import type { QuizQuestion } from '@/data/quiz-questions';
import { playSound, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

type Props = {
  question: QuizQuestion;
  seconds: number;
  badge?: boolean;
  helpers: Helpers;
  onUseHelper: (h: keyof Helpers) => void;
  onSkip: () => void;
  onDone: (correct: boolean) => void;
};

/** One multiple-choice question with a countdown and helpers (50:50, +15 s, skip). */
export function QuestionCard({ question, seconds, badge, helpers, onUseHelper, onSkip, onDone }: Props) {
  const { options, correctIndex } = useMemo(() => shuffledOptions(question), [question]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [left, setLeft] = useState(seconds);
  const deadline = useRef(Date.now() + seconds * 1000);
  const lastTick = useRef(-1);
  const answered = useRef(false);
  const cat = categoryOf(question.category);
  const done = chosen !== null;

  useEffect(() => {
    deadline.current = Date.now() + seconds * 1000;
    answered.current = false;
    setChosen(null);
    setHidden([]);
    setLeft(seconds);
  }, [question, seconds]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(s);
      if (s <= 5 && s > 0 && s !== lastTick.current) {
        lastTick.current = s;
        playSound('tick');
      }
      if (s === 0) finish(-1);
    }, 200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, question]);

  function finish(i: number) {
    if (answered.current) return;
    answered.current = true;
    setChosen(i);
    const ok = i === correctIndex;
    playSound(ok ? 'correct' : 'wrong');
    vibrate(ok ? 'success' : 'error');
    setTimeout(() => onDone(ok), 1500);
  }

  const fifty = () => {
    if (done || helpers.fifty <= 0) return;
    const wrong = [0, 1, 2, 3].filter((i) => i !== correctIndex && !hidden.includes(i));
    setHidden(wrong.sort(() => Math.random() - 0.5).slice(0, 2));
    onUseHelper('fifty');
    playSound('tap');
  };
  const more = () => {
    if (done || helpers.time <= 0) return;
    deadline.current += 15000;
    onUseHelper('time');
    playSound('tap');
  };
  const skip = () => {
    if (done || helpers.skip <= 0) return;
    answered.current = true;
    onUseHelper('skip');
    playSound('skip');
    onSkip();
  };

  const pct = Math.max(0, Math.min(1, left / seconds));

  return (
    <View style={styles.wrap}>
      <View style={[styles.header, { backgroundColor: badge ? '#FFB703' : cat.color }]}>
        <Text style={styles.headerText}>
          {badge ? '🏅 Nişan sualı · ' : ''}
          {cat.emoji} {cat.title}
        </Text>
        <View style={styles.timerPill}>
          <Text style={[styles.timerText, left <= 5 && { color: colors.foul }]}>⏱ {left}</Text>
        </View>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: left <= 5 ? colors.foul : cat.color }]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{question.text}</Text>
      </View>

      <View style={styles.options}>
        {options.map((o, i) => {
          if (hidden.includes(i)) return <View key={i} style={[styles.option, styles.optionHidden]} />;
          const isRight = done && i === correctIndex;
          const isWrong = done && i === chosen && i !== correctIndex;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`Cavab: ${o}`}
              disabled={done}
              onPress={() => finish(i)}
              style={({ pressed }) => [
                styles.option,
                isRight && styles.optionRight,
                isWrong && styles.optionWrong,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}>
              <Text style={[styles.optionText, (isRight || isWrong) && { color: '#fff' }]}>
                {isRight ? '✓ ' : isWrong ? '✗ ' : ''}
                {o}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {done && chosen === -1 && <Text style={styles.timeout}>⏰ Vaxt bitdi!</Text>}

      <View style={styles.helpers}>
        <HelperButton icon="½" label="50:50" count={helpers.fifty} onPress={fifty} disabled={done} />
        <HelperButton icon="⏱" label="+15 san" count={helpers.time} onPress={more} disabled={done} />
        <HelperButton icon="⏭" label="Keç" count={helpers.skip} onPress={skip} disabled={done || badge} />
      </View>
    </View>
  );
}

function HelperButton({
  icon,
  label,
  count,
  disabled,
  onPress,
}: {
  icon: string;
  label: string;
  count: number;
  disabled?: boolean;
  onPress: () => void;
}) {
  const off = disabled || count <= 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count} qalıb`}
      disabled={off}
      onPress={onPress}
      style={[styles.helper, off && { opacity: 0.4 }]}>
      <Text style={styles.helperIcon}>{icon}</Text>
      <Text style={styles.helperLabel}>{label}</Text>
      <View style={styles.helperCount}>
        <Text style={styles.helperCountText}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerText: { flex: 1, fontSize: 17, fontFamily: fonts.bold, color: '#fff' },
  timerPill: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  timerText: { fontSize: 17, fontFamily: fonts.display, color: colors.text, fontVariant: ['tabular-nums'] },
  bar: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    borderBottomWidth: 6,
    borderBottomColor: '#E2DBFF',
  },
  question: { fontSize: 21, fontFamily: fonts.heading, color: colors.text, textAlign: 'center', lineHeight: 28 },
  options: { gap: 10 },
  option: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: '#E2DBFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionHidden: { opacity: 0, borderWidth: 0 },
  optionRight: { backgroundColor: colors.correct, borderColor: colors.correct },
  optionWrong: { backgroundColor: colors.foul, borderColor: colors.foul },
  optionText: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  timeout: { fontSize: 18, fontFamily: fonts.bold, color: colors.foul, textAlign: 'center' },
  helpers: { flexDirection: 'row', gap: 10 },
  helper: {
    flex: 1,
    backgroundColor: '#7B5CFF',
    borderRadius: 18,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#5B3FD6',
  },
  helperIcon: { fontSize: 20, fontFamily: fonts.display, color: '#fff' },
  helperLabel: { fontSize: 13, fontFamily: fonts.bold, color: '#fff' },
  helperCount: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#FF4D6D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperCountText: { fontSize: 12, fontFamily: fonts.bold, color: '#fff' },
});
