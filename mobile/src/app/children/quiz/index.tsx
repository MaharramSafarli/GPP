import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Segmented } from '@/components/controls';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import { QUIZ_QUESTIONS } from '@/data/quiz-questions';
import type { GameDoc } from '@/games/quiz/engine';
import {
  AVATARS,
  createGame,
  findRandomOpponent,
  joinByCode,
  loadProfile,
  saveProfile,
  watchMyGames,
  type Profile,
} from '@/games/quiz/online';
import { ONLINE_AVAILABLE, ensureSignedIn } from '@/lib/firebase';
import { useSettings } from '@/lib/settings';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

const RULES = [
  '🎡 Çarxı fırlat və düşən kateqoriyadan suala cavab ver.',
  '✅ Düzgün cavab verdikcə oynamağa davam edirsən.',
  '⭐ 3 düzgün cavabdan sonra və ya ⭐ düşəndə nişan sualı gəlir.',
  '🏅 Nişan sualını düz cavablandırsan, o kateqoriyanın nişanını qazanırsan.',
  '❌ Səhv cavab versən, növbə rəqibə keçir.',
  '🏆 6 nişanı ilk toplayan qalib olur. Raundlar bitsə, ən çox nişanı olan qalibdir.',
  '🧰 Köməkçilər: 50:50, +15 saniyə və sualı keçmək.',
];

export default function QuizLobby() {
  const { settings, update } = useSettings();
  const [profile, setProfile] = useState<Profile>({ name: '', avatar: AVATARS[0] });
  const [games, setGames] = useState<GameDoc[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (!ONLINE_AVAILABLE) return;
    let unsub = () => {};
    ensureSignedIn()
      .then((u) => {
        setUid(u);
        unsub = watchMyGames(u, setGames);
      })
      .catch(() => setError('İnternetə qoşulmaq alınmadı'));
    return () => unsub();
  }, []);

  const setName = (name: string) => {
    const p = { ...profile, name };
    setProfile(p);
    saveProfile(p);
  };
  const setAvatar = (avatar: string) => {
    playSound('tap');
    const p = { ...profile, avatar };
    setProfile(p);
    saveProfile(p);
  };

  const needName = () => {
    if (profile.name.trim()) return false;
    setError('Əvvəlcə adını yaz ✏️');
    return true;
  };

  const run = async (label: string, fn: () => Promise<GameDoc>) => {
    if (needName()) return;
    setError('');
    setBusy(label);
    playSound('tap');
    try {
      const g = await fn();
      router.push({ pathname: '/children/quiz/[id]', params: { id: g.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xəta baş verdi');
    } finally {
      setBusy('');
    }
  };

  const opts = { maxRounds: settings.quizRounds, timeLimit: settings.quizSeconds };
  const p = { ...profile, name: profile.name.trim() };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🎡</Text>
        <Text style={styles.heroTitle}>Bilik Çarxı</Text>
        <Text style={styles.heroSub}>{QUIZ_QUESTIONS.length} İslami sual · 6 nişan · dostlarınla yarış!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sənin adın</Text>
        <View style={styles.nameRow}>
          <Text style={styles.myAvatar}>{profile.avatar}</Text>
          <TextInput
            value={profile.name}
            onChangeText={setName}
            placeholder="Adını yaz"
            placeholderTextColor={colors.muted}
            maxLength={14}
            style={styles.nameInput}
          />
        </View>
        <View style={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable
              key={a}
              accessibilityRole="button"
              accessibilityLabel={`Avatar ${a}`}
              onPress={() => setAvatar(a)}
              style={[styles.avatar, a === profile.avatar && styles.avatarOn]}>
              <Text style={styles.avatarText}>{a}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {ONLINE_AVAILABLE ? (
        <View style={styles.menu}>
          <BigButton
            label={busy === 'random' ? 'Axtarılır...' : '🎲 Təsadüfi rəqib'}
            color={colors.skip}
            onPress={() => run('random', () => findRandomOpponent(p, opts))}
          />
          <BigButton
            label={busy === 'friend' ? 'Yaradılır...' : '👥 Dostla oyna (kod yarat)'}
            color={colors.primary}
            onPress={() => run('friend', () => createGame(p, { open: false, ...opts }))}
          />
          <BigButton
            label="🔑 Kodla qoşul"
            color="#4D96FF"
            onPress={() => {
              if (!needName()) setCodeOpen(true);
            }}
          />
        </View>
      ) : (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            🌐 Onlayn oyun tezliklə! Hələlik təkbaşına məşq edə bilərsən.
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <BigButton
          label="🎯 Məşq"
          color={colors.correct}
          flex
          onPress={() => {
            if (needName()) return;
            playSound('tap');
            router.push({ pathname: '/children/quiz/[id]', params: { id: 'solo' } });
          }}
        />
        <BigButton label="⚙️" color={colors.muted} onPress={() => setSettingsOpen(true)} />
        <BigButton label="❓" color={colors.muted} onPress={() => setRulesOpen(true)} />
      </View>

      {ONLINE_AVAILABLE && (
        <View style={styles.card}>
          <Text style={styles.label}>Oyunlarım</Text>
          {games.length === 0 && <Text style={styles.empty}>Hələ oyun yoxdur. Yeni oyun başlat! 🚀</Text>}
          {games.slice(0, 20).map((g) => (
            <GameRow key={g.id} game={g} uid={uid ?? ''} />
          ))}
        </View>
      )}

      <ModalCard visible={codeOpen} icon="🔑" title="Kodla qoşul" onRequestClose={() => setCodeOpen(false)}>
        <Text style={styles.info}>Dostunun göndərdiyi 6 hərfli kodu yaz:</Text>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={6}
          placeholder="ABC123"
          placeholderTextColor="#C9C3E6"
          style={styles.codeInput}
        />
        <BigButton
          label={busy === 'code' ? 'Qoşulur...' : '▶ Qoşul'}
          color={colors.correct}
          onPress={() => {
            setCodeOpen(false);
            run('code', () => joinByCode(code, p));
          }}
        />
        <BigButton label="Ləğv et" color={colors.muted} onPress={() => setCodeOpen(false)} />
      </ModalCard>

      <ModalCard visible={settingsOpen} icon="⚙️" title="Ayarlar" onRequestClose={() => setSettingsOpen(false)}>
        <Text style={styles.label}>⏱️ Cavab vaxtı</Text>
        <Segmented
          options={[15, 20, 30, 45].map((n) => ({ id: String(n), label: `${n} san` }))}
          value={String(settings.quizSeconds)}
          onChange={(v) => update({ quizSeconds: Number(v) })}
        />
        <Text style={styles.label}>🔁 Raund sayı (onlayn)</Text>
        <Segmented
          options={[10, 15, 25].map((n) => ({ id: String(n), label: `${n}` }))}
          value={String(settings.quizRounds)}
          onChange={(v) => update({ quizRounds: Number(v) })}
        />
        <Text style={styles.info}>Bu ayarlar yeni yaratdığın oyunlara aid olur.</Text>
        <BigButton label="Hazır" color={colors.primary} onPress={() => setSettingsOpen(false)} />
      </ModalCard>

      <ModalCard visible={rulesOpen} icon="❓" title="Necə oynanılır?" onRequestClose={() => setRulesOpen(false)}>
        {RULES.map((r) => (
          <Text key={r} style={styles.rule}>
            {r}
          </Text>
        ))}
        <BigButton label="Anladım!" color={colors.correct} onPress={() => setRulesOpen(false)} />
      </ModalCard>
    </Screen>
  );
}

function GameRow({ game, uid }: { game: GameDoc; uid: string }) {
  const opp = game.players.find((p) => p !== uid);
  const status =
    game.status === 'waiting'
      ? { text: 'Rəqib gözlənilir', color: colors.muted }
      : game.status === 'finished'
        ? {
            text: game.winner === uid ? 'Qazandın 🏆' : game.winner === 'draw' ? 'Bərabərlik' : 'Bitdi',
            color: game.winner === uid ? colors.correct : colors.muted,
          }
        : game.turn === uid
          ? { text: 'Sənin növbən!', color: colors.foul }
          : { text: 'Rəqibin növbəsi', color: colors.primary };
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/children/quiz/[id]', params: { id: game.id } })}
      style={({ pressed }) => [styles.gameRow, pressed && { opacity: 0.7 }]}>
      <Text style={styles.gameAvatar}>{opp ? game.avatars[opp] : '⏳'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.gameName} numberOfLines={1}>
          {opp ? game.names[opp] : game.open ? 'Təsadüfi rəqib' : `Kod: ${game.code}`}
        </Text>
        <Text style={styles.gameScore}>
          🏅 {(game.badges[uid] ?? []).length} : {opp ? (game.badges[opp] ?? []).length : 0} · Raund{' '}
          {Math.min(game.round, game.maxRounds)}/{game.maxRounds}
        </Text>
      </View>
      <Text style={[styles.gameStatus, { color: status.color }]}>{status.text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  heroEmoji: { fontSize: 64 },
  heroTitle: { fontSize: 44, fontFamily: fonts.display, color: colors.primary, lineHeight: 54 },
  heroSub: { fontSize: 15, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 10,
    borderBottomWidth: 6,
    borderBottomColor: '#E2DBFF',
  },
  label: { fontSize: 18, fontFamily: fonts.heading, color: colors.text },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  myAvatar: { fontSize: 40 },
  nameInput: {
    flex: 1,
    fontSize: 19,
    fontFamily: fonts.bold,
    color: colors.text,
    backgroundColor: '#F1EEFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F4FF' },
  avatarOn: { backgroundColor: '#FFE7A3', borderWidth: 3, borderColor: colors.skip },
  avatarText: { fontSize: 24 },
  error: { fontSize: 16, fontFamily: fonts.bold, color: colors.foul, textAlign: 'center' },
  menu: { gap: 12 },
  row: { flexDirection: 'row', gap: 10 },
  notice: { backgroundColor: '#fff', borderRadius: 18, padding: 14 },
  noticeText: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  empty: { fontSize: 15, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F6F4FF',
    borderRadius: 16,
    padding: 10,
  },
  gameAvatar: { fontSize: 30 },
  gameName: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  gameScore: { fontSize: 13, fontFamily: fonts.body, color: colors.muted },
  gameStatus: { fontSize: 13, fontFamily: fonts.bold, maxWidth: 110, textAlign: 'right' },
  info: { fontSize: 15, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  codeInput: {
    fontSize: 36,
    fontFamily: fonts.display,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 6,
    backgroundColor: '#F1EEFF',
    borderRadius: 18,
    paddingVertical: 8,
  },
  rule: { fontSize: 16, fontFamily: fonts.body, color: colors.text, lineHeight: 23 },
});
