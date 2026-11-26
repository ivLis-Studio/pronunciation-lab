import assert from 'node:assert/strict';
import { test } from 'node:test';
import { languages, transcribe, transliterate, transliterateAll } from '../dist/pronunciation.mjs';

test('returns all 25 supported languages and their variant identifiers', () => {
  assert.equal(new Set(languages.map(({ id }) => id)).size, 25);
  assert.deepEqual(languages.find(({ id }) => id === 'english').variants, ['US', 'UK']);
});

test('reads Japanese text and keeps phrase spacing', async () => {
  assert.equal(await transliterate('猫', { source: 'japanese', target: 'korean' }), '네코');
  assert.equal(await transliterate('猫が夢を見る', {
    source: 'japanese', target: 'korean',
  }), '네코가 유메오 미루');
});

test('converts IPA without a source dictionary', async () => {
  const output = await transliterate('/aka/ /akʰa/ /ak͈a/', {
    source: 'korean', target: 'japanese', mode: 'ipa',
  });
  assert.equal(output, 'アカ アカ アッカ');
});

test('returns IPA, original segments, and 24 different target spellings', async () => {
  const parsed = await transcribe('안녕하세요', { source: 'korean' });
  assert.equal(parsed.ipa, 'a̠nɲjʌ̹ŋɦa̠sʰe̞jo');
  assert.equal(parsed.segments[0].original, '안녕하세요');
  const all = await transliterateAll('안녕하세요', { source: 'korean' });
  assert.deepEqual(all.unresolved, []);
  assert.equal(Object.keys(all.outputs).length, 24);
  assert.equal(all.outputs.japanese, 'アンニョンハセヨ');
  assert.equal(all.romanization, 'Annyeonghaseyo');
  assert.equal(parsed.romanization, 'Annyeonghaseyo');
  assert.ok(!Object.hasOwn(all.outputs, 'korean'));
});

test('rejects unknown sources, variants and same-language targets', async () => {
  await assert.rejects(transcribe('hello', { source: 'missing' }), RangeError);
  await assert.rejects(transcribe('hello', { source: 'english', variant: 'AU' }), RangeError);
  await assert.rejects(transliterate('hello', { source: 'english', target: 'english' }), RangeError);
});

test('keeps punctuation, line breaks and language switches in mixed text', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Offline test'); });
  const input = '猫hello。\n猫。';
  const result = await transliterateAll(input, { source: 'japanese' });
  assert.equal(result.segments.map(segment => segment.original).join(''), input);
  assert.ok(result.segments.some(segment => segment.source === 'english' && segment.original === 'hello'));
  assert.match(result.ipa, /^neko \S+。\nneko。$/u);
  assert.deepEqual(result.unresolved, []);
  assert.ok(Object.values(result.outputs).every(output => output.includes('。\n') && output.endsWith('。')));
});

test('preserves IPA wrappers and reports unpaired marks and unreadable input', async () => {
  const direct = await transliterateAll('/aka//ak͈a/', { source: 'korean', mode: 'ipa' });
  assert.equal(direct.segments.map(segment => segment.original).join(''), '/aka//ak͈a/');
  assert.equal(direct.segments.filter(segment => segment.delimiter).length, 4);
  assert.equal(direct.ipa, 'aka ak͈a');
  assert.equal(direct.outputs.japanese, 'アカ アッカ');
  const malformed = await transcribe('[/aka/ /ᚠ/', { source: 'korean', mode: 'ipa' });
  assert.equal(malformed.segments.map(segment => segment.original).join(''), '[/aka/ /ᚠ/');
  assert.equal(malformed.ipa, '[aka □');
  assert.deepEqual(malformed.unpairedDelimiters, ['[']);
  assert.deepEqual(malformed.unresolved, ['ᚠ']);
  assert.deepEqual(malformed.unknownPhones, ['ᚠ']);
  assert.equal((await transcribe('/🧬/', { source: 'korean', mode: 'ipa' })).ipa, '□');
});

test('returns original grapheme spelling after NFC lookup', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Offline test'); });
  const input = 'cafe\u0301, hola.\n';
  const result = await transcribe(input, { source: 'spanish' });
  assert.equal(result.segments.map(segment => segment.original).join(''), input);
  assert.ok(result.ipa.endsWith('.\n'));
  assert.deepEqual(result.unresolved, []);
});

test('all 25 real-language samples yield 600 usable outputs with network disabled', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Offline test'); });
  const examples = {
    korean: '안녕하세요', japanese: '猫', english: 'hello', mandarin: '你好', cantonese: '你好',
    arabic: 'سلام', persian: 'سلام', khmer: 'សួស្ដី', odia: 'ଓଡ଼ିଆ', dutch: 'hallo',
    norwegian: 'hei', german: 'hallo', romanian: 'salut', malay: 'selamat', vietnamese: 'xin chào',
    swahili: 'jambo', swedish: 'hej', spanish: 'hola', icelandic: 'halló', esperanto: 'saluto',
    italian: 'ciao', jamaican: 'unu', portuguese: 'olá', french: 'bonjour', finnish: 'hei',
  };
  let total = 0;
  for (const { id: source } of languages) {
    const input = examples[source];
    assert.ok(input, source);
    const converted = await transliterateAll(input, { source });
    assert.equal(converted.segments.map(segment => segment.original).join(''), input, source);
    assert.deepEqual(converted.unresolved, [], source);
    assert.equal(Object.keys(converted.outputs).length, 24, source);
    assert.ok(!Object.hasOwn(converted.outputs, source), source);
    assert.ok(Object.values(converted.outputs).every(output => output.trim() && !output.includes('□')), source);
    total += Object.keys(converted.outputs).length;
  }
  assert.equal(total, 600);
});

test('loads the embedded fallback engine in Node for words missing from the dictionary', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Offline test'); });
  for (const [source, input] of [['english', 'Ziri'], ['finnish', 'kehtaatkin']]) {
    const reading = await transcribe(input, { source });
    assert.deepEqual(reading.unresolved, [], source);
    assert.ok(reading.ipa.trim() && !reading.ipa.includes('□'), source);
  }
});
