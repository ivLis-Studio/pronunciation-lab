# Pronunciation Lab

**ある言語の音を、別の文字で読める形に。**

入力25言語 · 600の変換方向 · ブラウザ用ESモジュール

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · **日本語** · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[発音表記変換ツール](https://ivlis-studio.github.io/pronunciation-lab/?lang=ja) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [出典とライセンス](../../NOTICE.md)

## 使い方

日本語の **猫** をハングルで **네코**、韓国語の **안녕하세요** をカタカナで **アンニョンハセヨ** と表記できます。原文を国際音声記号（IPA）に変換し、出力言語の表記に合わせて書き直します。

次のコードをHTMLに貼り付けてください。jsDelivrのURLは特定のコミットに固定されており、APIキーは不要です。

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| 関数 | 戻り値 |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · 指定した出力言語での発音表記 |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPAと`outputs`に入った24言語の表記 |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA、原文の区間、未解決の項目、診断情報 |
| `languages` | 対応言語のID、表示名、文字体系、地域差 |

### IPAを直接入力

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- `source`と`target`には異なる言語IDを指定します。`mode`の既定値は`'text'`で、IPAを直接入力する場合は`'ipa'`を指定します。
- `variant`で入力言語の地域差を指定します。英語なら`'US'`や`'UK'`です。選択肢は`languages`で確認できます。
- `readNumbers`を`true`にすると、対応する整数を入力言語の基数として読みます。
- `ipa`は句や言語の境界、改行を保持します。`segments`には原文の各区間と言語が入ります。対になるIPA区切りには`delimiter: true`が付きます。
- 読み方が不明な箇所は□で表示し、`unresolved`に記録します。`unknownPhones`、`unpairedDelimiters`、`unavailableSources`は未対応記号、対にならない区切り、読み込めなかった読みの資料を示します。韓国語のローマ字表記は`romanization`に入ります。

<details>
<summary>対応言語のID、表示名、文字体系、地域差</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## ローカルでビルド

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22以降が必要です。自分で配信する場合は`dist/`と`assets/`の相対位置を保ってください。変換はブラウザ内で実行され、辞書とエンジンは初回利用時に取得されます。

出力先の文字で表現できる範囲に応じて、声調・強勢・音素は近似または省略されます。

## 出典とライセンス

このプロジェクトはIPA-Translatorを基にしています。コードはGPL-3.0で、同梱の辞書とモデルにはそれぞれのライセンスが適用されます。

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [出典とライセンス](../../NOTICE.md) · [`licenses/`](../../licenses/)
