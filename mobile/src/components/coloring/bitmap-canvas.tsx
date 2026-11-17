import { memo, useRef, type ComponentRef } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import type { BitmapPicture } from '@/data/coloring-bitmaps/types';

import { BLANK } from './shape-canvas';

const decoded = new WeakMap<BitmapPicture, Int32Array>();

function tapMap(pic: BitmapPicture): Int32Array {
  let m = decoded.get(pic);
  if (!m) {
    m = new Int32Array(pic.map.w * pic.map.h);
    let i = 0;
    for (let k = 0; k < pic.map.rle.length; k += 2) {
      m.fill(pic.map.rle[k], i, i + pic.map.rle[k + 1]);
      i += pic.map.rle[k + 1];
    }
    decoded.set(pic, m);
  }
  return m;
}

/** Area index (0-based) at picture pixel (x, y); looks around a little when a line was hit. */
export function regionAt(pic: BitmapPicture, x: number, y: number): number {
  const m = tapMap(pic);
  const { w, h, step } = pic.map;
  const cx = Math.floor(x / step);
  const cy = Math.floor(y / step);
  for (let rad = 0; rad <= 3; rad++) {
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== rad) continue;
        const xx = cx + dx;
        const yy = cy + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const v = m[yy * w + xx];
        if (v > 0) return v - 1;
      }
    }
  }
  return -1;
}

type Props = {
  pic: BitmapPicture;
  fills: string[];
  width: number;
  /** Omit for a read-only thumbnail. */
  onFill?: (index: number) => void;
};

/** A line drawing whose areas are filled by tinting white masks. */
export const BitmapCanvas = memo(function BitmapCanvas({ pic, fills, width, onFill }: Props) {
  const k = width / pic.width;
  const height = pic.height * k;
  const border = onFill ? 3 : 2;
  const ref = useRef<ComponentRef<typeof View>>(null);
  return (
    <View style={[styles.canvas, { width: width + border * 2, height: height + border * 2, borderWidth: border }]}>
    <Pressable
      disabled={!onFill}
      onPress={(e) => {
        // Page coordinates + measured position work the same on phones and web.
        const { pageX, pageY } = e.nativeEvent;
        ref.current?.measureInWindow((x, y) => {
          const i = regionAt(pic, (pageX - x) / k, (pageY - y) / k);
          if (i >= 0) onFill?.(i);
        });
      }}
      style={{ width, height }}>
      <View ref={ref} style={StyleSheet.absoluteFill} pointerEvents="none">
        {pic.regions.map((r, i) => {
          const c = fills[i];
          if (!c || c === BLANK) return null;
          return (
            <Image
              key={i}
              source={r.src}
              resizeMode="stretch"
              style={{
                position: 'absolute',
                left: r.x * k,
                top: r.y * k,
                width: r.w * k,
                height: r.h * k,
                tintColor: c,
              }}
            />
          );
        })}
        <Image source={pic.line} resizeMode="stretch" style={{ position: 'absolute', left: 0, top: 0, width, height }} />
      </View>
    </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderColor: '#3A3550',
    overflow: 'hidden',
  },
});
