/*
  Boot sequence
  -------------
  On a visitor's first page load (once per browser session) the screen starts empty
  and plays like a terminal:

    Vision Studios                      typed out
    password: visionbeyondsight         prompt appears, password typed out
    [██████████████████] 100%           loading bar fills
    access granted                      appears

  Then the text clears and the eye logo flickers on with a subtle glitch, exactly where
  the hero logo sits, and the screen fades into the page. Any click, key, scroll or tap
  skips it, and it never plays for visitors who ask for reduced motion. It is only an
  animation: nobody types the password and nothing is locked.

  Off unless --boot is 1 in :root (assets/css/styles.css). Timing and look are the
  --boot-* variables there; the words are the data-* attributes on the .boot element
  in index.html. In edit mode it plays on every load, follows the panel's settings,
  and has a Replay button. Adding ?boot to the address plays it on every load even
  while it is off (and even with reduced motion): the way to preview it on any device.

  This file loads at the top of <body>, before the page is drawn, so the page never
  flashes up before the boot screen covers it.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var overlay = document.querySelector("[data-boot]");
  if (!overlay) return;
  var term = overlay.querySelector(".boot-term");
  var logo = overlay.querySelector(".boot-logo");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var editing = /[?&]edit(?:[=&]|$)/.test(window.location.search) ||
    window.location.hash === "#edit" || root.hasAttribute("data-edit");
  var forced = /[?&]boot(?:[=&]|$)/.test(window.location.search);   // preview link

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
  function words(attr, fallback) {
    var v = overlay.getAttribute(attr);
    return v == null ? fallback : v;
  }

  /* The terminal ------------------------------------------------------------ */
  // Every line is built at full length but hidden, so the block has its final size
  // from the start and nothing shifts as lines type out.
  var BAR_CELLS = 20;
  var cursor = document.createElement("span");
  cursor.className = "boot-cursor";
  var lines = {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // A line that types: [prefix][typed][cursor][rest]. "rest" holds the untyped part
  // invisibly so the line keeps its full width.
  function typingLine(prefix, text) {
    var p = el("p", "boot-l");
    var line = { node: p, text: text, typed: el("span"), rest: el("span", "boot-rest", text) };
    if (prefix) p.appendChild(el("span", null, prefix));
    p.appendChild(line.typed);
    p.appendChild(line.rest);
    return line;
  }

  function build() {
    var masked = setting("--boot-password") === "hide";
    var password = words("data-password", "");
    term.replaceChildren();
    lines.title = typingLine("", words("data-text", "Vision Studios"));
    lines.password = typingLine(words("data-prompt", "password:") + " ",
      masked ? password.replace(/./g, "*") : password);
    lines.bar = { node: el("p", "boot-l") };
    lines.bar.fill = el("span", "boot-bar-fill");
    var bar = el("span", "boot-bar");
    bar.style.width = BAR_CELLS + "ch";
    bar.appendChild(lines.bar.fill);
    lines.bar.pct = el("span", null, "  0%");
    lines.bar.node.appendChild(el("span", null, "["));
    lines.bar.node.appendChild(bar);
    lines.bar.node.appendChild(el("span", null, "] "));
    lines.bar.node.appendChild(lines.bar.pct);
    lines.granted = typingLine("", words("data-granted", "access granted"));
    [lines.title, lines.password, lines.bar, lines.granted].forEach(function (line) {
      term.appendChild(line.node);
    });
  }

  function show(line, withCursor) {
    line.node.classList.add("is-shown");
    if (withCursor) line.node.insertBefore(cursor, line.rest || null);
    else if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
  }

  // Text size, capped so the longest line always fits the screen.
  function layout() {
    overlay.classList.toggle("is-top-left", setting("--boot-align") === "top-left");
    term.style.fontSize = setting("--boot-size") || "2rem";
    var room = overlay.clientWidth - parseFloat(getComputedStyle(overlay).paddingLeft) * 2;
    var wide = term.scrollWidth;
    if (room > 0 && wide > room) {
      term.style.fontSize = (parseFloat(getComputedStyle(term).fontSize) * room / wide * 0.98) + "px";
    }
  }

  // The logo appears exactly where the hero logo sits, so it can hand over to it.
  function placeLogo() {
    var mark = document.querySelector(".hero-mark");
    var r = mark && mark.getBoundingClientRect();
    if (r && mark.offsetWidth && r.bottom > 0 && r.top < window.innerHeight) {
      logo.style.left = (r.left + r.width / 2) + "px";
      logo.style.top = (r.top + r.height / 2) + "px";
      logo.style.width = mark.offsetWidth + "px";
    } else {
      logo.style.left = "50%";
      logo.style.top = "50%";
      logo.style.width = "min(60vmin, 520px)";
    }
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
    var speed = num("--boot-speed", 80);
    var delay = num("--boot-delay", 400);
    var hold = num("--boot-hold", 700);
    var fade = num("--boot-fade", 600);
    var loadTime = num("--boot-load", 1200);
    var logoTime = num("--boot-logo-time", 1400);
    var PAUSE = 320;   // between lines

    build();
    overlay.style.transition = "none";
    overlay.style.opacity = "1";
    overlay.className = "boot";
    logo.style.setProperty("--g", String(num("--boot-glitch", 0.5)));
    logo.style.setProperty("--logo-time", logoTime + "ms");
    root.classList.remove("boot-handoff");
    root.classList.add("boot-on", "booting");
    layout();
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    if (isReplay) restartHeroIntro();

    // Types a line's text, then calls done. A little unevenness reads as typing
    // rather than a printout; spaces take longer.
    function type(line, done) {
      var shown = 0;
      overlay.classList.add("is-typing");
      (function next() {
        if (shown >= line.text.length) {
          overlay.classList.remove("is-typing");   // cursor blinks again when idle
          done();
          return;
        }
        shown++;
        line.typed.textContent = line.text.slice(0, shown);
        line.rest.textContent = line.text.slice(shown);
        var ch = line.text.charAt(shown - 1);
        later(next, speed * (0.7 + Math.random() * 0.6) * (ch === " " ? 1.8 : 1));
      })();
    }

    // Fills the bar in uneven steps, like a real load, then calls done.
    function load(done) {
      var steps = 9, t = 0, plan = [], total = 0, i;
      for (i = 0; i < steps; i++) { var w = 0.4 + Math.random(); plan.push(w); total += w; }
      var progress = 0;
      plan.forEach(function (w, k) {
        t += loadTime * (w / total);
        later(function () {
          progress = k === steps - 1 ? 1 : Math.min(0.97, progress + w / total * (0.7 + Math.random() * 0.6));
          var cells = Math.round(progress * BAR_CELLS);
          lines.bar.fill.style.width = cells + "ch";
          var pct = String(Math.round(progress * 100));
          lines.bar.pct.textContent = ("  " + pct).slice(-3) + "%";   // always 4 characters
          if (k === steps - 1) done();
        }, t);
      });
    }

    function startLogo() {
      placeLogo();
      root.classList.add("boot-handoff");      // the hero logo is already "there"
      overlay.classList.add("is-logo");        // terminal clears, logo flickers on
      later(end, logoTime);
    }

    function end() {
      stop();
      finishNow = null;
      overlay.classList.remove("is-typing");
      overlay.classList.add("is-ending");
      overlay.style.transition = "opacity " + fade + "ms ease";
      overlay.style.opacity = "0";
      root.classList.remove("booting");   // the hero's intro starts as the screen fades
      later(function () { root.classList.remove("boot-on"); }, fade);
    }

    finishNow = end;
    show(lines.title, true);
    later(function () {
      type(lines.title, function () {
        later(function () {
          show(lines.password, true);
          later(function () {
            type(lines.password, function () {
              later(function () {                       // "enter"
                show(lines.bar, false);
                load(function () {
                  later(function () {
                    lines.granted.typed.textContent = lines.granted.text;
                    lines.granted.rest.textContent = "";
                    show(lines.granted, true);
                    later(startLogo, hold);
                  }, 180);
                });
              }, PAUSE);
            });
          }, PAUSE);
        }, PAUSE);
      });
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
  window.addEventListener("resize", function () { if (finishNow) layout(); });

  /* Start ------------------------------------------------------------------- */
  var seen = false;
  try { seen = window.sessionStorage.getItem("vzn-boot-seen") === "1"; } catch (e) { /* storage blocked */ }
  var wasOn = isOn();
  if (forced) {
    play(false);
  } else if (wasOn && !reduceMotion && (editing || !seen)) {
    try { window.sessionStorage.setItem("vzn-boot-seen", "1"); } catch (e) { /* ignore */ }
    play(false);
  }

  // Edit mode: switching it on plays it, other changes apply to the next play
  // (size and position straight away), and the panel's Replay button calls play.
  document.addEventListener("vzn:change", function () {
    var on = isOn();
    if (finishNow) layout();
    if (on && !wasOn && !reduceMotion) play(true);
    wasOn = on;
  });
  window.VZN_BOOT = {
    replay: function () { if (forced || !reduceMotion) play(true); },
    forced: forced,
    reducedMotion: reduceMotion && !forced
  };
})();
