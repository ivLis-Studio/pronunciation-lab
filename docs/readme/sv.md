# Pronunciation Lab

**Skriv ljuden från ett språk med ett annat skriftsystem.**

25 källspråk · 600 omvandlingsriktningar · ES-modul för webbläsare

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · **Svenska** · [Tiếng Việt](./vi.md)

[Uttalsomvandlare](https://ivlis-studio.github.io/pronunciation-lab/?lang=sv) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Källor och licenser](../../NOTICE.md)

## Kom igång

Japanska **猫** kan skrivas **네코** med hangul, och koreanska **안녕하세요** kan skrivas **アンニョンハセヨ** med katakana. Verktyget läser källtexten med Internationella fonetiska alfabetet (IPA) och skriver om den enligt målspråkets konventioner.

Klistra in exemplet på en HTML-sida. jsDelivr-adressen är låst till en viss kodversion och kräver ingen API-nyckel.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-API

| Funktion | Returnerar |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Uttalsskrivning på valt målspråk |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA och uttalsskrivningar för 24 målspråk i `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, delar av källtexten, olösta uttal och diagnostik |
| `languages` | Språk-ID, visningsnamn, skriftsystem och varianter som stöds |

### Ange IPA direkt

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Använd olika språk-ID för `source` och `target`. Standardvärdet för `mode` är `'text'`. Använd `'ipa'` för att ange IPA direkt.
- Välj källspråksvariant med `variant`, till exempel `'US'` eller `'UK'` för engelska. Alternativen finns i `languages`.
- Sätt `readNumbers` till `true` för att läsa heltal som stöds som grundtal på källspråket.
- `ipa` behåller gränser mellan fraser och språk och bevarar radbrytningar. `segments` innehåller delar av källtexten och uppgift om deras språk. Matchande IPA-avgränsare har `delimiter: true`.
- Uttal som inte kunde fastställas visas som □ och finns i `unresolved`. `unknownPhones`, `unpairedDelimiters` och `unavailableSources` visar IPA-tecken som inte stöds, omatchade avgränsare och otillgängliga uttalsresurser. Koreansk romanisering finns i `romanization`.

<details>
<summary>Språk-ID, visningsnamn, skriftsystem och varianter som stöds</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Bygg lokalt

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Kräver Node.js 22 eller senare. Behåll samma relativa placering för `dist/` och `assets/` vid egen drift. Omvandlingen görs i webbläsaren, som hämtar ordboks- och motorfiler första gången de används.

Toner, betoningar och ljud kan återges ungefärligt eller utelämnas beroende på vad målskriften kan uttrycka.

## Källor och licenser

Projektet bygger på IPA-Translator. Koden omfattas av GPL-3.0. Medföljande ordböcker och modeller behåller sina egna licenser.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Källor och licenser](../../NOTICE.md) · [`licenses/`](../../licenses/)
