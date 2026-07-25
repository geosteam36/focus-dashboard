// modules/pomodoro/pomodoro.js
// Pure state-machine for the Pomodoro timer. No DOM access here on purpose —
// pomodoro.ui.js is the only file that touches the page, which makes this
// class trivial to unit test.

import { SESSION_TYPES, getPreset } from './presets.js';

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
};

export class PomodoroTimer {
  /**
   * @param {object} options
   * @param {object} options.settings - { presetId, work, shortBreak, longBreak, sessionsUntilLongBreak } (minutes)
   * @param {(state: object) => void} options.onTick - called every second with current state
   * @param {(state: object) => void} options.onSessionEnd - called when a session completes
   */
  constructor({ settings, onTick, onSessionEnd }) {
    this.settings = settings ?? getPreset('classic');
    this.onTick = onTick ?? (() => {});
    this.onSessionEnd = onSessionEnd ?? (() => {});

    this.status = STATUS.IDLE;
    this.sessionType = SESSION_TYPES.WORK;
    this.sessionsCompleted = 0;
    this.secondsRemaining = this.settings.work * 60;
    this._intervalId = null;
  }

  getState() {
    return {
      status: this.status,
      sessionType: this.sessionType,
      sessionsCompleted: this.sessionsCompleted,
      secondsRemaining: this.secondsRemaining,
      totalSeconds: this._durationFor(this.sessionType) * 60,
    };
  }

  updateSettings(settings) {
    this.settings = settings;
    if (this.status === STATUS.IDLE) {
      this.secondsRemaining = this._durationFor(this.sessionType) * 60;
      this._emitTick();
    }
  }

  start() {
    if (this.status === STATUS.RUNNING) return;
    this.status = STATUS.RUNNING;
    this._intervalId = setInterval(() => this._tick(), 1000);
    this._emitTick();
  }

  pause() {
    if (this.status !== STATUS.RUNNING) return;
    this.status = STATUS.PAUSED;
    clearInterval(this._intervalId);
    this._emitTick();
  }

  reset() {
    clearInterval(this._intervalId);
    this.status = STATUS.IDLE;
    this.sessionType = SESSION_TYPES.WORK;
    this.sessionsCompleted = 0;
    this.secondsRemaining = this._durationFor(SESSION_TYPES.WORK) * 60;
    this._emitTick();
  }

  skip() {
    clearInterval(this._intervalId);
    this._advanceSession();
  }

  _tick() {
    this.secondsRemaining -= 1;
    if (this.secondsRemaining <= 0) {
      clearInterval(this._intervalId);
      this._advanceSession();
      return;
    }
    this._emitTick();
  }

  _advanceSession() {
    const finishedType = this.sessionType;
    if (finishedType === SESSION_TYPES.WORK) {
      this.sessionsCompleted += 1;
      const dueForLongBreak = this.sessionsCompleted % this.settings.sessionsUntilLongBreak === 0;
      this.sessionType = dueForLongBreak ? SESSION_TYPES.LONG_BREAK : SESSION_TYPES.SHORT_BREAK;
    } else {
      this.sessionType = SESSION_TYPES.WORK;
    }

    this.secondsRemaining = this._durationFor(this.sessionType) * 60;
    this.status = STATUS.RUNNING; // auto-continue into the next session
    this.onSessionEnd({ finishedType, ...this.getState() });
    this._intervalId = setInterval(() => this._tick(), 1000);
    this._emitTick();
  }

  _durationFor(sessionType) {
    if (sessionType === SESSION_TYPES.WORK) return this.settings.work;
    if (sessionType === SESSION_TYPES.SHORT_BREAK) return this.settings.shortBreak;
    return this.settings.longBreak;
  }

  _emitTick() {
    this.onTick(this.getState());
  }
}

export { STATUS };
