(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  let toastTimer;
  function showToast(message) {
    const toast = $("#toast"); if (!toast) return;
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
  }

  // Theme toggle, with local persistence where browser storage is available.
  const themeToggle = $("#themeToggle");
  try { if (localStorage.getItem("carloExeTheme") === "light") document.body.classList.add("light"); } catch (_) {}
  function renderTheme() {
    const light = document.body.classList.contains("light");
    themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    const label = $(".theme-label", themeToggle); if (label) label.textContent = light ? "Light" : "Theme";
    const icon = $("[aria-hidden]", themeToggle); if (icon) icon.textContent = light ? "☾" : "☼";
  }
  renderTheme();
  themeToggle.addEventListener("click", () => {
    const light = document.body.classList.toggle("light");
    try { localStorage.setItem("carloExeTheme", light ? "light" : "dark"); } catch (_) {}
    renderTheme(); showToast(light ? "Light theme enabled" : "Dark theme enabled");
  });

  // Expandable interest cards.
  $$(".interest-card").forEach(card => card.addEventListener("click", () => {
    const expanded = card.getAttribute("aria-expanded") === "true";
    card.setAttribute("aria-expanded", String(!expanded));
    const action = $(".card-action", card);
    if (action) action.innerHTML = expanded ? 'Click to reveal <span aria-hidden="true">↗</span>' : 'Click to close <span aria-hidden="true">↙</span>';
  }));

  // Main skill list.
  const skillTitle = $("#skillDetailTitle"), skillText = $("#skillDetailText");
  $$(".skill-row").forEach(row => row.addEventListener("click", () => {
    $$(".skill-row").forEach(item => item.classList.remove("active")); row.classList.add("active");
    if (skillTitle) skillTitle.textContent = row.dataset.skill;
    if (skillText) skillText.textContent = row.dataset.description;
  }));

  // The original 45-second, three-question portfolio quiz.
  const mainQuestions = [
    { q: "Which game worlds do I enjoy?", options: ["Only chess", "MLBB, VALORANT & Roblox", "I never play games"], answer: 1, note: "Games are on the list: MLBB, VALORANT, and Roblox." },
    { q: "What am I studying?", options: ["Culinary Arts", "Marine Biology", "BS Information Technology"], answer: 2, note: "Correct—I'm studying BS Information Technology." },
    { q: "Which furry friends do I like?", options: ["Cats and dogs", "Only goldfish", "No pets"], answer: 0, note: "Cats and dogs! Both are part of my interests." }
  ];
  let mainIndex = 0, mainScore = 0, mainAnswered = false;
  const questionText = $("#questionText"), optionsWrap = $("#quizOptions"), feedback = $("#quizFeedback"), next = $("#quizNext"), questionCount = $("#questionCount"), progressBar = $("#progressBar");
  function renderMainQuestion() {
    const q = mainQuestions[mainIndex]; mainAnswered = false;
    questionCount.textContent = `QUESTION ${mainIndex + 1} OF ${mainQuestions.length}`;
    progressBar.style.width = `${((mainIndex + 1) / mainQuestions.length) * 100}%`;
    questionText.textContent = q.q; feedback.textContent = "Choose an answer to continue."; next.disabled = true;
    next.innerHTML = mainIndex === mainQuestions.length - 1 ? "See my result →" : "Next question →";
    optionsWrap.replaceChildren();
    q.options.forEach((label, i) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "quiz-option"; button.textContent = label;
      button.addEventListener("click", () => {
        if (mainAnswered) return; mainAnswered = true;
        $$(".quiz-option", optionsWrap).forEach((b, j) => { b.disabled = true; if (j === q.answer) b.classList.add("correct"); });
        if (i === q.answer) { mainScore++; feedback.textContent = `Correct! ${q.note}`; }
        else { button.classList.add("wrong"); feedback.textContent = `Not quite—but now you know. ${q.note}`; }
        next.disabled = false;
      }); optionsWrap.append(button);
    });
  }
  next.addEventListener("click", () => {
    if (!mainAnswered) return;
    if (mainIndex < mainQuestions.length - 1) { mainIndex++; renderMainQuestion(); }
    else {
      const panel = $("#quizPanel");
      panel.innerHTML = `<div class="quiz-progress"><span>CHALLENGE COMPLETE</span><span>✳</span></div><h3>${mainScore === 3 ? "You got my vibe!" : mainScore >= 2 ? "You were paying attention!" : "Now you know a little more!"}</h3><p class="quiz-feedback">${mainScore} out of 3 correct. Thanks for exploring my little corner of the internet.</p><button class="quiz-next" id="quizRestart" type="button">Play again ↻</button>`;
      $("#quizRestart").addEventListener("click", () => location.reload());
    }
  });
  renderMainQuestion();

  // Secret File: three clues, saved on this browser.
  const clueTriggers = $$(".clue-trigger"), clueRows = $$("[data-clue-status]"), secretMessage = $("#secretMessage"), secretProgress = $("#secretProgress"), secretProgressBar = $("#secretProgressBar"), secretReset = $("#secretReset"), secretStorageKey = "carloExeSecretCluesV1";
  const secretText = "SECRET UNLOCKED: You do not need to know everything to start. Stay curious, keep building, and trust the process. — Carlo";
  let foundClues = new Set();
  try { const saved = JSON.parse(localStorage.getItem(secretStorageKey) || "[]"); if (Array.isArray(saved)) foundClues = new Set(saved.filter(id => [0, 1, 2].includes(id))); } catch (_) {}
  function renderSecret(announce = false) {
    clueTriggers.forEach(btn => { const id = Number(btn.dataset.clue), found = foundClues.has(id); btn.classList.toggle("found", found); btn.setAttribute("aria-label", found ? `Hidden clue ${id + 1} discovered` : `Discover hidden clue ${id + 1}`); });
    clueRows.forEach(row => { const found = foundClues.has(Number(row.dataset.clueStatus)); row.classList.toggle("found", found); const status = $(".clue-status", row); if (status) status.textContent = found ? "FOUND ✓" : "LOCKED"; });
    const count = foundClues.size; if (secretProgress) secretProgress.setAttribute("aria-valuenow", String(count)); if (secretProgressBar) secretProgressBar.style.width = `${count / 3 * 100}%`;
    secretMessage.textContent = count === 3 ? secretText : `SECRET_FILE: ${count}/3 clues found. ${count === 0 ? "File locked." : "Keep looking."}`;
    secretMessage.classList.toggle("unlocked", count === 3); if (announce && count === 3) showToast("Secret file unlocked!");
  }
  clueTriggers.forEach(btn => btn.addEventListener("click", () => {
    const id = Number(btn.dataset.clue);
    if (![0, 1, 2].includes(id) || foundClues.has(id)) { if (foundClues.has(id)) showToast("You already found this clue."); return; }
    foundClues.add(id); try { localStorage.setItem(secretStorageKey, JSON.stringify([...foundClues])); } catch (_) {}
    renderSecret(true); if (foundClues.size < 3) showToast(`Clue ${id + 1} found — ${foundClues.size}/3`);
  }));
  secretReset.addEventListener("click", () => { foundClues.clear(); try { localStorage.removeItem(secretStorageKey); } catch (_) {} renderSecret(); showToast("Secret clues reset."); }); renderSecret();

  // Personality.exe: five questions, answer editing, profile results, and copy option.
  const personalityQuestions = [
    { q: "1. A new challenge appears. You…", options: [["Explore every option", "explorer"], ["Make a plan first", "strategist"], ["Start making something", "creator"]] },
    { q: "2. Your ideal tutorial is…", options: [["A rabbit hole of links and experiments", "explorer"], ["A clear sequence from A to B", "strategist"], ["A project I can follow along with", "creator"]] },
    { q: "3. When something breaks, you…", options: [["Try different things to see what happens", "explorer"], ["Trace the steps and isolate the cause", "strategist"], ["Tinker until I find a working version", "creator"]] },
    { q: "4. A free afternoon is best spent…", options: [["Learning something completely new", "explorer"], ["Organizing goals and making progress", "strategist"], ["Building, drawing, editing, or making", "creator"]] },
    { q: "5. Your favorite kind of win is…", options: [["A surprising discovery", "explorer"], ["A problem solved efficiently", "strategist"], ["Something real that I made", "creator"]] }
  ];
  const personalityTypes = {
    explorer: { title: "THE EXPLORER", icon: "✳", tagline: "Curiosity is your compass.", desc: "You learn by following questions, trying new paths, and connecting ideas that did not seem related at first.", strengths: "Open-mindedness · Adaptability · Discovery", tip: "Keep a curiosity list. Pick one question each week and follow it until you learn something useful." },
    strategist: { title: "THE STRATEGIST", icon: "⌘", tagline: "A good plan makes room for big ideas.", desc: "You like patterns, structure, and breaking a big challenge into smaller, manageable steps.", strengths: "Planning · Analysis · Consistency", tip: "Before starting, define one small outcome and a checkpoint. Leave a little room for unexpected discoveries." },
    creator: { title: "THE CREATOR", icon: "↗", tagline: "Your ideas want to become real things.", desc: "You learn by making, testing, and improving. A prototype often teaches you more than a perfect plan.", strengths: "Imagination · Experimentation · Making", tip: "Build a tiny first version, show it to someone, and improve it using one piece of feedback." }
  };
  let personalityIndex = 0; const personalityAnswers = [];
  const personalityQuestion = $("#personalityQuestion"), personalityOptions = $("#personalityOptions"), personalityResult = $("#personalityResult"), personalityRestart = $("#personalityRestart"), personalityBack = $("#personalityBack");
  function personalityWinner() {
    const score = { explorer: 0, strategist: 0, creator: 0 }; personalityAnswers.forEach(type => { if (type) score[type]++; });
    const max = Math.max(...Object.values(score)); const tied = Object.keys(score).filter(type => score[type] === max);
    return tied.find(type => type === personalityAnswers.filter(Boolean).at(-1)) || tied[0];
  }
  function renderPersonality() {
    const item = personalityQuestions[personalityIndex];
    $("#personalityStep").textContent = `QUESTION ${personalityIndex + 1} / ${personalityQuestions.length}`;
    $("#personalityPercent").textContent = `${Math.round((personalityIndex + 1) / personalityQuestions.length * 100)}%`;
    $("#personalityProgressBar").style.width = `${(personalityIndex + 1) / personalityQuestions.length * 100}%`;
    personalityQuestion.textContent = item.q; personalityOptions.replaceChildren();
    item.options.forEach(([label, type]) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "personality-choice"; button.setAttribute("aria-pressed", String(personalityAnswers[personalityIndex] === type));
      const marker = document.createElement("span"); marker.className = "choice-marker"; marker.textContent = personalityAnswers[personalityIndex] === type ? "✓" : "";
      const text = document.createElement("span"); text.textContent = label; button.append(marker, text);
      if (personalityAnswers[personalityIndex] === type) button.classList.add("selected");
      button.addEventListener("click", () => { personalityAnswers[personalityIndex] = type; if (personalityIndex < personalityQuestions.length - 1) { personalityIndex++; renderPersonality(); } else renderPersonalityResult(); });
      personalityOptions.append(button);
    });
    personalityBack.disabled = personalityIndex === 0; personalityRestart.textContent = "Start over ↻";
    personalityResult.textContent = personalityAnswers[personalityIndex] ? "Answer saved — choose another option to change it." : "Pick the answer that feels most like you.";
  }
  function renderPersonalityResult() {
    const result = personalityTypes[personalityWinner()];
    $("#personalityStep").textContent = "PROFILE GENERATED"; $("#personalityPercent").textContent = "100%"; $("#personalityProgressBar").style.width = "100%";
    personalityQuestion.replaceChildren(); const icon = document.createElement("span"); icon.className = "result-icon"; icon.textContent = result.icon;
    const title = document.createElement("span"); title.textContent = result.title; const tagline = document.createElement("small"); tagline.textContent = result.tagline; personalityQuestion.append(icon, title, tagline);
    personalityOptions.replaceChildren();
    const description = document.createElement("p"); description.className = "personality-description"; description.textContent = result.desc;
    const strengths = document.createElement("p"); strengths.className = "personality-strengths"; strengths.textContent = `YOUR EDGE / ${result.strengths}`;
    const tip = document.createElement("p"); tip.className = "personality-tip"; tip.textContent = `TRY THIS → ${result.tip}`;
    const share = document.createElement("button"); share.type = "button"; share.className = "personality-share"; share.textContent = "Copy my profile ↗";
    share.addEventListener("click", async () => { const text = `My learner type: ${result.title}\n${result.tagline}\n${result.desc}`; try { await navigator.clipboard.writeText(text); showToast("Profile copied!"); } catch (_) { showToast("Your result is ready to screenshot!"); } });
    personalityOptions.append(description, strengths, tip, share); personalityBack.disabled = true; personalityRestart.textContent = "Retake quiz ↻"; personalityResult.textContent = "RESULT COMPLETE · Your style can change as you learn.";
  }
  personalityBack.addEventListener("click", () => { if (personalityIndex > 0) { personalityIndex--; renderPersonality(); } });
  personalityRestart.addEventListener("click", () => { personalityIndex = 0; personalityAnswers.length = 0; renderPersonality(); }); renderPersonality();

  // Byte: animated pixel robot pet with needs, affection, pointer petting and visual reactions.
  const pet = { happiness: 70, energy: 65, hunger: 35, bond: 0, actions: 0, level: 1, sleeping: false };
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
    renderPet(kind); if (kind === "rest") clearTimeout(byteRoamTimer); else scheduleByteWander(1600); if (pet.actions % 3 === 0) showToast(`Byte's bond is now ${pet.bond}.`);
  }
  $("#petByte").addEventListener("click", () => petAction("pet"));
  $("#feedPet").addEventListener("click", () => petAction("feed")); $("#playPet").addEventListener("click", () => petAction("play")); $("#restPet").addEventListener("click", () => petAction("rest"));
  function petFromTouch() { if (pet.sleeping) pet.sleeping = false; pet.happiness = clamp(pet.happiness + 2); pet.bond += 1; renderPet("pet"); }
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
    byteDrag = null; petFace.style.bottom = "24px"; scheduleByteWander(2600);
  });
  petFace.addEventListener("pointercancel", () => { byteDrag = null; petFace.style.bottom = "24px"; scheduleByteWander(2600); });
  petRoom.addEventListener("click", event => {
    if (event.target.closest("#petFace")) return;
    if (byteDrag) return;
    const rect = petRoom.getBoundingClientRect();
    moveByteTo(event.clientX - rect.left - petFace.offsetWidth / 2, 750);
    petSpeech.textContent = "ON MY WAY!"; petParticle("✦");
    scheduleByteWander(5000);
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(byteRoamTimer); else scheduleByteWander(900); });
  window.addEventListener("resize", () => { const maxLeft = petRoom.clientWidth - petFace.offsetWidth - 8; if (petFace.offsetLeft > maxLeft) petFace.style.left = `${Math.max(8,maxLeft)}px`; });
  scheduleByteWander(2200);

  $("#petReset").addEventListener("click", () => { Object.assign(pet, { happiness:70, energy:65, hunger:35, bond:0, actions:0, level:1, sleeping:false }); renderPet("hello"); showToast("Byte rebooted. Ready for a fresh start!"); });
  renderPet();

  // Skill Tree 2.0: constellation RPG, mixed challenges, local progress, achievements, and capstone.
  const treeStorageKey = "carloExeSkillRPGV2";
  const treeData = {
    "Curiosity": { icon:"✳", type:"CORE NODE", desc:"Every path begins with curiosity: ask questions, test ideas, and learn from mistakes.", next:"Choose any starter branch and complete its challenge.", xp:0, requires:[], difficulty:"STARTER", q:"What is the best first step when you encounter an unfamiliar programming problem?", options:["Break it into smaller parts and investigate.","Copy the first solution you find.","Skip straight to advanced tools."], answer:0, hint:"Good problem-solvers make the problem easier to reason about.", explain:"Breaking a problem into smaller pieces makes it easier to understand, test, and solve." },
    "Python": { icon:"Py", type:"PROGRAMMING PATH", desc:"Build programming logic, automate small tasks, and turn a large problem into clear steps.", next:"Try a tiny calculator, quiz, or payroll calculation.", xp:35, requires:["Curiosity"], difficulty:"EASY", q:"What does `len([4, 8, 12])` return in Python?", options:["2","3","12"], answer:1, hint:"Count the items in the list, not the value of the last item.", explain:"The list contains three elements, so len(...) returns 3." },
    "Web": { icon:"</>", type:"WEB DESIGN PATH", desc:"Combine HTML structure, CSS styling, and accessible layout to make useful web experiences.", next:"Build a responsive profile card and test it at mobile width.", xp:35, requires:["Curiosity"], difficulty:"EASY", q:"Which technology is primarily responsible for styling a web page?", options:["CSS","SQL","DNS"], answer:0, hint:"It controls colors, spacing, typography, and layout.", explain:"CSS styles the presentation of HTML content." },
    "Data": { icon:"DB", type:"DATA PATH", desc:"Organize information in tables and use queries to retrieve useful answers.", next:"Create a small database with a table and three SELECT queries.", xp:35, requires:["Curiosity"], difficulty:"EASY", q:"Which SQL command retrieves rows from a table?", options:["SELECT","PAINT","ROUTE"], answer:0, hint:"It is the command you use to read data.", explain:"SELECT retrieves data from one or more tables." },
    "Networks": { icon:"↔", type:"SYSTEMS PATH", desc:"Understand how devices communicate and how information travels between systems.", next:"Sketch the journey from a browser request to a website response.", xp:35, requires:["Curiosity"], difficulty:"EASY", q:"What does DNS mainly help a device do?", options:["Style a webpage","Translate domain names to IP addresses","Encrypt every file automatically"], answer:1, hint:"It helps the internet find the server associated with a domain name.", explain:"DNS resolves human-readable domain names to IP addresses." },
    "JavaScript": { icon:"JS", type:"INTERACTION PATH", desc:"Add behavior to web pages with events, state, and useful feedback.", next:"Create a button that updates a status message and handles repeated clicks.", xp:45, requires:["Web"], difficulty:"MEDIUM", q:"Which event is commonly used when a user activates a button?", options:["click","paint","resize-only"], answer:0, hint:"It describes the user's pointer or keyboard activation of an element.", explain:"A click event is a common way to respond to button activation." },
    "SQL": { icon:"⌘", type:"DATABASE QUEST", desc:"Move beyond tables into filtering, sorting, and joining related data.", next:"Write a query that joins two related tables using a shared key.", xp:45, requires:["Data"], difficulty:"MEDIUM", q:"Which clause filters rows before grouping results?", options:["WHERE","ORDER BY","CREATE VIEW"], answer:0, hint:"It sets a condition for which rows are returned.", explain:"WHERE filters rows according to a condition." },
    "OOP": { icon:"{}", type:"CODE ARCHITECTURE", desc:"Use classes and objects to organize related data and behavior into reusable pieces.", next:"Model an employee with a class and two different pay calculation methods.", xp:45, requires:["Python"], difficulty:"MEDIUM", q:"In object-oriented programming, what is a class?", options:["A blueprint for creating objects","A network cable","A database row only"], answer:0, hint:"Objects are created based on this definition.", explain:"A class defines data and behavior that objects created from it can use." },
    "Security": { icon:"◇", type:"DEFENSE PATH", desc:"Practice safer digital habits, understand access control, and recognize common risks.", next:"Make a checklist for protecting a student web application.", xp:45, requires:["Networks"], difficulty:"MEDIUM", q:"What is a good default for a user account's permissions?", options:["Give every permission","Use least privilege","Share one admin password"], answer:1, hint:"Give users only the access they need for their tasks.", explain:"Least privilege reduces unnecessary access and limits potential damage." },
    "Full-stack": { icon:"⚡", type:"ELITE QUEST", desc:"Combine front-end interaction, application logic, and persistent data in one small product.", next:"Build a small task tracker with a responsive interface and database-backed records.", xp:80, requires:["JavaScript","SQL","OOP"], difficulty:"HARD", q:"A full-stack app needs to save a user's task. Which design best connects the parts?", options:["The UI sends data to application logic, which validates and stores it through a database layer.","Store all records only in a heading tag.","Let the browser execute arbitrary database commands directly."], answer:0, hint:"Think about a clear flow between the interface, application logic, and storage.", explain:"A layered design lets the UI send requests to application logic, which validates data and safely interacts with storage." },
    "Final Boss": { icon:"★", type:"CAPSTONE BOSS", desc:"The final encounter: combine problem-solving, interface design, data, and system thinking into one coherent project plan.", next:"Defeat the boss by answering the capstone scenario, then review the project checklist.", xp:120, requires:["Full-stack","Security"], difficulty:"BOSS", q:"You are planning a student project that stores user data. What is the strongest first release plan?", options:["Build everything at once without testing","Create a small working flow, validate inputs, protect access, and test it on mobile","Focus only on animations and postpone data safety"], answer:1, hint:"Balance a working core with usability, validation, and safety from the start.", explain:"A small end-to-end release with validation, access controls, and usability testing reduces risk and gives you something testable." }
  };
  const treeDefault = { xp:0, completed:[], selected:"Curiosity", skillPoints:0, badges:[], questLog:[] };
  let treeState = {...treeDefault};
  try { const saved = JSON.parse(localStorage.getItem(treeStorageKey) || "null"); if (saved && typeof saved === "object") treeState = {...treeDefault, ...saved, completed:Array.isArray(saved.completed)?saved.completed:[], badges:Array.isArray(saved.badges)?saved.badges:[], questLog:Array.isArray(saved.questLog)?saved.questLog:[]}; } catch (_) {}
  treeState.completed = [...new Set(treeState.completed.filter(n => treeData[n] && n !== "Curiosity"))];
  treeState.completed.unshift("Curiosity");
  const treeNodeButtons = $$(".constellation-node");
  let selectedAnswer = null, answerChecked = false;
  const badgeDefinitions = [
    {id:"first", name:"First Spark", icon:"✦", test:() => treeState.completed.length > 1},
    {id:"code", name:"Code Crafter", icon:"⌘", test:() => treeState.completed.includes("Python") && treeState.completed.includes("OOP")},
    {id:"data", name:"Data Keeper", icon:"◇", test:() => treeState.completed.includes("Data") && treeState.completed.includes("SQL")},
    {id:"network", name:"Network Scout", icon:"↔", test:() => treeState.completed.includes("Networks") && treeState.completed.includes("Security")},
    {id:"quest", name:"Quest Runner", icon:"⚡", test:() => treeState.completed.includes("Full-stack")},
    {id:"boss", name:"Boss Breaker", icon:"★", test:() => treeState.completed.includes("Final Boss")}
  ];
  function treeUnlocked(name) { return name === "Curiosity" || treeData[name].requires.every(req => treeState.completed.includes(req)); }
  function treeLevel() { return Math.floor(treeState.xp / 100) + 1; }
  function saveTree() { try { localStorage.setItem(treeStorageKey, JSON.stringify(treeState)); } catch (_) {} }
  function awardTreeBadges() { badgeDefinitions.forEach(b => { if (b.test() && !treeState.badges.includes(b.id)) { treeState.badges.push(b.id); showToast(`Achievement unlocked: ${b.name}!`); } }); }
  function renderTreeAchievements() {
    const grid = $("#treeAchievements"); grid.replaceChildren();
    badgeDefinitions.forEach(b => { const earned = treeState.badges.includes(b.id); const card = document.createElement("div"); card.className = `achievement ${earned ? "earned" : "locked"}`; const icon = document.createElement("span"); icon.textContent = b.icon; const label = document.createElement("small"); label.textContent = b.name; card.append(icon,label); card.title = earned ? `${b.name} unlocked` : `Locked achievement: ${b.name}`; grid.append(card); });
    $("#treeBadgesCount").textContent = `${treeState.badges.length}/6`; $("#treeBadgeSummary").textContent = `${treeState.badges.length} earned`;
  }
  function renderTreeStats() {
    const level = treeLevel(), within = treeState.xp % 100;
    $("#treeLevel").textContent = String(level).padStart(2,"0"); $("#treeXp").textContent = `${treeState.xp} XP`; $("#treePoints").textContent = String(treeState.skillPoints);
    $("#treeLevelProgress").textContent = `${within} / 100 XP`; $("#treeXpBar").style.width = `${within}%`; $("#treeXpProgress").setAttribute("aria-valuenow",String(within));
    $("#treeQuestCount").textContent = `${treeState.questLog.length} completed`;
    const log = $("#treeQuestLog"); log.replaceChildren();
    if (!treeState.questLog.length) { const li=document.createElement("li"); li.textContent="No quests completed yet. Choose an available node to begin."; log.append(li); }
    else treeState.questLog.slice(-5).reverse().forEach(entry => { const li=document.createElement("li"); li.textContent=`${entry.name} · +${entry.xp} XP`; log.append(li); });
  }
  function renderConstellation() {
    treeNodeButtons.forEach(btn => { const name=btn.dataset.tree, done=treeState.completed.includes(name), unlocked=treeUnlocked(name); btn.classList.toggle("completed",done && name!=="Curiosity"); btn.classList.toggle("unlocked",unlocked && !done); btn.classList.toggle("locked",!unlocked); btn.classList.toggle("active",treeState.selected===name); btn.setAttribute("aria-pressed",String(treeState.selected===name)); btn.disabled=!unlocked; const small=btn.querySelector("small"); if (small) small.textContent=done ? (name==="Curiosity"?"CORE":"COMPLETE") : unlocked ? (name==="Final Boss"?"BOSS READY":"AVAILABLE") : "LOCKED"; });
    const lines=$("#constellationLines"); if (lines) lines.classList.toggle("has-progress",treeState.completed.length>1);
  }
  function renderTreeDetail() {
    const name=treeState.selected, info=treeData[name], done=treeState.completed.includes(name), unlocked=treeUnlocked(name), detail=$("#treeDetail"); detail.replaceChildren();
    const title=document.createElement("strong"); title.textContent=`${info.icon}  ${name}`; const desc=document.createElement("p"); desc.textContent=info.desc; const meta=document.createElement("span"); meta.className="tree-detail-meta"; meta.textContent=done?`${info.type} · COMPLETED`:unlocked?`${info.type} · +${info.xp} XP AVAILABLE`:`LOCKED · REQUIRES ${info.requires.join(" + ").toUpperCase()}`; const next=document.createElement("p"); next.className="tree-next-quest"; next.textContent=done?`CLEARED: ${info.next}`:unlocked?`NEXT QUEST: ${info.next}`:`Unlock the prerequisite nodes first: ${info.requires.join(", ")}.`; detail.append(title,desc,meta,next);
    $("#treeQuestTitle").textContent=done?`${name} cleared!`:name==="Final Boss"?"Final Boss: capstone challenge":`Quest: ${name}`; $("#treeQuestDifficulty").textContent=done?"CLEARED":info.difficulty; $("#treeQuestPrompt").textContent=done?`You've completed this challenge. ${info.next}`:info.q;
    const options=$("#treeQuestOptions"); options.replaceChildren(); selectedAnswer=null; answerChecked=false;
    if (done) { const doneMsg=document.createElement("p"); doneMsg.className="quest-complete-note"; doneMsg.textContent="✓ QUEST COMPLETE · Progress saved in this browser."; options.append(doneMsg); }
    else if (!unlocked) { const locked=document.createElement("p"); locked.className="quest-locked-note"; locked.textContent=`This quest is locked. Complete: ${info.requires.join(", ")}.`; options.append(locked); }
    else info.options.forEach((label,index)=>{const button=document.createElement("button");button.type="button";button.dataset.answer=String(index);button.textContent=`${String.fromCharCode(65+index)}. ${label}`;button.addEventListener("click",()=>{if(answerChecked)return;selectedAnswer=index;options.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b===button));$("#treeCompleteQuest").disabled=false;});options.append(button);});
    $("#treeQuestFeedback").textContent=done?"Already completed. You can revisit this node any time.":unlocked?"Choose an answer, then complete the quest to check it.":"Follow the constellation paths to unlock this quest."; $("#treeCompleteQuest").disabled=done||!unlocked; $("#treeHintButton").disabled=done||!unlocked;
    $("#treeHintButton").onclick=()=>{if(unlocked&&!done){$("#treeQuestFeedback").textContent=`HINT: ${info.hint}`;}};
  }
  function selectTreeNode(name) { if (!treeData[name] || !treeUnlocked(name)) { showToast("That node is locked. Follow its prerequisite path first."); return; } treeState.selected=name; renderConstellation(); renderTreeDetail(); saveTree(); }
  treeNodeButtons.forEach(btn=>btn.addEventListener("click",()=>selectTreeNode(btn.dataset.tree)));
  $("#treeCompleteQuest").addEventListener("click",()=>{
    const name=treeState.selected, info=treeData[name]; if(!info||treeState.completed.includes(name)||!treeUnlocked(name)||selectedAnswer===null||answerChecked)return;
    answerChecked=true; const feedback=$("#treeQuestFeedback");
    if(selectedAnswer===info.answer){treeState.completed.push(name);treeState.xp+=info.xp;treeState.skillPoints+=name==="Curiosity"?0:1;treeState.questLog.push({name,xp:info.xp});feedback.textContent=`CORRECT! ${info.explain} +${info.xp} XP and +1 skill point.`;feedback.classList.add("correct");awardTreeBadges();saveTree();renderConstellation();renderTreeStats();renderTreeAchievements();renderTreeDetail();showToast(`${name} cleared! +${info.xp} XP`);}
    else {feedback.textContent=`Not quite. ${info.explain} Try again—you won't lose XP.`;feedback.classList.remove("correct");answerChecked=false;selectedAnswer=null;$("#treeQuestOptions").querySelectorAll("button").forEach(b=>b.classList.remove("selected"));$("#treeCompleteQuest").disabled=true;}
  });
  $("#treeReset").addEventListener("click",()=>{if(!window.confirm("Reset all Skill Tree 2.0 progress, XP, and achievements on this browser?"))return;treeState={...treeDefault,completed:["Curiosity"],questLog:[],badges:[]};saveTree();renderConstellation();renderTreeStats();renderTreeAchievements();renderTreeDetail();showToast("Skill tree progress reset.");});
  // Restore only valid saved progress; never trust arbitrary storage values.
  treeState.xp=Math.max(0,Number(treeState.xp)||0);treeState.skillPoints=Math.max(0,Number(treeState.skillPoints)||0);treeState.completed=["Curiosity",...treeState.completed.filter(n=>n!=="Curiosity"&&treeData[n])];treeState.completed=treeState.completed.filter((n,i,arr)=>arr.indexOf(n)===i&&treeData[n].requires.every(req=>treeState.completed.includes(req)));treeState.badges=treeState.badges.filter(id=>badgeDefinitions.some(b=>b.id===id));treeState.selected=treeData[treeState.selected]&&treeUnlocked(treeState.selected)?treeState.selected:"Curiosity";
  awardTreeBadges();renderConstellation();renderTreeStats();renderTreeAchievements();renderTreeDetail();saveTree();

  // Fake terminal only displays portfolio information; no system commands execute.
  const terminalOutput = $("#terminalOutput"), terminalInput = $("#terminalInput"), commandHistory = []; let historyIndex = 0;
  const terminalCommands = {
    help: "COMMANDS: about, hobbies, skills, projects, achievements, secret, tree, pet, contact, clear, help. Use ↑ / ↓ for command history.",
    about: "John Carlo Ledesma — BS Information Technology student. Curious by default; still learning, always building.",
    hobbies: "CURRENT INTERESTS: MLBB · VALORANT · Roblox · anime · music · dance · cats · dogs.",
    skills: "SKILL INVENTORY: Python · HTML/CSS · JavaScript · MySQL · Networking. Status: learning and practicing.",
    projects: "PROJECT LOG: Carlo.exe — a responsive personal portfolio with a quiz, hidden clues, a personality profiler, Byte the animated robot companion, a skill tree, and this terminal.",
    achievements: "BADGES: Curiosity Starter · Interactive Builder · Hidden Clue Hunter (unlock all 3 clues to earn it).",
    secret: () => foundClues.size === 3 ? `ACCESS GRANTED: ${secretText}` : `ACCESS RESTRICTED: ${foundClues.size}/3 clues found. Search the profile, About quote, and closing stamp.`,
    tree: () => `SKILL TREE RPG: level ${treeLevel()}, ${treeState.xp} XP, ${treeState.completed.length}/${Object.keys(treeData).length} nodes cleared, ${treeState.badges.length}/6 badges. Open Skill Tree 2.0 to continue your quests.`,
    pet: () => `BYTE STATUS: happiness ${pet.happiness}%, energy ${pet.energy}%, hunger ${pet.hunger}%, bond ${pet.bond}, level ${pet.level}. Visit Pixel Pet to interact.`,
    contact: "This is a student portfolio demo. Add your preferred contact link in the page when you're ready to share one."
  };
  function runTerminalCommand(raw) {
    const command = raw.trim().toLowerCase(); if (!command) return;
    commandHistory.push(command); historyIndex = commandHistory.length;
    const inputLine = document.createElement("p"); inputLine.className = "terminal-command-line"; inputLine.textContent = `visitor@carlo:~$ ${command}`; terminalOutput.append(inputLine);
    if (command === "clear") terminalOutput.replaceChildren();
    else { const response = document.createElement("p"), result = terminalCommands[command]; response.textContent = typeof result === "function" ? result() : result || `Command not found: ${command}. Type help to see available commands.`; response.className = result ? "terminal-success" : "terminal-error"; terminalOutput.append(response); }
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
  $("#terminalForm").addEventListener("submit", event => { event.preventDefault(); runTerminalCommand(terminalInput.value); terminalInput.value = ""; terminalInput.focus(); });
  terminalInput.addEventListener("keydown", event => {
    if (event.key === "ArrowUp") { event.preventDefault(); if (historyIndex > 0) terminalInput.value = commandHistory[--historyIndex]; }
    if (event.key === "ArrowDown") { event.preventDefault(); if (historyIndex < commandHistory.length - 1) terminalInput.value = commandHistory[++historyIndex]; else { historyIndex = commandHistory.length; terminalInput.value = ""; } }
  });
  $$(".terminal-commands button").forEach(button => button.addEventListener("click", () => runTerminalCommand(button.dataset.command)));

  // Keep the current navigation link highlighted while scrolling; sticky header already stays in view.
  const navLinks = $$(".nav-links a");
  const navTargets = navLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        if (link.getAttribute("href") === `#${visible.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-22% 0px -62% 0px", threshold: [0, .15, .35, .6] });
    navTargets.forEach(target => navObserver.observe(target));
  }
})();
