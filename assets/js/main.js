(function () {
  "use strict";

  var projects = Array.isArray(window.VZN_PORTFOLIO) ? window.VZN_PORTFOLIO : [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });

  /* Hero equalizer --------------------------------------------------------- */
  var eq = $("[data-eq]");
  if (eq) {
    var bars = Math.min(96, Math.floor(window.innerWidth / 14));
    for (var i = 0; i < bars; i++) {
      var bar = document.createElement("span");
      var h = 20 + Math.abs(Math.sin(i * 0.35) * 55) + Math.random() * 25;
      bar.style.setProperty("--h", Math.min(h, 100) + "%");
      bar.style.setProperty("--d", (-Math.random() * 1.6).toFixed(2) + "s");
      eq.appendChild(bar);
    }
  }

  /* Generated covers (used until real thumbnails are added) ---------------- */
  function makeCover(project) {
    var seed = hash(project.title + project.type);
    var hueA = seed % 360;
    var hueB = (hueA + 40 + (seed % 80)) % 360;
    var cover = el("div", "cover");
    cover.style.background =
      "radial-gradient(120% 90% at " + (seed % 100) + "% 0%, hsl(" + hueA + " 70% 55%), transparent 60%)," +
      "linear-gradient(135deg, hsl(" + hueB + " 55% 22%), hsl(" + hueA + " 40% 10%))";

    if (project.category === "audio") {
      var wave = el("div", "cover-wave");
      for (var i = 0; i < 48; i++) {
        var bar = document.createElement("i");
        var amp = 0.15 + Math.abs(Math.sin((i + seed) * 0.42) * Math.cos(i * 0.13)) * 0.85;
        bar.style.height = Math.round(amp * 100) + "%";
        wave.appendChild(bar);
      }
      cover.appendChild(wave);
    } else {
      cover.appendChild(el("div", "cover-frame"));
    }
    return cover;
  }

  /* Portfolio grid --------------------------------------------------------- */
  var grid = $("[data-work-grid]");
  var empty = $("[data-work-empty]");

  projects.forEach(function (project, index) {
    var li = el("li", "work-card reveal");
    li.dataset.category = project.category;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Open " + project.title + " — " + project.type);
    btn.addEventListener("click", function () { openViewer(project); });

    var thumb = el("div", "work-thumb");
    if (project.thumbnail) {
      var img = document.createElement("img");
      img.src = project.thumbnail;
      img.alt = "";
      img.loading = "lazy";
      thumb.appendChild(img);
    } else {
      thumb.appendChild(makeCover(project));
    }
    var badge = el("span", "work-badge");
    badge.appendChild(el("span", "dot dot-" + project.category));
    badge.appendChild(document.createTextNode(project.type));
    thumb.appendChild(badge);

    var meta = el("div", "work-meta");
    var text = el("div");
    text.appendChild(el("h3", "work-title", project.title));
    if (project.client) text.appendChild(el("p", "work-client", project.client));
    meta.appendChild(text);
    if (project.year) meta.appendChild(el("span", "work-year", project.year));

    btn.appendChild(thumb);
    btn.appendChild(meta);
    li.appendChild(btn);
    li.style.transitionDelay = (index % 3) * 80 + "ms";
    grid.appendChild(li);
  });

  /* Filters ---------------------------------------------------------------- */
  var filterButtons = $$("[data-filter]");
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.dataset.filter;
      filterButtons.forEach(function (b) {
        var active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      var shown = 0;
      $$(".work-card", grid).forEach(function (card) {
        var match = value === "all" || card.dataset.category === value;
        card.hidden = !match;
        if (match) shown++;
      });
      empty.hidden = shown > 0;
    });
  });

  /* Viewer ----------------------------------------------------------------- */
  var viewer = $("[data-viewer]");
  var viewerMedia = $("[data-viewer-media]");

  function youtubeId(src) {
    var m = String(src).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : src;
  }
  function vimeoId(src) {
    var m = String(src).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : src;
  }

  function iframe(src, className) {
    var frame = document.createElement("iframe");
    frame.src = src;
    frame.loading = "lazy";
    frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    frame.allowFullscreen = true;
    if (className) frame.className = className;
    return frame;
  }

  function buildMedia(project) {
    var media = project.media;
    if (!media || !media.src) {
      var wrap = makeCover(project);
      wrap.appendChild(el("div", "viewer-placeholder", "Media coming soon"));
      return wrap;
    }
    switch (media.kind) {
      case "youtube":
        return iframe("https://www.youtube-nocookie.com/embed/" + encodeURIComponent(youtubeId(media.src)) + "?rel=0");
      case "vimeo":
        return iframe("https://player.vimeo.com/video/" + encodeURIComponent(vimeoId(media.src)));
      case "soundcloud":
        return iframe("https://w.soundcloud.com/player/?url=" + encodeURIComponent(media.src) +
          "&color=%23c8ff3d&visual=false&show_comments=false", "is-audio");
      case "spotify":
        return iframe(String(media.src).replace("open.spotify.com/", "open.spotify.com/embed/"), "is-spotify");
      case "audio":
        var audio = document.createElement("audio");
        audio.controls = true;
        audio.src = media.src;
        return audio;
      case "video":
        var video = document.createElement("video");
        video.controls = true;
        video.playsInline = true;
        video.src = media.src;
        if (project.thumbnail) video.poster = project.thumbnail;
        return video;
      case "image":
        var img = document.createElement("img");
        img.src = media.src;
        img.alt = project.title;
        return img;
      default:
        return makeCover(project);
    }
  }

  function openViewer(project) {
    viewerMedia.replaceChildren(buildMedia(project));
    $("[data-viewer-title]").textContent = project.title;
    $("[data-viewer-meta]").textContent =
      [project.type, project.client, project.year].filter(Boolean).join(" · ");
    $("[data-viewer-desc]").textContent = project.description || "";
    var tags = $("[data-viewer-tags]");
    tags.replaceChildren();
    (project.tags || []).forEach(function (t) { tags.appendChild(el("li", null, t)); });
    viewer.showModal();
  }

  function closeViewer() { viewer.close(); }
  // Stop playback when the viewer closes (Esc, button or backdrop).
  viewer.addEventListener("close", function () { viewerMedia.replaceChildren(); });
  $("[data-viewer-close]").addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });

  /* Reveal on scroll ------------------------------------------------------- */
  $$(".section-head, .about-grid, .service-group, .process li, .contact-grid").forEach(function (n) {
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
    }, { rootMargin: "0px 0px -10% 0px" });
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

  $("[data-year]").textContent = new Date().getFullYear();
})();
