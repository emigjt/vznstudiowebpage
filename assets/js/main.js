(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var LOGO = "assets/brand/eye-white.svg";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* Images ------------------------------------------------------------------- */
  // data/media.js (written by tools/optimize-images.py) lists, for each JPEG, its size
  // in pixels and the lighter AVIF / WebP copies beside it. A picture offers those to
  // browsers that can show them and falls back to the JPEG; an image that isn't listed
  // is shown as it is.
  var MEDIA = window.VZN_MEDIA || {};
  function swapExt(src, ext) { return src.replace(/\.[a-z0-9]+$/i, "." + ext); }
  function setPicture(pic, src) {
    var info = MEDIA[src] || {};
    var img = $("img", pic);
    pic.replaceChildren(img);             // drop the previous image's sources
    ["avif", "webp"].forEach(function (format) {
      if (!info[format]) return;
      var source = document.createElement("source");
      source.type = "image/" + format;
      source.srcset = swapExt(src, format);
      pic.insertBefore(source, img);
    });
    if (info.w && info.h) { img.width = info.w; img.height = info.h; }
    img.src = src;
  }
  function picture(src, lazy) {
    var pic = document.createElement("picture");
    var img = document.createElement("img");
    img.decoding = "async";
    if (lazy) img.loading = "lazy";
    pic.appendChild(img);
    if (src) setPicture(pic, src);
    return { node: pic, img: img };
  }
  // Fetch an image ahead of time, in the format this browser will actually use.
  function warm(src) { return picture(src, false); }

  // Stable number from a string, used to vary generated covers per project.
  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /* Header + mobile nav ---------------------------------------------------- */
  var header = $("[data-header]");
  var nav = $("[data-nav]");
  var toggle = $("[data-nav-toggle]");

  // The phone menu covers the page, so while it is open the page behind it is switched
  // off for the keyboard and screen readers (inert): Tab stays within the menu, the logo
  // and the Close button. Closing it puts focus back on the button that opened it.
  function setNav(open) {
    var wasOpen = nav.classList.contains("is-open");
    if (open === wasOpen) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
    $$("main, .site-footer, [data-player]").forEach(function (part) { part.inert = open; });
    if (!open && nav.contains(document.activeElement)) toggle.focus();
  }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  // Leaving phone width (rotating, resizing) closes it, since the menu becomes a plain row
  window.matchMedia("(min-width: 761px)").addEventListener("change", function (e) { if (e.matches) setNav(false); });

  /* Scroll effects: header state + hero logo parallax ---------------------- */
  var heroMark = $("[data-parallax]");
  var pointer = { x: 0, y: 0 };
  var ticking = false;
  var SCROLLED_AFTER = 40;   // px of scrolling before the header drops its blurb and email
  function revealOn() { return document.documentElement.classList.contains("fx-on"); }

  function render() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > SCROLLED_AFTER);
    // Only when the logo scroll reveal is switched off (--logo-fx: 0): the logo sits above
    // the headline and drifts gently with the pointer and the scroll. With the reveal on
    // (the default), logo-fx.js positions the logo itself.
    if (heroMark && !reduceMotion && !revealOn()) {
      var p = Math.min(y / window.innerHeight, 1);
      heroMark.style.transform =
        "translate3d(" + (pointer.x * 16).toFixed(1) + "px," + (pointer.y * 12 - y * 0.15).toFixed(1) + "px,0)" +
        " rotate(" + (pointer.x * 4).toFixed(2) + "deg) scale(" + (1 + p * 0.15).toFixed(3) + ")";
    }
  }
  function requestRender() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(render); }
  }
  window.addEventListener("scroll", requestRender, { passive: true });
  if (finePointer) {
    window.addEventListener("mousemove", function (e) {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
      if (!revealOn()) requestRender();
    }, { passive: true });
  }
  render();

  /* Generated covers (used until real images are added) -------------------- */
  // kind: "sound" (waveform), "visual" (faint logo) or "video" (play mark).
  function makeCover(item, kind, ratio) {
    var seed = hash(item.title + item.type + (item.year || ""));
    var cover = el("div", "cover");
    var x = 10 + (seed % 80);
    var y = 10 + ((seed >> 4) % 80);
    // Where the patch of light falls and how strong it is; the colours are in the stylesheet.
    cover.style.setProperty("--cx", x + "%");
    cover.style.setProperty("--cy", y + "%");
    cover.style.setProperty("--cl", (55 + (seed % 40)) + "%");
    if (ratio) cover.style.aspectRatio = ratio;

    var label = el("div", "cover-label");
    label.appendChild(el("span", null, item.title));
    label.appendChild(el("span", null, item.year || ""));
    cover.appendChild(label);

    if (kind === "sound") {
      // The track's own waveform when its peaks are listed, otherwise a made-up one
      var peaks = Array.isArray(item.peaks) && item.peaks.length ? item.peaks : null;
      var wave = el("div", "cover-wave");
      for (var i = 0; i < (peaks ? peaks.length : 48); i++) {
        var bar = document.createElement("i");
        var amp = peaks ? Math.max(0.04, Math.min(1, +peaks[i] || 0))
          : 0.06 + Math.abs(Math.sin((i + seed) * 0.37) * Math.cos(i * 0.11)) * 0.94;
        bar.style.height = Math.round(amp * 100) + "%";
        wave.appendChild(bar);
      }
      cover.appendChild(wave);
    } else if (kind === "video") {
      cover.appendChild(el("div", "cover-play"));
    } else {
      var mark = document.createElement("img");
      mark.className = "cover-mark";
      mark.src = LOGO;
      mark.alt = "";
      cover.appendChild(mark);
    }
    return cover;
  }

  /* Media embeds ----------------------------------------------------------- */
  function youtubeId(src) {
    var m = String(src).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : src;
  }
  function vimeoId(src) {
    var m = String(src).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : src;
  }
  function iframe(src, className, title) {
    var frame = document.createElement("iframe");
    frame.src = src;
    frame.title = title;
    frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    frame.allowFullscreen = true;
    if (className) frame.className = className;
    return frame;
  }

  function buildEmbed(item) {
    var media = item.media;
    if (!media || !media.src) return null;
    var title = item.title + " — player";
    switch (media.kind) {
      case "youtube":
        return iframe("https://www.youtube-nocookie.com/embed/" + encodeURIComponent(youtubeId(media.src)) + "?rel=0", null, title);
      case "vimeo":
        return iframe("https://player.vimeo.com/video/" + encodeURIComponent(vimeoId(media.src)), null, title);
      case "soundcloud":
        return iframe("https://w.soundcloud.com/player/?url=" + encodeURIComponent(media.src) +
          "&color=%23e8e7e3&visual=false&show_comments=false", "is-audio", title);
      case "spotify":
        return iframe(String(media.src).replace("open.spotify.com/", "open.spotify.com/embed/") +
          (String(media.src).indexOf("?") === -1 ? "?theme=0" : ""), "is-spotify", title);
      case "video":
        var video = document.createElement("video");
        video.controls = true;
        video.playsInline = true;
        video.src = media.src;
        return video;
      default:
        return null;
    }
  }

  /* Viewer (artwork, videos, linked players) ------------------------------- */
  var viewer = $("[data-viewer]");
  var viewerMedia = $("[data-viewer-media]");

  function openViewer(item, kind) {
    var media = buildEmbed(item);
    if (!media && (item.full || item.image)) {
      // The large version, or its 1000px copy on a narrow screen (listed in data/media.js)
      var full = item.full || item.image;
      var info = MEDIA[full] || {};
      var view = picture(null, false);
      ["avif", "webp"].forEach(function (format) {
        if (!info[format]) return;
        var source = document.createElement("source");
        source.type = "image/" + format;
        source.srcset = (info.medium ? swapExt(full.replace(/-large(\.[a-z0-9]+)$/i, "-medium$1"), format) + " " + info.medium + "w, " : "") +
          swapExt(full, format) + " " + (info.w || 1600) + "w";
        source.sizes = "(max-width: 760px) 100vw, 1100px";
        view.node.insertBefore(source, view.img);
      });
      if (info.w && info.h) { view.img.width = info.w; view.img.height = info.h; }
      view.img.src = full;
      view.img.alt = item.title;
      media = view.node;
    }
    if (!media && item.cover) {
      media = document.createElement("img");
      media.src = item.cover;
      media.alt = item.title;
    }
    if (!media) media = makeCover(item, kind, "16 / 10");
    viewerMedia.replaceChildren(media);
    $("[data-viewer-meta]").textContent =
      [item.type, item.artist || item.client, item.year].filter(Boolean).join(" / ");
    $("[data-viewer-title]").textContent = item.title;
    $("[data-viewer-desc]").textContent = item.description || "";
    if (kind === "sound") pausePlayback();
    viewer.showModal();
  }
  // Closing (button, Esc or backdrop) stops anything playing inside.
  viewer.addEventListener("close", function () { viewerMedia.replaceChildren(); });
  $("[data-viewer-close]").addEventListener("click", function () { viewer.close(); });
  viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });

  /* Player ------------------------------------------------------------------ */
  // One audio element plays every beat, so two can never overlap. A bar fixed to the
  // bottom of the screen shows what is loaded wherever the visitor scrolls: play /
  // pause, title, a progress line that can be dragged, the time, and close.
  var audio = new Audio();
  audio.preload = "none";       // nothing is fetched until Play is pressed
  var FADE_MS = 200;            // fade on play, pause and when switching beats (no clicks)
  var SEEK_STEP = 5;            // seconds per arrow key
  var AUTO_ADVANCE = false;     // true: when a beat ends, the next one starts
  var tracks = [];              // every beat with audio, in page order: { item, card, button }
  var current = null;           // the loaded track (one of tracks) or null
  var loading = false;          // Play was pressed and sound hasn't started yet
  var fadeFrame = 0;

  var player = $("[data-player]");
  var playerToggle = $("[data-player-toggle]");
  var playerTitle = $("[data-player-title]");
  var playerMeta = $("[data-player-meta]");
  var playerTime = $("[data-player-time]");
  var playerScrub = $("[data-player-scrub]");
  var playerFill = $("i", playerScrub);
  var playerStatus = $("[data-player-status]");

  // iPhones and iPads ignore volume set by a page, so fades are skipped there.
  var canFade = (function () {
    try { var probe = new Audio(); probe.volume = 0.5; return probe.volume === 0.5; } catch (e) { return false; }
  })();

  function clock(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var s = Math.floor(seconds % 60);
    return Math.floor(seconds / 60) + ":" + (s < 10 ? "0" : "") + s;
  }

  function fadeTo(target, done) {
    window.cancelAnimationFrame(fadeFrame);
    if (!canFade) { if (done) done(); return; }
    var from = audio.volume, start = performance.now();
    (function step(now) {
      // (a frame's timestamp can be a hair earlier than "start", hence the clamps)
      var t = Math.max(0, Math.min(1, (now - start) / FADE_MS));
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t < 1) fadeFrame = window.requestAnimationFrame(step);
      else if (done) done();
    })(start);
  }

  function startPlayback() {
    loading = true;
    renderPlayer();
    if (canFade) audio.volume = 0;
    var started = audio.play();
    fadeTo(1);
    if (started && started.catch) started.catch(playFailed);
  }
  function pausePlayback() {
    if (audio.paused) return;
    fadeTo(0, function () { audio.pause(); });
  }
  function togglePlayback() {
    if (!current) return;
    if (audio.paused) startPlayback(); else pausePlayback();
  }
  function playFailed(err) {
    if (err && err.name === "AbortError") return;   // interrupted by a pause or another beat
    loading = false;
    if (!current) return;
    renderPlayer();
    current.button.textContent = "Can't play";
    playerStatus.textContent = "Couldn't play " + current.item.title + ".";
  }

  function load(track) {
    if (current) {
      current.card.classList.remove("is-playing", "is-current");
      setCardProgress(current, 0);
      labelButton(current, false);
    }
    current = track;
    track.card.classList.add("is-current");
    audio.src = track.item.media.src;
    playerTitle.textContent = track.item.title;
    playerMeta.textContent = [track.item.artist, track.item.bpm ? track.item.bpm + " BPM" : ""].filter(Boolean).join(" · ");
    playerStatus.textContent = "Now playing: " + track.item.title + ".";
    showPlayer(true);
    describeForSystem(track);
    renderProgress();
    startPlayback();
  }

  // Play on a card: toggles the loaded beat, or fades the old one out and starts this one.
  function playTrack(track) {
    if (current === track) { togglePlayback(); return; }
    if (current && !audio.paused) fadeTo(0, function () { audio.pause(); load(track); });
    else load(track);
  }
  function step(direction) {
    if (!current) return;
    var next = tracks[tracks.indexOf(current) + direction];
    if (next) playTrack(next);
  }
  function seek(seconds) {
    if (!current || !isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration - 0.05, seconds));
    renderProgress();
  }
  function closePlayer() {
    if (!current) return;
    var closing = current;
    current = null;
    loading = false;
    fadeTo(0, function () { audio.pause(); });
    closing.card.classList.remove("is-playing", "is-current");
    setCardProgress(closing, 0);
    labelButton(closing, false);
    showPlayer(false);
    playerStatus.textContent = "Player closed.";
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
  }

  /* What the visitor sees */
  function labelButton(track, isPlaying) {
    track.button.textContent = loading && track === current ? "Loading" : isPlaying ? "Pause" : "Play";
    track.button.setAttribute("aria-label", (isPlaying ? "Pause " : "Play ") + track.item.title);
    track.button.setAttribute("aria-busy", String(loading && track === current));
  }
  function setCardProgress(track, ratio) {
    var line = $(".card-progress i", track.card);
    if (line) line.style.transform = ratio ? "scaleX(" + ratio.toFixed(4) + ")" : "";
  }
  function renderPlayer() {
    if (!current) return;
    var isPlaying = !audio.paused;
    current.card.classList.toggle("is-playing", isPlaying);
    labelButton(current, isPlaying);
    playerToggle.textContent = loading ? "Loading" : isPlaying ? "Pause" : "Play";
    playerToggle.setAttribute("aria-label", (isPlaying ? "Pause " : "Play ") + current.item.title);
    playerToggle.classList.toggle("is-on", isPlaying && !loading);
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }
  function renderProgress() {
    if (!current) return;
    var duration = isFinite(audio.duration) ? audio.duration : 0;
    var ratio = duration ? Math.min(1, audio.currentTime / duration) : 0;
    playerFill.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    setCardProgress(current, ratio);
    playerTime.textContent = clock(audio.currentTime) + " / " + (duration ? clock(duration) : current.item.length || "0:00");
    playerScrub.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    playerScrub.setAttribute("aria-valuetext", clock(audio.currentTime) + " of " + clock(duration));
  }
  // Progress follows the audio every frame while it plays (the browser's own
  // "timeupdate" only fires about four times a second, which looks jerky).
  var progressFrame = 0;
  function followProgress() {
    window.cancelAnimationFrame(progressFrame);
    (function tick() {
      renderProgress();
      if (current && !audio.paused && !document.hidden) progressFrame = window.requestAnimationFrame(tick);
    })();
  }
  function showPlayer(open) {
    document.body.classList.toggle("has-player", open);
    if (open) {
      player.hidden = false;
      void player.offsetWidth;            // so the slide-in runs from the hidden position
      player.classList.add("is-open");
    } else {
      player.classList.remove("is-open");
      window.setTimeout(function () { if (!current) player.hidden = true; }, 320);
    }
  }

  audio.addEventListener("play", function () { renderPlayer(); followProgress(); });
  audio.addEventListener("playing", function () { loading = false; renderPlayer(); });
  audio.addEventListener("waiting", function () { loading = true; renderPlayer(); });
  audio.addEventListener("pause", function () { loading = false; renderPlayer(); renderProgress(); });
  audio.addEventListener("durationchange", renderProgress);
  audio.addEventListener("timeupdate", function () { if (document.hidden) renderProgress(); });
  audio.addEventListener("error", function () { if (current) playFailed(); });
  audio.addEventListener("ended", function () {
    audio.currentTime = 0;                // back to the start, ready to play again
    renderPlayer();
    renderProgress();
    if (AUTO_ADVANCE) step(1);
  });
  document.addEventListener("visibilitychange", function () { if (!document.hidden && current && !audio.paused) followProgress(); });

  playerToggle.addEventListener("click", togglePlayback);
  $("[data-player-close]").addEventListener("click", closePlayer);

  /* Dragging the progress line, or arrow keys while it has focus */
  function scrubTo(e) {
    var box = playerScrub.getBoundingClientRect();
    if (isFinite(audio.duration)) seek((e.clientX - box.left) / box.width * audio.duration);
  }
  playerScrub.addEventListener("pointerdown", function (e) {
    playerScrub.setPointerCapture(e.pointerId);
    scrubTo(e);
    playerScrub.addEventListener("pointermove", scrubTo);
  });
  ["pointerup", "pointercancel"].forEach(function (type) {
    playerScrub.addEventListener(type, function () { playerScrub.removeEventListener("pointermove", scrubTo); });
  });
  playerScrub.addEventListener("keydown", function (e) {
    var d = audio.duration;
    if (!isFinite(d)) return;
    var to = { ArrowRight: audio.currentTime + SEEK_STEP, ArrowUp: audio.currentTime + SEEK_STEP,
      ArrowLeft: audio.currentTime - SEEK_STEP, ArrowDown: audio.currentTime - SEEK_STEP,
      PageUp: audio.currentTime + d / 10, PageDown: audio.currentTime - d / 10, Home: 0, End: d }[e.key];
    if (to == null) return;
    e.preventDefault();
    e.stopPropagation();
    seek(to);
  });

  /* Keyboard, anywhere on the page: Space plays or pauses the loaded beat, the left
     and right arrows skip five seconds. Typing in the form and controls that use
     these keys themselves are left alone. */
  document.addEventListener("keydown", function (e) {
    if (!current || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (viewer.open || document.body.classList.contains("nav-open")) return;
    var t = e.target;
    var tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (e.key === " " || e.code === "Space") {
      if (tag === "BUTTON" || tag === "A" || (t && t.getAttribute && t.getAttribute("role") === "slider")) return;
      e.preventDefault();
      togglePlayback();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      seek(audio.currentTime + (e.key === "ArrowRight" ? SEEK_STEP : -SEEK_STEP));
    }
  });

  /* Lock screen, headphones and media keys (where the browser supports it) */
  function describeForSystem(track) {
    if (!("mediaSession" in navigator) || !window.MediaMetadata) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.item.title,
      artist: track.item.artist || "VZN",
      album: "Vision Studio Co.",
      artwork: [
        { src: "assets/brand/eye-icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "assets/brand/eye-icon-192.png", sizes: "192x192", type: "image/png" }
      ]
    });
  }
  if ("mediaSession" in navigator) {
    [["play", startPlayback], ["pause", pausePlayback],
      ["previoustrack", function () { step(-1); }], ["nexttrack", function () { step(1); }],
      ["seekbackward", function (d) { seek(audio.currentTime - (d.seekOffset || SEEK_STEP)); }],
      ["seekforward", function (d) { seek(audio.currentTime + (d.seekOffset || SEEK_STEP)); }],
      ["seekto", function (d) { if (d.seekTime != null) seek(d.seekTime); }]
    ].forEach(function (pair) {
      try { navigator.mediaSession.setActionHandler(pair[0], pair[1]); } catch (e) { /* action not supported */ }
    });
  }

  /* Work rails --------------------------------------------------------------- */
  var portfolio = window.VZN_PORTFOLIO || {};
  var soundItems = Array.isArray(portfolio.sound) ? portfolio.sound : [];
  var visualItems = Array.isArray(portfolio.visual) ? portfolio.visual : [];

  // Consecutive items with the same type form a group with a label.
  function groups(items) {
    var out = [];
    items.forEach(function (item) {
      var last = out[out.length - 1];
      if (!last || last.label !== item.type) out.push({ label: item.type || "", items: [item] });
      else last.items.push(item);
    });
    return out;
  }

  function groupLabel(group) {
    var li = el("li", "rail-group");
    li.appendChild(el("span", null, group.label));
    li.appendChild(el("span", "rail-count", pad(group.items.length)));
    return li;
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  var soundList = $("[data-sound-list]");
  groups(soundItems).forEach(function (group) {
    soundList.appendChild(groupLabel(group));
    group.items.forEach(function (item) {
      var card = el("li", "card card-sound");
      var media = el("div", "card-media");
      if (item.cover) {
        var img = document.createElement("img");
        img.src = item.cover;
        img.alt = "";
        img.loading = "lazy";
        media.appendChild(img);
      } else {
        media.appendChild(makeCover(item, "sound"));
      }
      var btn = el("button", "card-play pill");
      btn.type = "button";
      var hasMedia = item.media && item.media.src;
      if (!hasMedia) {
        btn.textContent = "Soon";
        btn.disabled = true;
        btn.setAttribute("aria-label", item.title + ": audio coming soon");
      } else {
        btn.textContent = item.media.kind === "audio" ? "Play" : "Listen";
        btn.setAttribute("aria-label", (item.media.kind === "audio" ? "Play " : "Listen to ") + item.title);
        if (item.media.kind === "audio") {
          var track = { item: item, card: card, button: btn };
          tracks.push(track);
          btn.addEventListener("click", function () { playTrack(track); });
        } else {
          // SoundCloud, Spotify and YouTube links open in the viewer
          btn.addEventListener("click", function () { openViewer(item, "sound"); });
        }
      }
      media.appendChild(btn);
      var progress = el("span", "card-progress");
      progress.appendChild(document.createElement("i"));
      media.appendChild(progress);
      card.appendChild(media);
      card.appendChild(el("p", "card-meta", [
        item.bpm ? item.bpm + " BPM" : "", item.key, item.length, item.year
      ].filter(Boolean).join(" · ")));
      card.appendChild(el("h4", "card-title", item.title));
      if (item.artist) card.appendChild(el("p", "card-sub", item.artist));
      soundList.appendChild(card);
    });
  });

  // Proportions as CSS needs them: aspect-ratio for the box, --r (a number) so the
  // stylesheet can shrink a wide piece to fit a narrow screen.
  function setRatio(node, ratio) {
    var parts = String(ratio).split("/");
    var r = parts.length === 2 ? parseFloat(parts[0]) / parseFloat(parts[1]) : parseFloat(ratio);
    if (!(r > 0)) r = 1;
    node.style.aspectRatio = String(ratio);
    node.style.setProperty("--r", r.toFixed(4));
  }

  // Visual pieces: varied heights, top-aligned, widths follow each image.
  var HEIGHTS = [1, 0.68, 0.86, 0.6, 0.94, 0.74];
  var RATIOS = ["4 / 5", "1 / 1", "3 / 4", "1 / 1", "5 / 4", "16 / 10"];
  var visualList = $("[data-visual-list]");
  var visualIndex = 0;
  groups(visualItems).forEach(function (group) {
    visualList.appendChild(groupLabel(group));
    group.items.forEach(function (item) {
      var i = visualIndex++;
      var isVideo = item.media && /youtube|vimeo|video/.test(item.media.kind) || /video/i.test(item.type || "");
      var card = el("li", "card card-visual");
      card.style.setProperty("--h", HEIGHTS[i % HEIGHTS.length]);
      var open = el("button", "card-media card-open");
      open.type = "button";
      open.setAttribute("aria-label", "Open " + item.title);
      if (item.image) {
        // Reserve the piece's width before the image arrives (the sideways scroll
        // length depends on it), then use the image's real proportions once loaded.
        setRatio(open, item.ratio || "1 / 1");
        // Loaded as the card nears the screen; its space is already reserved above
        var art = picture(null, true);
        art.img.alt = "";
        art.img.addEventListener("load", function () {
          if (this.naturalWidth) setRatio(open, this.naturalWidth + " / " + this.naturalHeight);
          measureWork();
        });
        setPicture(art.node, item.image);
        open.appendChild(art.node);
      } else {
        open.appendChild(makeCover(item, isVideo ? "video" : "visual", isVideo ? "16 / 10" : RATIOS[i % RATIOS.length]));
      }
      open.addEventListener("click", function () { openViewer(item, isVideo ? "video" : "visual"); });
      card.appendChild(open);
      card.appendChild(el("p", "card-meta", [item.year].filter(Boolean).join(" · ")));
      card.appendChild(el("h4", "card-title", item.title));
      if (item.client) card.appendChild(el("p", "card-sub", item.client));
      visualList.appendChild(card);
    });
  });

  /* Work: vertical scroll drives the sideways move -------------------------- */
  var work = $("[data-work]");
  var workPin = $("[data-work-pin]");
  var track = $("[data-work-track]");
  var visualPanel = $("#visual");
  var progressBar = $("[data-work-progress]");
  var jumps = $$("[data-work-jump]");
  var distance = 0;
  var workTicking = false;
  // The panels move sideways this many pixels for each pixel scrolled down, so Work
  // takes less scrolling than its width.
  var WORK_SPEED = 1.3;

  work.classList.add("is-pinned");

  function measureWork() {
    distance = Math.max(0, track.scrollWidth - workPin.clientWidth);
    // The section is tall enough to scroll the whole sideways distance at WORK_SPEED.
    work.style.height = Math.round(workPin.offsetHeight + distance / WORK_SPEED) + "px";
    updateWork();
  }

  function workOffset() {
    return Math.min(Math.max(-work.getBoundingClientRect().top, 0) * WORK_SPEED, distance);
  }

  function updateWork() {
    workTicking = false;
    var x = workOffset();
    var rect = work.getBoundingClientRect();
    document.documentElement.classList.toggle("in-work", rect.top <= 0 && rect.bottom >= window.innerHeight);
    track.style.transform = "translate3d(" + (-x).toFixed(1) + "px, 0, 0)";
    progressBar.style.transform = "scaleX(" + (distance ? x / distance : 0).toFixed(4) + ")";
    var onVisual = x + workPin.clientWidth * 0.5 >= visualPanel.offsetLeft;
    work.classList.toggle("on-visual", onVisual);
    jumps.forEach(function (a) {
      a.classList.toggle("is-active", (a.dataset.workJump === "visual") === onVisual);
    });
  }

  window.addEventListener("scroll", function () {
    if (!workTicking) { workTicking = true; window.requestAnimationFrame(updateWork); }
  }, { passive: true });
  window.addEventListener("resize", measureWork);
  window.addEventListener("load", measureWork);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureWork);
  measureWork();

  // Keyboard focus on an off-screen card scrolls the page to bring it into view.
  track.addEventListener("focusin", function (e) {
    var card = e.target.closest(".card, .work-panel");
    if (!card) return;
    workPin.scrollLeft = 0;   // the browser may try to scroll the clipped track itself
    var left = card.offsetLeft + (card.offsetParent !== track ? card.offsetParent.offsetLeft : 0);
    var x = workOffset();
    if (left < x || left + card.offsetWidth > x + workPin.clientWidth) {
      var top = work.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + Math.min(Math.max(left - workPin.clientWidth * 0.3, 0), distance) / WORK_SPEED, behavior: "instant" });
    }
  });

  // Sound / Visual links scroll to where that panel is in view.
  jumps.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var top = work.getBoundingClientRect().top + window.scrollY;
      var across = a.dataset.workJump === "visual" ? Math.min(visualPanel.offsetLeft, distance) : 0;
      window.scrollTo({ top: top + across / WORK_SPEED, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Shop ------------------------------------------------------------------- */
  var MOCKUPS = {
    tee: '<path d="M70 22 Q100 40 130 22 L164 36 L188 72 L162 88 L150 76 L150 184 L50 184 L50 76 L38 88 L12 72 L36 36 Z"/>',
    hoodie: '<path d="M72 32 Q100 6 128 32 L160 44 L182 150 L158 156 L148 96 L148 188 L52 188 L52 96 L42 156 L18 150 L40 44 Z"/>' +
      '<path class="seam" d="M84 34 Q100 58 116 34 M72 150 L128 150 L134 176 L66 176 Z"/>',
    poster: '<rect class="paper" x="48" y="14" width="104" height="152"/>'
  };

  function mockup(kind) {
    var wrap = el("div", "mockup mockup-" + kind);
    wrap.innerHTML = '<svg viewBox="0 0 200 200" aria-hidden="true">' + (MOCKUPS[kind] || MOCKUPS.tee) + "</svg>";
    var mark = document.createElement("img");
    mark.className = "mockup-mark";
    mark.src = kind === "poster" ? "assets/brand/eye-black.svg" : LOGO;
    mark.alt = "";
    wrap.appendChild(mark);
    return wrap;
  }

  var productList = $("[data-products]");
  (Array.isArray(window.VZN_SHOP) ? window.VZN_SHOP : []).forEach(function (product) {
    if (product.archived) return;   // kept in data/shop.js, not shown
    var li = el("li", "product");
    var media = el("div", "product-media");
    // Colour options each bring their own photos (and optionally their own checkout link)
    var colors = Array.isArray(product.colors) && product.colors.length ? product.colors : null;
    var current = colors ? colors[0] : product;
    function photosOf(option) {
      return Array.isArray(option.images) && option.images.length ? option.images
        : option.image ? [option.image] : [];
    }
    function label(option) { return product.name + (colors ? ", " + option.name : ""); }

    var front = null, back = null, flip = null;
    var showingBack = false;   // the same on every device: only a click or tap flips it
    var photos = photosOf(current);
    var frontPic = null, backPic = null;
    if (photos.length) {
      frontPic = picture(null, true);
      front = frontPic.img;
      media.appendChild(frontPic.node);
      // A second photo is the back: shown on hover, or with the Front / Back button
      if (photos.length > 1) {
        backPic = picture(null, true);
        back = backPic.img;
        back.className = "is-back";
        media.appendChild(backPic.node);
        media.classList.add("has-back");
        flip = el("button", "product-flip pill is-light", "Back");
        flip.type = "button";
        flip.setAttribute("aria-pressed", "false");
        media.appendChild(flip);
        // Clicking or tapping the photo flips it too; the button (inside the photo) is the
        // keyboard- and screen-reader-friendly way to do the same, handled by this one listener.
        media.addEventListener("click", function () {
          showingBack = !showingBack;
          showSide();
        });
      }
    } else {
      media.appendChild(mockup(product.mockup));
    }
    li.appendChild(media);

    function showSide() {
      if (!flip) return;
      var showBack = showingBack;
      media.classList.toggle("show-back", showBack);
      flip.textContent = showBack ? "Front" : "Back";
      flip.setAttribute("aria-pressed", String(showBack));
      flip.setAttribute("aria-label", "Show the " + (showBack ? "front" : "back") + " of the " + label(current));
    }
    function showPhotos() {
      var p = photosOf(current);
      if (front && p[0]) { setPicture(frontPic.node, p[0]); front.alt = label(current) + (back ? ", front" : ""); }
      if (back && p[1]) { setPicture(backPic.node, p[1]); back.alt = label(current) + ", back"; }
      showSide();
    }
    showPhotos();

    var info = el("div", "product-info");
    var head = el("div", "product-head");
    head.appendChild(el("h3", "product-name", product.name));
    head.appendChild(el("p", "product-price", product.price || "Price TBA"));
    info.appendChild(head);
    var type = el("p", "product-type", product.type || "");
    info.appendChild(type);

    if (colors && colors.length > 1) {
      var swatches = el("div", "product-colors");
      swatches.setAttribute("role", "group");
      swatches.setAttribute("aria-label", product.name + " colour");
      var colorName = el("span", "product-color-name", current.name);
      colors.forEach(function (option) {
        var sw = el("button", "product-swatch");
        sw.type = "button";
        sw.style.setProperty("--swatch", option.swatch || "#888");
        sw.setAttribute("aria-label", option.name);
        sw.setAttribute("aria-pressed", String(option === current));
        sw.title = option.name;
        sw.addEventListener("click", function () {
          current = option;
          Array.prototype.forEach.call(swatches.querySelectorAll(".product-swatch"), function (b) {
            b.setAttribute("aria-pressed", String(b === sw));
          });
          colorName.textContent = option.name;
          showPhotos();
          showBuy();
        });
        swatches.appendChild(sw);
      });
      swatches.appendChild(colorName);
      info.appendChild(swatches);
      // Fetch the other colours' photos the first time the visitor reaches for the product
      // (pointer, touch or keyboard), so switching is instant without loading them up front
      var warmed = false;
      var warmColours = function () {
        if (warmed) return;
        warmed = true;
        colors.forEach(function (option) { if (option !== current) photosOf(option).forEach(warm); });
      };
      ["pointerenter", "touchstart", "focusin"].forEach(function (type) {
        li.addEventListener(type, warmColours, { passive: true });
      });
    }

    if (product.sizes && product.sizes.length) {
      var sizes = el("ul", "product-sizes");
      sizes.setAttribute("aria-label", "Sizes");
      product.sizes.forEach(function (s) { sizes.appendChild(el("li", "pill is-small", s)); });
      info.appendChild(sizes);
    }
    var buySlot = el("div", "product-buy-slot");
    info.appendChild(buySlot);
    function showBuy() {
      var url = current.url || product.url;
      buySlot.replaceChildren();
      if (url) {
        var buy = el("a", "product-buy", "Buy [↗]");
        buy.href = url;
        buy.target = "_blank";
        buy.rel = "noopener";
        buySlot.appendChild(buy);
      } else {
        buySlot.appendChild(el("span", "product-buy is-soon", "Coming soon"));
      }
    }
    showBuy();
    li.appendChild(info);
    productList.appendChild(li);
  });
  // A single product is laid out as a feature (photo beside its details); two or more
  // go back to the grid.
  var single = productList.children.length === 1;
  productList.classList.toggle("is-single", single);
  $("#shop").classList.toggle("has-single", single);

  /* Reveal on scroll ------------------------------------------------------- */
  $$(".section-label, .shop-head, .products, .contact-headline, .contact-grid, .footer-mark").forEach(function (n) {
    n.classList.add("reveal");
  });
  var revealables = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (n) { n.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (n) { io.observe(n); });
  }

  /* Contact form ----------------------------------------------------------- */
  // To receive submissions in your inbox, create a free form at formspree.io
  // and paste its endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
  var FORM_ENDPOINT = "";

  var form = $("[data-contact-form]");
  var status = $("[data-form-status]");
  var contactEmail = $("[data-contact-email]").textContent.trim();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);

    if (!FORM_ENDPOINT) {
      var subject = "Project inquiry — " + data.get("service");
      var body = data.get("message") + "\n\n— " + data.get("name") + " (" + data.get("email") + ")";
      window.location.href = "mailto:" + contactEmail +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Opening your email app…";
      return;
    }

    status.textContent = "Sending…";
    fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        status.textContent = "Thanks — we'll be in touch soon.";
      })
      .catch(function () {
        status.textContent = "Something went wrong. Please email " + contactEmail + " directly.";
      });
  });

  $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* Vintage scratches: only switched on (and the image only loaded) above 0 -------- */
  function scratchSetting() {
    document.documentElement.classList.toggle("scratch-on",
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scratch")) > 0);
  }
  scratchSetting();
  document.addEventListener("vzn:change", scratchSetting);   // edit mode slider

  /* Edit mode: open the page with ?edit (or #edit) to load the design panel */
  if (/[?&]edit(?:[=&]|$)/.test(window.location.search) || window.location.hash === "#edit") {
    var editorCss = document.createElement("link");
    editorCss.rel = "stylesheet";
    editorCss.href = "assets/css/editor.css";
    document.head.appendChild(editorCss);
    var editorJs = document.createElement("script");
    editorJs.src = "assets/js/editor.js";
    document.body.appendChild(editorJs);
  }
})();
