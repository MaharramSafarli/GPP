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
        description: '5 qadağan sözü demədən sözü izah et',
        emoji: '🗣️',
        color: '#7B5CFF',
        href: '/children/explain-it',
      },
    ],
  },
];
