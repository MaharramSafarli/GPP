import type { Href } from 'expo-router';

/** A game inside a section. Add new games here. */
export type Game = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  href: Href;
};

/** A top-level section of the platform (e.g. Uşaqlar). */
export type Section = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  /** Leave undefined for sections that are not ready yet. */
  href?: Href;
  games: Game[];
};

export const SECTIONS: Section[] = [
  {
    id: 'children',
    title: 'Uşaqlar',
    description: 'Uşaqlar üçün əyləncəli oyunlar',
    emoji: '🧸',
    color: '#FF7A59',
    href: '/children',
    games: [
      {
        id: 'explain-it',
        title: 'İzah et!',
        description: '5 qadağan sözü demədən sözü izah et. İki komanda ilə!',
        emoji: '🗣️',
        color: '#7B5CFF',
        href: '/children/explain-it',
      },
      {
        id: 'quiz',
        title: 'Bilik Çarxı',
        description: 'Çarxı fırlat, sualları cavabla, 6 nişanı topla! Onlayn yarış',
        emoji: '🎡',
        color: '#FFB703',
        href: '/children/quiz',
      },
      {
        id: 'memory',
        title: 'Kartları tap',
        description: 'Öyrən və cütləri tap: İslam, İman, Peyğəmbərlər...',
        emoji: '🃏',
        color: '#22A447',
        href: '/children/memory',
      },
      {
        id: 'crossword',
        title: 'Krossvord',
        description: 'İslami terminləri krossvordda yerləşdir',
        emoji: '✏️',
        color: '#4D96FF',
        href: '/children/crossword',
      },
      {
        id: 'word-search',
        title: 'Söz tap',
        description: 'Hərflərin arasında gizlənmiş sözləri tap',
        emoji: '🔍',
        color: '#FF7A59',
        href: '/children/word-search',
      },
      {
        id: 'word-guess',
        title: 'Söz ustası',
        description: 'İpucunu oxu, hərfləri yaz və sözü tap! 11 söz, hər biri 1 dəqiqə',
        emoji: '🔤',
        color: '#0FA3B1',
        href: '/children/word-guess',
      },
      {
        id: 'letter-ring',
        title: 'Hərf dairəsi',
        description: 'A-dan Z-yə hər hərfə bir sual. 5 dəqiqədə neçəsini taparsan?',
        emoji: '🔠',
        color: '#E8743B',
        href: '/children/letter-ring',
      },
      {
        id: 'math-stars',
        title: 'Hesab ulduzları',
        description: 'Düşən ulduzlardakı misalları həll et! Getdikcə sürətlənir',
        emoji: '⭐',
        color: '#3A86FF',
        href: '/children/math-stars',
      },
      {
        id: 'tile-memory',
        title: 'Xanaları xatırla',
        description: 'Yanan xanaları yadda saxla və tap. Hər dəfə daha çox xana!',
        emoji: '🧠',
        color: '#8D6E63',
        href: '/children/tile-memory',
      },
      {
        id: 'coloring',
        title: 'Şəkli rənglə',
        description: 'Rəngini seç və şəkli öz zövqünə görə rənglə',
        emoji: '🎨',
        color: '#FF5FA2',
        href: '/children/coloring',
      },
      {
        id: 'balloons',
        title: 'Şarları partlat',
        description: 'Eyni rəngli 3 şarı birləşdir və partlat! Hər dəfə yeni səviyyə',
        emoji: '🎈',
        color: '#00B4C6',
        href: '/children/balloons',
      },
    ],
  },
];

/** All games, shown directly on the home screen. */
export const GAMES: Game[] = SECTIONS.flatMap((s) => s.games);
