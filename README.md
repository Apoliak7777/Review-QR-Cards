# ťukni.sk – web pre NFC tabuľky na Google recenzie s montážou

Statický web (HTML, CSS, JavaScript bez knižníc a bez build kroku) pre službu: NFC tabuľka na Google recenzie za 50 € vrátane osobnej montáže, faktúra po montáži. Web je po slovensky aj po anglicky a beží na GitHub Pages.

```
index.html                    hlavná stránka SK (hero, porovnanie, postup, tabuľka, cena, otázky, kontakt)
en/index.html                 hlavná stránka EN (rovnaká štruktúra, rovnaký formulár)
obchodne-podmienky.html       VZOR obchodných podmienok (B2B, predaj s montážou), iba po slovensky
ochrana-osobnych-udajov.html  VZOR zásad ochrany osobných údajov
en/privacy.html               anglický preklad zásad (pri zmene upravte obe verzie)
404.html                      stránka pre neexistujúcu URL (SK + odkaz na EN)
assets/css/style.css          všetky štýly (farby a písma ako tokeny v :root)
assets/js/main.js             menu, validácia a odoslanie formulára, texty pre SK aj EN
assets/fonts/                 self-hosted písma (Bricolage Grotesque, Figtree, JetBrains Mono – licencia OFL)
assets/img/                   favicon, ikona pre iPhone, logo, obrázky na zdieľanie og-image.png a og-image-en.png
robots.txt, sitemap.xml
.github/workflows/pages.yml   kontrola webu pri každom pushi a nasadenie na GitHub Pages
.github/scripts/check_site.py kontrola odkazov a zástupných textov (dá sa spustiť aj lokálne)
tools/og-image.cjs            generátor obrázkov na zdieľanie
_headers                      bezpečnostné hlavičky pre Cloudflare Pages / Netlify (GitHub Pages ho ignoruje)
```

Web nepoužíva cookies, analytiku ani Google Fonts a nič neukladá do prehliadača, preto netreba cookie lištu. Ak by ste niekedy pridali meranie návštevnosti (aj „bez cookies“), načíta sa skript tretej strany: najprv upravte zásady ochrany osobných údajov (bod 5, SK aj EN) a Content-Security-Policy.

Odkiaľ prišiel dopyt, uvidíte v jeho riadku „Zdroj“. Do tlačených materiálov dávajte odkazy s označením, napríklad `tukni.sk/?zdroj=letak`, na QR kód ukážkovej tabuľky `?zdroj=ukazka`, do príspevkov `?zdroj=facebook`. Bez označenia sa zapíše doména webu, z ktorého zákazník klikol, alebo „priamo“.

## Nasadenie na GitHub Pages

Jednorazové nastavenie v repozitári na GitHube:

1. **Predvolená vetva.** Workflow nasadzuje z predvolenej vetvy repozitára, nech sa volá akokoľvek. Odporúčanie: vytvorte vetvu `main` z aktuálneho stavu a v *Settings → General → Default branch* ju nastavte ako predvolenú.
2. **Zapnite Pages.** *Settings → Pages → Build and deployment → Source: GitHub Actions.* Potom v záložke *Actions* spustite workflow „Web“ (*Run workflow*) alebo pushnite do predvolenej vetvy. Web bude na adrese, ktorú workflow vypíše pri kroku nasadenia.
3. **Vlastná doména** (prakticky povinná, viď nižšie):
   - *Settings → Pages → Custom domain:* `tukni.sk`, uložiť.
   - U registrátora domény nastavte DNS:
     - `tukni.sk` A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     - `tukni.sk` AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
     - `www.tukni.sk` CNAME: `apoliak7777.github.io`
   - Doménu si overte v nastaveniach účtu (*Settings → Pages → Add a domain*), aby ju nemohol pripojiť k svojmu webu niekto iný.
   - Keď GitHub vydá certifikát, zapnite *Enforce HTTPS*.

Každý push do predvolenej vetvy web znova nasadí. Pri pushi do inej vetvy a pri pull requeste prebehne iba kontrola. Na doménu sa publikujú iba súbory webu (bez README, `.github`, `tools` a `_headers`).

Bez vlastnej domény by web bežal na `apoliak7777.github.io/Review-QR-Cards/`. Tam nefunguje stránka 404 (používa cesty od koreňa domény `/assets/…`) a canonical aj sitemap ukazujú na `tukni.sk`. Na skúšanie to stačí, na zákazníkov nie.

**Bezpečnostné hlavičky:** GitHub Pages nepodporuje vlastné HTTP hlavičky, súbor `_headers` ignoruje. Content-Security-Policy a Referrer-Policy sú preto v každej HTML stránke ako `<meta>`. Ak na web pridáte čokoľvek z inej domény, doplňte ju do `<meta http-equiv="Content-Security-Policy">` vo všetkých stránkach a do `_headers`, inak ju prehliadač zablokuje. Ochranu pred vložením do rámca (`frame-ancestors`) a `nosniff` cez `<meta>` nastaviť nejde; ak ich chcete, dajte pred web Cloudflare alebo ho presuňte na Cloudflare Pages či Netlify (tam `_headers` platí).

**Verejný repozitár:** GitHub Pages zadarmo funguje iba z verejného repozitára. Všetko v ňom vrátane tohto README (dodávateľ, interné sľuby) je teda verejne viditeľné na GitHube. Ak to nechcete, potrebujete platený účet GitHub a súkromný repozitár, alebo iný hosting.

Lokálne si web pozriete takto:

```
python3 -m http.server 8000
```

a otvorte `http://localhost:8000`.

## Pred spustením (povinné)

| Čo | Kde |
|---|---|
| Názov značky a doménu `ťukni` / `tukni.sk` (pracovný názov, dostupnosť domény nie je overená) | všetky `.html`, `robots.txt`, `sitemap.xml`, `tools/og-image.cjs` a obrázky na zdieľanie |
| E-mail `ahoj@tukni.sk` | `index.html`, `en/index.html` (formulár `action` a `data-email`, otázky, kontakt, pätička), právne stránky |
| Telefón `+421 9xx xxx xxx` | `index.html`, `en/index.html` (otázky, kontakt, pätička), obchodné podmienky bod 1.1 |
| Obchodné meno s právnou formou, sídlo (živnostník aj adresa bydliska), IČO, DIČ, zápis v registri, príslušný inšpektorát SOI | pätička všetkých stránok, obchodné podmienky bod 1.1, zásady bod 1 (SK aj EN) |
| Všetky žlto zvýraznené polia `[ … ]` a `[doplniť: …]` | `obchodne-podmienky.html`, `ochrana-osobnych-udajov.html`, `en/privacy.html` |
| Poskytovateľ e-mailu a účtovník | zásady bod 4 (SK aj EN) |
| Odosielanie správ (viď nižšie) | `index.html` aj `en/index.html`, atribút `data-web3forms-key` |

Web uvádza, že nie ste platiteľom DPH (cena, otázky, pätička, obchodné podmienky). Ak sa to zmení, upravte všetky tieto miesta.

Ponuka je iba pre firmy, živnostníkov a inštitúcie (B2B). Pri montáži u spotrebiteľa by išlo o zmluvu uzavretú mimo prevádzkových priestorov s inými povinnosťami (poučenie, právo na odstúpenie), ktoré tieto podmienky neriešia.

Právne texty sú vzory, nie právne poradenstvo. Pred spustením ich nechajte skontrolovať.

## Odosielanie správ z formulára

Formulár je rovnaký v slovenskej aj anglickej verzii a funguje v dvoch režimoch:

1. **Bez nastavenia:** po odoslaní sa zákazníkovi otvorí jeho e-mailová aplikácia s vyplnenou správou na adresu z `data-email`. Správa príde, iba ak ju zákazník naozaj odošle.
2. **S Web3Forms (odporúčané):** na [web3forms.com](https://web3forms.com) zadajte e-mail, na ktorý majú správy chodiť, a dostanete prístupový kľúč. Vložte ho do `index.html` aj `en/index.html`:
   ```html
   <form class="order-form" id="order-form" method="post" action="mailto:ahoj@vasadomena.sk" enctype="text/plain"
         data-web3forms-key="VAS-KLUC"
         data-email="ahoj@vasadomena.sk">
   ```
   Správy potom prídu e-mailom automaticky. Kľúč je v zdrojovom kóde stránky viditeľný, takto to Web3Forms navrhuje. Obmedzte ho na svoju doménu v nastaveniach Web3Forms. Adresu v `action` a v `data-email` majte rovnakú; `action` sa použije iba v prehliadači bez JavaScriptu. Kontrola vo workflow upozorní, ak sa nastavenie v SK a EN verzii líši.

V správe je aj riadok „Jazyk webu“, takže viete, či zákazníkovi odpovedať po anglicky.

## Zmena ceny

Cena 50 € je na viacerých miestach, pri zmene upravte všetky:

- `index.html` a `en/index.html`: tlačidlo v hero, cena (`.plan-amount`), otázka „Ako sa platí?“, postup pri kontakte, plávajúca lišta na mobile, `meta description`, `og:description`, JSON-LD (`priceRange`, `price`),
- `obchodne-podmienky.html`, bod 3.1,
- obrázky na zdieľanie: upravte `TEXTS` v `tools/og-image.cjs` a spustite ho (viď nižšie).

Všetky výskyty nájdete takto: `grep -rnE '50(&nbsp;| |<span>)?€|€50|"50' --include='*.html' .`

## Obrázky na zdieľanie

`assets/img/og-image.png` (SK) a `og-image-en.png` (EN) generuje `tools/og-image.cjs`. Ilustráciu berie priamo z hero sekcie stránok, nadpis a podnadpis sú v objekte `TEXTS`. Po zmene spustite z koreňa repozitára:

```
npm install --no-save playwright
npx playwright install chromium
node tools/og-image.cjs
```

Facebook a iné siete si obrázok pamätajú. Po zmene ho obnovte cez [Sharing Debugger](https://developers.facebook.com/tools/debug/).

## Postup pri montáži

1. **Nájdite odkaz na hodnotenie.**
   - Ak ho má majiteľ: vo Firemnom profile na Googli klikne na „Požiadať o recenzie“ (anglicky „Ask for reviews“) a skopíruje odkaz v tvare `https://g.page/r/…/review`.
   - Ak ho hľadáte sami: v nástroji [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) nájdite prevádzku a skopírujte Place ID. Odkaz je `https://search.google.com/local/writereview?placeid=PLACE_ID`.
   - Odkaz otvorte na mobile a spolu so zákazníkom overte, že sa zobrazí okno na hodnotenie správnej prevádzky (obchodné podmienky bod 4.2).
2. **Zapíšte čip.** V aplikácii NFC Tools (Android aj iPhone): *Write → Add a record → URL/URI* → vložiť odkaz → *Write* → priložiť tabuľku.
3. **Zabezpečte zápis heslom.** V NFC Tools v karte *Other* nastavte heslo (*Set password*). Heslá si evidujte v správcovi hesiel pod IČO alebo číslom faktúry (nie iba v e-maile), bez nich tabuľku nepreprogramujete. Nepoužívajte *Lock tag*: uzamknutie je trvalé a čip sa už nedá zmeniť.
4. **Nalepte a otestujte** na mobile zákazníka, na iPhone aj na Androide. Nie priamo na kov a nie tesne vedľa platobného terminálu.
5. **QR kód:** web sľubuje nálepku s QR kódom pre telefóny bez NFC. Vytlačte ju vopred na rovnaký odkaz (napríklad cez generátor QR kódov) a nalepte vedľa tabuľky alebo na menu.
6. **Faktúra:** fakturačné údaje si vypýtajte pri montáži, IČO overte v registri ([orsr.sk](https://www.orsr.sk), [zrsr.sk](https://www.zrsr.sk)). Faktúru pošlite so splatnosťou 7 dní.

## Čo web tvrdí a treba overiť na doručenom tovare

Texty vychádzajú z ponuky dodávateľa na Alibabe. Po doručení skontrolujte a prípadne upravte `index.html` aj `en/index.html`:

- rozmer 120 × 120 mm, akrylát, 3M lepiaca vrstva na zadnej strane,
- čip NTAG213 (výrobca NXP): v aplikácii NXP TagInfo overte originality signature. Ak overenie neprejde, zmeňte riadok „Čip“ na „Čip kompatibilný s NTAG213, 13,56 MHz“ a odstráňte zmienky o NXP a 10 rokoch (riadok „Napájanie“ a otázka o čistení),
- **logo Google „G“:** ilustrácie na webe a obrázky na zdieľanie ukazujú na tabuľke hviezdičku, nie logo Google. Pravidlá značky Google nepovoľujú logo Google na tovare a o výnimku sa nedá požiadať. Ak ho doručené tabuľky majú, prelepte ho odolnou nálepkou (napríklad hviezdičkou ako na webe) alebo objednajte variant bez loga. Slovo „Google“ v texte („Google recenzie“) popisuje službu a je v poriadku,
- funkčnosť na kovovom povrchu (tabuľku len priložte, nelepte) na nerezovom pulte a kovovej pokladni, s iPhonom aj Androidom,
- anglický nápis „We would appreciate your Google review!“ (sekcia Tabuľka a otázka o vlastnom logu),
- nahraďte kreslené ilustrácie tabuľky skutočnými fotografiami,
- citát Google v sekcii „Prečo tabuľka“ (SK aj EN): overte, že znenie stále zodpovedá [stránke Google](https://support.google.com/business/answer/7091).

Sľuby, ktoré musíte vedieť dodržať: ozvať sa do jedného pracovného dňa, montáž zvyčajne do pol hodiny, platba až po montáži, doprava na miesto montáže v cene, záruka 12 mesiacov s výmenou alebo preprogramovaním na mieste, bezplatné preprogramovanie do 12 mesiacov. Kým nemáte tovar, web nespúšťajte alebo tieto texty upravte.

## Kontrola pred spustením

1. Kontrola nesmie hlásiť chyby ani zástupné texty:
   ```
   python3 .github/scripts/check_site.py
   ```
   To isté beží vo workflow; zástupné texty tam uvidíte ako upozornenia (*Actions → Web → Summary*).
2. Schránka `ahoj@` existuje, doména má nastavené SPF, DKIM a DMARC a skúšobný e-mail na mail-tester.com dostane aspoň 9/10.
3. Z mobilu na mobilných dátach odošlite skúšobný dopyt s „TEST“ v poznámke zo slovenskej aj z anglickej verzie. Musí prísť do minúty, nie do spamu (označte „nie je spam“ a pridajte odosielateľa do kontaktov) a odpoveď musí ísť na e-mail zákazníka, ak ho vyplnil.
4. Ak používate Web3Forms: zapnite režim lietadlo a odošlite formulár. Musí sa zobraziť chybová hláška s odkazom na odoslanie e-mailom.
5. Otvorte `/neexistuje`: musí sa zobraziť stránka 404.
6. Na `https://tukni.sk` a `https://www.tukni.sk` musí web naskočiť cez HTTPS.
7. Priložte naprogramovanú tabuľku a naskenujte jej QR nálepku na iPhone aj Androide.
8. Pridajte doménu do Google Search Console a odošlite `sitemap.xml`.

Kroky 3 a 7 zopakujte po každej zmene formulára alebo domény.
