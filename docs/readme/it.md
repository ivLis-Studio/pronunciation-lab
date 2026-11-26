# Pronunciation Lab

**Scrivi i suoni di una lingua con un altro sistema di scrittura.**

25 lingue di partenza · 600 direzioni di conversione · Modulo ES per il browser

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · **Italiano** · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Convertitore di pronuncia](https://ivlis-studio.github.io/pronunciation-lab/?lang=it) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Fonti e licenze](../../NOTICE.md)

## Per iniziare

La parola giapponese **猫** può essere scritta in hangul come **네코** e il saluto coreano **안녕하세요** in katakana come **アンニョンハセヨ**. Lo strumento legge il testo nell’alfabeto fonetico internazionale (IPA) e lo riscrive secondo le convenzioni della lingua di arrivo.

Incolla il codice in una pagina HTML. L’URL di jsDelivr punta a una revisione specifica del codice e non richiede chiavi API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API JavaScript

| Funzione | Restituisce |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Trascrizione della pronuncia nella lingua di arrivo scelta |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA e 24 trascrizioni di arrivo in `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, segmenti del testo di partenza, elementi non risolti e dati diagnostici |
| `languages` | Identificatori, nomi visualizzati, scritture e varianti supportate |

### Inserimento diretto dell’IPA

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Usa identificatori di lingua diversi per `source` e `target`. Il valore predefinito di `mode` è `'text'`. Usa `'ipa'` per inserire direttamente i simboli IPA.
- Usa `variant` per selezionare una varietà della lingua di partenza, per esempio `'US'` o `'UK'` per l’inglese. Le opzioni sono in `languages`.
- Imposta `readNumbers` su `true` per leggere gli interi supportati come numeri cardinali nella lingua di partenza.
- `ipa` conserva i confini tra gruppi e lingue e le interruzioni di riga. `segments` contiene i segmenti di partenza e le rispettive lingue. I delimitatori IPA appaiati hanno `delimiter: true`.
- Le letture non risolte compaiono come □ e sono elencate in `unresolved`. `unknownPhones`, `unpairedDelimiters` e `unavailableSources` segnalano simboli non supportati, delimitatori non appaiati e risorse non disponibili. La romanizzazione del coreano è in `romanization`.

<details>
<summary>Identificatori, nomi visualizzati, scritture e varianti supportate</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Compilazione locale

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Serve Node.js 22 o successivo. Per ospitare il progetto in proprio, mantieni le posizioni relative di `dist/` e `assets/`. La conversione avviene nel browser, che carica i file dei dizionari e del motore al primo utilizzo.

Toni, accenti e suoni possono essere approssimati o omessi a seconda delle possibilità della scrittura di arrivo.

## Fonti e licenze

Il progetto parte da IPA-Translator. Il codice è distribuito con licenza GPL-3.0. I dizionari e i modelli inclusi mantengono le proprie licenze.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Fonti e licenze](../../NOTICE.md) · [`licenses/`](../../licenses/)
