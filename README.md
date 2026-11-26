<div align="center">

# Pronunciation Lab

**말의 뜻을 옮기는 대신, 들리는 소리를 다른 문자로.**

25개 원어 · 600개 변환 방향 · 브라우저용 ES 모듈

[변환기 열기](https://ivlis-studio.github.io/pronunciation-lab/) · [jsDelivr 모듈](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@v1.0.0/dist/pronunciation.mjs) · [출처와 라이선스](./NOTICE.md)

</div>

## 시작하기

일본어 **猫**를 한글로 **네코**, 한국어 **안녕하세요**를 가타카나로 **アンニョンハセヨ**. 원문을 IPA(국제음성기호)로 읽고 목표 언어의 문자 관습에 맞춰 다시 적습니다.

아래 예제를 HTML에 넣으면 됩니다. 버전이 고정된 jsDelivr URL이며, API 키가 필요 없습니다.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@v1.0.0/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', {
    source: 'japanese',
    target: 'korean',
  });

  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

GitHub Pages에서 제공하는 [동일한 ES 모듈](https://ivlis-studio.github.io/pronunciation-lab/dist/pronunciation.mjs)도 사용할 수 있습니다. 필요한 사전과 발음 엔진 파일은 해당 입력을 처음 처리할 때 내려받습니다.

## JavaScript API

| 함수 | 반환값 |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>`. 선택한 목표 언어의 발음 표기 |
| `transliterateAll(text, { source, … })` | `Promise<object>`. IPA와 `outputs`에 담긴 24개 목표 표기 |
| `transcribe(text, { source, … })` | `Promise<object>`. `ipa`, `segments`, `unresolved`, `unknownPhones` |
| `languages` | 지원 언어의 `id`, 표시 이름, 문자, 지역 옵션 목록 |

### IPA를 바로 넣기

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@v1.0.0/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean',
  target: 'japanese',
  mode: 'ipa',
});

const { ipa, outputs } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(ipa, outputs.japanese);
~~~

- **`source` / `target`** · `japanese`, `korean`, `english` 같은 언어 ID입니다. 원어와 목표 언어는 서로 달라야 합니다.
- **`mode`** · 기본은 `'text'`입니다. 발음 기호를 넣을 때 `'ipa'`를 선택합니다.
- **`variant`** · 원어의 지역 옵션입니다. 예를 들어 영어는 `'US'`와 `'UK'`를 지원합니다. 목록은 `languages`에서 확인할 수 있습니다.
- **`readNumbers`** · `true`로 설정하면 문장 안의 지원되는 정수를 원어의 기수로 읽습니다.
- 사전과 규칙에서 읽기를 결정하지 못한 구간은 `□`로 표시되며, `transcribe`와 `transliterateAll`의 `unresolved`에서 확인할 수 있습니다.

<details>
<summary>25개 언어 ID</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## 로컬 빌드

Node.js 22 이상에서 실행합니다.

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

`dist/pronunciation.mjs`는 API 모듈, `dist/demo.mjs`는 데모 페이지용 빌드입니다. 직접 호스팅할 때는 `dist/`와 `assets/`의 상대 경로를 유지하세요. 변환은 브라우저 안에서 실행되며, 사전과 엔진 파일을 가져오는 데 네트워크를 사용합니다. 원어의 성조·강세·음소를 표현할 수 있는 범위는 목표 문자마다 다릅니다.

## 출처와 라이선스

[lotusfa/IPA-Translator](https://github.com/lotusfa/IPA-Translator)의 원문 → IPA 처리에서 출발했습니다. 프로젝트 코드는 [GPL-3.0](./LICENSE)을 따릅니다. 함께 제공되는 사전, 발음 모델과 구성 요소에는 각자의 라이선스가 적용됩니다. [전체 출처 및 저작권 고지](./NOTICE.md) · [라이선스 원문](./licenses/)
