# Pronunciation Lab

**Kirjoita yhden kielen äänteet toisen kielen kirjoitusjärjestelmällä.**

25 lähdekieltä · 600 muunnossuuntaa · ES-moduuli selaimelle

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · **Suomi** · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Ääntämismuunnin](https://ivlis-studio.github.io/pronunciation-lab/?lang=fi) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Lähteet ja lisenssit](../../NOTICE.md)

## Näin pääset alkuun

Japanin **猫** voidaan kirjoittaa hangulilla **네코**, ja korean tervehdyksen **안녕하세요** voi kirjoittaa katakanalla **アンニョンハセヨ**. Työkalu lukee lähdetekstin kansainvälisellä foneettisella aakkostolla (IPA) ja kirjoittaa sen sitten kohdekielen käytäntöjen mukaisesti.

Liitä koodi HTML-sivulle. jsDelivr-osoite viittaa kiinteään lähdekoodiversioon eikä vaadi API-avainta.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-rajapinta

| Funktio | Paluuarvo |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Ääntämisasu valitulla kohdekielellä |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA ja 24 kohdekielen ääntämisasut kentässä `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, lähdetekstin osat, ratkaisemattomat kohdat ja diagnostiikkatiedot |
| `languages` | Tuettujen kielten tunnisteet, näyttönimet, kirjoitusjärjestelmät ja kielimuodot |

### Anna IPA suoraan

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Anna eri kielitunnisteet kentille `source` ja `target`. Kentän `mode` oletusarvo on `'text'`. Käytä arvoa `'ipa'`, kun annat IPA-merkkejä suoraan.
- Valitse `variant`-asetuksella lähdekielen muoto, esimerkiksi englannille `'US'` tai `'UK'`. Vaihtoehdot näkyvät kentässä `languages`.
- Aseta `readNumbers` arvoon `true`, jotta tuetut kokonaisluvut luetaan lähdekielen peruslukuina.
- `ipa` säilyttää ilmausten ja kielten rajat sekä rivinvaihdot. `segments` sisältää lähdetekstin osat ja niiden kielet. Pareittain esiintyvillä IPA-erottimilla on `delimiter: true`.
- Ratkaisematon ääntämys näkyy merkkinä □ ja tallennetaan kenttään `unresolved`. `unknownPhones`, `unpairedDelimiters` ja `unavailableSources` kertovat IPA-merkeistä, joita ei tueta, parittomista erottimista ja puuttuvista ääntämisaineistoista. Korean latinakirjaiminen asu on kentässä `romanization`.

<details>
<summary>Tuettujen kielten tunnisteet, näyttönimet, kirjoitusjärjestelmät ja kielimuodot</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Paikallinen koonti

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Tarvitset Node.js 22:n tai uudemman version. Säilytä `dist/` ja `assets/` samassa suhteellisessa sijainnissa omalla palvelimella. Muunnos tehdään selaimessa, ja sanakirjat sekä moottoritiedostot ladataan ensimmäisellä käyttökerralla.

Toonit, painot ja äänteet voidaan esittää likimääräisesti tai jättää pois sen mukaan, mitä kohdekirjoitusjärjestelmä pystyy ilmaisemaan.

## Lähteet ja lisenssit

Hanke pohjautuu IPA-Translatoriin. Koodin lisenssi on GPL-3.0, ja mukana tulevat sanakirjat ja mallit säilyttävät omat lisenssinsä.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Lähteet ja lisenssit](../../NOTICE.md) · [`licenses/`](../../licenses/)
