// modules/schulte/highscores.js
import { storage } from '../../core/storage.js';
import { STORAGE_KEYS } from '../../core/constants.js';

const MAX_ENTRIES = 5;

export function getHighScores(size) {
  const all = storage.get(STORAGE_KEYS.SCHULTE_HIGH_SCORES, {});
  return all[size] ?? [];
}

/**
 * Records a completion time (ms) for a given grid size.
 * @returns {{ scores: number[], isNewBest: boolean }}
 */
export function recordScore(size, timeMs) {
  const all = storage.get(STORAGE_KEYS.SCHULTE_HIGH_SCORES, {});
  const existing = all[size] ?? [];
  const wasEmpty = existing.length === 0;
  const isNewBest = wasEmpty || timeMs < Math.min(...existing);

  const updated = [...existing, timeMs].sort((a, b) => a - b).slice(0, MAX_ENTRIES);
  all[size] = updated;
  storage.set(STORAGE_KEYS.SCHULTE_HIGH_SCORES, all);

  return { scores: updated, isNewBest };
}
