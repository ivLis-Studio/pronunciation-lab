# Pronunciation Lab

**សរសេរសំឡេងភាសាមួយដោយប្រើអក្សរនៃភាសាមួយទៀត។**

២៥ ភាសាប្រភព · ៦០០ ទិសដៅបម្លែង · ម៉ូឌុល ES សម្រាប់កម្មវិធីរុករក

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · **ភាសាខ្មែរ** · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[ឧបករណ៍សរសេរសំឡេង](https://ivlis-studio.github.io/pronunciation-lab/?lang=km) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [ប្រភព និងអាជ្ញាបណ្ណ](../../NOTICE.md)

## ចាប់ផ្តើម

ពាក្យជប៉ុន **猫** អាចសរសេរជាអក្សរហាន់ហ្គឹលថា **네코** ហើយពាក្យសួស្តីកូរ៉េ **안녕하세요** អាចសរសេរជាកាតាកាណាថា **アンニョンハセヨ**។ ឧបករណ៍បម្លែងអត្ថបទប្រភពទៅជាអក្ខរក្រមសូរសព្ទអន្តរជាតិ (IPA) មុននឹងសរសេរតាមរបៀបរបស់ភាសាគោលដៅ។

ដាក់កូដខាងក្រោមក្នុងទំព័រ HTML។ តំណ jsDelivr ភ្ជាប់ទៅកំណែជាក់លាក់នៃកូដ ហើយមិនត្រូវការសោ API ទេ។

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## ចំណុចប្រទាក់ JavaScript

| អនុគមន៍ | តម្លៃត្រឡប់ |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · ការសរសេរសំឡេងជាភាសាគោលដៅដែលបានជ្រើស |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA និងការសរសេរសំឡេងជា ២៤ ភាសាក្នុង `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA ផ្នែកនៃអត្ថបទប្រភព ចំណុចមិនទាន់កំណត់ និងព័ត៌មានពិនិត្យបញ្ហា |
| `languages` | លេខសម្គាល់ ឈ្មោះបង្ហាញ អក្សរ និងទម្រង់ភាសាដែលគាំទ្រ |

### បញ្ចូល IPA ដោយផ្ទាល់

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- ប្រើលេខសម្គាល់ភាសាខុសគ្នាសម្រាប់ `source` និង `target`។ `mode` មានតម្លៃលំនាំដើម `'text'`។ ប្រើ `'ipa'` ដើម្បីបញ្ចូល IPA ដោយផ្ទាល់។
- ប្រើ `variant` ដើម្បីជ្រើសទម្រង់តាមតំបន់ ដូចជា `'US'` ឬ `'UK'` សម្រាប់ភាសាអង់គ្លេស។ មើលជម្រើសក្នុង `languages`។
- កំណត់ `readNumbers` ទៅ `true` ដើម្បីអានចំនួនគត់ដែលគាំទ្រតាមរបៀបរាប់របស់ភាសាប្រភព។
- `ipa` រក្សាព្រំដែនឃ្លា ព្រំដែនភាសា និងការចុះបន្ទាត់។ `segments` មានផ្នែកអត្ថបទប្រភព និងភាសារបស់ផ្នែកនីមួយៗ។ សញ្ញា IPA ដែលមានគូសម្គាល់ដោយ `delimiter: true`។
- របៀបអានដែលមិនទាន់កំណត់បង្ហាញជា □ ហើយមានក្នុង `unresolved`។ `unknownPhones` បង្ហាញ IPA ដែលមិនគាំទ្រ, `unpairedDelimiters` បង្ហាញសញ្ញាខ្វះគូ និង `unavailableSources` បង្ហាញធនធានដែលមិនអាចផ្ទុកបាន។ ការសរសេរភាសាកូរ៉េជាអក្សរឡាតាំងមានក្នុង `romanization`។

<details>
<summary>លេខសម្គាល់ ឈ្មោះបង្ហាញ អក្សរ និងទម្រង់ភាសាដែលគាំទ្រ</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## បង្កើតក្នុងម៉ាស៊ីនមូលដ្ឋាន

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

ត្រូវការ Node.js 22 ឬថ្មីជាងនេះ។ ពេលដាក់លើម៉ាស៊ីនមេផ្ទាល់ សូមរក្សាទីតាំងធៀបរបស់ `dist/` និង `assets/`។ ការបម្លែងធ្វើក្នុងកម្មវិធីរុករក ហើយវចនានុក្រម និងម៉ាស៊ីនបញ្ចេញសំឡេងត្រូវបានផ្ទុកពេលប្រើដំបូង។

សូរសំនៀង ការសង្កត់សំឡេង និងសូរខ្លះអាចត្រូវបានសរសេរប្រហាក់ប្រហែល ឬរំលង អាស្រ័យលើអក្សរគោលដៅ។

## ប្រភព និងអាជ្ញាបណ្ណ

គម្រោងនេះមានមូលដ្ឋានលើ IPA-Translator។ កូដប្រើ GPL-3.0 ហើយវចនានុក្រម និងម៉ូដែលដែលភ្ជាប់មកជាមួយរក្សាអាជ្ញាបណ្ណរៀងៗខ្លួន។

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [ប្រភព និងអាជ្ញាបណ្ណ](../../NOTICE.md) · [`licenses/`](../../licenses/)
