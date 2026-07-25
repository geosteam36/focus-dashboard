// modules/resourceLocker/resourceStore.js
import { storage } from '../../core/storage.js';
import { STORAGE_KEYS } from '../../core/constants.js';
import { DEFAULT_RESOURCES } from './defaultResources.js';

function loadAll() {
  const saved = storage.get(STORAGE_KEYS.RESOURCES, null);
  if (saved === null) {
    // First run: seed with defaults so the grid isn't empty.
    storage.set(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES);
    return DEFAULT_RESOURCES;
  }
  return saved;
}

function saveAll(items) {
  storage.set(STORAGE_KEYS.RESOURCES, items);
}

export const resourceStore = {
  getAll() {
    return loadAll();
  },

  add({ title, description, url, tags }) {
    const items = loadAll();
    const newItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    };
    const updated = [newItem, ...items];
    saveAll(updated);
    return newItem;
  },

  remove(id) {
    const updated = loadAll().filter((item) => item.id !== id);
    saveAll(updated);
    return updated;
  },

  allTags() {
    const items = loadAll();
    const tagSet = new Set();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  },
};
