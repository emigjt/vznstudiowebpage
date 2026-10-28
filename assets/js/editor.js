/*
  VZN edit mode
  -------------
  Loaded only when the page is opened with ?edit in the address. Lets you try
  colours, fonts, sizes and spacing, and retype text, directly on the live
  page. Tweaks are remembered in this browser only; "Copy changes" produces a
  summary to paste back into the code (or send to whoever maintains it).
*/
(function () {
  "use strict";
  if (window.__vznEditor) return;
  window.__vznEditor = true;

  var STORE_KEY = "vzn-edit-v1";
  var root = document.documentElement;

  // A fourth item "site" marks fonts the site hosts itself (assets/fonts).
  var DISPLAY_FONTS = [
    ["ColdagSerif", null, "serif", "site"],
    ["ColdagSerif Outline", null, "serif", "site"],
    ["Instrument Serif", "ital@0;1", "serif"],
    ["Playfair Display", "ital,wght@0,400..900;1,400..900", "serif"],
    ["Fraunces", "ital,opsz,wght@0,9..144,300..900;1,9..144,300..900", "serif"],
    ["DM Serif Display", "ital@0;1", "serif"],
    ["Bodoni Moda", "ital,opsz,wght@0,6..96,400..900;1,6..96,400..900", "serif"],
    ["Cormorant Garamond", "ital,wght@0,300..700;1,300..700", "serif"],
    ["UnifrakturMaguntia", "", "serif"],
    ["Pirata One", "", "serif"],
    ["Anton", "", "sans-serif"],
    ["Bebas Neue", "", "sans-serif"],
    ["Inter Tight", "ital,wght@0,100..900;1,100..900", "sans-serif"],
    ["Syne", "wght@400..800", "sans-serif"],
    ["Space Grotesk", "wght@300..700", "sans-serif"]
  ];
  var BODY_FONTS = [
    ["IBM Plex Mono", "ital,wght@0,400;0,500;1,400", "monospace"],
    ["JetBrains Mono", "ital,wght@0,400;0,500;1,400", "monospace"],
    ["Space Mono", "ital,wght@0,400;0,700;1,400", "monospace"],
    ["DM Mono", "ital,wght@0,400;0,500;1,400", "monospace"],
    ["Geist Mono", "wght@400;500", "monospace"],
    ["Martian Mono", "wght@400;500", "monospace"],
    ["Courier Prime", "ital,wght@0,400;0,700;1,400", "monospace"],
    ["Inter Tight", "ital,wght@0,400;0,500;1,400", "sans-serif"],
    ["Space Grotesk", "wght@400;500", "sans-serif"]
  ];

  var CONTROLS = [
    { group: "Colour" },
    { key: "--bg", label: "Background", type: "color" },
    { key: "--text", label: "Text", type: "color" },
    { key: "--muted", label: "Muted text", type: "color" },
    { key: "--accent", label: "Accent", type: "color" },
    { key: "--paper", label: "Visual side background", type: "color" },
    { key: "--ink", label: "Visual side text", type: "color" },
    { key: "--surface", label: "Covers / fields", type: "color" },
    { key: "--line", label: "Lines", type: "color" },
    { key: "--line-strong", label: "Lines (strong)", type: "color" },

    { group: "Type" },
    { key: "--font-serif", label: "Headline font", type: "font", fonts: DISPLAY_FONTS },
    { key: "--font-mono", label: "Body font", type: "font", fonts: BODY_FONTS },
    { key: "--display-weight", label: "Headline weight", type: "select",
      options: [["300", "Light"], ["400", "Regular"], ["500", "Medium"], ["700", "Bold"], ["900", "Black"]] },
    { key: "--display-case", label: "Headline case", type: "select",
      options: [["none", "As typed"], ["uppercase", "UPPERCASE"], ["lowercase", "lowercase"]] },
    { key: "--display-scale", label: "Headline size", type: "range", min: 0.5, max: 1.6, step: 0.01, unit: "", fmt: pct },
    { key: "--display-leading", label: "Headline line spacing", type: "range", min: 0.6, max: 1.5, step: 0.01, unit: "", fmt: pct },
    { key: "--display-tracking", label: "Headline letter spacing", type: "range", min: -0.1, max: 0.1, step: 0.005, unit: "em" },
    { key: "--text-size", label: "Body text size", type: "range", min: 0.7, max: 1.2, step: 0.0125, unit: "rem", fmt: function (v) { return Math.round(v * 16) + "px"; } },

    { group: "Layout" },
    { key: "--pad", label: "Page margins", type: "range", min: 8, max: 120, step: 1, unit: "px" },
    { key: "--section-pad", label: "Space between sections", type: "range", min: 48, max: 320, step: 4, unit: "px" },
    { key: "--grain", label: "Film grain", type: "range", min: 0, max: 0.3, step: 0.01, unit: "", fmt: pct },

    { group: "Logo effect" },
    { key: "--logo-fx", label: "Hero logo scroll reveal", type: "select", options: [["0", "Off"], ["1", "On"]] },
    { key: "--mark-scale", label: "Hero logo size", type: "range", min: 0.4, max: 2.5, step: 0.01, unit: "", fmt: pct },
    { key: "--fx-mark-y", label: "Logo up / down", type: "range", min: -40, max: 40, step: 0.5, unit: "svh",
      fmt: function (v) { return v === 0 ? "centred" : Math.abs(v) + "% " + (v < 0 ? "up" : "down"); } },
    { key: "--fx-mark-x", label: "Logo left / right", type: "range", min: -40, max: 40, step: 0.5, unit: "vw",
      fmt: function (v) { return v === 0 ? "centred" : Math.abs(v) + "% " + (v < 0 ? "left" : "right"); } },
    { key: "--fx-rest", label: "Logo visibility behind text", type: "range", min: 0, max: 1, step: 0.01, unit: "", fmt: pct },
    { key: "--fx-blur", label: "Blur behind text", type: "range", min: 0, max: 24, step: 0.5, unit: "px" },
    { key: "--fx-distort", label: "Ink warp", type: "range", min: 0, max: 60, step: 1, unit: "" },
    { key: "--fx-ghost", label: "Ghosts", type: "range", min: 0, max: 1, step: 0.01, unit: "", fmt: pct },
    { key: "--fx-offset", label: "Ghost spread", type: "range", min: 0, max: 40, step: 1, unit: "px" },
    { key: "--fx-scroll", label: "Scroll distance to reveal", type: "range", min: 30, max: 200, step: 5, unit: "svh", fmt: function (v) { return Math.round(v) + "% of screen"; } },
    { key: "--fx-hold", label: "Hold after reveal", type: "range", min: 0, max: 200, step: 5, unit: "svh", fmt: function (v) { return Math.round(v) + "% of screen"; } }
  ];

  // Text you can click and retype while "Edit text" is on. Project entries come
  // from data/portfolio.js and are edited there instead.
  var EDITABLE = [
    ".header-blurb", ".header-contact", ".site-nav a",
    ".hero-title .line > span", ".hero-slogan .line > span", ".hero-links a", ".hero-foot > span",
    "#main .mono-title", ".panel-title", ".panel-lede", ".work-tabs a",
    ".shop-title", ".shop-lede",
    ".contact-headline", ".contact-email", ".contact-lede", ".contact .details dt", ".contact .details a",
    ".field label", ".contact-form .btn", ".footer-row > *"
  ].join(",");

  function pct(v) { return Math.round(v * 100) + "%"; }

  /* State ------------------------------------------------------------------ */
  var state = { vars: {}, text: {}, fonts: {}, open: true };
  try {
    var saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null");
    if (saved && typeof saved === "object") {
      state.vars = saved.vars || {};
      state.text = saved.text || {};
      state.fonts = saved.fonts || {};   // your own fonts in use: family -> "installed" | "file"
      state.open = saved.open !== false;
    }
  } catch (e) { /* storage unavailable: start fresh */ }

  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    updateCount();
  }

  /* Defaults (read before applying saved tweaks) --------------------------- */
  var defaults = {};
  var probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  CONTROLS.forEach(function (c) {
    if (!c.key) return;
    var raw = getComputedStyle(root).getPropertyValue(c.key).trim();
    if (c.type === "range" && c.unit === "px") {
      // Values like clamp(...) are measured at the current window size.
      probe.style.width = "var(" + c.key + ")";
      raw = Math.round(parseFloat(getComputedStyle(probe).width)) + "px";
    }
    defaults[c.key] = raw;
  });
  probe.remove();

  /* Fonts ------------------------------------------------------------------ */
  var loadedFonts = {};
  function fontFor(list, name) {
    for (var i = 0; i < list.length; i++) if (list[i][0] === name) return list[i];
    return null;
  }
  function loadFont(font) {
    if (!font || font[3] === "site" || loadedFonts[font[0]]) return;
    loadedFonts[font[0]] = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + font[0].replace(/ /g, "+") +
      (font[1] ? ":" + font[1] : "") + "&display=swap";
    document.head.appendChild(link);
  }
  function fontStack(font) {
    // Site fonts lack some punctuation; keep the serif behind them for those characters.
    return '"' + font[0] + '", ' + (font[3] === "site" ? '"Playfair Display", ' : "") + font[2];
  }
  function firstFamily(value) { return String(value).split(",")[0].replace(/["']/g, "").trim(); }

  function applyVar(key, value) {
    if (value == null) root.style.removeProperty(key);
    else root.style.setProperty(key, value);
  }
  Object.keys(state.vars).forEach(function (key) {
    // A tweak that now matches the site's own value has been made permanent; forget it.
    var sameFont = /^--font-/.test(key) && defaults[key] != null && firstFamily(state.vars[key]) === firstFamily(defaults[key]);
    if (sameFont || (defaults[key] != null && String(state.vars[key]) === String(defaults[key]))) {
      delete state.vars[key];
      return;
    }
    var c = CONTROLS.filter(function (x) { return x.key === key; })[0];
    if (c && c.type === "font") loadFont(fontFor(c.fonts, firstFamily(state.vars[key])));
    applyVar(key, state.vars[key]);
  });
  announce();

  /* Panel ------------------------------------------------------------------ */
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  var panel = h("aside", { class: "vzn-editor", "aria-label": "Edit mode" });
  var body = h("div", { class: "vzn-editor-body" });
  var countEl = h("span", { class: "vzn-count" });
  var toggleBtn = h("button", { type: "button", class: "vzn-collapse", "aria-expanded": "true" });
  var head = h("div", { class: "vzn-editor-head" }, [
    h("strong", { text: "Edit mode" }), countEl, toggleBtn
  ]);
  panel.appendChild(head);
  panel.appendChild(body);

  var inputs = {};
  var section;
  CONTROLS.forEach(function (c) {
    if (c.group) {
      section = h("fieldset", { class: "vzn-group" }, [h("legend", { text: c.group })]);
      body.appendChild(section);
      return;
    }
    var id = "vzn-" + c.key.replace(/^--/, "");
    var current = state.vars[c.key] != null ? state.vars[c.key] : defaults[c.key];
    var row = h("div", { class: "vzn-row vzn-" + c.type });
    var label = h("label", { for: id, text: c.label });
    var input, out;

    if (c.type === "color") {
      input = h("input", { type: "color", id: id, value: toHex(current) });
      out = h("output", { text: toHex(current) });
      input.addEventListener("input", function () {
        out.textContent = input.value;
        set(c.key, input.value);
      });
    } else if (c.type === "range") {
      input = h("input", { type: "range", id: id, min: c.min, max: c.max, step: c.step, value: parseFloat(current) });
      out = h("output", { text: show(c, parseFloat(current)) });
      input.addEventListener("input", function () {
        var v = parseFloat(input.value);
        out.textContent = show(c, v);
        set(c.key, v + c.unit);
      });
    } else if (c.type === "select") {
      input = h("select", { id: id }, c.options.map(function (o) {
        return h("option", { value: o[0], text: o[1] });
      }));
      input.value = current;
      input.addEventListener("change", function () { set(c.key, input.value); });
    } else if (c.type === "font") {
      var siteFonts = c.fonts.filter(function (f) { return f[3] === "site"; });
      var googleFonts = c.fonts.filter(function (f) { return f[3] !== "site"; });
      var groups = [];
      if (siteFonts.length) groups.push(h("optgroup", { label: "On the site" }, siteFonts.map(function (f) {
        return h("option", { value: f[0], text: f[0] });
      })));
      groups.push(h("optgroup", { label: "Google Fonts" }, googleFonts.map(function (f) {
        return h("option", { value: f[0], text: f[0] });
      })));
      input = h("select", { id: id }, groups);
      input.value = firstFamily(current);
      input.addEventListener("change", function () {
        var font = fontFor(c.fonts, input.value);
        if (font) {
          loadFont(font);
          set(c.key, fontStack(font));
        } else {
          useOwnFont(c.key, input.value, state.fonts[input.value] || "installed");
        }
      });
    }
    inputs[c.key] = { input: input, out: out, control: c };
    row.appendChild(label);
    if (out) row.appendChild(out);
    row.appendChild(input);
    section.appendChild(row);
  });

  /* Your own fonts: installed on this computer, or added as files ------------ */
  // Installed fonts are listed with the browser's Local Font Access (Chrome, Edge).
  // Font files work in any browser and are kept in this browser (IndexedDB).
  var FONT_KEYS = ["--font-serif", "--font-mono"];
  var GENERIC = { "--font-serif": "serif", "--font-mono": "sans-serif" };
  var GROUP_LABEL = { file: "Your font files", installed: "Installed on this computer" };
  var installedFamilies = [];
  var fileFamilies = [];
  var browseTarget = "--font-serif";

  function isGoogleFont(key, family) { return !!fontFor(inputs[key].control.fonts, family); }
  function quoteFamily(family) { return '"' + String(family).replace(/["\\]/g, "") + '"'; }

  function ensureOption(key, family, source) {
    var select = inputs[key].input;
    for (var i = 0; i < select.options.length; i++) if (select.options[i].value === family) return;
    var label = GROUP_LABEL[source] || GROUP_LABEL.installed;
    var group = null;
    Array.prototype.forEach.call(select.querySelectorAll("optgroup"), function (g) { if (g.label === label) group = g; });
    if (!group) { group = h("optgroup", { label: label }); select.appendChild(group); }
    group.appendChild(h("option", { value: family, text: family }));
  }

  function useOwnFont(key, family, source) {
    state.fonts[family] = source;
    ensureOption(key, family, source);
    inputs[key].input.value = family;
    set(key, quoteFamily(family) + ", " + GENERIC[key]);
    markCurrent();
  }

  function refreshOwnOptions() {
    FONT_KEYS.forEach(function (key) {
      fileFamilies.forEach(function (f) { ensureOption(key, f, "file"); });
      var current = state.vars[key] != null ? firstFamily(state.vars[key]) : null;
      if (current && !isGoogleFont(key, current)) {
        ensureOption(key, current, state.fonts[current] || "installed");
        inputs[key].input.value = current;
      }
    });
  }

  // Font files stored in this browser so they survive a reload.
  function withFontStore(mode, fn) {
    return new Promise(function (resolve, reject) {
      var req;
      try { req = window.indexedDB.open("vzn-edit-fonts", 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () { req.result.createObjectStore("fonts", { keyPath: "name" }); };
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () {
        var db = req.result;
        var tx = db.transaction("fonts", mode);
        var request = fn(tx.objectStore("fonts"));
        tx.oncomplete = function () { db.close(); resolve(request ? request.result : undefined); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      };
    });
  }

  function registerFontFile(name, data) {
    return new FontFace(name, data).load().then(function (face) {
      document.fonts.add(face);
      if (fileFamilies.indexOf(name) === -1) fileFamilies.push(name);
      state.fonts[name] = "file";
      return name;
    });
  }

  function fontNameFromFile(fileName) {
    return fileName.replace(/\.(otf|ttf|woff2?)$/i, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  function addFontFiles(files) {
    var fonts = Array.prototype.filter.call(files || [], function (f) { return /\.(otf|ttf|woff2?)$/i.test(f.name); });
    if (!fonts.length) {
      fontStatus.textContent = "Those aren't font files. Add .otf, .ttf, .woff or .woff2 files.";
      return;
    }
    fontStatus.textContent = "Adding " + plural(fonts.length, "font") + "…";
    Promise.all(fonts.map(function (file) {
      var name = fontNameFromFile(file.name);
      return file.arrayBuffer().then(function (buf) {
        var copy = buf.slice(0);
        return registerFontFile(name, buf).then(function () {
          withFontStore("readwrite", function (s) { return s.put({ name: name, data: copy }); }).catch(function () {});
          return { ok: true, name: name };
        });
      }).catch(function () { return { ok: false, name: file.name }; });
    })).then(function (results) {
      var ok = results.filter(function (r) { return r.ok; });
      var bad = results.filter(function (r) { return !r.ok; });
      save();
      refreshOwnOptions();
      renderFontList();
      openBrowser(true);
      fontStatus.textContent = (ok.length ? "Added " + plural(ok.length, "font") + ". Click one below to try it. " : "") +
        (bad.length ? "Couldn't read " + bad.map(function (r) { return r.name; }).join(", ") + "." : "");
    });
  }

  function loadInstalledFonts() {
    if (!("queryLocalFonts" in window)) {
      fontStatus.textContent = "This browser can't list installed fonts; Chrome and Edge can. In any browser you can add font files instead (in Font Book, right-click a font and choose Show in Finder).";
      return;
    }
    installedBtn.disabled = true;
    installedBtn.textContent = "Loading fonts…";
    window.queryLocalFonts().then(function (fonts) {
      var seen = {};
      installedFamilies = [];
      fonts.forEach(function (f) {
        var family = f.family;
        if (!family || family.charAt(0) === "." || seen[family]) return;
        seen[family] = true;
        installedFamilies.push(family);
      });
      installedFamilies.sort(function (a, b) { return a.localeCompare(b); });
      renderFontList();
      openBrowser(true);
      fontStatus.textContent = installedFamilies.length
        ? installedFamilies.length + (installedFamilies.length === 1 ? " font family" : " font families") + " on this computer. Click one to try it."
        : "No fonts were shared. Allow font access for this site in the browser's site settings, or add font files instead.";
    }).catch(function () {
      fontStatus.textContent = "Access to installed fonts was blocked here. Open the live site with ?edit in Chrome or Edge and allow it, or add font files instead.";
    }).then(function () {
      installedBtn.disabled = false;
      installedBtn.textContent = "Browse installed fonts";
    });
  }

  // Font tools, under the two font pickers in the Type group
  var typeGroup = inputs["--font-mono"].input.closest("fieldset");
  var afterBody = inputs["--font-mono"].input.closest(".vzn-row");
  var installedBtn = h("button", { type: "button", class: "vzn-btn", text: "Browse installed fonts" });
  var fileInput = h("input", { type: "file", id: "vzn-font-files", class: "vzn-file", multiple: "", accept: ".otf,.ttf,.woff,.woff2" });
  var fileBtn = h("label", { class: "vzn-btn", for: "vzn-font-files", text: "Add font files" });
  var fontStatus = h("p", { class: "vzn-note vzn-font-status", role: "status" });
  var fontSearch = h("input", { type: "search", id: "vzn-font-search", placeholder: "Search fonts", "aria-label": "Search fonts" });
  var targetHead = h("button", { type: "button", class: "vzn-seg", "data-target": "--font-serif", text: "Headline" });
  var targetBody = h("button", { type: "button", class: "vzn-seg", "data-target": "--font-mono", text: "Body" });
  var fontList = h("div", { class: "vzn-fontlist" });
  var forgetBtn = h("button", { type: "button", class: "vzn-link", text: "Remove added font files" });
  var browser = h("div", { class: "vzn-fontbrowser" }, [
    h("div", { class: "vzn-fb-bar" }, [fontSearch]),
    h("div", { class: "vzn-fb-bar", role: "group", "aria-label": "Apply font to" }, [h("span", { text: "Apply to" }), targetHead, targetBody]),
    fontList,
    forgetBtn
  ]);
  browser.hidden = true;
  var fontTools = h("div", { class: "vzn-fonttools" }, [installedBtn, fileBtn, fileInput]);
  typeGroup.insertBefore(fontTools, afterBody.nextSibling);
  typeGroup.insertBefore(fontStatus, fontTools.nextSibling);
  typeGroup.insertBefore(browser, fontStatus.nextSibling);
  fontStatus.textContent = "Try your own fonts: browse the ones installed on this computer, or add font files (drop them anywhere on this panel).";

  function openBrowser(open) { browser.hidden = !open || (!installedFamilies.length && !fileFamilies.length); }

  function setTarget(key) {
    browseTarget = key;
    [targetHead, targetBody].forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.target === key)); });
    markCurrent();
  }

  function markCurrent() {
    var current = firstFamily(state.vars[browseTarget] != null ? state.vars[browseTarget] : defaults[browseTarget]);
    Array.prototype.forEach.call(fontList.querySelectorAll(".vzn-fontrow"), function (row) {
      row.setAttribute("aria-pressed", String(row.dataset.family === current));
    });
  }

  function renderFontList() {
    fontList.replaceChildren();
    [["file", fileFamilies], ["installed", installedFamilies]].forEach(function (pair) {
      if (!pair[1].length) return;
      fontList.appendChild(h("p", { class: "vzn-fl-head", text: GROUP_LABEL[pair[0]] + " · " + pair[1].length }));
      pair[1].forEach(function (family) {
        var row = h("button", { type: "button", class: "vzn-fontrow", "data-family": family, title: family, text: family });
        row.style.fontFamily = quoteFamily(family) + ", system-ui";
        row.addEventListener("click", function () { useOwnFont(browseTarget, family, pair[0]); });
        fontList.appendChild(row);
      });
    });
    forgetBtn.hidden = !fileFamilies.length;
    filterFontList();
    markCurrent();
  }

  function filterFontList() {
    var q = fontSearch.value.trim().toLowerCase();
    Array.prototype.forEach.call(fontList.querySelectorAll(".vzn-fontrow"), function (row) {
      row.hidden = q && row.dataset.family.toLowerCase().indexOf(q) === -1;
    });
  }

  installedBtn.addEventListener("click", loadInstalledFonts);
  fileInput.addEventListener("change", function () { addFontFiles(fileInput.files); fileInput.value = ""; });
  fontSearch.addEventListener("input", filterFontList);
  targetHead.addEventListener("click", function () { setTarget("--font-serif"); });
  targetBody.addEventListener("click", function () { setTarget("--font-mono"); });
  forgetBtn.addEventListener("click", function () {
    withFontStore("readwrite", function (s) { return s.clear(); }).catch(function () {});
    fileFamilies.forEach(function (f) { delete state.fonts[f]; });
    fileFamilies = [];
    save();
    renderFontList();
    openBrowser(!!installedFamilies.length);
    fontStatus.textContent = "Removed the added font files from this browser.";
  });

  // Drop font files anywhere on the panel
  panel.addEventListener("dragover", function (e) {
    if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types, "Files") === -1) return;
    e.preventDefault();
    panel.classList.add("is-dropping");
  });
  panel.addEventListener("dragleave", function (e) { if (!panel.contains(e.relatedTarget)) panel.classList.remove("is-dropping"); });
  panel.addEventListener("drop", function (e) {
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    e.preventDefault();
    panel.classList.remove("is-dropping");
    addFontFiles(e.dataTransfer.files);
  });

  setTarget("--font-serif");
  refreshOwnOptions();
  if (window.indexedDB) {
    withFontStore("readonly", function (s) { return s.getAll(); }).then(function (rows) {
      return Promise.all((rows || []).map(function (r) { return registerFontFile(r.name, r.data).catch(function () { return null; }); }));
    }).then(function () {
      refreshOwnOptions();
      renderFontList();
    }).catch(function () { /* storage unavailable: added fonts last for this visit only */ });
  }

  function show(c, v) {
    if (c.fmt) return c.fmt(v);
    return (Math.round(v * 1000) / 1000) + c.unit;
  }

  function toHex(value) {
    var v = String(value).trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(v)) return ("#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toLowerCase();
    return "#000000";
  }

  function set(key, value) {
    if (String(value) === String(defaults[key])) delete state.vars[key];
    else state.vars[key] = value;
    applyVar(key, state.vars[key] != null ? state.vars[key] : null);
    save();
    announce();
  }

  // Lets scripted effects (e.g. the hero logo) pick up new values immediately.
  function announce() { document.dispatchEvent(new CustomEvent("vzn:change")); }

  /* Text editing ----------------------------------------------------------- */
  var editingText = false;
  var editables = Array.prototype.slice.call(document.querySelectorAll(EDITABLE));
  var originals = {};
  editables.forEach(function (node, i) {
    node.dataset.vznId = String(i);
    originals[i] = node.innerHTML;
    var saved = state.text[i];
    if (saved && saved.from === node.innerHTML) node.innerHTML = saved.to;
    else if (saved) delete state.text[i];   // the page changed since; this edit no longer applies
    node.addEventListener("input", function () {
      if (node.innerHTML === originals[i]) delete state.text[i];
      else state.text[i] = { from: originals[i], to: node.innerHTML };
      save();
    });
    node.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); node.blur(); }
      if (e.key === "Escape") node.blur();
    });
    node.addEventListener("paste", function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  });

  Object.keys(state.text).forEach(function (id) { if (!(id in originals)) delete state.text[id]; });
  save();

  function setTextEditing(on) {
    editingText = on;
    document.body.classList.toggle("vzn-text-editing", on);
    editables.forEach(function (node) {
      if (!on) { node.removeAttribute("contenteditable"); return; }
      try { node.contentEditable = "plaintext-only"; } catch (e) { node.contentEditable = "true"; }
      if (node.contentEditable !== "plaintext-only") node.contentEditable = "true";
      node.spellcheck = false;
    });
    textBtn.setAttribute("aria-pressed", String(on));
    textBtn.textContent = on ? "Editing text — click any text" : "Edit text";
  }
  // Links shouldn't navigate while their text is being edited.
  document.addEventListener("click", function (e) {
    if (editingText && !panel.contains(e.target) && e.target.closest("[data-vzn-id]") && e.target.closest("a, button")) {
      e.preventDefault();
    }
  }, true);

  /* Actions ---------------------------------------------------------------- */
  var textBtn = h("button", { type: "button", class: "vzn-btn vzn-wide", "aria-pressed": "false" });
  var copyBtn = h("button", { type: "button", class: "vzn-btn vzn-primary", text: "Copy changes" });
  var resetBtn = h("button", { type: "button", class: "vzn-btn", text: "Reset all" });
  var exitLink = h("a", { class: "vzn-btn", href: exitUrl(), text: "Exit" });
  body.appendChild(h("div", { class: "vzn-actions" }, [textBtn, copyBtn, resetBtn, exitLink]));
  body.appendChild(h("p", { class: "vzn-note", text:
    "Tweaks are saved in this browser only. Use “Copy changes” and send the result to make them permanent. Projects are edited in data/portfolio.js." }));

  textBtn.addEventListener("click", function () { setTextEditing(!editingText); });
  setTextEditing(false);

  // Two clicks to reset, so nothing is lost by accident.
  var resetArmed = null;
  resetBtn.addEventListener("click", function () {
    if (!resetArmed) {
      resetBtn.textContent = "Click again to reset";
      resetArmed = window.setTimeout(function () { resetArmed = null; resetBtn.textContent = "Reset all"; }, 3000);
      return;
    }
    window.clearTimeout(resetArmed);
    resetArmed = null;
    resetBtn.textContent = "Reset all";
    Object.keys(state.vars).forEach(function (k) { applyVar(k, null); });
    editables.forEach(function (node, i) { node.innerHTML = originals[i]; });
    state.vars = {};
    state.text = {};
    Object.keys(inputs).forEach(function (k) {
      var item = inputs[k], c = item.control, d = defaults[k];
      if (c.type === "color") { item.input.value = toHex(d); item.out.textContent = toHex(d); }
      else if (c.type === "range") { item.input.value = parseFloat(d); item.out.textContent = show(c, parseFloat(d)); }
      else if (c.type === "font") item.input.value = firstFamily(d);
      else item.input.value = d;
    });
    save();
    announce();
  });

  function exitUrl() {
    var params = new URLSearchParams(window.location.search);
    params.delete("edit");
    var q = params.toString();
    var hash = window.location.hash === "#edit" ? "" : window.location.hash;
    return window.location.pathname + (q ? "?" + q : "") + hash;
  }

  function describe(node) {
    var section = node.closest("section, header, footer");
    var where = section ? (section.id || section.tagName.toLowerCase()) : "page";
    return where + " › " + node.tagName.toLowerCase() + (node.className ? "." + String(node.className).split(" ")[0] : "");
  }

  function buildSummary() {
    var lines = ["VZN edit mode — changes (" + new Date().toISOString().slice(0, 10) + ")", ""];
    var keys = Object.keys(state.vars);
    if (keys.length) {
      lines.push("Styles — replace these in :root in assets/css/styles.css:", ":root {");
      keys.forEach(function (k) { lines.push("  " + k + ": " + state.vars[k] + ";"); });
      lines.push("}");
      var fonts = keys.filter(function (k) { return inputs[k] && inputs[k].control.type === "font"; });
      var google = [], own = [];
      fonts.forEach(function (k) {
        var family = firstFamily(state.vars[k]);
        var listed = fontFor(inputs[k].control.fonts, family);
        if (listed && listed[3] === "site") return;   // already hosted by the site
        if (listed) google.push(family);
        else own.push(family + (state.fonts[family] === "file" ? " (added as a file)" : " (installed on this computer)"));
      });
      if (google.length) lines.push("", "Fonts to load from Google Fonts: " + google.join(", "));
      if (own.length) {
        lines.push("", "Your own fonts: " + own.join(", "),
          "Send the web font files for these (.woff2 preferred, or .otf / .ttf) so they can be added to the site.");
      }
      lines.push("");
    }
    var ids = Object.keys(state.text);
    if (ids.length) {
      lines.push("Text changes in index.html:");
      ids.forEach(function (id, n) {
        var node = document.querySelector('[data-vzn-id="' + id + '"]');
        lines.push("", (n + 1) + ". " + (node ? describe(node) : "element " + id));
        lines.push("   from: " + state.text[id].from.trim());
        lines.push("   to:   " + state.text[id].to.trim());
      });
    }
    if (!keys.length && !ids.length) lines.push("No changes yet.");
    return lines.join("\n");
  }

  var dialog = h("dialog", { class: "vzn-dialog", "aria-label": "Your changes" });
  var summaryBox = h("textarea", { readonly: "", rows: "14", "aria-label": "Changes summary" });
  var dialogStatus = h("span", { class: "vzn-dialog-status" });
  var copyAgain = h("button", { type: "button", class: "vzn-btn vzn-primary", text: "Copy" });
  var closeBtn = h("button", { type: "button", class: "vzn-btn", text: "Close" });
  dialog.appendChild(h("p", { class: "vzn-dialog-title", text: "Your changes" }));
  dialog.appendChild(summaryBox);
  dialog.appendChild(h("div", { class: "vzn-actions" }, [copyAgain, closeBtn, dialogStatus]));
  document.body.appendChild(dialog);

  function copySummary() {
    summaryBox.focus();
    summaryBox.select();
    var done = function () { dialogStatus.textContent = "Copied to clipboard"; };
    var fail = function () {
      try { if (document.execCommand("copy")) return done(); } catch (e) { /* ignore */ }
      dialogStatus.textContent = "Select the text above and copy it";
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(summaryBox.value).then(done, fail);
    } else {
      fail();
    }
  }
  copyBtn.addEventListener("click", function () {
    summaryBox.value = buildSummary();
    dialogStatus.textContent = "";
    dialog.showModal();
    copySummary();
  });
  copyAgain.addEventListener("click", copySummary);
  closeBtn.addEventListener("click", function () { dialog.close(); });

  /* Collapse / count ------------------------------------------------------- */
  function setOpen(open) {
    state.open = open;
    panel.classList.toggle("is-collapsed", !open);
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.textContent = open ? "Hide" : "Show";
    save();
  }
  toggleBtn.addEventListener("click", function () { setOpen(!state.open); });

  function updateCount() {
    var n = Object.keys(state.vars).length + Object.keys(state.text).length;
    countEl.textContent = n ? n + " change" + (n === 1 ? "" : "s") : "";
  }

  document.body.appendChild(panel);
  setOpen(state.open);
})();
