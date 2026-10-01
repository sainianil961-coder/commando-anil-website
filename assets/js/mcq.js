/* MCQ Practice — subject-wise quiz, instant feedback, score, best-score memory.
   Rendering uses textContent exclusively. No backend needed. */
(function () {
  "use strict";
  var pillsBox = document.getElementById("mcqSubjects");
  var quizBox = document.getElementById("mcqQuiz");
  if (!pillsBox || !quizBox || !window.mcqData) return;

  var subjects = window.mcqData || [];
  var cur = null, idx = 0, score = 0, locked = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function best(id) {
    try { return parseInt(window.localStorage.getItem("mcq_best_" + id) || "0", 10) || 0; }
    catch (e) { return 0; }
  }
  function saveBest(id, s, total) {
    try {
      if (s > best(id)) window.localStorage.setItem("mcq_best_" + id, String(s));
    } catch (e) {}
  }

  function renderPills() {
    pillsBox.textContent = "";
    subjects.forEach(function (s) {
      var b = el("button", "tab-btn" + (cur && cur.id === s.id ? " active" : ""), s.icon + " " + s.title + " (" + s.questions.length + ")");
      b.type = "button";
      var bs = best(s.id);
      if (bs > 0) b.textContent += " • Best " + bs + "/" + s.questions.length;
      b.setAttribute("aria-pressed", cur && cur.id === s.id ? "true" : "false");
      b.addEventListener("click", function () { startSubject(s.id); });
      pillsBox.appendChild(b);
    });
  }

  function startSubject(id) {
    for (var i = 0; i < subjects.length; i++) {
      if (subjects[i].id === id) { cur = subjects[i]; break; }
    }
    if (!cur) return;
    idx = 0; score = 0;
    renderPills();
    renderQ();
    quizBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderQ() {
    quizBox.textContent = "";
    locked = false;
    var total = cur.questions.length;
    var head = el("p", "meta", cur.title + " • प्रश्न " + (idx + 1) + "/" + total + " • स्कोर " + score);
    quizBox.appendChild(head);
    var track = el("div", "bar-track");
    var fill = el("div", "bar-fill");
    fill.style.width = Math.round((idx / total) * 100) + "%";
    track.appendChild(fill);
    track.style.marginBottom = "1rem";
    quizBox.appendChild(track);

    var Q = cur.questions[idx];
    quizBox.appendChild(el("h3", null, Q.q));
    var opts = el("div", "mcq-opts");
    Q.options.forEach(function (opt, oi) {
      var b = el("button", "btn btn-outline mcq-opt", opt);
      b.type = "button";
      b.addEventListener("click", function () { answer(oi, b); });
      opts.appendChild(b);
    });
    quizBox.appendChild(opts);
    var fb = el("div", "mcq-feedback");
    fb.setAttribute("aria-live", "polite");
    quizBox.appendChild(fb);
  }

  function answer(oi, btn) {
    if (locked) return;
    locked = true;
    var Q = cur.questions[idx];
    var fb = quizBox.querySelector(".mcq-feedback");
    var btns = quizBox.querySelectorAll(".mcq-opt");
    btns.forEach(function (b) { b.disabled = true; });
    btns[Q.answer].classList.remove("btn-outline");
    btns[Q.answer].classList.add("btn-wa");
    if (oi === Q.answer) {
      score++;
      fb.appendChild(el("p", null, "✅ सही जवाब! " + Q.exp));
    } else {
      btn.classList.remove("btn-outline");
      btn.classList.add("btn-accent");
      fb.appendChild(el("p", null, "❌ गलत। सही उत्तर ऊपर हरा है। " + Q.exp));
    }
    var head = quizBox.querySelector(".meta");
    if (head) head.textContent = cur.title + " • प्रश्न " + (idx + 1) + "/" + cur.questions.length + " • स्कोर " + score;
    var next = el("button", "btn btn-primary", idx + 1 < cur.questions.length ? "अगला प्रश्न →" : "रिजल्ट देखें →");
    next.type = "button";
    next.style.marginTop = ".8rem";
    next.addEventListener("click", function () {
      idx++;
      if (idx < cur.questions.length) renderQ();
      else renderResult();
    });
    fb.appendChild(next);
    next.focus();
  }

  function renderResult() {
    quizBox.textContent = "";
    var total = cur.questions.length;
    saveBest(cur.id, score, total);
    var pct = Math.round((score / total) * 100);
    quizBox.appendChild(el("div", "avg-big", score + "/" + total));
    var msg = pct >= 80 ? "🎯 शानदार! Exam-ready level।" : pct >= 50 ? "👍 अच्छी शुरुआत — गलत सवाल दोबारा करो।" : "📚 Concept दोबारा पढ़ो, फिर retry करो।";
    quizBox.appendChild(el("p", null, pct + "% — " + msg));
    var row = el("div", "admin-actions");
    var again = el("button", "btn btn-primary btn-sm", "फिर से Practice");
    again.type = "button";
    again.addEventListener("click", function () { idx = 0; score = 0; renderQ(); });
    var other = el("button", "btn btn-outline btn-sm", "दूसरा Subject");
    other.type = "button";
    other.addEventListener("click", function () {
      pillsBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    row.appendChild(again);
    row.appendChild(other);
    quizBox.appendChild(row);
    renderPills();
  }

  renderPills();
  quizBox.appendChild(el("div", "empty", "ऊपर Subject चुनो — 12 important MCQs, तुरंत answer + explanation के साथ। Best score device me save रहेगा।"));
})();
