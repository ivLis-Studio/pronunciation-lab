# Pronunciation Lab

**한 언어에서 들은 소리를 다른 문자의 읽기법으로.**

25개 원어 · 600개 변환 방향 · 브라우저용 ES 모듈

[العربية](./docs/readme/ar.md) · [廣東話](./docs/readme/yue-Hant.md) · [Nederlands](./docs/readme/nl.md) · [English](./docs/readme/en.md) · [Esperanto](./docs/readme/eo.md) · [Suomi](./docs/readme/fi.md) · [Français](./docs/readme/fr.md) · [Deutsch](./docs/readme/de.md) · [Íslenska](./docs/readme/is.md) · [Italiano](./docs/readme/it.md) · [Jumiekan](./docs/readme/jam.md) · [日本語](./docs/readme/ja.md) · [ភាសាខ្មែរ](./docs/readme/km.md) · **한국어** · [Bahasa Melayu](./docs/readme/ms.md) · [普通话（简体）](./docs/readme/zh-Hans.md) · [Norsk bokmål](./docs/readme/nb.md) · [ଓଡ଼ିଆ](./docs/readme/or.md) · [فارسی](./docs/readme/fa.md) · [Português](./docs/readme/pt.md) · [Română](./docs/readme/ro.md) · [Español](./docs/readme/es.md) · [Kiswahili](./docs/readme/sw.md) · [Svenska](./docs/readme/sv.md) · [Tiếng Việt](./docs/readme/vi.md)

[발음 표기 변환기](https://ivlis-studio.github.io/pronunciation-lab/?lang=ko) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [출처 및 라이선스](./NOTICE.md)

## 시작하기

일본어 **猫**를 한글로 **네코**, 한국어 **안녕하세요**를 가타카나로 **アンニョンハセヨ**. 원문을 IPA(국제음성기호)로 읽고 목표 언어의 문자 관습에 맞춰 다시 적습니다.

아래 코드를 HTML에 넣으면 됩니다. 소스 커밋에 고정된 jsDelivr URL을 사용하며, API 키가 필요 없습니다.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## JavaScript API

| 함수 | 반환값 |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · 선택한 목표 언어의 발음 표기 |
| `transliterateAll(text, { source, … })` | `Promise<object>` · IPA와 `outputs`에 담긴 24개 목표 표기 |
| `transcribe(text, { source, … })` | `Promise<object>` · IPA, 입력 조각, 미확인 항목과 진단 정보 |
| `languages` | 지원 언어의 ID, 표시 이름, 문자, 지역 옵션 |

### IPA 직접 입력

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- `source`와 `target`에는 서로 다른 언어 ID를 넣습니다. `mode`의 기본값은 `'text'`이며, IPA를 직접 입력할 때는 `'ipa'`를 선택합니다.
- `variant`는 원어의 지역 옵션입니다. 영어는 `'US'`와 `'UK'`를 지원합니다. 전체 옵션은 `languages`에서 확인할 수 있습니다.
- `readNumbers`를 `true`로 설정하면 지원되는 정수를 원어의 기수로 읽습니다.
- `ipa`에는 구절과 원어의 경계, 줄바꿈을 보존합니다. `segments`에는 원문 조각과 각 조각의 원어가 들어갑니다. 짝이 맞는 IPA 구분 기호에는 `delimiter: true`가 표시됩니다.
- 읽지 못한 곳은 □로 표시되며 `unresolved`에 기록됩니다. `unknownPhones`, `unpairedDelimiters`, `unavailableSources`는 각각 미처리 IPA, 짝이 없는 구분 기호, 불러오지 못한 원어 자료를 알려줍니다. 한국어의 로마자 보조 표기는 `romanization`에 들어갑니다.

<details>
<summary>지원 언어의 ID, 표시 이름, 문자, 지역 옵션</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## 로컬 빌드

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 이상이 필요합니다. 직접 호스팅할 때는 `dist/`와 `assets/`의 상대 경로를 유지하세요. 변환은 브라우저에서 실행되고 필요한 사전과 엔진은 처음 쓸 때 불러옵니다.

목표 문자의 표현 범위에 따라 원어의 성조·강세·음소는 근사 표기하거나 생략될 수 있습니다.

## 출처와 라이선스

이 프로젝트는 IPA-Translator에서 출발했습니다. 코드는 GPL-3.0을 따르며, 함께 제공하는 사전과 모델은 각각의 라이선스를 따릅니다.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](./LICENSE) · [출처 및 라이선스](./NOTICE.md) · [`licenses/`](./licenses/)
