// core/storage.js
// Thin, namespaced wrapper around localStorage so every module reads/writes
// the same way and nothing touches window.localStorage directly.

const NAMESPACE = 'focus-dashboard';

function keyFor(key) {
  return `${NAMESPACE}:${key}`;
}

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(keyFor(key));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[storage] failed to read "${key}"`, err);
      return fallback;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(keyFor(key), JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[storage] failed to write "${key}"`, err);
      return false;
    }
  },

  remove(key) {
    window.localStorage.removeItem(keyFor(key));
  },
};
