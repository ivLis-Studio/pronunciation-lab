import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildReadmes, loadLocales } from './locales.mjs';

const src = new URL('../src/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const read = name => readFile(new URL(name, src), 'utf8');
const files = JSON.parse(await read('order.json'));
const [loader, api, localeRuntime, locales, ...sections] = await Promise.all([
  read('asset-loader.mjs'), read('web-api.mjs'), read('demo-locale.js'), loadLocales(), ...files.map(read),
]);
const full = sections.join('\n');
const split = full.indexOf('\nconst controls=');
if (split < 0) throw new Error('Converter UI boundary missing');
const uiCatalogs = Object.fromEntries(locales.map(({ readme, ...catalog }) => [catalog.id, catalog]));
const demo = full.slice(0, split) + '\nconst uiCatalogs = ' + JSON.stringify(uiCatalogs, null, 2) + ';\n' + localeRuntime + full.slice(split);
const banner = '/*! Pronunciation Lab · GPL-3.0-only · See NOTICE.md and licenses/ for bundled components. */\n';
await mkdir(dist, { recursive: true });
await Promise.all([
  writeFile(new URL('pronunciation.mjs', dist), banner + loader + '\n' + full.slice(0, split) + '\n' + api),
  writeFile(new URL('demo.mjs', dist), banner + loader + '\n' + demo),
  buildReadmes(locales),
]);
