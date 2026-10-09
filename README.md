# ťukni – web pre NFC tabuľky na Google recenzie

Statický web (HTML, CSS, JavaScript bez knižníc a bez build kroku) pre službu: NFC tabuľka na Google recenzie za 59 € vrátane nastavenia a osobnej montáže, faktúra po montáži, iba pre firmy. Web je po slovensky aj po anglicky a beží na GitHub Pages.

**Naživo:** https://apoliak7777.github.io/Review-QR-Cards/

```
index.html                    hlavná stránka SK (hero, porovnanie, postup, tabuľka, cena, otázky, kontakt)
en/index.html                 hlavná stránka EN (rovnaká štruktúra, rovnaký formulár)
obchodne-podmienky.html       obchodné podmienky (B2B, predaj s montážou), iba po slovensky
ochrana-osobnych-udajov.html  zásady ochrany osobných údajov
en/privacy.html               anglický preklad zásad (pri zmene upravte obe verzie)
404.html                      stránka pre neexistujúcu adresu (SK + odkaz na EN)
assets/css/style.css          všetky štýly (farby a písma ako tokeny v :root)
assets/js/main.js             menu, validácia a odoslanie formulára, texty pre SK aj EN
assets/fonts/                 vlastné písma (Bricolage Grotesque, Figtree, JetBrains Mono – licencia OFL)
assets/img/                   favicon, ikona pre iPhone, logo, obrázky na zdieľanie og-image.png a og-image-en.png
robots.txt, sitemap.xml
.github/workflows/pages.yml   kontrola webu pri každom pushi a nasadenie na GitHub Pages
.github/scripts/check_site.py kontrola odkazov a zástupných textov (dá sa spustiť aj lokálne)
tools/og-image.cjs            generátor obrázkov na zdieľanie
_headers                      bezpečnostné hlavičky pre Cloudflare Pages / Netlify (GitHub Pages ho ignoruje)
```

Web nepoužíva cookies, analytiku ani písma od tretích strán a nič neukladá do prehliadača, preto netreba cookie lištu. Ak by ste niekedy pridali meranie návštevnosti, najprv upravte zásady ochrany osobných údajov (bod 5, SK aj EN) a Content-Security-Policy.

Odkiaľ prišiel dopyt, uvidíte v jeho riadku „Zdroj“. Do tlačených materiálov dávajte odkazy s označením, napríklad `…/?zdroj=letak`, na QR kód ukážkovej tabuľky `?zdroj=ukazka`, do príspevkov `?zdroj=facebook`. Bez označenia sa zapíše doména webu, z ktorého zákazník klikol, alebo „priamo“.

## Nasadenie na GitHub Pages

Každý push do vetvy `main` web znova nasadí (workflow „Web“, trvá asi minútu). Pri pushi do inej vetvy a pri pull requeste prebehne iba kontrola. Na web sa publikujú iba jeho súbory (bez README, `.github`, `tools` a `_headers`). V repozitári je nastavené *Settings → Pages → Source: GitHub Actions*.

**Adresy sa prispôsobia samy.** Absolútne adresy (canonical, hreflang, `og:`, JSON-LD, `sitemap.xml`, `robots.txt`) sú v kóde napísané na `https://apoliak7777.github.io/Review-QR-Cards`. Workflow ich pri nasadení prepíše na skutočnú adresu webu a v `404.html` doplní cestu podpriečinka. Po pripojení vlastnej domény sa teda v kóde nič nemení.

### Vlastná doména

1. U registrátora nastavte DNS (príklad pre `domena.sk`):
   - `domena.sk` A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `domena.sk` AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `www.domena.sk` CNAME: `apoliak7777.github.io`
2. *Settings → Pages → Custom domain:* `domena.sk`, uložiť. Doménu si overte aj v nastaveniach účtu (*Settings → Pages → Add a domain*), aby ju nemohol pripojiť niekto iný.
3. Keď GitHub vydá certifikát, zapnite *Enforce HTTPS*.
4. *Actions → Web → Run workflow*, aby sa adresy na webe prepísali na novú doménu.
5. Pridajte doménu do Google Search Console a odošlite `sitemap.xml`.

**Bezpečnostné hlavičky:** GitHub Pages nepodporuje vlastné HTTP hlavičky, preto sú Content-Security-Policy a Referrer-Policy v každej stránke ako `<meta>`. Ak na web pridáte čokoľvek z inej domény, doplňte ju do `<meta http-equiv="Content-Security-Policy">` vo všetkých stránkach a do `_headers`, inak ju prehliadač zablokuje.

Lokálny náhľad: `python3 -m http.server 8000` a otvorte `http://localhost:8000`.

## Kontakt a prevádzkovateľ

Prevádzkovateľ: Alex Poliak, Bratislava. Telefón 0902 464 022 (v EN `+421 902 464 022`), e-mail `apoliak@apoliak.online`. Sú v hlavných stránkach (otázky, kontakt, pätička, formulár `action` a `data-email`), v obchodných podmienkach (bod 1.1 a 5.4) a v zásadách (bod 1, SK aj EN). Všetky výskyty:

```
grep -rnE 'apoliak@apoliak\.online|902 ?464 ?022|421902464022' --include='*.html' .
```

Montáž je v Bratislave a okolí (otázka „Kam za vami chodíte“, kontakt, obchodné podmienky bod 3.1).

## Odosielanie správ z formulára

Formulár je rovnaký v slovenskej aj anglickej verzii a funguje v dvoch režimoch:

1. **Bez nastavenia (teraz):** po odoslaní sa zákazníkovi otvorí jeho e-mailová aplikácia s vyplnenou správou na adresu z `data-email`. Správa príde, iba ak ju zákazník naozaj odošle. Stránka mu text zobrazí aj na skopírovanie.
2. **S Web3Forms (odporúčané):** na [web3forms.com](https://web3forms.com) zadajte e-mail, na ktorý majú správy chodiť, a dostanete prístupový kľúč. Vložte ho do `index.html` aj `en/index.html` do atribútu `data-web3forms-key`. Správy potom prídu e-mailom automaticky. Kľúč je v zdrojovom kóde viditeľný, tak to Web3Forms navrhuje; obmedzte ho na doménu webu v jeho nastaveniach. **Zároveň doplňte Web3Forms do zásad ochrany osobných údajov, bod 4 (SK aj EN).**

V správe je aj riadok „Jazyk webu“, takže viete, či zákazníkovi odpovedať po anglicky.

## Zmena ceny

Cena 59 € je na viacerých miestach, pri zmene upravte všetky:

- `index.html` a `en/index.html`: tlačidlo v hero, cena (`.plan-amount`), otázka „Ako sa platí?“, postup pri kontakte, plávajúca lišta na mobile, `meta description`, `og:description`, JSON-LD (`priceRange`, `price`),
- `obchodne-podmienky.html`, bod 3.1,
- obrázky na zdieľanie: upravte `TEXTS` v `tools/og-image.cjs` a spustite ho (nižšie).

Všetky výskyty: `grep -rnE '59(&nbsp;| )€|€59|"59' --include='*.html' --include='*.cjs' .`

## Obrázky na zdieľanie

`assets/img/og-image.png` (SK) a `og-image-en.png` (EN) generuje `tools/og-image.cjs`. Ilustráciu berie priamo z hero sekcie stránok, nadpis a podnadpis sú v objekte `TEXTS`. Po zmene spustite z koreňa repozitára:

```
npm install --no-save playwright
npx playwright install chromium
node tools/og-image.cjs
```

Facebook a iné siete si obrázok pamätajú. Po zmene ho obnovte cez [Sharing Debugger](https://developers.facebook.com/tools/debug/).

## Kontrola

```
python3 .github/scripts/check_site.py
```

Kontroluje nefunkčné odkazy a kotvy (chyba zastaví nasadenie) a zástupné texty vrátane prázdneho kľúča Web3Forms (iba upozornenie). To isté beží vo workflow.
