(() => {
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
let toastTimer;
function showToast(message) { const toast=$("#toast"); if(!toast)return; toast.textContent=message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),1900); }

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
})();
