# Pronunciation Lab

**Skribu la sonojn de unu lingvo per alia skribsistemo.**

25 fontlingvoj · 600 konvertodirektoj · ES-modulo por retumilo

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · **Esperanto** · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Prononc-konvertilo](https://ivlis-studio.github.io/pronunciation-lab/?lang=eo) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Fontoj kaj permesiloj](../../NOTICE.md)

## Ekuzo

La japana vorto **猫** povas esti skribita per hangulo kiel **네코**, kaj la korea saluto **안녕하세요** per katakano kiel **アンニョンハセヨ**. La ilo legas la fonttekston laŭ la Internacia Fonetika Alfabeto (IFA, angle IPA) kaj reskribas ĝin laŭ la kutimoj de la cellingvo.

Algluu la ekzemplon en HTML-paĝon. La adreso de jsDelivr indikas fiksitan kodversion kaj ne postulas API-ŝlosilon.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-API

| Funkcio | Liveras |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Prononcan skribmanieron en la elektita cellingvo |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA kaj skribmanierojn en 24 cellingvoj en `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, pecojn de la fontteksto, nedeterminitajn erojn kaj diagnozajn informojn |
| `languages` | Identigilojn, montratajn nomojn, skribsistemojn kaj variaĵojn de la subtenataj lingvoj |

### Rekte enigi IPA

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Uzu malsamajn lingvo-identigilojn por `source` kaj `target`. La defaŭlta `mode` estas `'text'`. Uzu `'ipa'` por rekta IPA-enigo.
- Elektu variaĵon de la fontlingvo per `variant`, ekzemple `'US'` aŭ `'UK'` por la angla. Vidu `languages` por la disponeblaj variaĵoj.
- Agordu `readNumbers` al `true` por legi subtenatajn entjerojn kiel kardinalajn numeralojn en la fontlingvo.
- `ipa` konservas frazo- kaj lingvolimojn kaj linifinojn. `segments` enhavas pecojn de la fontteksto kaj iliajn lingvojn. Parigitaj IPA-limsignoj havas `delimiter: true`.
- Nedeterminitaj prononcoj aperas kiel □ kaj estas listigitaj en `unresolved`. `unknownPhones`, `unpairedDelimiters` kaj `unavailableSources` montras nesubtenatajn IPA-simbolojn, neparigitajn limsignojn kaj nedisponeblajn prononcfontojn. La latinliterigo de la korea troviĝas en `romanization`.

<details>
<summary>Identigilojn, montratajn nomojn, skribsistemojn kaj variaĵojn de la subtenataj lingvoj</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Loke konstrui

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Necesas Node.js 22 aŭ pli nova. Por mem gastigi, konservu la relativan situon de `dist/` kaj `assets/`. La retumilo konvertas la tekston kaj elŝutas la vortarojn kaj la dosierojn de la motoro je la unua uzado.

Tonoj, akcentoj kaj sonoj povas esti proksimumigitaj aŭ forlasitaj depende de tio, kion la cela skribsistemo kapablas esprimi.

## Fontoj kaj permesiloj

La projekto baziĝas sur IPA-Translator. La kodo estas sub GPL-3.0, kaj la kunigitaj vortaroj kaj modeloj konservas siajn proprajn permesilojn.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Fontoj kaj permesiloj](../../NOTICE.md) · [`licenses/`](../../licenses/)
