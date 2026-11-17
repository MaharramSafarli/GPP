/**
 * Color-by-number pictures (pixel art). Each character in `rows` is one cell;
 * `palette` maps a character to its color. The number shown on a cell is the
 * palette index + 1, in the order the palette is written.
 */
export type NumberPicture = {
  id: string;
  title: string;
  emoji: string;
  palette: { ch: string; name: string; color: string }[];
  rows: string[];
};

export const NUMBER_PICTURES: NumberPicture[] = [
  {
    id: 'haram',
    title: 'Məscidül-Həram',
    emoji: '🕋',
    palette: [
      { ch: 'S', name: 'Göy', color: '#8FD3FF' },
      { ch: 'K', name: 'Qara', color: '#2B2B2B' },
      { ch: 'G', name: 'Qızılı', color: '#F2C230' },
      { ch: 'W', name: 'Mərmər', color: '#EEEBE3' },
      { ch: 'B', name: 'Bej', color: '#E3CFA4' },
      { ch: 'D', name: 'Qəhvəyi', color: '#9C7B55' },
      { ch: 'L', name: 'Boz', color: '#B9B4A8' },
    ],
    rows: [
      'SSSSSSSSSSSSSSSSSSSS',
      'SSGSSSSSSGGSSSSSSGSS',
      'SSBSSSSSGSSSSSSSSBSS',
      'SSBSSSSSSGGSSSSSSBSS',
      'SBBBSSSSSSSSSSSSBBBS',
      'SSBSSSSSSSSSSSSSSBSS',
      'SSBSSSSSSSSSSSSSSBSS',
      'SBBBSSSSSSSSSSSSBBBS',
      'SSBSSSSSSSSSSSSSSBSS',
      'BBBBBBBBBBBBBBBBBBBB',
      'BDBDBDBDBDBDBDBDBDBD',
      'BDBDKKKKKKKKKKKKBDBD',
      'BBBBKKKKKKKKKKKKBBBB',
      'WWWWGGGGGGGGGGGGWWWW',
      'WWWWKKKKKKKKKKKKWWWW',
      'WWWWKKKKKKKGGKKKWWWW',
      'WWWWKKKKKKKGGKKKWWWW',
      'WWWWKKKKKKKGGKKKWWWW',
      'WWWWKKKKKKKKKKKKWWWW',
      'WWWWKKKKKKKKKKKKWWWW',
      'LWWWWWWWWWWWWWWWWWWL',
      'WLWWWWWWWWWWWWWWWWLW',
      'WWLLWWWWWWWWWWWWLLWW',
      'WWWWLLLLLLLLLLLLWWWW',
    ],
  },
  {
    id: 'nabawi',
    title: 'Məscidün-Nəbəvi',
    emoji: '🕌',
    palette: [
      { ch: 'S', name: 'Göy', color: '#8FD3FF' },
      { ch: 'N', name: 'Yaşıl', color: '#2EA05A' },
      { ch: 'G', name: 'Qızılı', color: '#F2C230' },
      { ch: 'W', name: 'Ağ', color: '#F3F1EA' },
      { ch: 'A', name: 'Qəhvəyi', color: '#8B5A2B' },
      { ch: 'P', name: 'Xurma yarpağı', color: '#5FB33A' },
      { ch: 'T', name: 'Gövdə', color: '#B07A40' },
      { ch: 'E', name: 'Torpaq', color: '#E8D3A2' },
    ],
    rows: [
      'SSSSSSSSSSSSSSSSSSSSS',
      'SGSSSSSSSSGSSSSSSSSGS',
      'SWSSSSSSSSGSSSSSSSSWS',
      'SWSSSSSSSNNNSSSSSSSWS',
      'WWWSSSSSNNNNNSSSSSWWW',
      'SWSSSSSNNNNNNNSSSSSWS',
      'SWSSSSNNNNNNNNNSSSSWS',
      'SWSSSSNNNNNNNNNSSSSWS',
      'WWWSSSWWWWWWWWWSSSWWW',
      'SWSSSSWAWAWAWAWSSSSWS',
      'SWWWWWWWWWWWWWWWWWWWS',
      'SWAAWAAWAAWAAWAAWAAWS',
      'SWAAWAAWAAWAAWAAWAAWS',
      'PPPWWWWWWWWWWWWWWWPPP',
      'PPPPPWWWWWWWWWWWPPPPP',
      'SPTPWWWWWAAAWWWWWPTPS',
      'SWTWWWWWWAAAWWWWWWTWS',
      'SWTWWWWWWAAAWWWWWWTWS',
      'EETEEEEEEEEEEEEEEETEE',
      'EEEEEEEEEEEEEEEEEEEEE',
      'EEEEEEEEEEEEEEEEEEEEE',
    ],
  },
  {
    id: 'aqsa',
    title: 'Məscidül-Əqsa',
    emoji: '🕌',
    palette: [
      { ch: 'S', name: 'Göy', color: '#8FD3FF' },
      { ch: 'D', name: 'Gümüşü', color: '#9EAAB8' },
      { ch: 'G', name: 'Qızılı', color: '#F2C230' },
      { ch: 'E', name: 'Daş', color: '#EAD9B0' },
      { ch: 'A', name: 'Qəhvəyi', color: '#7A5A40' },
      { ch: 'O', name: 'Zeytun', color: '#6B9B3A' },
      { ch: 'T', name: 'Gövdə', color: '#8B5E34' },
      { ch: 'R', name: 'Ot', color: '#A6D86E' },
    ],
    rows: [
      'SSSSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSGSSSSSSSSSS',
      'SSSSSSSSSSGSSSSSSSSSS',
      'SSSSSSSSSDDDSSSSSSSSS',
      'SSSSSSSSDDDDDSSSSSSSS',
      'SSSSSSSDDDDDDDSSSSSSS',
      'SSSSSSDDDDDDDDDSSSSSS',
      'SSSSSSEEEEEEEEESSSSSS',
      'SSSSSSEAEAEAEAESSSSSS',
      'SOSEEEEEEEEEEEEEEESOS',
      'OOOEEEEEEEEEEEEEEEOOO',
      'OOOEAEAEAEAEAEAEAEOOO',
      'OOOEAEAEAEAEAEAEAEOOO',
      'STSEAEAEAEAEAEAEAESTS',
      'STSEEEEEEEEEEEEEEESTS',
      'RTRRRRRRRRRRRRRRRRRTR',
      'RRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRR',
    ],
  },
];

/** Palette index of every cell, row by row. */
export function cellIndexes(p: NumberPicture): number[] {
  const map = new Map(p.palette.map((x, i) => [x.ch, i]));
  return p.rows.flatMap((row) => [...row].map((ch) => map.get(ch) ?? 0));
}
