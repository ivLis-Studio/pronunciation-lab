import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

const localeDirectory = new URL('../locales/', import.meta.url);
const readmeDirectory = new URL('../docs/readme/', import.meta.url);
const site = 'https://ivlis-studio.github.io/pronunciation-lab/';
const cdn = 'https://cdn.jsdelivr.net/gh/ivLis-Studio/pronunciation-lab@1b4dd975734e763cb2fad3a76987c810552b76ea/dist/pronunciation.mjs';

export async function loadLocales() {
  const files = (await readdir(localeDirectory)).filter(name => name.endsWith('.json'));
  const locales = await Promise.all(files.map(async name => JSON.parse(await readFile(new URL(name, localeDirectory), 'utf8'))));
  const base = locales.find(item => item.id === 'english');
  for (const locale of locales) {
    for (const section of ['ui','readme','names','scripts','variants']) {
      const reference = base[section];
      const messages = locale[section];
      if (Object.keys(messages).length !== Object.keys(reference).length) throw new Error('Incorrect key count for ' + locale.id + ' ' + section);
      for (const [key,text] of Object.entries(reference)) {
        const placeholders = message => [...message.matchAll(/\{\w+\}/gu)].map(match => match[0]).sort().join(' ');
        if (!messages[key]?.trim() || placeholders(messages[key]) !== placeholders(text)) throw new Error('Invalid ' + locale.id + ' ' + section + '.' + key);
      }
    }
  }
  if (new Set(locales.map(item => item.locale.toLowerCase())).size !== locales.length) throw new Error('Duplicate locale code');
  return locales;
}

const tick = String.fromCharCode(96);
const code = text => tick + text + tick;
const block = (language, lines) => ['~~~' + language, ...lines, '~~~'].join('\n');
const link = (label, url) => '[' + label + '](' + url + ')';
const importLine = functions => "import { " + functions + " } from '" + cdn + "';";

function technicalTerms(text) {
  return text.replace(/\b(?:delimiter: true|source|target|mode|variant|languages|readNumbers|true|ipa|outputs|segments|unresolved|unknownPhones|unpairedDelimiters|unavailableSources|romanization)\b|'(?:text|US|UK)'|\b(?:dist|assets)\//gu,
    (match, offset, original) => {
      if (original[offset-1] === "'" && original[offset+match.length] === "'") return match;
      return code(match);
    }).replace(/'ipa'/gu, code("'ipa'"));
}

export function renderReadme(locale, locales) {
  const { ui, readme: doc } = locale;
  const isRoot = locale.id === 'korean';
  const back = isRoot ? './' : '../../';
  const chooser = locales.map(item => {
    if (locale.id === item.id) return '**' + item.native + '**';
    if (item.id === 'korean') return link(item.native, back + 'README.md');
    return link(item.native, (isRoot ? './docs/readme/' : './') + item.locale + '.md');
  }).join(' · ');
  const rows = [
    ['transliterate(text, { source, target, … })', 'Promise<string>', doc.one],
    ['transliterateAll(text, { source, … })', 'Promise<object>', doc.all],
    ['transcribe(text, { source, … })', 'Promise<object>', doc.transcript],
    ['languages', '', doc.languageList],
  ].map(([name,type,description]) => '| ' + code(name) + ' | ' + (type ? code(type) + ' · ' : '') + technicalTerms(description) + ' |');
  const ids = locales.map(item => code(item.id)).join(' · ');
  const demoLink = link(ui.title, site + '?lang=' + locale.locale);
  return [
    '# Pronunciation Lab',
    '**' + doc.tagline + '**',
    doc.coverage,
    chooser,
    [demoLink, link('jsDelivr · ES module', cdn), link(ui.credits, back + 'NOTICE.md')].join(' · '),
    '## ' + doc.start,
    doc.opening,
    doc.browser,
    block('html', [
      '<pre id="result"></pre>',
      '<script type="module">',
      '  ' + importLine('transliterate'),
      '',
      "  const spelling = await transliterate('猫', { source: 'japanese', target: 'korean' });",
      "  document.querySelector('#result').textContent = spelling; // 네코",
      '</script>',
    ]),
    '## ' + doc.tools,
    ['| ' + doc.name + ' | ' + doc.returns + ' |', '| --- | --- |', ...rows].join('\n'),
    '### ' + doc.direct,
    block('js', [
      importLine('transliterate, transliterateAll'),
      '',
      "const kana = await transliterate('/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/', {",
      "  source: 'korean', target: 'japanese', mode: 'ipa',",
      '});',
      "const { outputs, romanization } = await transliterateAll('안녕하세요', { source: 'korean' });",
      'console.log(kana, outputs.japanese, romanization); // アンニョンハセヨ アンニョンハセヨ Annyeonghaseyo',
    ]),
    [doc.options, doc.variants, doc.numbers, doc.diagnosis, doc.detail].map(paragraph => '- ' + technicalTerms(paragraph)).join('\n'),
    '<details>\n<summary>' + doc.languageList + '</summary>\n\n' + ids + '\n\n</details>',
    '## ' + doc.build,
    block('sh', [
      'git clone https://github.com/ivLis-Studio/pronunciation-lab.git',
      'cd pronunciation-lab', 'npm run build', 'npm test',
    ]),
    technicalTerms(doc.selfhost),
    doc.limits,
    '## ' + doc.license,
    doc.origin,
    [
      link('IPA-Translator', 'https://github.com/lotusfa/IPA-Translator'),
      link('GPL-3.0', back + 'LICENSE'),
      link(ui.credits, back + 'NOTICE.md'),
      link(code('licenses/'), back + 'licenses/'),
    ].join(' · '),
  ].join('\n\n') + '\n';
}

export async function buildReadmes(locales) {
  await mkdir(readmeDirectory, { recursive:true });
  await Promise.all(locales.map(locale => {
    const destination = locale.id === 'korean' ? new URL('../README.md', import.meta.url) : new URL(locale.locale + '.md', readmeDirectory);
    return writeFile(destination, renderReadme(locale, locales));
  }));
}
