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

  var DISPLAY_FONTS = [
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
  var state = { vars: {}, text: {}, open: true };
  try {
    var saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null");
    if (saved && typeof saved === "object") {
      state.vars = saved.vars || {};
      state.text = saved.text || {};
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
    if (!font || loadedFonts[font[0]]) return;
    loadedFonts[font[0]] = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + font[0].replace(/ /g, "+") +
      (font[1] ? ":" + font[1] : "") + "&display=swap";
    document.head.appendChild(link);
  }
  function fontStack(font) { return '"' + font[0] + '", ' + font[2]; }
  function firstFamily(value) { return String(value).split(",")[0].replace(/["']/g, "").trim(); }

  function applyVar(key, value) {
    if (value == null) root.style.removeProperty(key);
    else root.style.setProperty(key, value);
  }
  Object.keys(state.vars).forEach(function (key) {
    // A tweak that now matches the site's own value has been made permanent; forget it.
    if (defaults[key] != null && String(state.vars[key]) === String(defaults[key])) {
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
      input = h("select", { id: id }, c.fonts.map(function (f) {
        return h("option", { value: f[0], text: f[0] });
      }));
      input.value = firstFamily(current);
      input.addEventListener("change", function () {
        var font = fontFor(c.fonts, input.value);
        loadFont(font);
        set(c.key, fontStack(font));
      });
    }
    inputs[c.key] = { input: input, out: out, control: c };
    row.appendChild(label);
    if (out) row.appendChild(out);
    row.appendChild(input);
    section.appendChild(row);
  });

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
      if (fonts.length) {
        lines.push("", "Fonts to load from Google Fonts: " + fonts.map(function (k) {
          return firstFamily(state.vars[k]);
        }).join(", "));
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
