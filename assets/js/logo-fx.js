/*
  Hero logo scroll reveal
  -----------------------
  The logo rests faint behind the headline: softly blurred, lightly ink-warped,
  with a still double-exposure ghost at its edges, all in greyscale. Scrolling holds the hero in place
  while the headline fades away and the logo sharpens into full view; then the
  page carries on. Nothing moves on its own; every change follows the scroll.

  Off unless --logo-fx is 1 in :root (assets/css/styles.css). Every strength is
  a --fx-* variable there, and all of them can be tried live in edit mode.
*/
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  var mark = document.querySelector("[data-logo-fx]");
  if (!hero || !mark) return;
  var main = mark.querySelector(".mark-main");
  var text = [".hero-title", ".hero-slogan", ".hero-links"].map(function (s) { return document.querySelector(s); }).filter(Boolean);
  var filter = document.getElementById("vzn-ink");
  var disp = filter && filter.querySelector("feDisplacementMap");
  var root = document.documentElement;

  function layer(className) {
    var node = document.createElement("div");
    node.className = "mark-layer " + className;
    node.setAttribute("aria-hidden", "true");
    mark.appendChild(node);
    return node;
  }
  var ghostA = layer("is-ghost-a");
  var ghostB = layer("is-ghost-b");

  /* Settings from CSS variables ------------------------------------------- */
  var cfg = { on: false };
  function num(name) { return parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0; }
  function readConfig() {
    cfg.on = num("--logo-fx") >= 0.5;
    cfg.rest = Math.min(1, num("--fx-rest"));
    cfg.blur = num("--fx-blur");
    cfg.distort = num("--fx-distort");
    cfg.ghost = num("--fx-ghost");
    cfg.offset = num("--fx-offset");
    root.classList.toggle("fx-on", cfg.on);
    if (cfg.on) {
      mark.style.transform = "";   // the regular hero parallax steps aside
      update();
    } else {
      clear();
    }
  }

  function clear() {
    [main, ghostA, ghostB].concat(text).forEach(function (node) {
      node.style.opacity = "";
      node.style.filter = "";
      node.style.transform = "";
      node.style.visibility = "";
    });
    if (disp) disp.setAttribute("scale", "0");
  }

  /* Scroll → reveal -------------------------------------------------------- */
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function smoothstep(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function px(v) { return v.toFixed(2) + "px"; }

  // 0 at the top of the page, 1 once the reveal distance has been scrolled.
  function progress() {
    var travel = hero.offsetHeight - window.innerHeight;
    return travel > 0 ? clamp01(-hero.getBoundingClientRect().top / travel) : 0;
  }

  function update() {
    ticking = false;
    if (!cfg.on) return;
    var p = progress();
    var hideText = smoothstep(p / 0.55);          // headline is gone a little past halfway
    var showLogo = smoothstep((p - 0.1) / 0.85);  // logo sharpens across the rest
    var k = 1 - showLogo;                          // how much "behind the text" look remains
    // Blur and spread are tuned on a desktop-sized logo; scale them down with smaller
    // logos (phones) so the look stays the same instead of washing out.
    var size = Math.min(1, mark.offsetWidth / 700);

    // Logo
    var opacity = cfg.rest + (1 - cfg.rest) * showLogo;
    main.style.opacity = opacity.toFixed(3);
    main.style.filter = k > 0.01
      ? (disp && cfg.distort ? "url(#vzn-ink) " : "") + "blur(" + px(cfg.blur * size * k) + ")"
      : "";
    main.style.transform = k > 0.01 ? "scale(" + (1 + 0.05 * k).toFixed(4) + ")" : "";
    if (disp) disp.setAttribute("scale", (cfg.distort * size * k).toFixed(1));

    // Still double-exposure ghosts at the edges, merging back into the logo as it
    // sharpens. Kept fainter than the logo itself so they read as an echo.
    var ghost = cfg.ghost * k * Math.min(1, opacity * 1.2);
    var spread = cfg.offset * size * k;
    ghostA.style.opacity = ghost.toFixed(3);
    ghostA.style.transform = "translateX(" + px(-spread) + ") scale(" + (1 + 0.05 * k).toFixed(4) + ")";
    ghostA.style.filter = "blur(" + px(cfg.blur * size * k * 1.6) + ")";
    ghostB.style.opacity = (ghost * 0.85).toFixed(3);
    ghostB.style.transform = "translateX(" + px(spread) + ") scale(" + (1 + 0.05 * k).toFixed(4) + ")";
    ghostB.style.filter = "blur(" + px(cfg.blur * size * k * 1.8) + ")";

    // Headline and links fade, soften and lift away
    text.forEach(function (node) {
      node.style.opacity = (1 - hideText).toFixed(3);
      node.style.filter = hideText > 0.01 ? "blur(" + px(hideText * 8) + ")" : "";
      node.style.transform = hideText > 0.01 ? "translateY(" + px(-hideText * 24) + ")" : "";
      node.style.visibility = hideText > 0.99 ? "hidden" : "";
    });
  }

  var ticking = false;
  function request() {
    if (cfg.on && !ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);

  // Edit mode announces every change so new values apply immediately.
  document.addEventListener("vzn:change", readConfig);
  readConfig();
})();
