const apiProfiles = new Map(profiles.map(profile => [profile.id, profile]));

export const languages = Object.freeze(profiles.map(({ id, name, script }) => Object.freeze({
  id, name, script, variants: Object.freeze(Object.keys(LANGUAGES[id]?.variants ?? {})),
})));

async function prepareConversion(text, options) {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
  const { source, variant = '', mode = 'text', readNumbers = false } = options ?? {};
  if (!apiProfiles.has(source)) throw new RangeError('Unknown source language: ' + source);
  if (mode !== 'text' && mode !== 'ipa') throw new RangeError('mode must be "text" or "ipa"');
  if (typeof readNumbers !== 'boolean') throw new TypeError('readNumbers must be boolean');
  if (typeof variant !== 'string' || variant && !Object.hasOwn(LANGUAGES[source]?.variants ?? {}, variant)) {
    throw new RangeError('Unknown variant for ' + source + ': ' + variant);
  }
  const input = text.normalize('NFC');
  const chunks = await getChunks(input, source, variant, mode, readNumbers);
  const segments = chunks.map(chunk => {
    const language = chunk.source ?? source;
    const ipa = chunk.ipa ?? '';
    const sounds = ipa ? tokenizeIPA(ipa, language) : undefined;
    return {
      original: chunk.original, ipa, source: language,
      unresolved: Boolean(chunk.unknown || ipa && !sounds.some(phone => phone.sound)),
      unknownPhones: Array.from(sounds?.unknownPhones ?? []),
    };
  });
  return { source, chunks, segments, mode };
}

function describeConversion({ source, chunks, segments, mode }) {
  const unresolved = [...new Set(segments.filter(segment => segment.unresolved).map(segment => segment.original))];
  const romanization = formatKoreanRomanization(chunks, source, mode, unresolved.length > 0);
  return {
    source, segments,
    ipa: segments.map(segment => segment.ipa || (segment.unresolved ? '□' : segment.original)).join(''),
    unresolved,
    ...(romanization ? { romanization } : {}),
    unknownPhones: [...new Set(segments.flatMap(segment => segment.unknownPhones))],
  };
}

/** Resolve source text to IPA and preserve its original segments. */
export async function transcribe(text, options) {
  return describeConversion(await prepareConversion(text, options));
}

/** Return the pronunciation in one target language's spelling. */
export async function transliterate(text, options) {
  const { source, target } = options ?? {};
  if (!apiProfiles.has(target) || source === target) throw new RangeError('Choose a different supported target language');
  const parsed = await prepareConversion(text, options);
  return renderChunks(parsed.chunks, parsed.source, target);
}

/** Resolve the input once and render all 24 other languages. */
export async function transliterateAll(text, options) {
  const parsed = await prepareConversion(text, options);
  const outputs = Object.fromEntries(profiles.filter(profile => profile.id !== parsed.source)
    .map(profile => [profile.id, renderChunks(parsed.chunks, parsed.source, profile.id)]));
  return { ...describeConversion(parsed), outputs };
}
