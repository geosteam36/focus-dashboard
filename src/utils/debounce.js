// utils/debounce.js

/** Delays invoking fn until `wait` ms have passed since the last call. */
export function debounce(fn, wait = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
