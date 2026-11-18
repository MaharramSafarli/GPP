import alhamdulillah from '@/data/coloring-bitmaps/alhamdulillah';
import type { BitmapPicture } from '@/data/coloring-bitmaps/types';

/**
 * Coloring pictures. Line drawings (`bitmap`) come from scripts/make-coloring-bitmap.py.
 * Pictures can also be built from simple shapes on a 100 × 120 canvas (none at the
 * moment); shapes are painted in order, later ones on top.
 *
 * kinds: r = rectangle (r = corner radius, or [tl, tr, br, bl]),
 *        c = circle/rounded (radius = half the smaller side),
 *        d = dome/arch (top corners fully rounded),
 *        t = triangle pointing up.
 * `fixed` = a non-colorable detail (eyes, strings); `link` = always shows the
 * color of another shape (used to cut a crescent out of a full moon); `nb` = no outline.
 */
export type Shape = {
  k: 'r' | 'c' | 'd' | 't';
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number | [number, number, number, number];
  rot?: number;
  fixed?: string;
  link?: number;
  nb?: boolean;
};

/** A picture is either built from shapes or is a line drawing (`bitmap`, then `shapes` is empty). */
export type FreePicture = { id: string; title: string; emoji: string; shapes: Shape[]; bitmap?: BitmapPicture };

/** Number of colorable parts (the length of the saved fills array). */
export const partCount = (p: FreePicture) => (p.bitmap ? p.bitmap.regions.length : p.shapes.length);

export const CANVAS_W = 100;
export const CANVAS_H = 120;

export const FREE_PICTURES: FreePicture[] = [
  { id: 'alhamdulillah', title: 'Əlhəmdulillah', emoji: '🤲', shapes: [], bitmap: alhamdulillah },
];

/** Colors for free coloring. */
export const FREE_PALETTE = [
  '#FF4D4D', '#FF9A3C', '#FFD93D', '#F2C230', '#9BE15D', '#2EA05A',
  '#2EC4B6', '#8FD3FF', '#4D96FF', '#1E3A8A', '#9B5DE5', '#FF8FC8',
  '#F6D2B0', '#E8D3A2', '#A0703C', '#9AA5B1', '#2B2B2B', '#FFFFFF',
];
