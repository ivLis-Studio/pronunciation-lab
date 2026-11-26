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
  assert.ok(!Object.hasOwn(all.outputs, 'korean'));
});

test('rejects unknown sources, variants and same-language targets', async () => {
  await assert.rejects(transcribe('hello', { source: 'missing' }), RangeError);
  await assert.rejects(transcribe('hello', { source: 'english', variant: 'AU' }), RangeError);
  await assert.rejects(transliterate('hello', { source: 'english', target: 'english' }), RangeError);
});
