import { loadJSON, saveJSON } from '@/lib/storage';

/** Saved fills of a free-coloring picture (one color per shape). */
export async function loadFills(id: string): Promise<string[]> {
  const v = await loadJSON<{ fills: string[] }>(`coloring-free-${id}`, { fills: [] });
  return Array.isArray(v.fills) ? v.fills : [];
}
export function saveFills(id: string, fills: string[]) {
  return saveJSON(`coloring-free-${id}`, { fills });
}
