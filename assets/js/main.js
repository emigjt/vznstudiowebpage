(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var LOGO = "assets/brand/logo-white.svg";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

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

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  /* Scroll effects: header state + hero logo parallax ---------------------- */
  var heroMark = $("[data-parallax]");
  var pointer = { x: 0, y: 0 };
  var ticking = false;

  function render() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    // The logo scroll reveal (logo-fx.js) positions the logo itself when it's on.
    if (heroMark && !reduceMotion && !document.documentElement.classList.contains("fx-on")) {
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
      requestRender();
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
    var light = 18 + (seed % 14);
    cover.style.background =
      "radial-gradient(60% 50% at " + x + "% " + y + "%, hsl(30 3% " + light + "%), transparent 70%)," +
      "radial-gradient(80% 60% at " + (100 - x) + "% " + (100 - y) + "%, hsl(220 4% 12%), transparent 70%)," +
      "#0a0a0a";
    if (ratio) cover.style.aspectRatio = ratio;

    var label = el("div", "cover-label");
    label.appendChild(el("span", null, item.title));
    label.appendChild(el("span", null, item.year || ""));
    cover.appendChild(label);

    if (kind === "sound") {
      var wave = el("div", "cover-wave");
      for (var i = 0; i < 48; i++) {
        var bar = document.createElement("i");
        var amp = 0.06 + Math.abs(Math.sin((i + seed) * 0.37) * Math.cos(i * 0.11)) * 0.94;
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
    if (!media && item.image) {
      media = document.createElement("img");
      media.src = item.image;
      media.alt = item.title;
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
    if (kind === "sound") audio.pause();
    viewer.showModal();
  }
  // Closing (button, Esc or backdrop) stops anything playing inside.
  viewer.addEventListener("close", function () { viewerMedia.replaceChildren(); });
  $("[data-viewer-close]").addEventListener("click", function () { viewer.close(); });
  viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });

  /* Shared audio player for sound cards ------------------------------------ */
  var audio = new Audio();
  audio.preload = "none";
  var playing = null;   // { item, card }
  var nowPlaying = $("[data-now-playing]");
  var npToggle = $("[data-np-toggle]");
  var npTitle = $("[data-np-title]");

  function cardButton(card) { return $(".card-play", card); }

  function showState() {
    if (!playing) return;
    var paused = audio.paused;
    var btn = cardButton(playing.card);
    btn.textContent = paused ? "Play" : "Pause";
    btn.setAttribute("aria-label", (paused ? "Play " : "Pause ") + playing.item.title);
    playing.card.classList.toggle("is-playing", !paused);
    npToggle.textContent = paused ? "Play" : "Pause";
    nowPlaying.hidden = false;
  }

  function toggleTrack(item, card) {
    var media = item.media;
    if (!media || !media.src) return;
    if (media.kind !== "audio") { openViewer(item, "sound"); return; }
    if (playing && playing.item === item) {
      if (audio.paused) audio.play().catch(playFailed); else audio.pause();
      return;
    }
    if (playing) {
      playing.card.classList.remove("is-playing");
      cardButton(playing.card).textContent = "Play";
      $(".card-progress i", playing.card).style.transform = "";
    }
    playing = { item: item, card: card };
    npTitle.textContent = item.title + (item.artist ? " — " + item.artist : "");
    audio.src = media.src;
    audio.play().catch(playFailed);
    showState();
  }
  function playFailed() {
    if (!playing) return;
    cardButton(playing.card).textContent = "Can't play";
    npToggle.textContent = "Play";
  }
  audio.addEventListener("play", showState);
  audio.addEventListener("pause", showState);
  audio.addEventListener("ended", showState);
  audio.addEventListener("timeupdate", function () {
    if (!playing || !audio.duration) return;
    $(".card-progress i", playing.card).style.transform = "scaleX(" + (audio.currentTime / audio.duration).toFixed(4) + ")";
  });
  npToggle.addEventListener("click", function () {
    if (!playing) return;
    if (audio.paused) audio.play().catch(playFailed); else audio.pause();
  });

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
      var btn = el("button", "card-play");
      btn.type = "button";
      var hasMedia = item.media && item.media.src;
      if (!hasMedia) {
        btn.textContent = "Soon";
        btn.disabled = true;
        btn.setAttribute("aria-label", item.title + ": audio coming soon");
      } else {
        btn.textContent = item.media.kind === "audio" ? "Play" : "Listen";
        btn.setAttribute("aria-label", (item.media.kind === "audio" ? "Play " : "Listen to ") + item.title);
        btn.addEventListener("click", function () { toggleTrack(item, card); });
      }
      media.appendChild(btn);
      var progress = el("span", "card-progress");
      progress.appendChild(document.createElement("i"));
      media.appendChild(progress);
      card.appendChild(media);
      card.appendChild(el("p", "card-meta", [
        item.bpm ? item.bpm + " BPM" : "", item.key, item.year
      ].filter(Boolean).join(" · ")));
      card.appendChild(el("h4", "card-title", item.title));
      if (item.artist) card.appendChild(el("p", "card-sub", item.artist));
      soundList.appendChild(card);
    });
  });

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
        var img = document.createElement("img");
        img.src = item.image;
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("load", measureWork);
        open.appendChild(img);
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

  work.classList.add("is-pinned");

  function measureWork() {
    distance = Math.max(0, track.scrollWidth - workPin.clientWidth);
    // The section is as tall as the sideways distance, so one pixel down = one pixel across.
    work.style.height = (workPin.offsetHeight + distance) + "px";
    updateWork();
  }

  function workOffset() {
    return Math.min(Math.max(-work.getBoundingClientRect().top, 0), distance);
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
      window.scrollTo({ top: top + Math.min(Math.max(left - workPin.clientWidth * 0.3, 0), distance), behavior: "instant" });
    }
  });

  // Sound / Visual links scroll to where that panel is in view.
  jumps.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var top = work.getBoundingClientRect().top + window.scrollY;
      var across = a.dataset.workJump === "visual" ? Math.min(visualPanel.offsetLeft, distance) : 0;
      window.scrollTo({ top: top + across, behavior: reduceMotion ? "auto" : "smooth" });
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
    mark.src = kind === "poster" ? "assets/brand/logo-black.svg" : LOGO;
    mark.alt = "";
    wrap.appendChild(mark);
    return wrap;
  }

  var productList = $("[data-products]");
  (Array.isArray(window.VZN_SHOP) ? window.VZN_SHOP : []).forEach(function (product) {
    var li = el("li", "product");
    var media = el("div", "product-media");
    if (product.image) {
      var img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      img.loading = "lazy";
      media.appendChild(img);
    } else {
      media.appendChild(mockup(product.mockup));
    }
    li.appendChild(media);

    var info = el("div", "product-info");
    var head = el("div", "product-head");
    head.appendChild(el("h3", "product-name", product.name));
    head.appendChild(el("p", "product-price", product.price || "Price TBA"));
    info.appendChild(head);
    info.appendChild(el("p", "product-type", product.type || ""));
    if (product.sizes && product.sizes.length) {
      var sizes = el("ul", "product-sizes");
      sizes.setAttribute("aria-label", "Sizes");
      product.sizes.forEach(function (s) { sizes.appendChild(el("li", null, s)); });
      info.appendChild(sizes);
    }
    if (product.url) {
      var buy = el("a", "product-buy", "Buy [↗]");
      buy.href = product.url;
      buy.target = "_blank";
      buy.rel = "noopener";
      info.appendChild(buy);
    } else {
      info.appendChild(el("span", "product-buy is-soon", "Coming soon"));
    }
    li.appendChild(info);
    productList.appendChild(li);
  });

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
