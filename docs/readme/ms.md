# Pronunciation Lab

**Tulis bunyi sesuatu bahasa dengan tulisan bahasa lain.**

25 bahasa sumber · 600 arah penukaran · Modul ES untuk pelayar

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · **Bahasa Melayu** · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Penukar Sebutan](https://ivlis-studio.github.io/pronunciation-lab/?lang=ms) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Sumber dan lesen](../../NOTICE.md)

## Mula di sini

Perkataan Jepun **猫** boleh ditulis sebagai **네코** dalam Hangul, manakala ucapan Korea **안녕하세요** boleh ditulis sebagai **アンニョンハセヨ** dalam katakana. Alat ini membaca teks menggunakan Abjad Fonetik Antarabangsa (IPA), kemudian menulis semula bunyinya mengikut kelaziman bahasa sasaran.

Tampal kod ini pada halaman HTML. URL jsDelivr merujuk kepada versi kod tertentu dan tidak memerlukan kunci API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API JavaScript

| Fungsi | Hasil |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Ejaan sebutan dalam bahasa sasaran yang dipilih |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA dan ejaan sebutan untuk 24 bahasa sasaran dalam `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, bahagian teks sumber, perkara yang belum diselesaikan dan maklumat diagnostik |
| `languages` | ID, nama paparan, sistem tulisan dan variasi bahasa yang disokong |

### Masukkan IPA secara terus

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Gunakan ID bahasa yang berbeza untuk `source` dan `target`. Nilai lalai `mode` ialah `'text'`. Gunakan `'ipa'` untuk memasukkan IPA terus.
- Gunakan `variant` untuk memilih variasi bahasa sumber, seperti `'US'` atau `'UK'` bagi bahasa Inggeris. Rujuk `languages` untuk pilihan.
- Tetapkan `readNumbers` kepada `true` untuk membaca nombor bulat yang disokong sebagai nombor kardinal dalam bahasa sumber.
- `ipa` mengekalkan batas frasa dan bahasa serta baris baharu. `segments` mengandungi bahagian teks asal dan bahasa setiap bahagian. Tanda pembatas IPA yang berpasangan mempunyai `delimiter: true`.
- Sebutan yang tidak dikenal pasti dipaparkan sebagai □ dan disenaraikan dalam `unresolved`. `unknownPhones`, `unpairedDelimiters` dan `unavailableSources` menunjukkan simbol IPA yang tidak disokong, pembatas yang tidak berpasangan dan sumber sebutan yang tiada. Perumian bahasa Korea terdapat dalam `romanization`.

<details>
<summary>ID, nama paparan, sistem tulisan dan variasi bahasa yang disokong</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Bina pada komputer sendiri

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 atau versi lebih baharu diperlukan. Untuk pengehosan sendiri, kekalkan kedudukan relatif `dist/` dan `assets/`. Penukaran berlaku dalam pelayar dan fail kamus serta enjin dimuat turun ketika mula diperlukan.

Nada, tekanan dan bunyi boleh dianggarkan atau digugurkan mengikut keupayaan sistem tulisan sasaran.

## Sumber dan lesen

Projek ini berasaskan IPA-Translator. Kod menggunakan GPL-3.0 dan kamus serta model yang disertakan mengekalkan lesen masing-masing.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Sumber dan lesen](../../NOTICE.md) · [`licenses/`](../../licenses/)
