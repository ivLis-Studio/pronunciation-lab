# Pronunciation Lab

**Andika sauti za lugha moja kwa kutumia hati ya lugha nyingine.**

Lugha chanzo 25 · Mielekeo 600 ya ubadilishaji · Moduli ya ES ya kivinjari

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · **Kiswahili** · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Kibadilishaji cha Matamshi](https://ivlis-studio.github.io/pronunciation-lab/?lang=sw) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Vyanzo na leseni](../../NOTICE.md)

## Jinsi ya kuanza

Neno la Kijapani **猫** linaweza kuandikwa kwa Hangul kama **네코**, na salamu ya Kikorea **안녕하세요** kwa katakana kama **アンニョンハセヨ**. Kifaa husoma maandishi kwa Alfabeti ya Kifonetiki ya Kimataifa (IPA) halafu huandika sauti hizo kulingana na desturi za lugha lengwa.

Bandika msimbo huu katika ukurasa wa HTML. Anwani ya jsDelivr inaelekeza kwenye toleo mahususi la msimbo chanzo na haihitaji ufunguo wa API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API ya JavaScript

| Kitendakazi | Hurejesha |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Uandishi wa matamshi katika lugha lengwa iliyochaguliwa |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA na miandiko ya matamshi ya lugha lengwa 24 katika `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, vipande vya maandishi asili, yasiyotambuliwa na maelezo ya uchunguzi |
| `languages` | Vitambulisho, majina ya kuonyesha, hati na lahaja za lugha zinazotumika |

### Ingiza IPA moja kwa moja

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Tumia vitambulisho tofauti vya lugha katika `source` na `target`. Thamani chaguo-msingi ya `mode` ni `'text'`. Tumia `'ipa'` kuingiza IPA moja kwa moja.
- Tumia `variant` kuchagua aina ya lugha chanzo kama `'US'` au `'UK'` kwa Kiingereza. Chaguo zinapatikana katika `languages`.
- Weka `readNumbers` kuwa `true` ili kusoma namba kamili zinazotumika kama namba za kuhesabu za lugha chanzo.
- `ipa` huhifadhi mipaka ya virai na lugha, pamoja na mikatiko ya mistari. `segments` ina vipande vya maandishi asili na lugha zake. Alama za IPA zenye jozi hupewa `delimiter: true`.
- Matamshi yasiyotambuliwa yanaonyeshwa kwa □ na kuorodheshwa katika `unresolved`. `unknownPhones`, `unpairedDelimiters` na `unavailableSources` huonyesha alama za IPA zisizotumika, alama zisizo na jozi na nyenzo za matamshi ambazo hazikupatikana. Uandishi wa Kikorea kwa herufi za Kilatini upo katika `romanization`.

<details>
<summary>Vitambulisho, majina ya kuonyesha, hati na lahaja za lugha zinazotumika</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Jenga kwenye kompyuta yako

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 au toleo jipya zaidi linahitajika. Ukihifadhi tovuti mwenyewe, tunza mpangilio wa jamaa wa `dist/` na `assets/`. Ubadilishaji hufanyika katika kivinjari, na faili za kamusi na injini hupakuliwa zinapohitajika mara ya kwanza.

Toni, mikazo na sauti zinaweza kukadiriwa au kuachwa kulingana na uwezo wa hati ya lugha lengwa.

## Vyanzo na leseni

Mradi huu unatokana na IPA-Translator. Msimbo una leseni ya GPL-3.0. Kamusi na miundo iliyojumuishwa inaendelea kutumia leseni zake.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Vyanzo na leseni](../../NOTICE.md) · [`licenses/`](../../licenses/)
