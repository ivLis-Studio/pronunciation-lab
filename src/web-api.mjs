const apiProfiles = new Map(profiles.map(profile => [profile.id, profile]));

export const languages = Object.freeze(profiles.map(({ id, name, script }) => Object.freeze({
  id, name, script, variants: Object.freeze(Object.keys(LANGUAGES[id]?.variants ?? {})),
})));

function originalSegmentText(chunks, text, normalized) {
  const spellings = chunks.map(chunk => chunk.original);
  if (text === normalized || spellings.join('') !== normalized) return spellings;
  const boundaries = new Map([[0, 0]]);
  let normalizedOffset = 0;
  for (const { segment, index } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) {
    normalizedOffset += segment.normalize('NFC').length;
    boundaries.set(normalizedOffset, index + segment.length);
  }
  let start = 0;
  const restored = spellings.map(spelling => {
    const end = start + spelling.length;
    const original = boundaries.has(start) && boundaries.has(end)
      ? text.slice(boundaries.get(start), boundaries.get(end)) : undefined;
    start = end;
    return original;
  });
  return normalizedOffset === normalized.length && restored.every(spelling => spelling !== undefined) ? restored : spellings;
}

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
  const chunks = analyzeReadings(await getChunks(input, source, variant, mode, readNumbers), source);
  const initial = originalSegmentText(chunks, text, input);
  const segments = chunks.map((chunk, index) => ({
    original: initial[index],
    ipa: chunk.ipa ?? '',
    source: chunk.source ?? source,
    unresolved: Boolean(chunk.unknown || chunk.ipa && !chunk.sounds?.some(phone => phone.sound)),
    unknownPhones: Array.from(chunk.sounds?.unknownPhones ?? []),
    ...(chunk.ipaWrapper ? { delimiter: true } : {}),
  }));
  return { source, chunks, segments, mode };
}

function assembledIPA(chunks, segments) {
  let output = '', previousLanguage;
  for (const [index, segment] of segments.entries()) {
    const chunk = chunks[index];
    if (chunk.ipaWrapper) continue;
    if (segment.ipa && !segment.unresolved) {
      if (previousLanguage && startsReadingGroup(chunk, previousLanguage, segment.source)) output += ' ';
      output += segment.ipa;
      previousLanguage = segment.source;
    } else {
      output += segment.unresolved ? '□' : chunk.wordBoundary ? ' ' : segment.original;
      previousLanguage = undefined;
    }
  }
  return output;
}

function describeConversion({ source, chunks, segments, mode }) {
  const unresolved = [...new Set(segments.filter(segment => segment.unresolved).map(segment => segment.original))];
  const romanization = formatKoreanRomanization(chunks, source, mode, unresolved.length > 0);
  return {
    source, segments, unresolved,
    ipa: assembledIPA(chunks, segments),
    ...(romanization ? { romanization } : {}),
    unknownPhones: [...new Set(segments.flatMap(segment => segment.unknownPhones))],
    unpairedDelimiters: [...new Set(chunks.flatMap((chunk, index) => chunk.ipaDelimiterIssue ? [segments[index].original] : []))],
    unavailableSources: [...new Set(chunks.map(chunk => chunk.unavailable).filter(Boolean))],
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
