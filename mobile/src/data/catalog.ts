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

/** A top-level section of the platform (e.g. Children). */
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
    title: 'Children',
    description: 'Fun games for kids',
    emoji: '🧸',
    color: '#FF8A5B',
    href: '/children',
    games: [
      {
        id: 'explain-it',
        title: 'Explain It!',
        description: 'Explain the word without saying the 5 forbidden words',
        emoji: '🗣️',
        color: '#6C63FF',
        href: '/children/explain-it',
      },
    ],
  },
];
