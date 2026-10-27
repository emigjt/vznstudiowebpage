/*
  Hero logo focus effect
  ----------------------
  At rest the logo sits out of focus: blurred, warped like wet ink, with red and
  blue ghosts drifting apart, a motion smear and flickering horizontal bands.
  As the cursor approaches it pulls into focus and settles crisp on the page;
  on touch screens a tap toggles focus.

  Off unless --logo-fx is 1 in :root (assets/css/styles.css). Every strength is
  a --fx-* variable there, and all of them can be tried live in edit mode.
*/
(function () {
  "use strict";

  var mark = document.querySelector("[data-logo-fx]");
  if (!mark) return;
  var main = mark.querySelector(".mark-main");
  var filter = document.getElementById("vzn-ink");
  var disp = filter && filter.querySelector("feDisplacementMap");
  var turb = filter && filter.querySelector("feTurbulence");
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function layer(className) {
    var node = document.createElement("div");
    node.className = "mark-layer " + className;
    node.setAttribute("aria-hidden", "true");
    mark.appendChild(node);
    return node;
  }
  var smear = layer("is-smear");
  var tintA = layer("is-tint-a");
  var tintB = layer("is-tint-b");
  var slices = [layer("is-slice"), layer("is-slice")].map(function (node) {
    return { node: node, top: 40, height: 6, dir: 1, flicker: 1 };
  });

  /* Settings from CSS variables ------------------------------------------- */
  var cfg = { on: false };
  function num(name) { return parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0; }
  function readConfig() {
    cfg.on = num("--logo-fx") >= 0.5;
    cfg.blur = num("--fx-blur");
    cfg.offset = num("--fx-offset");
    cfg.distort = num("--fx-distort");
    cfg.ghost = num("--fx-ghost");
    cfg.slices = num("--fx-slices");
    cfg.glow = num("--fx-glow");
    if (cfg.on) request();
    else clear();
  }

  function clear() {
    main.style.filter = "";
    main.style.transform = "";
    [smear, tintA, tintB].concat(slices.map(function (s) { return s.node; })).forEach(function (node) {
      node.style.opacity = "0";
      node.style.transform = "";
      node.style.filter = "";
    });
    if (disp) disp.setAttribute("scale", "0");
  }

  /* Focus target from the pointer ----------------------------------------- */
  var focus = 0;    // 0 = fully distorted, 1 = sharp
  var target = 0;

  function smoothstep(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  if (finePointer) {
    window.addEventListener("pointermove", function (e) {
      var r = mark.getBoundingClientRect();
      var radius = Math.max(r.width, r.height) / 2 || 1;
      var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) / radius;
      // Sharp inside ~70% of the logo, fully distorted beyond ~2.4x its radius.
      target = smoothstep((2.4 - d) / 1.7);
      request();
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", function () { target = 0; request(); });
  } else {
    mark.addEventListener("click", function () { target = target > 0.5 ? 0 : 1; request(); });
  }

  /* Animation -------------------------------------------------------------- */
  var running = false;
  var visible = true;
  var lastBoil = 0;
  var lastFrame = 0;

  function request() {
    if (!running && visible && cfg.on) {
      running = true;
      window.requestAnimationFrame(frame);
    }
  }

  // Re-roll the ink noise and smear bands a few times a second, like a hand-drawn boil.
  function boil() {
    if (turb) turb.setAttribute("seed", String(1 + Math.floor(Math.random() * 97)));
    slices.forEach(function (s) {
      s.top = 12 + Math.random() * 70;
      s.height = 2 + Math.random() * 9;
      s.dir = Math.random() < 0.5 ? -1 : 1;
      s.flicker = 0.5 + Math.random() * 0.5;
    });
  }

  function frame(t) {
    running = false;
    if (!cfg.on || !visible) { lastFrame = 0; return; }
    // Ease toward the target at the same speed on any frame rate (~0.6s to settle).
    var dt = lastFrame ? Math.min(t - lastFrame, 100) : 16;
    lastFrame = t;
    focus += (target - focus) * (reduceMotion ? 1 : 1 - Math.exp(-dt / 160));
    if (Math.abs(target - focus) < 0.002) focus = target;
    var k = 1 - focus;                       // effect strength
    var time = reduceMotion ? 0 : t / 1000;
    if (!reduceMotion && k > 0.02 && t - lastBoil > 110) { lastBoil = t; boil(); }
    render(k, time);
    if (focus !== target || (k > 0.01 && !reduceMotion)) request();
    else lastFrame = 0;   // loop stops; the next start measures time afresh
  }

  function px(v) { return v.toFixed(2) + "px"; }

  function render(k, time) {
    if (k < 0.01) k = 0;
    var o = cfg.offset * k;
    var drift = 1 + 0.2 * Math.sin(time * 1.3);
    var blur = cfg.blur * k;

    if (k < 0.01) {
      main.style.filter = "";
      main.style.transform = "";
    } else {
      main.style.filter = (disp ? "url(#vzn-ink) " : "") + "blur(" + px(blur) + ")" +
        " drop-shadow(0 0 " + px(cfg.glow * k) + " rgba(232, 231, 227, " + (0.55 * k).toFixed(2) + "))";
      main.style.transform = "translateX(" + px(o * 0.3 * Math.sin(time * 0.7)) + ")" +
        " skewX(" + (-k * cfg.distort / 7).toFixed(2) + "deg)";
    }
    if (disp) disp.setAttribute("scale", (cfg.distort * k).toFixed(1));

    var ghost = cfg.ghost * k;
    tintA.style.opacity = ghost.toFixed(3);
    tintA.style.transform = "translate(" + px(-o * drift) + ", " + px(o * 0.08) + ")";
    tintA.style.filter = "blur(" + px(blur * 1.9 + 1.5 * k) + ")";

    tintB.style.opacity = (ghost * 0.9).toFixed(3);
    tintB.style.transform = "translate(" + px(o * drift * 0.8) + ", " + px(-o * 0.06) + ")";
    tintB.style.filter = "blur(" + px(blur * 2.2 + 1.5 * k) + ")";

    smear.style.opacity = (ghost * 0.45).toFixed(3);
    smear.style.transform = "translateX(" + px(o * 1.6 * drift) + ") scaleX(" + (1 + 0.14 * k).toFixed(3) + ")";
    smear.style.filter = "blur(" + px(blur * 3 + 3 * k) + ")";

    slices.forEach(function (s, i) {
      var bottom = Math.max(0, 100 - s.top - s.height);
      s.node.style.opacity = (cfg.slices * k * s.flicker).toFixed(3);
      s.node.style.clipPath = "inset(" + s.top.toFixed(1) + "% 0 " + bottom.toFixed(1) + "% 0)";
      s.node.style.transform = "translateX(" + px(s.dir * o * (1.4 + i * 0.6)) + ")";
      s.node.style.filter = "blur(" + px(blur * 0.4) + ")";
    });
  }

  /* Pause when the hero is off screen ------------------------------------- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      request();
    }).observe(mark);
  }
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    request();
  });

  // Edit mode announces every change so new values apply immediately.
  document.addEventListener("vzn:change", readConfig);
  readConfig();
})();
