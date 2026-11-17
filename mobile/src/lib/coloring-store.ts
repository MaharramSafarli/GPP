import { loadJSON, saveJSON } from '@/lib/storage';

/** Saved fills of a free-coloring picture (one color per shape). */
export async function loadFills(id: string): Promise<string[]> {
  const v = await loadJSON<{ fills: string[] }>(`coloring-free-${id}`, { fills: [] });
  return Array.isArray(v.fills) ? v.fills : [];
}
export function saveFills(id: string, fills: string[]) {
  return saveJSON(`coloring-free-${id}`, { fills });
}

/** Saved progress of a color-by-number picture: '1' per painted cell. */
export async function loadDone(id: string, size: number): Promise<string> {
  const v = await loadJSON<{ done: string }>(`coloring-num-${id}`, { done: '' });
  return typeof v.done === 'string' && v.done.length === size ? v.done : '0'.repeat(size);
}
export function saveDone(id: string, done: string) {
  return saveJSON(`coloring-num-${id}`, { done });
}
