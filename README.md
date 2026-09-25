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

Odkiaľ prišla objednávka, uvidíte v jej riadku „Zdroj“. Do tlačených materiálov dávajte odkazy s označením, napríklad `tukni.sk/?zdroj=letak`, na QR kód ukážkovej tabuľky `?zdroj=ukazka`, do príspevkov `?zdroj=facebook`. Bez označenia sa zapíše doména webu, z ktorého zákazník klikol, alebo „priamo“. Nič sa neukladá do prehliadača. Ak by ste niekedy pridali meranie návštevnosti (aj „bez cookies“), načíta sa skript tretej strany: najprv upravte zásady ochrany osobných údajov (bod 5) a túto sekciu.

## Pred spustením (povinné)

| Čo | Kde |
|---|---|
| Názov značky a doménu `ťukni` / `tukni.sk` (pracovný názov, dostupnosť domény nie je overená) | všetky `.html`, `robots.txt`, `sitemap.xml`, OG obrázok |
| E-mail `ahoj@tukni.sk` | `index.html` (formulár `data-email`, otázky, pätička), právne stránky |
| Telefón `+421 9xx xxx xxx` | `index.html` (súhrn objednávky, pätička) |
| Obchodné meno s právnou formou, sídlo (živnostník aj adresa bydliska), IČO, IČ DPH ak ste platiteľ, zápis v registri, príslušný inšpektorát SOI | pätička všetkých stránok, obchodné podmienky bod 1.1 |
| Všetky žlto zvýraznené polia `[ … ]` | `obchodne-podmienky.html`, `ochrana-osobnych-udajov.html` |
| DPH: ste alebo nie ste platiteľ | `obchodne-podmienky.html`, bod 3.1 |
| Odosielanie objednávok (viď nižšie) | `index.html`, atribút `data-web3forms-key` |

Právne texty sú vzory, nie právne poradenstvo. Pred spustením ich nechajte skontrolovať.

## Odosielanie objednávok

Formulár funguje v dvoch režimoch:

1. **Bez nastavenia:** po odoslaní sa zákazníkovi otvorí jeho e-mailová aplikácia s vyplnenou objednávkou na adresu z `data-email`. Objednávka príde, iba ak zákazník e-mail naozaj odošle.
2. **S Web3Forms (odporúčané):** na [web3forms.com](https://web3forms.com) zadajte e-mail, na ktorý majú objednávky chodiť, a dostanete prístupový kľúč. Vložte ho do `index.html`:
   ```html
   <form class="order-form" id="order-form" method="post" action="mailto:objednavky@vasadomena.sk" enctype="text/plain"
         data-web3forms-key="VAS-KLUC"
         data-email="objednavky@vasadomena.sk">
   ```
   Objednávky potom prídu e-mailom automaticky. Kľúč je v zdrojovom kóde stránky viditeľný, takto to Web3Forms navrhuje. Obmedzte ho na svoju doménu v nastaveniach Web3Forms. Adresu v `action` a v `data-email` majte rovnakú; `action` sa použije iba v prehliadači bez JavaScriptu. Po nasadení prejdite [kontrolu pred spustením](#kontrola-pred-spustením).

## Zmena cien

Ceny sú na viacerých miestach, pri zmene upravte všetky:

- `assets/js/main.js` – objekt `PACKAGES` (počíta súhrn objednávky),
- `index.html` – cenník (`.plan`), voľby balíka vo formulári (`.pkg`), súhrn (`#sum-*`) a súčet pri tlačidle (`#sum-total-inline`), tlačidlo „od 29 €“, plávajúca lišta na mobile, `meta description`, JSON-LD (`offers`, cena za 1 ks),
- `assets/img/og-image.png` – obrázok na zdieľanie obsahuje text „Od 29 €“.

## Nasadenie

Ľubovoľný statický hosting, napríklad Cloudflare Pages, Netlify alebo GitHub Pages (všetky majú bezplatný plán). Nahrajte obsah priečinka a pripojte vlastnú doménu. Lokálne si web pozriete takto:

```
python3 -m http.server 8000
```

a otvorte `http://localhost:8000`. Stránka `404.html` používa cesty od koreňa domény (`/assets/…`), takže správne funguje na vlastnej doméne, nie v podpriečinku.

Súbor `_headers` (bezpečnostné hlavičky a dlhé cachovanie písiem) použijú Cloudflare Pages aj Netlify; GitHub Pages ho ignoruje. Ak na web pridáte čokoľvek z inej domény, doplňte ju do `Content-Security-Policy`, inak ju prehliadač zablokuje.

Cloudflare Pages presmerúva `/stranka.html` na `/stranka`. Ak ho použijete, zmeňte v `obchodne-podmienky.html`, `ochrana-osobnych-udajov.html` (`<link rel="canonical">`) aj v `sitemap.xml` adresy na tvar bez `.html`. Na Netlify a GitHub Pages nechajte `.html`. Po nasadení overte, že adresa v canonical aj v sitemape vracia 200: `curl -sI https://tukni.sk/obchodne-podmienky.html | head -1`.

## Ako pripraviť tabuľku pre zákazníka

1. **Nájdite odkaz na hodnotenie.**
   - Ak vám ho pošle majiteľ: vo Firemnom profile na Googli klikne na „Požiadať o recenzie“ (anglicky „Ask for reviews“) a skopíruje odkaz v tvare `https://g.page/r/…/review`.
   - Ak ho hľadáte sami: v nástroji [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) nájdite prevádzku a skopírujte Place ID. Odkaz je `https://search.google.com/local/writereview?placeid=PLACE_ID`.
   - Odkaz vždy otvorte v mobile a overte, že sa zobrazí okno na hodnotenie správnej prevádzky.
   - Odkaz pošlite zákazníkovi na kontrolu spolu s potvrdením a faktúrou. Čip programujte až po úhrade; ak zákazník medzitým napísal, že odkaz nesedí, najprv ho opravte.
2. **Zapíšte čip.** V aplikácii NFC Tools (Android aj iPhone): *Write → Add a record → URL/URI* → vložiť odkaz → *Write* → priložiť tabuľku.
3. **Zabezpečte zápis heslom.** V NFC Tools v karte *Other* nastavte heslo (*Set password*). Heslá si evidujte v správcovi hesiel pod číslom objednávky alebo IČO (nie iba v e-maile), bez nich tabuľku nepreprogramujete. Nepoužívajte *Lock tag*: uzamknutie je trvalé a čip sa už nedá zmeniť.
4. **Otestujte** na iPhone aj na Androide.
5. **QR kód:** web sľubuje QR kód pre telefóny bez NFC. Vytlačte nálepku s QR kódom na rovnaký odkaz (napríklad cez generátor QR kódov) a pribaľte ju k tabuľke.

## Čo web tvrdí a treba overiť na doručenom tovare

Texty vychádzajú z ponuky dodávateľa na Alibabe. Po doručení skontrolujte a prípadne upravte `index.html`:

- rozmer 120 × 120 mm, akrylát, 3M lepiaca vrstva na zadnej strane,
- čip NTAG213 (výrobca NXP): v aplikácii NXP TagInfo overte originality signature. Ak overenie neprejde, zmeňte v `index.html` riadok „Čip“ na „Čip kompatibilný s NTAG213, 13,56 MHz“ a odstráňte zmienky o NXP a 10 rokoch (riadok „Napájanie“ a otázka o čistení),
- logo Google „G“ na tabuľke: ak ho doručené tabuľky majú, nepredávajte ich s viditeľným logom (pravidlá značky Google to pri tovare nepovoľujú). Prelepte ho odolnou nálepkou (napríklad hviezdičkou ako na webe) alebo objednajte variant bez loga. Fotky na webe aj OG obrázok musia zodpovedať tomu, čo zákazník dostane,
- funkčnosť na kovovom povrchu (tabuľku len priložte, nelepte) na nerezovom pulte a kovovej pokladni, s iPhonom aj Androidom; ak čip na kove nefunguje, web to už správne hovorí (otázka „Je to stojan alebo nálepka?“),
- anglický nápis „We would appreciate your Google review!“ (sekcia Tabuľka a otázka o vlastnom logu),
- nahraďte kreslené ilustrácie tabuľky skutočnými fotografiami.

Sľuby, ktoré musíte vedieť dodržať: odoslanie do 3 pracovných dní od úhrady, potvrdenie a faktúra do jedného pracovného dňa (verejným inštitúciám potvrďte prijatie objednávky hneď, napríklad automatickou odpoveďou vo Web3Forms), odkaz na kontrolu pred zápisom, overenie IČO v registri pred vystavením faktúry, doprava zadarmo, bezplatné preprogramovanie, záruka 12 mesiacov. Kým nemáte tovar na sklade, web nespúšťajte alebo tieto texty upravte. Platí to aj pre JSON-LD v `index.html`: `"availability": "https://schema.org/InStock"` smie byť zverejnené, iba keď tabuľky fyzicky máte.

## Kontrola pred spustením

1. Tento príkaz nesmie nič vypísať (zostávajúce zástupné texty a prázdny kľúč):
   ```
   grep -rnE 'class="fill"|\[(doplniť|Obchodné meno|sídlo|kraj podľa sídla|adresa inšpektorátu)|9xx|900000000|data-web3forms-key=""' --include='*.html' .
   ```
2. Schránka `ahoj@` existuje, doména má nastavené SPF, DKIM a DMARC a skúšobný e-mail na mail-tester.com dostane aspoň 9/10.
3. Z mobilu na mobilných dátach odošlite skúšobnú objednávku s „TEST“ v poznámke. Musí prísť do minúty, nie do spamu (označte „nie je spam“ a pridajte odosielateľa do kontaktov) a odpoveď musí ísť na e-mail zákazníka.
4. Ak používate Web3Forms: zapnite režim lietadlo a odošlite objednávku. Musí sa zobraziť chybová hláška s odkazom na odoslanie e-mailom.
5. Otvorte `/neexistuje`: musí sa zobraziť stránka 404.
6. Priložte naprogramovanú tabuľku a naskenujte jej QR nálepku na iPhone aj Androide.
7. Pridajte doménu do Google Search Console a odošlite `sitemap.xml`.

Kroky 3 a 6 zopakujte po každej zmene formulára alebo domény.
