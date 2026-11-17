import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { PixelCanvas } from '@/components/coloring/pixel-canvas';
import { Confetti } from '@/components/confetti';
import { GameTopBar } from '@/components/game-top-bar';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import { NUMBER_PICTURES, cellIndexes } from '@/data/coloring-numbers';
import { loadDone, saveDone } from '@/lib/coloring-store';
import { playSound, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function NumberColoring() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pic = NUMBER_PICTURES.find((p) => p.id === id) ?? NUMBER_PICTURES[0];
  const cells = useMemo(() => cellIndexes(pic), [pic]);
  const cols = pic.rows[0].length;
  const rowsN = pic.rows.length;
  const palette = pic.palette.map((p) => p.color);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [done, setDone] = useState('0'.repeat(cells.length));
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(0);
  const [won, setWon] = useState(false);
  const [peek, setPeek] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    loadDone(pic.id, cells.length).then((d) => {
      setDone(d);
      const first = cells.findIndex((_, j) => d[j] !== '1');
      if (first >= 0) setSelected(cells[first]);
      setLoaded(true);
    });
  }, [pic.id, cells]);

  // Fit the grid in both width and height (top bar ≈ 100, palette ≈ 140).
  const availH = height - insets.top - insets.bottom - 280;
  const cell = Math.max(10, Math.floor(Math.min((Math.min(width, 520) - 36) / cols, availH / rowsN)));

  const remaining = useMemo(() => {
    const left = palette.map(() => 0);
    cells.forEach((p, i) => {
      if (done[i] !== '1') left[p]++;
    });
    return left;
  }, [cells, done, palette]);

  const paint = (i: number) => {
    const cur = doneRef.current;
    if (cur[i] === '1' || won) return;
    if (cells[i] !== selected) {
      vibrate('light');
      return;
    }
    const next = cur.slice(0, i) + '1' + cur.slice(i + 1);
    doneRef.current = next;
    setDone(next);
    saveDone(pic.id, next);
    if (!next.includes('0')) {
      setWon(true);
      playSound('win');
      vibrate('success');
      setConfetti((x) => x + 1);
      return;
    }
    // Move on to the next color automatically when this one is finished.
    if (!cells.some((p, j) => p === selected && next[j] !== '1')) {
      playSound('match');
      const nextColor = palette.findIndex((_, k) => cells.some((p, j) => p === k && next[j] !== '1'));
      if (nextColor >= 0) setSelected(nextColor);
    }
  };

  const restart = () => {
    const blank = '0'.repeat(cells.length);
    setDone(blank);
    saveDone(pic.id, blank);
    setWon(false);
    setPeek(false);
    setSelected(0);
  };

  return (
    <Screen scroll={false}>
      <GameTopBar title={pic.title} />
      <Text style={styles.hint}>Rəqəmi seç, sonra eyni rəqəmli xanaları rənglə 👆</Text>

      {loaded ? (
        <PixelCanvas
          cols={cols}
          rows={rowsN}
          cells={cells}
          colors={palette}
          done={done}
          cell={cell}
          selected={selected}
          onPaint={paint}
        />
      ) : (
        <View style={{ height: cell * rowsN }} />
      )}

      <View style={styles.palette}>
        {pic.palette.map((p, k) => {
          const finished = remaining[k] === 0;
          return (
            <Pressable
              key={p.ch}
              accessibilityRole="button"
              accessibilityLabel={`${k + 1} ${p.name}`}
              onPress={() => {
                playSound('tap');
                setSelected(k);
              }}
              style={[
                styles.swatch,
                { backgroundColor: p.color },
                selected === k && styles.swatchOn,
              ]}>
              <Text style={[styles.swatchNum, { color: isDark(p.color) ? '#fff' : colors.text }]}>
                {finished ? '✓' : k + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.colorName}>
        {selected + 1} — {pic.palette[selected].name}
      </Text>

      <Confetti burst={confetti} count={90} />
      <ModalCard visible={won && !peek} icon="🎨" title="Afərin!" onRequestClose={() => setPeek(true)}>
        <Text style={styles.winText}>{pic.title} şəklini tam rənglədin!</Text>
        <BigButton label="👀 Şəklə bax" color={colors.skip} onPress={() => setPeek(true)} />
        <BigButton label="🖼️ Şəkillərə qayıt" color={colors.primary} onPress={() => router.back()} />
        <BigButton label="🔁 Yenidən rənglə" color={colors.correct} onPress={restart} />
      </ModalCard>
    </Screen>
  );
}

function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114 < 140;
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted, textAlign: 'center', marginTop: -8 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  swatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchOn: { borderColor: colors.text, transform: [{ scale: 1.15 }] },
  swatchNum: { fontSize: 18, fontFamily: fonts.display, lineHeight: 24 },
  colorName: { fontSize: 15, fontFamily: fonts.bold, color: colors.text, textAlign: 'center', marginTop: -8 },
  winText: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
});
