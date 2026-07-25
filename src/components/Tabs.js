// components/Tabs.js
import { eventBus, EVENTS } from '../core/eventBus.js';
import { storage } from '../core/storage.js';
import { STORAGE_KEYS, TABS } from '../core/constants.js';

const TAB_META = [
  { id: TABS.POMODORO, label: 'Pomodoro' },
  { id: TABS.SCHULTE, label: 'Focus Warm-Up' },
  { id: TABS.RESOURCES, label: 'Resource Locker' },
];

/**
 * Renders the tab bar and wires panel visibility.
 * @param {HTMLElement} tabBarEl
 * @param {Record<string, HTMLElement>} panels - map of tab id -> panel element
 */
export function mountTabs(tabBarEl, panels) {
  const savedTab = storage.get(STORAGE_KEYS.ACTIVE_TAB, TABS.POMODORO);
  let activeTab = TAB_META.some((t) => t.id === savedTab) ? savedTab : TABS.POMODORO;

  function render() {
    tabBarEl.innerHTML = '';
    TAB_META.forEach((tab) => {
      const btn = document.createElement('button');
      btn.textContent = tab.label;
      const isActive = tab.id === activeTab;
      btn.className = `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-slate-800 text-amber-300 shadow-inner'
          : 'text-slate-400 hover:text-slate-200'
      }`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(isActive));
      btn.addEventListener('click', () => setActiveTab(tab.id));
      tabBarEl.appendChild(btn);
    });

    Object.entries(panels).forEach(([id, panelEl]) => {
      panelEl.classList.toggle('hidden', id !== activeTab);
    });
  }

  function setActiveTab(id) {
    activeTab = id;
    storage.set(STORAGE_KEYS.ACTIVE_TAB, id);
    eventBus.emit(EVENTS.TAB_CHANGE, id);
    render();
  }

  render();
}
