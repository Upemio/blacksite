/* BLACKSITE — interactions. Vanilla JS, no dependencies. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- page-load entrance ---------- */
  function armEntrance() {
    if (reduceMotion) { document.body.classList.add("loaded"); return; }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { document.body.classList.add("loaded"); });
    });
  }

  /* ---------- scroll reveals (single wipe treatment) ---------- */
  function armReveals() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- videos: no autoplay under reduced motion; pause off-screen ---------- */
  function armVideos() {
    var vids = document.querySelectorAll("video");
    vids.forEach(function (v) {
      if (reduceMotion) { v.removeAttribute("autoplay"); v.pause(); }
    });
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.play().catch(function () {}); }
        else { e.target.pause(); }
      });
    });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- mobile nav ---------- */
  function armNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;
    function set(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
    }
    toggle.addEventListener("click", function () {
      set(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        set(false); toggle.focus();
      }
    });
  }

  /* ---------- capabilities: interconnected discipline system ---------- */
  var DISCIPLINES = {
    ai: {
      code: "DISC/AI", name: "Artificial Intelligence",
      desc: "Applied machine intelligence: systems that learn, decide, and act inside real operating constraints. We build models as instruments — calibrated, bounded, and honest about where their confidence ends.",
      focus: [
        ["Applied ML systems", "Models wired into production workflows, not demos."],
        ["Automation", "Repetitive cognitive labor, handed to machines that do not tire."],
        ["Local-first intelligence", "Capability that runs where your data lives."],
        ["Experimentation", "Hypotheses, controls, and the discipline to be wrong fast."]
      ]
    },
    sec: {
      code: "DISC/SEC", name: "Cybersecurity",
      desc: "Security as an engineering discipline, not a product category. We study how systems break, build the instruments that find the breaks, and harden what matters — on both sides of the perimeter.",
      focus: [
        ["Security research", "Reading systems closely enough to find what the vendor missed."],
        ["Offensive security", "Adversarial thinking, aimed at your own walls first."],
        ["Defensive engineering", "Detection, containment, and recovery that actually trigger."],
        ["Vulnerability analysis", "Severity measured in exploitability, not adjectives."],
        ["Security tooling", "Instruments we build because nothing off the shelf fit."]
      ]
    },
    chaos: {
      code: "DISC/CHAOS", name: "Chaos Engineering",
      desc: "Resilience is a claim until it is tested. We inject failure under controlled conditions — limited blast radius, full observability — and record what held and what did not.",
      focus: [
        ["Controlled failure injection", "Faults introduced deliberately, never by accident."],
        ["Resilience validation", "Recovery measured in seconds, not in hope."],
        ["Infrastructure stress testing", "Load the system until it tells the truth."],
        ["Reliability research", "Failure modes catalogued before they catalogue you."]
      ]
    },
    data: {
      code: "DISC/DATA", name: "Data Intelligence",
      desc: "The substrate under everything else. We build data systems that are boring in the right ways — correct, observable, fast enough — so the interesting work on top of them can be trusted.",
      focus: [
        ["Data systems", "Pipelines and stores engineered for correctness first."],
        ["Analytics infrastructure", "Answers you can reproduce, not dashboards you admire."],
        ["Computational research", "Hard problems, attacked with real compute."],
        ["Information engineering", "Structure imposed on chaos, carefully."]
      ]
    }
  };
  var WIRE = { ai: "wire-ai", sec: "wire-sec", chaos: "wire-chaos", data: "wire-data" };
  var NODE = { ai: "node-ai", sec: "node-sec", chaos: "node-chaos", data: "node-data" };

  function armCapabilities() {
    var detail = document.getElementById("capDetail");
    var nameEl = document.getElementById("capName");
    var codeEl = document.getElementById("capCode");
    var descEl = document.getElementById("capDesc");
    var focusEl = document.getElementById("capFocus");
    if (!detail) return;

    function render(key) {
      var d = DISCIPLINES[key];
      nameEl.textContent = d.name;
      codeEl.textContent = d.code;
      descEl.textContent = d.desc;
      focusEl.innerHTML = "";
      d.focus.forEach(function (f) {
        var li = document.createElement("li");
        var strong = document.createElement("strong");
        strong.textContent = f[0];
        var span = document.createElement("span");
        span.textContent = f[1];
        li.appendChild(strong); li.appendChild(span);
        focusEl.appendChild(li);
      });
    }

    function select(key) {
      Object.keys(DISCIPLINES).forEach(function (k) {
        var on = k === key;
        var node = document.getElementById(NODE[k]);
        if (node) node.setAttribute("aria-pressed", String(on));
        var wire = document.getElementById(WIRE[k]);
        if (wire) wire.classList.toggle("lit", on);
      });
      document.querySelectorAll(".capsys-list button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-disc") === key));
      });
      function swap() {
        render(key);
        detail.classList.remove("swap");
      }
      if (reduceMotion) { swap(); return; }
      detail.classList.add("swap");
      setTimeout(swap, 180);
    }

    Object.keys(DISCIPLINES).forEach(function (key) {
      var node = document.getElementById(NODE[key]);
      if (node) {
        node.addEventListener("click", function () { select(key); });
        node.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(key); }
        });
      }
    });
    document.querySelectorAll(".capsys-list button").forEach(function (b) {
      b.addEventListener("click", function () { select(b.getAttribute("data-disc")); });
    });
    render("ai");
  }

  /* ---------- research: field files accordion (data-driven) ---------- */
  function armFiles() {
    var list = document.getElementById("fileList");
    var projects = window.BLACKSITE_PROJECTS || [];
    if (!list) return;
    projects.forEach(function (p, i) {
      var item = document.createElement("div");
      item.className = "file";

      var head = document.createElement("button");
      head.type = "button";
      head.className = "file-head";
      head.setAttribute("aria-expanded", "false");
      head.setAttribute("aria-controls", "file-body-" + i);
      head.id = "file-head-" + i;

      var code = document.createElement("span");
      code.className = "file-code";
      var idSmall = document.createElement("small");
      idSmall.textContent = p.id;
      code.appendChild(idSmall);
      code.appendChild(document.createTextNode(p.codename));

      var disc = document.createElement("span");
      disc.className = "file-disc";
      disc.textContent = p.discipline;

      var status = document.createElement("span");
      status.className = "file-status";
      status.textContent = p.status;

      var chev = document.createElement("span");
      chev.className = "file-chevron";
      chev.setAttribute("aria-hidden", "true");

      head.appendChild(code); head.appendChild(disc);
      head.appendChild(status); head.appendChild(chev);

      var body = document.createElement("div");
      body.className = "file-body";
      body.id = "file-body-" + i;
      body.setAttribute("role", "region");
      body.setAttribute("aria-labelledby", "file-head-" + i);
      var inner = document.createElement("div");
      inner.className = "file-body-inner";
      if (p.placeholder) {
        var flag = document.createElement("span");
        flag.className = "file-flag";
        flag.textContent = "PLACEHOLDER — no work has shipped under this file yet.";
        inner.appendChild(flag);
      }
      var abs = document.createElement("p");
      abs.textContent = p.abstract;
      inner.appendChild(abs);
      body.appendChild(inner);

      head.addEventListener("click", function () {
        var open = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!open));
        body.style.maxHeight = !open ? body.scrollHeight + "px" : "0px";
      });

      item.appendChild(head); item.appendChild(body);
      list.appendChild(item);
    });
  }

  /* ---------- go ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    armEntrance();
    armReveals();
    armVideos();
    armNav();
    armCapabilities();
    armFiles();
  });
})();
