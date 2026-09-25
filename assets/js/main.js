/* ťukni.sk – interakcie stránky (bez knižníc), slovenská aj anglická verzia */
(function () {
  "use strict";

  var LANG = (document.documentElement.lang || "sk").slice(0, 2) === "en" ? "en" : "sk";

  // Texty, ktoré dopĺňa JavaScript. Kľúče v "keys" sú popisy riadkov v e-maile.
  var T = {
    sk: {
      menuOpen: "Otvoriť menu",
      menuClose: "Zavrieť menu",
      fields: {
        meno: "meno", telefon: "telefón", prevadzka: "názov prevádzky", mesto: "mesto alebo adresa",
        email: "e-mail", pocet: "počet tabuliek"
      },
      notSent: function (n, list) {
        var word = n === 1 ? "pole" : (n < 5 ? "polia" : "polí");
        return "Správu sme neodoslali. Opravte " + n + " " + word + ": " + list + ".";
      },
      keys: {
        meno: "Meno", telefon: "Telefón", email: "E-mail", prevadzka: "Prevádzka", mesto: "Mesto/adresa",
        pocet: "Počet tabuliek", poznamka: "Poznámka", jazyk: "Jazyk webu", zdroj: "Zdroj"
      },
      langName: "slovenčina",
      subject: "Záujem o NFC tabuľku – ",
      fromName: "ťukni.sk – nový záujemca",
      sending: "Odosiela sa…",
      sentText: function (tel) { return "Zavoláme vám na " + tel + " do jedného pracovného dňa a dohodneme termín montáže."; },
      mailTitle: "Posledný krok: odošlite e-mail",
      mailText: "Pripravili sme e-mail s vašimi údajmi. K nám príde až po jeho odoslaní z vašej e-mailovej aplikácie. Ak sa e-mail neotvoril, skopírujte text nižšie a pošlite ho na túto adresu, alebo nám rovno zavolajte.",
      noteLater: "(dopíšte ju sem)",
      copy: "Kopírovať text",
      copied: "Skopírované",
      failed: "Správu sa nepodarilo odoslať. Skúste to znova alebo ju ",
      failedLink: "pošlite e-mailom s vyplnenými údajmi",
      direct: "priamo"
    },
    en: {
      menuOpen: "Open menu",
      menuClose: "Close menu",
      fields: {
        meno: "name", telefon: "phone", prevadzka: "business name", mesto: "town or address",
        email: "e-mail", pocet: "number of plates"
      },
      notSent: function (n, list) {
        return "Your message was not sent. Please fix " + n + (n === 1 ? " field: " : " fields: ") + list + ".";
      },
      keys: {
        meno: "Name", telefon: "Phone", email: "E-mail", prevadzka: "Business", mesto: "Town/address",
        pocet: "Number of plates", poznamka: "Note", jazyk: "Site language", zdroj: "Source"
      },
      langName: "English",
      subject: "NFC plate enquiry – ",
      fromName: "ťukni.sk – new enquiry (EN)",
      sending: "Sending…",
      sentText: function (tel) { return "We will call you on " + tel + " within one working day to arrange the installation."; },
      mailTitle: "Last step: send the e-mail",
      mailText: "We have prepared an e-mail with your details. It only reaches us once you send it from your e-mail app. If it did not open, copy the text below and send it to this address, or simply give us a call.",
      noteLater: "(add it here)",
      copy: "Copy text",
      copied: "Copied",
      failed: "Your message could not be sent. Please try again or ",
      failedLink: "send it by e-mail with your details filled in",
      direct: "direct"
    }
  }[LANG];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Rok v pätičke ---------- */
  $all("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Hlavička ---------- */
  var header = $(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilné menu ---------- */
  var toggle = $(".nav-toggle");
  var nav = $("#menu");
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? T.menuClose : T.menuOpen);
    var use = toggle.querySelector("use");
    if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    $all("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
      var inside = nav.contains(document.activeElement);
      setMenu(false);
      if (inside) toggle.focus();
    });
    nav.addEventListener("focusout", function (e) {
      var to = e.relatedTarget; // null pri kliknutí v Safari – vtedy menu nezatvárame
      if (!to || toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(to) && to !== toggle) setMenu(false);
    });
  }

  /* ---------- Kontaktný formulár ---------- */
  var form = $("#order-form");
  if (!form) return;
  form.noValidate = true; // bez JS platí natívna validácia prehliadača, s JS vlastná

  function digits(v) { return (v || "").replace(/\D+/g, ""); }
  function qtyOk(n) { return Number.isInteger(n) && n >= 1 && n <= 50; }

  var rules = {
    meno: function (v) { return v.trim().length >= 3; },
    telefon: function (v) { return digits(v).length >= 9; },
    prevadzka: function (v) { return v.trim().length >= 2; },
    mesto: function (v) { return v.trim().length >= 2; },
    email: function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    pocet: function (v) { return qtyOk(Number(v)); }
  };
  var validated = ["meno", "telefon", "prevadzka", "mesto", "email", "pocet"];

  function fieldWrap(el) { return el.closest(".field"); }
  function errEl(el) { var w = fieldWrap(el); return w ? w.querySelector(".error") : null; }
  function hintEl(el) { var w = fieldWrap(el); return w ? w.querySelector(".hint") : null; }

  function validateField(el) {
    var ok = rules[el.name] ? rules[el.name](el.value) : true;
    var wrap = fieldWrap(el);
    if (wrap) wrap.classList.toggle("is-invalid", !ok);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    var ids = [], er = errEl(el), h = hintEl(el);
    if (!ok && er && er.id) ids.push(er.id);
    if (h && h.id) ids.push(h.id);
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
    else el.removeAttribute("aria-describedby");
    return ok;
  }

  validated.forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
    var er = errEl(el);
    if (er) er.id = name + "-chyba";
    var h = hintEl(el);
    if (h) { h.id = name + "-tip"; el.setAttribute("aria-describedby", h.id); }
    el.addEventListener("input", function () {
      if (fieldWrap(el) && fieldWrap(el).classList.contains("is-invalid")) validateField(el);
    });
    el.addEventListener("blur", function () {
      if (el.value.trim() !== "") validateField(el);
    });
  });

  var statusEl = $("#form-status");
  var submitBtn = $("#submit-btn");
  var success = $("#form-success");

  // Odkiaľ návštevník prišiel (?zdroj=letak z tlačených materiálov alebo doména odkazujúceho webu).
  // Nič sa neukladá, preto netreba súhlas s cookies.
  var zdroj = (function () {
    var z = "";
    try {
      var q = new URLSearchParams(window.location.search);
      z = q.get("zdroj") || q.get("utm_source") || "";
      if (!z && document.referrer) {
        var h = new URL(document.referrer).hostname;
        if (h !== window.location.hostname) z = h;
      }
    } catch (err) { z = ""; }
    return z.slice(0, 60) || T.direct;
  })();

  function collect() {
    var k = T.keys, f = form.elements, d = {};
    d[k.meno] = f.meno.value.trim();
    d[k.telefon] = f.telefon.value.trim();
    d[k.email] = f.email.value.trim() || "–";
    d[k.prevadzka] = f.prevadzka.value.trim();
    d[k.mesto] = f.mesto.value.trim();
    d[k.pocet] = String(Number(f.pocet.value));
    d[k.poznamka] = f.poznamka.value.trim() || "–";
    d[k.jazyk] = T.langName;
    d[k.zdroj] = zdroj;
    return d;
  }

  function mailBody(data) {
    return Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\r\n");
  }

  function buildMailto(data) {
    var head = "mailto:" + form.getAttribute("data-email") +
      "?subject=" + encodeURIComponent(T.subject + data[T.keys.prevadzka]) + "&body=";
    var url = head + encodeURIComponent(mailBody(data));
    if (url.length > 1800) { // dlhšie odkazy niektoré e-mailové programy (Outlook, Windows) neotvoria
      var short = {};
      Object.keys(data).forEach(function (k) { short[k] = data[k]; });
      short[T.keys.poznamka] = T.noteLater;
      url = head + encodeURIComponent(mailBody(short));
    }
    return url;
  }

  function showSuccess(mode, data, mailto) {
    form.hidden = true;
    success.hidden = false;
    if (mode === "mail") {
      $(".form-success-icon").classList.add("is-pending");
      $(".form-success-icon use").setAttribute("href", "#i-mail");
      $("#success-title").textContent = T.mailTitle;
      $("#success-text").textContent = T.mailText;
      $("#fallback-email").textContent = form.getAttribute("data-email");
      $("#fallback-link").setAttribute("href", mailto);
      $("#order-text").value = mailBody(data);
      $("#copy-order").textContent = T.copy;
      $("#success-fallback").hidden = false;
    } else {
      $("#success-text").textContent = T.sentText(data[T.keys.telefon]);
    }
    success.focus({ preventScroll: true });
    // bez "behavior": riadi sa CSS scroll-behavior, ktoré pri prefers-reduced-motion vypína plynulé posúvanie
    success.scrollIntoView({ block: "center" });
  }

  var copyBtn = $("#copy-order");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var ta = $("#order-text");
    var done = function () { copyBtn.textContent = T.copied; };
    var fallback = function () {
      ta.focus();
      ta.select();
      try { if (document.execCommand("copy")) done(); } catch (err) { /* text je označený, skopíruje sa ručne */ }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, fallback);
    else fallback();
  });
  var editBtn = $("#edit-order");
  if (editBtn) editBtn.addEventListener("click", function () {
    success.hidden = true;
    form.hidden = false;
    form.elements.meno.focus();
  });

  var sending = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    statusEl.textContent = "";

    var bad = validated.filter(function (n) {
      var el = form.elements[n];
      return el && !validateField(el);
    });
    if (bad.length) {
      form.elements[bad[0]].focus();
      statusEl.textContent = T.notSent(bad.length, bad.map(function (k) { return T.fields[k]; }).join(", "));
      return;
    }

    var data = collect();

    // Honeypot: roboty dostanú „úspech“, nič sa neodošle.
    if (form.elements.botcheck && form.elements.botcheck.checked) {
      showSuccess("sent", data);
      return;
    }

    var key = (form.getAttribute("data-web3forms-key") || "").trim();
    if (!key) {
      var mailto = buildMailto(data);
      window.location.href = mailto;
      showSuccess("mail", data, mailto);
      return;
    }

    var payload = new FormData();
    payload.append("access_key", key);
    payload.append("subject", T.subject + data[T.keys.prevadzka]);
    payload.append("from_name", T.fromName);
    if (form.elements.email.value.trim()) payload.append("email", form.elements.email.value.trim());
    Object.keys(data).forEach(function (k) { payload.append(k, data[k]); });

    // Tlačidlo nevypíname (disabled), inak by fokus spadol na <body>.
    sending = true;
    submitBtn.setAttribute("aria-disabled", "true");
    submitBtn.setAttribute("aria-busy", "true");
    var originalLabel = submitBtn.innerHTML;
    submitBtn.textContent = T.sending;
    var failed = false;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || !json.success) throw new Error(json.message || "HTTP " + res.status);
        });
      })
      .then(function () { showSuccess("sent", data); })
      .catch(function () {
        failed = true;
        statusEl.textContent = T.failed;
        var a = document.createElement("a");
        a.href = buildMailto(data);
        a.textContent = T.failedLink;
        statusEl.appendChild(a);
        statusEl.appendChild(document.createTextNode("."));
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        sending = false;
        submitBtn.removeAttribute("aria-disabled");
        submitBtn.removeAttribute("aria-busy");
        submitBtn.innerHTML = originalLabel;
        if (failed) submitBtn.focus();
      });
  });

  /* ---------- Plávajúca výzva na mobile ---------- */
  var cta = $("#mobile-cta");
  var hero = $(".hero");
  var contactSection = $("#kontakt");
  if (cta && hero && contactSection && "IntersectionObserver" in window) {
    var heroVisible = true;
    var contactVisible = false;
    var footer = $(".site-footer");
    var footerVisible = false;
    var render = function () {
      var show = !heroVisible && !contactVisible && !footerVisible;
      cta.classList.toggle("is-visible", show);
      cta.setAttribute("aria-hidden", show ? "false" : "true");
      var link = cta.querySelector("a");
      if (link) link.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      render();
    }).observe(hero);
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting;
      render();
    }, { rootMargin: "0px 0px -20% 0px" }).observe(contactSection);
    if (footer) new IntersectionObserver(function (entries) {
      footerVisible = entries[0].isIntersecting;
      render();
    }).observe(footer);
  }
})();
