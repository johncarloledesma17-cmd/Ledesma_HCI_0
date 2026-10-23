(() => {
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
let toastTimer;
function showToast(message) { const toast=$("#toast"); if(!toast)return; toast.textContent=message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),1900); }

// Byte: animated pixel robot pet with needs, affection, pointer petting and visual reactions.
  const PET_STORAGE_KEY = "carloExeBytePetV1";
  const pet = { happiness: 70, energy: 65, hunger: 35, bond: 0, actions: 0, level: 1, sleeping: false };
  let savedPetPosition = { left: null, bottom: null };
  function savePetState() {
    try {
      const roomWidth = petRoom?.clientWidth || 0;
      const left = petFace && petFace.style.left ? parseFloat(petFace.style.left) : null;
      const bottom = petFace && petFace.style.bottom ? parseFloat(petFace.style.bottom) : null;
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify({ ...pet, left, bottom, savedAt: Date.now() }));
    } catch (_) { /* Storage may be unavailable; Byte still works for this session. */ }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(PET_STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") {
      ["happiness", "energy", "hunger"].forEach(key => { if (Number.isFinite(saved[key])) pet[key] = clamp(saved[key]); });
      ["bond", "actions"].forEach(key => { if (Number.isFinite(saved[key])) pet[key] = Math.max(0, saved[key]); });
      pet.sleeping = saved.sleeping === true;
      savedPetPosition = { left: Number.isFinite(saved.left) ? saved.left : null, bottom: Number.isFinite(saved.bottom) ? saved.bottom : null };
    }
  } catch (_) { /* Start with default stats if saved data is invalid. */ }
  const petFace = $("#petFace"), petSpeech = $("#petSpeech"), petRoom = $("#petRoom"), petHearts = $("#petHearts");
  const petCopy = {
    feed: { caption: "Byte absorbed a fresh energy cell.", feedback: "CHARGE COMPLETE. Byte's battery is feeling much better.", face: "is-eating", speech: "BZZT! DELICIOUS DATA." },
    play: { caption: "A tiny robot adventure with a new best friend.", feedback: "PLAY MODE! Byte did a happy little hop. Bond increased, energy used.", face: "is-playing", speech: "WHEEE! AGAIN?" },
    rest: { caption: "Quiet mode. Even tiny robots need to recharge.", feedback: "SLEEP MODE ENABLED. Byte is slowly recharging.", face: "is-sleeping", speech: "ZZZ... CHARGING." },
    pet: { caption: "Byte loves a gentle pat on its metal head.", feedback: "AFFECTION DETECTED. Byte's heart light is glowing.", face: "is-petting", speech: "BEEP BOOP ♥" },
    hello: { caption: "A tiny robot buddy, ready to hang out.", feedback: "Tap Byte or gently move your finger over the robot to pet it.", face: "is-curious", speech: "BEEP! HI, HUMAN." }
  };
  let petAnimationTimer;
  function petParticle(symbol = "♥") {
    if (!petHearts) return;
    const particle = document.createElement("span"); particle.className = "pet-particle"; particle.textContent = symbol;
    particle.style.setProperty("--drift", `${Math.round(Math.random() * 70 - 35)}px`);
    particle.style.left = `${35 + Math.random() * 30}%`; particle.style.top = `${32 + Math.random() * 28}%`;
    petHearts.append(particle); window.setTimeout(() => particle.remove(), 1050);
  }
  function animateByte(className, particles = false) {
    petFace.classList.remove("is-petting", "is-playing", "is-eating", "is-sleeping", "is-curious");
    void petFace.offsetWidth; petFace.classList.add(className);
    clearTimeout(petAnimationTimer);
    if (className !== "is-sleeping") petAnimationTimer = window.setTimeout(() => petFace.classList.remove(className), 2100);
    if (particles) { petParticle("♥"); window.setTimeout(() => petParticle("✦"), 130); window.setTimeout(() => petParticle("♥"), 260); }
  }
  function renderPet(actionKey = "hello") {
    const mood = pet.energy < 18 ? "sleepy" : pet.happiness >= 82 && pet.energy >= 35 ? "thriving" : pet.happiness >= 50 ? "happy" : "needs attention";
    const copy = petCopy[actionKey] || petCopy.hello;
    $("#petMood").textContent = `Mood: ${mood}`; $("#petCaption").textContent = copy.caption;
    $("#petFeedback").textContent = copy.feedback; petSpeech.textContent = copy.speech;
    petFace.setAttribute("aria-label", `Byte the pixel robot, ${mood}. Activate to pet Byte.`);
    $("#petMeter").style.width = `${pet.happiness}%`; $("#petMeterText").textContent = `${pet.happiness}%`;
    $("#petEnergyMeter").style.width = `${pet.energy}%`; $("#petEnergyText").textContent = `${pet.energy}%`;
    $("#petHungerMeter").style.width = `${pet.hunger}%`; $("#petHungerText").textContent = `${pet.hunger}%`;
    $("#petBond").textContent = `BOND: ${pet.bond}`; pet.level = 1 + Math.floor(pet.bond / 30);
    $("#petLevel").textContent = `LEVEL ${pet.level} · ${pet.level >= 4 ? "BEST FRIEND" : pet.level >= 3 ? "BUDDY PRO" : pet.level >= 2 ? "BUDDY IN TRAINING" : "NEW BUDDY"}`;
    if (actionKey !== "hello") animateByte(copy.face, actionKey === "pet" || actionKey === "play");
    else if (pet.sleeping) animateByte("is-sleeping");
    else animateByte("is-curious");
  }
  function petAction(kind) {
    pet.actions++;
    if (kind === "pet") { pet.happiness = clamp(pet.happiness + 6); pet.bond += 3; pet.sleeping = false; }
    if (kind === "feed") { if (pet.energy >= 95) { pet.happiness = clamp(pet.happiness - 1); showToast("Byte's battery is nearly full."); } else { pet.energy = clamp(pet.energy + 25); pet.hunger = clamp(pet.hunger - 24); pet.happiness = clamp(pet.happiness + 7); pet.bond += 4; } pet.sleeping = false; }
    if (kind === "play") { if (pet.energy < 15) { pet.happiness = clamp(pet.happiness - 3); showToast("Byte needs a recharge first. Try Sleep or Recharge."); renderPet("hello"); return; } pet.happiness = clamp(pet.happiness + 14); pet.energy = clamp(pet.energy - 17); pet.hunger = clamp(pet.hunger + 8); pet.bond += 7; pet.sleeping = false; }
    if (kind === "rest") { pet.energy = clamp(pet.energy + 30); pet.happiness = clamp(pet.happiness + 3); pet.hunger = clamp(pet.hunger + 4); pet.bond += 2; pet.sleeping = true; }
    if (kind !== "feed" && kind !== "rest") pet.hunger = clamp(pet.hunger + 2);
    renderPet(kind); savePetState(); if (kind === "rest") clearTimeout(byteRoamTimer); else scheduleByteWander(1600); if (pet.actions % 3 === 0) showToast(`Byte's bond is now ${pet.bond}.`);
  }
  $("#petByte").addEventListener("click", () => petAction("pet"));
  $("#feedPet").addEventListener("click", () => petAction("feed")); $("#playPet").addEventListener("click", () => petAction("play")); $("#restPet").addEventListener("click", () => petAction("rest"));
  function petFromTouch() { if (pet.sleeping) pet.sleeping = false; pet.happiness = clamp(pet.happiness + 2); pet.bond += 1; renderPet("pet"); savePetState(); }
  petFace.addEventListener("click", petFromTouch);
  petFace.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); petFromTouch(); } });
  let lastPetPointer = 0;
  petFace.addEventListener("pointermove", event => {
    if (event.pointerType === "mouse" && (event.buttons || Date.now() - lastPetPointer > 850)) {
      lastPetPointer = Date.now(); pet.happiness = clamp(pet.happiness + 1); pet.bond += 1; renderPet("pet");
    }
  });
  petRoom.addEventListener("pointerdown", event => { if (event.target.closest("#petFace")) return; if (pet.sleeping) pet.sleeping = false; petAction("play"); });
  // Autonomous wandering: Byte explores the room between interactions and can be invited to a spot.
  let byteRoamTimer = 0, byteWalkTimer = 0, bytePauseTimer = 0, byteDrag = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function moveByteTo(leftPx, duration = 900) {
    const maxLeft = Math.max(8, petRoom.clientWidth - petFace.offsetWidth - 8);
    const next = Math.max(8, Math.min(maxLeft, leftPx));
    const current = parseFloat(petFace.style.left) || petFace.offsetLeft;
    petFace.classList.toggle("facing-left", next < current);
    petFace.style.transitionDuration = `${duration}ms`;
    petFace.style.left = `${next}px`;
    petFace.classList.add("is-walking");
    clearTimeout(byteWalkTimer);
    byteWalkTimer = window.setTimeout(() => petFace.classList.remove("is-walking"), duration + 80);
  }
  function scheduleByteWander(delay = 2400) {
    clearTimeout(byteRoamTimer);
    if (prefersReducedMotion || pet.sleeping || document.hidden) return;
    byteRoamTimer = window.setTimeout(() => {
      if (pet.sleeping || byteDrag) { scheduleByteWander(3000); return; }
      const maxLeft = Math.max(8, petRoom.clientWidth - petFace.offsetWidth - 8);
      const current = parseFloat(petFace.style.left) || petFace.offsetLeft;
      let next = Math.random() * maxLeft;
      if (Math.abs(next - current) < 45) next = current < maxLeft / 2 ? maxLeft * .8 : maxLeft * .2;
      moveByteTo(next, 900 + Math.random() * 900);
      if (Math.random() > .55) { window.setTimeout(() => { if (!pet.sleeping) { petFace.classList.add("is-curious"); petParticle("✦"); } }, 1050); }
      scheduleByteWander(3800 + Math.random() * 4200);
    }, delay);
  }
  petRoom.addEventListener("pointerdown", event => {
    if (!event.target.closest("#petFace")) return;
    if (event.pointerType === "touch" || event.pointerType === "mouse") {
      byteDrag = { startX:event.clientX, startLeft:petFace.offsetLeft, moved:false };
      try { petFace.setPointerCapture(event.pointerId); } catch (_) {}
    }
  });
  petFace.addEventListener("pointermove", event => {
    if (!byteDrag) return;
    const dx = event.clientX - byteDrag.startX;
    if (Math.abs(dx) > 6) byteDrag.moved = true;
    if (byteDrag.moved) {
      const roomRect = petRoom.getBoundingClientRect();
      moveByteTo(byteDrag.startLeft + dx, 100);
      petFace.style.bottom = `${Math.max(18, Math.min(80, petRoom.clientHeight - (event.clientY - roomRect.top) - 55))}px`;
      pet.sleeping = false;
    }
  });
  petFace.addEventListener("pointerup", () => {
    if (byteDrag?.moved) { pet.bond += 2; pet.happiness = clamp(pet.happiness + 2); renderPet("pet"); }
    byteDrag = null; petFace.style.bottom = "24px"; savePetState(); scheduleByteWander(2600);
  });
  petFace.addEventListener("pointercancel", () => { byteDrag = null; petFace.style.bottom = "24px"; scheduleByteWander(2600); });
  petRoom.addEventListener("click", event => {
    if (event.target.closest("#petFace")) return;
    if (byteDrag) return;
    const rect = petRoom.getBoundingClientRect();
    moveByteTo(event.clientX - rect.left - petFace.offsetWidth / 2, 750);
    savePetState(); petSpeech.textContent = "ON MY WAY!"; petParticle("✦");
    scheduleByteWander(5000);
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(byteRoamTimer); else scheduleByteWander(900); });
  window.addEventListener("resize", () => { const maxLeft = petRoom.clientWidth - petFace.offsetWidth - 8; if (petFace.offsetLeft > maxLeft) petFace.style.left = `${Math.max(8,maxLeft)}px`; });
  scheduleByteWander(2200);

  $("#petReset").addEventListener("click", () => { Object.assign(pet, { happiness:70, energy:65, hunger:35, bond:0, actions:0, level:1, sleeping:false }); petFace.style.left = ""; petFace.style.bottom = "24px"; savedPetPosition = { left: null, bottom: null }; renderPet("hello"); savePetState(); showToast("Byte rebooted. Ready for a fresh start!"); });
  if (savedPetPosition.left !== null) petFace.style.left = `${savedPetPosition.left}px`;
  if (savedPetPosition.bottom !== null) petFace.style.bottom = `${savedPetPosition.bottom}px`;
  renderPet();
  savePetState();
})();
