# Pronunciation Lab

**Write the sounds of one language in another script.**

25 source languages · 600 conversion directions · Browser ES module

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · **English** · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Pronunciation Lab](https://ivlis-studio.github.io/pronunciation-lab/?lang=en) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Credits and licenses](../../NOTICE.md)

## Get started

Write Japanese **猫** as **네코** in Hangul, or Korean **안녕하세요** as **アンニョンハセヨ** in katakana. The converter reads the source into International Phonetic Alphabet (IPA) and respells it using the target language’s conventions.

Paste this into an HTML page. The jsDelivr URL is pinned to a source commit and requires no API key.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| Function | Returns |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Pronunciation spelling in the selected `target` language |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA and 24 `target` spellings in `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, `source` `segments`, `unresolved` items and diagnostics |
| `languages` | Supported language IDs, display names, scripts and variants |

### Pass IPA directly

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Use different language IDs for `source` and `target`. The default `mode` is `'text'`. Use `'ipa'` for direct IPA input.
- Use `variant` to select a `source` variety, such as `'US'` or `'UK'` for English. See `languages` for the available variants.
- Set `readNumbers` to `true` to read supported integers as cardinal numbers in the `source` language.
- The `ipa` field preserves phrase and language boundaries and line breaks. The `segments` field contains `source` spans and their `languages`. Matched IPA delimiters have `delimiter: true`.
- Unresolved readings appear as □ and are listed in `unresolved`. The fields `unknownPhones`, `unpairedDelimiters` and `unavailableSources` report unsupported IPA, unmatched delimiters and missing reading resources. Korean `romanization` appears in `romanization`.

<details>
<summary>Supported language IDs, display names, scripts and variants</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Build locally

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Requires Node.js 22 or later. Keep `dist/` and `assets/` in the same relative locations when self-hosting. Conversion runs in the browser and fetches dictionaries and engine files on first use.

Tones, stress and sounds may be approximated or omitted depending on what the target script can represent.

## Credits and licenses

This project starts from IPA-Translator. The code is GPL-3.0 and bundled dictionaries and models retain their own licenses.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Credits and licenses](../../NOTICE.md) · [`licenses/`](../../licenses/)
