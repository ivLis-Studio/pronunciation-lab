# Pronunciation Lab

**Scrie sunetele unei limbi cu sistemul de scriere al alteia.**

25 de limbi sursă · 600 de direcții de conversie · Modul ES pentru browser

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · **Română** · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Convertor de pronunție](https://ivlis-studio.github.io/pronunciation-lab/?lang=ro) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Surse și licențe](../../NOTICE.md)

## Primii pași

Cuvântul japonez **猫** poate fi scris în hangul ca **네코**, iar salutul coreean **안녕하세요** în katakana, ca **アンニョンハセヨ**. Instrumentul citește mai întâi textul în Alfabetul Fonetic Internațional (IPA), apoi îl rescrie după convențiile limbii țintă.

Lipește codul într-o pagină HTML. Adresa jsDelivr este fixată la o anumită versiune a codului și nu este nevoie de o cheie API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API JavaScript

| Funcție | Rezultat |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Transcrierea pronunției în limba țintă aleasă |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA și 24 de transcrieri țintă în `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, segmente din original, elemente nerezolvate și informații de diagnostic |
| `languages` | Identificatori, nume de afișare, sisteme de scriere și variante acceptate |

### Introducere directă în IPA

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Folosește identificatori de limbă diferiți pentru `source` și `target`. Valoarea implicită pentru `mode` este `'text'`. Pentru introducere directă în IPA, folosește `'ipa'`.
- Alege o `variant`ă a limbii sursă cu `variant`, de exemplu `'US'` sau `'UK'` pentru engleză. Consultă `languages` pentru toate opțiunile.
- Setează `readNumbers` la `true` pentru a citi numerele întregi acceptate ca numerale cardinale în limba sursă.
- `ipa` păstrează limitele dintre grupuri și limbi și trecerile la rând nou. `segments` conține fragmentele din original și limbile lor. Delimitatorii IPA cu pereche poartă `delimiter: true`.
- Pronunțiile nerezolvate apar ca □ și sunt listate în `unresolved`. `unknownPhones`, `unpairedDelimiters` și `unavailableSources` semnalează simbolurile neacceptate, delimitatorii fără pereche și resursele indisponibile. Romanizarea coreenei apare în `romanization`.

<details>
<summary>Identificatori, nume de afișare, sisteme de scriere și variante acceptate</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Compilare locală

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Este necesar Node.js 22 sau o versiune mai nouă. Dacă găzduiești proiectul pe cont propriu, păstrează pozițiile relative ale folderelor `dist/` și `assets/`. Conversia rulează în browser și fișierele necesare se descarcă la prima utilizare.

Tonurile, accentele și sunetele pot fi redate aproximativ sau omise, în funcție de sistemul de scriere țintă.

## Surse și licențe

Proiectul pornește de la IPA-Translator. Codul este sub licența GPL-3.0, iar dicționarele și modelele păstrează licențele lor.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Surse și licențe](../../NOTICE.md) · [`licenses/`](../../licenses/)
