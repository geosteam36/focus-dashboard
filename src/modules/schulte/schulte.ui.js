// modules/schulte/schulte.ui.js
import { SchulteSession } from './schulteGrid.js';
import { getHighScores, recordScore } from './highscores.js';
import { formatSeconds } from '../../utils/formatTime.js';
import { eventBus, EVENTS } from '../../core/eventBus.js';
import { qs, qsa } from '../../core/dom.js';

const SIZE_OPTIONS = [4, 5, 6];

export function mountSchulte(root) {
  let size = 5;
  let session = new SchulteSession(size);
  let tickInterval = null;

  root.innerHTML = `
    <div class="flex flex-col items-center gap-6 py-6">
      <p class="text-sm text-slate-400 max-w-md text-center">
        Click the numbers in order, 1 through ${size * size}, as fast as you can.
        Keep your eyes near the center and use peripheral vision to find each number.
      </p>

      <div class="flex items-center gap-2" data-el="sizePicker"></div>

      <div class="flex items-center gap-6 font-mono text-2xl tabular-nums">
        <span data-el="clock" class="text-slate-100">0.00s</span>
        <span data-el="progress" class="text-slate-500 text-base">0 / ${size * size}</span>
      </div>

      <div data-el="grid" class="grid gap-2" style="grid-template-columns: repeat(${size}, minmax(0, 1fr));"></div>

      <div class="flex items-center gap-3">
        <button data-el="restart" class="px-5 py-2 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">New grid</button>
      </div>

      <div class="w-full max-w-xs">
        <h3 class="text-xs uppercase tracking-widest text-slate-500 mb-2 text-center">Best times (${size}×${size})</h3>
        <ol data-el="scores" class="font-mono text-sm text-slate-300 flex flex-col gap-1 items-center"></ol>
      </div>
    </div>
  `;

  const els = {
    sizePicker: qs('[data-el="sizePicker"]', root),
    clock: qs('[data-el="clock"]', root),
    progress: qs('[data-el="progress"]', root),
    grid: qs('[data-el="grid"]', root),
    restart: qs('[data-el="restart"]', root),
    scores: qs('[data-el="scores"]', root),
    intro: qs('p', root),
  };

  function renderSizePicker() {
    els.sizePicker.innerHTML = '';
    SIZE_OPTIONS.forEach((option) => {
      const btn = document.createElement('button');
      btn.textContent = `${option}×${option}`;
      btn.className = `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        option === size ? 'bg-teal-400 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`;
      btn.addEventListener('click', () => {
        size = option;
        startNewSession();
      });
      els.sizePicker.appendChild(btn);
    });
  }

  function renderScores() {
    const scores = getHighScores(size);
    els.scores.innerHTML = '';
    if (scores.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No times yet — be the first.';
      li.className = 'text-slate-500 text-xs';
      els.scores.appendChild(li);
      return;
    }
    scores.forEach((ms, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${formatSeconds(ms)}`;
      els.scores.appendChild(li);
    });
  }

  function renderGrid() {
    els.grid.innerHTML = '';
    els.grid.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    session.grid.forEach((value) => {
      const tile = document.createElement('button');
      tile.textContent = String(value);
      tile.dataset.value = String(value);
      tile.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-800 text-slate-100 font-mono text-lg font-semibold flex items-center justify-center transition-colors duration-150 hover:bg-slate-700';
      tile.addEventListener('click', () => handleTileClick(value, tile));
      els.grid.appendChild(tile);
    });
  }

  function handleTileClick(value, tileEl) {
    if (session.isComplete) return;
    const result = session.handleClick(value);

    if (!tickInterval) startClock();

    if (result === 'incorrect') {
      flashTile(tileEl, 'bg-rose-500/70');
      return;
    }

    tileEl.classList.add('opacity-30', 'pointer-events-none');
    flashTile(tileEl, 'bg-teal-500/70');
    els.progress.textContent = `${session.nextExpected - 1} / ${session.total}`;

    if (result === 'complete') {
      stopClock();
      const finalMs = session.elapsedMs;
      els.clock.textContent = formatSeconds(finalMs);
      const { isNewBest } = recordScore(size, finalMs);
      renderScores();
      eventBus.emit(EVENTS.TOAST_SHOW, {
        message: isNewBest
          ? `New best time: ${formatSeconds(finalMs)}!`
          : `Grid complete in ${formatSeconds(finalMs)}.`,
        variant: 'success',
      });
    }
  }

  function flashTile(tileEl, colorClass) {
    tileEl.classList.add(colorClass);
    setTimeout(() => tileEl.classList.remove(colorClass), 200);
  }

  function startClock() {
    tickInterval = setInterval(() => {
      els.clock.textContent = formatSeconds(session.elapsedMs);
    }, 50);
  }

  function stopClock() {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  function startNewSession() {
    stopClock();
    session = new SchulteSession(size);
    els.clock.textContent = '0.00s';
    els.progress.textContent = `0 / ${size * size}`;
    els.intro.textContent = `Click the numbers in order, 1 through ${size * size}, as fast as you can. Keep your eyes near the center and use peripheral vision to find each number.`;
    renderSizePicker();
    renderScores();
    renderGrid();
  }

  els.restart.addEventListener('click', startNewSession);

  startNewSession();
}
