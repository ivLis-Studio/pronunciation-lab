# Pronunciation Lab

**اكتب أصوات لغة بحروف لغة أخرى.**

25 لغة مصدر · 600 اتجاه للتحويل · وحدة ES للمتصفح

**العربية** · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[أداة كتابة النطق](https://ivlis-studio.github.io/pronunciation-lab/?lang=ar) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [المصادر والتراخيص](../../NOTICE.md)

## البدء

يمكن كتابة الكلمة اليابانية **猫** بالهانغول **네코**، والتحية الكورية **안녕하세요** بالكاتاكانا **アンニョンハセヨ**. يُحوّل النص أولًا إلى الأبجدية الصوتية الدولية (IPA)، ثم يُكتب وفق أعراف اللغة المستهدفة.

ألصق المثال في صفحة HTML. يشير رابط jsDelivr إلى نسخة محددة من الشيفرة ولا يحتاج إلى مفتاح API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## واجهة JavaScript

| الدالة | القيمة المُعادة |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · كتابة النطق باللغة المستهدفة المختارة |
| `transliterateAll(text, { source, … })` | `Promise<object>` · رموز IPA وكتابة النطق بـ24 لغة في `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · رموز IPA ومقاطع المصدر والمواضع غير المحسومة ومعلومات التشخيص |
| `languages` | معرّفات اللغات وأسماؤها وأنظمة كتابتها ونسخها المدعومة |

### إدخال IPA مباشرة

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- استخدم معرّفين مختلفين في `source` و`target`. قيمة `mode` الافتراضية هي `'text'`، ولإدخال رموز IPA استخدم `'ipa'`.
- استخدم `variant` لاختيار النسخة الإقليمية للغة المصدر، مثل `'US'` أو `'UK'` للإنجليزية. الخيارات متاحة في `languages`.
- اضبط `readNumbers` على `true` لتُقرأ الأعداد الصحيحة المدعومة بصيغة الأعداد الأصلية في اللغة المصدر.
- يحفظ `ipa` حدود العبارات واللغات وفواصل الأسطر. ويضم `segments` مقاطع النص ولغة كل مقطع. تحمل علامات IPA المقترنة الوسم `delimiter: true`.
- تظهر المواضع التي لم يُحدّد نطقها بالرمز □ وتُسجّل في `unresolved`. تعرض `unknownPhones` رموز IPA غير المدعومة، و`unpairedDelimiters` العلامات غير المقترنة، و`unavailableSources` موارد النطق المتعذّر تحميلها. وتظهر كتابة الكورية بالحروف اللاتينية في `romanization`.

<details>
<summary>معرّفات اللغات وأسماؤها وأنظمة كتابتها ونسخها المدعومة</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## البناء المحلي

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

يتطلب Node.js 22 أو أحدث. عند الاستضافة الذاتية أبقِ `dist/` و`assets/` في موضعيهما النسبيين. يتم التحويل في المتصفح وتُحمّل ملفات القاموس والمحرّك عند استخدامها أول مرة.

قد يُقرّب تمثيل النغم أو النبر أو الأصوات أو تُحذف وفقًا لقدرة نظام الكتابة المستهدف على تمثيلها.

## المصادر والتراخيص

يعتمد المشروع على IPA-Translator. تخضع الشيفرة لترخيص GPL-3.0 وتحتفظ القواميس والنماذج المضمّنة بتراخيصها الخاصة.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [المصادر والتراخيص](../../NOTICE.md) · [`licenses/`](../../licenses/)
