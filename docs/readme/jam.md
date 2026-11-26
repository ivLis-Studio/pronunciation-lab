# Pronunciation Lab

**Rait di sound a wan langwij wid di leta dem a wan neda langwij.**

25 langwij fi staat fram · 600 wie fi chienj di raitin · ES majul fi brouza

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · **Jumiekan** · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Tuul fi rait out sound](https://ivlis-studio.github.io/pronunciation-lab/?lang=jam) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Suos an laisens](../../NOTICE.md)

## Staat ya

Yu kyan rait di Japaniiz wod **猫** az **네코** ina Hangul, an di Korian griitin **안녕하세요** az **アンニョンハセヨ** ina katakana. Di tuul riid di teks ina di Intanashinal Fonetik Alfabet (IPA), den rait di sound fi di langwij yu pik.

Put di kuod ya ina wan HTML piej. Di jsDelivr lingk gu tu wan set vorshan a di kuod. Yu no niid no API kii.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| Fonkshan | Wa yu get bak |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Ou fi rait di sound ina di langwij yu pik |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA an di sound-raitin fi 24 langwij ina `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, piis a di teks, wod di tuul neva fain an infamieshan bout di prablem |
| `languages` | Langwij ID, niem, raitin sistim an di difran varaiati |

### Put IPA in dairek

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Yuuz difran langwij ID fi `source` an `target`. `mode` staat wid `'text'`. Yuuz `'ipa'` fi put IPA in dairek.
- Yuuz `variant` fi pik wan varaiati, laik `'US'` ar `'UK'` fi Inglish. Luk ina `languages` fi si wa yu kyan pik.
- Set `readNumbers` tu `true` mek dem riid di uol nomba dem ou piipl kount ina di langwij weh di teks kom fram.
- `ipa` kiip di brek bitwiin fraiz an langwij, an di nyuu lain dem. `segments` av piis a di arijinal teks an di langwij fi iich piis. Di IPA sain dem weh maach av `delimiter: true`.
- Wod di tuul neva fain ou fi se shuo az □ an de ina `unresolved`. `unknownPhones` shuo IPA di tuul cyaan riid, `unpairedDelimiters` shuo sain we no maach an `unavailableSources` shuo riidin fail di tuul neva get. Korian ina Ruoman leta de ina `romanization`.

<details>
<summary>Langwij ID, niem, raitin sistim an di difran varaiati</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Bild it pan yu kompyuuta

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Yu niid Node.js 22 ar nyuuwa. If yu huos it yuself, lef `dist/` an `assets/` ina di siem plies wid wan aneda. Di brouza du di wok an get di dikshaneri an enjin fail wen it niid dem di fos taim.

Di raitin sistim huol az moch a di tuon, stres an sound az it kyan. Som a dem wi kom niir ar lef out.

## Suos an laisens

Di prajek staat fram IPA-Translator. Di kuod yuuz GPL-3.0. Di dikshaneri an madl dem weh kom wid it kiip dem uon laisens.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Suos an laisens](../../NOTICE.md) · [`licenses/`](../../licenses/)
