/**
 * Word cards for the "Explain It!" game.
 *
 * Each card has:
 *  - word:      the word the player must explain
 *  - forbidden: exactly five words the player is NOT allowed to say
 *
 * These are sample cards. Replace them with your own list.
 */
export type WordCard = {
  word: string;
  forbidden: [string, string, string, string, string];
};

export const EXPLAIN_IT_WORDS: WordCard[] = [
  { word: 'Cat', forbidden: ['Meow', 'Pet', 'Dog', 'Kitten', 'Whiskers'] },
  { word: 'Sun', forbidden: ['Hot', 'Sky', 'Yellow', 'Day', 'Light'] },
  { word: 'Apple', forbidden: ['Fruit', 'Red', 'Tree', 'Green', 'Eat'] },
  { word: 'School', forbidden: ['Teacher', 'Class', 'Learn', 'Student', 'Lesson'] },
  { word: 'Rain', forbidden: ['Water', 'Cloud', 'Umbrella', 'Wet', 'Weather'] },
  { word: 'Ball', forbidden: ['Round', 'Play', 'Football', 'Kick', 'Throw'] },
  { word: 'Bicycle', forbidden: ['Ride', 'Wheels', 'Pedal', 'Bike', 'Two'] },
  { word: 'Ice cream', forbidden: ['Cold', 'Sweet', 'Cone', 'Summer', 'Chocolate'] },
  { word: 'Fish', forbidden: ['Swim', 'Water', 'Sea', 'Fins', 'Ocean'] },
  { word: 'Birthday', forbidden: ['Cake', 'Party', 'Gift', 'Candles', 'Age'] },
];
