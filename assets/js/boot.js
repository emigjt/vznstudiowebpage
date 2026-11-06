/*
  Boot sequence
  -------------
  On a visitor's first page load (once per browser session) the screen starts empty
  and "Vision Studios" types out like a terminal. Then the screen fades and the
  hero's own intro plays as the page appears. Any click, key, scroll or tap skips it,
  and it never plays for visitors who ask for reduced motion.

  Off unless --boot is 1 in :root (assets/css/styles.css). Timing and look are the
  --boot-* variables there; the text is data-text on the .boot element in index.html.
  In edit mode it plays on every load, follows the panel's settings, and has a
  Replay button.

  This file loads at the top of <body>, before the page is drawn, so the page never
  flashes up before the boot screen covers it.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var overlay = document.querySelector("[data-boot]");
  if (!overlay) return;
  var typedEl = overlay.querySelector(".boot-typed");
  var restEl = overlay.querySelector(".boot-rest");
  var line = overlay.querySelector(".boot-line");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var editing = /[?&]edit(?:[=&]|$)/.test(window.location.search) ||
    window.location.hash === "#edit" || root.hasAttribute("data-edit");

  /* Settings ---------------------------------------------------------------- */
  // In edit mode the panel's saved tweaks count from the very first frame, before
  // the panel itself has loaded.
  function savedTweaks() {
    if (!editing) return {};
    try {
      var saved = JSON.parse(window.localStorage.getItem("vzn-edit-v1") || "null");
      return (saved && saved.vars) || {};
    } catch (e) { return {}; }
  }
  function setting(name) {
    var tweak = savedTweaks()[name];
    return tweak != null ? String(tweak).trim() : getComputedStyle(root).getPropertyValue(name).trim();
  }
  function num(name, fallback) {
    var v = parseFloat(setting(name));
    return isNaN(v) ? fallback : v;
  }
  function isOn() { return num("--boot", 0) >= 0.5; }

  function layout() {
    line.style.fontSize = "min(" + (setting("--boot-size") || "2rem") + ", 10vw)";
    overlay.classList.toggle("is-top-left", setting("--boot-align") === "top-left");
  }

  /* Playing ----------------------------------------------------------------- */
  var timers = [];
  var finishNow = null;   // set while the sequence runs; skips straight to the fade

  function later(fn, ms) { timers.push(window.setTimeout(fn, ms)); }
  function stop() { timers.forEach(window.clearTimeout); timers = []; }

  // The hero's own intro (headline rising, logo fading in) waits while the boot runs.
  var HERO_INTRO = ".hero-mark, .hero-title .line > span, .hero-slogan .line > span, .hero-links";
  function restartHeroIntro() {
    Array.prototype.forEach.call(document.querySelectorAll(HERO_INTRO), function (node) {
      node.style.animation = "none";
      void node.offsetWidth;   // let the browser register the reset
      node.style.animation = "";
    });
  }

  function play(isReplay) {
    stop();
    var text = overlay.getAttribute("data-text") || "";
    var speed = num("--boot-speed", 80);
    var delay = num("--boot-delay", 400);
    var hold = num("--boot-hold", 700);
    var fade = num("--boot-fade", 600);
    var shown = 0;

    layout();
    typedEl.textContent = "";
    restEl.textContent = text;   // holds the line's full width, so it never shifts while typing
    overlay.style.transition = "none";
    overlay.style.opacity = "1";
    overlay.classList.remove("is-typing");
    root.classList.add("boot-on", "booting");
    if (isReplay) {
      window.scrollTo({ top: 0, behavior: "instant" });
      restartHeroIntro();
    }

    function typeNext() {
      if (shown >= text.length) {
        overlay.classList.remove("is-typing");   // cursor blinks again while it holds
        later(end, hold);
        return;
      }
      shown++;
      typedEl.textContent = text.slice(0, shown);
      restEl.textContent = text.slice(shown);
      // A little unevenness reads as typing rather than a printout; spaces take longer.
      var ch = text.charAt(shown - 1);
      later(typeNext, speed * (0.7 + Math.random() * 0.6) * (ch === " " ? 1.8 : 1));
    }

    function end() {
      stop();
      finishNow = null;
      typedEl.textContent = text;
      restEl.textContent = "";
      overlay.classList.remove("is-typing");
      overlay.style.transition = "opacity " + fade + "ms ease";
      overlay.style.opacity = "0";
      root.classList.remove("booting");   // the hero's intro starts as the screen fades
      later(function () { root.classList.remove("boot-on"); }, fade);
    }

    finishNow = end;
    later(function () {
      overlay.classList.add("is-typing");
      typeNext();
    }, delay);
  }

  /* Skipping ---------------------------------------------------------------- */
  // Any click, key, scroll or tap skips to the fade (but not clicks in the edit panel).
  function skip(e) {
    if (!finishNow) return;
    var t = e.target;
    if (t && t.closest && t.closest(".vzn-editor, .vzn-dialog")) return;
    finishNow();
  }
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (type) {
    window.addEventListener(type, skip, { passive: true, capture: true });
  });

  /* Start ------------------------------------------------------------------- */
  var seen = false;
  try { seen = window.sessionStorage.getItem("vzn-boot-seen") === "1"; } catch (e) { /* storage blocked */ }
  var wasOn = isOn();
  if (wasOn && !reduceMotion && (editing || !seen)) {
    try { window.sessionStorage.setItem("vzn-boot-seen", "1"); } catch (e) { /* ignore */ }
    play(false);
  }

  // Edit mode: switching it on plays it, other changes apply to the next play
  // (size and position straight away), and the panel's Replay button calls play.
  document.addEventListener("vzn:change", function () {
    var on = isOn();
    layout();
    if (on && !wasOn && !reduceMotion) play(true);
    wasOn = on;
  });
  window.VZN_BOOT = {
    replay: function () { if (!reduceMotion) play(true); },
    reducedMotion: reduceMotion
  };
})();
