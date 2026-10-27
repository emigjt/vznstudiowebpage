(function () {
  "use strict";

  var projects = Array.isArray(window.VZN_PORTFOLIO) ? window.VZN_PORTFOLIO : [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var narrow = window.matchMedia("(max-width: 900px)");
  var LOGO = "assets/brand/logo-white.svg";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function slug(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
    if (heroMark && !reduceMotion) {
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
  function makeCover(project, variant) {
    var seed = hash(project.title + project.type + variant);
    var cover = el("div", "cover");
    var x = 10 + (seed % 80);
    var y = 10 + ((seed >> 4) % 80);
    var light = 18 + (seed % 14);
    cover.style.background =
      "radial-gradient(60% 50% at " + x + "% " + y + "%, hsl(30 3% " + light + "%), transparent 70%)," +
      "radial-gradient(80% 60% at " + (100 - x) + "% " + (100 - y) + "%, hsl(220 4% 12%), transparent 70%)," +
      "#0a0a0a";

    var label = el("div", "cover-label");
    label.appendChild(el("span", null, project.title));
    label.appendChild(el("span", null, project.year || ""));
    cover.appendChild(label);

    if (variant === 1) {
      if (project.category === "audio") {
        var wave = el("div", "cover-wave");
        for (var i = 0; i < 64; i++) {
          var bar = document.createElement("i");
          var amp = 0.06 + Math.abs(Math.sin((i + seed) * 0.37) * Math.cos(i * 0.11)) * 0.94;
          bar.style.height = Math.round(amp * 100) + "%";
          wave.appendChild(bar);
        }
        cover.appendChild(wave);
      } else {
        cover.appendChild(el("div", "cover-play"));
      }
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
    frame.loading = "lazy";
    frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    frame.allowFullscreen = true;
    if (className) frame.className = className;
    return frame;
  }

  function buildEmbed(project) {
    var media = project.media;
    if (!media || !media.src) return null;
    var title = project.title + " — player";
    switch (media.kind) {
      case "youtube":
        return iframe("https://www.youtube-nocookie.com/embed/" + encodeURIComponent(youtubeId(media.src)) + "?rel=0", null, title);
      case "vimeo":
        return iframe("https://player.vimeo.com/video/" + encodeURIComponent(vimeoId(media.src)) + "?color=ff3b2f", null, title);
      case "soundcloud":
        return iframe("https://w.soundcloud.com/player/?url=" + encodeURIComponent(media.src) +
          "&color=%23ff3b2f&visual=false&show_comments=false", "is-audio", title);
      case "spotify":
        return iframe(String(media.src).replace("open.spotify.com/", "open.spotify.com/embed/") +
          (String(media.src).indexOf("?") === -1 ? "?theme=0" : ""), "is-spotify", title);
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
        return video;
      default:
        return null;
    }
  }

  // Column spans (out of 12) for the gallery: varied sizes, top-aligned.
  function spansFor(count) {
    if (count === 1) return [8];
    if (count === 2) return [5, 7];
    if (count === 3) return [3, 5, 4];
    var cycle = [3, 5, 4, 7, 5, 4, 8];
    var out = [];
    for (var i = 0; i < count; i++) out.push(cycle[i % cycle.length]);
    return out;
  }

  /* Work index ------------------------------------------------------------- */
  var list = $("[data-work-list]");
  var empty = $("[data-work-empty]");
  var details = $("[data-work-details]");
  var desc = $("[data-work-desc]");
  var stage = $("[data-work-stage]");
  var current = -1;

  projects.forEach(function (project, index) {
    project.slug = project.slug || slug(project.title);
    var li = el("li");
    li.dataset.category = project.category;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.index = index;
    btn.appendChild(el("span", "cat", project.category === "audio" ? "A" : "V"));
    btn.appendChild(el("span", "title", project.title));
    btn.appendChild(el("span", "year", project.year || ""));
    btn.addEventListener("click", function () {
      select(index, true);
      if (narrow.matches) $("[data-work-info]").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
    li.appendChild(btn);
    list.appendChild(li);
  });

  function addDetail(term, value) {
    if (!value) return;
    var row = el("div");
    row.appendChild(el("dt", null, term));
    row.appendChild(el("dd", null, value));
    details.appendChild(row);
  }

  function select(index, fromUser) {
    var project = projects[index];
    if (!project) return;
    current = index;

    $$("button", list).forEach(function (b) {
      b.setAttribute("aria-current", String(Number(b.dataset.index) === index));
    });

    details.replaceChildren();
    addDetail("Client", project.client);
    addDetail("Year", project.year);
    addDetail("Type", project.type);
    addDetail("Discipline", project.category === "audio" ? "Audio" : "Visual");
    addDetail("Role", project.role);
    addDetail("Status", project.status);
    desc.textContent = project.description || "";

    stage.replaceChildren();
    var embed = buildEmbed(project);
    if (embed) {
      var embedWrap = el("div", "stage-item stage-embed");
      embedWrap.appendChild(embed);
      stage.appendChild(embedWrap);
    }

    var images = (project.images || []).map(function (img) {
      return typeof img === "string" ? { src: img } : img;
    });
    var count = images.length || 3;
    var spans = spansFor(count);
    for (var i = 0; i < count; i++) {
      var fig = el("figure", "stage-item span-" + spans[i]);
      if (images.length) {
        var img = document.createElement("img");
        img.src = images[i].src;
        img.alt = images[i].alt || project.title;
        img.loading = "lazy";
        fig.appendChild(img);
      } else {
        fig.appendChild(makeCover(project, i));
      }
      stage.appendChild(fig);
    }

    if (fromUser && window.history.replaceState) {
      window.history.replaceState(null, "", "#work/" + project.slug);
    }
  }

  /* Filters ---------------------------------------------------------------- */
  var filterButtons = $$("[data-filter]");
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.dataset.filter;
      filterButtons.forEach(function (b) {
        var active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      var firstVisible = -1;
      $$("li", list).forEach(function (li, i) {
        var match = value === "all" || li.dataset.category === value;
        li.hidden = !match;
        if (match && firstVisible === -1) firstVisible = i;
      });
      empty.hidden = firstVisible !== -1;
      var currentVisible = current !== -1 && !$$("li", list)[current].hidden;
      if (!currentVisible && firstVisible !== -1) select(firstVisible, true);
    });
  });

  // Open a project from a shared link (#work/project-slug), else the first one.
  var initial = 0;
  var match = window.location.hash.match(/^#work\/(.+)$/);
  if (match) {
    projects.forEach(function (p, i) { if (p.slug === decodeURIComponent(match[1])) initial = i; });
    window.addEventListener("load", function () { $("#work").scrollIntoView(); });
  }
  if (projects.length) select(initial, false);
  else empty.hidden = false;

  /* Reveal on scroll ------------------------------------------------------- */
  $$(".section-label, .statement, .studio-grid, .service-group, .process, .contact-headline, .contact-grid, .footer-mark").forEach(function (n) {
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
})();
