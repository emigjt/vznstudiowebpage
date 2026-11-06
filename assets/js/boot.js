/*
  Boot sequence
  -------------
  On a visitor's first page load (once per browser session) the screen starts empty
  and plays like a terminal:

    Vision Studios                      typed out
    password: visionbeyondsight         prompt appears, password typed out
    [██████████████████] 100%           loading bar fills
    access granted                      appears

  Then the text clears and the eye logo glitches on like a damaged tape (wavy rows,
  tears, smears, static), exactly where the hero logo sits, settles, and the screen
  fades into the page. Any click, key, scroll or tap
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

  /* Logo glitch ------------------------------------------------------------- */
  // The logo is redrawn on a full-screen canvas about 24 times a second (video-like
  // frame rate), torn and smeared like a damaged tape: rows wave sideways, bands jump
  // or show the wrong part of the logo, pixels smear into streaks and drips, static and
  // scanlines cross the screen, brightness flickers. Harsh at power-on, then bursts,
  // then a clean logo for the handoff. All greyscale. Strength is --boot-glitch.
  var canvas = overlay.querySelector(".boot-canvas");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var logoImg = logo.querySelector("img");
  var glitchFrame = 0;
  var glitchClean = null;   // draws the clean logo; set while a glitch run exists

  function stopGlitch() {
    if (glitchFrame) window.cancelAnimationFrame(glitchFrame);
    glitchFrame = 0;
    if (glitchClean) glitchClean();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function startGlitch(duration, strength) {
    stopGlitch();
    glitchClean = null;
    if (!ctx || !logoImg || !logoImg.complete || !logoImg.naturalWidth) return false;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.width = Math.round(window.innerWidth * dpr);
    var H = canvas.height = Math.round(window.innerHeight * dpr);
    var r = logo.getBoundingClientRect();
    var lw = Math.max(1, Math.round(r.width * dpr)), lh = Math.max(1, Math.round(r.height * dpr));
    var lx = Math.round(r.left * dpr), ly = Math.round(r.top * dpr);
    canvas.style.transformOrigin = (r.left + r.width / 2) + "px " + (r.top + r.height / 2) + "px";

    // The logo, drawn once at its on-screen size
    var src = document.createElement("canvas");
    src.width = lw; src.height = lh;
    try { src.getContext("2d").drawImage(logoImg, 0, 0, lw, lh); } catch (e) { return false; }

    // A strip of static, stretched across the screen for noise bands
    var noise = document.createElement("canvas");
    noise.width = 256; noise.height = 48;
    var nctx = noise.getContext("2d"), px = nctx.createImageData(256, 48);
    for (var i = 0; i < px.data.length; i += 4) {
      var v = Math.random() * 255;
      px.data[i] = px.data[i + 1] = px.data[i + 2] = v;
      px.data[i + 3] = Math.random() < 0.55 ? Math.random() * 255 : 0;
    }
    nctx.putImageData(px, 0, 0);

    var ink = getComputedStyle(root).getPropertyValue("--text").trim() || "#e8e7e3";
    var rowH = Math.max(1, Math.round(2 * dpr));
    var burstLevel = 0, burstLeft = 0;

    function clean() {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(src, lx, ly);
    }
    glitchClean = clean;

    // Copies a band of the logo (source rows sy..sy+h) to the screen, clipped to the logo
    function band(sx, sy, sw, h, dx, dy, dw, dh) {
      sy = Math.max(0, Math.min(lh - 1, Math.round(sy)));
      h = Math.max(1, Math.min(lh - sy, Math.round(h)));
      sx = Math.max(0, Math.min(lw - 1, Math.round(sx)));
      sw = Math.max(1, Math.min(lw - sx, Math.round(sw)));
      ctx.drawImage(src, sx, sy, sw, h, dx, dy, dw == null ? sw : dw, dh == null ? h : dh);
    }

    function draw(t) {
      // How wild this frame is: power-on chaos, then settling with bursts, then clean
      var env = t < 0.2 ? 1 : t < 0.78 ? 0.12 : t < 0.88 ? 0.04 : 0;
      if (burstLeft > 0) burstLeft--;
      else if (t >= 0.2 && t < 0.86 && Math.random() < 0.24) {
        burstLevel = rand(0.55, 1); burstLeft = 1 + Math.floor(Math.random() * 3);
      } else burstLevel = 0;
      var A = Math.min(1.5, Math.max(env, burstLeft > 0 ? burstLevel : 0) * strength * 1.5);
      if (A < 0.02) { clean(); return; }

      ctx.clearRect(0, 0, W, H);

      // Brightness flicker, with near-blackouts while it powers on
      var alpha = 1;
      if (t < 0.2) alpha = [0, 0.2, 1, 0.55, 0.9, 0.1, 1, 0.75][Math.floor(Math.random() * 8)];
      else if (Math.random() < A * 0.35) alpha = rand(0.3, 0.85);
      ctx.globalAlpha = alpha;

      // Whole-frame jitter, and now and then a vertical roll
      var jx = rand(-0.5, 0.5) * A * 0.05 * lw;
      var jy = Math.random() < A * 0.25 ? rand(-0.5, 0.5) * A * 0.14 * lh : 0;
      var x0 = lx + jx, y0 = ly + jy;

      // Rows wave sideways (tracking error), in small blocks of rows for a choppy edge
      var amp = A * 0.04 * lw, freq = rand(0.004, 0.026) / dpr, ph = rand(0, 6.283);
      var blockEnd = 0, blockDx = 0;
      for (var y = 0; y < lh; y += rowH) {
        if (y >= blockEnd) { blockEnd = y + rowH * (2 + Math.floor(Math.random() * 10)); blockDx = rand(-0.5, 0.5) * amp * 0.7; }
        band(0, y, lw, rowH, x0 + Math.sin(y * freq + ph) * amp + blockDx, y0 + y);
      }

      // Tears: bands jump sideways; some show another part of the logo (cut in half)
      var tears = Math.floor(A * 3 + Math.random() * A * 3);
      for (var k = 0; k < tears; k++) {
        var ty = Math.floor(Math.random() * lh), th = Math.max(rowH, Math.floor(rand(0.02, 0.12) * lh));
        th = Math.min(th, lh - ty);
        var shift = (Math.random() < 0.5 ? -1 : 1) * rand(0.04, 0.26) * A * lw;
        var sy = Math.random() < 0.4 ? ty + rand(-0.35, 0.35) * lh : ty;
        ctx.clearRect(x0 - lw, y0 + ty, lw * 3, th);
        band(0, sy, lw, th, x0 + shift, y0 + ty);
        if (Math.random() < 0.4) {   // horizontal smear: one column stretched into streaks
          var cx = Math.floor(rand(0.15, 0.85) * lw);
          ctx.globalAlpha = alpha * 0.65;
          band(cx, sy, 2 * dpr, th, x0 + shift + cx, y0 + ty, rand(0.15, 0.6) * lw, th);
          ctx.globalAlpha = alpha;
        }
      }

      // Drips: a row of pixels stretched downward
      if (Math.random() < A * 0.6) {
        var dw = Math.floor(rand(0.1, 0.4) * lw), dxs = Math.floor(Math.random() * (lw - dw));
        var dys = Math.floor(rand(0.2, 0.75) * lh);
        ctx.globalAlpha = alpha * 0.8;
        band(dxs, dys, dw, Math.max(1, Math.round(dpr)), x0 + dxs, y0 + dys, dw, rand(0.06, 0.3) * lh * A);
        ctx.globalAlpha = alpha;
      }

      // Blocky compression artefacts: squares of the logo out of place
      var blocks = Math.floor(A * 6 * Math.random());
      for (var b = 0; b < blocks; b++) {
        var bs = Math.round(rand(12, 44) * dpr);
        var bx = Math.floor(Math.random() * (lw - bs) / bs) * bs, by = Math.floor(Math.random() * (lh - bs) / bs) * bs;
        band(bx, by, bs, bs, x0 + bx + rand(-1, 1) * bs * A, y0 + by + rand(-0.5, 0.5) * bs, bs, bs * rand(1, 2.2));
      }

      // Ghost: a faint second copy, slightly off
      if (Math.random() < A * 0.35) {
        ctx.globalAlpha = alpha * 0.2;
        ctx.drawImage(src, x0 + rand(-0.06, 0.06) * lw, y0 + rand(-0.02, 0.02) * lh);
      }

      // Static bands and scanlines across the whole screen
      var noiseBands = t < 0.2 ? 2 + Math.floor(Math.random() * 3) : (Math.random() < A * 0.8 ? 1 : 0);
      for (var n = 0; n < noiseBands; n++) {
        ctx.globalAlpha = rand(0.08, 0.3) * Math.min(1, A);
        ctx.drawImage(noise, 0, 0, 256, 48, 0, Math.random() * H, W, rand(6, 44) * dpr);
      }
      ctx.fillStyle = ink;
      var lines = Math.floor(A * 9 * Math.random()) + (t < 0.2 ? 2 : 0);
      for (var l = 0; l < lines; l++) {
        ctx.globalAlpha = rand(0.04, 0.22) * Math.min(1, A);
        ctx.fillRect(0, Math.random() * H, W, Math.max(1, Math.round(dpr * (Math.random() < 0.85 ? 1 : rand(3, 10)))));
      }
      ctx.globalAlpha = 1;
    }

    var start = window.performance.now(), lastTick = -1, TICK = 1000 / 24;
    function frame(now) {
      var elapsed = now - start;
      if (elapsed >= duration) { glitchFrame = 0; clean(); return; }
      var tick = Math.floor(elapsed / TICK);
      if (tick !== lastTick) { lastTick = tick; draw(elapsed / duration); }
      glitchFrame = window.requestAnimationFrame(frame);
    }
    draw(0);
    glitchFrame = window.requestAnimationFrame(frame);
    return true;
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
    logo.style.setProperty("--logo-time", logoTime + "ms");
    stopGlitch();
    glitchClean = null;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      overlay.classList.add("is-logo");        // terminal clears, logo glitches on
      // The canvas glitch; if a browser can't draw it, the plain logo flickers instead
      overlay.classList.toggle("has-canvas", startGlitch(logoTime, Math.max(0, Math.min(1, num("--boot-glitch", 0.7)))));
      later(end, logoTime);
    }

    function end() {
      stop();
      stopGlitch();   // a skip mid-glitch settles on the clean logo
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
