// modules/pomodoro/pomodoro.ui.js
import { PomodoroTimer } from './pomodoro.js';
import { PRESETS, getPreset, SESSION_TYPES } from './presets.js';
import { storage } from '../../core/storage.js';
import { eventBus, EVENTS } from '../../core/eventBus.js';
import { STORAGE_KEYS } from '../../core/constants.js';
import { formatMMSS } from '../../utils/formatTime.js';
import { qs } from '../../core/dom.js';

const SESSION_LABEL = {
  [SESSION_TYPES.WORK]: 'Focus',
  [SESSION_TYPES.SHORT_BREAK]: 'Short break',
  [SESSION_TYPES.LONG_BREAK]: 'Long break',
};

const RING_RADIUS = 90;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function mountPomodoro(root) {
  const savedSettings = storage.get(STORAGE_KEYS.POMODORO_SETTINGS, getPreset('classic'));
  let muted = storage.get(STORAGE_KEYS.POMODORO_MUTED, false);

  root.innerHTML = `
    <div class="flex flex-col items-center gap-8 py-6">
      <div class="flex flex-wrap justify-center gap-2" data-el="presets"></div>

      <div class="relative w-64 h-64 flex items-center justify-center">
        <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
          <circle cx="100" cy="100" r="${RING_RADIUS}" fill="none" stroke="#1E293B" stroke-width="10" />
          <circle data-el="ring" cx="100" cy="100" r="${RING_RADIUS}" fill="none" stroke="#F2B84B"
            stroke-width="10" stroke-linecap="round"
            stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="0"
            class="transition-[stroke-dashoffset] duration-1000 ease-linear" />
        </svg>
        <div class="absolute flex flex-col items-center">
          <span data-el="time" class="font-mono text-5xl tabular-nums text-slate-100 tracking-tight">25:00</span>
          <span data-el="sessionLabel" class="mt-1 text-sm uppercase tracking-widest text-amber-400">Focus</span>
        </div>
      </div>

      <p data-el="sessionCounter" class="text-sm text-slate-400 font-mono"></p>

      <div class="flex items-center gap-3">
        <button data-el="startPause" class="px-6 py-2.5 rounded-full bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition-colors">Start</button>
        <button data-el="reset" class="px-5 py-2.5 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">Reset</button>
        <button data-el="skip" class="px-5 py-2.5 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">Skip</button>
        <button data-el="mute" class="w-10 h-10 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors flex items-center justify-center" aria-label="Toggle sound"></button>
      </div>

      <details class="w-full max-w-sm" data-el="customDetails">
        <summary class="cursor-pointer text-sm text-slate-400 hover:text-slate-200 text-center">Custom interval</summary>
        <div class="mt-4 grid grid-cols-3 gap-3">
          <label class="flex flex-col text-xs text-slate-400 gap-1">Work (min)
            <input data-el="customWork" type="number" min="1" max="180" class="bg-slate-800 rounded-md px-2 py-1.5 text-slate-100 font-mono" />
          </label>
          <label class="flex flex-col text-xs text-slate-400 gap-1">Short break
            <input data-el="customShort" type="number" min="1" max="60" class="bg-slate-800 rounded-md px-2 py-1.5 text-slate-100 font-mono" />
          </label>
          <label class="flex flex-col text-xs text-slate-400 gap-1">Long break
            <input data-el="customLong" type="number" min="1" max="90" class="bg-slate-800 rounded-md px-2 py-1.5 text-slate-100 font-mono" />
          </label>
        </div>
        <button data-el="applyCustom" class="mt-3 text-xs px-4 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300 transition-colors">Apply custom preset</button>
      </details>
    </div>
  `;

  const els = {
    presets: qs('[data-el="presets"]', root),
    ring: qs('[data-el="ring"]', root),
    time: qs('[data-el="time"]', root),
    sessionLabel: qs('[data-el="sessionLabel"]', root),
    sessionCounter: qs('[data-el="sessionCounter"]', root),
    startPause: qs('[data-el="startPause"]', root),
    reset: qs('[data-el="reset"]', root),
    skip: qs('[data-el="skip"]', root),
    mute: qs('[data-el="mute"]', root),
    customWork: qs('[data-el="customWork"]', root),
    customShort: qs('[data-el="customShort"]', root),
    customLong: qs('[data-el="customLong"]', root),
    applyCustom: qs('[data-el="applyCustom"]', root),
  };

  els.customWork.value = savedSettings.work;
  els.customShort.value = savedSettings.shortBreak;
  els.customLong.value = savedSettings.longBreak;

  renderPresetButtons(els.presets, savedSettings.presetId ?? 'classic', (preset) => {
    settings = { ...preset, presetId: preset.id };
    storage.set(STORAGE_KEYS.POMODORO_SETTINGS, settings);
    timer.updateSettings(settings);
  });

  const audioCtx = { instance: null };
  function playAlertTone() {
    if (muted) return;
    // Lightweight WebAudio beep — no external sound file dependency required.
    try {
      audioCtx.instance = audioCtx.instance ?? new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.instance;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn('[pomodoro] audio alert failed', err);
    }
  }

  function updateMuteButton() {
    els.mute.textContent = muted ? '🔇' : '🔊';
  }
  updateMuteButton();

  let settings = savedSettings;

  const timer = new PomodoroTimer({
    settings,
    onTick: render,
    onSessionEnd: (state) => {
      playAlertTone();
      flashDocumentTitle(SESSION_LABEL[state.sessionType]);
      eventBus.emit(EVENTS.TOAST_SHOW, {
        message: `${SESSION_LABEL[state.finishedType]} session complete — starting ${SESSION_LABEL[state.sessionType].toLowerCase()}.`,
        variant: 'success',
      });
      render(state);
    },
  });

  function render(state) {
    els.time.textContent = formatMMSS(state.secondsRemaining);
    els.sessionLabel.textContent = SESSION_LABEL[state.sessionType];
    els.sessionCounter.textContent = `Sessions completed: ${state.sessionsCompleted}`;
    els.startPause.textContent = state.status === 'running' ? 'Pause' : 'Start';

    const progress = 1 - state.secondsRemaining / state.totalSeconds;
    els.ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * progress);

    document.title = state.status === 'running'
      ? `${formatMMSS(state.secondsRemaining)} · ${SESSION_LABEL[state.sessionType]}`
      : 'Focus Dashboard';
  }

  render(timer.getState());

  els.startPause.addEventListener('click', () => {
    if (timer.status === 'running') timer.pause();
    else timer.start();
  });
  els.reset.addEventListener('click', () => timer.reset());
  els.skip.addEventListener('click', () => timer.skip());
  els.mute.addEventListener('click', () => {
    muted = !muted;
    storage.set(STORAGE_KEYS.POMODORO_MUTED, muted);
    updateMuteButton();
  });
  els.applyCustom.addEventListener('click', () => {
    const customPreset = {
      id: 'custom',
      presetId: 'custom',
      label: 'Custom',
      work: Number(els.customWork.value) || 25,
      shortBreak: Number(els.customShort.value) || 5,
      longBreak: Number(els.customLong.value) || 15,
      sessionsUntilLongBreak: settings.sessionsUntilLongBreak ?? 4,
    };
    settings = customPreset;
    storage.set(STORAGE_KEYS.POMODORO_SETTINGS, settings);
    timer.updateSettings(settings);
    renderPresetButtons(els.presets, 'custom', () => {});
  });
}

function renderPresetButtons(container, activeId, onSelect) {
  container.innerHTML = '';
  PRESETS.forEach((preset) => {
    const btn = document.createElement('button');
    const isActive = preset.id === activeId;
    btn.textContent = preset.label;
    btn.className = `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'bg-amber-400 text-slate-900'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    }`;
    btn.addEventListener('click', () => {
      if (preset.id === 'custom') return; // custom is applied via the form
      renderPresetButtons(container, preset.id, onSelect);
      onSelect(preset);
    });
    container.appendChild(btn);
  });
}

function flashDocumentTitle(nextLabel) {
  const original = document.title;
  let flashes = 0;
  const interval = setInterval(() => {
    document.title = flashes % 2 === 0 ? `▶ ${nextLabel} started` : original;
    flashes += 1;
    if (flashes > 5) clearInterval(interval);
  }, 500);
}
