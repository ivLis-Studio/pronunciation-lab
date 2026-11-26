# Pronunciation Lab

**Escribe los sonidos de una lengua con otra escritura.**

25 idiomas de origen · 600 direcciones de conversión · Módulo ES para el navegador

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · **Español** · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Conversor de pronunciación](https://ivlis-studio.github.io/pronunciation-lab/?lang=es) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Fuentes y licencias](../../NOTICE.md)

## Primeros pasos

La palabra japonesa **猫** se puede escribir en hangul como **네코** y el saludo coreano **안녕하세요** en katakana como **アンニョンハセヨ**. La herramienta lee el texto en el Alfabeto Fonético Internacional (AFI o IPA) y lo reescribe siguiendo las convenciones del idioma de destino.

Pega el código en una página HTML. La URL de jsDelivr está fijada a una revisión del código y no requiere clave de API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## API de JavaScript

| Función | Devuelve |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Pronunciación escrita en el idioma de destino elegido |
| `transliterateAll(text, { source, … })` | `Promise<object>` · AFI y 24 transcripciones de destino en `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · AFI, segmentos del original, elementos sin resolver e información de diagnóstico |
| `languages` | Identificadores, nombres, sistemas de escritura y variantes admitidos |

### Introducir AFI directamente

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Usa identificadores distintos en `source` y `target`. El valor predeterminado de `mode` es `'text'`. Usa `'ipa'` para introducir AFI directamente.
- Usa `variant` para elegir una variedad del idioma de origen, como `'US'` o `'UK'` para el inglés. Consulta `languages` para ver las opciones.
- Pon `readNumbers` en `true` para leer los enteros admitidos como números cardinales en el idioma de origen.
- `ipa` conserva los límites entre grupos y lenguas y los saltos de línea. `segments` contiene los fragmentos originales y su idioma. Los delimitadores emparejados llevan `delimiter: true`.
- Las pronunciaciones sin resolver se muestran con □ y se incluyen en `unresolved`. `unknownPhones`, `unpairedDelimiters` y `unavailableSources` indican símbolos no compatibles, delimitadores sin pareja y recursos que no se pudieron cargar. La romanización del coreano aparece en `romanization`.

<details>
<summary>Identificadores, nombres, sistemas de escritura y variantes admitidos</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Compilación local

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Requiere Node.js 22 o posterior. Si lo alojas en tu servidor, conserva las rutas relativas de `dist/` y `assets/`. La conversión se ejecuta en el navegador y los archivos de diccionario y motor se descargan al usarlos por primera vez.

Según el sistema de escritura de destino, los tonos, el acento y los sonidos pueden aproximarse u omitirse.

## Fuentes y licencias

El proyecto se basa en IPA-Translator. El código se distribuye bajo GPL-3.0 y los diccionarios y modelos incluidos conservan sus propias licencias.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Fuentes y licencias](../../NOTICE.md) · [`licenses/`](../../licenses/)
