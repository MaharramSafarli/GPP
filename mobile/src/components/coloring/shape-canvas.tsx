import { memo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { CANVAS_H, CANVAS_W, type Shape } from '@/data/coloring-pictures';

const LINE = '#3A3550';
export const BLANK = '#FFFFFF';

type Props = {
  shapes: Shape[];
  fills: string[];
  width: number;
  /** Omit for a read-only thumbnail. */
  onFill?: (index: number) => void;
};

/** Draws a free-coloring picture; tapping a shape calls onFill(index). */
export const ShapeCanvas = memo(function ShapeCanvas({ shapes, fills, width, onFill }: Props) {
  const s = width / CANVAS_W;
  const line = Math.max(1, Math.min(2, s * 0.45));
  const colorOf = (i: number): string => {
    const sh = shapes[i];
    if (sh.fixed) return sh.fixed;
    if (sh.link !== undefined) return colorOf(sh.link);
    return fills[i] ?? BLANK;
  };

  return (
    <View
      style={[styles.canvas, { width, height: CANVAS_H * s, borderWidth: onFill ? 3 : 2 }]}
      pointerEvents={onFill ? 'auto' : 'none'}>
      {shapes.map((sh, i) => {
        const box: ViewStyle = {
          position: 'absolute',
          left: sh.x * s,
          top: sh.y * s,
          width: sh.w * s,
          height: sh.h * s,
          transform: sh.rot ? [{ rotate: `${sh.rot}deg` }] : undefined,
        };
        const color = colorOf(i);
        const target = sh.link ?? i;
        const press =
          onFill && !sh.fixed ? () => onFill(target) : undefined;

        if (sh.k === 't') {
          const half = (sh.w * s) / 2;
          const h = sh.h * s;
          const o = line * 1.6;
          return (
            <Pressable key={i} style={box} onPress={press} disabled={!press}>
              <View
                style={[
                  styles.tri,
                  {
                    left: -o,
                    top: -o * 1.4,
                    borderLeftWidth: half + o,
                    borderRightWidth: half + o,
                    borderBottomWidth: h + o * 1.4,
                    borderBottomColor: LINE,
                  },
                ]}
              />
              <View
                style={[
                  styles.tri,
                  { borderLeftWidth: half, borderRightWidth: half, borderBottomWidth: h, borderBottomColor: color },
                ]}
              />
            </Pressable>
          );
        }

        const w = sh.w * s;
        const h = sh.h * s;
        let radius: ViewStyle = {};
        if (sh.k === 'c') radius = { borderRadius: Math.min(w, h) / 2 };
        else if (sh.k === 'd') radius = { borderTopLeftRadius: w / 2, borderTopRightRadius: w / 2 };
        else if (Array.isArray(sh.r))
          radius = {
            borderTopLeftRadius: sh.r[0] * s,
            borderTopRightRadius: sh.r[1] * s,
            borderBottomRightRadius: sh.r[2] * s,
            borderBottomLeftRadius: sh.r[3] * s,
          };
        else if (sh.r) radius = { borderRadius: sh.r * s };

        return (
          <Pressable
            key={i}
            onPress={press}
            disabled={!press}
            style={[
              box,
              radius,
              { backgroundColor: color, borderColor: LINE, borderWidth: sh.nb ? 0 : line },
            ]}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderColor: LINE,
    overflow: 'hidden',
  },
  tri: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    backgroundColor: 'transparent',
  },
});
