# Pronunciation Lab

**把一种语言的声音写成另一种文字。**

25 种源语言 · 600 种转换方向 · 浏览器 ES 模块

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · **普通话（简体）** · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[读音转写工具](https://ivlis-studio.github.io/pronunciation-lab/?lang=zh-Hans) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [来源与许可证](../../NOTICE.md)

## 快速开始

日语 **猫** 可用韩文写作 **네코**，韩语 **안녕하세요** 可用片假名写作 **アンニョンハセヨ**。工具先将原文转成国际音标（IPA），再按目标语言的书写习惯转写。

把下面的代码放入 HTML 页面。jsDelivr 链接固定到一个源码提交，无需 API 密钥。

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| 函数 | 返回值 |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · 所选目标语言的读音转写 |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA 与 `outputs` 中的 24 种目标转写 |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA、原文片段、未确定项目和诊断信息 |
| `languages` | 支持的语言 ID、显示名称、文字和区域选项 |

### 直接输入 IPA

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- `source` 和 `target` 使用不同的语言 ID。`mode` 默认为 `'text'`。直接输入 IPA 时使用 `'ipa'`。
- `variant` 用来选择源语言的地区变体，例如英语的 `'US'` 和 `'UK'`。可用选项见 `languages`。
- 将 `readNumbers` 设为 `true`，可按源语言的基数词读出支持的整数。
- `ipa` 保留短语和语言边界以及换行。`segments` 包含原文片段及其语言。配对的 IPA 界定符带有 `delimiter: true`。
- 未确定的读音显示为 □，并列在 `unresolved` 中。`unknownPhones`、`unpairedDelimiters` 和 `unavailableSources` 分别表示不支持的音标、未配对的界定符和未加载的读音资源。韩语罗马字转写见 `romanization`。

<details>
<summary>支持的语言 ID、显示名称、文字和区域选项</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## 本地构建

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

需要 Node.js 22 或更高版本。自行托管时请保持 `dist/` 和 `assets/` 的相对位置。转换在浏览器内进行，词典和引擎文件在首次使用时获取。

视目标文字的表达能力，声调、重音和音位可能以近似方式标注或省略。

## 来源与许可证

本项目基于 IPA-Translator。代码采用 GPL-3.0，随附的词典和模型沿用各自的许可证。

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [来源与许可证](../../NOTICE.md) · [`licenses/`](../../licenses/)
