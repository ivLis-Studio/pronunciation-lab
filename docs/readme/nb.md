# Pronunciation Lab

**Skriv lydene fra ett språk med en annen skrift.**

25 kildespråk · 600 konverteringsretninger · ES-modul for nettleseren

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · **Norsk bokmål** · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Uttaleverktøy](https://ivlis-studio.github.io/pronunciation-lab/?lang=nb) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Kilder og lisenser](../../NOTICE.md)

## Kom i gang

Japansk **猫** kan skrives som **네코** i hangul, og den koreanske hilsenen **안녕하세요** som **アンニョンハセヨ** i katakana. Verktøyet leser kildeteksten med det internasjonale fonetiske alfabetet (IPA) og skriver den om etter konvensjonene i målspråket.

Lim inn koden på en HTML-side. jsDelivr-adressen er låst til en bestemt versjon av kildekoden og krever ingen API-nøkkel.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-API

| Funksjon | Returnerer |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Uttaleskrivemåte på valgt målspråk |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA og 24 uttaleskrivemåter i `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, deler av kildeteksten, uavklarte elementer og diagnoseinformasjon |
| `languages` | Språk-ID-er, visningsnavn, skriftsystemer og varianter som støttes |

### Skriv inn IPA direkte

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Bruk ulike språk-ID-er for `source` og `target`. Standardverdien for `mode` er `'text'`. Bruk `'ipa'` for å skrive inn IPA direkte.
- Velg `variant` av kildespråket med `variant`, for eksempel `'US'` eller `'UK'` for engelsk. Se alternativene i `languages`.
- Sett `readNumbers` til `true` for å lese støttede heltall som grunntall på kildespråket.
- `ipa` beholder grenser mellom fraser og språk, samt linjeskift. `segments` inneholder deler av kildeteksten og hvilket språk de tilhører. IPA-skilletegn som hører sammen, har `delimiter: true`.
- Uavklarte uttaler vises som □ og står i `unresolved`. `unknownPhones`, `unpairedDelimiters` og `unavailableSources` viser IPA-tegn som ikke støttes, skilletegn uten makker og manglende uttaleressurser. Koreansk romanisering ligger i `romanization`.

<details>
<summary>Språk-ID-er, visningsnavn, skriftsystemer og varianter som støttes</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Bygg lokalt

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Krever Node.js 22 eller nyere. Behold de relative plasseringene til `dist/` og `assets/` hvis du drifter verktøyet selv. Konverteringen skjer i nettleseren, som laster ned ordbøker og motorfiler første gang de trengs.

Toner, trykk og lyder kan bli tilnærmet eller utelatt, avhengig av hva målskriften kan uttrykke.

## Kilder og lisenser

Prosjektet bygger på IPA-Translator. Koden bruker GPL-3.0. De medfølgende ordbøkene og modellene beholder sine egne lisenser.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Kilder og lisenser](../../NOTICE.md) · [`licenses/`](../../licenses/)
