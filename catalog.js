/*
 * Catalog switcher for games.html (GAMES / PROGRAMS).
 * Accessible tabs: click, arrow keys, Home/End, and #games / #programs deep links.
 */
(() => {
  'use strict';
  const tabs = Array.from(document.querySelectorAll('.catalog-tab'));
  const panels = Array.from(document.querySelectorAll('.catalog-panel'));
  if (!tabs.length || !panels.length) return;

  const keys = tabs.map(tab => tab.dataset.catalog);

  function activate(key, { focus = false, updateHash = true } = {}) {
    if (!keys.includes(key)) key = keys[0];
    tabs.forEach(tab => {
      const selected = tab.dataset.catalog === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.catalogPanel !== key; });
    if (updateHash) {
      try { history.replaceState(null, '', `#${key}`); } catch (_) { /* file:// or sandbox */ }
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.catalog));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      activate(tabs[next].dataset.catalog, { focus: true });
    });
  });

  window.addEventListener('hashchange', () => {
    const key = location.hash.replace('#', '');
    if (keys.includes(key)) activate(key, { updateHash: false });
  });

  const initial = location.hash.replace('#', '');
  activate(keys.includes(initial) ? initial : keys[0], { updateHash: false });
})();
