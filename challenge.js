(() => {
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
let toastTimer;
function showToast(message) { const toast=$("#toast"); if(!toast)return; toast.textContent=message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),1900); }

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
})();
