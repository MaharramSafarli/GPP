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
    ],
  },
];
