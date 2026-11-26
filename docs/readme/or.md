# Pronunciation Lab

**ଗୋଟିଏ ଭାଷାର ଧ୍ୱନିକୁ ଅନ୍ୟ ଭାଷାର ଲିପିରେ ଲେଖନ୍ତୁ।**

୨୫ଟି ମୂଳ ଭାଷା · ରୂପାନ୍ତରର ୬୦୦ଟି ଦିଗ · ବ୍ରାଉଜର ES ମଡ୍ୟୁଲ୍

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · **ଓଡ଼ିଆ** · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[ଉଚ୍ଚାରଣ ଲେଖନ ଉପକରଣ](https://ivlis-studio.github.io/pronunciation-lab/?lang=or) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [ଉତ୍ସ ଓ ଲାଇସେନ୍ସ](../../NOTICE.md)

## ଆରମ୍ଭ କରନ୍ତୁ

ଜାପାନୀ **猫**କୁ ହାଙ୍ଗୁଲରେ **네코** ଓ କୋରୀୟ **안녕하세요**କୁ କାଟାକାନାରେ **アンニョンハセヨ** ଲେଖିହେବ। ଉପକରଣଟି ମୂଳ ପାଠକୁ ଆନ୍ତର୍ଜାତୀୟ ଧ୍ୱନିମୂଳକ ବର୍ଣ୍ଣମାଳା (IPA)ରେ ପଢ଼ି ଲକ୍ଷ୍ୟ ଭାଷାର ପ୍ରଚଳିତ ଶୈଳୀରେ ପୁଣି ଲେଖେ।

ନିମ୍ନର କୋଡ୍‌କୁ ଏକ HTML ପୃଷ୍ଠାରେ ରଖନ୍ତୁ। jsDelivr ଲିଙ୍କଟି କୋଡର ଏକ ନିର୍ଦ୍ଦିଷ୍ଟ ସଂସ୍କରଣକୁ ଦର୍ଶାଏ। API ଚାବି ଦରକାର ନାହିଁ।

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| ଫଙ୍କସନ୍ | ଫେରୁଥିବା ଫଳ |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · ବଛା ଲକ୍ଷ୍ୟ ଭାଷାରେ ଉଚ୍ଚାରଣ ଲେଖନ |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA ଓ `outputs`ରେ ୨୪ଟି ଲକ୍ଷ୍ୟ ଭାଷାର ଉଚ୍ଚାରଣ |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, ମୂଳ ପାଠର ଖଣ୍ଡ, ଅନିର୍ଦ୍ଧାରିତ ଅଂଶ ଓ ନିଦାନ ସୂଚନା |
| `languages` | ସମର୍ଥିତ ଭାଷା ID, ପ୍ରଦର୍ଶନ ନାମ, ଲିପି ଓ ଆଞ୍ଚଳିକ ରୂପ |

### IPA ସିଧାସଳଖ ଦିଅନ୍ତୁ

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- `source` ଓ `target` ପାଇଁ ଦୁଇଟି ଭିନ୍ନ ଭାଷା ID ଦିଅନ୍ତୁ। `mode`ର ଡିଫଲ୍ଟ `'text'`। ସିଧା IPA ପାଇଁ `'ipa'` ଦିଅନ୍ତୁ।
- `variant` ଦ୍ୱାରା ମୂଳ ଭାଷାର ଆଞ୍ଚଳିକ ରୂପ ବାଛନ୍ତୁ, ଯଥା ଇଂରାଜୀ ପାଇଁ `'US'` ବା `'UK'`। ବିକଳ୍ପ ପାଇଁ `languages` ଦେଖନ୍ତୁ।
- ମୂଳ ଭାଷାର ଗଣନାବାଚକ ରୂପରେ ସମର୍ଥିତ ପୂର୍ଣ୍ଣ ସଂଖ୍ୟା ପଢ଼ିବାକୁ `readNumbers`କୁ `true` କରନ୍ତୁ।
- `ipa` ବାକ୍ୟାଂଶ ଓ ଭାଷା ସୀମା ତଥା ଧାଡ଼ି ବିଭାଜନକୁ ରଖେ। `segments`ରେ ମୂଳ ପାଠର ଖଣ୍ଡ ଓ ସେଗୁଡ଼ିକର ଭାଷା ରହେ। ଯୋଡ଼ି ଥିବା IPA ଚିହ୍ନରେ `delimiter: true` ରହେ।
- ଅନିର୍ଦ୍ଧାରିତ ଉଚ୍ଚାରଣ □ ଭାବେ ଦିଶେ ଓ `unresolved`ରେ ରହେ। `unknownPhones`ରେ ଅସମର୍ଥିତ IPA, `unpairedDelimiters`ରେ ଯୋଡ଼ି ନଥିବା ଚିହ୍ନ ଓ `unavailableSources`ରେ ନମିଳିଥିବା ଉଚ୍ଚାରଣ ସାଧନ ଥାଏ। କୋରୀୟର ରୋମାନ ଲିପ୍ୟନ୍ତର `romanization`ରେ ରହେ।

<details>
<summary>ସମର୍ଥିତ ଭାଷା ID, ପ୍ରଦର୍ଶନ ନାମ, ଲିପି ଓ ଆଞ୍ଚଳିକ ରୂପ</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## ନିଜ କମ୍ପ୍ୟୁଟରରେ ବିଲ୍ଡ

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 ବା ନୂଆ ସଂସ୍କରଣ ଦରକାର। ନିଜ ସର୍ଭରରେ `dist/` ଓ `assets/`ର ଆପେକ୍ଷିକ ସ୍ଥାନ ରଖନ୍ତୁ। ବ୍ରାଉଜର ରୂପାନ୍ତର କରେ ଏବଂ ପ୍ରଥମ ବ୍ୟବହାରରେ ଅଭିଧାନ ଓ ଇଞ୍ଜିନ୍ ଫାଇଲ୍ ଆଣେ।

ଲକ୍ଷ୍ୟ ଲିପିରେ ଯେତିକି ସମ୍ଭବ ସେହି ଅନୁସାରେ ସ୍ୱରଭଙ୍ଗୀ, ଜୋର ଓ ଧ୍ୱନିକୁ ଆନୁମାନିକ ଭାବେ ଲେଖାଯାଇପାରେ ବା ଛାଡ଼ିଦିଆଯାଇପାରେ।

## ଉତ୍ସ ଓ ଲାଇସେନ୍ସ

ଏହି ପ୍ରକଳ୍ପ IPA-Translator ଉପରେ ଆଧାରିତ। କୋଡ୍ GPL-3.0 ଅଧୀନରେ ଅଛି। ସଂଲଗ୍ନ ଅଭିଧାନ ଓ ମଡେଲର ନିଜ ନିଜ ଲାଇସେନ୍ସ ରହେ।

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [ଉତ୍ସ ଓ ଲାଇସେନ୍ସ](../../NOTICE.md) · [`licenses/`](../../licenses/)
