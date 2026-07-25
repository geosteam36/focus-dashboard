// modules/pomodoro/presets.js

export const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
};

export const PRESETS = [
  { id: 'classic', label: '25 / 5', work: 25, shortBreak: 5, longBreak: 15, sessionsUntilLongBreak: 4 },
  { id: 'extended', label: '50 / 10', work: 50, shortBreak: 10, longBreak: 20, sessionsUntilLongBreak: 3 },
  { id: 'deep', label: '90 / 20', work: 90, shortBreak: 20, longBreak: 30, sessionsUntilLongBreak: 2 },
  { id: 'custom', label: 'Custom', work: 25, shortBreak: 5, longBreak: 15, sessionsUntilLongBreak: 4 },
];

export function getPreset(id) {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
