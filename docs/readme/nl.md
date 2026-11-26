# Pronunciation Lab

**Schrijf de klanken van één taal in een ander schrift.**

25 brontalen · 600 omzettingsrichtingen · ES-module voor de browser

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · **Nederlands** · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Uitspraakomzetter](https://ivlis-studio.github.io/pronunciation-lab/?lang=nl) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Bronnen en licenties](../../NOTICE.md)

## Aan de slag

Het Japanse **猫** wordt **네코** in hangul, en de Koreaanse groet **안녕하세요** wordt **アンニョンハセヨ** in katakana. Het hulpmiddel zet de brontekst eerst om naar het Internationaal Fonetisch Alfabet (IPA) en schrijft de klanken vervolgens volgens de conventies van de doeltaal.

Plak dit voorbeeld in een HTML-pagina. De jsDelivr-URL verwijst naar een vaste commit. Een API-sleutel is niet nodig.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-API

| Functie | Resultaat |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Uitspraaknotatie in de gekozen doeltaal |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA en de notatie voor 24 doeltalen in `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, brontekstfragmenten, onbekende uitspraken en diagnosegegevens |
| `languages` | Ondersteunde taalcodes, namen, schriftsystemen en varianten |

### IPA rechtstreeks invoeren

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Gebruik verschillende taalcodes voor `source` en `target`. De standaardwaarde van `mode` is `'text'`. Gebruik `'ipa'` om rechtstreeks IPA in te voeren.
- Kies met `variant` een `variant` van de brontaal, zoals `'US'` of `'UK'` voor Engels. Bekijk de opties in `languages`.
- Zet `readNumbers` op `true` om ondersteunde gehele getallen als hoofdtelwoorden in de brontaal te lezen.
- `ipa` behoudt de grenzen tussen woordgroepen en talen en de regeleinden. `segments` bevat delen van de brontekst en hun talen. Gepaard geplaatste IPA-tekens krijgen `delimiter: true`.
- Onbekende uitspraken worden als □ weergegeven en staan in `unresolved`. `unknownPhones`, `unpairedDelimiters` en `unavailableSources` melden niet-ondersteunde IPA-tekens, ongepaarde tekens en ontbrekende uitspraakbronnen. Koreaanse romanisering staat in `romanization`.

<details>
<summary>Ondersteunde taalcodes, namen, schriftsystemen en varianten</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Lokaal bouwen

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 of nieuwer is vereist. Behoud bij eigen hosting de onderlinge positie van `dist/` en `assets/`. Omzetting gebeurt in de browser. Bestanden voor het woordenboek en de uitspraakengine worden bij het eerste gebruik opgehaald.

Tonen, klemtoon en klanken worden zo nodig benaderd of weggelaten, afhankelijk van het doelschrift.

## Bronnen en licenties

Dit project is gebaseerd op IPA-Translator. De code valt onder GPL-3.0. De meegeleverde woordenboeken en modellen behouden hun eigen licenties.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Bronnen en licenties](../../NOTICE.md) · [`licenses/`](../../licenses/)
