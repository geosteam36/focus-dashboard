// modules/schulte/schulte.test.js
import { describe, it, expect } from 'vitest';
import { generateGrid, SchulteSession } from './schulteGrid.js';

describe('generateGrid', () => {
  it('contains every number from 1 to size*size exactly once', () => {
    const grid = generateGrid(5);
    expect(grid).toHaveLength(25);
    expect([...grid].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
});

describe('SchulteSession', () => {
  it('accepts clicks in ascending order as correct', () => {
    const session = new SchulteSession(4);
    session.grid = [3, 1, 4, 2, 9, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16];
    expect(session.handleClick(1)).toBe('correct');
    expect(session.handleClick(2)).toBe('correct');
  });

  it('rejects an out-of-order click without advancing', () => {
    const session = new SchulteSession(4);
    expect(session.handleClick(2)).toBe('incorrect');
    expect(session.nextExpected).toBe(1);
  });

  it('reports complete on the final correct click', () => {
    const session = new SchulteSession(2); // 4 tiles
    for (let n = 1; n <= 3; n += 1) {
      expect(session.handleClick(n)).toBe('correct');
    }
    expect(session.handleClick(4)).toBe('complete');
    expect(session.isComplete).toBe(true);
  });
});
