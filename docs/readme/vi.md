# Pronunciation Lab

**Viết âm của một ngôn ngữ bằng chữ viết của ngôn ngữ khác.**

25 ngôn ngữ nguồn · 600 chiều chuyển đổi · Mô-đun ES cho trình duyệt

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · **Tiếng Việt**

[Công cụ chuyển cách ghi âm](https://ivlis-studio.github.io/pronunciation-lab/?lang=vi) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Nguồn và giấy phép](../../NOTICE.md)

## Bắt đầu

Từ tiếng Nhật **猫** có thể viết bằng Hangul là **네코**, còn lời chào tiếng Hàn **안녕하세요** có thể viết bằng katakana là **アンニョンハセヨ**. Công cụ đọc văn bản nguồn bằng Bảng mẫu tự ngữ âm quốc tế (IPA), rồi viết lại theo quy ước của ngôn ngữ đích.

Dán đoạn mã dưới đây vào một trang HTML. Địa chỉ jsDelivr trỏ đến một phiên bản cố định của mã nguồn và không yêu cầu khóa API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API JavaScript

| Hàm | Giá trị trả về |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Cách ghi phát âm theo ngôn ngữ đích đã chọn |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA và 24 cách ghi theo ngôn ngữ đích trong `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, các đoạn văn bản nguồn, mục chưa xác định và thông tin chẩn đoán |
| `languages` | Mã ngôn ngữ, tên hiển thị, hệ chữ viết và biến thể được hỗ trợ |

### Nhập IPA trực tiếp

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Dùng mã ngôn ngữ khác nhau cho `source` và `target`. Giá trị mặc định của `mode` là `'text'`. Dùng `'ipa'` để nhập IPA trực tiếp.
- Dùng `variant` để chọn biến thể của ngôn ngữ nguồn, ví dụ `'US'` hoặc `'UK'` cho tiếng Anh. Xem các lựa chọn trong `languages`.
- Đặt `readNumbers` thành `true` để đọc các số nguyên được hỗ trợ theo số đếm trong ngôn ngữ nguồn.
- `ipa` giữ nguyên ranh giới cụm từ, ranh giới ngôn ngữ và ngắt dòng. `segments` chứa các đoạn nguồn và ngôn ngữ của mỗi đoạn. Dấu phân cách IPA có cặp mang `delimiter: true`.
- Cách đọc chưa xác định hiện thành □ và được ghi trong `unresolved`. `unknownPhones`, `unpairedDelimiters` và `unavailableSources` lần lượt báo ký hiệu IPA chưa hỗ trợ, dấu phân cách không có cặp và dữ liệu đọc không tải được. Phiên tự Latinh tiếng Hàn nằm trong `romanization`.

<details>
<summary>Mã ngôn ngữ, tên hiển thị, hệ chữ viết và biến thể được hỗ trợ</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Tạo bản dựng trên máy

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Cần Node.js 22 trở lên. Khi tự lưu trữ, hãy giữ nguyên vị trí tương đối của `dist/` và `assets/`. Việc chuyển đổi chạy trong trình duyệt. Các tệp từ điển và bộ máy được tải khi dùng lần đầu.

Thanh điệu, trọng âm và âm vị có thể được ghi gần đúng hoặc lược bỏ tùy theo khả năng biểu đạt của chữ viết đích.

## Nguồn và giấy phép

Dự án dựa trên IPA-Translator. Mã nguồn dùng GPL-3.0, còn từ điển và mô hình đi kèm giữ giấy phép riêng.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Nguồn và giấy phép](../../NOTICE.md) · [`licenses/`](../../licenses/)
