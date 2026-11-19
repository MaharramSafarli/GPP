import { useKeepAwake } from '@/lib/keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Confetti } from '@/components/confetti';
import { FlipCard } from '@/components/flip-card';
import { GameTopBar } from '@/components/game-top-bar';
import { Screen } from '@/components/screen';
import { WinModal, starsFor } from '@/components/win-modal';
import { MEMORY_LEVELS, type MemoryItem } from '@/data/memory-levels';
import { shuffle } from '@/games/explain-it/shuffle';
import { playSound, speak, stopSpeaking, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

type Tile = { key: string; item: MemoryItem };

const makeTiles = (items: MemoryItem[]): Tile[] =>
  shuffle(items.flatMap((item) => [0, 1].map((n) => ({ key: `${item.id}-${n}`, item }))));

export default function MemoryLevelScreen() {
  useKeepAwake();
  const { level: levelId } = useLocalSearchParams<{ level: string }>();
  const level = MEMORY_LEVELS.find((l) => l.id === levelId) ?? MEMORY_LEVELS[0];
  const [phase, setPhase] = useState<'learn' | 'play'>('learn');

  useEffect(() => () => stopSpeaking(), []);

  return phase === 'learn' ? (
    <Learn items={level.items} title={level.subtitle} onDone={() => setPhase('play')} />
  ) : (
    <Play items={level.items} title={level.subtitle} />
  );
}

/** Step 1: reveal each card one by one and hear what it means. */
function Learn({ items, title, onDone }: { items: MemoryItem[]; title: string; onDone: () => void }) {
  const [revealed, setRevealed] = useState(0);
  const done = revealed >= items.length;

  const reveal = (i: number) => {
    if (i !== revealed) {
      if (i < revealed) speak(`${items[i].name}. ${items[i].info}`);
      return;
    }
    playSound('flip');
    vibrate('light');
    setRevealed(i + 1);
    speak(`${items[i].name}. ${items[i].info}`);
  };

  return (
    <Screen>
      <GameTopBar title={`Öyrən: ${title}`} />
      <Text style={styles.hint}>
        {done ? 'Hamısını öyrəndin! İndi oynayaq 🎉' : 'Parlayan karta toxun və öyrən 👆'}
      </Text>
      {items.map((item, i) => (
        <Pressable key={item.id} onPress={() => reveal(i)} style={styles.learnRow}>
          <FlipCard
            faceUp={i < revealed}
            emoji={item.emoji}
            name={item.name}
            size={86}
            highlight={i === revealed}
            onPress={() => reveal(i)}
          />
          <View style={styles.learnText}>
            {i < revealed ? (
              <>
                <Text style={styles.learnName}>{item.name}</Text>
                <Text style={styles.learnInfo}>{item.info}</Text>
                <Text style={styles.listen}>🔊 Yenə dinlə</Text>
              </>
            ) : (
              <Text style={styles.locked}>{i === revealed ? 'Mənə toxun!' : '???'}</Text>
            )}
          </View>
        </Pressable>
      ))}
      <BigButton
        label={done ? '▶ Oyuna başla' : 'Keç ⏭'}
        color={done ? colors.correct : '#4D96FF'}
        onPress={() => {
          stopSpeaking();
          playSound('tap');
          onDone();
        }}
      />
    </Screen>
  );
}

/** Step 2: find the matching pairs. */
function Play({ items, title }: { items: MemoryItem[]; title: string }) {
  const { width, height } = useWindowDimensions();
  const [tiles, setTiles] = useState(() => makeTiles(items));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [won, setWon] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [won]);

  const columns = tiles.length > 10 ? 3 : 2;
  const rows = Math.ceil(tiles.length / columns);
  const gap = 12;
  const size = Math.floor(
    Math.min((width - 32 - gap * (columns - 1)) / columns, (height - 230 - gap * (rows - 1)) / rows, 130),
  );

  const flip = (i: number) => {
    if (busy.current || won || open.includes(i) || matched.includes(tiles[i].item.id)) return;
    playSound('flip');
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next;
    if (tiles[a].item.id === tiles[b].item.id) {
      const nowMatched = [...matched, tiles[a].item.id];
      setMatched(nowMatched);
      setOpen([]);
      playSound('match');
      vibrate('success');
      setConfetti((c) => c + 1);
      speak(tiles[a].item.name);
      if (nowMatched.length === items.length) {
        setTimeout(() => {
          setWon(true);
          playSound('win');
        }, 700);
      }
    } else {
      busy.current = true;
      setTimeout(() => {
        playSound('wrong');
        vibrate('error');
        setOpen([]);
        busy.current = false;
      }, 900);
    }
  };

  const restart = () => {
    setTiles(makeTiles(items));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setConfetti(0);
    setWon(false);
  };

  return (
    <Screen scroll={false}>
      <GameTopBar title={title} seconds={seconds} />
      <View style={styles.grid}>
        {Array.from({ length: rows }, (_, r) => (
          <View key={r} style={[styles.gridRow, { gap }]}>
            {tiles.slice(r * columns, r * columns + columns).map((tile, c) => {
              const i = r * columns + c;
              const isMatched = matched.includes(tile.item.id);
              return (
                <FlipCard
                  key={tile.key}
                  faceUp={open.includes(i) || isMatched}
                  matched={isMatched}
                  emoji={tile.item.emoji}
                  name={tile.item.name}
                  size={size}
                  onPress={() => flip(i)}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={styles.moves}>Cəhd: {moves}</Text>
      <Confetti burst={confetti} count={won ? 90 : 40} />
      <WinModal
        visible={won}
        stars={starsFor(seconds, items.length * 5)}
        seconds={seconds}
        extra={`${moves} cəhd`}
        onPlayAgain={restart}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 24,
    padding: 10,
  },
  learnText: { flex: 1, gap: 2 },
  learnName: { fontSize: 20, fontFamily: fonts.heading, color: colors.text, lineHeight: 26 },
  learnInfo: { fontSize: 15, fontFamily: fonts.body, color: colors.text, lineHeight: 21 },
  listen: { fontSize: 13, fontFamily: fonts.bold, color: colors.primary, marginTop: 2 },
  locked: { fontSize: 18, fontFamily: fonts.bold, color: colors.muted },
  grid: { flex: 1, justifyContent: 'center', gap: 12 },
  gridRow: { flexDirection: 'row', justifyContent: 'center' },
  moves: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center' },
});
