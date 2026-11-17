/**
 * Free-coloring pictures, drawn from simple shapes on a 100 × 120 canvas
 * (no SVG in the app). Shapes are painted in order: later shapes sit on top.
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

export type FreePicture = { id: string; title: string; emoji: string; shapes: Shape[] };

export const CANVAS_W = 100;
export const CANVAS_H = 120;

const r = (x: number, y: number, w: number, h: number, extra: Partial<Shape> = {}): Shape => ({
  k: 'r', x, y, w, h, ...extra,
});
const c = (x: number, y: number, w: number, h = w, extra: Partial<Shape> = {}): Shape => ({
  k: 'c', x, y, w, h, ...extra,
});
const d = (x: number, y: number, w: number, h: number, extra: Partial<Shape> = {}): Shape => ({
  k: 'd', x, y, w, h, ...extra,
});
const t = (x: number, y: number, w: number, h: number): Shape => ({ k: 't', x, y, w, h });
/** A small diamond-shaped star. */
const star = (x: number, y: number, s = 4): Shape => r(x, y, s, s, { rot: 45, r: 0.6 });
/** A palm leaf: a long rounded bar pointing out from (cx, cy) at `deg`. */
const leaf = (cx: number, cy: number, deg: number, len = 26, thick = 7): Shape => {
  const a = (deg * Math.PI) / 180;
  const mx = cx + (Math.cos(a) * len) / 2;
  const my = cy + (Math.sin(a) * len) / 2;
  return r(mx - len / 2, my - thick / 2, len, thick, { rot: deg, r: thick / 2 });
};
const EYE = '#33303F';

/** Lantern hanging from a string, centered at cx with its cap at y. */
const lantern = (cx: number, y: number, s = 1): Shape[] => [
  r(cx - 0.5, 0, 1, y - 3 * s, { fixed: '#5A5470', nb: true }),
  c(cx - 2.5 * s, y - 4 * s, 5 * s),
  t(cx - 7 * s, y, 14 * s, 8 * s),
  r(cx - 9 * s, y + 8 * s, 18 * s, 3 * s, { r: 1 }),
  r(cx - 8 * s, y + 11 * s, 16 * s, 22 * s, { r: 2 }),
  d(cx - 5 * s, y + 14 * s, 10 * s, 16 * s),
  r(cx - 9 * s, y + 33 * s, 18 * s, 3 * s, { r: 1 }),
  r(cx - 5 * s, y + 36 * s, 10 * s, 3 * s, { r: [0, 0, 3, 3] }),
];

/** A tree: trunk and a round crown of three circles. */
const tree = (x: number, y: number, s = 1): Shape[] => [
  r(x + 7 * s, y + 16 * s, 6 * s, 18 * s, { r: 1 }),
  c(x, y + 6 * s, 14 * s),
  c(x + 8 * s, y + 4 * s, 14 * s),
  c(x + 3 * s, y - 3 * s, 14 * s),
];

/** A flower: stem, four petals and a center. */
const flower = (cx: number, cy: number): Shape[] => [
  r(cx - 0.7, cy + 3, 1.4, 9, { fixed: '#3E8E41', nb: true }),
  c(cx - 2, cy - 6, 4),
  c(cx - 6, cy - 2, 4),
  c(cx + 2, cy - 2, 4),
  c(cx - 2, cy + 2, 4),
  c(cx - 2, cy - 2, 4),
];

const MOSQUE: Shape[] = [
  r(0, 0, 100, 120),
  c(74, 7, 18),
  c(6, 14, 14, 10),
  c(13, 9, 16, 14),
  c(23, 14, 14, 10),
  r(0, 96, 100, 24),
  // minarets
  r(8, 36, 10, 60),
  r(6, 52, 14, 4, { r: 1 }),
  t(8, 24, 10, 12),
  c(11, 19, 4),
  r(82, 36, 10, 60),
  r(80, 52, 14, 4, { r: 1 }),
  t(82, 24, 10, 12),
  c(85, 19, 4),
  // building and dome
  r(22, 60, 56, 36),
  d(30, 36, 40, 24),
  r(28, 57, 44, 4, { r: 1 }),
  r(49.2, 28, 1.6, 8, { fixed: '#5A5470', nb: true }),
  c(47.5, 24, 5),
  d(43, 74, 14, 22),
  d(27, 68, 9, 14),
  d(64, 68, 9, 14),
  r(40, 96, 20, 24),
  ...flower(8, 102),
  ...flower(91, 104),
];

const KAABA: Shape[] = [
  r(0, 0, 100, 120),
  c(72, 6, 16),
  c(77, 4, 15, 15, { link: 0, nb: true }),
  star(20, 10),
  star(40, 18, 3),
  star(56, 6, 3),
  star(10, 28, 3),
  r(2, 20, 7, 30),
  t(2, 11, 7, 9),
  r(91, 20, 7, 30),
  t(91, 11, 7, 9),
  r(0, 44, 100, 28),
  ...[3, 15, 27, 39, 51, 63, 75, 87].map((x) => d(x, 56, 10, 16)),
  r(0, 72, 100, 48),
  r(0, 104, 100, 16),
  r(26, 42, 48, 52, { r: 1 }),
  r(26, 52, 48, 7),
  r(26, 61, 48, 2.5),
  r(56, 66, 11, 20, { r: 1 }),
  r(57.5, 68, 8, 16),
];

const NIGHT: Shape[] = [
  r(0, 0, 100, 120),
  c(54, 8, 32),
  c(63, 4, 30, 30, { link: 0, nb: true }),
  star(10, 10, 5),
  star(26, 24, 4),
  star(40, 8, 5),
  star(12, 42, 4),
  star(90, 44, 5),
  star(44, 34, 4),
  star(30, 52, 3),
  star(88, 8, 3),
  c(-20, 70, 70),
  c(40, 76, 90),
  // house
  r(14, 84, 18, 16),
  t(12, 72, 22, 12),
  r(20, 90, 6, 10, { r: [3, 3, 0, 0] }),
  r(15.5, 87, 4, 4),
  r(27, 87, 4, 4),
  // little mosque
  r(56, 86, 26, 14),
  d(61, 74, 16, 12),
  r(84, 72, 5, 28),
  t(84, 65, 5, 7),
  d(66, 91, 6, 9),
  r(0, 100, 100, 20),
];

const LANTERNS: Shape[] = [
  r(0, 0, 100, 120),
  star(48, 6, 4),
  star(34, 14, 3),
  star(64, 14, 3),
  ...lantern(18, 24, 0.95),
  ...lantern(50, 42, 1.1),
  ...lantern(82, 24, 0.95),
  r(0, 100, 100, 20),
  r(8, 104, 84, 12, { r: 3 }),
  r(14, 107, 72, 6, { r: 2 }),
];

const PALMS: Shape[] = [
  r(0, 0, 100, 120),
  c(70, 8, 20),
  c(-12, 80, 66),
  c(42, 86, 76),
  ...[0, 1, 2, 3, 4, 5].map((i) => r(27 - i * 0.6, 44 + i * 9, 7, 9.5, { r: 2 })),
  leaf(30.5, 44, -160),
  leaf(30.5, 44, -120),
  leaf(30.5, 44, -60),
  leaf(30.5, 44, -20),
  leaf(30.5, 44, 160, 22),
  leaf(30.5, 44, 20, 22),
  c(25, 46, 4.5),
  c(29, 47.5, 4.5),
  c(33, 46, 4.5),
  ...[0, 1, 2, 3, 4].map((i) => r(72 + i * 0.5, 62 + i * 8, 6, 8.5, { r: 2 })),
  leaf(75, 62, -155, 20, 6),
  leaf(75, 62, -110, 20, 6),
  leaf(75, 62, -65, 20, 6),
  leaf(75, 62, -25, 20, 6),
  leaf(75, 62, 155, 17, 6),
  leaf(75, 62, 25, 17, 6),
  c(70, 63.5, 4),
  c(74, 65, 4),
  c(78, 63.5, 4),
  r(0, 108, 100, 12),
];

const KIDS: Shape[] = [
  r(0, 0, 100, 120),
  c(6, 8, 12, 9),
  c(12, 5, 14, 12),
  c(20, 8, 12, 9),
  r(0, 82, 100, 38),
  // mosque behind
  r(8, 24, 7, 58),
  t(8, 15, 7, 9),
  r(85, 24, 7, 58),
  t(85, 15, 7, 9),
  r(20, 42, 60, 40),
  d(34, 20, 32, 22),
  r(49.2, 13, 1.6, 7, { fixed: '#5A5470', nb: true }),
  c(47.5, 10, 5),
  d(44, 58, 12, 24),
  d(25, 52, 8, 12),
  d(67, 52, 8, 12),
  // boy (cap and long shirt)
  r(15, 80, 5, 16, { r: 2.5 }),
  r(36, 80, 5, 16, { r: 2.5 }),
  r(21.5, 102, 5, 9, { r: 1.5 }),
  r(29.5, 102, 5, 9, { r: 1.5 }),
  r(20, 78, 16, 26, { r: 4 }),
  c(22, 66, 12),
  d(22, 63.5, 12, 6),
  c(25, 70.5, 1.8, 1.8, { fixed: EYE, nb: true }),
  c(29.2, 70.5, 1.8, 1.8, { fixed: EYE, nb: true }),
  r(26.3, 74.2, 3.4, 1.2, { fixed: EYE, nb: true, r: 0.6 }),
  // girl (hijab and long dress)
  r(60, 84, 5, 16, { r: 2.5 }),
  r(81, 84, 5, 16, { r: 2.5 }),
  r(66, 106, 5, 5, { r: 1.5 }),
  r(75, 106, 5, 5, { r: 1.5 }),
  r(64, 82, 18, 26, { r: 4 }),
  c(64, 62, 18),
  r(63, 74, 20, 11, { r: 5 }),
  c(67.5, 66, 11),
  c(70.2, 70, 1.8, 1.8, { fixed: EYE, nb: true }),
  c(74.2, 70, 1.8, 1.8, { fixed: EYE, nb: true }),
  r(71.3, 73.6, 3.4, 1.2, { fixed: EYE, nb: true, r: 0.6 }),
  ...flower(48, 100),
  ...flower(94, 106),
];

const NATURE: Shape[] = [
  r(0, 0, 100, 120),
  d(8, 22, 84, 42),
  d(14, 28, 72, 36),
  d(20, 34, 60, 30),
  d(26, 40, 48, 24),
  d(32, 46, 36, 18, { link: 0 }),
  c(80, 4, 16),
  c(4, 6, 12, 9),
  c(10, 3, 14, 12),
  c(18, 6, 12, 9),
  c(-30, 56, 90),
  c(40, 60, 100),
  ...tree(4, 58, 1),
  r(56, 72, 24, 18),
  t(53, 60, 30, 12),
  r(64, 78, 7, 12, { r: [3, 3, 0, 0] }),
  r(58, 75, 5, 5),
  r(73, 75, 5, 5),
  r(0, 90, 100, 30),
  r(60, 90, 12, 30),
  ...tree(82, 74, 0.8),
  ...flower(12, 102),
  ...flower(24, 108),
  ...flower(40, 100),
  ...flower(86, 106),
];

const QURAN: Shape[] = [
  r(0, 0, 100, 120),
  d(28, 6, 44, 50),
  d(32, 10, 36, 44),
  r(49.2, 10, 1.6, 44, { fixed: '#8A7FA8', nb: true }),
  r(32, 31, 36, 1.6, { fixed: '#8A7FA8', nb: true }),
  star(8, 12, 5),
  star(86, 12, 5),
  star(14, 30, 3),
  star(82, 30, 3),
  r(0, 90, 100, 30),
  r(8, 96, 84, 20, { r: 3 }),
  r(14, 100, 72, 12, { r: 2 }),
  r(28, 74, 44, 5, { rot: 32, r: 2 }),
  r(28, 74, 44, 5, { rot: -32, r: 2 }),
  r(26, 60, 48, 7, { r: 2 }),
  r(29, 54, 21, 9, { rot: 9, r: 1 }),
  r(50, 54, 21, 9, { rot: -9, r: 1 }),
];

export const FREE_PICTURES: FreePicture[] = [
  { id: 'mosque', title: 'Məscid', emoji: '🕌', shapes: MOSQUE },
  { id: 'kaaba', title: 'Kəbə', emoji: '🕋', shapes: KAABA },
  { id: 'night', title: 'Ay və ulduzlar', emoji: '🌙', shapes: NIGHT },
  { id: 'lanterns', title: 'Fənərlər', emoji: '🏮', shapes: LANTERNS },
  { id: 'palms', title: 'Xurma ağacı', emoji: '🌴', shapes: PALMS },
  { id: 'kids', title: 'Uşaqlar məsciddə', emoji: '🧒', shapes: KIDS },
  { id: 'nature', title: 'Təbiət', emoji: '🌈', shapes: NATURE },
  { id: 'quran', title: 'Qurani-Kərim', emoji: '📖', shapes: QURAN },
];

/** Colors for free coloring. */
export const FREE_PALETTE = [
  '#FF4D4D', '#FF9A3C', '#FFD93D', '#F2C230', '#9BE15D', '#2EA05A',
  '#2EC4B6', '#8FD3FF', '#4D96FF', '#1E3A8A', '#9B5DE5', '#FF8FC8',
  '#F6D2B0', '#E8D3A2', '#A0703C', '#9AA5B1', '#2B2B2B', '#FFFFFF',
];
