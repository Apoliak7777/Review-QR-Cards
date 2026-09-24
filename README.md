# ťukni.sk – web pre NFC tabuľky na Google recenzie

Statický web (HTML, CSS, JavaScript bez knižníc a bez build kroku) pre predaj NFC tabuliek na Google recenzie slovenským firmám. Stačí nahrať súbory na ľubovoľný hosting.

```
index.html                    hlavná stránka (hero, porovnanie, postup, špecifikácia, cenník, otázky, objednávka)
obchodne-podmienky.html       VZOR obchodných podmienok (B2B)
ochrana-osobnych-udajov.html  VZOR zásad ochrany osobných údajov
404.html                      stránka pre neexistujúcu URL
assets/css/style.css          všetky štýly (farby a písma ako tokeny v :root)
assets/js/main.js             menu, výber balíka, súhrn objednávky, validácia a odoslanie formulára
assets/fonts/                 self-hosted písma (Bricolage Grotesque, Figtree, JetBrains Mono – licencia OFL)
assets/img/                   favicon, ikona pre iPhone, logo, OG obrázok na zdieľanie
robots.txt, sitemap.xml
```

Web nepoužíva cookies, analytiku ani Google Fonts. Pri návšteve nejdú žiadne dáta tretím stranám, preto netreba cookie lištu.

## Pred spustením (povinné)

| Čo | Kde |
|---|---|
| Názov značky a doménu `ťukni` / `tukni.sk` (pracovný názov, dostupnosť domény nie je overená) | všetky `.html`, `robots.txt`, `sitemap.xml`, OG obrázok |
| E-mail `ahoj@tukni.sk` | `index.html` (formulár `data-email`, otázky, pätička), právne stránky |
| Telefón `+421 9xx xxx xxx` | `index.html` (súhrn objednávky, pätička) |
| Obchodné meno, IČO, sídlo | pätička všetkých stránok |
| Všetky žlto zvýraznené polia `[ … ]` | `obchodne-podmienky.html`, `ochrana-osobnych-udajov.html` |
| DPH: ste alebo nie ste platiteľ | `obchodne-podmienky.html`, bod 3.1 |
| Odosielanie objednávok (viď nižšie) | `index.html`, atribút `data-web3forms-key` |

Právne texty sú vzory, nie právne poradenstvo. Pred spustením ich nechajte skontrolovať.

## Odosielanie objednávok

Formulár funguje v dvoch režimoch:

1. **Bez nastavenia:** po odoslaní sa zákazníkovi otvorí jeho e-mailová aplikácia s vyplnenou objednávkou na adresu z `data-email`. Objednávka príde, iba ak zákazník e-mail naozaj odošle.
2. **S Web3Forms (odporúčané):** na [web3forms.com](https://web3forms.com) zadajte e-mail, na ktorý majú objednávky chodiť, a dostanete prístupový kľúč. Vložte ho do `index.html`:
   ```html
   <form class="order-form" id="order-form" novalidate
         data-web3forms-key="VAS-KLUC"
         data-email="objednavky@vasadomena.sk">
   ```
   Objednávky potom prídu e-mailom automaticky. Kľúč je v zdrojovom kóde stránky viditeľný, takto to Web3Forms navrhuje. Obmedzte ho na svoju doménu v nastaveniach Web3Forms. Po nasadení odošlite jednu skúšobnú objednávku.

## Zmena cien

Ceny sú na viacerých miestach, pri zmene upravte všetky:

- `assets/js/main.js` – objekt `PACKAGES` (počíta súhrn objednávky),
- `index.html` – cenník (`.plan`), voľby balíka vo formulári (`.pkg`), súhrn (`#sum-*`), tlačidlo „od 29 €“, plávajúca lišta na mobile, `meta description`, JSON-LD (`offers`),
- `assets/img/og-image.png` – obrázok na zdieľanie obsahuje text „Od 29 €“.

## Nasadenie

Ľubovoľný statický hosting, napríklad Cloudflare Pages, Netlify alebo GitHub Pages (všetky majú bezplatný plán). Nahrajte obsah priečinka a pripojte vlastnú doménu. Lokálne si web pozriete takto:

```
python3 -m http.server 8000
```

a otvorte `http://localhost:8000`. Stránka `404.html` používa cesty od koreňa domény (`/assets/…`), takže správne funguje na vlastnej doméne, nie v podpriečinku.

## Ako pripraviť tabuľku pre zákazníka

1. **Nájdite odkaz na hodnotenie.**
   - Ak vám ho pošle majiteľ: v Profile firmy na Google klikne na „Požiadať o recenzie“ (anglicky „Ask for reviews“) a skopíruje odkaz v tvare `https://g.page/r/…/review`.
   - Ak ho hľadáte sami: v nástroji [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) nájdite prevádzku a skopírujte Place ID. Odkaz je `https://search.google.com/local/writereview?placeid=PLACE_ID`.
   - Odkaz vždy otvorte v mobile a overte, že sa zobrazí okno na hodnotenie správnej prevádzky.
2. **Zapíšte čip.** V aplikácii NFC Tools (Android aj iPhone): *Write → Add a record → URL/URI* → vložiť odkaz → *Write* → priložiť tabuľku.
3. **Zabezpečte zápis heslom.** V NFC Tools v karte *Other* nastavte heslo (*Set password*). Heslá si evidujte k objednávke, bez nich tabuľku nepreprogramujete. Nepoužívajte *Lock tag*: uzamknutie je trvalé a čip sa už nedá zmeniť.
4. **Otestujte** na iPhone aj na Androide.
5. **QR kód:** web sľubuje QR kód pre telefóny bez NFC. Vytlačte nálepku s QR kódom na rovnaký odkaz (napríklad cez generátor QR kódov) a pribaľte ju k tabuľke.

## Čo web tvrdí a treba overiť na doručenom tovare

Texty vychádzajú z ponuky dodávateľa na Alibabe. Po doručení skontrolujte a prípadne upravte `index.html`:

- rozmer 120 × 120 mm, akrylát, 3M lepiaca vrstva na zadnej strane,
- čip NTAG213 (výrobca NXP),
- anglický nápis „We would appreciate your Google review!“ (sekcia Tabuľka a otázka o vlastnom logu),
- nahraďte kreslené ilustrácie tabuľky skutočnými fotografiami.

Sľuby, ktoré musíte vedieť dodržať: odoslanie do 3 pracovných dní od úhrady, potvrdenie a faktúra do jedného pracovného dňa, doprava zadarmo, bezplatné preprogramovanie, záruka 12 mesiacov. Kým nemáte tovar na sklade, web nespúšťajte alebo tieto texty upravte.
