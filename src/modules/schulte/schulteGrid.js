// modules/schulte/schulteGrid.js
// Pure logic for the Schulte Table: generating a shuffled grid and tracking
// click-order correctness. No DOM here — schulte.ui.js owns rendering.

import { shuffleArray } from '../../utils/shuffleArray.js';

export function generateGrid(size = 5) {
  const total = size * size;
  const numbers = Array.from({ length: total }, (_, i) => i + 1);
  return shuffleArray(numbers);
}

export class SchulteSession {
  constructor(size = 5) {
    this.size = size;
    this.grid = generateGrid(size);
    this.nextExpected = 1;
    this.startedAt = null;
    this.finishedAt = null;
  }

  get total() {
    return this.size * this.size;
  }

  get isComplete() {
    return this.nextExpected > this.total;
  }

  /** Call on the first click to start the clock. */
  start() {
    if (this.startedAt === null) this.startedAt = performance.now();
  }

  /**
   * Registers a click on the given number.
   * @returns {'correct' | 'incorrect' | 'complete'}
   */
  handleClick(value) {
    this.start();
    if (value !== this.nextExpected) return 'incorrect';

    this.nextExpected += 1;
    if (this.isComplete) {
      this.finishedAt = performance.now();
      return 'complete';
    }
    return 'correct';
  }

  get elapsedMs() {
    if (!this.startedAt) return 0;
    const end = this.finishedAt ?? performance.now();
    return end - this.startedAt;
  }
}
