#!/usr/bin/env python3
"""Kontrola webu pred nasadením.

Chyby (zastavia nasadenie): nefunkčné interné odkazy a kotvy.
Upozornenia (nasadenie prebehne): zástupné texty [doplniť…] a rozdielne nastavenie
formulára v slovenskej a anglickej verzii.

Spustenie z koreňa repozitára: python3 .github/scripts/check_site.py
"""
import html
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PAGES = [
    "index.html",
    "en/index.html",
    "obchodne-podmienky.html",
    "ochrana-osobnych-udajov.html",
    "en/privacy.html",
    "404.html",
]
PLACEHOLDER = re.compile(
    r'class="fill"|\[(doplniť|Obchodné meno|sídlo|kraj podľa sídla|adresa inšpektorátu)'
    r'|9xx|900000000|data-web3forms-key=""'
)
GITHUB = os.environ.get("GITHUB_ACTIONS") == "true"

errors, warnings = [], []


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def ids(text):
    return set(re.findall(r'\bid="([^"]+)"', text))


def resolve(page, url):
    path, _, frag = url.partition("#")
    if path.startswith("/"):
        target = path.lstrip("/")
    elif path == "":
        target = page
    else:
        target = os.path.normpath(os.path.join(os.path.dirname(page), path))
    if target in ("", "."):
        target = "index.html"
    if os.path.isdir(os.path.join(ROOT, target)):
        target = os.path.join(target, "index.html")
    return target, frag


for page in PAGES:
    text = read(page)
    for m in re.finditer(r'\b(?:href|src)="([^"]+)"', text):
        url = html.unescape(m.group(1))
        if re.match(r"^(https?:|mailto:|tel:|data:)", url):
            continue
        target, frag = resolve(page, url)
        full = os.path.join(ROOT, target)
        if not os.path.isfile(full):
            errors.append(f"{page}: odkaz na neexistujúci súbor {url}")
        elif frag and target.endswith(".html") and frag not in ids(read(target)):
            errors.append(f"{page}: odkaz na neexistujúcu kotvu {url}")

    for n, line in enumerate(text.splitlines(), 1):
        if PLACEHOLDER.search(line):
            warnings.append(f"{page}:{n}: zástupný text – {PLACEHOLDER.search(line).group(0)}")

form_attrs = {}
for page in ("index.html", "en/index.html"):
    m = re.search(r'<form[^>]*id="order-form"[^>]*>', read(page), re.S)
    if not m:
        errors.append(f"{page}: chýba formulár #order-form")
        continue
    tag = m.group(0)
    form_attrs[page] = tuple(
        (re.search(attr + r'="([^"]*)"', tag) or [None, None])[1]
        for attr in ("action", "data-web3forms-key", "data-email")
    )
if len(set(form_attrs.values())) > 1:
    warnings.append(
        "Formulár v index.html a en/index.html má rozdielne action / data-web3forms-key / data-email: "
        + repr(form_attrs)
    )

for w in warnings:
    print(("::warning::" if GITHUB else "UPOZORNENIE: ") + w)
for e in errors:
    print(("::error::" if GITHUB else "CHYBA: ") + e)

summary = os.environ.get("GITHUB_STEP_SUMMARY")
if summary:
    with open(summary, "a", encoding="utf-8") as f:
        f.write(f"### Kontrola webu\n\nChyby: {len(errors)}  \nZástupné texty a upozornenia: {len(warnings)}\n")
        if warnings:
            f.write("\nPred spustením pre verejnosť doplňte zástupné texty (viď README, Kontrola pred spustením).\n")

print(f"Chyby: {len(errors)}, upozornenia: {len(warnings)}")
sys.exit(1 if errors else 0)
