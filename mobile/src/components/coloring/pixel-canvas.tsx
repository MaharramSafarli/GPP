import { memo, useRef, type ComponentRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

type Props = {
  cols: number;
  rows: number;
  /** Palette index of each cell. */
  cells: number[];
  colors: string[];
  /** '1' = painted. */
  done: string;
  cell: number;
  /** Highlight cells with this palette index (-1 = none). */
  selected?: number;
  /** Omit for a read-only thumbnail. */
  onPaint?: (index: number) => void;
};

const Cell = memo(function Cell({
  size,
  num,
  color,
  painted,
  highlight,
  showNumber,
}: {
  size: number;
  num: number;
  color: string;
  painted: boolean;
  highlight: boolean;
  showNumber: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        // Thumbnails show a faint preview of the unpainted picture.
        backgroundColor: painted || !showNumber ? color : highlight ? '#C9C2F2' : '#FFFFFF',
        opacity: !showNumber && !painted ? 0.28 : 1,
        borderRightWidth: showNumber ? StyleSheet.hairlineWidth : 0,
        borderBottomWidth: showNumber ? StyleSheet.hairlineWidth : 0,
        borderColor: '#B8B3CC',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {showNumber && !painted ? (
        <Text style={[styles.num, { fontSize: size * 0.55, lineHeight: size * 0.8 }]}>{num}</Text>
      ) : null}
    </View>
  );
});

/** Color-by-number grid. Tap or drag over cells to paint them. */
export function PixelCanvas({ cols, rows, cells, colors, done, cell, selected = -1, onPaint }: Props) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const live = useRef({ onPaint, cell, cols, rows });
  live.current = { onPaint, cell, cols, rows };
  const last = useRef(-1);

  const paintAt = (pageX: number, pageY: number) => {
    const L = live.current;
    const c = Math.floor((pageX - origin.current.x) / L.cell);
    const r = Math.floor((pageY - origin.current.y) / L.cell);
    if (c < 0 || r < 0 || c >= L.cols || r >= L.rows) return;
    const idx = r * L.cols + c;
    if (idx === last.current) return;
    last.current = idx;
    L.onPaint?.(idx);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!live.current.onPaint,
      onMoveShouldSetPanResponder: () => !!live.current.onPaint,
      onPanResponderGrant: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        last.current = -1;
        ref.current?.measureInWindow((x, y) => {
          origin.current = { x: x + 2, y: y + 2 };
          paintAt(pageX, pageY);
        });
      },
      onPanResponderMove: (e) => paintAt(e.nativeEvent.pageX, e.nativeEvent.pageY),
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const interactive = !!onPaint;
  return (
    <View
      ref={ref}
      {...(interactive ? responder.panHandlers : {})}
      pointerEvents={interactive ? 'auto' : 'none'}
      style={[styles.grid, { width: cols * cell + 4, borderWidth: 2 }]}>
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: cols }, (_, c) => {
            const i = r * cols + c;
            const p = cells[i];
            return (
              <Cell
                key={c}
                size={cell}
                num={p + 1}
                color={colors[p]}
                painted={done[i] === '1'}
                highlight={p === selected}
                showNumber={interactive}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#3A3550',
    borderRadius: 6,
    overflow: 'hidden',
    userSelect: 'none',
  },
  row: { flexDirection: 'row' },
  num: { fontFamily: fonts.bold, color: '#6E6A9E' },
});
