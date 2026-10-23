(() => {
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
let toastTimer;
function showToast(message) { const toast=$("#toast"); if(!toast)return; toast.textContent=message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),1900); }

// Secret File: three clues, saved on this browser.
  const clueTriggers = $$(".clue-trigger"), clueRows = $$("[data-clue-status]"), secretMessage = $("#secretMessage"), secretProgress = $("#secretProgress"), secretProgressBar = $("#secretProgressBar"), secretReset = $("#secretReset"), secretStorageKey = "carloExeSecretCluesV1";
  const secretText = "SECRET UNLOCKED: You do not need to know everything to start. Stay curious, keep building, and trust the process. — Carlo";
  let foundClues = new Set();
  try { const saved = JSON.parse(localStorage.getItem(secretStorageKey) || "[]"); if (Array.isArray(saved)) foundClues = new Set(saved.filter(id => [0, 1, 2].includes(id))); } catch (_) {}
  function renderSecret(announce = false) {
    clueTriggers.forEach(btn => { const id = Number(btn.dataset.clue), found = foundClues.has(id); btn.classList.toggle("found", found); btn.setAttribute("aria-label", found ? `Hidden clue ${id + 1} discovered` : `Discover hidden clue ${id + 1}`); });
    clueRows.forEach(row => { const found = foundClues.has(Number(row.dataset.clueStatus)); row.classList.toggle("found", found); const status = $(".clue-status", row); if (status) status.textContent = found ? "FOUND ✓" : "LOCKED"; });
    const count = foundClues.size; if (secretProgress) secretProgress.setAttribute("aria-valuenow", String(count)); if (secretProgressBar) secretProgressBar.style.width = `${count / 3 * 100}%`;
    secretMessage.textContent = count === 3 ? secretText : `SECRET_FILE: ${count}/3 clues found. ${count === 0 ? "File locked. Look around the main portfolio for subtle symbols, or tap the symbols here to learn the system." : "Keep looking around the main portfolio for the remaining symbols."}`;
    secretMessage.classList.toggle("unlocked", count === 3); if (announce && count === 3) showToast("Secret file unlocked!");
  }
  clueTriggers.forEach(btn => btn.addEventListener("click", () => {
    const id = Number(btn.dataset.clue);
    if (![0, 1, 2].includes(id) || foundClues.has(id)) { if (foundClues.has(id)) showToast("You already found this clue."); return; }
    foundClues.add(id); try { localStorage.setItem(secretStorageKey, JSON.stringify([...foundClues])); } catch (_) {}
    renderSecret(true); if (foundClues.size < 3) showToast(`Clue ${id + 1} found — ${foundClues.size}/3`);
  }));
  if (secretReset) secretReset.addEventListener("click", () => { foundClues.clear(); try { localStorage.removeItem(secretStorageKey); } catch (_) {} renderSecret(); showToast("Secret clues reset."); });
  window.addEventListener("storage", event => {
    if (event.key === secretStorageKey || event.key === null) {
      foundClues.clear();
      try { const saved = JSON.parse(localStorage.getItem(secretStorageKey) || "[]"); if (Array.isArray(saved)) saved.filter(id => [0, 1, 2].includes(Number(id))).forEach(id => foundClues.add(Number(id))); } catch (_) {}
      renderSecret();
    }
  });
  renderSecret();
})();
