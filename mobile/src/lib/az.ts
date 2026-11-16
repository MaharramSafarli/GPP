/**
 * Azerbaijani-aware upper case. JS engines don't always honour the `az`
 * locale, so map the dotted/dotless i explicitly: i → İ, ı → I.
 */
export function azUpper(text: string): string {
  return text.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

/** The 32 letters of the Azerbaijani alphabet, in order. */
export const AZ_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'Ə', 'F', 'G', 'Ğ', 'H', 'X', 'I', 'İ', 'J', 'K',
  'Q', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
];

/** Splits a word into grid letters (upper case, spaces and hyphens removed). */
export function toLetters(word: string): string[] {
  return Array.from(azUpper(word).replace(/[\s-]/g, ''));
}
