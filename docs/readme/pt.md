# Pronunciation Lab

**Escreva os sons de uma língua em outro sistema de escrita.**

25 idiomas de origem · 600 direções de conversão · Módulo ES para o navegador

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · **Português** · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Conversor de pronúncia](https://ivlis-studio.github.io/pronunciation-lab/?lang=pt) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Fontes e licenças](../../NOTICE.md)

## Primeiros passos

A palavra japonesa **猫** pode ser escrita em hangul como **네코**, e a saudação coreana **안녕하세요**, em katakana como **アンニョンハセヨ**. A ferramenta lê o texto em Alfabeto Fonético Internacional (AFI ou IPA) e o reescreve conforme as convenções do idioma de destino.

Cole o exemplo em uma página HTML. O endereço do jsDelivr está fixado a uma revisão do código e dispensa chave de API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API JavaScript

| Função | Retorno |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Pronúncia escrita no idioma de destino escolhido |
| `transliterateAll(text, { source, … })` | `Promise<object>` · AFI e 24 transcrições de destino em `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · AFI, trechos do original, itens não resolvidos e informações de diagnóstico |
| `languages` | Identificadores, nomes, sistemas de escrita e variantes dos idiomas compatíveis |

### Inserir AFI diretamente

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Use identificadores de idiomas diferentes em `source` e `target`. O valor padrão de `mode` é `'text'`. Use `'ipa'` para inserir AFI diretamente.
- Escolha uma variante do idioma de origem com `variant`, como `'US'` ou `'UK'` para o inglês. Veja as opções em `languages`.
- Defina `readNumbers` como `true` para ler os inteiros compatíveis como números cardinais no idioma de origem.
- `ipa` preserva as fronteiras entre trechos e idiomas e as quebras de linha. `segments` contém os trechos originais e seus idiomas. Os delimitadores emparelhados levam `delimiter: true`.
- As leituras não resolvidas aparecem como □ e são listadas em `unresolved`. `unknownPhones`, `unpairedDelimiters` e `unavailableSources` indicam símbolos não compatíveis, delimitadores sem par e recursos indisponíveis. A romanização do coreano aparece em `romanization`.

<details>
<summary>Identificadores, nomes, sistemas de escrita e variantes dos idiomas compatíveis</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Compilação local

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Requer Node.js 22 ou superior. Na hospedagem própria, mantenha as posições relativas de `dist/` e `assets/`. A conversão é feita no navegador, que carrega os arquivos de dicionário e do motor no primeiro uso.

Tons, acentos e sons podem ser aproximados ou omitidos conforme as possibilidades do sistema de escrita de destino.

## Fontes e licenças

Este projeto deriva do IPA-Translator. O código usa GPL-3.0 e os dicionários e modelos incluídos mantêm suas próprias licenças.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Fontes e licenças](../../NOTICE.md) · [`licenses/`](../../licenses/)
