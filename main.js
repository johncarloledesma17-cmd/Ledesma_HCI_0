(() => {
"use strict";
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];

// Main-page theme toggle. Keep the same preference key used by the feature pages.
const themeToggle = $("#themeToggle");
function applyTheme() {
  const isLight = document.body.classList.contains("light");
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    const label = $(".theme-label", themeToggle);
    if (label) label.textContent = isLight ? "Light" : "Theme";
    const icon = $("[aria-hidden='true']", themeToggle);
    if (icon) icon.textContent = isLight ? "☾" : "☼";
  }
}
try {
  if (localStorage.getItem("carloExeTheme") === "light") document.body.classList.add("light");
} catch (_) {}
applyTheme();
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    try { localStorage.setItem("carloExeTheme", isLight ? "light" : "dark"); } catch (_) {}
    applyTheme();
  });
}
$$('.interest-card').forEach(card=>card.addEventListener('click',()=>{const expanded=card.getAttribute('aria-expanded')==='true';card.setAttribute('aria-expanded',String(!expanded));const action=$('.card-action',card);if(action)action.innerHTML=expanded?'Click to reveal <span aria-hidden="true">↗</span>':'Click to close <span aria-hidden="true">↙</span>';}));
const skillTitle=$('#skillDetailTitle'),skillText=$('#skillDetailText');
$$('.skill-row').forEach(row=>row.addEventListener('click',()=>{$$('.skill-row').forEach(item=>item.classList.remove('active'));row.classList.add('active');if(skillTitle)skillTitle.textContent=row.dataset.skill;if(skillText)skillText.textContent=row.dataset.description;}));
})();

// Explore Lab experiences open in an overlay so the visitor stays on the one-page portfolio.
(()=>{
 const modal=document.querySelector('#experienceModal');
 const frame=document.querySelector('#experienceFrame');
 const title=document.querySelector('#experienceModalTitle');
 const closeButton=document.querySelector('#closeExperience');
 const cards=[...document.querySelectorAll('[data-experience]')];
 if(!modal||!frame||!closeButton)return;
 let lastFocus=null;
 function openExperience(card){
  lastFocus=document.activeElement;
  title.textContent=card.dataset.title||'Experience';
  frame.title=title.textContent;
  frame.src=card.dataset.experience;
  modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  closeButton.focus();
 }
 function closeExperience(){
  if(!modal.classList.contains('is-open'))return;
  modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
  frame.src='about:blank';
  if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();
 }
 cards.forEach(card=>card.addEventListener('click',()=>openExperience(card)));
 closeButton.addEventListener('click',closeExperience);
 modal.querySelectorAll('[data-close-experience]').forEach(el=>el.addEventListener('click',closeExperience));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeExperience();});
})();


// Secret File clues are hidden across the one-page portfolio and shared with the Secret File panel.
(() => {
  const triggers = [...document.querySelectorAll('.clue-trigger[data-clue]')];
  if (!triggers.length) return;
  const storageKey = 'carloExeSecretCluesV1';
  const validIds = [0, 1, 2];
  const load = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return new Set(Array.isArray(parsed) ? parsed.map(Number).filter(id => validIds.includes(id)) : []);
    } catch (_) { return new Set(); }
  };
  const save = found => { try { localStorage.setItem(storageKey, JSON.stringify([...found])); } catch (_) {} };
  const found = load();
  const render = () => triggers.forEach(button => {
    const id = Number(button.dataset.clue);
    const isFound = found.has(id);
    button.classList.toggle('found', isFound);
    button.setAttribute('aria-label', isFound ? `Hidden clue ${id + 1} discovered` : 'Discover a hidden clue');
    button.title = isFound ? `Clue ${id + 1} discovered` : 'You found something hidden…';
  });
  triggers.forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const id = Number(button.dataset.clue);
    if (!validIds.includes(id) || found.has(id)) { showToast('You already discovered this clue.'); return; }
    found.add(id); save(found); render();
    const count = found.size;
    showToast(count === 3 ? 'All clues found! Open Secret File to read the message.' : `Hidden clue found · ${count}/3`);
  }));
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) { found.clear(); load().forEach(id => found.add(id)); render(); }
  });
  render();
})();
