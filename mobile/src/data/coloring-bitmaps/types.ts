import type { ImageSourcePropType } from 'react-native';

/** A line drawing split into fillable areas (made by scripts/make-coloring-bitmap.py). */
export type BitmapPicture = {
  width: number;
  height: number;
  /** Lines on a transparent background, drawn on top. */
  line: ImageSourcePropType;
  /** One white mask per area, placed at (x, y) in picture pixels; tinted with the fill color. */
  regions: { x: number; y: number; w: number; h: number; src: ImageSourcePropType }[];
  /** Low-res map of area numbers (1-based, 0 = line), run-length encoded, to find the tapped area. */
  map: { w: number; h: number; step: number; rle: number[] };
};
