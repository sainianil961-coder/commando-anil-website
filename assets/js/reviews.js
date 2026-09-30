/* Student Reviews — Firestore-backed.
   Public: reads ONLY status=="approved", creates ONLY status=="pending".
   Rendering uses textContent exclusively (no innerHTML with user data). */
(function () {
  "use strict";
  var MAX_NAME = 50, MAX_REVIEW = 1000, MIN_REVIEW = 5;
  var COOLDOWN_MS = 10 * 60 * 1000, MIN_FILL_MS = 2500;
  var URL_RE = /(https?:\/\/|www\.)/i;
  var cfg = window.firebaseConfig || {};
  var enabled = window.firebaseEnabled === true &&
    typeof cfg.apiKey === "string" && cfg.apiKey.indexOf("PASTE") !== 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function stars(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += i <= n ? "\u2605" : "\u2606";
    return s;
  }
  function fmtDate(ts) {
    try {
      var d = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { return ""; }
  }

  var summaryBox = document.getElementById("reviewsSummary");
  var homeGrid = document.getElementById("homeReviews");
  var allGrid = document.getElementById("allReviews");

  function showSetupNote() {
    if (summaryBox) {
      summaryBox.textContent = "";
      summaryBox.appendChild(el("div", "avg-big", "\u2605 --/5"));
      var p = el("p", "meta", "Review system setup j\u093eari hai — Firebase connect hote hi genuine student reviews yah\u093e\u0902 dikhenge.");
      summaryBox.appendChild(p);
    }
    document.querySelectorAll("[data-open-review]").forEach(function (b) { b.setAttribute("hidden", ""); });
    [homeGrid, allGrid].forEach(function (g) {
      if (g) {
        g.textContent = "";
        g.appendChild(el("div", "empty", "Reviews jald live honge."));
      }
    });
  }

  if (!enabled || typeof window.firebase === "undefined") { showSetupNote(); return; }
  try {
    if (!window.firebase.apps.length) window.firebase.initializeApp(cfg);
  } catch (e) { showSetupNote(); return; }
  var db = window.firebase.firestore();

  function loadApproved() {
    if (summaryBox) { summaryBox.textContent = "Reviews load ho rahe hain…"; }
    db.collection("student_reviews").where("status", "==", "approved").get()
      .then(function (snap) {
        var list = [];
        snap.forEach(function (doc) {
          var d = doc.data() || {};
          var r = parseInt(d.rating, 10);
          if (typeof d.name === "string" && typeof d.reviewText === "string" && r >= 1 && r <= 5) {
            var ts = 0;
            try { ts = d.createdAt && typeof d.createdAt.toMillis === "function" ? d.createdAt.toMillis() : 0; } catch (e) {}
            list.push({ name: String(d.name).slice(0, MAX_NAME), rating: r, text: String(d.reviewText).slice(0, MAX_REVIEW), date: fmtDate(d.createdAt), ts: ts });
          }
        });
        list.sort(function (a, b) { return b.ts - a.ts; });
        render(list);
      })
      .catch(function () {
        if (summaryBox) summaryBox.textContent = "Reviews abhi load nahi ho sake — baad me phir try karein.";
      });
  }

  function render(list) {
    var n = list.length;
    if (summaryBox) {
      summaryBox.textContent = "";
      if (!n) {
        summaryBox.appendChild(el("div", "avg-big", "\u2605 --/5"));
        summaryBox.appendChild(el("p", null, "Abhi koi Review uplabdh nahi hai. Pehla Review aap dein."));
      } else {
        var sum = 0, counts = [0, 0, 0, 0, 0, 0];
        list.forEach(function (r) { sum += r.rating; counts[r.rating]++; });
        var avg = (sum / n).toFixed(1);
        summaryBox.appendChild(el("div", "avg-big", avg + " / 5"));
        summaryBox.appendChild(el("div", "stars-big", stars(Math.round(sum / n))));
        summaryBox.appendChild(el("p", "meta", "Based on " + n + " Review" + (n > 1 ? "s" : "") + " • Genuine approved feedback"));
        for (var s = 5; s >= 1; s--) {
          var row = el("div", "bar-row");
          row.appendChild(el("span", null, s + " Star"));
          var track = el("div", "bar-track");
          var fill = el("div", "bar-fill");
          fill.style.width = Math.round((counts[s] / n) * 100) + "%";
          track.appendChild(fill);
          row.appendChild(track);
          row.appendChild(el("span", null, String(counts[s])));
          summaryBox.appendChild(row);
        }
      }
    }
    function cards(grid, items) {
      if (!grid) return;
      grid.textContent = "";
      if (!items.length) {
        grid.appendChild(el("div", "empty", "Abhi koi Review uplabdh nahi hai. Pehla Review aap dein."));
        return;
      }
      items.forEach(function (r) {
        var c = el("article", "card review-card");
        var st = el("div", "stars", stars(r.rating));
        st.setAttribute("aria-label", r.rating + " out of 5 stars");
        c.appendChild(st);
        c.appendChild(el("div", "who", r.name));
        c.appendChild(el("blockquote", null, "\u201C" + r.text + "\u201D"));
        c.appendChild(el("div", "meta", r.date));
        grid.appendChild(c);
      });
    }
    cards(homeGrid, list.slice(0, 3));
    cards(allGrid, list);
  }

  /* ---- Modal + form ---- */
  var modal = document.getElementById("reviewModal");
  var form = document.getElementById("reviewForm");
  var success = document.getElementById("reviewSuccess");
  var ratingVal = 0, openedAt = 0, lastFocus = null;

  function paintStars() {
    document.querySelectorAll("#reviewModal [data-star]").forEach(function (b) {
      var v = parseInt(b.getAttribute("data-star"), 10);
      b.classList.toggle("lit", v <= ratingVal);
      b.setAttribute("aria-pressed", v === ratingVal ? "true" : "false");
      b.textContent = v <= ratingVal ? "\u2605" : "\u2606";
    });
  }
  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    openedAt = Date.now();
    paintStars();
    var f = document.getElementById("rvName");
    if (f) f.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll("[data-open-review]").forEach(function (b) {
    b.addEventListener("click", openModal);
  });
  document.querySelectorAll("[data-close-review]").forEach(function (b) {
    b.addEventListener("click", closeModal);
  });
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });
    modal.querySelectorAll("[data-star]").forEach(function (b) {
      b.addEventListener("click", function () {
        ratingVal = parseInt(b.getAttribute("data-star"), 10);
        paintStars();
        var err = document.getElementById("err-rvRating");
        if (err) err.textContent = "";
      });
    });
  }
  paintStars();

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = document.getElementById("rvName");
      var textEl = document.getElementById("rvText");
      var hpEl = document.getElementById("rvHp");
      var name = (nameEl.value || "").trim().replace(/\s+/g, " ");
      var text = (textEl.value || "").trim().replace(/\s+/g, " ");
      var ok = true;
      function setErr(id, msg) {
        var x = document.getElementById(id);
        if (x) x.textContent = msg || "";
      }
      setErr("err-rvName", ""); setErr("err-rvRating", ""); setErr("err-rvText", "");
      if (hpEl && hpEl.value) return; // honeypot: silently drop bots
      if (Date.now() - openedAt < MIN_FILL_MS) { setErr("err-rvText", "Thoda rukkar phir submit karein."); return; }
      var last = 0;
      try { last = parseInt(window.localStorage.getItem("ca_last_review") || "0", 10); } catch (ex) {}
      if (Date.now() - last < COOLDOWN_MS) { setErr("err-rvText", "Aapne abhi review diya hai — thodi der baad phir try karein."); ok = false; }
      if (name.length < 2 || name.length > MAX_NAME) { setErr("err-rvName", "Naam 2–50 aksharon me likhein."); ok = false; }
      if (!ratingVal || ratingVal < 1 || ratingVal > 5) { setErr("err-rvRating", "Star rating chunna zaroori hai."); ok = false; }
      if (text.length < MIN_REVIEW || text.length > MAX_REVIEW) { setErr("err-rvText", "Review 5–1000 aksharon me likhein."); ok = false; }
      else if (URL_RE.test(text) || URL_RE.test(name)) { setErr("err-rvText", "Review me links/URLs allowed nahi hain."); ok = false; }
      else {
        var hash = name + "|" + ratingVal + "|" + text;
        try {
          if (window.localStorage.getItem("ca_last_review_text") === hash) { setErr("err-rvText", "Ye review pehle hi bheja ja chuka hai."); ok = false; }
        } catch (ex) {}
      }
      if (!ok) return;
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Bheja ja raha hai…"; }
      db.collection("student_reviews").add({
        name: name, rating: ratingVal, reviewText: text,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        status: "pending"
      }).then(function () {
        try {
          window.localStorage.setItem("ca_last_review", String(Date.now()));
          window.localStorage.setItem("ca_last_review_text", name + "|" + ratingVal + "|" + text);
        } catch (ex) {}
        form.hidden = true;
        if (success) success.hidden = false;
      }).catch(function () {
        setErr("err-rvText", "Submit nahi ho saka — internet check karke phir try karein.");
        if (btn) { btn.disabled = false; btn.textContent = "Submit Review"; }
      });
    });
  }

  loadApproved();
})();
