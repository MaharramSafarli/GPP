import { useKeepAwake } from '@/lib/keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { IconToggle, RoundButton } from '@/components/controls';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import { CATEGORIES, EXPLAIN_IT_WORDS, type WordCard } from '@/data/explain-it-words';
import { TEAM_COLORS, TEAM_EMOJI } from '@/games/explain-it/teams';
import { shuffle } from '@/games/explain-it/shuffle';
import { useSettings } from '@/lib/settings';
import { playSound, startMusic, stopMusic, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

type Phase = 'intro' | 'playing' | 'paused' | 'turnEnd' | 'over';
type TurnStats = { correct: number; foul: number; skip: number };
const EMPTY_STATS: TurnStats = { correct: 0, foul: 0, skip: 0 };

export default function ExplainItPlay() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { settings, update } = useSettings();
  const params = useLocalSearchParams<{ teamA?: string; teamB?: string; categories?: string }>();
  const teams = [params.teamA || 'Komanda 1', params.teamB || 'Komanda 2'];
  const chosen = params.categories?.split(',') ?? CATEGORIES.map((c) => c.id);

  // Settings are frozen when the game starts so a change mid-game can't break it.
  const [rules] = useState(() => ({
    seconds: settings.roundSeconds,
    mode: settings.mode,
    target: settings.targetScore,
    rounds: settings.roundCount,
    passes: settings.passLimit,
    timeUp: settings.timeUpSound,
  }));

  const [deck, setDeck] = useState<WordCard[]>(() =>
    shuffle(EXPLAIN_IT_WORDS.filter((w) => chosen.includes(w.category))),
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [stats, setStats] = useState<TurnStats>(EMPTY_STATS);
  const [passesLeft, setPassesLeft] = useState(rules.passes);
  const [remainingMs, setRemainingMs] = useState(rules.seconds * 1000);
  const [confetti, setConfetti] = useState(0);
  const endsAt = useRef(0);
  const lastTick = useRef(-1);

  const team = turn % 2;
  const round = Math.floor(turn / 2) + 1;
  const remaining = Math.ceil(remainingMs / 1000);
  const card = deck[index % deck.length];

  // Countdown while playing.
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      const left = Math.max(0, endsAt.current - Date.now());
      setRemainingMs(left);
      const sec = Math.ceil(left / 1000);
      if (sec <= 5 && sec > 0 && sec !== lastTick.current) {
        lastTick.current = sec;
        playSound('tick');
      }
      if (left <= 0) endTurn();
    }, 200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Music only while a turn is running.
  useEffect(() => {
    if (phase === 'playing') startMusic();
    else stopMusic();
  }, [phase]);
  useEffect(() => () => stopMusic(), []);

  // Android back button and leaving the app pause the game.
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'playing') pause();
      return phase !== 'over';
    });
    const app = AppState.addEventListener('change', (s) => {
      if (s !== 'active' && phase === 'playing') pause();
    });
    return () => {
      back.remove();
      app.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startTurn = () => {
    playSound('tap');
    endsAt.current = Date.now() + rules.seconds * 1000;
    lastTick.current = -1;
    setRemainingMs(rules.seconds * 1000);
    setPassesLeft(rules.passes);
    setStats(EMPTY_STATS);
    setPhase('playing');
  };

  const pause = () => {
    setRemainingMs(Math.max(0, endsAt.current - Date.now()));
    setPhase('paused');
    playSound('tap');
  };

  const resume = () => {
    endsAt.current = Date.now() + remainingMs;
    setPhase('playing');
  };

  const nextCard = () => {
    if (index + 1 >= deck.length) {
      setDeck(shuffle(deck));
      setIndex(0);
    } else setIndex(index + 1);
  };

  const finish = () => {
    setPhase('over');
    playSound('win');
    vibrate('success');
    setConfetti((c) => c + 1);
  };

  function endTurn() {
    playSound(rules.timeUp);
    vibrate('error');
    const lastTurn = rules.mode === 'rounds' && turn + 1 >= rules.rounds * 2;
    if (lastTurn) finish();
    else setPhase('turnEnd');
  }

  const answer = (kind: 'correct' | 'foul' | 'skip') => {
    if (phase !== 'playing') return;
    if (kind === 'skip') {
      if (passesLeft <= 0) return;
      setPassesLeft((p) => p - 1);
      playSound('skip');
      vibrate('light');
    } else {
      playSound(kind === 'correct' ? 'correct' : 'wrong');
      vibrate(kind === 'correct' ? 'medium' : 'error');
    }
    setStats((s) => ({ ...s, [kind]: s[kind] + 1 }));
    const delta = kind === 'correct' ? 1 : kind === 'foul' ? -1 : 0;
    const next = [...scores];
    next[team] = Math.max(0, next[team] + delta);
    setScores(next);
    nextCard();
    if (rules.mode === 'score' && next[team] >= rules.target) finish();
  };

  const nextTurn = () => {
    setTurn((t) => t + 1);
    setPhase('intro');
  };

  const playAgain = () => {
    setScores([0, 0]);
    setTurn(0);
    setDeck(shuffle(deck));
    setIndex(0);
    setConfetti(0);
    setPhase('intro');
  };

  const goHome = () => {
    stopMusic();
    router.dismissTo('/');
  };

  const category = CATEGORIES.find((c) => c.id === card.category)!;
  const low = remaining <= 10;
  const winner = scores[0] === scores[1] ? -1 : scores[0] > scores[1] ? 0 : 1;
  const goalText =
    rules.mode === 'score' ? `🏆 Hədəf: ${rules.target} xal` : `🔁 Raund ${round} / ${rules.rounds}`;

  return (
    <Screen scroll={false}>
      <View style={[styles.topBar, { marginTop: insets.top }]}>
        <TeamPill name={teams[0]} score={scores[0]} index={0} active={team === 0} />
        <RoundButton
          icon={phase === 'playing' ? '⏸️' : '▶️'}
          label={phase === 'playing' ? 'Dayandır' : 'Davam et'}
          onPress={() => (phase === 'playing' ? pause() : phase === 'paused' ? resume() : undefined)}
        />
        <TeamPill name={teams[1]} score={scores[1]} index={1} active={team === 1} />
      </View>
      <Text style={styles.goal}>{goalText}</Text>

      {phase === 'playing' || phase === 'paused' ? (
        <>
          <View style={styles.timerWrap}>
            <View style={[styles.timer, { borderColor: low ? colors.foul : colors.skip }]}>
              <Text style={[styles.timerText, low && { color: colors.foul }]}>{remaining}</Text>
            </View>
          </View>

          <View style={[styles.card, { borderColor: category.color }]}>
            <View style={[styles.wordBox, { backgroundColor: category.color }]}>
              <Text style={styles.tagText}>
                {category.emoji} {category.title}
              </Text>
              <Text style={styles.word} adjustsFontSizeToFit numberOfLines={2}>
                {phase === 'paused' ? '• • •' : card.word}
              </Text>
            </View>
            <Text style={styles.dontSay}>🚫 Demək olmaz</Text>
            <View style={styles.forbiddenList}>
              {card.forbidden.map((w) => (
                <Text key={w} style={styles.forbidden}>
                  {phase === 'paused' ? '• • •' : w}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <ActionButton label="Qadağan" icon="✗" color={colors.foul} onPress={() => answer('foul')} />
            <ActionButton
              label={`Pas (${passesLeft})`}
              icon="⏭"
              color={colors.skip}
              disabled={passesLeft <= 0}
              onPress={() => answer('skip')}
            />
            <ActionButton label="Düzdür" icon="✓" color={colors.correct} onPress={() => answer('correct')} />
          </View>
        </>
      ) : (
        <View style={styles.center}>
          {phase === 'intro' && (
            <View style={styles.panel}>
              <Text style={styles.bigEmoji}>{TEAM_EMOJI[team]}</Text>
              <Text style={styles.panelSmall}>Növbə</Text>
              <Text style={[styles.panelTitle, { color: TEAM_COLORS[team] }]}>{teams[team]}</Text>
              <Text style={styles.panelText}>
                Telefonu izah edəcək oyunçuya ver. Hazırsınız? ⏱️ {rules.seconds} saniyə
              </Text>
              <BigButton label="▶ Başla!" color={TEAM_COLORS[team]} onPress={startTurn} />
            </View>
          )}
          {phase === 'turnEnd' && (
            <View style={styles.panel}>
              <Text style={styles.bigEmoji}>⏰</Text>
              <Text style={styles.panelTitle}>Vaxt bitdi!</Text>
              <Text style={styles.panelText}>{teams[team]} bu raundda:</Text>
              <View style={styles.statsRow}>
                <Stat label="Düzgün" value={stats.correct} color={colors.correct} />
                <Stat label="Pas" value={stats.skip} color={colors.skip} />
                <Stat label="Qadağan" value={stats.foul} color={colors.foul} />
              </View>
              <BigButton
                label={`Növbə: ${teams[1 - team]} ▶`}
                color={TEAM_COLORS[1 - team]}
                onPress={nextTurn}
              />
            </View>
          )}
          {phase === 'over' && (
            <View style={styles.panel}>
              <Text style={styles.bigEmoji}>{winner === -1 ? '🤝' : '🏆'}</Text>
              <Text style={styles.panelTitle}>
                {winner === -1 ? 'Bərabərlik!' : `${teams[winner]} qalib!`}
              </Text>
              <View style={styles.statsRow}>
                <Stat label={teams[0]} value={scores[0]} color={TEAM_COLORS[0]} />
                <Stat label={teams[1]} value={scores[1]} color={TEAM_COLORS[1]} />
              </View>
              <BigButton label="🔁 Yenidən oyna" color={colors.primary} onPress={playAgain} />
              <BigButton label="🏠 Ana səhifə" color={colors.muted} onPress={goHome} />
            </View>
          )}
        </View>
      )}

      <ModalCard visible={phase === 'paused'} icon="⏸️" title="Oyun dayandı!" onRequestClose={resume}>
        <View style={styles.toggles}>
          <IconToggle icon="🎵" label="Musiqi" value={settings.music} onChange={(music) => update({ music })} />
          <IconToggle icon="🔊" label="Səs" value={settings.sfx} onChange={(sfx) => update({ sfx })} />
          <IconToggle
            icon="📳"
            label="Vibrasiya"
            value={settings.vibration}
            onChange={(vibration) => update({ vibration })}
          />
        </View>
        <BigButton label="▶ Davam et" color={colors.skip} onPress={resume} />
        <BigButton label="🏠 Ana səhifə" color={colors.primary} onPress={goHome} />
      </ModalCard>

      <Confetti burst={confetti} />
    </Screen>
  );
}

function TeamPill({
  name,
  score,
  index,
  active,
}: {
  name: string;
  score: number;
  index: number;
  active: boolean;
}) {
  return (
    <View
      style={[
        styles.pill,
        index === 1 && styles.pillRight,
        active && { borderColor: TEAM_COLORS[index], backgroundColor: '#fff' },
      ]}>
      <Text style={styles.pillName} numberOfLines={2}>
        {name}
      </Text>
      <View style={[styles.pillScore, { backgroundColor: TEAM_COLORS[index] }]}>
        <Text style={styles.pillScoreText}>{score}</Text>
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  color,
  disabled,
  onPress,
}: {
  label: string;
  icon: string;
  color: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.actionWrap}>
      <BigButton label={`${icon}\n${label}`} color={color} disabled={disabled} onPress={onPress} />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.stat, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 4,
    paddingLeft: 6,
  },
  pillRight: { flexDirection: 'row-reverse', paddingLeft: 4, paddingRight: 6 },
  pillName: { flex: 1, fontSize: 13, lineHeight: 16, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  pillScore: {
    minWidth: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pillScoreText: { fontSize: 22, fontFamily: fonts.display, color: '#fff', lineHeight: 28 },
  goal: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center', marginTop: -6 },
  timerWrap: { alignItems: 'center', marginTop: -6 },
  timer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 7,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { fontSize: 38, fontFamily: fonts.display, color: colors.text, lineHeight: 46 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 30,
    borderWidth: 4,
    padding: 14,
    gap: 6,
    shadowColor: '#2D2A6E',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  wordBox: { borderRadius: 22, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  tagText: { fontSize: 13, fontFamily: fonts.bold, color: 'rgba(255,255,255,0.9)' },
  word: { fontSize: 40, fontFamily: fonts.display, color: '#fff', textAlign: 'center', lineHeight: 50 },
  dontSay: { fontSize: 15, fontFamily: fonts.bold, color: colors.foul, textAlign: 'center' },
  forbiddenList: {
    flex: 1,
    backgroundColor: '#FFF0F3',
    borderRadius: 20,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 4,
  },
  forbidden: { fontSize: 22, fontFamily: fonts.heading, color: colors.text, lineHeight: 30 },
  actions: { flexDirection: 'row', gap: 10 },
  actionWrap: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 22,
    gap: 12,
    alignItems: 'stretch',
    borderBottomWidth: 8,
    borderBottomColor: '#E2DBFF',
  },
  bigEmoji: { fontSize: 64, textAlign: 'center' },
  panelSmall: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
  panelTitle: {
    fontSize: 34,
    fontFamily: fonts.display,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 42,
  },
  panelText: { fontSize: 17, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  statValue: { fontSize: 32, fontFamily: fonts.display, lineHeight: 40 },
  statLabel: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted },
  toggles: { flexDirection: 'row', justifyContent: 'space-around' },
});
