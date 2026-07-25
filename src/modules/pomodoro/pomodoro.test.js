// modules/pomodoro/pomodoro.test.js
// Run with: npm run test (Vitest)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PomodoroTimer } from './pomodoro.js';
import { getPreset } from './presets.js';

describe('PomodoroTimer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initializes with the work duration from settings', () => {
    const timer = new PomodoroTimer({ settings: getPreset('classic') });
    expect(timer.getState().secondsRemaining).toBe(25 * 60);
    expect(timer.getState().sessionType).toBe('work');
  });

  it('counts down once started', () => {
    const timer = new PomodoroTimer({ settings: getPreset('classic') });
    timer.start();
    vi.advanceTimersByTime(3000);
    expect(timer.getState().secondsRemaining).toBe(25 * 60 - 3);
  });

  it('transitions from work to short break when a session ends', () => {
    const onSessionEnd = vi.fn();
    const preset = { ...getPreset('classic'), work: 1 / 60 }; // ~1 second for test speed
    const timer = new PomodoroTimer({ settings: preset, onSessionEnd });
    timer.start();
    vi.advanceTimersByTime(1200);
    expect(onSessionEnd).toHaveBeenCalled();
    expect(timer.getState().sessionType).toBe('short_break');
    expect(timer.getState().sessionsCompleted).toBe(1);
  });

  it('does not advance while paused', () => {
    const timer = new PomodoroTimer({ settings: getPreset('classic') });
    timer.start();
    vi.advanceTimersByTime(2000);
    timer.pause();
    const remainingAfterPause = timer.getState().secondsRemaining;
    vi.advanceTimersByTime(5000);
    expect(timer.getState().secondsRemaining).toBe(remainingAfterPause);
  });

  it('reset returns to a fresh work session', () => {
    const timer = new PomodoroTimer({ settings: getPreset('classic') });
    timer.start();
    vi.advanceTimersByTime(10000);
    timer.reset();
    const state = timer.getState();
    expect(state.status).toBe('idle');
    expect(state.sessionType).toBe('work');
    expect(state.secondsRemaining).toBe(25 * 60);
  });
});
