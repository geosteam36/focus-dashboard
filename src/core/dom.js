// core/dom.js
// Small DOM helpers so modules don't repeat document.querySelector boilerplate.

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function createEl(tag, { className, attrs = {}, text } = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

export function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
