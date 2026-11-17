import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PictureCanvas, pictureRatio } from '@/components/coloring/picture-canvas';
import { BLANK } from '@/components/coloring/shape-canvas';
import { GameTopBar } from '@/components/game-top-bar';
import { ModalCard } from '@/components/modal-card';
import { BigButton } from '@/components/big-button';
import { Screen } from '@/components/screen';
import { FREE_PALETTE, FREE_PICTURES, partCount } from '@/data/coloring-pictures';
import { loadFills, saveFills } from '@/lib/coloring-store';
import { playSound, vibrate } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function FreeColoring() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pic = FREE_PICTURES.find((p) => p.id === id) ?? FREE_PICTURES[0];
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [fills, setFills] = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([]);
  const [color, setColor] = useState(FREE_PALETTE[0]);
  const [askClear, setAskClear] = useState(false);

  useEffect(() => {
    loadFills(pic.id).then(setFills);
  }, [pic.id]);

  // Fit the picture in both width and height (top bar, palette and buttons ≈ 300).
  const availH = height - insets.top - insets.bottom - 310;
  const ratio = pictureRatio(pic);
  const canvasW = Math.floor(Math.min(Math.min(width, 520) - 32, availH / ratio));
  const [zoom, setZoom] = useState(1);
  const swatch = Math.min(40, Math.floor((Math.min(width, 520) - 32 - 8 * 8) / 9));

  const apply = (next: string[]) => {
    setHistory((h) => [...h.slice(-40), fills]);
    setFills(next);
    saveFills(pic.id, next);
  };

  const fill = (i: number) => {
    if ((fills[i] ?? BLANK) === color) return;
    const next = [...fills];
    while (next.length < partCount(pic)) next.push(BLANK);
    next[i] = color;
    playSound('tap');
    vibrate('light');
    apply(next);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    playSound('flip');
    setHistory((h) => h.slice(0, -1));
    setFills(prev);
    saveFills(pic.id, prev);
  };

  return (
    <Screen scroll={false}>
      <GameTopBar title={pic.title} />
      {zoom === 1 ? (
        <PictureCanvas pic={pic} fills={fills} width={canvasW} onFill={fill} />
      ) : (
        // Zoomed in: scroll around the bigger picture in a box of the normal size.
        <View style={[styles.zoomBox, { width: canvasW + 6, height: canvasW * ratio + 6 }]}>
          <ScrollView nestedScrollEnabled contentContainerStyle={styles.zoomContent}>
            <ScrollView horizontal nestedScrollEnabled>
              <PictureCanvas pic={pic} fills={fills} width={canvasW * zoom} onFill={fill} />
            </ScrollView>
          </ScrollView>
        </View>
      )}

      <View style={styles.palette}>
        {FREE_PALETTE.map((c) => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityLabel={`Rəng ${c}`}
            onPress={() => {
              playSound('tap');
              setColor(c);
            }}
            style={[
              styles.swatch,
              { width: swatch, height: swatch, borderRadius: swatch / 2, backgroundColor: c },
              c === BLANK && styles.white,
              color === c && styles.swatchOn,
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={undo}
          disabled={!history.length}
          style={({ pressed }) => [styles.action, !history.length && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.actionText}>↩️ Geri al</Text>
        </Pressable>
        {pic.bitmap ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              playSound('tap');
              setZoom((z) => (z === 1 ? 2 : 1));
            }}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <Text style={styles.actionText}>{zoom === 1 ? '🔍 Böyüt' : '🔍 Kiçilt'}</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => setAskClear(true)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionText}>🧽 Təmizlə</Text>
        </Pressable>
      </View>

      <ModalCard visible={askClear} icon="🧽" title="Şəkli təmizləyək?" onRequestClose={() => setAskClear(false)}>
        <Text style={styles.ask}>Bütün rənglər silinəcək.</Text>
        <BigButton
          label="Bəli, təmizlə"
          color={colors.foul}
          onPress={() => {
            setAskClear(false);
            apply([]);
          }}
        />
        <BigButton label="Xeyr" color={colors.primary} onPress={() => setAskClear(false)} />
      </ModalCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  palette: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  swatch: { borderWidth: 3, borderColor: '#fff' },
  white: { borderColor: '#D9D3EE' },
  swatchOn: { borderColor: colors.text, transform: [{ scale: 1.18 }] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  zoomBox: {
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#3A3550',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  zoomContent: { flexGrow: 0 },
  action: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 3,
    borderColor: '#E9E3FF',
  },
  actionText: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  disabled: { opacity: 0.4 },
  pressed: { transform: [{ scale: 0.95 }] },
  ask: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
});
