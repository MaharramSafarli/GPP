import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { RoundButton } from '@/components/controls';
import { PlayerBoard } from '@/components/quiz/player-board';
import { QuestionCard } from '@/components/quiz/question-card';
import { Wheel, sliceInfo } from '@/components/quiz/wheel';
import { Screen } from '@/components/screen';
import { QUIZ_CATEGORIES, type QuizCategoryId, type QuizQuestion } from '@/data/quiz-questions';
import {
  applyAnswer,
  newSoloGame,
  otherPlayer,
  pickQuestion,
  spendHelper,
  START_HELPERS,
  type GameDoc,
  type Helpers,
  type Slice,
} from '@/games/quiz/engine';
import { loadProfile, resign, saveMove, watchGame } from '@/games/quiz/online';
import { ensureSignedIn } from '@/lib/firebase';
import { useSettings } from '@/lib/settings';
import { playSound, vibrate } from '@/lib/sound';
import { loadJSON, saveJSON } from '@/lib/storage';
import { colors, fonts } from '@/theme';

type Phase =
  | { kind: 'spin' }
  | { kind: 'landed'; slice: Slice }
  | { kind: 'question'; q: QuizQuestion }
  | { kind: 'chooseBadge' }
  | { kind: 'badgeQuestion'; q: QuizQuestion; category: QuizCategoryId };

const BEST_KEY = 'gpp.quiz.best.v1';

/** Loads the game: an in-memory practice game, or a live Firestore game. */
function useGame(id: string) {
  const { settings } = useSettings();
  const solo = id === 'solo';
  const [uid, setUid] = useState<string | null>(solo ? 'me' : null);
  const [game, setGame] = useState<GameDoc | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (solo) {
      loadProfile().then((p) => setGame(newSoloGame(p.name || 'Mən', p.avatar, settings.quizSeconds)));
      return;
    }
    let unsub = () => {};
    ensureSignedIn()
      .then((u) => {
        setUid(u);
        unsub = watchGame(id, (g) => (g ? setGame(g) : setError('Oyun tapılmadı')));
      })
      .catch(() => setError('İnternetə qoşulmaq alınmadı'));
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async (next: GameDoc) => {
    setGame(next);
    if (solo || !uid) return;
    try {
      await saveMove(next, uid);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yadda saxlamaq alınmadı');
    }
  };

  return { game, uid, solo, save, error, setGame };
}

export default function QuizGameScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { game, uid, solo, save, error, setGame } = useGame(id);
  const [phase, setPhase] = useState<Phase>({ kind: 'spin' });
  const [confetti, setConfetti] = useState(0);
  const [best, setBest] = useState(0);
  const [confirmResign, setConfirmResign] = useState(false);

  useEffect(() => {
    if (solo) loadJSON(BEST_KEY, { best: 0 }).then((b) => setBest(b.best));
  }, [solo]);

  // Celebrate when the game ends.
  const finished = game?.status === 'finished';
  useEffect(() => {
    if (!finished || !game) return;
    const iWon = game.winner === uid || (solo && (game.correct.me ?? 0) > best);
    if (iWon) {
      playSound('win');
      setConfetti((c) => c + 1);
    }
    if (solo) {
      const score = game.correct.me ?? 0;
      if (score > best) {
        setBest(score);
        saveJSON(BEST_KEY, { best: score });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Back to the wheel whenever my turn (re)starts.
  const myTurn = !!game && !!uid && game.status === 'active' && game.turn === uid;
  useEffect(() => {
    if (myTurn) setPhase({ kind: 'spin' });
  }, [myTurn, game?.round]);

  if (!game || !uid) {
    return (
      <Screen scroll={false}>
        <Header insets={insets.top} />
        <View style={styles.center}>
          <Text style={styles.big}>{error ? '😕' : '⏳'}</Text>
          <Text style={styles.info}>{error || 'Yüklənir...'}</Text>
        </View>
      </Screen>
    );
  }

  const opponent = otherPlayer(game, uid);
  const myHelpers: Helpers = game.helpers[uid] ?? START_HELPERS;

  const onLanded = (slice: Slice) => {
    setPhase({ kind: 'landed', slice });
    setTimeout(() => {
      if (slice === 'star') setPhase({ kind: 'chooseBadge' });
      else setPhase({ kind: 'question', q: pickQuestion(slice, game.used) });
    }, 900);
  };

  const onAnswer = (q: QuizQuestion, correct: boolean, badgeCat?: QuizCategoryId) => {
    const res = applyAnswer(game, uid, q, correct, badgeCat ? 'badge' : 'normal', badgeCat);
    if (correct && badgeCat) {
      playSound('win');
      vibrate('success');
      setConfetti((c) => c + 1);
    }
    save(res.game);
    if (res.next === 'chooseBadge') setPhase({ kind: 'chooseBadge' });
    else setPhase({ kind: 'spin' });
  };

  const onHelper = (h: keyof Helpers) => save(spendHelper(game, uid, h));

  const share = () =>
    Share.share({
      message: `Gəl “Bilik Çarxı”nda yarışaq! GPP tətbiqində “Kodla qoşul” düyməsinə bas və bu kodu yaz: ${game.code}`,
    }).catch(() => {});

  const wheelSize = Math.min(width - 64, 320);

  return (
    <Screen>
      <Header insets={insets.top} />

      <View style={styles.boards}>
        <PlayerBoard game={game} uid={uid} active={myTurn} label="Sən" />
        {!solo && game.players.length > 1 && (
          <PlayerBoard game={game} uid={opponent} active={game.status === 'active' && game.turn === opponent} />
        )}
      </View>
      <Text style={styles.round}>
        {solo
          ? `${(game.lives ?? 3) > 0 ? '❤️'.repeat(game.lives ?? 3) : '💔'}  ·  Rekord: ${best}`
          : `Raund ${Math.min(game.round, game.maxRounds)} / ${game.maxRounds}`}
      </Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      {game.status === 'waiting' && (
        <View style={styles.panel}>
          <Text style={styles.big}>⏳</Text>
          <Text style={styles.title}>Rəqib gözlənilir</Text>
          {game.open ? (
            <Text style={styles.info}>Təsadüfi rəqib axtarılır. Kimsə qoşulan kimi oyun başlayacaq.</Text>
          ) : (
            <>
              <Text style={styles.info}>Bu kodu dostuna göndər:</Text>
              <Text style={styles.code} selectable>
                {game.code}
              </Text>
              <BigButton label="📤 Kodu paylaş" color={colors.primary} onPress={share} />
            </>
          )}
          <BigButton
            label="Ləğv et"
            color={colors.muted}
            onPress={() => {
              resign(game, uid).catch(() => {});
              router.back();
            }}
          />
        </View>
      )}

      {game.status === 'active' && !myTurn && (
        <View style={styles.panel}>
          <Text style={styles.big}>{game.avatars[opponent] ?? '⏳'}</Text>
          <Text style={styles.title}>{game.names[opponent]} oynayır...</Text>
          <Text style={styles.info}>Növbə sənə gələndə burada görəcəksən. Bu ekrandan çıxa bilərsən.</Text>
          <Text style={styles.event}>📣 {game.lastEvent}</Text>
        </View>
      )}

      {myTurn && phase.kind === 'spin' && (
        <View style={styles.wheelArea}>
          <Text style={styles.title}>Sənin növbən! Çarxı fırlat 🎡</Text>
          {!solo && <Text style={styles.event}>📣 {game.lastEvent}</Text>}
          <Wheel size={wheelSize} onResult={onLanded} />
        </View>
      )}

      {myTurn && phase.kind === 'landed' && (
        <View style={[styles.panel, { backgroundColor: sliceInfo(phase.slice).color }]}>
          <Text style={styles.big}>{sliceInfo(phase.slice).emoji}</Text>
          <Text style={[styles.title, { color: '#fff' }]}>{sliceInfo(phase.slice).title}</Text>
        </View>
      )}

      {myTurn && phase.kind === 'question' && (
        <QuestionCard
          question={phase.q}
          seconds={game.timeLimit}
          helpers={myHelpers}
          onUseHelper={onHelper}
          onSkip={() => setPhase({ kind: 'question', q: pickQuestion(phase.q.category, [...game.used, phase.q.id]) })}
          onDone={(ok) => onAnswer(phase.q, ok)}
        />
      )}

      {myTurn && phase.kind === 'chooseBadge' && (
        <View style={styles.panel}>
          <Text style={styles.big}>🏅</Text>
          <Text style={styles.title}>Nişan seç!</Text>
          <Text style={styles.info}>Hansı kateqoriyanın nişanı üçün sual istəyirsən?</Text>
          <View style={styles.badgeGrid}>
            {QUIZ_CATEGORIES.map((c) => {
              const has = (game.badges[uid] ?? []).includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  disabled={has}
                  accessibilityRole="button"
                  onPress={() => {
                    playSound('tap');
                    setPhase({ kind: 'badgeQuestion', category: c.id, q: pickQuestion(c.id, game.used) });
                  }}
                  style={[styles.badgeChoice, { backgroundColor: c.color }, has && { opacity: 0.35 }]}>
                  <Text style={styles.badgeChoiceEmoji}>{has ? '✅' : c.emoji}</Text>
                  <Text style={styles.badgeChoiceText}>{c.title}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {myTurn && phase.kind === 'badgeQuestion' && (
        <QuestionCard
          badge
          question={phase.q}
          seconds={game.timeLimit}
          helpers={myHelpers}
          onUseHelper={onHelper}
          onSkip={() => {}}
          onDone={(ok) => onAnswer(phase.q, ok, phase.category)}
        />
      )}

      {finished && (
        <View style={styles.panel}>
          <Text style={styles.big}>{solo ? '🎯' : game.winner === 'draw' ? '🤝' : game.winner === uid ? '🏆' : '💪'}</Text>
          <Text style={styles.title}>
            {solo
              ? `${game.correct.me ?? 0} düzgün cavab!`
              : game.winner === 'draw'
                ? 'Bərabərlik!'
                : game.winner === uid
                  ? 'Sən qalib gəldin!'
                  : `${game.names[game.winner ?? ''] ?? 'Rəqib'} qalib gəldi`}
          </Text>
          <Text style={styles.info}>
            {solo
              ? `🏅 ${(game.badges.me ?? []).length} nişan · Rekord: ${best}`
              : `🏅 Sən: ${(game.badges[uid] ?? []).length}  ·  Rəqib: ${(game.badges[opponent] ?? []).length}`}
          </Text>
          {!solo && <Text style={styles.event}>📣 {game.lastEvent}</Text>}
          {solo && (
            <BigButton
              label="🔁 Yenidən oyna"
              color={colors.correct}
              onPress={() => {
                setGame(newSoloGame(game.names.me, game.avatars.me, game.timeLimit));
                setPhase({ kind: 'spin' });
              }}
            />
          )}
          <BigButton label="🎡 Oyunlara qayıt" color={colors.primary} onPress={() => router.back()} />
        </View>
      )}

      {game.status === 'active' && !solo && (
        <Pressable
          onPress={() => {
            if (!confirmResign) return setConfirmResign(true);
            setConfirmResign(false);
            resign(game, uid).catch(() => {});
          }}
          style={styles.resign}>
          <Text style={[styles.resignText, confirmResign && { color: colors.foul }]}>
            {confirmResign ? '🏳️ Əminsən? Təsdiq üçün yenə toxun' : '🏳️ Təslim ol'}
          </Text>
        </Pressable>
      )}

      <Confetti burst={confetti} count={80} />
    </Screen>
  );
}

function Header({ insets }: { insets: number }) {
  return (
    <View style={[styles.header, { marginTop: insets }]}>
      <RoundButton icon="⬅️" label="Geri" color="#fff" onPress={() => router.back()} />
      <Text style={styles.headerTitle}>Bilik Çarxı</Text>
      <View style={{ width: 48 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 26, fontFamily: fonts.display, color: colors.primary, lineHeight: 34 },
  boards: { flexDirection: 'row', gap: 8 },
  round: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
  error: { fontSize: 14, fontFamily: fonts.bold, color: colors.foul, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  wheelArea: { alignItems: 'center', gap: 10 },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 20,
    gap: 12,
    alignItems: 'stretch',
    borderBottomWidth: 7,
    borderBottomColor: '#E2DBFF',
  },
  big: { fontSize: 60, textAlign: 'center' },
  title: { fontSize: 26, fontFamily: fonts.display, color: colors.text, textAlign: 'center', lineHeight: 34 },
  info: { fontSize: 16, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  event: { fontSize: 15, fontFamily: fonts.bold, color: colors.primary, textAlign: 'center' },
  code: {
    fontSize: 44,
    fontFamily: fonts.display,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 6,
    backgroundColor: '#F1EEFF',
    borderRadius: 18,
    paddingVertical: 6,
  },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  badgeChoice: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.18)',
  },
  badgeChoiceEmoji: { fontSize: 30 },
  badgeChoiceText: { fontSize: 13, fontFamily: fonts.bold, color: '#fff', textAlign: 'center' },
  resign: { alignSelf: 'center', padding: 8 },
  resignText: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted },
});
