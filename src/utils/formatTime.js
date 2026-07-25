// utils/formatTime.js

/** Formats whole seconds as mm:ss, e.g. 65 -> "01:05" */
export function formatMMSS(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(safe / 60).toString().padStart(2, '0');
  const ss = (safe % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Formats milliseconds as ss.ms for the Schulte grid stopwatch, e.g. 8321 -> "8.32s" */
export function formatSeconds(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}
