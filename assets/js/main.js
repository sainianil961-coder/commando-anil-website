/* Main UI: menu, year, nav, back-to-top, reveal, search, data-driven cards, contact->WhatsApp */
(function () {
  "use strict";
  var cfg = window.siteConfig || {};

  // Apply config-driven links: [data-cfg-href="youtube"] etc.
  function applyConfig() {
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
      var key = el.getAttribute("data-cfg-href");
      var url = cfg[key];
      if (url) { el.setAttribute("href", url); el.removeAttribute("hidden"); }
      else {
        // Hide telegram / unconfirmed gracefully
        if (key === "telegram") { var card = el.closest("[data-social-card]"); if (card) card.setAttribute("hidden", ""); el.setAttribute("hidden", ""); }
        else el.removeAttribute("href");
      }
    });
    document.querySelectorAll("[data-cfg-text]").forEach(function (el) {
      var key = el.getAttribute("data-cfg-text");
      if (cfg[key]) el.textContent = cfg[key];
    });
    // Dynamic enquiry links
    document.querySelectorAll('[data-wa-enquiry]').forEach(function (el) {
      if (cfg.whatsappEnquiry) el.setAttribute("href", cfg.whatsappEnquiry);
    });
  }

  // Mobile menu (accessible)
  var btn = document.getElementById("menuBtn"), nav = document.getElementById("mobileNav");
  function setMenu(open) {
    if (!btn || !nav) return;
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    nav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = nav.querySelector("a"); if (f) f.focus(); }
  }
  if (btn && nav) {
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); btn.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  }

  // Year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Active nav
  var path = location.pathname.replace(/\/index\.html?$/, "/");
  document.querySelectorAll("nav a[href]").forEach(function (a) {
    var h = a.getAttribute("href");
    if (!h || h.startsWith("http")) return;
    var norm = h.endsWith("/") ? h : h + "/";
    if (path.endsWith(norm) && norm !== "/") a.classList.add("active");
    if ((path === "/" || path.endsWith("/COMMANDO ANIL WB/")) && (h === "/" || h === "index.html" || h === "./")) a.classList.add("active");
  });

  // Back to top
  var top = document.getElementById("toTop");
  if (top) {
    addEventListener("scroll", function () { top.classList.toggle("show", scrollY > 600); }, { passive: true });
    top.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });
  }

  // Reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });

  // Exam category cards (data-driven)
  var catGrid = document.getElementById("examGrid");
  if (catGrid && window.examCategories) {
    var base = catGrid.getAttribute("data-base") || "";
    catGrid.innerHTML = window.examCategories.map(function (c) {
      var href = base + (c.slug === "latest-updates" || c.slug === "study-resources" || c.slug === "exams" ? c.slug + "/" : c.slug + "/");
      var safe = String(c.title).replace(/</g, "&lt;");
      return '<article class="card reveal in"><span class="tag">Exam Guide</span><h3>' + safe +
        '</h3><p>' + String(c.desc).replace(/</g, "&lt;") + '</p>' +
        '<a class="card-link" href="' + href + '">View Details →</a></article>';
    }).join("");
  }

  // Updates (empty-state honest)
  var upGrid = document.getElementById("updatesGrid");
  if (upGrid) {
    var ups = (window.siteUpdates || []).filter(function (u) { return u.status === "published"; });
    upGrid.innerHTML = ups.length ? ups.slice(0, 6).map(function (u) {
      return '<article class="card"><span class="tag ' + (u.category === "Result" ? "green" : "red") + '">' +
        String(u.category).replace(/</g, "&lt;") + '</span><h3>' + String(u.title).replace(/</g, "&lt;") +
        '</h3><p>' + String(u.summary).replace(/</g, "&lt;") + '</p><p class="meta">Updated: ' +
        String(u.updatedDate || u.date || "") + '</p></article>';
    }).join("") : '<div class="empty"><b>Latest Updates जल्द जुड़ेंगी।</b><br>फिलहाल कोई verified recruitment update publish नहीं की गई है — गलत/अनुमानित जानकारी नहीं दी जाती। नई जानकारी सबसे पहले YouTube + WhatsApp Group पर मिलेगी।<br><br><a class="btn btn-wa btn-sm" data-wa-group href="#">WhatsApp Group Join करें</a></div>';
  }

  // Videos (empty-state honest)
  var vGrid = document.getElementById("videosGrid");
  if (vGrid) {
    var vs = window.siteVideos || [];
    vGrid.innerHTML = vs.length ? vs.slice(0, 6).map(function (v) {
      var thumb = "https://i.ytimg.com/vi/" + encodeURIComponent(v.id) + "/hqdefault.jpg";
      return '<article class="card"><div class="video-thumb"><img loading="lazy" width="480" height="360" src="' + thumb + '" alt="' +
        String(v.title).replace(/"/g, "") + ' thumbnail"></div><span class="tag gold">' +
        String(v.category || "Video").replace(/</g, "&lt;") + '</span><h3>' + String(v.title).replace(/</g, "&lt;") +
        '</h3><p class="meta">' + String(v.date || "") + '</p><a class="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=' +
        encodeURIComponent(v.id) + '">▶ Watch Video</a></article>';
    }).join("") : '<div class="empty"><b>Latest Videos YouTube पर देखें।</b><br>Website पर video list तब जुड़ेगी जब real video IDs add होंगे। तब तक सीधे channel पर जुड़ें।<br><br><a class="btn btn-primary btn-sm" data-cfg-href="youtube" target="_blank" rel="noopener noreferrer" href="#">YouTube Channel खोलें</a></div>';
  }

  // Resources
  var rGrid = document.getElementById("resourcesGrid");
  if (rGrid && window.studyResources) {
    var q = (document.getElementById("resourceSearch") || {}).value || "";
    var list = window.studyResources;
    if (q) { var ql = q.toLowerCase(); list = list.filter(function (r) { return (r.title + " " + r.cat + " " + r.desc).toLowerCase().includes(ql); }); }
    rGrid.innerHTML = list.map(function (r) {
      var base2 = rGrid.getAttribute("data-base") || "";
      return '<article class="card" data-searchable="' + (r.title + " " + r.cat + " " + r.desc).toLowerCase().replace(/"/g, "") +
        '"><span class="tag">' + String(r.cat).replace(/</g, "&lt;") + '</span><h3>' + String(r.title).replace(/</g, "&lt;") +
        '</h3><p>' + String(r.desc).replace(/</g, "&lt;") + '</p><a class="card-link" href="' + base2 + String(r.href).replace(/</g, "") + '">' + String(r.action).replace(/</g, "&lt;") + ' →</a></article>';
    }).join("");
  }

  // Site search (client-side filter)
  ["siteSearch", "resourceSearch"].forEach(function (id) {
    var inp = document.getElementById(id);
    if (!inp) return;
    inp.addEventListener("input", function () {
      var v = inp.value.trim().toLowerCase();
      if (id === "resourceSearch" && rGrid && window.studyResources) {
        var list = window.studyResources.filter(function (r) { return (r.title + " " + r.cat + " " + r.desc).toLowerCase().includes(v); });
        var base3 = rGrid.getAttribute("data-base") || "";
        rGrid.innerHTML = list.length ? list.map(function (r) {
          return '<article class="card"><span class="tag">' + String(r.cat).replace(/</g, "&lt;") + '</span><h3>' + String(r.title).replace(/</g, "&lt;") + '</h3><p>' + String(r.desc).replace(/</g, "&lt;") + '</p><a class="card-link" href="' + base3 + r.href + '">' + r.action + ' →</a></article>';
        }).join("") : '<div class="empty">कोई resource नहीं मिला — spelling बदलकर देखें।</div>';
        return;
      }
      document.querySelectorAll("[data-searchable]").forEach(function (el) {
        el.style.display = !v || el.getAttribute("data-searchable").includes(v) ? "" : "none";
      });
    });
  });

  // Contact form -> WhatsApp (no fake backend)
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), topic = form.topic.value, msg = form.message.value.trim();
      var ok = true;
      [["name", name.length >= 2], ["topic", !!topic], ["message", msg.length >= 5]].forEach(function (pair) {
        var err = document.getElementById("err-" + pair[0]);
        if (err) err.textContent = pair[1] ? "" : "कृपया सही जानकारी भरें।";
        if (!pair[1]) ok = false;
      });
      if (!ok) return;
      var text = "नमस्ते Commando Anil Sir, मैं " + name + " (" + topic + ") के बारे में पूछना चाहता/चाहती हूँ: " + msg;
      window.open("https://wa.me/916005111738?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  // Profile photo: tries .webp then .jpg/.jpeg/.png; keeps CA placeholder if none found
  document.querySelectorAll("img[data-profile-photo]").forEach(function (img) {
    var base = img.getAttribute("data-base") || "";
    var candidates = ["commando-anil.webp", "commando-anil.jpg", "commando-anil.jpeg", "commando-anil.png"];
    var i = 0;
    function next() {
      if (i >= candidates.length) { img.remove(); return; }
      var test = new Image();
      test.onload = function () {
        img.src = base + "assets/images/" + candidates[i];
        img.hidden = false;
        var fb = img.parentElement.querySelector("[data-profile-fallback]");
        if (fb) fb.setAttribute("hidden", "");
      };
      test.onerror = function () { i++; next(); };
      test.src = base + "assets/images/" + candidates[i];
    }
    next();
  });

  applyConfig();
  // Re-apply for dynamically injected nodes
  setTimeout(applyConfig, 0);
})();
