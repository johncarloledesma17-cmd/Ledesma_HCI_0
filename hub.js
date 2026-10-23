// Feature pages inherit the theme selected on index.html. There are no theme
// controls on feature pages; this script only applies the saved preference.
(() => {
  'use strict';
  const storageKey = 'carloExeTheme';

  function applySavedTheme() {
    let theme = 'dark';
    try {
      theme = localStorage.getItem(storageKey) === 'light' ? 'light' : 'dark';
    } catch (_) {
      // If storage is unavailable, use the default dark theme.
    }
    document.body.classList.toggle('light', theme === 'light');
  }

  applySavedTheme();
  // Keep a standalone feature page in sync if the preference changes in another
  // same-origin tab. The main portfolio overlay itself reads the saved theme
  // when its iframe loads.
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) applySavedTheme();
  });
})();
