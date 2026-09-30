/* Admin moderation — Firebase Auth (email/password) + admins/{uid} allowlist.
   Page is NOT linked publicly. Firestore rules enforce all permissions. */
(function () {
  "use strict";
  var cfg = window.firebaseConfig || {};
  var enabled = window.firebaseEnabled === true &&
    typeof cfg.apiKey === "string" && cfg.apiKey.indexOf("PASTE") !== 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function fmtDate(ts) {
    try {
      var d = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { return ""; }
  }
  function stars(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += i <= n ? "\u2605" : "\u2606";
    return s;
  }

  var loginBox = document.getElementById("adminLogin");
  var dash = document.getElementById("adminDash");
  var notice = document.getElementById("adminNotice");
  function note(msg) { if (notice) { notice.textContent = ""; notice.appendChild(el("p", "note", msg)); } }

  if (!enabled || typeof window.firebase === "undefined") {
    note("Firebase config abhi set nahi hai — README section 13 dekhein.");
    if (loginBox) loginBox.setAttribute("hidden", "");
    return;
  }
  try {
    if (!window.firebase.apps.length) window.firebase.initializeApp(cfg);
  } catch (e) { note("Firebase init fail — config check karein."); return; }
  var auth = window.firebase.auth();
  var db = window.firebase.firestore();
  var tab = "pending";

  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = document.getElementById("adminEmail").value.trim();
      var pw = document.getElementById("adminPass").value;
      if (!em || !pw) { note("Email + password dono bharein."); return; }
      auth.signInWithEmailAndPassword(em, pw).catch(function (err) {
        note("Login fail: " + (err && err.code ? err.code : "unknown error"));
      });
    });
  }
  var outBtn = document.getElementById("logoutBtn");
  if (outBtn) outBtn.addEventListener("click", function () { auth.signOut(); });

  auth.onAuthStateChanged(function (user) {
    if (!user) {
      if (loginBox) loginBox.removeAttribute("hidden");
      if (dash) dash.setAttribute("hidden", "");
      return;
    }
    db.collection("admins").doc(user.uid).get().then(function (doc) {
      if (!doc.exists) {
        note("Access denied — ye account admin list me nahi hai.");
        auth.signOut();
        return;
      }
      if (loginBox) loginBox.setAttribute("hidden", "");
      if (dash) dash.removeAttribute("hidden");
      if (notice) notice.textContent = "";
      loadTab();
    }).catch(function () { note("Admin check fail — rules deploy hain?"); });
  });

  document.querySelectorAll("[data-tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      tab = b.getAttribute("data-tab");
      document.querySelectorAll("[data-tab]").forEach(function (x) {
        x.classList.toggle("active", x === b);
      });
      loadTab();
    });
  });

  function loadTab() {
    var list = document.getElementById("adminList");
    if (!list) return;
    list.textContent = "Loading…";
    db.collection("student_reviews").where("status", "==", tab).get()
      .then(function (snap) {
        list.textContent = "";
        if (snap.empty) { list.appendChild(el("div", "empty", "Koi review nahi — " + tab)); return; }
        snap.forEach(function (doc) {
          var d = doc.data() || {};
          var c = el("article", "card review-card");
          c.appendChild(el("div", "stars", stars(parseInt(d.rating, 10) || 0)));
          c.appendChild(el("div", "who", String(d.name || "")));
          c.appendChild(el("blockquote", null, String(d.reviewText || "")));
          c.appendChild(el("div", "meta", fmtDate(d.createdAt)));
          var acts = el("div", "admin-actions");
          function btn(label, cls, fn) {
            var b = el("button", "btn btn-sm " + cls, label);
            b.type = "button";
            b.addEventListener("click", function () { fn(doc.id, b); });
            acts.appendChild(b);
          }
          if (tab !== "approved") btn("Approve", "btn-wa", function (id, b) {
            b.disabled = true;
            db.collection("student_reviews").doc(id).update({ status: "approved" }).then(loadTab);
          });
          if (tab !== "rejected") btn("Reject", "btn-outline", function (id, b) {
            b.disabled = true;
            db.collection("student_reviews").doc(id).update({ status: "rejected" }).then(loadTab);
          });
          btn("Delete", "btn-outline", function (id, b) {
            if (!window.confirm("Ye review permanently delete karein?")) return;
            b.disabled = true;
            db.collection("student_reviews").doc(id).delete().then(loadTab);
          });
          c.appendChild(acts);
          list.appendChild(c);
        });
      })
      .catch(function () { list.textContent = "Load fail — rules/auth check karein."; });
  }
})();
