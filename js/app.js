/* BLACKSITE v2 — interactions. Vanilla JS, no dependencies.
   One rAF loop drives: canvas backdrop, scroll parallax, nav state. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 640px)").matches;
  // testing hook: ?noreveal=1 → everything visible instantly (screenshots)
  var noReveal = new URLSearchParams(window.location.search).has("noreveal");
  if (noReveal) document.documentElement.classList.add("noreveal");

  /* ============ animated operations-floor canvas ============ */
  var canvas = document.getElementById("bg-canvas");
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // drifting volumetric streaks (precomputed gradients, drawn rotated)
  var streaks = [];
  var NSTREAK = isMobile ? 11 : 21;
  for (var i = 0; i < NSTREAK; i++) {
    var red = Math.random() < 0.82;
    var len = 220 + Math.random() * 520;
    streaks.push({
      x: Math.random() * W, y: Math.random() * H,
      len: len, w: 1 + Math.random() * 3,
      vx: (0.35 + Math.random() * 0.9) * (Math.random() < 0.5 ? 1 : 0.6),
      vy: (0.12 + Math.random() * 0.35),
      alpha: 0.06 + Math.random() * 0.12,
      ang: -Math.PI / 4 + (Math.random() - 0.5) * 0.35,
      tw: Math.random() * Math.PI * 2,
      tws: 0.4 + Math.random() * 1.2,
      col: red ? "255,48,79" : "0,212,255"
    });
  }
  streaks.forEach(function (s) {
    var g = ctx.createLinearGradient(0, 0, s.len, 0);
    g.addColorStop(0, "rgba(" + s.col + ",0)");
    g.addColorStop(0.5, "rgba(" + s.col + "," + s.alpha.toFixed(3) + ")");
    g.addColorStop(1, "rgba(" + s.col + ",0)");
    s.grad = g;
  });

  // nebula blobs — pre-rendered sprites, drifted on lissajous paths
  function nebulaSprite(r, stops) {
    var c = document.createElement("canvas");
    c.width = c.height = r * 2;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach(function (st) { g.addColorStop(st[0], st[1]); });
    x.fillStyle = g;
    x.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  var nebulas = [
    { img: nebulaSprite(420, [[0, "rgba(255,48,79,0.10)"], [1, "rgba(255,48,79,0)"]]),
      bx: 0.22, by: 0.28, ax: 0.10, ay: 0.07, s1: 0.11, s2: 0.07, p: 0.0 },
    { img: nebulaSprite(520, [[0, "rgba(0,90,160,0.10)"], [1, "rgba(0,90,160,0)"]]),
      bx: 0.78, by: 0.62, ax: 0.08, ay: 0.10, s1: 0.07, s2: 0.13, p: 2.1 },
    { img: nebulaSprite(360, [[0, "rgba(0,212,255,0.07)"], [1, "rgba(0,212,255,0)"]]),
      bx: 0.62, by: 0.18, ax: 0.12, ay: 0.06, s1: 0.09, s2: 0.05, p: 4.2 },
    { img: nebulaSprite(460, [[0, "rgba(255,48,79,0.06)"], [1, "rgba(255,48,79,0)"]]),
      bx: 0.35, by: 0.80, ax: 0.07, ay: 0.09, s1: 0.13, s2: 0.08, p: 5.5 }
  ];

  // rising ember particles
  var embers = [];
  var NEMB = isMobile ? 42 : 110;
  for (var e = 0; e < NEMB; e++) {
    var r2 = Math.random();
    embers.push({
      x: Math.random() * W, y: Math.random() * H,
      vy: 0.25 + Math.random() * 0.9,
      sway: 10 + Math.random() * 30, sws: 0.3 + Math.random() * 0.9,
      ph: Math.random() * Math.PI * 2,
      sz: 0.8 + Math.random() * 1.8,
      col: r2 < 0.72 ? "255,48,79" : (r2 < 0.9 ? "255,225,225" : "0,212,255"),
      a: 0.25 + Math.random() * 0.55
    });
  }

  // scan sweeps
  var sweepY = -H * 0.25, sweepX = -W * 0.3;
  var radarAng = 0;

  var baseGrad = null;
  function paintBase() {
    baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, "#070B12");
    baseGrad.addColorStop(0.45, "#090B10");
    baseGrad.addColorStop(1, "#04060A");
  }
  paintBase();

  function frame(t, dt) {
    var dtS = Math.min(dt / 1000, 0.05);

    // base
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // nebulas
    nebulas.forEach(function (n) {
      var x = (n.bx + n.ax * Math.sin(t * n.s1 * 0.001 + n.p)) * W;
      var y = (n.by + n.ay * Math.cos(t * n.s2 * 0.001 + n.p)) * H;
      var r = n.img.width / 2;
      ctx.drawImage(n.img, x - r, y - r);
    });

    // radar sweep — large rotating conic glow from lower-left
    radarAng += dtS * 0.35;
    var rx = W * 0.12, ry = H * 1.02;
    var rr = Math.max(W, H) * 1.15;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var cg = ctx.createConicGradient(radarAng, rx, ry);
    cg.addColorStop(0, "rgba(255,48,79,0)");
    cg.addColorStop(0.82, "rgba(255,48,79,0)");
    cg.addColorStop(0.97, "rgba(255,48,79,0.085)");
    cg.addColorStop(1, "rgba(255,48,79,0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // streaks
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    streaks.forEach(function (s) {
      s.x += s.vx * dtS * 60; s.y += s.vy * dtS * 60;
      s.tw += dtS * s.tws;
      if (s.x - s.len > W + 80) { s.x = -s.len - 60; s.y = Math.random() * H; }
      if (s.y > H + 80) { s.y = -60; s.x = Math.random() * W; }
      var flick = 0.75 + 0.25 * Math.sin(s.tw);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.ang);
      ctx.globalAlpha = flick;
      ctx.fillStyle = s.grad;
      ctx.fillRect(0, -s.w / 2, s.len, s.w);
      ctx.restore();
    });
    ctx.restore();

    // scan sweeps — one horizontal cyan, one vertical red
    sweepY += dtS * (H / 7);
    if (sweepY > H + 160) sweepY = -160;
    sweepX += dtS * (W / 11);
    if (sweepX > W + 220) sweepX = -220;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var sg = ctx.createLinearGradient(0, sweepY - 130, 0, sweepY + 130);
    sg.addColorStop(0, "rgba(255,48,79,0)");
    sg.addColorStop(0.5, "rgba(255,48,79,0.10)");
    sg.addColorStop(1, "rgba(255,48,79,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, sweepY - 130, W, 260);
    var sg2 = ctx.createLinearGradient(sweepX - 170, 0, sweepX + 170, 0);
    sg2.addColorStop(0, "rgba(0,212,255,0)");
    sg2.addColorStop(0.5, "rgba(0,212,255,0.05)");
    sg2.addColorStop(1, "rgba(0,212,255,0)");
    ctx.fillStyle = sg2;
    ctx.fillRect(sweepX - 170, 0, 340, H);
    ctx.restore();

    // embers
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    embers.forEach(function (p) {
      p.y -= p.vy * dtS * 60;
      p.ph += dtS * p.sws * 2;
      if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
      var x = p.x + Math.sin(p.ph) * p.sway * 0.3;
      var tw = 0.55 + 0.45 * Math.sin(p.ph * 1.7);
      ctx.fillStyle = "rgba(" + p.col + "," + (p.a * tw).toFixed(3) + ")";
      ctx.fillRect(x, p.y, p.sz, p.sz);
    });
    ctx.restore();
  }

  /* ============ unified rAF: canvas + parallax + nav ============ */
  var nav = document.getElementById("siteNav");
  var termCard = document.getElementById("terminalCard");
  var pxPanels = Array.prototype.slice.call(document.querySelectorAll(".px-panel"));
  var pxIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) { en.target._px = en.isIntersecting; });
  }, { threshold: 0 });
  pxPanels.forEach(function (p) { pxIO.observe(p); });
  // recon-camera zoom refs — header image only
  var heroFrame = document.querySelector(".hero-fig-frame");
  var heroZoomNum = heroFrame ? heroFrame.querySelector(".hero-zoom-readout b") : null;

  var last = performance.now();
  function loop(now) {
    var dt = now - last; last = now;
    if (!reduceMotion) frame(now, dt);

    // nav pill
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("pinned", y > 60);

    // parallax panels — Hermes: translate img by --py-img, clamped ±64px
    var vh = window.innerHeight;
    for (var k = 0; k < pxPanels.length; k++) {
      var p = pxPanels[k];
      if (!p._px) continue;
      var r = p.getBoundingClientRect();
      var prog = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      prog = Math.max(-1, Math.min(1, prog));
      var sp = parseFloat(p.getAttribute("data-px-speed") || "1");
      p.style.setProperty("--py-img", (prog * 64 * sp).toFixed(1) + "px");
    }
    // hero recon-camera zoom — slow telephoto breathing (14s cycle), header image only
    if (heroFrame && heroFrame._px && !reduceMotion) {
      var zc = 1.55 + 0.22 * (0.5 - 0.5 * Math.cos(now * (Math.PI * 2 / 14000)));
      heroFrame.style.setProperty("--py-zoom", zc.toFixed(3));
      if (heroZoomNum) {
        var zl = zc.toFixed(1) + "x";
        if (heroZoomNum._last !== zl) { heroZoomNum._last = zl; heroZoomNum.textContent = zl; }
      }
    }
    // terminal card differential drift
    if (termCard) termCard.style.setProperty("--py-card", (y * -0.05).toFixed(1) + "px");

    requestAnimationFrame(loop);
  }
  if (reduceMotion) {
    frame(0, 16); // one static frame
  }
  requestAnimationFrame(loop);

  /* ============ reveals (staggered) ============ */
  var revealIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        revealIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "500px 0px 500px 0px" });

  function staggerize(scope) {
    var items = scope.querySelectorAll(".reveal:not([data-staggered]), .reveal-hero:not([data-staggered])");
    items.forEach(function (el, idx) {
      el.setAttribute("data-staggered", "1");
      el.style.setProperty("--d", (Math.min(idx, 8) * 0.09).toFixed(2) + "s");
      revealIO.observe(el);
    });
  }
  staggerize(document);

  /* ============ mobile menu ============ */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    menu.hidden = open;
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      menu.hidden = true;
    });
  });

  /* ============ terminal typed demo (synthetic training range) ============ */
  var termBody = document.getElementById("termBody");
  var LINES = [
    { h: '<span class="dim"># synthetic training range — no live targets</span>' },
    { h: '<span class="p">$</span> blacksite recon --range 10.13.37.0/24' },
    { h: '<span class="ok">[+]</span> 142 hosts up — 3 expose management ports' },
    { h: '<span class="ok">[+]</span> service fingerprint complete <span class="dim">(41s)</span>' },
    { h: '<span class="warn">[!]</span> edge gateway — unauthenticated RCE pattern' },
    { h: '<span class="p">$</span> blacksite breach --profile quiet --dry-run' },
    { h: '<span class="ok">[+]</span> initial access path confirmed <span class="dim">(t+00:04:12)</span>' },
    { h: '<span class="ok">[+]</span> persistence implant staged — <span class="dim">firmware</span>' },
    { h: '<span class="dim">[*]</span> exfil window 02:00–04:00 UTC — <span class="warn">contained</span>' },
    { h: '<span class="p">$</span> blacksite report --format evidence <span class="term-caret"></span>' }
  ];
  var typed = false;
  function typeTerm() {
    if (typed) return; typed = true;
    var li = 0, ci = 0, plain = "", out = "";
    // strip tags for typing, re-apply per line at line end
    var stripped = LINES.map(function (l) {
      var d = document.createElement("div"); d.innerHTML = l.h;
      return { html: l.h, text: d.textContent };
    });
    function tick() {
      if (li >= stripped.length) return;
      var cur = stripped[li];
      ci++;
      if (ci <= cur.text.length) {
        // reveal progressively: show typed chars of plain text with a caret
        termBody.innerHTML = out +
          '<div>' + escapeHtml(cur.text.slice(0, ci)) + '<span class="term-caret"></span></div>';
        setTimeout(tick, cur.text.charAt(0) === "$" || cur.text.charAt(0) === "#" ? 26 : 12);
      } else {
        out += "<div>" + cur.html + "</div>";
        li++; ci = 0;
        termBody.innerHTML = out + (li < stripped.length ? '<div><span class="term-caret"></span></div>' : "");
        setTimeout(tick, li < stripped.length && stripped[li].text.charAt(0) === "$" ? 420 : 160);
      }
    }
    tick();
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (reduceMotion || noReveal) {
    termBody.innerHTML = LINES.map(function (l) { return "<div>" + l.h + "</div>"; }).join("");
    typed = true;
  } else {
    var termIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { typeTerm(); termIO.disconnect(); }
      });
    }, { threshold: 0.3 });
    termIO.observe(termCard);
  }

  /* ============ field files (data: js/projects.js) ============ */
  var THUMBS = {
    "FILE-001": "assets/img/cap-recon.jpg",
    "FILE-002": "assets/img/cap-persist.jpg",
    "FILE-003": "assets/img/cap-exfil.jpg"
  };
  var list = document.getElementById("fileList");
  if (list && window.BLACKSITE_PROJECTS) {
    window.BLACKSITE_PROJECTS.forEach(function (p, idx) {
      var art = document.createElement("article");
      art.className = "file reveal";
      art.style.setProperty("--d", (idx * 0.1).toFixed(2) + "s");
      var flag = p.placeholder ? '<span class="flag">PLACEHOLDER</span>' : "";
      art.innerHTML =
        '<div class="file-thumb"><img src="' + THUMBS[p.id] +
        '" alt="" loading="lazy" /></div>' +
        '<div><div class="file-head"><span class="file-id">' + p.id +
        '</span><span class="file-disc">' + p.discipline + "</span>" + flag + "</div>" +
        '<h3 class="file-codename">' + p.codename + "</h3>" +
        '<p class="file-abstract">' + p.abstract + "</p></div>";
      list.appendChild(art);
      revealIO.observe(art);
    });
  }

  /* ============ hero Matrix typing ============ */
  window.BLACKSITE = window.BLACKSITE || {};
  (function () {
    var h1 = document.querySelector(".hero-typed");
    if (!h1) return;
    var lines = Array.prototype.slice.call(h1.querySelectorAll(".typed-line"));
    var caret = h1.querySelector(".typed-caret");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The knock sound (assets/audio/knockknock.mp3) fires automatically here.
    // External hook still available:
    //   window.BLACKSITE.onKnock = function () { ... };
    // or: window.addEventListener("blacksite:knock", function () { ... });
    function playKnock() {
      var a = document.getElementById("knock-sound");
      if (!a) return;
      // One shot, exactly on the knock. Browsers block ALL page audio until the
      // visitor has clicked/tapped/keyed the page at least once — if it is still
      // blocked at knock time we stay silent rather than firing seconds late.
      try {
        var p = a.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }

    function fireKnock() {
      try { window.dispatchEvent(new CustomEvent("blacksite:knock")); } catch (e) {}
      if (typeof window.BLACKSITE.onKnock === "function") {
        try { window.BLACKSITE.onKnock(); } catch (e) {}
      }
      playKnock();
    }

    function typeLine(el, text, done) {
      if (el.classList.contains("typed-knock")) fireKnock();
      el.appendChild(caret); // caret follows the typing
      var i = 0;
      var fast = el.classList.contains("typed-knock"); // the knock raps out quick
      (function tick() {
        if (i <= text.length) {
          // keep caret last: type into a text node before it
          if (!el.firstChild || el.firstChild.nodeType !== 3) el.insertBefore(document.createTextNode(""), caret);
          el.firstChild.nodeValue = text.slice(0, i);
          i++;
          setTimeout(tick, fast ? 22 + Math.random() * 22 : 70 + Math.random() * 70);
        } else done();
      })();
    }

    function run(idx) {
      if (idx >= lines.length) return; // caret keeps blinking at the end
      var el = lines[idx];
      var text = el.getAttribute("data-text") || "";
      typeLine(el, text, function () {
        // pause AFTER the line finishes — data-pause sets it per line
        var wait = parseInt(el.getAttribute("data-pause") || "450", 10);
        setTimeout(function () { run(idx + 1); }, wait);
      });
    }

    function startReveal() {
      setTimeout(function () { run(0); }, 600);
    }

    if (reduceMotion || noReveal) {
      lines.forEach(function (el) { el.textContent = el.getAttribute("data-text") || ""; });
      if (caret && lines.length) lines[lines.length - 1].appendChild(caret);
      fireKnock();
    } else if (document.fonts && document.fonts.load) {
      // Wait for Courier Prime before typing: if the webfont lands mid-reveal
      // every line re-renders with new metrics and the caret visibly jumps.
      var started = false;
      var go = function () { if (!started) { started = true; startReveal(); } };
      try { document.fonts.load('700 100px "Courier Prime"').then(go, go); }
      catch (e) { go(); }
      setTimeout(go, 1500); // never hold the hero hostage on a slow font fetch
    } else {
      startReveal();
    }
  })();
})();
