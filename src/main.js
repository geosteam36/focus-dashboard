// main.js — app entry point
import { mountTabs } from './components/Tabs.js';
import { mountToaster } from './components/Toast.js';
import { mountPomodoro } from './modules/pomodoro/pomodoro.ui.js';
import { mountSchulte } from './modules/schulte/schulte.ui.js';
import { mountResourceLocker } from './modules/resourceLocker/resourceLocker.ui.js';
import { TABS } from './core/constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabBar = document.getElementById('tab-bar');
  const panels = {
    [TABS.POMODORO]: document.getElementById('panel-pomodoro'),
    [TABS.SCHULTE]: document.getElementById('panel-schulte'),
    [TABS.RESOURCES]: document.getElementById('panel-resources'),
  };
  const toastRoot = document.getElementById('toast-root');

  mountToaster(toastRoot);
  mountPomodoro(panels[TABS.POMODORO]);
  mountSchulte(panels[TABS.SCHULTE]);
  mountResourceLocker(panels[TABS.RESOURCES]);
  mountTabs(tabBar, panels);
});
