// core/eventBus.js
// Minimal pub/sub so modules (Pomodoro, Schulte, ResourceLocker) can notify
// each other / the shell without importing one another directly.

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler); // returns an unsubscribe fn
  }

  off(event, handler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();

// Shared event name constants — avoids typo'd string mismatches between modules.
export const EVENTS = {
  TOAST_SHOW: 'toast:show',
  POMODORO_SESSION_END: 'pomodoro:session-end',
  SCHULTE_NEW_BEST: 'schulte:new-best',
  TAB_CHANGE: 'tabs:change',
};
