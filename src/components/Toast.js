// components/Toast.js
import { eventBus, EVENTS } from '../core/eventBus.js';

const VARIANT_CLASSES = {
  success: 'border-teal-400/60 text-teal-200',
  neutral: 'border-slate-600 text-slate-200',
  error: 'border-rose-500/60 text-rose-200',
};

export function mountToaster(root) {
  eventBus.on(EVENTS.TOAST_SHOW, ({ message, variant = 'neutral' }) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `pointer-events-auto bg-slate-900/95 border ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral} rounded-lg px-4 py-2.5 text-sm shadow-lg animate-[fadeIn_0.15s_ease-out]`;
    root.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  });
}
