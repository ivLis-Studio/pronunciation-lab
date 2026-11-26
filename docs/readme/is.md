# Pronunciation Lab

**Skrifaðu hljóð eins tungumáls með letri annars.**

25 upprunatungumál · 600 umbreytingarstefnur · ES-eining fyrir vafra

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · **Íslenska** · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Framburðarbreytir](https://ivlis-studio.github.io/pronunciation-lab/?lang=is) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Heimildir og leyfi](../../NOTICE.md)

## Hafist handa

Japanska orðið **猫** má skrifa **네코** með hangul og kóresku kveðjuna **안녕하세요** sem **アンニョンハセヨ** með katakana. Forritið les textann fyrst í alþjóðlega hljóðstafrófinu (IPA) og skrifar hann síðan eftir venjum markmálsins.

Límdu kóðann inn á HTML-síðu. jsDelivr-slóðin vísar á fasta útgáfu frumkóðans og þarf engan API-lykil.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-viðmót

| Fall | Skilar |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Framburðarritun á völdu markmáli |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA og framburðarritun fyrir 24 markmál í `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, bútar úr frumtexta, óleyst atriði og greiningarupplýsingar |
| `languages` | Auðkenni, heiti, letur og afbrigði studdra tungumála |

### Sláðu inn IPA beint

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Notaðu mismunandi tungumálaauðkenni fyrir `source` og `target`. Sjálfgefið `mode` er `'text'`. Notaðu `'ipa'` fyrir beinan IPA-innslátt.
- Veldu afbrigði upprunatungumáls með `variant`, til dæmis `'US'` eða `'UK'` fyrir ensku. Skoðaðu valkostina í `languages`.
- Stilltu `readNumbers` á `true` til að lesa studdar heiltölur sem frumtölur á upprunatungumálinu.
- `ipa` varðveitir skil milli orðasambanda og tungumála ásamt línuskilum. `segments` geymir textabúta og tungumál þeirra. Pöruð IPA-afmörkunartákn bera `delimiter: true`.
- Óþekktur framburður birtist sem □ og er skráður í `unresolved`. `unknownPhones`, `unpairedDelimiters` og `unavailableSources` sýna óstudd IPA-tákn, ópöruð afmörkunartákn og framburðargögn sem vantar. Rómönsk umritun kóresku er í `romanization`.

<details>
<summary>Auðkenni, heiti, letur og afbrigði studdra tungumála</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Byggðu á eigin tölvu

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 eða nýrra er nauðsynlegt. Við eigin hýsingu skaltu halda óbreyttri innbyrðis staðsetningu `dist/` og `assets/`. Umbreytingin fer fram í vafranum og skrár fyrir orðabækur og vél eru sóttar við fyrstu notkun.

Tónar, áhersla og hljóð kunna að vera nálguð eða falla brott eftir því hvað markletrið getur sýnt.

## Heimildir og leyfi

Verkefnið byggir á IPA-Translator. Kóðinn er undir GPL-3.0. Orðabækur og líkön halda sínum eigin leyfum.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Heimildir og leyfi](../../NOTICE.md) · [`licenses/`](../../licenses/)
