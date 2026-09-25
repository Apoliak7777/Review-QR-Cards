/* ťukni.sk – interakcie stránky (bez knižníc) */
(function () {
  "use strict";

  var PACKAGES = {
    "1": { label: "1 tabuľka", pieces: 1, total: 29 },
    "3": { label: "3 tabuľky", pieces: 3, total: 69 },
    "5": { label: "5 tabuliek", pieces: 5, total: 99 },
    custom: { label: "Viac kusov", pieces: null, total: null }
  };

  function eur(value, decimals) {
    return value.toLocaleString("sk-SK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + " €";
  }

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
    toggle.setAttribute("aria-label", open ? "Zavrieť menu" : "Otvoriť menu");
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

  /* ---------- Výber balíka a súhrn ---------- */
  var form = $("#order-form");
  if (!form) return;
  form.noValidate = true; // bez JS platí natívna validácia prehliadača, s JS vlastná

  var qtyRow = $("#qty-row");
  var qtyInput = $("#pocet");
  var sumPkg = $("#sum-pkg");
  var sumUnit = $("#sum-unit");
  var sumTotal = $("#sum-total");

  function selectedPackage() {
    var checked = form.querySelector('input[name="balik"]:checked');
    return checked ? checked.value : "3";
  }

  function qtyOk(n) { return Number.isInteger(n) && n >= 6 && n <= 10000; }

  function updateSummary() {
    $all(".pkg", form).forEach(function (l) { l.classList.toggle("is-checked", !!l.querySelector("input:checked")); });
    var key = selectedPackage();
    var pkg = PACKAGES[key];
    var isCustom = key === "custom";
    qtyRow.hidden = !isCustom;
    qtyInput.required = isCustom;
    if (isCustom) {
      var n = Number(qtyInput.value);
      sumPkg.textContent = qtyOk(n) ? n + "\u00a0ks" : "viac ako 5\u00a0ks";
      sumUnit.textContent = "podľa ponuky";
      sumTotal.textContent = "na mieru";
    } else {
      sumPkg.textContent = pkg.label;
      sumUnit.textContent = eur(pkg.total / pkg.pieces, 2);
      sumTotal.textContent = eur(pkg.total, 0);
    }
    var inl = $("#sum-total-inline");
    if (inl) inl.textContent = isCustom ? "podľa ponuky" : sumTotal.textContent;
  }

  function choosePackage(key) {
    var input = form.querySelector('input[name="balik"][value="' + key + '"]');
    if (input) {
      input.checked = true;
      updateSummary();
    }
  }

  $all('input[name="balik"]', form).forEach(function (r) { r.addEventListener("change", updateSummary); });
  qtyInput.addEventListener("input", updateSummary);
  $all("[data-pkg]").forEach(function (link) {
    link.addEventListener("click", function () { choosePackage(link.getAttribute("data-pkg")); });
  });
  updateSummary();

  /* ---------- Validácia ---------- */
  function digits(v) { return (v || "").replace(/\D+/g, ""); }

  var rules = {
    firma: function (v) { return v.trim().length >= 2; },
    ico: function (v) { return /^(\d{6}|\d{8})$/.test(v.replace(/[\s-]/g, "")); },
    profil: function (v) { return v.trim().length >= 4; },
    meno: function (v) { return v.trim().length >= 3; },
    telefon: function (v) { return digits(v).length >= 9; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    dorucenie: function (v) { return v.trim().length >= 4; },
    pocet: function (v) { return selectedPackage() !== "custom" || qtyOk(Number(v)); }
  };

  function fieldWrap(el) { return el.closest(".field"); }
  function errEl(el) { var w = fieldWrap(el); return w ? w.querySelector(".error") : null; }
  function hintEl(el) { var w = fieldWrap(el); return w ? w.querySelector(".hint") : null; }

  function validateField(el) {
    var ok;
    if (el.type === "checkbox") ok = el.checked;
    else if (rules[el.name]) ok = rules[el.name](el.value);
    else ok = true;
    var wrap = fieldWrap(el);
    if (wrap) wrap.classList.toggle("is-invalid", !ok);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    if (el.type !== "checkbox") { // chyba pri checkboxe je súčasťou jeho <label>, a teda aj názvu
      var ids = [], er = errEl(el), h = hintEl(el);
      if (!ok && er && er.id) ids.push(er.id);
      if (h && h.id) ids.push(h.id);
      if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
      else el.removeAttribute("aria-describedby");
    }
    return ok;
  }

  var FIELD_NAMES = {
    firma: "obchodné meno", ico: "IČO", profil: "firemný profil na Googli", meno: "meno",
    telefon: "telefón", email: "e-mail", dorucenie: "miesto doručenia", pocet: "počet kusov",
    suhlas: "súhlas s\u00a0obchodnými podmienkami"
  };
  var validated = ["firma", "ico", "profil", "meno", "telefon", "email", "dorucenie", "pocet", "suhlas"];
  validated.forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
    var er = errEl(el);
    if (er) er.id = name + "-chyba";
    var h = hintEl(el);
    if (h) { h.id = name + "-tip"; el.setAttribute("aria-describedby", h.id); }
    var evt = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(evt, function () {
      if (fieldWrap(el) && fieldWrap(el).classList.contains("is-invalid")) validateField(el);
    });
    el.addEventListener("blur", function () {
      if (el.type !== "checkbox" && el.value.trim() !== "") validateField(el);
    });
  });

  /* ---------- Odoslanie ---------- */
  var statusEl = $("#form-status");
  var submitBtn = $("#submit-btn");
  var success = $("#form-success");

  // IČO: 6-miestne doplníme nulami na 8; kontrolnú číslicu (mod 11) len označíme, neblokujeme.
  function icoOk(d) {
    var s = 0;
    for (var i = 0; i < 7; i++) s += Number(d.charAt(i)) * (8 - i);
    return (11 - s % 11) % 10 === Number(d.charAt(7));
  }
  function icoNorm(v) {
    var d = digits(v);
    if (d.length === 6) d = "00" + d;
    return d.length === 8 && !icoOk(d) ? d + " (skontrolovať, kontrolná číslica nesedí)" : d;
  }

  // Odkiaľ zákazník prišiel (?zdroj=letak z tlačených materiálov alebo doména odkazujúceho webu).
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
    return z.slice(0, 60) || "priamo";
  })();

  function collect() {
    var key = selectedPackage();
    var pkg = PACKAGES[key];
    var qty = key === "custom" ? Number(qtyInput.value) + " ks (žiadosť o ponuku)" : pkg.label;
    var price = key === "custom" ? "individuálna ponuka" : eur(pkg.total, 0) + " vrátane dopravy";
    return {
      "Balík": qty,
      "Cena": price,
      "Firma": form.elements.firma.value.trim(),
      "IČO": icoNorm(form.elements.ico.value),
      "Firemný profil na Googli": form.elements.profil.value.trim(),
      "Meno": form.elements.meno.value.trim(),
      "Telefón": form.elements.telefon.value.trim(),
      "E-mail": form.elements.email.value.trim(),
      "Doručenie": form.elements.dorucenie.value.trim(),
      "Poznámka": form.elements.poznamka.value.trim() || "–",
      "Zdroj": zdroj
    };
  }

  function showSuccess(mode, data, mailto) {
    form.hidden = true;
    success.hidden = false;
    if (mode === "mail") {
      $(".form-success-icon").classList.add("is-pending");
      $(".form-success-icon use").setAttribute("href", "#i-mail");
      $("#success-title").textContent = "Posledný krok: odošlite e-mail";
      $("#success-text").textContent =
        "Pripravili sme e-mail s\u00a0vyplnenou objednávkou. Objednávka k\u00a0nám príde až po jeho odoslaní z\u00a0vašej e-mailovej aplikácie. Ak sa e-mail neotvoril, skopírujte text objednávky nižšie a\u00a0pošlite ho na túto adresu.";
      $("#fallback-email").textContent = form.getAttribute("data-email");
      $("#fallback-link").setAttribute("href", mailto);
      $("#order-text").value = mailBody(data);
      $("#copy-order").textContent = "Kopírovať objednávku";
      $("#success-fallback").hidden = false;
    } else {
      $("#success-text").textContent =
        "Potvrdenie a\u00a0faktúru pošleme na " + data["E-mail"] + " do jedného pracovného dňa.";
    }
    success.focus({ preventScroll: true });
    // bez "behavior": riadi sa CSS scroll-behavior, ktoré pri prefers-reduced-motion vypína plynulé posúvanie
    success.scrollIntoView({ block: "center" });
  }

  function mailBody(data) {
    return Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\r\n");
  }

  function buildMailto(data) {
    var head = "mailto:" + form.getAttribute("data-email") +
      "?subject=" + encodeURIComponent("Objednávka NFC tabuliek – " + data["Firma"]) + "&body=";
    var url = head + encodeURIComponent(mailBody(data));
    if (url.length > 1800) { // dlhšie odkazy niektoré e-mailové programy (Outlook, Windows) neotvoria
      var short = {};
      Object.keys(data).forEach(function (k) { short[k] = data[k]; });
      short["Poznámka"] = "(dopíšte ju sem)";
      url = head + encodeURIComponent(mailBody(short));
    }
    return url;
  }

  var copyBtn = $("#copy-order");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var ta = $("#order-text");
    var done = function () { copyBtn.textContent = "Skopírované"; };
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
    form.elements.firma.focus();
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
      var n = bad.length, word = n === 1 ? "pole" : (n < 5 ? "polia" : "polí");
      form.elements[bad[0]].focus();
      statusEl.textContent = "Objednávku sme neodoslali. Opravte " + n + "\u00a0" + word + ": " +
        bad.map(function (k) { return FIELD_NAMES[k]; }).join(", ") + ".";
      return;
    }

    // Honeypot: roboty dostanú „úspech“, nič sa neodošle.
    if (form.elements.botcheck && form.elements.botcheck.checked) {
      showSuccess("sent", collect());
      return;
    }

    var data = collect();
    var key = (form.getAttribute("data-web3forms-key") || "").trim();

    if (!key) {
      var mailto = buildMailto(data);
      window.location.href = mailto;
      showSuccess("mail", data, mailto);
      return;
    }

    var payload = new FormData();
    payload.append("access_key", key);
    payload.append("subject", "Nová objednávka: " + data["Balík"] + " – " + data["Firma"]);
    payload.append("from_name", "ťukni.sk objednávky");
    payload.append("email", data["E-mail"]);
    Object.keys(data).forEach(function (k) { payload.append(k, data[k]); });

    // Tlačidlo nevypíname (disabled), inak by fokus spadol na <body>.
    sending = true;
    submitBtn.setAttribute("aria-disabled", "true");
    submitBtn.setAttribute("aria-busy", "true");
    var originalLabel = submitBtn.innerHTML;
    submitBtn.textContent = "Odosiela sa…";
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
        statusEl.textContent = "Objednávku sa nepodarilo odoslať. Skúste to znova alebo ju ";
        var a = document.createElement("a");
        a.href = buildMailto(data);
        a.textContent = "pošlite e-mailom s\u00a0vyplnenými údajmi";
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
  var orderSection = $("#objednavka");
  if (cta && hero && orderSection && "IntersectionObserver" in window) {
    var heroVisible = true;
    var orderVisible = false;
    var footer = $(".site-footer");
    var footerVisible = false;
    var render = function () {
      var show = !heroVisible && !orderVisible && !footerVisible;
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
      orderVisible = entries[0].isIntersecting;
      render();
    }, { rootMargin: "0px 0px -20% 0px" }).observe(orderSection);
    if (footer) new IntersectionObserver(function (entries) {
      footerVisible = entries[0].isIntersecting;
      render();
    }).observe(footer);
  }
})();
