# Pronunciation Lab

**將一種語言嘅聲音，用另一種文字寫出嚟。**

25 種原本語言 · 600 種轉換方向 · 瀏覽器 ES 模組

[العربية](./ar.md) · **廣東話** · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[讀音轉寫工具](https://ivlis-studio.github.io/pronunciation-lab/?lang=yue-Hant) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [出處同授權](../../NOTICE.md)

## 點用

日文 **猫** 可以用韓文寫做 **네코**，韓文 **안녕하세요** 可以用片假名寫做 **アンニョンハセヨ**。工具先將原文轉做國際音標（IPA），再跟目標語言嘅習慣轉寫。

將以下程式碼放入 HTML 頁面。jsDelivr 連結鎖定咗特定嘅程式碼版本，唔使 API 金鑰。

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| 函式 | 回傳內容 |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · 揀咗嘅目標語言讀音轉寫 |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA 同 `outputs` 入面嘅 24 種目標轉寫 |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA、原文片段、未確定嘅項目同診斷資料 |
| `languages` | 支援嘅語言 ID、顯示名、文字同地區變體 |

### 直接輸入 IPA

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- `source` 同 `target` 要用兩個唔同嘅語言 ID。`mode` 預設係 `'text'`，直接入 IPA 就揀 `'ipa'`。
- 用 `variant` 揀原本語言嘅地區變體，例如英文嘅 `'US'` 同 `'UK'`。可以喺 `languages` 睇完整選項。
- 將 `readNumbers` 設做 `true`，就會用原本語言嘅基數詞讀出支援嘅整數。
- `ipa` 會保留短語同語言嘅界線同換行。`segments` 包括原文片段同片段嘅語言。成對嘅 IPA 括號或斜線有 `delimiter: true`。
- 未確定嘅讀法會顯示做 □，並列喺 `unresolved`。`unknownPhones`、`unpairedDelimiters` 同 `unavailableSources` 會話你知未支援嘅音標、未配對嘅界定符同載入唔到嘅語音資料。韓文羅馬字喺 `romanization`。

<details>
<summary>支援嘅語言 ID、顯示名、文字同地區變體</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## 喺本機建置

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

需要 Node.js 22 或以上。自行寄存嗰陣，請保持 `dist/` 同 `assets/` 嘅相對位置。轉換喺瀏覽器入面執行，第一次用先下載需要嘅字典同引擎。

視乎目標文字嘅表達能力，聲調、重音同音素可能只可以近似標示，或者要省略。

## 出處同授權

呢個專案由 IPA-Translator 發展出嚟。程式碼用 GPL-3.0，附帶嘅字典同模型保留各自授權。

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [出處同授權](../../NOTICE.md) · [`licenses/`](../../licenses/)
