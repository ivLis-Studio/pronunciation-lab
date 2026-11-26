# Pronunciation Lab

**صداهای یک زبان را با خط زبان دیگری بنویسید.**

۲۵ زبان مبدأ · ۶۰۰ مسیر تبدیل · ماژول ES مرورگر

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · **فارسی** · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[ابزار آوانویسی](https://ivlis-studio.github.io/pronunciation-lab/?lang=fa) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [منابع و مجوزها](../../NOTICE.md)

## شروع کار

واژهٔ ژاپنی **猫** را می‌توان با هانگول **네코** و عبارت کره‌ای **안녕하세요** را با کاتاکانا **アンニョンハセヨ** نوشت. ابزار ابتدا متن مبدأ را به الفبای آوانگاری بین‌المللی (IPA) تبدیل می‌کند و سپس آن را بر اساس شیوهٔ نوشتار زبان مقصد بازمی‌نویسد.

نمونه را در یک صفحهٔ HTML قرار دهید. نشانی jsDelivr به یک نسخهٔ مشخص از کد اشاره می‌کند و کلید API لازم ندارد.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## رابط JavaScript

| تابع | خروجی |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · آوانویسی به شیوهٔ زبان مقصد |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA و آوانویسی ۲۴ زبان در `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA، بخش‌های متن مبدأ، موارد نامشخص و اطلاعات تشخیصی |
| `languages` | شناسه، نام نمایشی، خط و گونه‌های زبان‌های پشتیبانی‌شده |

### ورود مستقیم IPA

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- برای `source` و `target` شناسه‌های متفاوت بدهید. مقدار پیش‌فرض `mode` برابر `'text'` است. برای ورود مستقیم IPA از `'ipa'` استفاده کنید.
- `variant` گونهٔ منطقه‌ای را تعیین می‌کند، مانند `'US'` و `'UK'` برای انگلیسی. فهرست گزینه‌ها در `languages` است.
- `readNumbers` را `true` کنید تا اعداد صحیح پشتیبانی‌شده به شکل اعداد اصلی زبان مبدأ خوانده شوند.
- `ipa` مرز میان عبارت‌ها و زبان‌ها و شکست سطرها را نگه می‌دارد. `segments` شامل بخش‌های متن مبدأ و زبان هر بخش است. جداکننده‌های جفت‌شده دارای `delimiter: true` هستند.
- خوانش‌های نامشخص با □ نمایش داده می‌شوند و در `unresolved` می‌آیند. `unknownPhones` نمادهای پشتیبانی‌نشده، `unpairedDelimiters` جداکننده‌های ناجفت و `unavailableSources` منابع تلفظ بارگیری‌نشده را نشان می‌دهند. لاتین‌نویسی کره‌ای در `romanization` است.

<details>
<summary>شناسه، نام نمایشی، خط و گونه‌های زبان‌های پشتیبانی‌شده</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## ساخت محلی

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

به Node.js 22 یا جدیدتر نیاز دارد. برای میزبانی شخصی، جای نسبی `dist/` و `assets/` را حفظ کنید. تبدیل در مرورگر انجام می‌شود و فایل‌های فرهنگ و موتور در نخستین استفاده دریافت می‌شوند.

بسته به توان خط مقصد، نواخت، تکیه و واج‌ها ممکن است به‌صورت تقریبی نوشته یا حذف شوند.

## منابع و مجوزها

این پروژه بر پایهٔ IPA-Translator است. کد مجوز GPL-3.0 دارد و فرهنگ‌ها و مدل‌های همراه مجوزهای خود را حفظ می‌کنند.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [منابع و مجوزها](../../NOTICE.md) · [`licenses/`](../../licenses/)
