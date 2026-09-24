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
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Výber balíka a súhrn ---------- */
  var form = $("#order-form");
  if (!form) return;

  var qtyRow = $("#qty-row");
  var qtyInput = $("#pocet");
  var sumPkg = $("#sum-pkg");
  var sumUnit = $("#sum-unit");
  var sumTotal = $("#sum-total");

  function selectedPackage() {
    var checked = form.querySelector('input[name="balik"]:checked');
    return checked ? checked.value : "3";
  }

  function updateSummary() {
    var key = selectedPackage();
    var pkg = PACKAGES[key];
    var isCustom = key === "custom";
    qtyRow.hidden = !isCustom;
    qtyInput.required = isCustom;
    if (isCustom) {
      var n = parseInt(qtyInput.value, 10);
      sumPkg.textContent = n >= 6 ? n + " ks" : "viac ako 5 ks";
      sumUnit.textContent = "podľa ponuky";
      sumTotal.textContent = "na mieru";
    } else {
      sumPkg.textContent = pkg.label;
      sumUnit.textContent = eur(pkg.total / pkg.pieces, 2);
      sumTotal.textContent = eur(pkg.total, 0);
    }
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
    ico: function (v) { var d = digits(v); return d.length >= 6 && d.length <= 8 && /^[\d\s]+$/.test(v.trim()); },
    profil: function (v) { return v.trim().length >= 4; },
    meno: function (v) { return v.trim().length >= 3; },
    telefon: function (v) { return digits(v).length >= 9; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    dorucenie: function (v) { return v.trim().length >= 4; },
    pocet: function (v) { return selectedPackage() !== "custom" || parseInt(v, 10) >= 6; }
  };

  function fieldWrap(el) { return el.closest(".field"); }

  function validateField(el) {
    var ok;
    if (el.type === "checkbox") ok = el.checked;
    else if (rules[el.name]) ok = rules[el.name](el.value);
    else ok = true;
    var wrap = fieldWrap(el);
    if (wrap) wrap.classList.toggle("is-invalid", !ok);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  var validated = ["firma", "ico", "profil", "meno", "telefon", "email", "dorucenie", "pocet", "suhlas"];
  validated.forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
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

  function collect() {
    var key = selectedPackage();
    var pkg = PACKAGES[key];
    var qty = key === "custom" ? parseInt(qtyInput.value, 10) + " ks (žiadosť o ponuku)" : pkg.label;
    var price = key === "custom" ? "individuálna ponuka" : eur(pkg.total, 0) + " vrátane dopravy";
    return {
      "Balík": qty,
      "Cena": price,
      "Firma": form.elements.firma.value.trim(),
      "IČO": digits(form.elements.ico.value),
      "Profil na Google": form.elements.profil.value.trim(),
      "Meno": form.elements.meno.value.trim(),
      "Telefón": form.elements.telefon.value.trim(),
      "E-mail": form.elements.email.value.trim(),
      "Doručenie": form.elements.dorucenie.value.trim(),
      "Poznámka": form.elements.poznamka.value.trim() || "–"
    };
  }

  function showSuccess(mode, data, mailto) {
    form.hidden = true;
    success.hidden = false;
    if (mode === "mail") {
      $("#success-title").textContent = "Posledný krok: odošlite e-mail";
      $("#success-text").textContent =
        "Pripravili sme e-mail s vyplnenou objednávkou. Objednávka k nám príde až po jeho odoslaní z vašej e-mailovej aplikácie. Ak sa e-mail neotvoril, použite tlačidlo nižšie alebo nám údaje pošlite na túto adresu.";
      $("#fallback-email").textContent = form.getAttribute("data-email");
      $("#fallback-link").setAttribute("href", mailto);
      $("#success-fallback").hidden = false;
    } else {
      $("#success-text").textContent =
        "Potvrdenie a faktúru pošleme na " + data["E-mail"] + " do jedného pracovného dňa.";
    }
    success.focus({ preventScroll: true });
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function buildMailto(data) {
    var to = form.getAttribute("data-email");
    var subject = "Objednávka NFC tabuliek – " + data["Firma"];
    var body = Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n");
    return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";

    var firstInvalid = null;
    validated.forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      if (!validateField(el) && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      statusEl.textContent = "Skontrolujte, prosím, zvýraznené polia.";
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

    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    var originalLabel = submitBtn.innerHTML;
    submitBtn.textContent = "Odosielam…";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || !json.success) throw new Error(json.message || "HTTP " + res.status);
        });
      })
      .then(function () { showSuccess("sent", data); })
      .catch(function () {
        statusEl.textContent =
          "Objednávku sa nepodarilo odoslať. Skúste to znova alebo nám napíšte na " +
          form.getAttribute("data-email") + ".";
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        submitBtn.innerHTML = originalLabel;
      });
  });

  /* ---------- Plávajúca výzva na mobile ---------- */
  var cta = $("#mobile-cta");
  var hero = $(".hero");
  var orderSection = $("#objednavka");
  if (cta && hero && orderSection && "IntersectionObserver" in window) {
    var heroVisible = true;
    var orderVisible = false;
    var render = function () {
      var show = !heroVisible && !orderVisible;
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
  }
})();
