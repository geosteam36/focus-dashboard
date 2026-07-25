// modules/resourceLocker/resourceLocker.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { resourceStore } from './resourceStore.js';

// jsdom provides window.localStorage in the Vitest environment (see vite.config.js).
beforeEach(() => {
  window.localStorage.clear();
});

describe('resourceStore', () => {
  it('seeds default resources on first read', () => {
    const items = resourceStore.getAll();
    expect(items.length).toBeGreaterThan(0);
  });

  it('adds a custom resource with a generated id and normalized tags', () => {
    const added = resourceStore.add({
      title: '  Egghead  ',
      description: 'Short screencasts on JS topics.',
      url: 'https://egghead.io',
      tags: ['JavaScript', ' React '],
    });
    expect(added.id).toMatch(/^custom-/);
    expect(added.title).toBe('Egghead');
    expect(added.tags).toEqual(['javascript', 'react']);
    expect(resourceStore.getAll().find((i) => i.id === added.id)).toBeTruthy();
  });

  it('removes a resource by id', () => {
    const added = resourceStore.add({ title: 'Temp', description: 'x', url: 'https://x.com', tags: [] });
    resourceStore.remove(added.id);
    expect(resourceStore.getAll().find((i) => i.id === added.id)).toBeUndefined();
  });

  it('collects a de-duplicated, sorted list of all tags', () => {
    resourceStore.add({ title: 'A', description: 'x', url: 'https://a.com', tags: ['zeta', 'alpha'] });
    resourceStore.add({ title: 'B', description: 'x', url: 'https://b.com', tags: ['alpha'] });
    const tags = resourceStore.allTags();
    expect(tags).toContain('alpha');
    expect(tags).toContain('zeta');
    expect(tags.indexOf('alpha')).toBeLessThan(tags.indexOf('zeta'));
  });
});
