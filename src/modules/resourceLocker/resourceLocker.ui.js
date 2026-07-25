// modules/resourceLocker/resourceLocker.ui.js
import { resourceStore } from './resourceStore.js';
import { debounce } from '../../utils/debounce.js';
import { eventBus, EVENTS } from '../../core/eventBus.js';
import { qs } from '../../core/dom.js';

export function mountResourceLocker(root) {
  let searchTerm = '';
  let activeTags = new Set();

  root.innerHTML = `
    <div class="flex flex-col gap-6 py-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          data-el="search"
          type="search"
          placeholder="Search resources…"
          class="flex-1 bg-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          aria-label="Search resources"
        />
        <button data-el="toggleForm" class="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap">
          + Add resource
        </button>
      </div>

      <div data-el="tagBar" class="flex flex-wrap gap-2"></div>

      <form data-el="addForm" class="hidden flex-col gap-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700">
        <div class="grid sm:grid-cols-2 gap-3">
          <input data-el="fieldTitle" required placeholder="Title" class="bg-slate-900 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500" />
          <input data-el="fieldUrl" required type="url" placeholder="https://…" class="bg-slate-900 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500" />
        </div>
        <textarea data-el="fieldDescription" required placeholder="Short description" rows="2" class="bg-slate-900 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 resize-none"></textarea>
        <input data-el="fieldTags" placeholder="Tags, comma separated (e.g. docs, css)" class="bg-slate-900 rounded-md px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500" />
        <div class="flex justify-end gap-2">
          <button type="button" data-el="cancelForm" class="px-4 py-1.5 rounded-full text-sm text-slate-400 hover:text-slate-200">Cancel</button>
          <button type="submit" class="px-4 py-1.5 rounded-full text-sm bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300">Save</button>
        </div>
      </form>

      <div data-el="grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      <p data-el="emptyState" class="hidden text-center text-slate-500 text-sm py-8">No resources match your search — try a different keyword or clear your tag filters.</p>
    </div>
  `;

  const els = {
    search: qs('[data-el="search"]', root),
    toggleForm: qs('[data-el="toggleForm"]', root),
    addForm: qs('[data-el="addForm"]', root),
    cancelForm: qs('[data-el="cancelForm"]', root),
    fieldTitle: qs('[data-el="fieldTitle"]', root),
    fieldUrl: qs('[data-el="fieldUrl"]', root),
    fieldDescription: qs('[data-el="fieldDescription"]', root),
    fieldTags: qs('[data-el="fieldTags"]', root),
    tagBar: qs('[data-el="tagBar"]', root),
    grid: qs('[data-el="grid"]', root),
    emptyState: qs('[data-el="emptyState"]', root),
  };

  function renderTagBar() {
    const tags = resourceStore.allTags();
    els.tagBar.innerHTML = '';
    tags.forEach((tag) => {
      const chip = document.createElement('button');
      const isActive = activeTags.has(tag);
      chip.textContent = `#${tag}`;
      chip.className = `px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive ? 'bg-teal-400 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`;
      chip.addEventListener('click', () => {
        if (isActive) activeTags.delete(tag);
        else activeTags.add(tag);
        renderTagBar();
        renderGrid();
      });
      els.tagBar.appendChild(chip);
    });
  }

  function matches(item) {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm = !term
      || item.title.toLowerCase().includes(term)
      || item.description.toLowerCase().includes(term);
    const matchesTags = activeTags.size === 0
      || item.tags.some((tag) => activeTags.has(tag));
    return matchesTerm && matchesTags;
  }

  function renderGrid() {
    const items = resourceStore.getAll().filter(matches);
    els.grid.innerHTML = '';
    els.emptyState.classList.toggle('hidden', items.length > 0);

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'group relative bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-2 hover:border-amber-400/50 transition-colors';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-slate-100 font-semibold hover:text-amber-300 transition-colors">${item.title}</a>
          ${item.id.startsWith('custom-')
            ? '<button data-action="remove" class="text-slate-500 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove resource">✕</button>'
            : ''}
        </div>
        <p class="text-sm text-slate-400">${item.description}</p>
        <div class="flex flex-wrap gap-1.5 mt-auto pt-2">
          ${item.tags.map((tag) => `<span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400">#${tag}</span>`).join('')}
        </div>
      `;
      const removeBtn = card.querySelector('[data-action="remove"]');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          resourceStore.remove(item.id);
          renderTagBar();
          renderGrid();
          eventBus.emit(EVENTS.TOAST_SHOW, { message: `Removed "${item.title}".`, variant: 'neutral' });
        });
      }
      els.grid.appendChild(card);
    });
  }

  const debouncedSearch = debounce((value) => {
    searchTerm = value;
    renderGrid();
  }, 200);

  els.search.addEventListener('input', (e) => debouncedSearch(e.target.value));

  els.toggleForm.addEventListener('click', () => {
    els.addForm.classList.toggle('hidden');
    els.addForm.classList.toggle('flex');
  });
  els.cancelForm.addEventListener('click', () => {
    els.addForm.classList.add('hidden');
    els.addForm.classList.remove('flex');
    els.addForm.reset();
  });

  els.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const tags = els.fieldTags.value.split(',').map((t) => t.trim()).filter(Boolean);
    resourceStore.add({
      title: els.fieldTitle.value,
      description: els.fieldDescription.value,
      url: els.fieldUrl.value,
      tags,
    });
    els.addForm.reset();
    els.addForm.classList.add('hidden');
    els.addForm.classList.remove('flex');
    renderTagBar();
    renderGrid();
    eventBus.emit(EVENTS.TOAST_SHOW, { message: 'Resource saved.', variant: 'success' });
  });

  renderTagBar();
  renderGrid();
}
