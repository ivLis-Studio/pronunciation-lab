# Pronunciation Lab

**Écrivez les sons d’une langue dans une autre écriture.**

25 langues sources · 600 sens de conversion · Module ES pour navigateur

[العربية](./ar.md) · [廣東話](./yue-Hant.md) · [Nederlands](./nl.md) · [English](./en.md) · [Esperanto](./eo.md) · [Suomi](./fi.md) · **Français** · [Deutsch](./de.md) · [Íslenska](./is.md) · [Italiano](./it.md) · [Jumiekan](./jam.md) · [日本語](./ja.md) · [ភាសាខ្មែរ](./km.md) · [한국어](../../README.md) · [Bahasa Melayu](./ms.md) · [普通话（简体）](./zh-Hans.md) · [Norsk bokmål](./nb.md) · [ଓଡ଼ିଆ](./or.md) · [فارسی](./fa.md) · [Português](./pt.md) · [Română](./ro.md) · [Español](./es.md) · [Kiswahili](./sw.md) · [Svenska](./sv.md) · [Tiếng Việt](./vi.md)

[Outil de transcription de la prononciation](https://ivlis-studio.github.io/pronunciation-lab/?lang=fr) · [jsDelivr · ES module](https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs) · [Sources et licences](../../NOTICE.md)

## Démarrage

Le japonais **猫** s’écrit **네코** en hangeul et le coréen **안녕하세요** s’écrit **アンニョンハセヨ** en katakana. L’outil convertit d’abord le texte en alphabet phonétique international (API), puis le réécrit selon les conventions de la langue cible.

Collez le code suivant dans une page HTML. Le lien jsDelivr pointe vers un commit précis et ne nécessite aucune clé d’API.

~~~html
<pre id="result"></pre>
<script type="module">
  import { transliterate } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });
  document.querySelector('#result').textContent = spelling; // 네코
</script>
~~~

## Interface JavaScript

| Fonction | Résultat |
| --- | --- |
| `transliterate(text, { source, target, … })` | `Promise<string>` · Transcription de la prononciation dans la langue cible choisie |
| `transliterateAll(text, { source, … })` | `Promise<object>` · Alphabet phonétique et 24 transcriptions cibles dans `outputs` |
| `transcribe(text, { source, … })` | `Promise<object>` · Alphabet phonétique, `segments` `source`, éléments non résolus et informations de diagnostic |
| `languages` | Identifiants, noms affichés, écritures et variantes des langues prises en charge |

### Saisir directement en alphabet phonétique

~~~js
import { transliterate, transliterateAll } from 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {
  source: 'korean', target: 'japanese', mode: 'ipa',
});
const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });
console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo
~~~

- Donnez des identifiants de langue différents à `source` et `target`. La valeur par défaut de `mode` est `'text'`. Utilisez `'ipa'` pour une saisie en alphabet phonétique.
- Utilisez `variant` pour choisir une variété, par exemple `'US'` ou `'UK'` pour l’anglais. Les options sont dans `languages`.
- Définissez `readNumbers` sur `true` pour lire les entiers pris en charge comme des nombres cardinaux dans la langue `source`.
- `ipa` conserve les limites entre les groupes et les langues, ainsi que les sauts de ligne. `segments` contient les fragments `source` et leur langue. Les délimiteurs appariés portent `delimiter: true`.
- Les lectures non résolues s’affichent avec □ et figurent dans `unresolved`. `unknownPhones`, `unpairedDelimiters` et `unavailableSources` signalent les symboles non pris en charge, les délimiteurs non appariés et les ressources indisponibles. La romanisation du coréen figure dans `romanization`.

<details>
<summary>Identifiants, noms affichés, écritures et variantes des langues prises en charge</summary>

`arabic` · `cantonese` · `dutch` · `english` · `esperanto` · `finnish` · `french` · `german` · `icelandic` · `italian` · `jamaican` · `japanese` · `khmer` · `korean` · `malay` · `mandarin` · `norwegian` · `odia` · `persian` · `portuguese` · `romanian` · `spanish` · `swahili` · `swedish` · `vietnamese`

</details>

## Compilation locale

~~~sh
git clone https://github.com/ivLis-Studio/pronunciation-lab.git
cd pronunciation-lab
npm run build
npm test
~~~

Node.js 22 ou une version ultérieure est nécessaire. Pour un hébergement autonome, conservez les positions relatives de `dist/` et `assets/`. La conversion s’exécute dans le navigateur, qui charge les fichiers nécessaires au premier usage.

Les tons, les accents et les sons peuvent être approximés ou omis selon ce que peut exprimer l’écriture cible.

## Sources et licences

Ce projet s’appuie sur IPA-Translator. Le code est sous licence GPL-3.0. Les dictionnaires et les modèles fournis conservent leurs propres licences.

[IPA-Translator](https://github.com/lotusfa/IPA-Translator) · [GPL-3.0](../../LICENSE) · [Sources et licences](../../NOTICE.md) · [`licenses/`](../../licenses/)
