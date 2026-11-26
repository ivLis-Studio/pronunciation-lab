import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';
import { languages } from '../dist/pronunciation.mjs';
import { loadLocales, renderReadme } from './locales.mjs';

const root = new URL('../', import.meta.url);
const locales = await loadLocales();

test('the demo and READMEs cover all supported conversion languages', async () => {
  assert.equal(locales.length, 25);
  assert.deepEqual(locales.map(({id}) => id).sort(), languages.map(({id}) => id).sort());
  const page = await readFile(new URL('index.html', root), 'utf8');
  const keys = [...page.matchAll(/data-i18n(?:-label)?="([^"]+)"/gu)].map(([, key]) => key);
  assert.match(page, /<select id="ui-language">/u);
  const module = await readFile(new URL('dist/demo.mjs', root), 'utf8');
  for (const {id, locale, ui} of locales) {
    assert.ok(keys.every(key => ui[key]), id + ' is missing a page label');
    assert.ok(module.includes(JSON.stringify(locale)), id + ' is missing from the browser build');
  }
});

test('the generated READMEs match their catalogs and their relative links exist', async () => {
  for (const catalog of locales) {
    const name = catalog.id === 'korean' ? 'README.md' : 'docs/readme/' + catalog.locale + '.md';
    const url = new URL(name, root);
    const document = await readFile(url, 'utf8');
    assert.equal(document, renderReadme(catalog, locales), name + ' needs a rebuild');
    assert.ok(document.includes('?lang=' + catalog.locale), name + ' needs a localized demo link');
    const relativeLinks = [...document.matchAll(/\]\(((?:\.\.?\/)[^)]+)\)/gu)];
    assert.ok(relativeLinks.length >= 26, name + ' needs links to all other translations and notices');
    await Promise.all(relativeLinks.map(([, path]) => access(new URL(path, url))));
  }
});
