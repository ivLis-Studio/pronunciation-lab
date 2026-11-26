# Pronunciation Lab

**Schreibe die Laute einer Sprache in einer anderen Schrift.**

25 Ausgangssprachen · 600 Umwandlungsrichtungen · ES-Modul für den Browser

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · **Deutsch** · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Aussprache-Konverter](https://ivlis-studio.github.io/pronunciation-lab/?lang=de) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Quellen und Lizenzen](../../NOTICE.md)

## Erste Schritte

Das japanische **猫** lässt sich als **네코** in Hangeul schreiben, der koreanische Gruß **안녕하세요** als **アンニョンハセヨ** in Katakana. Das Werkzeug liest den Ausgangstext im Internationalen Phonetischen Alphabet (IPA) und schreibt ihn nach den Konventionen der Zielsprache um.

Füge den Code in eine HTML-Seite ein. Die jsDelivr-Adresse verweist auf einen bestimmten Commit. Ein API-Schlüssel ist nicht erforderlich.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript-API

| Funktion | Rückgabe |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Ausspracheschreibweise in der gewählten Zielsprache |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA und die Schreibweisen für 24 Zielsprachen in `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, Abschnitte des Ausgangstexts, ungeklärte Stellen und Diagnoseinformationen |
| `languages` | Kennungen, Anzeigenamen, Schriften und Varianten der unterstützten Sprachen |

### IPA direkt eingeben

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Verwende unterschiedliche Sprachkennungen für `source` und `target`. Der Standardwert für `mode` ist `'text'`. Für die direkte IPA-Eingabe verwende `'ipa'`.
- Wähle mit `variant` eine Varietät der Ausgangssprache, etwa `'US'` oder `'UK'` für Englisch. Die verfügbaren Varianten stehen in `languages`.
- Setze `readNumbers` auf `true`, um unterstützte ganze Zahlen als Kardinalzahlen der Ausgangssprache zu lesen.
- `ipa` bewahrt Phrasen- und Sprachgrenzen sowie Zeilenumbrüche. `segments` enthält Abschnitte des Ausgangstexts mit ihrer Sprache. Zusammengehörige IPA-Begrenzungszeichen tragen `delimiter: true`.
- Nicht bestimmte Lesarten erscheinen als □ und stehen in `unresolved`. `unknownPhones`, `unpairedDelimiters` und `unavailableSources` melden nicht unterstützte IPA-Zeichen, fehlende Gegenstücke und nicht verfügbare Lesedaten. Die koreanische Umschrift steht in `romanization`.

<details>
<summary>Kennungen, Anzeigenamen, Schriften und Varianten der unterstützten Sprachen</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Lokal bauen

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Voraussetzung ist Node.js 22 oder neuer. Beim eigenen Hosting müssen `dist/` und `assets/` ihre relative Lage behalten. Die Umwandlung läuft im Browser und lädt Wörterbücher und Aussprache-Engine bei der ersten Verwendung.

Je nach Zielschrift werden Töne, Betonungen und Laute angenähert oder weggelassen.

## Quellen und Lizenzen

Das Projekt baut auf IPA-Translator auf. Der Code steht unter GPL-3.0. Mitgelieferte Wörterbücher und Modelle behalten ihre eigenen Lizenzen.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Quellen und Lizenzen](../../NOTICE.md) · [`licenses/`](../../licenses/)
