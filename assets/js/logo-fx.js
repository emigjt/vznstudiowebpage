/*
  Hero logo scroll reveal
  -----------------------
  The logo rests faint behind the headline: softly blurred, lightly ink-warped,
  with a still double-exposure ghost at its edges, all in greyscale. Scrolling holds
  the hero in place while the headline fades away and the logo sharpens into full
  view; then the page carries on.

  Two things keep it smooth:
  - The blurred, half-sharp and sharp logos are separate layers whose blur never
    changes, so the browser draws each once; scrolling only crossfades them and
    fades the headline (opacity and transform, which the graphics card handles).
  - The scene eases toward the scroll position instead of jumping to it, so a mouse
    wheel's notches glide rather than step.

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
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE_MS = 150;   // how quickly the scene catches up with the scroll position

  function el(tag, className) {
    var node = document.createElement(tag);
    node.className = className;
    node.setAttribute("aria-hidden", "true");
    return node;
  }
  function logoCopy() {
    var img = document.createElement("img");
    img.src = main.currentSrc || main.src;
    img.alt = "";
    return img;
  }

  // Layers, bottom to top: soft (blurred + warped + ghosts), mid (half-sharp), main (sharp)
  var stack = el("div", "mark-stack");
  var soft = el("div", "mark-soft");
  var softImg = logoCopy();
  var ghostA = el("div", "mark-layer is-ghost-a");
  var ghostB = el("div", "mark-layer is-ghost-b");
  soft.appendChild(ghostA);
  soft.appendChild(ghostB);
  soft.appendChild(softImg);
  var mid = el("div", "mark-mid");
  var midImg = logoCopy();
  mid.appendChild(midImg);
  mark.insertBefore(stack, main);
  stack.appendChild(soft);
  stack.appendChild(mid);
  stack.appendChild(main);

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
      drawLayers();
      target = shown = progress();
      render(shown);
    } else {
      clear();
    }
  }

  function px(v) { return v.toFixed(2) + "px"; }

  // The fixed look of each layer. Runs on load, on resize and when a setting
  // changes, never while scrolling.
  function drawLayers() {
    // Tuned on a desktop-sized logo; scaled down with smaller logos (phones) so the
    // look stays the same instead of washing out.
    var size = Math.min(1, mark.offsetWidth / 700);
    var blur = cfg.blur * size;
    if (disp) disp.setAttribute("scale", (cfg.distort * size).toFixed(1));
    softImg.style.filter = (disp && cfg.distort ? "url(#vzn-ink) " : "") + "blur(" + px(blur) + ")";
    midImg.style.filter = "blur(" + px(blur * 0.3) + ")";
    // Ghosts sit in the soft layer and fade with it; kept fainter than the logo.
    var ghost = Math.min(1, cfg.ghost * 1.2).toFixed(3);
    var spread = cfg.offset * size;
    ghostA.style.opacity = ghost;
    ghostA.style.transform = "translateX(" + px(-spread) + ")";
    ghostA.style.filter = "blur(" + px(blur * 1.6) + ")";
    ghostB.style.opacity = (ghost * 0.85).toFixed(3);
    ghostB.style.transform = "translateX(" + px(spread) + ")";
    ghostB.style.filter = "blur(" + px(blur * 1.8) + ")";
  }

  function clear() {
    [stack, soft, mid, main].concat(text).forEach(function (node) {
      node.style.opacity = "";
      node.style.transform = "";
      node.style.visibility = "";
    });
    if (disp) disp.setAttribute("scale", "0");
  }

  /* Scroll → reveal -------------------------------------------------------- */
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function smoothstep(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

  // 0 at the top of the page, 1 once the reveal distance has been scrolled.
  // Measures --fx-scroll in pixels. The hero is taller than that (by --fx-hold), so
  // once the reveal completes the logo stays pinned until the hold is scrolled past.
  var revealProbe = document.createElement("div");
  revealProbe.setAttribute("aria-hidden", "true");
  revealProbe.style.cssText = "position:absolute;top:0;left:0;width:0;height:var(--fx-scroll);visibility:hidden;pointer-events:none";
  hero.appendChild(revealProbe);

  function progress() {
    var scrolled = -hero.getBoundingClientRect().top;
    var reveal = revealProbe.offsetHeight;
    if (reveal <= 0) return scrolled > 0 ? 1 : 0;
    return clamp01(scrolled / reveal);
  }

  function render(p) {
    var hideText = smoothstep(p / 0.55);          // headline is gone a little past halfway
    var focus = smoothstep((p - 0.1) / 0.85);     // logo sharpens across the rest

    // Brightness and slight settle of the whole logo
    stack.style.opacity = (cfg.rest + (1 - cfg.rest) * focus).toFixed(3);
    stack.style.transform = "scale(" + (1 + 0.05 * (1 - focus)).toFixed(4) + ")";

    // Crossfade soft → mid → sharp. Each layer stays put underneath until the one
    // above has taken over, so the logo never dims in between.
    soft.style.opacity = (1 - smoothstep((focus - 0.25) / 0.5)).toFixed(3);
    mid.style.opacity = (smoothstep(focus / 0.45) * (1 - smoothstep((focus - 0.7) / 0.3))).toFixed(3);
    main.style.opacity = smoothstep((focus - 0.35) / 0.65).toFixed(3);

    // Headline and links fade and lift away
    text.forEach(function (node) {
      node.style.opacity = (1 - hideText).toFixed(3);
      node.style.transform = hideText > 0.001 ? "translate3d(0," + (-hideText * 28).toFixed(2) + "px,0)" : "";
      node.style.visibility = hideText > 0.995 ? "hidden" : "";
    });
  }

  var target = 0;    // where the scroll position says the reveal should be
  var shown = 0;     // where the scene currently is
  var running = false;
  var last = 0;

  function frame(t) {
    var dt = last ? Math.min(t - last, 64) : 16;
    last = t;
    target = progress();
    shown += (target - shown) * (reduceMotion ? 1 : 1 - Math.exp(-dt / EASE_MS));
    if (Math.abs(target - shown) < 0.0005) shown = target;
    render(shown);
    if (shown !== target) {
      window.requestAnimationFrame(frame);
    } else {
      running = false;
      last = 0;
    }
  }

  function request() {
    if (!cfg.on || running) return;
    running = true;
    window.requestAnimationFrame(frame);
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", function () {
    if (!cfg.on) return;
    drawLayers();
    request();
  });

  // Edit mode announces every change so new values apply immediately.
  document.addEventListener("vzn:change", readConfig);
  readConfig();
})();
