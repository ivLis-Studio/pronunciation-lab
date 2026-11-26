/*! Pronunciation Lab · GPL-3.0-only · See NOTICE.md and licenses/ for bundled components. */
const asset = filename => new URL('../assets/' + filename, import.meta.url);

function decodeBase64(payload) {
  return Uint8Array.fromBase64 ? Uint8Array.fromBase64(payload) :
    Uint8Array.from(atob(payload), character => character.charCodeAt(0));
}

async function readAsset(url) {
  if (url.protocol === 'file:' && globalThis.process?.versions?.node) {
    const { readFile } = await import('node:fs/promises');
    return readFile(url);
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('Pronunciation asset request failed (' + response.status + '): ' + url.pathname);
  return new Uint8Array(await response.arrayBuffer());
}

// IPA-Translator, lotusfa contributors, GPL-3.0. Revision 5fae91c611caf62d47a8a1fefedaa225f17fdb2a.
/**
 * Language configuration for the agent interface.
 * Maps language codes to database paths, processors, variants, and formatters.
 *
 * When adding a new language, update this file alongside the language's main.js.
 */

const LANGUAGES = {
  cantonese: {
    name: 'Cantonese',
    databasePath: './json/yue.json',
    processor: 'charBased',
    maxWordLength: 6,
    allowWordSearch: true,
    formats: {
      IPA_org: 'yue.format.js:formatIPA_org',
      IPA_num: 'yue.format.js:formatIPA_num',
      Jyutping: 'yue.format.js:formatYueJyutping',
      Guangzhou: 'yue.format.js:formatYueGuangzhou',
      Academy: 'yue.format.js:formatYueAcademy',
      Yale: 'yue.format.js:formatYueYale',
      Liu: 'yue.format.js:formatYueLiu',
    },
  },
  mandarin: {
    name: 'Mandarin',
    databasePath: './json/${variant}.json',
    processor: 'charBased',
    maxWordLength: 9,
    allowWordSearch: true,
    variants: { hant: 'zh_hant', hans: 'zh_hans' },
    defaultVariant: 'hant',
    formats: {
      IPA_org: 'zh.format.js:formatIPA_org',
      IPA_num: 'zh.format.js:formatIPA_num',
      Pinyin_num: 'zh.format.js:convertIPATextToPinyin',
      Pinyin: 'zh.format.js:convertIPATextToPinyinWithMarks',
      Zhuyin: 'zh.format.js:convertIPATextToZhuyin',
    },
  },
  english: {
    name: 'English',
    databasePath: './json/en_${variant}.json',
    processor: 'longestMatch',
    variants: { US: 'US', UK: 'UK' },
    defaultVariant: 'US',
  },
  french: {
    name: 'French',
    databasePath: './json/${variant}.json',
    processor: 'longestMatch',
    variants: { FR: 'fr_FR', QC: 'fr_QC' },
    defaultVariant: 'FR',
  },
  spanish: {
    name: 'Spanish',
    databasePath: './json/es_${variant}.json',
    processor: 'longestMatch',
    variants: { ES: 'ES', MX: 'MX' },
    defaultVariant: 'ES',
  },
  vietnamese: {
    name: 'Vietnamese',
    databasePath: './json/vi_${variant}.json',
    processor: 'longestMatch',
    maxWordLength: 6,
    variants: { C: 'C', N: 'N', S: 'S' },
    defaultVariant: 'S',
    formats: {
      IPA_org: null,
      IPA_num: 'vi.format.js:formatIPANumbers',
      tone_simple: 'vi.format.js:formatVietnameseOutput',
    },
  },
  japanese: {
    name: 'Japanese',
    databasePath: './json/ja.json',
    processor: 'charBased',
    maxWordLength: 6,
  },
  korean: {
    name: 'Korean',
    databasePath: './json/ko.json',
    processor: 'korean',
    maxWordLength: 6,
  },
  khmer: {
    name: 'Khmer',
    databasePath: './json/km.json',
    processor: 'khmer',
  },
  arabic: {
    name: 'Arabic',
    databasePath: './json/ar.json',
    processor: 'longestMatch',
    maxWordLength: 5,
  },
  esperanto: {
    name: 'Esperanto',
    databasePath: './json/eo.json',
    processor: 'longestMatch',
    maxWordLength: 5,
  },
  persian: {
    name: 'Persian',
    databasePath: './json/fa.json',
    processor: 'longestMatch',
  },
  finnish: {
    name: 'Finnish',
    databasePath: './json/fi.json',
    processor: 'longestMatch',
  },
  german: {
    name: 'German',
    databasePath: './json/de.json',
    processor: 'longestMatch',
  },
  icelandic: {
    name: 'Icelandic',
    databasePath: './json/is.json',
    processor: 'longestMatch',
  },
  jamaican: {
    name: 'Jamaican',
    databasePath: './json/jam.json',
    processor: 'longestMatch',
  },
  malay: {
    name: 'Malay',
    databasePath: './json/ma.json',
    processor: 'longestMatch',
  },
  norwegian: {
    name: 'Norwegian',
    databasePath: './json/nb.json',
    processor: 'longestMatch',
  },
  odia: {
    name: 'Odia',
    databasePath: './json/or.json',
    processor: 'longestMatch',
  },
  portuguese: {
    name: 'Portuguese',
    databasePath: './json/pt_BR.json',
    processor: 'longestMatch',
  },
  romanian: {
    name: 'Romanian',
    databasePath: './json/ro.json',
    processor: 'longestMatch',
  },
  swahili: {
    name: 'Swahili',
    databasePath: './json/sw.json',
    processor: 'longestMatch',
  },
  swedish: {
    name: 'Swedish',
    databasePath: './json/sv.json',
    processor: 'longestMatch',
  },
  dutch: {
    name: 'Dutch',
    databasePath: './json/nl.json',
    processor: 'longestMatch',
  },
};

/**
 * Resolve the actual database path for a language and optional variant.
 */
function resolveDatabasePath(languageCode, variant) {
  const lang = LANGUAGES[languageCode];
  if (!lang) return null;
  const path = lang.databasePath;
  if (path.includes('${variant}')) {
    const v = variant || lang.defaultVariant;
    const suffix = lang.variants && lang.variants[v];
    if (!suffix) return null;
    return path.replace('${variant}', suffix);
  }
  return path;
}

/**
 * Get list of valid format keys for a language.
 */
function getValidFormats(languageCode) {
  const lang = LANGUAGES[languageCode];
  return lang && lang.formats ? Object.keys(lang.formats) : [];
}

/**
 * Get list of valid variant keys for a language.
 */
function getValidVariants(languageCode) {
  const lang = LANGUAGES[languageCode];
  return lang && lang.variants ? Object.keys(lang.variants) : [];
}

/**
 * Core Utilities - Shared primitives used by ipa.js and page/ modules.
 * Contains DOM utilities, data loading, and event helpers.
 */

// ============================================
// Data Loading
// ============================================

/**
 * Normalize IPA data from JSON format into a flat lookup object
 * Simply gets the first key from the JSON and uses its array
 * This works universally for all single-key formats: "yue", "en_US", "zh_hans", etc.
 *
 * @param {object} langData - Raw JSON data
 * @returns {object} Flat lookup object: { word: ipa, char: ipa }
 */
function normalizeIPAData(langData) {
  const normalized = {};

  // Get the first (and typically only) key from the JSON
  // This works for all single-key formats: "yue", "en_US", "zh_hans", etc.
  const firstKey = Object.keys(langData)[0];
  const dataArray = firstKey ? langData[firstKey] : [];

  // Flatten into lookup object
  if (Array.isArray(dataArray)) {
    dataArray.forEach(entry => {
      Object.keys(entry).forEach(key => {
        normalized[key] = entry[key];
      });
    });
  }

  return normalized;
}

/**
 * Load IPA database from JSON file with error handling
 * Simply loads the JSON and normalizes using the first key
 *
 * @param {object} options - Configuration object:
 *   @param {string} options.basePath - Base path to JSON file (e.g., "../json/yue.json")
 *   @param {function} options.onSuccess - Callback with normalized lookup object
 *   @param {function} [options.onError] - Optional error callback
 *
 * Example usage:
 *   loadIPADatabase({ basePath: '../json/yue.json', onSuccess: (data) => { ... } });
 */
function loadIPADatabase(options) {
  const { basePath, onSuccess, onError } = options;

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var langData = JSON.parse(this.responseText);
      const lookup = normalizeIPAData(langData);
      onSuccess(lookup);
    } else if (this.readyState == 4) {
      const errorMsg = "Failed to load database: " + this.status;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  xmlhttp.onerror = function () {
    const errorMsg = "Network error loading IPA database";
    console.error(errorMsg);
    if (onError) onError(errorMsg);
  };

  xmlhttp.open("GET", basePath, true);
  xmlhttp.send();
}

// ============================================
// DOM Utilities
// ============================================

/**
 * Safely get DOM element value
 * @param {string} elementId - Element ID
 * @returns {string} Element value or empty string
 */
function getElementValue(elementId) {
  const el = document.getElementById(elementId);
  return el ? el.value : "";
}

/**
 * Safely set DOM element value
 * @param {string} elementId - Element ID
 * @param {string} value - Value to set
 */
function setElementValue(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.value = value;
}

/**
 * Set element value with fade-in animation for smoother visual transition
 * @param {string} elementId - Element ID
 * @param {string} value - Value to set
 * @param {number} animationDuration - Animation duration in ms (default: 300)
 */
function setElementValueAnimated(elementId, value, animationDuration = 300) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.value = value;

  // Apply fade-in animation
  el.classList.add('ipa-fade-in');

  // Remove animation class after completion
  setTimeout(() => {
    el.classList.remove('ipa-fade-in');
  }, animationDuration);
}

/**
 * Check if element exists and is checked (for checkboxes/radios)
 * @param {string} elementId - Element ID
 * @returns {boolean} Whether element exists and is checked
 */
function isElementChecked(elementId) {
  const el = document.getElementById(elementId);
  return el && el.checked;
}

// ============================================
// Event Helpers
// ============================================

/**
 * Add input handler that triggers translation
 * @param {string} inputId - Input textarea element ID
 * @param {function} handler - Handler function
 */
function onTextInputChange(inputId, handler) {
  const input = document.getElementById(inputId);
  if (input) {
    input.addEventListener("input", handler);

    // Select all on focus
    input.addEventListener("focus", function () {
      this.select();
    });
  }
}

/**
 * Add change handler to multiple radio/checkbox elements
 * @param {string} selector - CSS selector for elements
 * @param {function} handler - Handler function
 */
function onMultipleChange(selector, handler) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.addEventListener("change", handler);
  });
}

/**
 * IPA Core - Text processing functions
 *
 * Language-specific formatters should be imported directly from js/format/[lang].format.js
 * to avoid loading unused modules.
 */

// ============================================
// Text Processing
// ============================================

/**
 * Clean and preprocess input text
 * @param {string} text - Raw input text
 * @returns {string} Cleaned text
 */
function preprocessText(text) {
  return text
    .replace(/[;:>"<`~!@#$%^&*()={}|\\[\]/.,?!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Process text with character-based lookup and optional multi-char word search
 * (for CJK languages like Chinese, Japanese)
 *
 * @param {object} options - Options:
 *   @param {string} options.input - Input text
 *   @param {object} options.lookupTable - IPA lookup table
 *   @param {boolean} [options.withWords] - Show word:ipa format (default: false)
 *   @param {boolean} [options.allowWordSearch] - Enable multi-char matching (default: false)
 *   @param {number} [options.maxWordLength] - Max word length for matching (default: 6)
 *   @param {boolean} [options.pairsOnly] - Return [[word, ipa], ...] array instead of string (default: false)
 * @returns {string|string[][]} Processed result or pairs array
 */
function processTextCharBased(options) {
  const {
    input,
    lookupTable,
    withWords = false,
    allowWordSearch = false,
    maxWordLength = 6,
    pairsOnly = false,
    includeUnmatched = false
  } = options;

  let result = "";
  let pairs = [];
  let i = 0;

  while (i < input.length) {
    let matchedWord = null;
    let matchedIPA = null;
    let wordLength = 0;

    // Try multi-character word matching first
    if (allowWordSearch) {
      for (let len = maxWordLength; len >= 1; len--) {
        if (i + len <= input.length) {
          const word = input.substring(i, i + len);
          if (lookupTable[word]) {
            matchedWord = word;
            matchedIPA = lookupTable[word];
            wordLength = len;
            break;
          }
        }
      }
    }

    // Fall back to single character
    if (!matchedWord) {
      const char = input[i];
      if (lookupTable[char]) {
        matchedWord = char;
        matchedIPA = lookupTable[char];
        wordLength = 1;
      }
    }

    // Add result
    if (matchedWord) {
      result += withWords ? `( ${matchedWord} ${matchedIPA} ) ` : `${matchedIPA} `;
      if (pairsOnly) pairs.push([matchedWord, matchedIPA]);
      i += wordLength;
    } else {
      result += input[i] + " ";
      if (pairsOnly && includeUnmatched) pairs.push([input[i], null]);
      i++;
    }
  }

  if (pairsOnly) return { result: result.trim(), pairs };
  return result.trim();
}

/**
 * Process Vietnamese text with longest match word-based lookup
 * Optimized for Vietnamese language: splits by space, tries longest multi-word combinations
 * Uses greedy approach - matches longest possible phrase first
 *
 * @param {object} options - Options:
 *   @param {string} options.input - Input Vietnamese text
 *   @param {object} options.lookupTable - IPA lookup table with word->IPA mappings
 *   @param {boolean} [options.withWords] - Show word:IPA format (default: false)
 *   @param {boolean} [options.allowWordSearch] - Enable multi-word phrase matching (default: true)
 *   @param {number} [options.maxPhraseLength] - Max phrase length for matching (default: 5)
 *   @param {function} [options.onProgress] - Callback for progress updates
 *   @param {boolean} [options.pairsOnly] - Return [[word, ipa], ...] array instead of string (default: false)
 * @returns {string|string[][]} Processed result or pairs array
 */
function processTextLongestMatch(options) {
  const {
    input,
    lookupTable,
    withWords = false,
    allowWordSearch = true,
    maxPhraseLength = 5,
    onProgress = null,
    pairsOnly = false,
    includeUnmatched = false
  } = options;

  // Split text into words (Vietnamese uses spaces as word separators)
  const words = input.trim().split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return pairsOnly ? [] : "";
  }

  let result = "";
  let pairs = [];
  let i = 0;

  while (i < words.length) {
    let matchedIPA = null;
    let matchedWord = null;
    let matchLength = 0;

    // Try longest possible word combination first (greedy approach)
    // When allowWordSearch is false, only match single words
    const maxComboLength = allowWordSearch
      ? Math.min(maxPhraseLength, words.length - i)
      : 1;

    for (let len = maxComboLength; len >= 1; len--) {
      const candidate = words.slice(i, i + len).join(" ");

      const candidatesToCheck = [
        candidate,
        preprocessText(candidate),
        preprocessText(candidate).toLowerCase()
      ];

      for (const key of candidatesToCheck) {
        if (lookupTable[key]) {
          matchedIPA = lookupTable[key];
          matchedWord = candidate;
          matchLength = len;
          break;
        }
      }

      if (matchedIPA) break;
    }

    if (matchedIPA) {
      result += withWords ? `( ${matchedWord} ${matchedIPA} ) ` : matchedIPA + " ";
      if (pairsOnly) pairs.push([matchedWord, matchedIPA]);
      i += matchLength; // Skip all matched words
    } else {
      // No match found, keep original word
      result += words[i] + " ";
      if (pairsOnly && includeUnmatched) pairs.push([words[i], null]);
      i++;
    }

    if (onProgress) onProgress(result);
  }

  if (pairsOnly) return { result: result.trim(), pairs };
  return result.trim();
}

/**
 * Process Khmer text using greedy longest-match first, with Intl.Segmenter
 * as a fallback for breaking unknown text into word-like segments.
 * * @param {object} options - Options:
 * @param {string} options.input - Input Khmer text
 * @param {object} options.lookupTable - IPA lookup table (km.json)
 * @param {boolean} [options.withWords] - Show word:ipa format
 * @param {boolean} [options.pairsOnly] - Return array of [word, ipa]
 * @returns {string|object} Processed result
 */
function processKhmerText(options) {
  const { input, lookupTable, withWords = false, pairsOnly = false } = options;

  // 1. Clean hidden characters
  const sanitizedInput = input.replace(/[​-‍﻿]/g, '');

  const maxWordLength = 20;
  let result = "";
  let pairs = [];
  let i = 0;

  while (i < sanitizedInput.length) {
    let matchedWord = null;
    let matchedIPA = null;

    // Phase 1: Greedy longest-match from database
    // Try multi-character matches at any position (compounds, symbols, abbreviations).
    // Single-char matches are skipped so the segmenter can process full syllables.
    for (let len = maxWordLength; len >= 2; len--) {
      if (i + len <= sanitizedInput.length) {
        const candidate = sanitizedInput.substring(i, i + len);
        if (lookupTable[candidate]) {
          matchedWord = candidate;
          matchedIPA = lookupTable[candidate];
          break;
        }
      }
    }

    if (matchedWord) {
      result += withWords ? `( ${matchedWord} ${matchedIPA} ) ` : `${matchedIPA} `;
      if (pairsOnly) pairs.push([matchedWord, matchedIPA]);
      i += matchedWord.length;
    } else {
      // Phase 2: Use Intl.Segmenter to find word boundaries in remaining text
      const remaining = sanitizedInput.substring(i);
      const segmenter = new Intl.Segmenter('km', { granularity: 'word' });
      let consumed = 0;
      let processedThisChunk = false;

      for (const { segment, isWordLike } of segmenter.segment(remaining)) {
        consumed += segment.length;

        if (!isWordLike) {
          // Non-word-like (punctuation, symbols): try DB lookup, else pass through
          if (lookupTable[segment]) {
            result += withWords ? `( ${segment} ${lookupTable[segment]} ) ` : `${lookupTable[segment]} `;
            if (pairsOnly) pairs.push([segment, lookupTable[segment]]);
          } else {
            result += segment;
          }
          continue;
        }

        const cleanSegment = segment.trim();
        if (!cleanSegment) continue;

        // Try looking up the whole segment
        const segmentIPA = lookupTable[cleanSegment];
        if (segmentIPA) {
          result += withWords ? `( ${cleanSegment} ${segmentIPA} ) ` : `${segmentIPA} `;
          if (pairsOnly) pairs.push([cleanSegment, segmentIPA]);
        } else {
          /* Phase 3: Break into phonetic clusters
             This regex captures: Base Consonant + Subscripts + Vowels + Diacritics
          */
          const clusters = cleanSegment.match(/[ក-ឯ]([្][ក-ឯ])*[ា-៓ៗ]*/g) || [cleanSegment];

          for (const cluster of clusters) {
            const clusterIPA = lookupTable[cluster];
            if (clusterIPA) {
              result += withWords ? `( ${cluster} ${clusterIPA} ) ` : `${clusterIPA} `;
              if (pairsOnly) pairs.push([cluster, clusterIPA]);
            } else {
              result += cluster;
              if (pairsOnly) pairs.push([cluster, null]);
            }
          }
        }

        processedThisChunk = true;
        break; // Process one word at a time, then restart outer loop for Phase 1
      }

      i += consumed;
      if (!processedThisChunk && consumed === 0) {
        // Safety: advance one character to prevent infinite loop
        result += sanitizedInput[i];
        if (pairsOnly) pairs.push([sanitizedInput[i], null]);
        i++;
      }
    }
  }

  if (pairsOnly) return { result: result.trim(), pairs };
  return result.trim().replace(/\s+/g, ' ');
}

/**
 * Applies Korean phonological rules to an array of [word, ipa] pairs.
 * Rules handled: Nasalization, Tensing (Fortition), L-Assimilation, Aspiration.
 */
function applyKoreanPhonology(ipaArray) {
  for (let i = 0; i < ipaArray.length - 1; i++) {
    let current = ipaArray[i];
    let next = ipaArray[i + 1];
    const curIPA = current[1];
    const nxtIPA = next[1];

    // Nasal assimilation: p̚, k̚, t̚ + n → m, ŋ, n + n
    if (nxtIPA.startsWith('/n')) {
      if (curIPA.endsWith('p̚/')) ipaArray[i][1] = curIPA.replace('p̚/', 'm/');
      else if (curIPA.endsWith('k̚/')) ipaArray[i][1] = curIPA.replace('k̚/', 'ŋ/');
      else if (curIPA.endsWith('t̚/')) ipaArray[i][1] = curIPA.replace('t̚/', 'n/');
    }

    // Aspiration: k + h → kʰ
    if (curIPA.endsWith('k̚/') && nxtIPA.startsWith('/h')) {
      ipaArray[i][1] = curIPA.replace('k̚/', '/');
      ipaArray[i + 1][1] = nxtIPA.replace('/h', '/kʰ');
    }

    // Tensing (fortition): after a stop, plain consonants become tense
    const isStop = curIPA.endsWith('p̚/') || curIPA.endsWith('k̚/') || curIPA.endsWith('t̚/');
    if (isStop) {
      const tenseMap = { '/k': '/k͈', '/t': '/t͈', '/p': '/p͈', '/s': '/s͈', '/t͡ɕ': '/t͡ɕ͈' };
      for (const [plain, tense] of Object.entries(tenseMap)) {
        if (nxtIPA.startsWith(plain) && !nxtIPA.startsWith(tense)) {
          ipaArray[i + 1][1] = nxtIPA.replace(plain, tense);
          break;
        }
      }
    }

    // L-assimilation (lateralization)
    if (curIPA.endsWith('n/') && nxtIPA.startsWith('/l')) ipaArray[i][1] = curIPA.replace('n/', 'l/');
    if (curIPA.endsWith('l/') && nxtIPA.startsWith('/n')) ipaArray[i + 1][1] = nxtIPA.replace('/n', '/l');
  }
  return ipaArray;
}

/**
 * Process Korean text: character-based lookup with optional post-processing phonology rules.
 * @param {object} options - Same as processTextCharBased plus pairsOnly
 *   @param {boolean} [options.applyPhonology] - Apply Korean phonological rules to the
 *     database IPA (default: false — raw database values are shown unless opted in)
 * @returns {string|object} Processed result or pairs
 */
function processKorean(options) {
  const { input, withWords = false, pairsOnly = false, applyPhonology = false } = options;

  const { pairs: rawPairs } = processTextCharBased({ ...options, pairsOnly: true });
  const matchedPairs = rawPairs.filter(p => p[1] != null);

  let searchFrom = 0;
  const matches = matchedPairs.map(([word, ipa]) => {
    const start = input.indexOf(word, searchFrom);
    searchFrom = start + word.length;
    return { start, end: start + word.length, word, ipa };
  });

  let matchesWithUpdated = matches;
  if (applyPhonology) {
    const phonologyInput = matchedPairs.map(([word, ipa]) => [word, ipa]);
    applyKoreanPhonology(phonologyInput);
    const updatedIPA = phonologyInput.map(([word, ipa]) => ipa);
    matchesWithUpdated = matches.map((m, i) => ({ ...m, ipa: updatedIPA[i] }));
  }

  let result = "";
  let mi = 0;
  for (let i = 0; i < input.length; i++) {
    if (mi < matchesWithUpdated.length && i === matchesWithUpdated[mi].start) {
      const m = matchesWithUpdated[mi];
      result += withWords ? `( ${m.word} ${m.ipa} ) ` : m.ipa + " ";
      i += m.word.length - 1;
      mi++;
    } else {
      result += input[i] === " " ? "  " : String(input[i]) + " ";
    }
  }

  if (pairsOnly) return { result: result.trim(), pairs: matchesWithUpdated.map(m => [m.word, m.ipa]) };
  return result.trim().replace(/\s+/g, ' ');
}

const profiles = [
  ['korean','한국어','한글','안녕하세요'],
  ['japanese','일본어','가타카나','猫'],
  ['english','영어','영어식 읽기','hello'],
  ['mandarin','중국어 (표준어)','한어병음 · 성조 근사','你好'],
  ['cantonese','광둥어','월병 · 성조 근사','你好'],
  ['arabic','아랍어','아랍 문자','سلام'],
  ['persian','페르시아어','페르시아 문자','سلام'],
  ['khmer','크메르어','크메르 문자','សួស្ដី'],
  ['odia','오디아어','오디아 문자','ଓଡ଼ିଆ'],
  ['dutch','네덜란드어','네덜란드어식','hallo'],
  ['norwegian','노르웨이어','노르웨이어식','hei'],
  ['german','독일어','독일어식','hallo'],
  ['romanian','루마니아어','루마니아어식','salut'],
  ['malay','말레이어','말레이어식','selamat'],
  ['vietnamese','베트남어','하노이식 · 성조 근사','xin chào'],
  ['swahili','스와힐리어','스와힐리어식','jambo'],
  ['swedish','스웨덴어','스웨덴어식','hej'],
  ['spanish','스페인어','스페인어식','hola'],
  ['icelandic','아이슬란드어','아이슬란드어식','halló'],
  ['esperanto','에스페란토','에스페란토식','saluto'],
  ['italian','이탈리아어','이탈리아어식','ciao'],
  ['jamaican','자메이카 크리올어','자메이카 크리올어식','unu'],
  ['portuguese','포르투갈어','포르투갈어식','olá'],
  ['french','프랑스어','프랑스어식','bonjour'],
  ['finnish','핀란드어','핀란드어식','hei'],
].map(([id,name,script,example])=>({id,name,script,example}));

const map = text => Object.fromEntries(text.trim().split(/\s+/u).map(item=>item.split('=')));
const vowels = new Set([...'aiueoɛɔəʊɪæʌɑɐɒɜɚɝɯɨʉyøœɘɵɞɤʏɶɿʅ']);
const ipaSegments = new Set(['tʃ','dʒ','ts','dz','tɕ','dʑ','tʂ','dʐ','ʈʂ','ɖʐ','pf','kx','ʈʃ','ɖʒ','dɮ']);
const tiedConsonants=new Set(['k͡p','ɡ͡b','g͡b','ŋ͡m']);
const voicedPeers=map('p=b t=d ʈ=ɖ c=ɟ k=ɡ q=ɢ ɸ=β f=v θ=ð s=z ʃ=ʒ ɕ=ʑ ʂ=ʐ ç=ʝ x=ɣ χ=ʁ ħ=ʕ ɬ=ɮ tʃ=dʒ ts=dz tɕ=dʑ tʂ=dʐ ʈʂ=ɖʐ ʈʃ=ɖʒ k͡p=ɡ͡b');
const voicelessPeers={...Object.fromEntries(Object.entries(voicedPeers).map(([voiceless,voiced])=>[voiced,voiceless])),g:'k','g͡b':'k͡p'};
const ipaTie=/^[͜͡]$/u;
const ipaModifier=/^[\p{M}ʰʱːˑʷʲˠˤˀᵝʶʼ˞]$/u;

function ipaModifiersEnd(characters,start) {
  let end=start;
  while(ipaModifier.test(characters[end]??'')&&!ipaTie.test(characters[end]))end++;
  return end;
}
const ipaConsonants = new Set([...'pbtdcɟkɡgqɢʔʡmnɱŋɲɳɴɰɥwjɹɻɾrɽʀʁɸβfvθðszʃʒɕʑʂʐçʝxɣχʑʒʐʙʍʜɬʟɺʎɧʢʠⱱɼlɫɭɮʋɦhʕħɖʈɠɓɗʄʛʘǀǃǂǁ']);

function ipaVoicingPeer(sound,marks) {
  const voiced=marks.includes('̬'), voiceless=/[̥̊]/u.test(marks);
  if(voiced===voiceless)return;
  return (voiceless?voicelessPeers:voicedPeers)[sound];
}

function firstReading(ipa) {
  const cleaned = ipa.trim();
  const match = cleaned.match(/^\/([^/]+)\//u) || cleaned.match(/^\[([^\]]+)\]/u);
  return (match?.[1] ?? cleaned.split(/\s*[,;]\s*/u)[0]).trim();
}

function tokenizeIPA(ipa, source, withOffsets=false) {
  const plainCase=['swahili','icelandic','jamaican'].includes(source) ? ipa.replace(/[A-Z]/gu,letter=>letter.toLowerCase()) : ipa;
  const phonetic = source==='khmer' ? plainCase.replace(/y/gu,'j').replace(/([aɑɔeɛəɨiʊou])\1/gu,'$1ː') : plainCase;
  const prepared = phonetic.normalize('NFD').replace(/:/gu,'ː').replace(/([.ˈˌ])([ːˑ]+)/gu,'$2$1').replace(/ᵻ/gu,'ɪ̈').replace(/ᵿ/gu,'ʊ̈').replace(/γ/gu,'ɣ').replace(/ε/gu,'ɛ').replace(/c\u0327/gu,'ç').replace(/ɲj/gu,'ɲ')
    .replace(/ᵐ/gu,'m').replace(/ⁿ/gu,'n').replace(/ᵑ/gu,'ŋ').replace(/ᶮ/gu,'ɲ');
  const characters = [...prepared];
  const tokens = [];
  tokens.unknownPhones=new Set();
  if(withOffsets)tokens.inputCharacters=characters;
  let syllableStart=false, writtenBoundary=false, stress='';
  for (let index=0; index<characters.length; index++) {
    const offset=index;
    let sound = characters[index];
    if(sound==='.' || sound==='ˈ' || sound==='ˌ'){
      syllableStart=true;
      if(sound==='.')writtenBoundary=true;
      else stress=sound;
      continue;
    }
    if(/[˥˦˧˨˩]/u.test(sound)){
      const previous=tokens.at(-1);
      if(previous?.sound)previous.tone=(previous.tone??'')+sound;
      continue;
    }
    if(sound==='ˀ' && tokens.at(-1)?.tone) {
      tokens.at(-1).tonalGlottalization=true;
      continue;
    }
    if (/\s/u.test(sound) || sound === '‿') {
      tokens.push({separator:sound==='‿'?' ':sound});
      continue;
    }
    if(source==='vietnamese'&&sound==='ʔ'&&tokens.at(-1)?.tone&&
      /^(?:[\s-]|$)/u.test(characters[index+1]??'')) {
      tokens.at(-1).tonalGlottalization=true;
      continue;
    }
    const firstEnd=ipaModifiersEnd(characters,index+1);
    const tie=ipaTie.test(characters[firstEnd]??'');
    const second=characters[tie?firstEnd+1:index+1]??'';
    const pair=sound+second, tied=sound+'͡'+second;
    let firstMarks='';
    if(tie&&(tiedConsonants.has(tied)||ipaSegments.has(pair))){
      sound=tiedConsonants.has(tied)?tied:pair;
      firstMarks=characters.slice(index+1,firstEnd).join('');
      index=firstEnd+1;
    } else if(!tie&&ipaSegments.has(pair)){
      sound=pair;
      index++;
    } else if(firstEnd>index+1) {
      const modifiers=characters.slice(index+1,firstEnd).join('');
      if(tie||/^[̥̬̊]+$/u.test(modifiers)) {
        // Some dictionaries omit the tie, even when the first part is marked.
        const peer=ipaVoicingPeer(sound,modifiers);
        const next=firstEnd+Number(tie);
        if(peer&&ipaSegments.has(peer+characters[next])){
          sound=peer+characters[next];
          firstMarks=modifiers.replace(/[̥̬̊]/gu,'');
          index=next;
        }
      }
    }
    if (!vowels.has(sound) && !ipaConsonants.has(sound) && !ipaSegments.has(sound) && !tiedConsonants.has(sound)) {
      if (/\p{L}/u.test(sound) && !/[ˈˌ˥˦˧˨˩ꜛꜜʰʱʲʷˠˤˀᵝʶʼ]/u.test(sound)) tokens.unknownPhones.add(sound);
      continue;
    }
    const end=offset===index?firstEnd:ipaModifiersEnd(characters,index+1);
    let marks=(firstMarks+characters.slice(index+1,end).join('')).replace(/̍/gu,'̩').replace(/̊/gu,'̥');
    index=end-1;
    const peer=ipaVoicingPeer(sound,marks);
    if(peer){
      sound=peer;
      marks=marks.replace(/[̥̬]/gu,'');
    }
    if (marks.includes('˞')) sound=({ə:'ɚ',ɜ:'ɝ'})[sound] ?? sound;
    const token = {sound, marks, vowel:vowels.has(sound), length:marks.includes('ː'), nasal:marks.includes('\u0303'), coda:marks.includes('\u031a')};
    if(withOffsets)token.offset=offset;
    if (source==='korean' && sound==='ʌ') token.koreanEo = true;
    if(syllableStart)token.syllableStart=true;
    if(writtenBoundary)token.writtenBoundary=true;
    if(stress)token.stress=stress;
    syllableStart=false;
    writtenBoundary=false;
    stress='';
    const previous=tokens.at(-1);
    if(source==='finnish' && !token.syllableStart && !token.length && previous?.sound===sound && !previous.length && previous.marks===marks) {
      previous.marks+='ː';
      previous.length=true;
      continue;
    }
    tokens.push(token);
  }
  if(source==='mandarin')normalizeMandarinMedials(tokens);
  return tokens;
}

const mandarinRoundedNuclei=new Set(['a','ɑ','ə','ɔ']);

function normalizeMandarinMedials(tokens) {
  for(const [index,phone] of tokens.entries()) {
    if((phone.sound!=='u'&&phone.sound!=='w')||phone.length||phone.nasal||phone.tone||phone.marks.includes('̩'))continue;
    const following=tokens[index+1], preceding=tokens[index-1];
    if(following?.syllableStart||!mandarinRoundedNuclei.has(following?.sound))continue;
    if(phone.vowel&&preceding?.vowel&&!preceding.tone&&!phone.syllableStart)continue;
    phone.sound='w';
    phone.vowel=false;
    phone.medialGlide=true;
    phone.marks=phone.marks.replace(/̯/gu,'');
  }
}

const phoneticBase = map('p=p b=b t=t d=d c=k ɟ=g k=k ɡ=g g=g q=k ɢ=g ʔ=ʔ ʡ=ʔ m=m n=n ɱ=m ŋ=ŋ ɲ=ɲ ɳ=n ɴ=ŋ ɰ=ɰ ɥ=ɥ w=w j=j ɹ=r ɻ=r ɾ=r r=r ɽ=r ʀ=ʁ ʁ=ʁ ɸ=f β=v ɧ=ʃ ʢ=ʕ ʠ=k ⱱ=v ɼ=r f=f v=v θ=θ ð=ð s=s z=z ʃ=ʃ ʒ=ʒ ɕ=ʃ ʑ=ʒ ʂ=ʃ ʐ=ʒ ç=ç ʝ=j x=x ɣ=ɣ χ=x ʙ=b ʍ=w ʜ=h ɬ=ɬ ʟ=l ɺ=r ʎ=ʎ l=l ɫ=l ɭ=l ɮ=z ʋ=v ɦ=h h=h ʕ=ʕ ħ=ħ ɖ=d ʈ=t ɠ=g ɓ=b ɗ=d ʄ=dʒ ʛ=g ʘ=p ǀ=t ǃ=k ǂ=ts ǁ=l tʃ=tʃ dʒ=dʒ ts=ts dz=dz tɕ=tʃ dʑ=dʒ tʂ=tʃ dʐ=dʒ ʈʂ=tʃ ɖʐ=dʒ pf=pf kx=k ʈʃ=tʃ ɖʒ=dʒ dɮ=dz k͡p=k ɡ͡b=g g͡b=g ŋ͡m=ŋ');
const fiveVowels=map('a=a ɑ=a ɐ=a æ=a ɶ=a i=i ɪ=i ɿ=i ʅ=i e=e ɛ=e ə=e ɘ=e ɜ=e ɚ=e ɝ=e u=u ʊ=u ɯ=u ɨ=u ʉ=u y=u ʏ=u o=o ɔ=o ɒ=o ʌ=o ɵ=o ɞ=o ɤ=o ø=e œ=e');
const basicLatin=map('a=a i=i u=u e=e o=o æ=a ɑ=a ɐ=a ɒ=o ɛ=e ɔ=o ə=e ʊ=u ɪ=i ʌ=a ɜ=e ɚ=er ɝ=er ɯ=u ɨ=i ʉ=u y=u ø=e œ=e ɘ=e ɵ=o ɞ=o ɤ=o ʏ=u ɶ=a ɿ=i ʅ=i j=y ŋ=ng ɲ=ny ʎ=ly ɰ=w ɥ=y ʃ=sh ʒ=zh tʃ=ch dʒ=j x=kh ɣ=gh ʁ=r θ=th ð=dh ɬ=hl ħ=h ç=hy ʕ=a ʔ=ʼ');
const latinRules = Object.fromEntries(Object.entries({
  english:'a=ah ɑ=ah ɐ=uh ɒ=oh æ=a i=ee ɪ=ih e=ay ɛ=eh ə=uh ʊ=oo u=oo ʌ=uh ɜ=ur ɚ=er ɝ=ur ɯ=oo ɨ=ih y=ee ø=uh œ=uh o=oh ɔ=aw ʎ=ly ʒ=zh dʒ=j ð=th x=kh',
  dutch:'ɑ=a i=ie u=oe y=uu ʏ=u ø=eu œ=eu ə=e x=ch ɣ=g j=j ʃ=sj ʒ=zj tʃ=tsj dʒ=dj ɲ=nj',
  norwegian:'o=å ɔ=å u=o ʉ=u y=y ø=ø œ=ø ə=e j=j ʃ=sj ʒ=sj ç=kj ɲ=nj ʎ=lj tʃ=tsj dʒ=dj x=k',
  german:'u=u y=ü ʏ=ü ø=ö œ=ö ə=e j=j ʃ=sch ʒ=sch tʃ=tsch dʒ=dsch ç=ch x=ch z=s ts=z ɲ=nj ʎ=lj v=w',
  romanian:'ə=ă ɨ=î ɯ=î j=i ʃ=ș ʒ=j ts=ț tʃ=ci dʒ=gi ɲ=ni ʎ=li x=h',
  malay:'ə=e tʃ=c dʒ=j ʃ=sy ʒ=z x=kh ɣ=gh ɲ=ny ŋ=ng',
  vietnamese:'ə=ơ ɤ=ơ ɯ=ư ʌ=â ɛ=e e=ê ɔ=o o=ô æ=a j=y w=u ɲ=nh ŋ=ng ʃ=s ʒ=gi tʃ=ch dʒ=gi z=d x=kh ɣ=gh',
  swahili:'ɲ=ny ŋ=ng’ ʃ=sh ʒ=j tʃ=ch dʒ=j ð=dh θ=th x=kh ɣ=gh',
  swedish:'o=å u=o ʉ=u y=y ø=ö œ=ö ɛ=ä æ=ä ɔ=å j=j ʃ=sj ʒ=sj ç=tj ɲ=nj ʎ=lj tʃ=tj dʒ=dj x=ch',
  spanish:'j=y ɲ=ñ ʎ=ll x=j ɣ=g ʃ=sh ʒ=y tʃ=ch dʒ=y θ=z ð=d b=b v=v ʌ=o',
  icelandic:'a=a au=á y=y ʏ=u ɪ=i ø=ö œ=ö ɛ=e ɔ=o j=j ɲ=nj x=kh θ=þ ð=ð ʃ=sj tʃ=tsj dʒ=dj',
  esperanto:'j=j ɲ=nj ʎ=lj ʃ=ŝ ʒ=ĵ x=ĥ tʃ=ĉ dʒ=ĝ ts=c dz=dz w=ŭ',
  italian:'j=i ɲ=gn ʎ=gli ʃ=sci ʒ=gi tʃ=ci dʒ=gi ts=z dz=z x=h ɣ=g θ=t ð=d ʌ=o',
  jamaican:'ɑ=a æ=a ɪ=i ʊ=u ɛ=e ɔ=o ə=a ʌ=o ɲ=ny ʃ=sh ʒ=zh tʃ=ch dʒ=j θ=t ð=d ʕ=h',
  portuguese:'j=i w=u ɲ=nh ʎ=lh ʃ=x ʒ=j tʃ=tch dʒ=dj ʁ=rr x=rr ŋ=ng ə=e ɐ=a',
  french:'u=ou y=u ʏ=u ø=eu œ=eu ə=e ɲ=gn ŋ=ng ʎ=ill ʃ=ch ʒ=j tʃ=tch dʒ=dj ʁ=r k=k w=ou j=y ɛ=è ɔ=o ʌ=a',
  finnish:'æ=ä ø=ö œ=ö y=y ʏ=y j=j ʃ=š ʒ=ž ŋ=ng ɲ=nj tʃ=tš dʒ=dž x=h ɐ=a',
}).map(([id,value])=>[id,map(value)]));

const icelandicInitialStops=map('p=b t=d k=g');
const icelandicInitialVoiceless=map('l=hl n=hn r=hr');
const romanianPalatalFinals=map('k=chi g=ghi');
const hasAspiratedRelease=phone=>/[ʰʱ]/u.test(phone.marks);

const beforeFrontVowel={
  spanish:map('k=qu g=gu ɣ=gu θ=c'), italian:map('k=ch g=gh tʃ=c dʒ=g ʃ=sc'),
  portuguese:map('k=qu g=gu'), french:map('k=qu g=gu'), romanian:map('k=ch g=gh tʃ=c dʒ=g'),
};

const intervocalicLatin={
  french:map('s=ss'),
  portuguese:map('s=ss'),
  spanish:map('r=rr'),
  german:map('s=ss'),
};

const latinQuantityRules={
  finnish:{double:true},
  jamaican:{longVowels:map('a=aa i=ii u=uu'),doubleConsonant:true},
  german:{longSounds:map('a=aa e=ee o=oo i=ie')},
  italian:{doubleConsonant:true},
  dutch:{closedLong:map('a=aa e=ee o=oo y=uu'),shortVowels:new Set('ɑ ɛ ɔ ɪ ʏ'.split(' '))},
  norwegian:{doubleAfterVowel:true},
  swedish:{doubleAfterVowel:true,doubleLetters:map('k=ck')},
};

function longerLatin(letter,phone,target) {
  const policy=latinQuantityRules[target];
  if(!policy||!phone.length)return letter;
  if(phone.vowel)return policy.longSounds?.[phone.sound]??policy.longVowels?.[letter]??(policy.double&&letter.length===1?letter+letter:letter);
  if(target==='italian'&&/^[cg][hi]$/u.test(letter))return letter[0]+letter;
  if((policy.double||policy.doubleConsonant)&&letter.length===1)return letter+letter;
  return letter;
}

function latinQuantityOverrides(syllables,target) {
  const policy=latinQuantityRules[target];
  if(!policy?.closedLong&&!policy?.doubleAfterVowel)return;
  const overrides=new Map();
  for(const [index,{nucleus,coda}] of syllables.entries()) {
    if(nucleus.length!==1||!nucleus[0].vowel)continue;
    const vowel=nucleus[0], next=syllables[index+1];
    if(policy.closedLong&&vowel.length&&coda.length&&policy.closedLong[vowel.sound]) {
      overrides.set(vowel,policy.closedLong[vowel.sound]);
    }
    const cluster=next?[...coda,...next.onset]:coda;
    const explicitGeminate=policy.doubleAfterVowel ? cluster.find(phone=>phone.length) : undefined;
    if(vowel.length||cluster.length!==1&&!explicitGeminate)continue;
    const consonant=explicitGeminate??cluster[0], letter=phoneticBase[consonant.sound];
    if(!/^[bdfgklmnprstvz]$/u.test(letter??'')||letter==='m'&&!next)continue;
    const closedShort=cluster.length===1&&policy.shortVowels?.has(vowel.sound)&&next;
    if(closedShort||explicitGeminate) {
      const spelling=latinRules[target][letter]??letter;
      if(spelling.length===1)overrides.set(consonant,policy.doubleLetters?.[spelling]??spelling+spelling);
    }
  }
  return overrides;
}

function writtenLatinVowel(phone,target,rules) {
  const sound=phone.sound;
  const letter=rules[sound] ?? basicLatin[sound] ?? sound;
  if(!phone.nasal)return letter;
  if(target==='french')return ({a:'an',ɑ:'an',ɐ:'an',ɛ:'in',æ:'in',ɔ:'on',o:'on',œ:'un'})[sound] ?? letter+'n';
  if(target==='portuguese')return ({a:'ã',ɑ:'ã',ɐ:'ã',o:'õ',ɔ:'õ'})[sound] ?? letter+'n';
  return letter;
}

function latinLetters(tokens, target, overrides) {
  const rules = latinRules[target];
  return tokens.map((token,index)=>{
    if(token.separator !== undefined) return token.separator;
    const sound = token.vowel ? token.sound : phoneticBase[token.sound];
    const previous=tokens[index-1], next=tokens[index+1];
    const palatalOnset=next?.vowel&&phoneticBase[previous?.sound]!=='s'?palatalLatinOnsets[target]?.[token.sound]:undefined;
    let letter=token.vowel ? writtenLatinVowel(token,target,rules) : palatalOnset ?? rules[sound] ?? basicLatin[sound] ?? sound;
    if(target==='norwegian'&&letter==='å'&&next?.vowel&&!next.writtenBoundary&&['i','ɪ'].includes(next.sound))letter='o';
    if (target==='english' && token.koreanEo) letter = 'uh';
    if (sound==='k' && (['spanish','italian'].includes(target) || target==='portuguese'&&next?.vowel))letter='c';
    if(target==='icelandic'&&index===0) {
      if(next?.vowel&&!hasAspiratedRelease(token))letter=icelandicInitialStops[token.sound]??letter;
      if(token.marks.includes('̥')&&(next?.vowel||next?.sound==='j'&&tokens[2]?.vowel)){
        letter=icelandicInitialVoiceless[token.sound]??letter;
      }
    }
    const frontSpelling=beforeFrontVowel[target]?.[sound];
    if(frontSpelling && next) {
      const writtenVowel=next.vowel ? writtenLatinVowel(next,target,rules) :
        next.sound==='j' && ['k','g','ɣ'].includes(sound) ? rules.j : '';
      if(/^[eièéêëíì]/u.test(writtenVowel??''))letter=frontSpelling;
    }
    const betweenVowels=previous?.vowel && next?.vowel;
    if(target==='portuguese' && ['ʁ','x'].includes(sound) && next?.vowel &&
      (!previous||['l','n','s'].includes(phoneticBase[previous.sound])))letter='r';
    if(target==='portuguese' && sound==='ʃ' && next?.vowel)letter='ch';
    const contrastKey=target==='spanish' ? token.sound : sound;
    if(betweenVowels)letter=intervocalicLatin[target]?.[contrastKey] ?? letter;
    if(target==='german' && sound==='s' && previous?.vowel && (!next||next.vowel)) {
      const beforePrevious=tokens[index-2];
      const afterDiphthong=beforePrevious?.vowel && !previous.syllableStart &&
        diphthongs.has(beforePrevious.sound+previous.sound);
      if(previous.length||afterDiphthong)letter='ß';
    }
    if(target==='german' && token.length && /^[aeo]$/u.test(sound) && next?.sound==='s' &&
      (!tokens[index+2]||tokens[index+2].vowel))return letter;
    if(target==='romanian'&&!next&&!token.vowel&&token.marks.includes('ʲ')){
      letter=romanianPalatalFinals[sound]??(letter.endsWith('i')?letter:letter+'i');
    }
    if (target==='italian' && sound==='ʎ' && next?.sound==='i') letter='gl';
    if (target==='german' && sound==='ʃ' && !index && ['t','p'].includes(phoneticBase[next?.sound])) letter='s';
    if (target==='vietnamese') {
      const front=['e','ɛ','i','ɪ','y'].includes(next?.sound);
      if(sound==='k') letter=token.sound==='c'?'ch':front?'k':'c';
      if(token.vowel&&token.marks.includes('̆'))letter=({a:'ă',ɤ:'â'})[sound]??letter;
      if(['g','ɣ'].includes(sound)) letter=front?'gh':'g';
      if(sound==='ŋ' && front) letter='ngh';
      if(sound==='f') letter='ph';
      if(sound==='d') letter='đ';
    }
    if(token.vowel && token.nasal && ['french','portuguese'].includes(target))return letter;
    return overrides?.get(token) ?? longerLatin(letter,token,target);
  });
}

function latinSpelling(tokens,target,overrides) {
  return latinLetters(tokens,target,overrides).join('');
}

// Jamaican Language Unit's Cassidy–JLU vowel letters and nasal marker.
const jamaicanDiphthongs=map('ɪɛ=ie ie=ie uɔ=uo uo=uo aɪ=ai ai=ai ɑi=ai aʊ=ou ɑu=ou ɔu=ou ou=ou');
function jamaicanWord(phones) {
  const letters=[];
  for(let index=0;index<phones.length;index++) {
    const phone=phones[index], next=phones[index+1];
    const pair=phone.vowel && next?.vowel && !phone.length && !next.length && !next.syllableStart
      ? jamaicanDiphthongs[phone.sound+next.sound] : undefined;
    if(pair) {
      letters.push(pair+(phone.nasal||next.nasal?'hn':''));
      index++;
      continue;
    }
    const letter=latinSpelling([phone],'jamaican');
    letters.push(letter+(phone.vowel&&phone.nasal?'hn':''));
  }
  const units=letters.filter(Boolean);
  return units.map((letter,index)=>{
    const previous=units[index-1];
    const digraph=previous?.length===1?previous+letter[0]:'';
    const merges=Object.hasOwn(jamaicanSourceVowels,digraph)||Object.hasOwn(jamaicanSourceConsonants,digraph);
    const nasalMarker=digraph==='hn'&&Object.hasOwn(jamaicanSourceVowels,units[index-2]);
    return merges||nasalMarker?'-'+letter:letter;
  }).join('');
}

function groupSegments(tokens, render, adjacent='') {
  const output = [];
  let word = [];
  function flush() {
    if (word.length) output.push(render(word));
    word = [];
  }
  for (const token of tokens) {
    if (token.separator !== undefined) {
      flush();
      output.push(token.separator || adjacent);
    } else {
      word.push(token);
    }
  }
  flush();
  return output.join('');
}

const kanaRows = Object.fromEntries(Object.entries({
  '':'アイウエオ', k:'カキクケコ', g:'ガギグゲゴ', s:'サシスセソ', z:'ザジズゼゾ',
  t:'タティトゥテト', d:'ダディドゥデド', n:'ナニヌネノ', h:'ハヒフヘホ',
  b:'バビブベボ', p:'パピプペポ', m:'マミムメモ', r:'ラリルレロ',
  j:'ヤイユイェヨ', w:'ワウィウウェウォ', f:'ファフィフフェフォ', v:'ヴァヴィヴヴェヴォ',
  'ʃ':'シャシシュシェショ', 'ʒ':'ジャジジュジェジョ', 'tʃ':'チャチチュチェチョ', 'dʒ':'ジャジジュジェジョ',
  ts:'ツァツィツツェツォ', 'ɲ':'ニャニニュニェニョ', ky:'キャキキュキェキョ', gy:'ギャギギュギェギョ',
  hy:'ヒャヒヒュヒェヒョ', my:'ミャミミュミェミョ', ry:'リャリリュリェリョ',
  by:'ビャビビュビェビョ', py:'ピャピピュピェピョ',
}).map(([key,value])=>[key,value.match(/.[ァィゥェォャュョ]?/gu)]));
const kanaPalatalConsonants=map('n=ɲ s=ʃ z=ʒ t=tʃ d=dʒ');
const kanaRoundedRows={k:['クァ','クィ','','クェ','クォ'],g:['グァ','グィ','','グェ','グォ']};
const kanaConsonant = map('l=r ʎ=ry ʁ=r x=h ɣ=g ç=hy ɬ=r θ=s ð=z dz=z pf=f ɰ=w ɥ=j ŋ=g ħ=h ʕ= ʔ=');

function kanaWord(word) {
  const sounds = word.map(token=> token.vowel ? {...token,sound:fiveVowels[token.sound]} :
    {...token,sound:kanaConsonant[phoneticBase[token.sound]] ?? phoneticBase[token.sound]});
  const output=[];
  for (let i=0;i<sounds.length;i++) {
    const current=sounds[i], next=sounds[i+1];
    const prev=sounds[i-1];
    if (current.vowel) {
      output.push(kanaRows['']['aiueo'.indexOf(current.sound)] + (current.length?'ー':''));
      continue;
    }
    if (word[i].marks.includes('̩') && ['n','ŋ','ɴ'].includes(word[i].sound)) {
      output.push('ン');
      continue;
    }
    if (current.sound==='') {
      if(sounds.length===1) output.push(word[i].sound==='ʔ'?'ッ':'ア');
      continue;
    }
    const nasalCoda = ['m','n','g','ɲ'].includes(current.sound) && prev?.vowel && (current.plannedCoda||!next?.vowel) &&
      (current.sound!=='g' || ['ŋ','ɴ'].includes(word[i].sound));
    if (nasalCoda) { output.push(current.sound==='m'?'ム':'ン'); continue; }
    if (current.sound===next?.sound && sounds[i+2]?.vowel && ['k','g','p','b','t','d','s','ʃ','tʃ'].includes(current.sound)) {
      output.push('ッ'); continue;
    }
    let key=current.sound;
    if (next?.sound==='j' && sounds[i+2]?.vowel) {
      const palatalized=kanaPalatalConsonants[key]??key+'y';
      if (kanaRows[palatalized]) { key=palatalized; i++; }
    }
    const vowelAfterGlide=sounds[i+2];
    const rounded=sounds[i+1]?.sound==='w'&&vowelAfterGlide?.vowel?
      kanaRoundedRows[key]?.['aiueo'.indexOf(vowelAfterGlide.sound)]:undefined;
    if(rounded&&word[i+1].secondaryGlide) {
      output.push(rounded+(vowelAfterGlide.length?'ー':''));
      i+=2;
      continue;
    }
    const following=sounds[i+1];
    if (following?.vowel) {
      if(current.length && prev?.vowel) {
        if(['m','n','ɲ'].includes(key))output.push('ン');
        else if(['k','g','p','b','t','d','s','z','ʃ','ʒ','tʃ','dʒ','r','f','v'].includes(current.sound))output.push('ッ');
      }
      output.push((kanaRows[key] ?? kanaRows[''])['aiueo'.indexOf(following.sound)] + (following.length?'ー':''));
      i++;
    } else if (current.coda && ['k','t','p'].includes(key)) {
      output.push(({k:'ク',t:'ッ',p:'プ'})[key]);
    } else {
      output.push((kanaRows[key] ?? kanaRows[''])['aiueo'.indexOf(key==='t'||key==='d'?'o':'u')]);
    }
  }
  return output.join('');
}

const onsetKor = map('k=0 kʰ=15 g=0 t=3 tʰ=16 d=3 p=7 pʰ=17 b=7 m=6 n=2 ɲ=2 ŋ=11 s=9 s͈=10 z=12 ʃ=9 ʒ=12 tʃ=14 dʒ=12 ts=14 dz=12 r=5 l=5 ʎ=5 ʁ=5 f=17 v=7 h=18 x=18 ç=18 ɣ=0 θ=9 ð=3 ɬ=5 ħ=18 ʕ=11 ʔ=11 pf=17');
const codaKor=map('k=1 g=1 ŋ=21 n=4 ɲ=4 m=16 t=7 d=7 p=17 b=17 l=8 r=8');
const vowelKor=map('a=0 ɑ=0 ɐ=0 æ=1 ɛ=1 ə=4 ʌ=4 ɜ=4 ɚ=4 ɝ=4 ɒ=8 ɔ=8 o=8 i=20 ɪ=20 u=13 ʊ=13 ɯ=18 ɨ=18 ʉ=13 y=16 ʏ=16 e=5 ø=11 œ=11 ɘ=5 ɵ=8 ɞ=8 ɤ=4 ɶ=0 ɿ=20 ʅ=20');
const glidesKor=map('j0=2 j1=3 j4=6 j5=7 j8=12 j13=17 w0=9 w1=10 w4=14 w5=15 w20=16 ɰ20=19 ɥ5=15');

function koreanWord(word) {
  const output=[];
  for (let i=0;i<word.length;) {
    const token=word[i];
    const sound=phoneticBase[token.sound];
    let onset=11, glide='', vowel=18, coda=0;
    if (!token.vowel) {
      if (['w','j','ɰ','ɥ'].includes(sound)) glide=sound;
      else {
        const aspirate=hasAspiratedRelease(token)?onsetKor[sound+'ʰ']:undefined;
        onset=Number(token.koreanOnset ?? aspirate ?? onsetKor[sound+token.marks] ?? onsetKor[sound] ?? 11);
        if (token.marks.includes('͈')) onset=({0:1,3:4,7:8,9:10,12:13,14:13})[onset] ?? onset;
        if (sound==='ɲ' || sound==='ʃ' && ['a','u','o'].includes(word[i+1]?.sound)) glide='j';
      }
      i++;
    }
    if (['w','j','ɰ','ɥ'].includes(phoneticBase[word[i]?.sound]) && word[i+1]?.vowel) {
      glide=phoneticBase[word[i++].sound];
    }
    if (word[i]?.vowel) vowel=Number(vowelKor[word[i++].sound] ?? 18);
    vowel=Number(glidesKor[glide+vowel] ?? vowel);
    const next=word[i];
    const following=word[i+1];
    if(next?.plannedCoda && !next.vowel) {
      const final=codaKor[phoneticBase[next.sound]];
      if(final) {coda=Number(final);i++;}
    }
    else if(next?.length && following?.vowel && !next.vowel) coda=Number(codaKor[phoneticBase[next.sound]] ?? 0);
    else if (next && !next.vowel && !following?.vowel && !['j','w','ɰ','ɥ'].includes(phoneticBase[following?.sound])) {
      const final=codaKor[phoneticBase[next.sound]];
      if (final) { coda=Number(final); i++; }
    }
    output.push(String.fromCodePoint(0xac00+onset*588+vowel*28+coda));
  }
  return output.join('');
}

const abjadConsonants = map('p=پ b=ب t=ت d=د k=ك g=گ q=ق ʔ=ء m=م n=ن ŋ=نگ ɲ=ني ʎ=لي j=ي w=و ɰ=و ɥ=ي r=ر ʁ=غ l=ل f=ف v=ڤ θ=ث ð=ذ s=س z=ز ʃ=ش ʒ=ژ tʃ=چ dʒ=ج ts=تس dz=دز pf=بف x=خ ɣ=غ ç=خ h=ه ħ=ح ʕ=ع ɬ=ل');
const arabicConsonants = map('p=ب g=غ v=ف tʃ=تش ʒ=ج ŋ=ن ɲ=ني');
const persianConsonants = map('k=ک j=ی ɥ=ی ɲ=نی ʎ=لی v=و θ=ث ð=ذ');
const arabicEmphatics = map('t=ط d=ض s=ص ð=ظ z=ظ');
const shortAbjadVowels = map('a=َ e=ِ i=ِ u=ُ o=ُ');
const longArabicVowels = map('a=ا e=ي i=ي u=و o=و');
const persianVowelLetters = map('ɑ=ا ɒ=ا i=ی y=ی u=و ʉ=و ɯ=و');
const persianShortVowels = map('ɪ=e ɨ=e ɿ=e ʅ=e ʊ=o ʏ=o ʌ=a');

const abjadFallingGlides = map('ai=j aɪ=j au=w aʊ=w');
const persianFallingGlides = map('ei=j eɪ=j ou=w oʊ=w');

function abjadWord(syllables, target) {
  const word=syllables.flatMap(({onset,nucleus,coda})=>{
    const [first,second]=nucleus;
    if(nucleus.length!==2)return [...onset,...nucleus,...coda];
    const pair=first.sound+second.sound;
    const glide=abjadFallingGlides[pair] ?? (target==='persian'?persianFallingGlides[pair]:undefined);
    return glide ? [...onset,first,{...second,sound:glide,vowel:false,length:false},...coda] : [...onset,...nucleus,...coda];
  });
  const persian=target==='persian';
  const changes=persian ? persianConsonants : arabicConsonants;
  const output=[];
  for (let i=0;i<word.length;i++) {
    const token=word[i], previous=word[i-1], next=word[i+1];
    if (!token.vowel) {
      const key=token.sound==='q'?'q':phoneticBase[token.sound];
      const emphatic=!persian && token.marks.includes('ˤ') ? arabicEmphatics[key] : undefined;
      const letter=emphatic ?? changes[key] ?? abjadConsonants[key] ?? 'ه';
      const canMarkLength=!persian || previous?.vowel && next?.vowel;
      const noVowel=!next?.vowel && (next || previous?.vowel && ['j','w'].includes(key));
      const mark=token.length && letter.length===1 && canMarkLength?'ّ':!persian && noVowel?'ْ':'';
      output.push(letter+mark);
      continue;
    }
    const initial=!previous || previous.vowel;
    const vowel=fiveVowels[token.sound];
    if (persian) {
      const letter=persianVowelLetters[token.sound] ?? (token.length&&vowel==='a'?'ا':undefined);
      if (letter==='ا' && initial) output.push('آ');
      else if (letter) output.push((initial?'ا':'')+letter);
      else output.push((initial?'ا':'')+shortAbjadVowels[persianShortVowels[token.sound]??vowel]);
      continue;
    }
    output.push((initial?'ا':'')+shortAbjadVowels[vowel]+(token.length?longArabicVowels[vowel]:''));
  }
  return output.join('');
}

const indic = {
  odia:{
    consonants:map('p=ପ b=ବ t=ତ d=ଦ k=କ g=ଗ m=ମ n=ନ ŋ=ଙ ɲ=ଞ ʎ=ଲ୍ୟ j=ୟ w=ୱ ɰ=ୱ ɥ=ୟ r=ର ʁ=ର l=ଲ f=ଫ v=ୱ θ=ଥ ð=ଦ s=ସ z=ଜ ʃ=ଶ ʒ=ଜ tʃ=ଚ dʒ=ଜ ts=ତ୍ସ dz=ଦ୍ଜ pf=ପ୍ଫ x=ଖ ɣ=ଘ ç=ଶ h=ହ ħ=ହ ʕ=ହ ʔ=ହ ɬ=ଲ'),
    places:map('ʈ=ଟ ɖ=ଡ ɳ=ଣ ɭ=ଳ ɽ=ଡ଼'),
    aspirates:map('p=ଫ b=ଭ t=ଥ d=ଧ ʈ=ଠ ɖ=ଢ k=ଖ g=ଘ tʃ=ଛ dʒ=ଝ ɽ=ଢ଼'),
    vowels:map('a=ା i=ି e=େ u=ୁ o=ୋ ɔ='),
    independent:map('a=ଆ i=ଇ e=ଏ u=ଉ o=ଓ ɔ=ଅ'),
    join:'୍', coda:'୍', nasal:'ଂ',
  },
  khmer:{
    consonants:map('p=ប b=ប t=ត d=ដ k=ក g=គ m=ម n=ន ŋ=ង ɲ=ញ ʎ=ល្យ j=យ w=វ ɰ=វ ɥ=យ r=រ ʁ=រ l=ល f=ហ្វ v=វ θ=ថ ð=ដ s=ស z=ហ្ស ʃ=ស៊ ʒ=ហ្ស tʃ=ច dʒ=ជ ts=ត្ស dz=ដ្ស pf=ប្វ x=ខ ɣ=គ ç=ស h=ហ ħ=ហ ʕ=អ ʔ=អ ɬ=ល'),
    vowels:map('a=ា i=ី e=េ u=ូ o=ោ'),
    independent:map('a=អា i=អ៊ី e=អេ u=អ៊ូ o=អូ'),
    join:'្', coda:'', nasal:'ំ',
  },
};
function indicWord(word, target) {
  const settings=indic[target];
  return word.map((token,index)=>{
    const next=word[index+1], prev=word[index-1];
    if (token.vowel) {
      const set=prev && !prev.vowel ? settings.vowels : settings.independent;
      return (set[token.sound]??set[fiveVowels[token.sound]])+(token.nasal?settings.nasal:'');
    }
    const place=settings.places?.[token.sound];
    const sound=place?token.sound:phoneticBase[token.sound];
    const aspirate=hasAspiratedRelease(token)?settings.aspirates?.[sound]:undefined;
    const current=aspirate ?? place ?? settings.consonants[sound] ?? settings.consonants.h;
    if (next?.vowel) {
      if(token.length&&prev?.vowel&&current.length===1)return current+settings.join+current;
      return current;
    }
    if (next && !prev?.vowel) return current+settings.join;
    return current+settings.coda;
  }).join('');
}

const frenchFinalConsonants=map('b=be d=de g=gue p=pe t=te v=ve z=ze ʒ=je m=me n=ne ɲ=gne ʃ=che');

function frenchWord(phones) {
  const letters=latinLetters(phones,'french');
  for(let i=0;i<letters.length;i++) {
    const phone=phones[i],previous=phones[i-1],next=phones[i+1];
    if(phone.vowel&&phone.sound==='o'&&!phone.nasal&&!previous?.vowel&&next&&!next.vowel&&
      !['j','w','ɥ','z','ŋ'].includes(next.sound))letters[i]='ô';
    if(i>0&&['a','o'].includes(letters[i-1])&&letters[i]==='i'&&phone.vowel&&
      (phone.writtenBoundary||phone.sound==='i'&&['o','ɔ'].includes(phones[i-1].sound)))letters[i]='ï';
  }
  const last=phones.at(-1);
  if(!last)return '';
  const before=phones.at(-2);
  const sound=last.vowel?last.sound:phoneticBase[last.sound];
  if(last.vowel) {
    if(sound==='e'&&!last.nasal&&(!before?.vowel||last.writtenBoundary))letters[letters.length-1]='é';
  } else if(sound==='s') {
    letters[letters.length-1]=before?.vowel&&!before.nasal?'sse':'se';
  } else if(['r','ʁ'].includes(sound)&&before?.vowel&&letters.at(-2)==='e') {
    letters.splice(-2,2,'ère');
  } else if(frenchFinalConsonants[sound]) {
    letters[letters.length-1]=frenchFinalConsonants[sound];
  }
  return letters.join('');
}

const englishDiphthongs = map('eɪ=ay oʊ=oh əʊ=oh aɪ=eye aʊ=ow ɔɪ=oy ei=ay ai=eye ou=oh au=ow ɔi=oy');
function englishWord(word, source) {
  const output=[];
  let lastVowel=-1;
  for (let index=0; index<word.length; index++) {
    let token=word[index];
    const next=word[index+1];
    const pair=token.vowel && next?.vowel ? englishDiphthongs[token.sound+next.sound] : null;
    let letter=pair ?? latinSpelling([token],'english');
    if (source==='korean' && token.sound==='e') letter='eh';
    if (token.vowel) {
      if (lastVowel>=0) {
        const boundary=output.length-lastVowel>1 && !word[index-1].coda ? output.length-1 : output.length;
        if (boundary>lastVowel) {
          output.splice(boundary,0,'-');
        }
      }
      lastVowel=output.length;
      if (pair) index++;
    }
    output.push(letter);
  }
  return output.join('');
}

function adaptMoraicTokens(word,source,target) {
  const adapted=[];
  for(let i=0;i<word.length;i++) {
    const current=word[i], previous=word[i-1], next=word[i+1];
    if(!current.vowel && current.marks.includes('̩') && ['ʐ','ɹ','ɻ','r','z','ɿ','ʅ'].includes(current.sound)) {
      adapted.push({...current,sound:'ɯ',vowel:true});
      continue;
    }
    if(!current.vowel && previous?.vowel && !next?.vowel && ['w','j','ɥ','ɰ'].includes(current.sound)) {
      const vowel=current.sound==='j'?'i':source==='vietnamese' && previous.sound==='a' && current.sound==='w'?'o':'u';
      adapted.push({...current,sound:vowel,vowel:true,length:false});
      continue;
    }
    if(current.sound==='c' || current.sound==='ɟ') {
      adapted.push({...current,sound:current.sound==='c'?'tɕ':'dʑ',koreanOnset:source==='vietnamese'&&target==='korean'?13:undefined});
      continue;
    }
    if(target==='korean'&&source==='mandarin'&&current.sound==='ɔ'&&previous?.sound==='w'&&!current.syllableStart&&!previous.tone) {
      adapted.push({...current,sound:'ʌ'});
      continue;
    }
    if(target==='korean' && source==='vietnamese' && current.sound==='s' && next?.vowel) {
      adapted.push({...current,koreanOnset:10});
      continue;
    }
    adapted.push(current);
    if(current.vowel && current.nasal && !next?.nasal && !['m','n','ŋ','ɴ','j','w','ɰ','ɥ'].includes(next?.sound)) {
      adapted.push({sound:'ŋ',marks:'',coda:true,vowel:false,length:false,nasal:false});
    }
  }
  return adapted;
}

function latinGlottalParts(word,target) {
  // Vietnamese tones and Cassidy–JLU have their own spelling paths.
  if(!Object.hasOwn(latinRules,target)||target==='vietnamese'||target==='jamaican'||
    !word.some(phone=>phone.sound==='ʔ')||!word.some(phone=>phone.sound!=='ʔ'))return [word];
  const parts=[[]];
  let gap;
  for(const phone of word) {
    if(phone.sound==='ʔ') {
      if(!gap||phone.stress)gap=phone;
      continue;
    }
    let part=parts.at(-1);
    if(gap&&part.at(-1)?.vowel&&phone.vowel) {
      part=[];
      parts.push(part);
    }
    part.push(gap?{
      ...phone,
      syllableStart:phone.syllableStart||gap.syllableStart,
      writtenBoundary:phone.writtenBoundary||gap.writtenBoundary,
      stress:phone.stress||gap.stress,
    }:phone);
    gap=undefined;
  }
  if(gap&&target==='malay')parts.at(-1).push({...gap,sound:'k',marks:'',coda:true});
  return parts;
}

function renderStructuredTarget(tokens,source,target,phraseBreak=false) {
  if(!tokens.some(token=>token.sound))return '';
  return groupSegments(tokens,input=>latinGlottalParts(input,target).map(word=>{
    if(target==='korean' && source==='japanese' && !word.some(isPortableSyllabic))return japaneseKoreanWord(word,!phraseBreak);
    const plan=planTargetWord(word,source,target);
    if(plan.notation!==undefined)return plan.notation;
    const {phones}=plan;
    if(target==='japanese')return kanaWord(phones);
    if(target==='english') {
      if(word.slice(1).some(phone=>phone.writtenBoundary)) {
        return plan.syllables.map(({onset,nucleus,coda})=>englishWord([...onset,...nucleus,...coda],source)).join('-');
      }
      return englishWord(phones,source);
    }
    if(target==='jamaican')return jamaicanWord(phones);
    if(target==='korean')return koreanWord(phones);
    if(target==='arabic' || target==='persian')return abjadWord(plan.syllables,target);
    if(target==='khmer')return plan.syllables.map(khmerSyllable).join('');
    if(target==='odia')return indicWord(phones,target);
    if(target==='french')return frenchWord(phones);
    if(romanceStressRules[target])return renderRomanceStress(plan,target);
    return latinSpelling(phones,target,latinQuantityOverrides(plan.syllables,target));
  }).join('-'));
}

function renderTarget(ipa,source,target,phraseBreak=false) {
  return renderStructuredTarget(tokenizeIPA(ipa,source),source,target,phraseBreak);
}

const japaneseMoras=Object.fromEntries(Object.entries({
  'アイウエオ':'a i ɯ e o',
  'カキクケコ':'ka ki kɯ ke ko',
  'ガギグゲゴ':'ɡa ɡi ɡɯ ɡe ɡo',
  'サシスセソ':'sa ɕi sɯ se so',
  'ザジズゼゾ':'za d͡ʑi zɯ ze zo',
  'タチツテト':'ta t͡ɕi t͡sɯ te to',
  'ダヂヅデド':'da d͡ʑi zɯ de do',
  'ナニヌネノ':'na ni nɯ ne no',
  'ハヒフヘホ':'ha çi ɸɯ he ho',
  'バビブベボ':'ba bi bɯ be bo',
  'パピプペポ':'pa pi pɯ pe po',
  'マミムメモ':'ma mi mɯ me mo',
  'ラリルレロ':'ɾa ɾi ɾɯ ɾe ɾo',
  'ヤユヨワヰヱヲン':'ja jɯ jo wa i e o ɴ',
  'ヴァ ヴィ ヴ ヴェ ヴォ':'va vi vɯ ve vo',
  'ファ フィ フェ フォ':'ɸa ɸi ɸe ɸo',
  'ウィ ウェ ウォ イェ':'wi we wo je',
  'ティ トゥ ディ ドゥ':'ti tɯ di dɯ',
  'シェ ジェ チェ':'ɕe d͡ʑe t͡ɕe',
  'ツァ ツィ ツェ ツォ':'t͡sa t͡si t͡se t͡so',
  'クァ クィ クェ クォ グァ':'kwa kwi kwe kwo ɡwa',
  'スィ ズィ':'si zi',
}).flatMap(([letters,sounds])=>{
  const kana=letters.includes(' ') ? letters.split(' ') : [...letters];
  return sounds.split(' ').map((ipa,index)=>[kana[index],ipa]);
}));

for (const [kana,onset] of Object.entries({
  キ:'kj',ギ:'ɡj',シ:'ɕ',ジ:'d͡ʑ',チ:'t͡ɕ',ヂ:'d͡ʑ',ニ:'nj',ヒ:'ç',ビ:'bj',
  ピ:'pj',ミ:'mj',リ:'ɾj',フ:'ɸj',テ:'tj',デ:'dj',ヴ:'vj',
})) {
  for (const [small,vowel] of Object.entries({ャ:'a',ュ:'ɯ',ョ:'o'})) {
    japaneseMoras[kana+small]=onset+vowel;
  }
}

const japaneseKana=/[\p{Script=Hiragana}\p{Script=Katakana}\u30fc\uff66-\uff9f]/u;
const japaneseHan=/\p{Script=Han}/u;
const japaneseKanaOnly=/^[\p{Script=Hiragana}\p{Script=Katakana}\u30fc\uff66-\uff9f]+$/u;
const japaneseSegmenter=new Intl.Segmenter('ja',{granularity:'word'});

function japaneseKanaReading(kana) {
  const joined=kana.normalize('NFKC').replace(/[\u3041-\u3096]/gu,letter=>String.fromCharCode(letter.charCodeAt(0)+0x60));
  const units=[];
  let gemination=false, newWord=false;
  for (let index=0;index<joined.length;) {
    const current=joined[index];
    if (current==='|') {newWord=true;index++;continue;}
    if (current==='ッ') {
      gemination=true;
      index++;
      continue;
    }
    if (current==='ー') {
      if (units.length && /[aeioɯ]$/u.test(units.at(-1))) units[units.length-1]+='ː';
      index++;
      continue;
    }
    const compound=joined.slice(index,index+2);
    const written=japaneseMoras[compound] ? compound : current;
    let reading=japaneseMoras[written] ?? japaneseMoras[({ァ:'ア',ィ:'イ',ゥ:'ウ',ェ:'エ',ォ:'オ',ヮ:'ワ',ヵ:'カ',ヶ:'ケ'})[written]];
    if (!reading) return '';
    index+=written.length;
    const previousVowel=units.at(-1)?.match(/([aeioɯ])$/u)?.[1];
    if (!newWord && !gemination && previousVowel && (reading===previousVowel || previousVowel==='o' && written==='ウ' || previousVowel==='e' && written==='イ')) {
      units[units.length-1]+='ː';
      continue;
    }
    newWord=false;
    if (gemination) {
      const onset=reading.match(/^(t͡s|t͡ɕ|d͡ʑ|[^aeioɯɴ])/u)?.[0];
      reading=onset ? onset+'ː'+reading.slice(onset.length) : 'ʔ'+reading;
      gemination=false;
    }
    units.push(reading);
  }
  return units.join('')+(gemination?'ʔ':'');
}

function startsJapanesePhrase(token,previous) {
  if (['助詞','助動詞'].includes(token.pos) || token.pos_detail_1==='接尾' || token.pos_detail_1==='非自立' && ['動詞','形容詞'].includes(token.pos)) return false;
  if (previous.pos==='接頭詞' || previous.pos==='名詞' && token.pos==='名詞') return false;
  if (token.pos==='動詞') {
    if (previous.pos==='名詞' && previous.pos_detail_1==='サ変接続' && ['する','できる','出来る'].includes(token.basic_form)) return false;
    if (previous.pos==='動詞' && previous.conjugated_form?.startsWith('連用')) return false;
  }
  return true;
}

function uniqueJapaneseReading(value) {
  if(typeof value!=='string') return '';
  const readings=new Set([...value.matchAll(/\/([^/]+)\//gu)].map(match=>match[1].replace(/\s+/gu,'').normalize('NFC')));
  if(readings.size!==1) return '';
  const [ipa]=readings;
  const phones=tokenizeIPA(ipa,'japanese');
  return phones.some(phone=>phone.sound) && !phones.unknownPhones.size ? ipa : '';
}

const japaneseOfflineParticles=new Set('は が を に で と の も へ や か な ね よ から まで だけ ほど'.split(' '));
const japaneseOfflineTokenizer={
  tokenize(text) {
    return [...japaneseSegmenter.segment(text)].flatMap(({segment,isWordLike})=>{
      const attached=segment.match(/^([\p{Nd}.,，．]+)(\p{Script=Latin}+)$/u);
      if(attached&&japaneseUnitReading(attached[1],attached[2])) {
        return [{surface_form:attached[1],pos:'名詞'},{surface_form:attached[2],pos:'名詞'}];
      }
      return [{
        surface_form:segment,
        pronunciation:isWordLike&&japaneseKanaOnly.test(segment)?segment:null,
        pos:japaneseOfflineParticles.has(segment)?'助詞':isWordLike?'名詞':'記号',
      }];
    });
  },
};

const japaneseNearLatin=/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]/u;
const japaneseLatinJoiners=/^[ \t\p{Ps}\p{Pe}\p{Pi}\p{Pf}\p{Nd}]+|[ \t\p{Ps}\p{Pe}\p{Pi}\p{Pf}\p{Nd}]+$/gu;

function japaneseUnitReading(before,term) {
  return /\p{Nd}[ \t]*$/u.test(before) ? japaneseLatinUnits.get(term.normalize('NFKC')) : undefined;
}

function japaneseLatinReading(text,at,term) {
  const spelling=term.normalize('NFKC');
  if(!/^[A-Za-z]+$/u.test(spelling))return undefined;
  const before=text.slice(0,at);
  const unit=japaneseUnitReading(before,spelling);
  if(unit)return unit;
  const after=text.slice(at+term.length);
  // Keep multiword Latin passages intact for the mixed-script reader.
  if(/[\p{Script=Latin}\p{M}][ \t.‐‑-]*$/u.test(before) || /^[ \t.‐‑-]*\p{Script=Latin}/u.test(after))return undefined;
  const nearBefore=before.replace(japaneseLatinJoiners,'').at(-1)??'';
  const nearAfter=after.replace(japaneseLatinJoiners,'')[0]??'';
  if(!japaneseNearLatin.test(nearBefore+nearAfter) && term!==text.trim())return undefined;
  const attested=japaneseLatinAttested.get(spelling)||
    (/^[A-Z][a-z]+$/u.test(spelling)?japaneseLatinAttested.get(spelling.toLowerCase()):undefined);
  return attested||japaneseLatinDictionary.get(spelling);
}

function japaneseMorphologyChunks(input,tokenizer,lexicon,lookup) {
  const chunks=[];
  for(const line of input.split(/(\r?\n)/u)) {
    if(!line) continue;
    if(!/\p{L}/u.test(line)) {chunks.push({original:line});continue;}
    const segmenter=tokenizer??japaneseOfflineTokenizer;
    const tokens=lexicon||lookup ? japaneseTokensWithDictionaries(line,segmenter,lexicon,lookup) : segmenter.tokenize(line);
    let previousToken=null,offset=0;
    for(const token of tokens) {
      const original=token.surface_form;
      const start=line.indexOf(original,offset);
      if(start<0) continue;
      if(start>offset) {chunks.push(...splitMissingText(line.slice(offset,start)));previousToken=null;}
      offset=start+original.length;
      if(/[・･]/u.test(original)) {
        const parts=original.split(/([・･])/u).filter(Boolean).map(part=>({
          original:part,ipa:japaneseKanaOnly.test(part)?japaneseKanaReading(part):'',
        }));
        if(parts.every(part=>part.ipa||/^[・･]$/u.test(part.original))) {
          chunks.push(...parts);
          previousToken=null;
          continue;
        }
      }
      const kanaOnly=japaneseKanaOnly.test(original);
      let kana=japaneseLatinReading(line,start,original) ||
        (kanaOnly || japaneseHan.test(original) ? (token.pronunciation || (kanaOnly?original:'')) : '');
      if(!tokenizer && ['こんにちは','こんばんは'].includes(original)) kana=original.slice(0,-1)+'わ';
      if(!tokenizer && previousToken && original==='は') kana='わ';
      if(!tokenizer && previousToken && original==='へ') kana='え';
      if(!kana && !token.dictionaryIPA) {
        chunks.push(...splitMissingText(original));
        previousToken=null;
        continue;
      }
      const previous=chunks.at(-1);
      const identifiesWord=tokenizer || japaneseHan.test(original) && token.pronunciation;
      const phraseBreak=Boolean(identifiesWord && previous?.readings && previousToken && startsJapanesePhrase(token,previousToken));
      if(!previous?.readings || phraseBreak) chunks.push({original:'',readings:[],phraseBreak});
      const phrase=chunks.at(-1);
      phrase.original+=original;
      const last=phrase.readings.at(-1);
      if(token.dictionaryIPA) phrase.readings.push({ipa:token.dictionaryIPA});
      else if(last?.kana) {
        const vowelSuffix=token.pos==='助動詞' && original==='う';
        last.kana+=(vowelSuffix || !tokenizer ? '' : '|')+kana;
      } else phrase.readings.push({kana});
      previousToken=token;
    }
    if(offset<line.length) chunks.push(...splitMissingText(line.slice(offset)));
  }
  return chunks.map(chunk=>{
    if(!chunk.readings) return chunk;
    const parts=chunk.readings.map(reading=>reading.ipa ?? japaneseKanaReading(reading.kana));
    return parts.every(Boolean)
      ? {original:chunk.original,ipa:parts.join(''),phraseBreak:chunk.phraseBreak}
      : {original:chunk.original,unknown:true};
  });
}

const japaneseKoreanMoras={
  '':'아 이 우 에 오',
  k:'카 키 쿠 케 코', g:'가 기 구 게 고', s:'사 시 스 세 소', z:'자 지 즈 제 조',
  t:'타 티 투 테 토', d:'다 디 두 데 도', n:'나 니 누 네 노', h:'하 히 후 헤 호',
  b:'바 비 부 베 보', p:'파 피 푸 페 포', m:'마 미 무 메 모', r:'라 리 루 레 로',
  j:'야 이 유 예 요', w:'와 위 우 웨 워', f:'파 피 후 페 포', v:'바 비 부 베 보',
  ʃ:'샤 시 슈 셰 쇼', ʒ:'자 지 주 제 조', 'tʃ':'차 치 추 체 초', 'dʒ':'자 지 주 제 조',
  ts:'차 치 쓰 체 초', dz:'자 지 즈 제 조', ɲ:'냐 니 뉴 녜 뇨', ç:'햐 히 휴 혜 효',
  kj:'캬 키 큐 켸 쿄', gj:'갸 기 규 계 교', nj:'냐 니 뉴 녜 뇨',
  bj:'뱌 비 뷰 볘 뵤', pj:'퍄 피 퓨 폐 표', mj:'먀 미 뮤 몌 묘', rj:'랴 리 류 례 료',
  fj:'퍄 피 퓨 폐 표', vj:'뱌 비 뷰 볘 뵤', tj:'탸 티 튜 톄 툐', dj:'댜 디 듀 뎨 됴',
  kw:'콰 퀴 쿠 퀘 쿼', gw:'과 귀 구 궤 궈',
};
const japaneseKoreanRows=Object.fromEntries(Object.entries(japaneseKoreanMoras).map(([key,row])=>[key,row.split(' ')]));
const japaneseKoreanInitial=map('카=가 키=기 쿠=구 케=게 코=고 캬=갸 큐=규 쿄=교 타=다 테=데 토=도 치=지 차=자 추=주 초=조');

function japaneseKoreanWord(word,useInitialForms) {
  const output=[];
  const vowelOf=token=>token?.sound==='ɯ'?'u':fiveVowels[token?.sound];
  const soundOf=token=>token?.sound==='ɰ'?'w':phoneticBase[token?.sound];
  function addFinal(coda) {
    const last=output.at(-1)?.codePointAt(0);
    if (last>=0xac00 && last<=0xd7a3 && (last-0xac00)%28===0) {
      output[output.length-1]=String.fromCodePoint(last+coda);
    } else {
      output.push(coda===19?'읏':'은');
    }
  }
  for (let index=0;index<word.length;) {
    const current=word[index],next=word[index+1];
    let onset='';
    if (!current.vowel) {
      const key=soundOf(current);
      if (current.sound==='ɴ' || ['m','n','ŋ'].includes(key) && !next?.vowel && !['j','w'].includes(soundOf(next))) {
        addFinal(4);
        index++;
        continue;
      }
      if (current.sound==='ʔ') {
        addFinal(19);
        index++;
        continue;
      }
      onset=key==='ŋ'?'g':key==='l'?'r':key;
      const doubled=next && !next.vowel && soundOf(next)===key && word[index+2]?.vowel;
      if ((current.length && !['m','n','ŋ','r','l'].includes(key)) || doubled) addFinal(19);
      if (doubled) { index++; continue; }
      if (current.marks.includes('ʲ') && japaneseKoreanRows[onset+'j']) onset+='j';
      index++;
      if (['w','j'].includes(soundOf(word[index])) && word[index+1]?.vowel && japaneseKoreanRows[onset+soundOf(word[index])]) {
        onset+=soundOf(word[index++]);
      }
    }

    const nucleus=word[index]?.vowel ? word[index++] : null;
    const vowel=vowelOf(nucleus) ?? 'u';
    let glyph=(japaneseKoreanRows[onset] ?? japaneseKoreanRows[''])['aiueo'.indexOf(vowel)];
    if (useInitialForms && output.length===0) glyph=japaneseKoreanInitial[glyph] ?? glyph;
    output.push(glyph);
  }
  return output.join('');
}

// Kuromoji.js 0.1.2, Apache-2.0. Dictionary attribution is included at the end of the HTML.
const createEmbeddedJapaneseTokenizer=(()=>{
const dictionaries={"base.dat.gz":asset("embedded-kuromoji-1.bin"),"cc.dat.gz":asset("embedded-kuromoji-2.bin"),"check.dat.gz":asset("embedded-kuromoji-3.bin"),"tid.dat.gz":asset("embedded-kuromoji-4.bin"),"tid_map.dat.gz":asset("embedded-kuromoji-5.bin"),"tid_pos.dat.gz":asset("embedded-kuromoji-6.bin"),"unk.dat.gz":asset("embedded-kuromoji-7.bin"),"unk_char.dat.gz":"H4sIAAAAAAAAA+3cgaqCMBQAUDR7+d7/f3D1iiBL1LZ5XZ5DEqhsd7vzFgxsmgmHZ93D/cRx1JzrU72/9D803jwFTeeNUb8bcY3lb7duuXh/FgAAAAAAoF7RG4lxomd+Gya217PrFlo7vlRLx1f7eKnbt9WXpTYfICVJP6FK19/a6zNlRa8/9q0NEN1/efPnP7l+/JTVnMrKvZ63bjj+HL8hFdv9/5/oSgUAAAAAAMBVvv3Avm0vn8vRFwhzYZv94BvWkL7eZrVQ5hkjlqzCFnkuAQAAAAAAAGAVtugBAAAAAAAAAACAb5XvfY8AAAAAAAAAAAAAAAAAAAAAAAAAAAAApUW/2bkuSfMVnWog0SFBdOxvDWLsHu4xH0fdbpi6/u/0sczDe8nBGQOmwOoAAAEA","unk_compat.dat.gz":"H4sIAAAAAAAAA+3dsQ4AEQwAUJf4/282WC4SMZAo3pvU1HapTlICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDgvt0JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAHrlz/sftPXNO7uco95NrAwB4kfdbFbEP9jEAWMdcBQAAYCX7JQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA8/qIHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuEMBFvMPvAAABAA=","unk_invoke.dat.gz":asset("embedded-kuromoji-8.bin"),"unk_map.dat.gz":asset("embedded-kuromoji-9.bin"),"unk_pos.dat.gz":asset("embedded-kuromoji-10.bin")};
const module={exports:{}};
const exports=module.exports;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.kuromoji = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (process,global){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.async = global.async || {})));
}(this, (function (exports) { 'use strict';

function slice(arrayLike, start) {
    start = start|0;
    var newLen = Math.max(arrayLike.length - start, 0);
    var newArr = Array(newLen);
    for(var idx = 0; idx < newLen; idx++)  {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}

/**
 * Creates a continuation function with some arguments already applied.
 *
 * Useful as a shorthand when combined with other control flow functions. Any
 * arguments passed to the returned function are added to the arguments
 * originally passed to apply.
 *
 * @name apply
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function you want to eventually apply all
 * arguments to. Invokes with (arguments...).
 * @param {...*} arguments... - Any number of arguments to automatically apply
 * when the continuation is called.
 * @returns {Function} the partially-applied function
 * @example
 *
 * // using apply
 * async.parallel([
 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
 *     async.apply(fs.writeFile, 'testfile2', 'test2')
 * ]);
 *
 *
 * // the same process without using apply
 * async.parallel([
 *     function(callback) {
 *         fs.writeFile('testfile1', 'test1', callback);
 *     },
 *     function(callback) {
 *         fs.writeFile('testfile2', 'test2', callback);
 *     }
 * ]);
 *
 * // It's possible to pass any number of additional arguments when calling the
 * // continuation:
 *
 * node> var fn = async.apply(sys.puts, 'one');
 * node> fn('two', 'three');
 * one
 * two
 * three
 */
var apply = function(fn/*, ...args*/) {
    var args = slice(arguments, 1);
    return function(/*callArgs*/) {
        var callArgs = slice(arguments);
        return fn.apply(null, args.concat(callArgs));
    };
};

var initialParams = function (fn) {
    return function (/*...args, callback*/) {
        var args = slice(arguments);
        var callback = args.pop();
        fn.call(this, args, callback);
    };
};

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        defer(function () {
            fn.apply(null, args);
        });
    };
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

var setImmediate$1 = wrap(_defer);

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function(value) {
                invokeCallback(callback, null, value);
            }, function(err) {
                invokeCallback(callback, err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function invokeCallback(callback, error, value) {
    try {
        callback(error, value);
    } catch (e) {
        setImmediate$1(rethrow, e);
    }
}

function rethrow(error) {
    throw error;
}

var supportsSymbol = typeof Symbol === 'function';

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

function applyEach$1(eachfn) {
    return function(fns/*, ...args*/) {
        var args = slice(arguments, 1);
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
var breakLoop = {};

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

var getIterator = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? {value: coll[i], key: i} : null;
    }
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done)
            return null;
        i++;
        return {value: item.value, key: i};
    }
}

function createObjectIterator(obj) {
    var okeys = keys(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? {value: obj[key], key: key} : null;
    };
}

function iterator(coll) {
    if (isArrayLike(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = getIterator(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

function onlyOnce(fn) {
    return function() {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            }
            else if (value === breakLoop || (done && running <= 0)) {
                done = true;
                return callback(null);
            }
            else {
                replenish();
            }
        }

        function replenish () {
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
        }

        replenish();
    };
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachOfLimit(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
}

function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}

// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll, iteratee, callback) {
    callback = once(callback || noop);
    var index = 0,
        completed = 0,
        length = coll.length;
    if (length === 0) {
        callback(null);
    }

    function iteratorCallback(err, value) {
        if (err) {
            callback(err);
        } else if ((++completed === length) || value === breakLoop) {
            callback(null);
        }
    }

    for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
    }
}

// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric = doLimit(eachOfLimit, Infinity);

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each
 * item in `coll`.
 * The `key` is the item's key, or index in the case of an array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
var eachOf = function(coll, iteratee, callback) {
    var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
    eachOfImplementation(coll, wrapAsync(iteratee), callback);
};

function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, wrapAsync(iteratee), callback);
    };
}

function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = callback || noop;
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        _iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Produces a new collection of values by mapping each value in `coll` through
 * the `iteratee` function. The `iteratee` is called with an item from `coll`
 * and a callback for when it has finished processing. Each of these callback
 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
 * `iteratee` passes an error to its callback, the main `callback` (for the
 * `map` function) is immediately called with the error.
 *
 * Note, that since this function applies the `iteratee` to each item in
 * parallel, there is no guarantee that the `iteratee` functions will complete
 * in order. However, the results array will be in the same order as the
 * original `coll`.
 *
 * If `map` is passed an Object, the results will be an Array.  The results
 * will roughly be in the order of the original Objects' keys (but this can
 * vary across JavaScript engines).
 *
 * @name map
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an Array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @example
 *
 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
var map = doParallel(_asyncMap);

/**
 * Applies the provided arguments to each function in the array, calling
 * `callback` after all functions have completed. If you only provide the first
 * argument, `fns`, then it will return a function which lets you pass in the
 * arguments as if it were a single function call. If more arguments are
 * provided, `callback` is required while `args` is still optional.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(..args, callback)`. If invoked with any
 * arguments, `callback` is required.
 * @example
 *
 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async.applyEach([enableSearch, updateSchema]),
 *     callback
 * );
 */
var applyEach = applyEach$1(map);

function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
    };
}

/**
 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
 *
 * @name mapLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapLimit = doParallelLimit(_asyncMap);

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapSeries = doLimit(mapLimit, 1);

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
var applyEachSeries = applyEach$1(mapSeries);

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the main `callback` is immediately called with the
 * error.
 *
 * {@link AsyncFunction}s also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one or two arguments:
 * * a `results` object, containing the results of the previously executed
 *   functions, only passed if the task has any dependencies,
 * * a `callback(err, result)` function, which must be called when finished,
 *   passing an `error` (which can be `null`) and the result of the function's
 *   execution.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback. Results are always returned; however, if an
 * error occurs, no further `tasks` will be performed, and the results object
 * will only contain partial results. Invoked with (err, results).
 * @returns undefined
 * @example
 *
 * async.auto({
 *     // this function will just be passed a callback
 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
 *     showData: ['readData', function(results, cb) {
 *         // results.readData is the file's contents
 *         // ...
 *     }]
 * }, callback);
 *
 * async.auto({
 *     get_data: function(callback) {
 *         console.log('in get_data');
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         console.log('in make_folder');
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: ['get_data', 'make_folder', function(results, callback) {
 *         console.log('in write_file', JSON.stringify(results));
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(results, callback) {
 *         console.log('in email_link', JSON.stringify(results));
 *         // once the file is written let's email a link to it...
 *         // results.write_file contains the filename returned by write_file.
 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
 *     }]
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('results = ', results);
 * });
 */
var auto = function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys$$1 = keys(tasks);
    var numTasks = keys$$1.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = Object.create(null);

    var readyTasks = [];

    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};

    baseForOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            readyToCheck.push(key);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
            enqueueTask(key, task);
            readyToCheck.push(key);
            return;
        }
        uncheckedDependencies[key] = remainingDependencies;

        arrayEach(dependencies, function (dependencyName) {
            if (!tasks[dependencyName]) {
                throw new Error('async.auto task `' + key +
                    '` has a non-existent dependency `' +
                    dependencyName + '` in ' +
                    dependencies.join(', '));
            }
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    checkForDeadlocks();
    processQueue();

    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while(readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }

    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }


    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(function(err, result) {
            runningTasks--;
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            if (err) {
                var safeResults = {};
                baseForOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = result;
                hasError = true;
                listeners = Object.create(null);

                callback(err, safeResults);
            } else {
                results[key] = result;
                taskComplete(key);
            }
        });

        runningTasks++;
        var taskFn = wrapAsync(task[task.length - 1]);
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }

    function checkForDeadlocks() {
        // Kahn's algorithm
        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
            currentTask = readyToCheck.pop();
            counter++;
            arrayEach(getDependents(currentTask), function (dependent) {
                if (--uncheckedDependencies[dependent] === 0) {
                    readyToCheck.push(dependent);
                }
            });
        }

        if (counter !== numTasks) {
            throw new Error(
                'async.auto cannot execute tasks due to a recursive dependency'
            );
        }
    }

    function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function (task, key) {
            if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                result.push(key);
            }
        });
        return result;
    }
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the first unmatched string symbol.
 */
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;

  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f';
var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange = '\\u20d0-\\u20ff';
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;

  return castSlice(strSymbols, start, end).join('');
}

var FN_ARGS = /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseParams(func) {
    func = func.toString().replace(STRIP_COMMENTS, '');
    func = func.match(FN_ARGS)[2].replace(' ', '');
    func = func ? func.split(FN_ARG_SPLIT) : [];
    func = func.map(function (arg){
        return trim(arg.replace(FN_ARG, ''));
    });
    return func;
}

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
 * tasks are specified as parameters to the function, after the usual callback
 * parameter, with the parameter names matching the names of the tasks it
 * depends on. This can provide even more readable task graphs which can be
 * easier to maintain.
 *
 * If a final callback is specified, the task results are similarly injected,
 * specified as named parameters after the initial error parameter.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
 * the form 'func([dependencies...], callback). The object's key of a property
 * serves as the name of the task defined by that property, i.e. can be used
 * when specifying requirements for other tasks.
 * * The `callback` parameter is a `callback(err, result)` which must be called
 *   when finished, passing an `error` (which can be `null`) and the result of
 *   the function's execution. The remaining parameters name other tasks on
 *   which the task is dependent, and the results from those tasks are the
 *   arguments of those parameters.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback, and a `results` object with any completed
 * task results, similar to `auto`.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *     get_data: function(callback) {
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: function(get_data, make_folder, callback) {
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     },
 *     email_link: function(write_file, callback) {
 *         // once the file is written let's email a link to it...
 *         // write_file contains the filename returned by write_file.
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 *
 * // If you are using a JS minifier that mangles parameter names, `autoInject`
 * // will not work with plain functions, since the parameter names will be
 * // collapsed to a single letter identifier.  To work around this, you can
 * // explicitly specify the names of the parameters your task function needs
 * // in an array, similar to Angular.js dependency injection.
 *
 * // This still has an advantage over plain `auto`, since the results a task
 * // depends on are still spread into arguments.
 * async.autoInject({
 *     //...
 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(write_file, callback) {
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }]
 *     //...
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 */
function autoInject(tasks, callback) {
    var newTasks = {};

    baseForOwn(tasks, function (taskFn, key) {
        var params;
        var fnIsAsync = isAsync(taskFn);
        var hasNoDeps =
            (!fnIsAsync && taskFn.length === 1) ||
            (fnIsAsync && taskFn.length === 0);

        if (isArray(taskFn)) {
            params = taskFn.slice(0, -1);
            taskFn = taskFn[taskFn.length - 1];

            newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (hasNoDeps) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            }

            // remove callback param
            if (!fnIsAsync) params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            wrapAsync(taskFn).apply(null, newArgs);
        }
    });

    auto(newTasks, callback);
}

// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = function () {
    while(this.head) this.shift();
    return this;
};

DLL.prototype.insertAfter = function(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;
    else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;
    else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function(node) {
    if (this.head) this.insertBefore(this.head, node);
    else setInitial(this, node);
};

DLL.prototype.push = function(node) {
    if (this.tail) this.insertAfter(this.tail, node);
    else setInitial(this, node);
};

DLL.prototype.shift = function() {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function() {
    return this.tail && this.removeLink(this.tail);
};

DLL.prototype.toArray = function () {
    var arr = Array(this.length);
    var curr = this.head;
    for(var idx = 0; idx < this.length; idx++) {
        arr[idx] = curr.data;
        curr = curr.next;
    }
    return arr;
};

DLL.prototype.remove = function (testFn) {
    var curr = this.head;
    while(!!curr) {
        var next = curr.next;
        if (testFn(curr)) {
            this.removeLink(curr);
        }
        curr = next;
    }
    return this;
};

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var _worker = wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];

    var processingScheduled = false;
    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                callback: callback || noop
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        }

        if (!processingScheduled) {
            processingScheduled = true;
            setImmediate$1(function() {
                processingScheduled = false;
                q.process();
            });
        }
    }

    function _next(tasks) {
        return function(err){
            numRunning -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];

                var index = baseIndexOf(workersList, task, 0);
                if (index === 0) {
                    workersList.shift();
                } else if (index > 0) {
                    workersList.splice(index, 1);
                }

                task.callback.apply(task, arguments);

                if (err != null) {
                    q.error(err, task.data);
                }
            }

            if (numRunning <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        };
    }

    var isProcessing = false;
    var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated:noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        remove: function (testFn) {
            q._tasks.remove(testFn);
        },
        process: function () {
            // Avoid trying to start too many processing operations. This can occur
            // when callbacks resolve synchronously (#1267).
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                var tasks = [], data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    workersList.push(node);
                    data.push(node.data);
                }

                numRunning += 1;

                if (q._tasks.length === 0) {
                    q.empty();
                }

                if (numRunning === q.concurrency) {
                    q.saturated();
                }

                var cb = onlyOnce(_next(tasks));
                _worker(data, cb);
            }
            isProcessing = false;
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return numRunning;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q._tasks.length + numRunning === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            setImmediate$1(q.process);
        }
    };
    return q;
}

/**
 * A cargo of tasks for the worker function to complete. Cargo inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargo.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargo` is
 * created to alter the payload on-the-fly.
 * @property {Function} push - Adds `task` to the `queue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
 * @property {Function} saturated - A callback that is called when the
 * `queue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} empty - A callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargo.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
 */

/**
 * Creates a `cargo` object with the specified payload. Tasks added to the
 * cargo will be processed altogether (up to the `payload` limit). If the
 * `worker` is in progress, the task is queued until it becomes available. Once
 * the `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, cargo passes an array of tasks to a single worker, repeating
 * when the worker is finished.
 *
 * @name cargo
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An asynchronous function for processing an array
 * of queued tasks. Invoked with `(tasks, callback)`.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargo and inner queue.
 * @example
 *
 * // create a cargo object with payload 2
 * var cargo = async.cargo(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2);
 *
 * // add some items
 * cargo.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargo.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargo.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 */
function cargo(worker, payload) {
    return queue(worker, 1, payload);
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Invoked with (err).
 */
var eachOfSeries = doLimit(eachOfLimit, 1);

/**
 * Reduces `coll` into a single value using an async `iteratee` to return each
 * successive step. `memo` is the initial state of the reduction. This function
 * only operates in series.
 *
 * For performance reasons, it may make sense to split a call to this function
 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
 * results. This function is for situations where each step in the reduction
 * needs to be async; if you can get the data before reducing it, then it's
 * probably a good idea to do so.
 *
 * @name reduce
 * @static
 * @memberOf module:Collections
 * @method
 * @alias inject
 * @alias foldl
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 * @example
 *
 * async.reduce([1,2,3], 0, function(memo, item, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         callback(null, memo + item)
 *     });
 * }, function(err, result) {
 *     // result is now equal to the last value of memo, which is 6
 * });
 */
function reduce(coll, memo, iteratee, callback) {
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    eachOfSeries(coll, function(x, i, callback) {
        _iteratee(memo, x, function(err, v) {
            memo = v;
            callback(err);
        });
    }, function(err) {
        callback(err, memo);
    });
}

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.compose]{@link module:ControlFlow.compose}
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} a function that composes the `functions` in order
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
function seq(/*...functions*/) {
    var _functions = arrayMap(arguments, wrapAsync);
    return function(/*...args*/) {
        var args = slice(arguments);
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(_functions, args, function(newargs, fn, cb) {
            fn.apply(that, newargs.concat(function(err/*, ...nextargs*/) {
                var nextargs = slice(arguments, 1);
                cb(err, nextargs);
            }));
        },
        function(err, results) {
            cb.apply(that, [err].concat(results));
        });
    };
}

/**
 * Creates a function which is a composition of the passed asynchronous
 * functions. Each function consumes the return value of the function that
 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name compose
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} an asynchronous function that is the composed
 * asynchronous `functions`
 * @example
 *
 * function add1(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n + 1);
 *     }, 10);
 * }
 *
 * function mul3(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n * 3);
 *     }, 10);
 * }
 *
 * var add1mul3 = async.compose(mul3, add1);
 * add1mul3(4, function (err, result) {
 *     // result now equals 15
 * });
 */
var compose = function(/*...args*/) {
    return seq.apply(null, slice(arguments).reverse());
};

var _concat = Array.prototype.concat;

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
 *
 * @name concatLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err /*, ...args*/) {
            if (err) return callback(err);
            return callback(null, slice(arguments, 1));
        });
    }, function(err, mapResults) {
        var result = [];
        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                result = _concat.apply(result, mapResults[i]);
            }
        }

        return callback(err, result);
    });
};

/**
 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
 * the concatenated list. The `iteratee`s are called in parallel, and the
 * results are concatenated as they return. There is no guarantee that the
 * results array will be returned in the original order of `coll` passed to the
 * `iteratee` function.
 *
 * @name concat
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @example
 *
 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
 *     // files is now a list of filenames that exist in the 3 directories
 * });
 */
var concat = doLimit(concatLimit, Infinity);

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatSeries = doLimit(concatLimit, 1);

/**
 * Returns a function that when called, calls-back with the values provided.
 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
 * [`auto`]{@link module:ControlFlow.auto}.
 *
 * @name constant
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {...*} arguments... - Any number of arguments to automatically invoke
 * callback with.
 * @returns {AsyncFunction} Returns a function that when invoked, automatically
 * invokes the callback with the previous given arguments.
 * @example
 *
 * async.waterfall([
 *     async.constant(42),
 *     function (value, next) {
 *         // value === 42
 *     },
 *     //...
 * ], callback);
 *
 * async.waterfall([
 *     async.constant(filename, "utf8"),
 *     fs.readFile,
 *     function (fileData, next) {
 *         //...
 *     }
 *     //...
 * ], callback);
 *
 * async.auto({
 *     hostname: async.constant("https://server.net/"),
 *     port: findFreePort,
 *     launchServer: ["hostname", "port", function (options, cb) {
 *         startServer(options, cb);
 *     }],
 *     //...
 * }, callback);
 */
var constant = function(/*...values*/) {
    var values = slice(arguments);
    var args = [null].concat(values);
    return function (/*...ignoredArgs, callback*/) {
        var callback = arguments[arguments.length - 1];
        return callback.apply(this, args);
    };
};

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

function _createTester(check, getResult) {
    return function(eachfn, arr, iteratee, cb) {
        cb = cb || noop;
        var testPassed = false;
        var testResult;
        eachfn(arr, function(value, _, callback) {
            iteratee(value, function(err, result) {
                if (err) {
                    callback(err);
                } else if (check(result) && !testResult) {
                    testPassed = true;
                    testResult = getResult(true, value);
                    callback(null, breakLoop);
                } else {
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                cb(null, testPassed ? testResult : getResult(false));
            }
        });
    };
}

function _findGetResult(v, x) {
    return x;
}

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
var detect = doParallel(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectLimit = doParallelLimit(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectSeries = doLimit(detectLimit, 1);

function consoleFunc(name) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        args.push(function (err/*, ...args*/) {
            var args = slice(arguments, 1);
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        });
        wrapAsync(fn).apply(null, args);
    };
}

/**
 * Logs the result of an [`async` function]{@link AsyncFunction} to the
 * `console` using `console.dir` to display the properties of the resulting object.
 * Only works in Node.js or in browsers that support `console.dir` and
 * `console.error` (such as FF and Chrome).
 * If multiple arguments are returned from the async function,
 * `console.dir` is called on each argument in order.
 *
 * @name dir
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, {hello: name});
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.dir(hello, 'world');
 * {hello: 'world'}
 */
var dir = consoleFunc('dir');

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occurred, otherwise `null`.
 */
function doDuring(fn, test, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        args.push(check);
        _test.apply(this, args);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    check(null, true);

}

/**
 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `iteratee` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - A function which is called each time `test`
 * passes. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped.
 * `callback` will be passed an error and any arguments passed to the final
 * `iteratee`'s callback. Invoked with (err, [results]);
 */
function doWhilst(iteratee, test, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        if (test.apply(this, args)) return _iteratee(next);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function doUntil(iteratee, test, callback) {
    doWhilst(iteratee, function() {
        return !test.apply(this, arguments);
    }, callback);
}

/**
 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
 * is passed a callback in the form of `function (err, truth)`. If error is
 * passed to `test` or `fn`, the main callback is immediately called with the
 * value of the error.
 *
 * @name during
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error, if one occurred, otherwise `null`.
 * @example
 *
 * var count = 0;
 *
 * async.during(
 *     function (callback) {
 *         return callback(null, count < 5);
 *     },
 *     function (callback) {
 *         count++;
 *         setTimeout(callback, 1000);
 *     },
 *     function (err) {
 *         // 5 seconds have passed
 *     }
 * );
 */
function during(test, fn, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err) {
        if (err) return callback(err);
        _test(check);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    _test(check);
}

function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` passes an error to its `callback`, the
 * main `callback` (for the `each` function) is immediately called with the
 * error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to
 * each item in `coll`. Invoked with (item, callback).
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOf`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile, function(err){
 *   // if any of the saves produced an error, err would equal that error
 * });
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, function(file, callback) {
 *
 *     // Perform operation on file here.
 *     console.log('Processing file ' + file);
 *
 *     if( file.length > 32 ) {
 *       console.log('This file name is too long');
 *       callback('File name too long');
 *     } else {
 *       // Do work to process file here
 *       console.log('File processed');
 *       callback();
 *     }
 * }, function(err) {
 *     // if any of the file processing produced an error, err would equal that error
 *     if( err ) {
 *       // One of the iterations produced an error.
 *       // All processing will now stop.
 *       console.log('A file failed to process');
 *     } else {
 *       console.log('All files have been processed successfully');
 *     }
 * });
 */
function eachLimit(coll, iteratee, callback) {
    eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfLimit`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit$1(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
var eachSeries = doLimit(eachLimit$1, 1);

/**
 * Wrap an async function and ensure it calls its callback on a later tick of
 * the event loop.  If the function already calls its callback on a next tick,
 * no extra deferral is added. This is useful for preventing stack overflows
 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
 * contained. ES2017 `async` functions are returned as-is -- they are immune
 * to Zalgo's corrupting influences, as they always resolve on a later tick.
 *
 * @name ensureAsync
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - an async function, one that expects a node-style
 * callback as its last argument.
 * @returns {AsyncFunction} Returns a wrapped function with the exact same call
 * signature as the function passed in.
 * @example
 *
 * function sometimesAsync(arg, callback) {
 *     if (cache[arg]) {
 *         return callback(null, cache[arg]); // this would be synchronous!!
 *     } else {
 *         doSomeIO(arg, callback); // this IO would be asynchronous
 *     }
 * }
 *
 * // this has a risk of stack overflows if many results are cached in a row
 * async.mapSeries(args, sometimesAsync, done);
 *
 * // this will defer sometimesAsync's callback if necessary,
 * // preventing stack overflows
 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 */
function ensureAsync(fn) {
    if (isAsync(fn)) return fn;
    return initialParams(function (args, callback) {
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function notId(v) {
    return !v;
}

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @example
 *
 * async.every(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then every file exists
 * });
 */
var every = doParallel(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everyLimit = doParallelLimit(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in series.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everySeries = doLimit(everyLimit, 1);

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

function filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (truthValues[i]) results.push(arr[i]);
        }
        callback(null, results);
    });
}

function filterGeneric(eachfn, coll, iteratee, callback) {
    var results = [];
    eachfn(coll, function (x, index, callback) {
        iteratee(x, function (err, v) {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, arrayMap(results.sort(function (a, b) {
                return a.index - b.index;
            }), baseProperty('value')));
        }
    });
}

function _filter(eachfn, coll, iteratee, callback) {
    var filter = isArrayLike(coll) ? filterArray : filterGeneric;
    filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
}

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.filter(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of the existing files
 * });
 */
var filter = doParallel(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var filterLimit = doParallelLimit(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 */
var filterSeries = doLimit(filterLimit, 1);

/**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
function forever(fn, errback) {
    var done = onlyOnce(errback || noop);
    var task = wrapAsync(ensureAsync(fn));

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupByLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err, key) {
            if (err) return callback(err);
            return callback(null, {key: key, val: val});
        });
    }, function(err, mapResults) {
        var result = {};
        // from MDN, handle object having an `hasOwnProperty` prop
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                var key = mapResults[i].key;
                var val = mapResults[i].val;

                if (hasOwnProperty.call(result, key)) {
                    result[key].push(val);
                } else {
                    result[key] = [val];
                }
            }
        }

        return callback(err, result);
    });
};

/**
 * Returns a new object, where each value corresponds to an array of items, from
 * `coll`, that returned the corresponding key. That is, the keys of the object
 * correspond to the values passed to the `iteratee` callback.
 *
 * Note: Since this function applies the `iteratee` to each item in parallel,
 * there is no guarantee that the `iteratee` functions will complete in order.
 * However, the values for each key in the `result` will be in the same order as
 * the original `coll`. For Objects, the values will roughly be in the order of
 * the original Objects' keys (but this can vary across JavaScript engines).
 *
 * @name groupBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @example
 *
 * async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
 *     db.findById(userId, function(err, user) {
 *         if (err) return callback(err);
 *         return callback(null, user.age);
 *     });
 * }, function(err, result) {
 *     // result is object containing the userIds grouped by age
 *     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
 * });
 */
var groupBy = doLimit(groupByLimit, Infinity);

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
 *
 * @name groupBySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupBySeries = doLimit(groupByLimit, 1);

/**
 * Logs the result of an `async` function to the `console`. Only works in
 * Node.js or in browsers that support `console.log` and `console.error` (such
 * as FF and Chrome). If multiple arguments are returned from the async
 * function, `console.log` is called on each argument in order.
 *
 * @name log
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, 'hello ' + name);
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.log(hello, 'world');
 * 'hello world'
 */
var log = consoleFunc('log');

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name mapValuesLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
function mapValuesLimit(obj, limit, iteratee, callback) {
    callback = once(callback || noop);
    var newObj = {};
    var _iteratee = wrapAsync(iteratee);
    eachOfLimit(obj, limit, function(val, key, next) {
        _iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        });
    }, function (err) {
        callback(err, newObj);
    });
}

/**
 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
 *
 * Produces a new Object by mapping each value of `obj` through the `iteratee`
 * function. The `iteratee` is called each `value` and `key` from `obj` and a
 * callback for when it has finished processing. Each of these callbacks takes
 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
 * passes an error to its callback, the main `callback` (for the `mapValues`
 * function) is immediately called with the error.
 *
 * Note, the order of the keys in the result is not guaranteed.  The keys will
 * be roughly in the order they complete, (but this is very engine-specific)
 *
 * @name mapValues
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 * @example
 *
 * async.mapValues({
 *     f1: 'file1',
 *     f2: 'file2',
 *     f3: 'file3'
 * }, function (file, key, callback) {
 *   fs.stat(file, callback);
 * }, function(err, result) {
 *     // result is now a map of stats for each file, e.g.
 *     // {
 *     //     f1: [stats for file1],
 *     //     f2: [stats for file2],
 *     //     f3: [stats for file3]
 *     // }
 * });
 */

var mapValues = doLimit(mapValuesLimit, Infinity);

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
var mapValuesSeries = doLimit(mapValuesLimit, 1);

function has(obj, key) {
    return key in obj;
}

/**
 * Caches the results of an async function. When creating a hash to store
 * function results against, the callback is omitted from the hash and an
 * optional hash function can be used.
 *
 * If no hash function is specified, the first argument is used as a hash key,
 * which may work reasonably if it is a string or a data type that converts to a
 * distinct string. Note that objects and arrays will not behave reasonably.
 * Neither will cases where the other arguments are significant. In such cases,
 * specify your own hash function.
 *
 * The cache of results is exposed as the `memo` property of the function
 * returned by `memoize`.
 *
 * @name memoize
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function to proxy and cache results from.
 * @param {Function} hasher - An optional function for generating a custom hash
 * for storing results. It has all the arguments applied to it apart from the
 * callback, and must be synchronous.
 * @returns {AsyncFunction} a memoized version of `fn`
 * @example
 *
 * var slow_fn = function(name, callback) {
 *     // do something
 *     callback(null, result);
 * };
 * var fn = async.memoize(slow_fn);
 *
 * // fn can now be used as if it were slow_fn
 * fn('some name', function() {
 *     // callback
 * });
 */
function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var _fn = wrapAsync(fn);
    var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate$1(function() {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            _fn.apply(null, args.concat(function(/*args*/) {
                var args = slice(arguments);
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            }));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `process.nextTicl`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name nextTick
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.setImmediate]{@link module:Utils.setImmediate}
 * @category Util
 * @param {Function} callback - The function to call on a later loop around
 * the event loop. Invoked with (args...).
 * @param {...*} args... - any number of additional arguments to pass to the
 * callback on the next tick.
 * @example
 *
 * var call_order = [];
 * async.nextTick(function() {
 *     call_order.push('two');
 *     // call_order now equals ['one','two']
 * });
 * call_order.push('one');
 *
 * async.setImmediate(function (a, b, c) {
 *     // a, b, and c equal 1, 2, and 3
 * }, 1, 2, 3);
 */
var _defer$1;

if (hasNextTick) {
    _defer$1 = process.nextTick;
} else if (hasSetImmediate) {
    _defer$1 = setImmediate;
} else {
    _defer$1 = fallback;
}

var nextTick = wrap(_defer$1);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        wrapAsync(task)(function (err, result) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            results[key] = result;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Run the `tasks` collection of functions in parallel, without waiting until
 * the previous function has completed. If any of the functions pass an error to
 * its callback, the main `callback` is immediately called with the value of the
 * error. Once the `tasks` have completed, the results are passed to the final
 * `callback` as an array.
 *
 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
 * parallel execution of code.  If your tasks do not use any timers or perform
 * any I/O, they will actually be executed in series.  Any synchronous setup
 * sections for each task will happen one after the other.  JavaScript remains
 * single-threaded.
 *
 * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
 * execution of other tasks when a task fails.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 * results from {@link async.parallel}.
 *
 * @name parallel
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 *
 * @example
 * async.parallel([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // the results array will equal ['one','two'] even though
 *     // the second function had a shorter timeout.
 * });
 *
 * // an example using an object instead of an array
 * async.parallel({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equals to: {one: 1, two: 2}
 * });
 */
function parallelLimit(tasks, callback) {
    _parallel(eachOf, tasks, callback);
}

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
function parallelLimit$1(tasks, limit, callback) {
    _parallel(_eachOfLimit(limit), tasks, callback);
}

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} remove - remove items from the queue that match a test
 * function.  The test function will be passed an object with a `data` property,
 * and a `priority` property, if this is a
 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
 * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
 * `function ({data, priority}) {}` and returns a Boolean.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. No more tasks
 * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`. Invoked with (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
var queue$1 = function (worker, concurrency) {
    var _worker = wrapAsync(worker);
    return queue(function (items, cb) {
        _worker(items[0], cb);
    }, concurrency, 1);
};

/**
 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
 * completed in ascending priority order.
 *
 * @name priorityQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`.
 * Invoked with (task, callback).
 * @param {number} concurrency - An `integer` for determining how many `worker`
 * functions should be run in parallel.  If omitted, the concurrency defaults to
 * `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
 * differences between `queue` and `priorityQueue` objects:
 * * `push(task, priority, [callback])` - `priority` should be a number. If an
 *   array of `tasks` is given, all tasks will be assigned the same priority.
 * * The `unshift` method was removed.
 */
var priorityQueue = function(worker, concurrency) {
    // Start with a normal queue
    var q = queue$1(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function(data, priority, callback) {
        if (callback == null) callback = noop;
        if (typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
            nextNode = nextNode.next;
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                priority: priority,
                callback: callback
            };

            if (nextNode) {
                q._tasks.insertBefore(nextNode, item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
 * to run. Each function can complete with an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @returns undefined
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
function race(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++) {
        wrapAsync(tasks[i])(callback);
    }
}

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
function reduceRight (array, memo, iteratee, callback) {
    var reversed = slice(array).reverse();
    reduce(reversed, memo, iteratee, callback);
}

/**
 * Wraps the async function in another function that always completes with a
 * result object, even when it errors.
 *
 * The result object has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
function reflect(fn) {
    var _fn = wrapAsync(fn);
    return initialParams(function reflectOn(args, reflectCallback) {
        args.push(function callback(error, cbArg) {
            if (error) {
                reflectCallback(null, { error: error });
            } else {
                var value;
                if (arguments.length <= 2) {
                    value = cbArg;
                } else {
                    value = slice(arguments, 1);
                }
                reflectCallback(null, { value: value });
            }
        });

        return _fn.apply(this, args);
    });
}

/**
 * A helper function that wraps an array or an object of functions with `reflect`.
 *
 * @name reflectAll
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.reflect]{@link module:Utils.reflect}
 * @category Util
 * @param {Array|Object|Iterable} tasks - The collection of
 * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
 * @returns {Array} Returns an array of async functions, each wrapped in
 * `async.reflect`
 * @example
 *
 * let tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         // do some more stuff but error ...
 *         callback(new Error('bad stuff happened'));
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ];
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = Error('bad stuff happened')
 *     // results[2].value = 'two'
 * });
 *
 * // an example using an object instead of an array
 * let tasks = {
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         callback('two');
 *     },
 *     three: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 100);
 *     }
 * };
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results.one.value = 'one'
 *     // results.two.error = 'two'
 *     // results.three.value = 'three'
 * });
 */
function reflectAll(tasks) {
    var results;
    if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
    } else {
        results = {};
        baseForOwn(tasks, function(task, key) {
            results[key] = reflect.call(this, task);
        });
    }
    return results;
}

function reject$1(eachfn, arr, iteratee, callback) {
    _filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
            cb(err, !v);
        });
    }, callback);
}

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.reject(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of missing files
 *     createFiles(results);
 * });
 */
var reject = doParallel(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectLimit = doParallelLimit(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectSeries = doLimit(rejectLimit, 1);

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant$1(value) {
  return function() {
    return value;
  };
}

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @see [async.retryable]{@link module:ControlFlow.retryable}
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {AsyncFunction} task - An async function to retry.
 * Invoked with (callback).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 *
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // to retry individual methods that are not as reliable within other
 * // control flow functions, use the `retryable` wrapper:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retryable(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
function retry(opts, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant$1(DEFAULT_INTERVAL)
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ?
                t.interval :
                constant$1(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
    } else {
        parseTimes(options, opts);
        callback = callback || noop;
    }

    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }

    var _task = wrapAsync(task);

    var attempt = 1;
    function retryAttempt() {
        _task(function(err) {
            if (err && attempt++ < options.times &&
                (typeof options.errorFilter != 'function' ||
                    options.errorFilter(err))) {
                setTimeout(retryAttempt, options.intervalFunc(attempt));
            } else {
                callback.apply(null, arguments);
            }
        });
    }

    retryAttempt();
}

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
 * wraps a task and makes it retryable, rather than immediately calling it
 * with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {AsyncFunction} task - the asynchronous function to wrap.
 * This function will be passed any arguments passed to the returned wrapper.
 * Invoked with (...args, callback).
 * @returns {AsyncFunction} The wrapped function, which when invoked, will
 * retry on an error, based on the parameters specified in `opts`.
 * This function will accept the same parameters as `task`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */
var retryable = function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    var _task = wrapAsync(task);
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            _task.apply(null, args.concat(cb));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
};

/**
 * Run the functions in the `tasks` collection in series, each one running once
 * the previous function has completed. If any functions in the series pass an
 * error to its callback, no more functions are run, and `callback` is
 * immediately called with the value of the error. Otherwise, `callback`
 * receives an array of results when `tasks` have completed.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function, and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 *  results from {@link async.series}.
 *
 * **Note** that while many implementations preserve the order of object
 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
 * explicitly states that
 *
 * > The mechanics and order of enumerating the properties is not specified.
 *
 * So if you rely on the order in which your series of functions are executed,
 * and want this to work on all platforms, consider using an array.
 *
 * @name series
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing
 * [async functions]{@link AsyncFunction} to run in series.
 * Each function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This function gets a results array (or object)
 * containing all the result arguments passed to the `task` callbacks. Invoked
 * with (err, result).
 * @example
 * async.series([
 *     function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     },
 *     function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // results is now equal to ['one', 'two']
 * });
 *
 * async.series({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback){
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equal to: {one: 1, two: 2}
 * });
 */
function series(tasks, callback) {
    _parallel(eachOfSeries, tasks, callback);
}

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @example
 *
 * async.some(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
var some = doParallel(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someLimit = doParallelLimit(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in series.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someSeries = doLimit(someLimit, 1);

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a value to use as the sort criteria as
 * its `result`.
 * Invoked with (item, callback).
 * @param {Function} callback - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is the items
 * from the original `coll` sorted by the values returned by the `iteratee`
 * calls. Invoked with (err, results).
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *     fs.stat(file, function(err, stats) {
 *         callback(err, stats.mtime);
 *     });
 * }, function(err, results) {
 *     // results is now the original array of files sorted by
 *     // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x);
 * }, function(err,result) {
 *     // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */
function sortBy (coll, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    map(coll, function (x, callback) {
        _iteratee(x, function (err, criteria) {
            if (err) return callback(err);
            callback(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} asyncFn - The async function to limit in time.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
 * of the control flow functions.
 * Invoke this function with the same parameters as you would `asyncFunc`.
 * @example
 *
 * function myFunction(foo, callback) {
 *     doAsyncTask(foo, function(err, data) {
 *         // handle errors
 *         if (err) return callback(err);
 *
 *         // do some stuff ...
 *
 *         // return processed data
 *         return callback(null, data);
 *     });
 * }
 *
 * var wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }, function(err, data) {
 *     // if `myFunction` takes < 1000 ms to execute, `err`
 *     // and `data` will have their expected values
 *
 *     // else `err` will be an Error with the code 'ETIMEDOUT'
 * });
 */
function timeout(asyncFn, milliseconds, info) {
    var fn = wrapAsync(asyncFn);

    return initialParams(function (args, callback) {
        var timedOut = false;
        var timer;

        function timeoutCallback() {
            var name = asyncFn.name || 'anonymous';
            var error  = new Error('Callback function "' + name + '" timed out.');
            error.code = 'ETIMEDOUT';
            if (info) {
                error.info = info;
            }
            timedOut = true;
            callback(error);
        }

        args.push(function () {
            if (!timedOut) {
                callback.apply(null, arguments);
                clearTimeout(timer);
            }
        });

        // setup timer and call original function
        timer = setTimeout(timeoutCallback, milliseconds);
        fn.apply(null, args);
    });
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;
var nativeMax = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
function timeLimit(count, limit, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    mapLimit(baseRange(0, count, 1), limit, _iteratee, callback);
}

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [map]{@link module:Collections.map}.
 *
 * @name times
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
var times = doLimit(timeLimit, Infinity);

/**
 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 */
var timesSeries = doLimit(timeLimit, 1);

/**
 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
 * element in series, each step potentially mutating an `accumulator` value.
 * The type of the accumulator defaults to the type of collection passed in.
 *
 * @name transform
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
 * it will default to an empty Object or Array, depending on the type of `coll`
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * collection that potentially modifies the accumulator.
 * Invoked with (accumulator, item, key, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the transformed accumulator.
 * Invoked with (err, result).
 * @example
 *
 * async.transform([1,2,3], function(acc, item, index, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         acc.push(item * 2)
 *         callback(null)
 *     });
 * }, function(err, result) {
 *     // result is now equal to [2, 4, 6]
 * });
 *
 * @example
 *
 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
 *     setImmediate(function () {
 *         obj[key] = val * 2;
 *         callback();
 *     })
 * }, function (err, result) {
 *     // result is equal to {a: 2, b: 4, c: 6}
 * })
 */
function transform (coll, accumulator, iteratee, callback) {
    if (arguments.length <= 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
    }
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);

    eachOf(coll, function(v, k, cb) {
        _iteratee(accumulator, v, k, cb);
    }, function(err) {
        callback(err, accumulator);
    });
}

/**
 * It runs each task in series but stops whenever any of the functions were
 * successful. If one of the tasks were successful, the `callback` will be
 * passed the result of the successful task. If all tasks fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name tryEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to
 * run, each function is passed a `callback(err, result)` it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {Function} [callback] - An optional callback which is called when one
 * of the tasks has succeeded, or all have failed. It receives the `err` and
 * `result` arguments of the last attempt at completing the `task`. Invoked with
 * (err, results).
 * @example
 * async.tryEach([
 *     function getDataFromFirstWebsite(callback) {
 *         // Try getting the data from the first website
 *         callback(err, data);
 *     },
 *     function getDataFromSecondWebsite(callback) {
 *         // First website failed,
 *         // Try getting the data from the backup website
 *         callback(err, data);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     Now do something with the data.
 * });
 *
 */
function tryEach(tasks, callback) {
    var error = null;
    var result;
    callback = callback || noop;
    eachSeries(tasks, function(task, callback) {
        wrapAsync(task)(function (err, res/*, ...args*/) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            } else {
                result = res;
            }
            error = err;
            callback(!err);
        });
    }, function () {
        callback(error, result);
    });
}

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {AsyncFunction} fn - the memoized function
 * @returns {AsyncFunction} a function that calls the original unmemoized function
 */
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

/**
 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs.
 *
 * @name whilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns undefined
 * @example
 *
 * var count = 0;
 * async.whilst(
 *     function() { return count < 5; },
 *     function(callback) {
 *         count++;
 *         setTimeout(function() {
 *             callback(null, count);
 *         }, 1000);
 *     },
 *     function (err, n) {
 *         // 5 seconds have passed, n = 5
 *     }
 * );
 */
function whilst(test, iteratee, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    if (!test()) return callback(null);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        if (test()) return _iteratee(next);
        var args = slice(arguments, 1);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs. `callback` will be passed an error and any
 * arguments passed to the final `iteratee`'s callback.
 *
 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
 *
 * @name until
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function until(test, iteratee, callback) {
    whilst(function() {
        return !test.apply(this, arguments);
    }, iteratee, callback);
}

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
var waterfall = function(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        var task = wrapAsync(tasks[taskIndex++]);
        args.push(onlyOnce(next));
        task.apply(null, args);
    }

    function next(err/*, ...args*/) {
        if (err || taskIndex === tasks.length) {
            return callback.apply(null, arguments);
        }
        nextTask(slice(arguments, 1));
    }

    nextTask([]);
};

/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */


/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

var index = {
    apply: apply,
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    asyncify: asyncify,
    auto: auto,
    autoInject: autoInject,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatLimit: concatLimit,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: eachLimit,
    eachLimit: eachLimit$1,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    everySeries: everySeries,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    groupBy: groupBy,
    groupByLimit: groupByLimit,
    groupBySeries: groupBySeries,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    mapValues: mapValues,
    mapValuesLimit: mapValuesLimit,
    mapValuesSeries: mapValuesSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallelLimit,
    parallelLimit: parallelLimit$1,
    priorityQueue: priorityQueue,
    queue: queue$1,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reflect: reflect,
    reflectAll: reflectAll,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    retryable: retryable,
    seq: seq,
    series: series,
    setImmediate: setImmediate$1,
    some: some,
    someLimit: someLimit,
    someSeries: someSeries,
    sortBy: sortBy,
    timeout: timeout,
    times: times,
    timesLimit: timeLimit,
    timesSeries: timesSeries,
    transform: transform,
    tryEach: tryEach,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    allLimit: everyLimit,
    allSeries: everySeries,
    any: some,
    anyLimit: someLimit,
    anySeries: someSeries,
    find: detect,
    findLimit: detectLimit,
    findSeries: detectSeries,
    forEach: eachLimit,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit$1,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify
};

exports['default'] = index;
exports.apply = apply;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.asyncify = asyncify;
exports.auto = auto;
exports.autoInject = autoInject;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatLimit = concatLimit;
exports.concatSeries = concatSeries;
exports.constant = constant;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = eachLimit;
exports.eachLimit = eachLimit$1;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.everySeries = everySeries;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.groupBy = groupBy;
exports.groupByLimit = groupByLimit;
exports.groupBySeries = groupBySeries;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.mapValues = mapValues;
exports.mapValuesLimit = mapValuesLimit;
exports.mapValuesSeries = mapValuesSeries;
exports.memoize = memoize;
exports.nextTick = nextTick;
exports.parallel = parallelLimit;
exports.parallelLimit = parallelLimit$1;
exports.priorityQueue = priorityQueue;
exports.queue = queue$1;
exports.race = race;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reflect = reflect;
exports.reflectAll = reflectAll;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.retryable = retryable;
exports.seq = seq;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.someSeries = someSeries;
exports.sortBy = sortBy;
exports.timeout = timeout;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.tryEach = tryEach;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.allLimit = everyLimit;
exports.allSeries = everySeries;
exports.any = some;
exports.anyLimit = someLimit;
exports.anySeries = someSeries;
exports.find = detect;
exports.findLimit = detectLimit;
exports.findSeries = detectSeries;
exports.forEach = eachLimit;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit$1;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;

Object.defineProperty(exports, '__esModule', { value: true });

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":4}],2:[function(require,module,exports){
// Copyright (c) 2014 Takuya Asano All Rights Reserved.

(function () {

    "use strict";

    var TERM_CHAR = "\u0000", // terminal character
        TERM_CODE = 0,        // terminal character code
        ROOT_ID = 0,          // index of root node
        NOT_FOUND = -1,       // traverse() returns if no nodes found
        BASE_SIGNED = true,
        CHECK_SIGNED = true,
        BASE_BYTES = 4,
        CHECK_BYTES = 4,
        MEMORY_EXPAND_RATIO = 2;


    var newBC = function (initial_size) {

        if (initial_size == null) {
            initial_size = 1024;
        }

        var initBase = function (_base, start, end) {  // 'end' index does not include
            for (var i = start; i < end; i++) {
                _base[i] = - i + 1;  // inversed previous empty node index
            }
            if (0 < check.array[check.array.length - 1]) {
                var last_used_id = check.array.length - 2;
                while (0 < check.array[last_used_id]) {
                    last_used_id--;
                }
                _base[start] = - last_used_id;
            }
        };

        var initCheck = function (_check, start, end) {
            for (var i = start; i < end; i++) {
                _check[i] = - i - 1;  // inversed next empty node index
            }
        };

        var realloc = function (min_size) {
            // expand arrays size by given ratio
            var new_size = min_size * MEMORY_EXPAND_RATIO;
            // console.log('re-allocate memory to ' + new_size);

            var base_new_array = newArrayBuffer(base.signed, base.bytes, new_size);
            initBase(base_new_array, base.array.length, new_size);  // init BASE in new range
            base_new_array.set(base.array);
            base.array = null;  // explicit GC
            base.array = base_new_array;

            var check_new_array = newArrayBuffer(check.signed, check.bytes, new_size);
            initCheck(check_new_array, check.array.length, new_size);  // init CHECK in new range
            check_new_array.set(check.array);
            check.array = null;  // explicit GC
            check.array = check_new_array;
        };

        var first_unused_node = ROOT_ID + 1;

        var base = {
            signed: BASE_SIGNED,
            bytes: BASE_BYTES,
            array: newArrayBuffer(BASE_SIGNED, BASE_BYTES, initial_size)
        };

        var check = {
            signed: CHECK_SIGNED,
            bytes: CHECK_BYTES,
            array: newArrayBuffer(CHECK_SIGNED, CHECK_BYTES, initial_size)
        };

        // init root node
        base.array[ROOT_ID] = 1;
        check.array[ROOT_ID] = ROOT_ID;

        // init BASE
        initBase(base.array, ROOT_ID + 1, base.array.length);

        // init CHECK
        initCheck(check.array, ROOT_ID + 1, check.array.length);

        return {
            getBaseBuffer: function () {
                return base.array;
            },
            getCheckBuffer: function () {
                return check.array;
            },
            loadBaseBuffer: function (base_buffer) {
                base.array = base_buffer;
                return this;
            },
            loadCheckBuffer: function (check_buffer) {
                check.array = check_buffer;
                return this;
            },
            size: function () {
                return Math.max(base.array.length, check.array.length);
            },
            getBase: function (index) {
                if (base.array.length - 1 < index) {
                    return - index + 1;
                    // realloc(index);
                }
                // if (!Number.isFinite(base.array[index])) {
                //     console.log('getBase:' + index);
                //     throw 'getBase' + index;
                // }
                return base.array[index];
            },
            getCheck: function (index) {
                if (check.array.length - 1 < index) {
                    return - index - 1;
                    // realloc(index);
                }
                // if (!Number.isFinite(check.array[index])) {
                //     console.log('getCheck:' + index);
                //     throw 'getCheck' + index;
                // }
                return check.array[index];
            },
            setBase: function (index, base_value) {
                if (base.array.length - 1 < index) {
                    realloc(index);
                }
                base.array[index] = base_value;
            },
            setCheck: function (index, check_value) {
                if (check.array.length - 1 < index) {
                    realloc(index);
                }
                check.array[index] = check_value;
            },
            setFirstUnusedNode: function (index) {
                // if (!Number.isFinite(index)) {
                //     throw 'assertion error: setFirstUnusedNode ' + index + ' is not finite number';
                // }
                first_unused_node = index;
            },
            getFirstUnusedNode: function () {
                // if (!Number.isFinite(first_unused_node)) {
                //     throw 'assertion error: getFirstUnusedNode ' + first_unused_node + ' is not finite number';
                // }
                return first_unused_node;
            },
            shrink: function () {
                var last_index = this.size() - 1;
                while (true) {
                    if (0 <= check.array[last_index]) {
                        break;
                    }
                    last_index--;
                }
                base.array = base.array.subarray(0, last_index + 2);   // keep last unused node
                check.array = check.array.subarray(0, last_index + 2); // keep last unused node
            },
            calc: function () {
                var unused_count = 0;
                var size = check.array.length;
                for (var i = 0; i < size; i++) {
                    if (check.array[i] < 0) {
                        unused_count++;
                    }
                }
                return {
                    all: size,
                    unused: unused_count,
                    efficiency: (size - unused_count) / size
                };
            },
            dump: function () {
                // for debug
                var dump_base = "";
                var dump_check = "";

                var i;
                for (i = 0; i < base.array.length; i++) {
                    dump_base = dump_base + " " + this.getBase(i);
                }
                for (i = 0; i < check.array.length; i++) {
                    dump_check = dump_check + " " + this.getCheck(i);
                }

                console.log("base:" + dump_base);
                console.log("chck:" + dump_check);

                return "base:" + dump_base + " chck:" + dump_check;
            }
        };
    };


    /**
     * Factory method of double array
     */
    function DoubleArrayBuilder(initial_size) {
        this.bc = newBC(initial_size);  // BASE and CHECK
        this.keys = [];
    }


    /**
     * Append a key to initialize set
     * (This method should be called by dictionary ordered key)
     *
     * @param {String} key
     * @param {Number} value Integer value from 0 to max signed integer number - 1
     */
    DoubleArrayBuilder.prototype.append = function (key, record) {
        this.keys.push({ k: key, v: record });
        return this;
    };

    /**
     * Build double array for given keys
     *
     * @param {Array} keys Array of keys. A key is a Object which has properties 'k', 'v'.
     * 'k' is a key string, 'v' is a record assigned to that key.
     * @return {DoubleArray} Compiled double array
     */
    DoubleArrayBuilder.prototype.build = function (keys, sorted) {

        if (keys == null) {
            keys = this.keys;
        }

        if (keys == null) {
            return new DoubleArray(this.bc);
        }

        if (sorted == null) {
            sorted = false;
        }

        // Convert key string to ArrayBuffer
        var buff_keys =
            keys.map(function (k) {
                return {
                    k: stringToUtf8Bytes(k.k + TERM_CHAR),
                    v: k.v
                };
            });

        // Sort keys by byte order
        if (sorted) {
            this.keys = buff_keys;
        } else {
            this.keys =
                buff_keys.sort(function (k1, k2) {
                    var b1 = k1.k;
                    var b2 = k2.k;
                    var min_length = Math.min(b1.length, b2.length);
                    for (var pos = 0; pos < min_length; pos++) {
                        if (b1[pos] === b2[pos]) {
                            continue;
                        }
                        return b1[pos] - b2[pos];
                    }
                    return b1.length - b2.length;
                });
        }

        buff_keys = null;  // explicit GC

        this._build(ROOT_ID, 0, 0, this.keys.length);
        return new DoubleArray(this.bc);
    };

    /**
     * Append nodes to BASE and CHECK array recursively
     */
    DoubleArrayBuilder.prototype._build = function (parent_index, position, start, length) {

        var children_info = this.getChildrenInfo(position, start, length);
        var _base = this.findAllocatableBase(children_info);

        this.setBC(parent_index, children_info, _base);

        for (var i = 0; i < children_info.length; i = i + 3) {
            var child_code = children_info[i];
            if (child_code === TERM_CODE) {
                continue;
            }
            var child_start = children_info[i + 1];
            var child_len = children_info[i + 2];
            var child_index = _base + child_code;
            this._build(child_index, position + 1, child_start, child_len);
        }
    };

    DoubleArrayBuilder.prototype.getChildrenInfo = function (position, start, length) {
        var current_char = this.keys[start].k[position];
        var i = 0;
        var children_info = new Int32Array(length * 3);

        children_info[i++] = current_char;  // char (current)
        children_info[i++] = start;         // start index (current)

        var next_pos = start;
        var start_pos = start;
        for (; next_pos < start + length; next_pos++) {
            var next_char = this.keys[next_pos].k[position];
            if (current_char !== next_char) {
                children_info[i++] = next_pos - start_pos;  // length (current)

                children_info[i++] = next_char;             // char (next)
                children_info[i++] = next_pos;              // start index (next)
                current_char = next_char;
                start_pos = next_pos;
            }
        }
        children_info[i++] = next_pos - start_pos;
        children_info = children_info.subarray(0, i);

        return children_info;
    };

    DoubleArrayBuilder.prototype.setBC = function (parent_id, children_info, _base) {

        var bc = this.bc;

        bc.setBase(parent_id, _base);  // Update BASE of parent node

        var i;
        for (i = 0; i < children_info.length; i = i + 3) {
            var code = children_info[i];
            var child_id = _base + code;

            // Update linked list of unused nodes

            // Assertion
            // if (child_id < 0) {
            //     throw 'assertion error: child_id is negative'
            // }

            var prev_unused_id = - bc.getBase(child_id);
            var next_unused_id = - bc.getCheck(child_id);
            // if (prev_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            // if (next_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            if (child_id !== bc.getFirstUnusedNode()) {
                bc.setCheck(prev_unused_id, - next_unused_id);
            } else {
                // Update first_unused_node
                bc.setFirstUnusedNode(next_unused_id);
            }
            bc.setBase(next_unused_id, - prev_unused_id);

            var check = parent_id;         // CHECK is parent node index
            bc.setCheck(child_id, check);  // Update CHECK of child node

            // Update record
            if (code === TERM_CODE) {
                var start_pos = children_info[i + 1];
                // var len = children_info[i + 2];
                // if (len != 1) {
                //     throw 'assertion error: there are multiple terminal nodes. len:' + len;
                // }
                var value = this.keys[start_pos].v;

                if (value == null) {
                    value = 0;
                }

                var base = - value - 1;       // BASE is inverted record value
                bc.setBase(child_id, base);  // Update BASE of child(leaf) node
            }
        }
    };


    /**
     * Find BASE value that all children are allocatable in double array's region
     */
    DoubleArrayBuilder.prototype.findAllocatableBase = function (children_info) {

        var bc = this.bc;

        // Assertion: keys are sorted by byte order
        // var c = -1;
        // for (var i = 0; i < children_info.length; i = i + 3) {
        //     if (children_info[i] < c) {
        //         throw 'assertion error: not sort key'
        //     }
        //     c = children_info[i];
        // }

        // iterate linked list of unused nodes
        var _base;
        var curr = bc.getFirstUnusedNode();  // current index
        // if (curr < 0) {
        //     throw 'assertion error: getFirstUnusedNode returns negative value'
        // }

        while (true) {
            _base = curr - children_info[0];

            if (_base < 0) {
                curr = - bc.getCheck(curr);  // next

                // if (curr < 0) {
                //     throw 'assertion error: getCheck returns negative value'
                // }

                continue;
            }

            var empty_area_found = true;
            for (var i = 0; i < children_info.length; i = i + 3) {
                var code = children_info[i];
                var candidate_id = _base + code;

                if (!this.isUnusedNode(candidate_id)) {
                    // candidate_id is used node
                    // next
                    curr = - bc.getCheck(curr);
                    // if (curr < 0) {
                    //     throw 'assertion error: getCheck returns negative value'
                    // }

                    empty_area_found = false;
                    break;
                }
            }
            if (empty_area_found) {
                // Area is free
                return _base;
            }
        }
    };

    /**
     * Check this double array index is unused or not
     */
    DoubleArrayBuilder.prototype.isUnusedNode = function (index) {
        var bc = this.bc;
        var check = bc.getCheck(index);

        // if (index < 0) {
        //     throw 'assertion error: isUnusedNode index:' + index;
        // }

        if (index === ROOT_ID) {
            // root node
            return false;
        }
        if (check < 0) {
            // unused
            return true;
        }

        // used node (incl. leaf)
        return false;
    };


    /**
     * Factory method of double array
     */
    function DoubleArray(bc) {
        this.bc = bc;       // BASE and CHECK
        this.bc.shrink();
    }


    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Boolean} True if this trie contains a given key
     */
    DoubleArray.prototype.contain = function (key) {

        var bc = this.bc;

        key += TERM_CHAR;
        var buffer = stringToUtf8Bytes(key);

        var parent = ROOT_ID;
        var child = NOT_FOUND;

        for (var i = 0; i < buffer.length; i++) {
            var code = buffer[i];

            child = this.traverse(parent, code);
            if (child === NOT_FOUND) {
                return false;
            }

            if (bc.getBase(child) <= 0) {
                // leaf node
                return true;
            } else {
                // not leaf
                parent = child;
                continue;
            }
        }
        return false;
    };


    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Number} Record value assgned to this key, -1 if this key does not contain
     */
    DoubleArray.prototype.lookup = function (key) {

        key += TERM_CHAR;
        var buffer = stringToUtf8Bytes(key);

        var parent = ROOT_ID;
        var child = NOT_FOUND;

        for (var i = 0; i < buffer.length; i++) {
            var code = buffer[i];
            child = this.traverse(parent, code);
            if (child === NOT_FOUND) {
                return NOT_FOUND;
            }
            parent = child;
        }

        var base = this.bc.getBase(child);
        if (base <= 0) {
            // leaf node
            return - base - 1;
        } else {
            // not leaf
            return NOT_FOUND;
        }
    };


    /**
     * Common prefix search
     *
     * @param {String} key
     * @return {Array} Each result object has 'k' and 'v' (key and record,
     * respectively) properties assigned to matched string
     */
    DoubleArray.prototype.commonPrefixSearch = function (key) {

        var buffer = stringToUtf8Bytes(key);

        var parent = ROOT_ID;
        var child = NOT_FOUND;

        var result = [];

        for (var i = 0; i < buffer.length; i++) {
            var code = buffer[i];

            child = this.traverse(parent, code);

            if (child !== NOT_FOUND) {
                parent = child;

                // look forward by terminal character code to check this node is a leaf or not
                var grand_child = this.traverse(child, TERM_CODE);

                if (grand_child !== NOT_FOUND) {
                    var base = this.bc.getBase(grand_child);

                    var r = {};

                    if (base <= 0) {
                        // If child is a leaf node, add record to result
                        r.v = - base - 1;
                    }

                    // If child is a leaf node, add word to result
                    r.k = utf8BytesToString(arrayCopy(buffer, 0, i + 1));

                    result.push(r);
                }
                continue;
            } else {
                break;
            }
        }

        return result;
    };

    DoubleArray.prototype.traverse = function (parent, code) {
        var child = this.bc.getBase(parent) + code;
        if (this.bc.getCheck(child) === parent) {
            return child;
        } else {
            return NOT_FOUND;
        }
    };

    DoubleArray.prototype.size = function () {
        return this.bc.size();
    };

    DoubleArray.prototype.calc = function () {
        return this.bc.calc();
    };

    DoubleArray.prototype.dump = function () {
        return this.bc.dump();
    };


    // Array utility functions

    var newArrayBuffer = function (signed, bytes, size) {
        if (signed) {
            switch(bytes) {
                case 1:
                return new Int8Array(size);
                case 2:
                return new Int16Array(size);
                case 4:
                return new Int32Array(size);
                default:
                throw new RangeError("Invalid newArray parameter element_bytes:" + bytes);
            }
        } else {
            switch(bytes) {
                case 1:
                return new Uint8Array(size);
                case 2:
                return new Uint16Array(size);
                case 4:
                return new Uint32Array(size);
                default:
                throw new RangeError("Invalid newArray parameter element_bytes:" + bytes);
            }
        }
    };

    var arrayCopy = function (src, src_offset, length) {
        var buffer = new ArrayBuffer(length);
        var dstU8 = new Uint8Array(buffer, 0, length);
        var srcU8 = src.subarray(src_offset, length);
        dstU8.set(srcU8);
        return dstU8;
    };


    /**
     * Convert String (UTF-16) to UTF-8 ArrayBuffer
     *
     * @param {String} str UTF-16 string to convert
     * @return {Uint8Array} Byte sequence encoded by UTF-8
     */
    var stringToUtf8Bytes = function (str) {

        // Max size of 1 character is 4 bytes
        var bytes = new Uint8Array(new ArrayBuffer(str.length * 4));

        var i = 0, j = 0;

        while (i < str.length) {
            var unicode_code;

            var utf16_code = str.charCodeAt(i++);
            if (utf16_code >= 0xD800 && utf16_code <= 0xDBFF) {
                // surrogate pair
                var upper = utf16_code;           // high surrogate
                var lower = str.charCodeAt(i++);  // low surrogate

                if (lower >= 0xDC00 && lower <= 0xDFFF) {
                    unicode_code =
                        (upper - 0xD800) * (1 << 10) + (1 << 16) +
                        (lower - 0xDC00);
                } else {
                    // malformed surrogate pair
                    return null;
                }
            } else {
                // not surrogate code
                unicode_code = utf16_code;
            }

            if (unicode_code < 0x80) {
                // 1-byte
                bytes[j++] = unicode_code;

            } else if (unicode_code < (1 << 11)) {
                // 2-byte
                bytes[j++] = (unicode_code >>> 6) | 0xC0;
                bytes[j++] = (unicode_code & 0x3F) | 0x80;

            } else if (unicode_code < (1 << 16)) {
                // 3-byte
                bytes[j++] = (unicode_code >>> 12) | 0xE0;
                bytes[j++] = ((unicode_code >> 6) & 0x3f) | 0x80;
                bytes[j++] = (unicode_code & 0x3F) | 0x80;

            } else if (unicode_code < (1 << 21)) {
                // 4-byte
                bytes[j++] = (unicode_code >>> 18) | 0xF0;
                bytes[j++] = ((unicode_code >> 12) & 0x3F) | 0x80;
                bytes[j++] = ((unicode_code >> 6) & 0x3F) | 0x80;
                bytes[j++] = (unicode_code & 0x3F) | 0x80;

            } else {
                // malformed UCS4 code
            }
        }

        return bytes.subarray(0, j);
    };


    /**
     * Convert UTF-8 ArrayBuffer to String (UTF-16)
     *
     * @param {Uint8Array} bytes UTF-8 byte sequence to convert
     * @return {String} String encoded by UTF-16
     */
    var utf8BytesToString = function (bytes) {

        var str = "";
        var code, b1, b2, b3, b4, upper, lower;
        var i = 0;

        while (i < bytes.length) {

            b1 = bytes[i++];

            if (b1 < 0x80) {
                // 1 byte
                code = b1;
            } else if ((b1 >> 5) === 0x06) {
                // 2 bytes
                b2 = bytes[i++];
                code = ((b1 & 0x1f) << 6) | (b2 & 0x3f);
            } else if ((b1 >> 4) === 0x0e) {
                // 3 bytes
                b2 = bytes[i++];
                b3 = bytes[i++];
                code = ((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
            } else {
                // 4 bytes
                b2 = bytes[i++];
                b3 = bytes[i++];
                b4 = bytes[i++];
                code = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
            }

            if (code < 0x10000) {
	            str += String.fromCharCode(code);
            } else {
	            // surrogate pair
	            code -= 0x10000;
	            upper = (0xD800 | (code >> 10));
	            lower = (0xDC00 | (code & 0x3FF));
	            str += String.fromCharCode(upper, lower);
            }
        }

        return str;
    };


    // public methods
    var doublearray = {
        builder: function (initial_size) {
            return new DoubleArrayBuilder(initial_size);
        },
        load: function (base_buffer, check_buffer) {
            var bc = newBC(0);
            bc.loadBaseBuffer(base_buffer);
            bc.loadCheckBuffer(check_buffer);
            return new DoubleArray(bc);
        }
    };

    if ("undefined" === typeof module) {
	    // In browser
        window.doublearray = doublearray;
    } else {
	    // In node
        module.exports = doublearray;
    }

})();

},{}],3:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function n(e){throw e;}var p=void 0,aa=this;function t(e,b){var d=e.split("."),c=aa;!(d[0]in c)&&c.execScript&&c.execScript("var "+d[0]);for(var a;d.length&&(a=d.shift());)!d.length&&b!==p?c[a]=b:c=c[a]?c[a]:c[a]={}};var x="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;new (x?Uint8Array:Array)(256);var y;for(y=0;256>y;++y)for(var A=y,ba=7,A=A>>>1;A;A>>>=1)--ba;function B(e,b,d){var c,a="number"===typeof b?b:b=0,f="number"===typeof d?d:e.length;c=-1;for(a=f&7;a--;++b)c=c>>>8^C[(c^e[b])&255];for(a=f>>3;a--;b+=8)c=c>>>8^C[(c^e[b])&255],c=c>>>8^C[(c^e[b+1])&255],c=c>>>8^C[(c^e[b+2])&255],c=c>>>8^C[(c^e[b+3])&255],c=c>>>8^C[(c^e[b+4])&255],c=c>>>8^C[(c^e[b+5])&255],c=c>>>8^C[(c^e[b+6])&255],c=c>>>8^C[(c^e[b+7])&255];return(c^4294967295)>>>0}
var D=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],C=x?new Uint32Array(D):D;function E(){}E.prototype.getName=function(){return this.name};E.prototype.getData=function(){return this.data};E.prototype.G=function(){return this.H};function G(e){var b=e.length,d=0,c=Number.POSITIVE_INFINITY,a,f,k,l,m,r,q,g,h,v;for(g=0;g<b;++g)e[g]>d&&(d=e[g]),e[g]<c&&(c=e[g]);a=1<<d;f=new (x?Uint32Array:Array)(a);k=1;l=0;for(m=2;k<=d;){for(g=0;g<b;++g)if(e[g]===k){r=0;q=l;for(h=0;h<k;++h)r=r<<1|q&1,q>>=1;v=k<<16|g;for(h=r;h<a;h+=m)f[h]=v;++l}++k;l<<=1;m<<=1}return[f,d,c]};var J=[],K;for(K=0;288>K;K++)switch(!0){case 143>=K:J.push([K+48,8]);break;case 255>=K:J.push([K-144+400,9]);break;case 279>=K:J.push([K-256+0,7]);break;case 287>=K:J.push([K-280+192,8]);break;default:n("invalid literal: "+K)}
var ca=function(){function e(a){switch(!0){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:n("invalid length: "+a)}}var b=[],d,c;for(d=3;258>=d;d++)c=e(d),b[d]=c[2]<<24|c[1]<<
16|c[0];return b}();x&&new Uint32Array(ca);function L(e,b){this.i=[];this.j=32768;this.d=this.f=this.c=this.n=0;this.input=x?new Uint8Array(e):e;this.o=!1;this.k=M;this.w=!1;if(b||!(b={}))b.index&&(this.c=b.index),b.bufferSize&&(this.j=b.bufferSize),b.bufferType&&(this.k=b.bufferType),b.resize&&(this.w=b.resize);switch(this.k){case N:this.a=32768;this.b=new (x?Uint8Array:Array)(32768+this.j+258);break;case M:this.a=0;this.b=new (x?Uint8Array:Array)(this.j);this.e=this.D;this.q=this.A;this.l=this.C;break;default:n(Error("invalid inflate mode"))}}
var N=0,M=1;
L.prototype.g=function(){for(;!this.o;){var e=P(this,3);e&1&&(this.o=!0);e>>>=1;switch(e){case 0:var b=this.input,d=this.c,c=this.b,a=this.a,f=b.length,k=p,l=p,m=c.length,r=p;this.d=this.f=0;d+1>=f&&n(Error("invalid uncompressed block header: LEN"));k=b[d++]|b[d++]<<8;d+1>=f&&n(Error("invalid uncompressed block header: NLEN"));l=b[d++]|b[d++]<<8;k===~l&&n(Error("invalid uncompressed block header: length verify"));d+k>b.length&&n(Error("input buffer is broken"));switch(this.k){case N:for(;a+k>c.length;){r=
m-a;k-=r;if(x)c.set(b.subarray(d,d+r),a),a+=r,d+=r;else for(;r--;)c[a++]=b[d++];this.a=a;c=this.e();a=this.a}break;case M:for(;a+k>c.length;)c=this.e({t:2});break;default:n(Error("invalid inflate mode"))}if(x)c.set(b.subarray(d,d+k),a),a+=k,d+=k;else for(;k--;)c[a++]=b[d++];this.c=d;this.a=a;this.b=c;break;case 1:this.l(da,ea);break;case 2:for(var q=P(this,5)+257,g=P(this,5)+1,h=P(this,4)+4,v=new (x?Uint8Array:Array)(Q.length),s=p,F=p,H=p,w=p,z=p,O=p,I=p,u=p,Z=p,u=0;u<h;++u)v[Q[u]]=P(this,3);if(!x){u=
h;for(h=v.length;u<h;++u)v[Q[u]]=0}s=G(v);w=new (x?Uint8Array:Array)(q+g);u=0;for(Z=q+g;u<Z;)switch(z=R(this,s),z){case 16:for(I=3+P(this,2);I--;)w[u++]=O;break;case 17:for(I=3+P(this,3);I--;)w[u++]=0;O=0;break;case 18:for(I=11+P(this,7);I--;)w[u++]=0;O=0;break;default:O=w[u++]=z}F=x?G(w.subarray(0,q)):G(w.slice(0,q));H=x?G(w.subarray(q)):G(w.slice(q));this.l(F,H);break;default:n(Error("unknown BTYPE: "+e))}}return this.q()};
var S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Q=x?new Uint16Array(S):S,fa=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],ga=x?new Uint16Array(fa):fa,ha=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],T=x?new Uint8Array(ha):ha,ia=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ja=x?new Uint16Array(ia):ia,ka=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,
11,12,12,13,13],U=x?new Uint8Array(ka):ka,V=new (x?Uint8Array:Array)(288),W,la;W=0;for(la=V.length;W<la;++W)V[W]=143>=W?8:255>=W?9:279>=W?7:8;var da=G(V),X=new (x?Uint8Array:Array)(30),Y,ma;Y=0;for(ma=X.length;Y<ma;++Y)X[Y]=5;var ea=G(X);function P(e,b){for(var d=e.f,c=e.d,a=e.input,f=e.c,k=a.length,l;c<b;)f>=k&&n(Error("input buffer is broken")),d|=a[f++]<<c,c+=8;l=d&(1<<b)-1;e.f=d>>>b;e.d=c-b;e.c=f;return l}
function R(e,b){for(var d=e.f,c=e.d,a=e.input,f=e.c,k=a.length,l=b[0],m=b[1],r,q;c<m&&!(f>=k);)d|=a[f++]<<c,c+=8;r=l[d&(1<<m)-1];q=r>>>16;q>c&&n(Error("invalid code length: "+q));e.f=d>>q;e.d=c-q;e.c=f;return r&65535}
L.prototype.l=function(e,b){var d=this.b,c=this.a;this.r=e;for(var a=d.length-258,f,k,l,m;256!==(f=R(this,e));)if(256>f)c>=a&&(this.a=c,d=this.e(),c=this.a),d[c++]=f;else{k=f-257;m=ga[k];0<T[k]&&(m+=P(this,T[k]));f=R(this,b);l=ja[f];0<U[f]&&(l+=P(this,U[f]));c>=a&&(this.a=c,d=this.e(),c=this.a);for(;m--;)d[c]=d[c++-l]}for(;8<=this.d;)this.d-=8,this.c--;this.a=c};
L.prototype.C=function(e,b){var d=this.b,c=this.a;this.r=e;for(var a=d.length,f,k,l,m;256!==(f=R(this,e));)if(256>f)c>=a&&(d=this.e(),a=d.length),d[c++]=f;else{k=f-257;m=ga[k];0<T[k]&&(m+=P(this,T[k]));f=R(this,b);l=ja[f];0<U[f]&&(l+=P(this,U[f]));c+m>a&&(d=this.e(),a=d.length);for(;m--;)d[c]=d[c++-l]}for(;8<=this.d;)this.d-=8,this.c--;this.a=c};
L.prototype.e=function(){var e=new (x?Uint8Array:Array)(this.a-32768),b=this.a-32768,d,c,a=this.b;if(x)e.set(a.subarray(32768,e.length));else{d=0;for(c=e.length;d<c;++d)e[d]=a[d+32768]}this.i.push(e);this.n+=e.length;if(x)a.set(a.subarray(b,b+32768));else for(d=0;32768>d;++d)a[d]=a[b+d];this.a=32768;return a};
L.prototype.D=function(e){var b,d=this.input.length/this.c+1|0,c,a,f,k=this.input,l=this.b;e&&("number"===typeof e.t&&(d=e.t),"number"===typeof e.z&&(d+=e.z));2>d?(c=(k.length-this.c)/this.r[2],f=258*(c/2)|0,a=f<l.length?l.length+f:l.length<<1):a=l.length*d;x?(b=new Uint8Array(a),b.set(l)):b=l;return this.b=b};
L.prototype.q=function(){var e=0,b=this.b,d=this.i,c,a=new (x?Uint8Array:Array)(this.n+(this.a-32768)),f,k,l,m;if(0===d.length)return x?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);f=0;for(k=d.length;f<k;++f){c=d[f];l=0;for(m=c.length;l<m;++l)a[e++]=c[l]}f=32768;for(k=this.a;f<k;++f)a[e++]=b[f];this.i=[];return this.buffer=a};
L.prototype.A=function(){var e,b=this.a;x?this.w?(e=new Uint8Array(b),e.set(this.b.subarray(0,b))):e=this.b.subarray(0,b):(this.b.length>b&&(this.b.length=b),e=this.b);return this.buffer=e};function $(e){this.input=e;this.c=0;this.m=[];this.s=!1}$.prototype.F=function(){this.s||this.g();return this.m.slice()};
$.prototype.g=function(){for(var e=this.input.length;this.c<e;){var b=new E,d=p,c=p,a=p,f=p,k=p,l=p,m=p,r=p,q=p,g=this.input,h=this.c;b.u=g[h++];b.v=g[h++];(31!==b.u||139!==b.v)&&n(Error("invalid file signature:"+b.u+","+b.v));b.p=g[h++];switch(b.p){case 8:break;default:n(Error("unknown compression method: "+b.p))}b.h=g[h++];r=g[h++]|g[h++]<<8|g[h++]<<16|g[h++]<<24;b.H=new Date(1E3*r);b.N=g[h++];b.M=g[h++];0<(b.h&4)&&(b.I=g[h++]|g[h++]<<8,h+=b.I);if(0<(b.h&8)){m=[];for(l=0;0<(k=g[h++]);)m[l++]=String.fromCharCode(k);
b.name=m.join("")}if(0<(b.h&16)){m=[];for(l=0;0<(k=g[h++]);)m[l++]=String.fromCharCode(k);b.J=m.join("")}0<(b.h&2)&&(b.B=B(g,0,h)&65535,b.B!==(g[h++]|g[h++]<<8)&&n(Error("invalid header crc16")));d=g[g.length-4]|g[g.length-3]<<8|g[g.length-2]<<16|g[g.length-1]<<24;g.length-h-4-4<512*d&&(f=d);c=new L(g,{index:h,bufferSize:f});b.data=a=c.g();h=c.c;b.K=q=(g[h++]|g[h++]<<8|g[h++]<<16|g[h++]<<24)>>>0;B(a,p,p)!==q&&n(Error("invalid CRC-32 checksum: 0x"+B(a,p,p).toString(16)+" / 0x"+q.toString(16)));b.L=
d=(g[h++]|g[h++]<<8|g[h++]<<16|g[h++]<<24)>>>0;(a.length&4294967295)!==d&&n(Error("invalid input size: "+(a.length&4294967295)+" / "+d));this.m.push(b);this.c=h}this.s=!0;var v=this.m,s,F,H=0,w=0,z;s=0;for(F=v.length;s<F;++s)w+=v[s].data.length;if(x){z=new Uint8Array(w);for(s=0;s<F;++s)z.set(v[s].data,H),H+=v[s].data.length}else{z=[];for(s=0;s<F;++s)z[s]=v[s].data;z=Array.prototype.concat.apply([],z)}return z};t("Zlib.Gunzip",$);t("Zlib.Gunzip.prototype.decompress",$.prototype.g);t("Zlib.Gunzip.prototype.getMembers",$.prototype.F);t("Zlib.GunzipMember",E);t("Zlib.GunzipMember.prototype.getName",E.prototype.getName);t("Zlib.GunzipMember.prototype.getData",E.prototype.getData);t("Zlib.GunzipMember.prototype.getMtime",E.prototype.G);}).call(this);

},{}],6:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var ViterbiBuilder = require("./viterbi/ViterbiBuilder");
var ViterbiSearcher = require("./viterbi/ViterbiSearcher");
var IpadicFormatter = require("./util/IpadicFormatter");

var PUNCTUATION = /、|。/;

/**
 * Tokenizer
 * @param {DynamicDictionaries} dic Dictionaries used by this tokenizer
 * @constructor
 */
function Tokenizer(dic) {
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
    this.viterbi_builder = new ViterbiBuilder(dic);
    this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
    this.formatter = new IpadicFormatter();  // TODO Other dictionaries
}

/**
 * Split into sentence by punctuation
 * @param {string} input Input text
 * @returns {Array.<string>} Sentences end with punctuation
 */
Tokenizer.splitByPunctuation = function (input) {
    var sentences = [];
    var tail = input;
    while (true) {
        if (tail === "") {
            break;
        }
        var index = tail.search(PUNCTUATION);
        if (index < 0) {
            sentences.push(tail);
            break;
        }
        sentences.push(tail.substring(0, index + 1));
        tail = tail.substring(index + 1);
    }
    return sentences;
};

/**
 * Tokenize text
 * @param {string} text Input text to analyze
 * @returns {Array} Tokens
 */
Tokenizer.prototype.tokenize = function (text) {
    var sentences = Tokenizer.splitByPunctuation(text);
    var tokens = [];
    for (var i = 0; i < sentences.length; i++) {
        var sentence = sentences[i];
        this.tokenizeForSentence(sentence, tokens);
    }
    return tokens;
};

Tokenizer.prototype.tokenizeForSentence = function (sentence, tokens) {
    if (tokens == null) {
        tokens = [];
    }
    var lattice = this.getLattice(sentence);
    var best_path = this.viterbi_searcher.search(lattice);
    var last_pos = 0;
    if (tokens.length > 0) {
        last_pos = tokens[tokens.length - 1].word_position;
    }

    for (var j = 0; j < best_path.length; j++) {
        var node = best_path[j];

        var token, features, features_line;
        if (node.type === "KNOWN") {
            features_line = this.token_info_dictionary.getFeatures(node.name);
            if (features_line == null) {
                features = [];
            } else {
                features = features_line.split(",");
            }
            token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
        } else if (node.type === "UNKNOWN") {
            // Unknown word
            features_line = this.unknown_dictionary.getFeatures(node.name);
            if (features_line == null) {
                features = [];
            } else {
                features = features_line.split(",");
            }
            token = this.formatter.formatUnknownEntry(node.name, last_pos + node.start_pos, node.type, features, node.surface_form);
        } else {
            // TODO User dictionary
            token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, []);
        }

        tokens.push(token);
    }

    return tokens;
};

/**
 * Build word lattice
 * @param {string} text Input text to analyze
 * @returns {ViterbiLattice} Word lattice
 */
Tokenizer.prototype.getLattice = function (text) {
    return this.viterbi_builder.build(text);
};

module.exports = Tokenizer;

},{"./util/IpadicFormatter":22,"./viterbi/ViterbiBuilder":24,"./viterbi/ViterbiSearcher":27}],7:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var Tokenizer = require("./Tokenizer");
var DictionaryLoader = require("./loader/NodeDictionaryLoader");

/**
 * TokenizerBuilder create Tokenizer instance.
 * @param {Object} option JSON object which have key-value pairs settings
 * @param {string} option.dicPath Dictionary directory path (or URL using in browser)
 * @constructor
 */
function TokenizerBuilder(option) {
    if (option.dicPath == null) {
        this.dic_path = "dict/";
    } else {
        this.dic_path = option.dicPath;
    }
}

/**
 * Build Tokenizer instance by asynchronous manner
 * @param {TokenizerBuilder~onLoad} callback Callback function
 */
TokenizerBuilder.prototype.build = function (callback) {
    var loader = new DictionaryLoader(this.dic_path);
    loader.load(function (err, dic) {
        callback(err, new Tokenizer(dic));
    });
};

/**
 * Callback used by build
 * @callback TokenizerBuilder~onLoad
 * @param {Object} err Error object
 * @param {Tokenizer} tokenizer Prepared Tokenizer
 */

module.exports = TokenizerBuilder;

},{"./Tokenizer":6,"./loader/NodeDictionaryLoader":19}],8:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * CharacterClass
 * @param {number} class_id
 * @param {string} class_name
 * @param {boolean} is_always_invoke
 * @param {boolean} is_grouping
 * @param {number} max_length
 * @constructor
 */
function CharacterClass(class_id, class_name, is_always_invoke, is_grouping, max_length) {
    this.class_id = class_id;
    this.class_name = class_name;
    this.is_always_invoke = is_always_invoke;
    this.is_grouping = is_grouping;
    this.max_length = max_length;
}

module.exports = CharacterClass;

},{}],9:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var InvokeDefinitionMap = require("./InvokeDefinitionMap");
var CharacterClass = require("./CharacterClass");
var SurrogateAwareString = require("../util/SurrogateAwareString");

var DEFAULT_CATEGORY = "DEFAULT";

/**
 * CharacterDefinition represents char.def file and
 * defines behavior of unknown word processing
 * @constructor
 */
function CharacterDefinition() {
    this.character_category_map = new Uint8Array(65536);  // for all UCS2 code points
    this.compatible_category_map = new Uint32Array(65536);  // for all UCS2 code points
    this.invoke_definition_map = null;
}

/**
 * Load CharacterDefinition
 * @param {Uint8Array} cat_map_buffer
 * @param {Uint32Array} compat_cat_map_buffer
 * @param {InvokeDefinitionMap} invoke_def_buffer
 * @returns {CharacterDefinition}
 */
CharacterDefinition.load = function (cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    var char_def = new CharacterDefinition();
    char_def.character_category_map = cat_map_buffer;
    char_def.compatible_category_map = compat_cat_map_buffer;
    char_def.invoke_definition_map = InvokeDefinitionMap.load(invoke_def_buffer);
    return char_def;
};

CharacterDefinition.parseCharCategory = function (class_id, parsed_category_def) {
    var category = parsed_category_def[1];
    var invoke = parseInt(parsed_category_def[2]);
    var grouping = parseInt(parsed_category_def[3]);
    var max_length = parseInt(parsed_category_def[4]);
    if (!isFinite(invoke) || (invoke !== 0 && invoke !== 1)) {
        console.log("char.def parse error. INVOKE is 0 or 1 in:" + invoke);
        return null;
    }
    if (!isFinite(grouping) || (grouping !== 0 && grouping !== 1)) {
        console.log("char.def parse error. GROUP is 0 or 1 in:" + grouping);
        return null;
    }
    if (!isFinite(max_length) || max_length < 0) {
        console.log("char.def parse error. LENGTH is 1 to n:" + max_length);
        return null;
    }
    var is_invoke = (invoke === 1);
    var is_grouping = (grouping === 1);

    return new CharacterClass(class_id, category, is_invoke, is_grouping, max_length);
};

CharacterDefinition.parseCategoryMapping = function (parsed_category_mapping) {
    var start = parseInt(parsed_category_mapping[1]);
    var default_category = parsed_category_mapping[2];
    var compatible_category = (3 < parsed_category_mapping.length) ? parsed_category_mapping.slice(3) : [];
    if (!isFinite(start) || start < 0 || start > 0xFFFF) {
        console.log("char.def parse error. CODE is invalid:" + start);
    }
    return { start: start, default: default_category, compatible: compatible_category};
};

CharacterDefinition.parseRangeCategoryMapping = function (parsed_category_mapping) {
    var start = parseInt(parsed_category_mapping[1]);
    var end = parseInt(parsed_category_mapping[2]);
    var default_category = parsed_category_mapping[3];
    var compatible_category = (4 < parsed_category_mapping.length) ? parsed_category_mapping.slice(4) : [];
    if (!isFinite(start) || start < 0 || start > 0xFFFF) {
        console.log("char.def parse error. CODE is invalid:" + start);
    }
    if (!isFinite(end) || end < 0 || end > 0xFFFF) {
        console.log("char.def parse error. CODE is invalid:" + end);
    }
    return { start: start, end: end, default: default_category, compatible: compatible_category};
};

/**
 * Initializing method
 * @param {Array} category_mapping Array of category mapping
 */
CharacterDefinition.prototype.initCategoryMappings = function (category_mapping) {
    // Initialize map by DEFAULT class
    var code_point;
    if (category_mapping != null) {
        for (var i = 0; i < category_mapping.length; i++) {
            var mapping = category_mapping[i];
            var end = mapping.end || mapping.start;
            for (code_point = mapping.start; code_point <= end; code_point++) {

                // Default Category class ID
                this.character_category_map[code_point] = this.invoke_definition_map.lookup(mapping.default);

                for (var j = 0; j < mapping.compatible.length; j++) {
                    var bitset = this.compatible_category_map[code_point];
                    var compatible_category = mapping.compatible[j];
                    if (compatible_category == null) {
                        continue;
                    }
                    var class_id = this.invoke_definition_map.lookup(compatible_category);  // Default Category
                    if (class_id == null) {
                        continue;
                    }
                    var class_id_bit = 1 << class_id;
                    bitset = bitset | class_id_bit;  // Set a bit of class ID 例えば、class_idが3のとき、3ビット目に1を立てる
                    this.compatible_category_map[code_point] = bitset;
                }
            }
        }
    }
    var default_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    if (default_id == null) {
        return;
    }
    for (code_point = 0; code_point < this.character_category_map.length; code_point++) {
        // 他に何のクラスも定義されていなかったときだけ DEFAULT
        if (this.character_category_map[code_point] === 0) {
            // DEFAULT class ID に対応するビットだけ1を立てる
            this.character_category_map[code_point] = 1 << default_id;
        }
    }
};

/**
 * Lookup compatible categories for a character (not included 1st category)
 * @param {string} ch UCS2 character (just 1st character is effective)
 * @returns {Array.<CharacterClass>} character classes
 */
CharacterDefinition.prototype.lookupCompatibleCategory = function (ch) {
    var classes = [];

    /*
     if (SurrogateAwareString.isSurrogatePair(ch)) {
     // Surrogate pair character codes can not be defined by char.def
     return classes;
     }*/
    var code = ch.charCodeAt(0);
    var integer;
    if (code < this.compatible_category_map.length) {
        integer = this.compatible_category_map[code];  // Bitset
    }

    if (integer == null || integer === 0) {
        return classes;
    }

    for (var bit = 0; bit < 32; bit++) {  // Treat "bit" as a class ID
        if (((integer << (31 - bit)) >>> 31) === 1) {
            var character_class = this.invoke_definition_map.getCharacterClass(bit);
            if (character_class == null) {
                continue;
            }
            classes.push(character_class);
        }
    }
    return classes;
};


/**
 * Lookup category for a character
 * @param {string} ch UCS2 character (just 1st character is effective)
 * @returns {CharacterClass} character class
 */
CharacterDefinition.prototype.lookup = function (ch) {

    var class_id;

    var code = ch.charCodeAt(0);
    if (SurrogateAwareString.isSurrogatePair(ch)) {
        // Surrogate pair character codes can not be defined by char.def, so set DEFAULT category
        class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    } else if (code < this.character_category_map.length) {
        class_id = this.character_category_map[code];  // Read as integer value
    }

    if (class_id == null) {
        class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    }

    return this.invoke_definition_map.getCharacterClass(class_id);
};

module.exports = CharacterDefinition;

},{"../util/SurrogateAwareString":23,"./CharacterClass":8,"./InvokeDefinitionMap":12}],10:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * Connection costs matrix from cc.dat file.
 * 2 dimension matrix [forward_id][backward_id] -> cost
 * @constructor
 * @param {number} forward_dimension
 * @param {number} backward_dimension
 */
function ConnectionCosts(forward_dimension, backward_dimension) {
    this.forward_dimension = forward_dimension;
    this.backward_dimension = backward_dimension;

    // leading 2 integers for forward_dimension, backward_dimension, respectively
    this.buffer = new Int16Array(forward_dimension * backward_dimension + 2);
    this.buffer[0] = forward_dimension;
    this.buffer[1] = backward_dimension;
}

ConnectionCosts.prototype.put = function (forward_id, backward_id, cost) {
    var index = forward_id * this.backward_dimension + backward_id + 2;
    if (this.buffer.length < index + 1) {
        throw "ConnectionCosts buffer overflow";
    }
    this.buffer[index] = cost;
};

ConnectionCosts.prototype.get = function (forward_id, backward_id) {
    var index = forward_id * this.backward_dimension + backward_id + 2;
    if (this.buffer.length < index + 1) {
        throw "ConnectionCosts buffer overflow";
    }
    return this.buffer[index];
};

ConnectionCosts.prototype.loadConnectionCosts = function (connection_costs_buffer) {
    this.forward_dimension = connection_costs_buffer[0];
    this.backward_dimension = connection_costs_buffer[1];
    this.buffer = connection_costs_buffer;
};

module.exports = ConnectionCosts;

},{}],11:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var doublearray = require("doublearray");
var TokenInfoDictionary = require("./TokenInfoDictionary");
var ConnectionCosts = require("./ConnectionCosts");
var UnknownDictionary = require("./UnknownDictionary");

/**
 * Dictionaries container for Tokenizer
 * @param {DoubleArray} trie
 * @param {TokenInfoDictionary} token_info_dictionary
 * @param {ConnectionCosts} connection_costs
 * @param {UnknownDictionary} unknown_dictionary
 * @constructor
 */
function DynamicDictionaries(trie, token_info_dictionary, connection_costs, unknown_dictionary) {
    if (trie != null) {
        this.trie = trie;
    } else {
        this.trie = doublearray.builder(0).build([
            {k: "", v: 1}
        ]);
    }
    if (token_info_dictionary != null) {
        this.token_info_dictionary = token_info_dictionary;
    } else {
        this.token_info_dictionary = new TokenInfoDictionary();
    }
    if (connection_costs != null) {
        this.connection_costs = connection_costs;
    } else {
        // backward_size * backward_size
        this.connection_costs = new ConnectionCosts(0, 0);
    }
    if (unknown_dictionary != null) {
        this.unknown_dictionary = unknown_dictionary;
    } else {
        this.unknown_dictionary = new UnknownDictionary();
    }
}

// from base.dat & check.dat
DynamicDictionaries.prototype.loadTrie = function (base_buffer, check_buffer) {
    this.trie = doublearray.load(base_buffer, check_buffer);
    return this;
};

DynamicDictionaries.prototype.loadTokenInfoDictionaries = function (token_info_buffer, pos_buffer, target_map_buffer) {
    this.token_info_dictionary.loadDictionary(token_info_buffer);
    this.token_info_dictionary.loadPosVector(pos_buffer);
    this.token_info_dictionary.loadTargetMap(target_map_buffer);
    return this;
};

DynamicDictionaries.prototype.loadConnectionCosts = function (cc_buffer) {
    this.connection_costs.loadConnectionCosts(cc_buffer);
    return this;
};

DynamicDictionaries.prototype.loadUnknownDictionaries = function (unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    this.unknown_dictionary.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
    return this;
};

module.exports = DynamicDictionaries;

},{"./ConnectionCosts":10,"./TokenInfoDictionary":13,"./UnknownDictionary":14,"doublearray":2}],12:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var ByteBuffer = require("../util/ByteBuffer");
var CharacterClass = require("./CharacterClass");

/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */
function InvokeDefinitionMap() {
    this.map = [];
    this.lookup_table = {};  // Just for building dictionary
}

/**
 * Load InvokeDefinitionMap from buffer
 * @param {Uint8Array} invoke_def_buffer
 * @returns {InvokeDefinitionMap}
 */
InvokeDefinitionMap.load = function (invoke_def_buffer) {
    var invoke_def = new InvokeDefinitionMap();
    var character_category_definition = [];

    var buffer = new ByteBuffer(invoke_def_buffer);
    while (buffer.position + 1 < buffer.size()) {
        var class_id = character_category_definition.length;
        var is_always_invoke = buffer.get();
        var is_grouping = buffer.get();
        var max_length = buffer.getInt();
        var class_name = buffer.getString();
        character_category_definition.push(new CharacterClass(class_id, class_name, is_always_invoke, is_grouping, max_length));
    }

    invoke_def.init(character_category_definition);

    return invoke_def;
};

/**
 * Initializing method
 * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
 */
InvokeDefinitionMap.prototype.init = function (character_category_definition) {
    if (character_category_definition == null) {
        return;
    }
    for (var i = 0; i < character_category_definition.length; i++) {
        var character_class = character_category_definition[i];
        this.map[i] = character_class;
        this.lookup_table[character_class.class_name] = i;
    }
};

/**
 * Get class information by class ID
 * @param {number} class_id
 * @returns {CharacterClass}
 */
InvokeDefinitionMap.prototype.getCharacterClass = function (class_id) {
    return this.map[class_id];
};

/**
 * For building character definition dictionary
 * @param {string} class_name character
 * @returns {number} class_id
 */
InvokeDefinitionMap.prototype.lookup = function (class_name) {
    var class_id = this.lookup_table[class_name];
    if (class_id == null) {
        return null;
    }
    return class_id;
};

/**
 * Transform from map to binary buffer
 * @returns {Uint8Array}
 */
InvokeDefinitionMap.prototype.toBuffer = function () {
    var buffer = new ByteBuffer();
    for (var i = 0; i < this.map.length; i++) {
        var char_class = this.map[i];
        buffer.put(char_class.is_always_invoke);
        buffer.put(char_class.is_grouping);
        buffer.putInt(char_class.max_length);
        buffer.putString(char_class.class_name);
    }
    buffer.shrink();
    return buffer.buffer;
};

module.exports = InvokeDefinitionMap;

},{"../util/ByteBuffer":21,"./CharacterClass":8}],13:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var ByteBuffer = require("../util/ByteBuffer");

/**
 * TokenInfoDictionary
 * @constructor
 */
function TokenInfoDictionary() {
    this.dictionary = new ByteBuffer(10 * 1024 * 1024);
    this.target_map = {};  // trie_id (of surface form) -> token_info_id (of token)
    this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
}

// left_id right_id word_cost ...
// ^ this position is token_info_id
TokenInfoDictionary.prototype.buildDictionary = function (entries) {
    var dictionary_entries = {};  // using as hashmap, string -> string (word_id -> surface_form) to build dictionary

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];

        if (entry.length < 4) {
            continue;
        }

        var surface_form = entry[0];
        var left_id = entry[1];
        var right_id = entry[2];
        var word_cost = entry[3];
        var feature = entry.slice(4).join(",");  // TODO Optimize

        // Assertion
        if (!isFinite(left_id) || !isFinite(right_id) || !isFinite(word_cost)) {
            console.log(entry);
        }

        var token_info_id = this.put(left_id, right_id, word_cost, surface_form, feature);
        dictionary_entries[token_info_id] = surface_form;
    }

    // Remove last unused area
    this.dictionary.shrink();
    this.pos_buffer.shrink();

    return dictionary_entries;
};

TokenInfoDictionary.prototype.put = function (left_id, right_id, word_cost, surface_form, feature) {
    var token_info_id = this.dictionary.position;
    var pos_id = this.pos_buffer.position;

    this.dictionary.putShort(left_id);
    this.dictionary.putShort(right_id);
    this.dictionary.putShort(word_cost);
    this.dictionary.putInt(pos_id);
    this.pos_buffer.putString(surface_form + "," + feature);

    return token_info_id;
};

TokenInfoDictionary.prototype.addMapping = function (source, target) {
    var mapping = this.target_map[source];
    if (mapping == null) {
        mapping = [];
    }
    mapping.push(target);

    this.target_map[source] = mapping;
};

TokenInfoDictionary.prototype.targetMapToBuffer = function () {
    var buffer = new ByteBuffer();
    var map_keys_size = Object.keys(this.target_map).length;
    buffer.putInt(map_keys_size);
    for (var key in this.target_map) {
        var values = this.target_map[key];  // Array
        var map_values_size = values.length;
        buffer.putInt(parseInt(key));
        buffer.putInt(map_values_size);
        for (var i = 0; i < values.length; i++) {
            buffer.putInt(values[i]);
        }
    }
    return buffer.shrink();  // Shrink-ed Typed Array
};

// from tid.dat
TokenInfoDictionary.prototype.loadDictionary = function (array_buffer) {
    this.dictionary = new ByteBuffer(array_buffer);
    return this;
};

// from tid_pos.dat
TokenInfoDictionary.prototype.loadPosVector = function (array_buffer) {
    this.pos_buffer = new ByteBuffer(array_buffer);
    return this;
};

// from tid_map.dat
TokenInfoDictionary.prototype.loadTargetMap = function (array_buffer) {
    var buffer = new ByteBuffer(array_buffer);
    buffer.position = 0;
    this.target_map = {};
    buffer.readInt();  // map_keys_size
    while (true) {
        if (buffer.buffer.length < buffer.position + 1) {
            break;
        }
        var key = buffer.readInt();
        var map_values_size = buffer.readInt();
        for (var i = 0; i < map_values_size; i++) {
            var value = buffer.readInt();
            this.addMapping(key, value);
        }
    }
    return this;
};

/**
 * Look up features in the dictionary
 * @param {string} token_info_id_str Word ID to look up
 * @returns {string} Features string concatenated by ","
 */
TokenInfoDictionary.prototype.getFeatures = function (token_info_id_str) {
    var token_info_id = parseInt(token_info_id_str);
    if (isNaN(token_info_id)) {
        // TODO throw error
        return "";
    }
    var pos_id = this.dictionary.getInt(token_info_id + 6);
    return this.pos_buffer.getString(pos_id);
};

module.exports = TokenInfoDictionary;

},{"../util/ByteBuffer":21}],14:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var TokenInfoDictionary = require("./TokenInfoDictionary");
var CharacterDefinition = require("./CharacterDefinition");
var ByteBuffer = require("../util/ByteBuffer");

/**
 * UnknownDictionary
 * @constructor
 */
function UnknownDictionary() {
    this.dictionary = new ByteBuffer(10 * 1024 * 1024);
    this.target_map = {};  // class_id (of CharacterClass) -> token_info_id (of unknown class)
    this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
    this.character_definition = null;
}

// Inherit from TokenInfoDictionary as a super class
UnknownDictionary.prototype = Object.create(TokenInfoDictionary.prototype);

UnknownDictionary.prototype.characterDefinition = function (character_definition) {
    this.character_definition = character_definition;
    return this;
};

UnknownDictionary.prototype.lookup = function (ch) {
    return this.character_definition.lookup(ch);
};

UnknownDictionary.prototype.lookupCompatibleCategory = function (ch) {
    return this.character_definition.lookupCompatibleCategory(ch);
};

UnknownDictionary.prototype.loadUnknownDictionaries = function (unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    this.loadDictionary(unk_buffer);
    this.loadPosVector(unk_pos_buffer);
    this.loadTargetMap(unk_map_buffer);
    this.character_definition = CharacterDefinition.load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
};

module.exports = UnknownDictionary;

},{"../util/ByteBuffer":21,"./CharacterDefinition":9,"./TokenInfoDictionary":13}],15:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var CharacterDefinition = require("../CharacterDefinition");
var InvokeDefinitionMap = require("../InvokeDefinitionMap");

var CATEGORY_DEF_PATTERN = /^(\w+)\s+(\d)\s+(\d)\s+(\d)/;
var CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
var RANGE_CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;

/**
 * CharacterDefinitionBuilder
 * @constructor
 */
function CharacterDefinitionBuilder() {
    this.char_def = new CharacterDefinition();
    this.char_def.invoke_definition_map = new InvokeDefinitionMap();
    this.character_category_definition = [];
    this.category_mapping = [];
}

CharacterDefinitionBuilder.prototype.putLine = function (line) {
    var parsed_category_def = CATEGORY_DEF_PATTERN.exec(line);
    if (parsed_category_def != null) {
        var class_id = this.character_category_definition.length;
        var char_class = CharacterDefinition.parseCharCategory(class_id, parsed_category_def);
        if (char_class == null) {
            return;
        }
        this.character_category_definition.push(char_class);
        return;
    }
    var parsed_category_mapping = CATEGORY_MAPPING_PATTERN.exec(line);
    if (parsed_category_mapping != null) {
        var mapping = CharacterDefinition.parseCategoryMapping(parsed_category_mapping);
        this.category_mapping.push(mapping);
    }
    var parsed_range_category_mapping = RANGE_CATEGORY_MAPPING_PATTERN.exec(line);
    if (parsed_range_category_mapping != null) {
        var range_mapping = CharacterDefinition.parseRangeCategoryMapping(parsed_range_category_mapping);
        this.category_mapping.push(range_mapping);
    }
};

CharacterDefinitionBuilder.prototype.build = function () {
    // TODO If DEFAULT category does not exist, throw error
    this.char_def.invoke_definition_map.init(this.character_category_definition);
    this.char_def.initCategoryMappings(this.category_mapping);
    return this.char_def;
};

module.exports = CharacterDefinitionBuilder;

},{"../CharacterDefinition":9,"../InvokeDefinitionMap":12}],16:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var ConnectionCosts = require("../ConnectionCosts");

/**
 * Builder class for constructing ConnectionCosts object
 * @constructor
 */
function ConnectionCostsBuilder() {
    this.lines = 0;
    this.connection_cost = null;
}

ConnectionCostsBuilder.prototype.putLine = function (line) {
    if (this.lines === 0) {
        var dimensions = line.split(" ");
        var forward_dimension = dimensions[0];
        var backward_dimension = dimensions[1];

        if (forward_dimension < 0 || backward_dimension < 0) {
            throw "Parse error of matrix.def";
        }

        this.connection_cost = new ConnectionCosts(forward_dimension, backward_dimension);
        this.lines++;
        return this;
    }

    var costs = line.split(" ");

    if (costs.length !== 3) {
        return this;
    }

    var forward_id = parseInt(costs[0]);
    var backward_id = parseInt(costs[1]);
    var cost = parseInt(costs[2]);

    if (forward_id < 0 || backward_id < 0 || !isFinite(forward_id) || !isFinite(backward_id) ||
        this.connection_cost.forward_dimension <= forward_id || this.connection_cost.backward_dimension <= backward_id) {
        throw "Parse error of matrix.def";
    }

    this.connection_cost.put(forward_id, backward_id, cost);
    this.lines++;
    return this;
};

ConnectionCostsBuilder.prototype.build = function () {
    return this.connection_cost;
};

module.exports = ConnectionCostsBuilder;

},{"../ConnectionCosts":10}],17:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var doublearray = require("doublearray");
var DynamicDictionaries = require("../DynamicDictionaries");
var TokenInfoDictionary = require("../TokenInfoDictionary");
var ConnectionCostsBuilder = require("./ConnectionCostsBuilder");
var CharacterDefinitionBuilder = require("./CharacterDefinitionBuilder");
var UnknownDictionary = require("../UnknownDictionary");

/**
 * Build dictionaries (token info, connection costs)
 *
 * Generates from matrix.def
 * cc.dat: Connection costs
 *
 * Generates from *.csv
 * dat.dat: Double array
 * tid.dat: Token info dictionary
 * tid_map.dat: targetMap
 * tid_pos.dat: posList (part of speech)
 */
function DictionaryBuilder() {
    // Array of entries, each entry in Mecab form
    // (0: surface form, 1: left id, 2: right id, 3: word cost, 4: part of speech id, 5-: other features)
    this.tid_entries = [];
    this.unk_entries = [];
    this.cc_builder = new ConnectionCostsBuilder();
    this.cd_builder = new CharacterDefinitionBuilder();
}

DictionaryBuilder.prototype.addTokenInfoDictionary = function (line) {
    var new_entry = line.split(",");
    this.tid_entries.push(new_entry);
    return this;
};

/**
 * Put one line of "matrix.def" file for building ConnectionCosts object
 * @param {string} line is a line of "matrix.def"
 */
DictionaryBuilder.prototype.putCostMatrixLine = function (line) {
    this.cc_builder.putLine(line);
    return this;
};

DictionaryBuilder.prototype.putCharDefLine = function (line) {
    this.cd_builder.putLine(line);
    return this;
};

/**
 * Put one line of "unk.def" file for building UnknownDictionary object
 * @param {string} line is a line of "unk.def"
 */
DictionaryBuilder.prototype.putUnkDefLine = function (line) {
    this.unk_entries.push(line.split(","));
    return this;
};

DictionaryBuilder.prototype.build = function () {
    var dictionaries = this.buildTokenInfoDictionary();
    var unknown_dictionary = this.buildUnknownDictionary();

    return new DynamicDictionaries(dictionaries.trie, dictionaries.token_info_dictionary, this.cc_builder.build(), unknown_dictionary);
};

/**
 * Build TokenInfoDictionary
 *
 * @returns {{trie: *, token_info_dictionary: *}}
 */
DictionaryBuilder.prototype.buildTokenInfoDictionary = function () {

    var token_info_dictionary = new TokenInfoDictionary();

    // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
    var dictionary_entries = token_info_dictionary.buildDictionary(this.tid_entries);

    var trie = this.buildDoubleArray();

    for (var token_info_id in dictionary_entries) {
        var surface_form = dictionary_entries[token_info_id];
        var trie_id = trie.lookup(surface_form);

        // Assertion
        // if (trie_id < 0) {
        //     console.log("Not Found:" + surface_form);
        // }

        token_info_dictionary.addMapping(trie_id, token_info_id);
    }

    return {
        trie: trie,
        token_info_dictionary: token_info_dictionary
    };
};

DictionaryBuilder.prototype.buildUnknownDictionary = function () {

    var unk_dictionary = new UnknownDictionary();

    // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
    var dictionary_entries = unk_dictionary.buildDictionary(this.unk_entries);

    var char_def = this.cd_builder.build(); // Create CharacterDefinition

    unk_dictionary.characterDefinition(char_def);

    for (var token_info_id in dictionary_entries) {
        var class_name = dictionary_entries[token_info_id];
        var class_id = char_def.invoke_definition_map.lookup(class_name);

        // Assertion
        // if (trie_id < 0) {
        //     console.log("Not Found:" + surface_form);
        // }

        unk_dictionary.addMapping(class_id, token_info_id);
    }

    return unk_dictionary;
};

/**
 * Build double array trie
 *
 * @returns {DoubleArray} Double-Array trie
 */
DictionaryBuilder.prototype.buildDoubleArray = function () {
    var trie_id = 0;
    var words = this.tid_entries.map(function (entry) {
        var surface_form = entry[0];
        return { k: surface_form, v: trie_id++ };
    });

    var builder = doublearray.builder(1024 * 1024);
    return builder.build(words);
};

module.exports = DictionaryBuilder;

},{"../DynamicDictionaries":11,"../TokenInfoDictionary":13,"../UnknownDictionary":14,"./CharacterDefinitionBuilder":15,"./ConnectionCostsBuilder":16,"doublearray":2}],18:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var TokenizerBuilder = require("./TokenizerBuilder");
var DictionaryBuilder = require("./dict/builder/DictionaryBuilder");

// Public methods
var kuromoji = {
    builder: function (option) {
        return new TokenizerBuilder(option);
    },
    dictionaryBuilder: function () {
        return new DictionaryBuilder();
    }
};

module.exports = kuromoji;

},{"./TokenizerBuilder":7,"./dict/builder/DictionaryBuilder":17}],19:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var zlib = require("zlibjs/bin/gunzip.min.js");
var DictionaryLoader = require("./DictionaryLoader");

/**
 * BrowserDictionaryLoader inherits DictionaryLoader, using jQuery XHR for download
 * @param {string} dic_path Dictionary path
 * @constructor
 */
function BrowserDictionaryLoader(dic_path) {
    DictionaryLoader.apply(this, [dic_path]);
}

BrowserDictionaryLoader.prototype = Object.create(DictionaryLoader.prototype);

/**
 * Utility function to load gzipped dictionary
 * @param {string} url Dictionary URL
 * @param {BrowserDictionaryLoader~onLoad} callback Callback function
 */
BrowserDictionaryLoader.prototype.loadArrayBuffer = function (file, callback) {
  decompressData(dictionaries[file]).arrayBuffer().then(buffer=>callback(null,buffer),callback);
};

/**
 * Callback
 * @callback BrowserDictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {Uint8Array} buffer Loaded buffer
 */

module.exports = BrowserDictionaryLoader;

},{"./DictionaryLoader":20,"zlibjs/bin/gunzip.min.js":5}],20:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var path = require("path");
var async = require("async");
var DynamicDictionaries = require("../dict/DynamicDictionaries");

/**
 * DictionaryLoader base constructor
 * @param {string} dic_path Dictionary path
 * @constructor
 */
function DictionaryLoader(dic_path) {
    this.dic = new DynamicDictionaries();
    this.dic_path = dic_path;
}

DictionaryLoader.prototype.loadArrayBuffer = function (file, callback) {
    throw new Error("DictionaryLoader#loadArrayBuffer should be overwrite");
};

/**
 * Load dictionary files
 * @param {DictionaryLoader~onLoad} load_callback Callback function called after loaded
 */
DictionaryLoader.prototype.load = function (load_callback) {
    var dic = this.dic;
    var dic_path = this.dic_path;
    var loadArrayBuffer = this.loadArrayBuffer;

    async.parallel([
        // Trie
        function (callback) {
            async.map([ "base.dat.gz", "check.dat.gz" ], function (filename, _callback) {
                loadArrayBuffer(path.join(dic_path, filename), function (err, buffer) {
                    if(err) {
                        return _callback(err);
                    }
                    _callback(null, buffer);
                });
            }, function (err, buffers) {
                if(err) {
                    return callback(err);
                }
                var base_buffer = new Int32Array(buffers[0]);
                var check_buffer = new Int32Array(buffers[1]);

                dic.loadTrie(base_buffer, check_buffer);
                callback(null);
            });
        },
        // Token info dictionaries
        function (callback) {
            async.map([ "tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz" ], function (filename, _callback) {
                loadArrayBuffer(path.join(dic_path, filename), function (err, buffer) {
                    if(err) {
                        return _callback(err);
                    }
                    _callback(null, buffer);
                });
            }, function (err, buffers) {
                if(err) {
                    return callback(err);
                }
                var token_info_buffer = new Uint8Array(buffers[0]);
                var pos_buffer = new Uint8Array(buffers[1]);
                var target_map_buffer = new Uint8Array(buffers[2]);

                dic.loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer);
                callback(null);
            });
        },
        // Connection cost matrix
        function (callback) {
            loadArrayBuffer(path.join(dic_path, "cc.dat.gz"), function (err, buffer) {
                if(err) {
                    return callback(err);
                }
                var cc_buffer = new Int16Array(buffer);
                dic.loadConnectionCosts(cc_buffer);
                callback(null);
            });
        },
        // Unknown dictionaries
        function (callback) {
            async.map([ "unk.dat.gz", "unk_pos.dat.gz", "unk_map.dat.gz", "unk_char.dat.gz", "unk_compat.dat.gz", "unk_invoke.dat.gz" ], function (filename, _callback) {
                loadArrayBuffer(path.join(dic_path, filename), function (err, buffer) {
                    if(err) {
                        return _callback(err);
                    }
                    _callback(null, buffer);
                });
            }, function (err, buffers) {
                if(err) {
                    return callback(err);
                }
                var unk_buffer = new Uint8Array(buffers[0]);
                var unk_pos_buffer = new Uint8Array(buffers[1]);
                var unk_map_buffer = new Uint8Array(buffers[2]);
                var cat_map_buffer = new Uint8Array(buffers[3]);
                var compat_cat_map_buffer = new Uint32Array(buffers[4]);
                var invoke_def_buffer = new Uint8Array(buffers[5]);

                dic.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
                // dic.loadUnknownDictionaries(char_buffer, unk_buffer);
                callback(null);
            });
        }
    ], function (err) {
        load_callback(err, dic);
    });
};

/**
 * Callback
 * @callback DictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {DynamicDictionaries} dic Loaded dictionary
 */

module.exports = DictionaryLoader;

},{"../dict/DynamicDictionaries":11,"async":1,"path":3}],21:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * Convert String (UTF-16) to UTF-8 ArrayBuffer
 *
 * @param {String} str UTF-16 string to convert
 * @return {Uint8Array} Byte sequence encoded by UTF-8
 */
var stringToUtf8Bytes = function (str) {

    // Max size of 1 character is 4 bytes
    var bytes = new Uint8Array(str.length * 4);

    var i = 0, j = 0;

    while (i < str.length) {
        var unicode_code;

        var utf16_code = str.charCodeAt(i++);
        if (utf16_code >= 0xD800 && utf16_code <= 0xDBFF) {
            // surrogate pair
            var upper = utf16_code;           // high surrogate
            var lower = str.charCodeAt(i++);  // low surrogate

            if (lower >= 0xDC00 && lower <= 0xDFFF) {
                unicode_code =
                    (upper - 0xD800) * (1 << 10) + (1 << 16) +
                    (lower - 0xDC00);
            } else {
                // malformed surrogate pair
                return null;
            }
        } else {
            // not surrogate code
            unicode_code = utf16_code;
        }

        if (unicode_code < 0x80) {
            // 1-byte
            bytes[j++] = unicode_code;

        } else if (unicode_code < (1 << 11)) {
            // 2-byte
            bytes[j++] = (unicode_code >>> 6) | 0xC0;
            bytes[j++] = (unicode_code & 0x3F) | 0x80;

        } else if (unicode_code < (1 << 16)) {
            // 3-byte
            bytes[j++] = (unicode_code >>> 12) | 0xE0;
            bytes[j++] = ((unicode_code >> 6) & 0x3f) | 0x80;
            bytes[j++] = (unicode_code & 0x3F) | 0x80;

        } else if (unicode_code < (1 << 21)) {
            // 4-byte
            bytes[j++] = (unicode_code >>> 18) | 0xF0;
            bytes[j++] = ((unicode_code >> 12) & 0x3F) | 0x80;
            bytes[j++] = ((unicode_code >> 6) & 0x3F) | 0x80;
            bytes[j++] = (unicode_code & 0x3F) | 0x80;

        } else {
            // malformed UCS4 code
        }
    }

    return bytes.subarray(0, j);
};

/**
 * Convert UTF-8 ArrayBuffer to String (UTF-16)
 *
 * @param {Array} bytes UTF-8 byte sequence to convert
 * @return {String} String encoded by UTF-16
 */
var utf8BytesToString = function (bytes) {

    var str = "";
    var code, b1, b2, b3, b4, upper, lower;
    var i = 0;

    while (i < bytes.length) {

        b1 = bytes[i++];

        if (b1 < 0x80) {
            // 1 byte
            code = b1;
        } else if ((b1 >> 5) === 0x06) {
            // 2 bytes
            b2 = bytes[i++];
            code = ((b1 & 0x1f) << 6) | (b2 & 0x3f);
        } else if ((b1 >> 4) === 0x0e) {
            // 3 bytes
            b2 = bytes[i++];
            b3 = bytes[i++];
            code = ((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
        } else {
            // 4 bytes
            b2 = bytes[i++];
            b3 = bytes[i++];
            b4 = bytes[i++];
            code = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
        }

        if (code < 0x10000) {
            str += String.fromCharCode(code);
        } else {
            // surrogate pair
            code -= 0x10000;
            upper = (0xD800 | (code >> 10));
            lower = (0xDC00 | (code & 0x3FF));
            str += String.fromCharCode(upper, lower);
        }
    }

    return str;
};

/**
 * Utilities to manipulate byte sequence
 * @param {(number|Uint8Array)} arg Initial size of this buffer (number), or buffer to set (Uint8Array)
 * @constructor
 */
function ByteBuffer(arg) {
    var initial_size;
    if (arg == null) {
        initial_size = 1024 * 1024;
    } else if (typeof arg === "number") {
        initial_size = arg;
    } else if (arg instanceof Uint8Array) {
        this.buffer = arg;
        this.position = 0;  // Overwrite
        return;
    } else {
        // typeof arg -> String
        throw typeof arg + " is invalid parameter type for ByteBuffer constructor";
    }
    // arg is null or number
    this.buffer = new Uint8Array(initial_size);
    this.position = 0;
}

ByteBuffer.prototype.size = function () {
    return this.buffer.length;
};

ByteBuffer.prototype.reallocate = function () {
    var new_array = new Uint8Array(this.buffer.length * 2);
    new_array.set(this.buffer);
    this.buffer = new_array;
};

ByteBuffer.prototype.shrink = function () {
    this.buffer = this.buffer.subarray(0, this.position);
    return this.buffer;
};

ByteBuffer.prototype.put = function (b) {
    if (this.buffer.length < this.position + 1) {
        this.reallocate();
    }
    this.buffer[this.position++] = b;
};

ByteBuffer.prototype.get = function (index) {
    if (index == null) {
        index = this.position;
        this.position += 1;
    }
    if (this.buffer.length < index + 1) {
        return 0;
    }
    return this.buffer[index];
};

// Write short to buffer by little endian
ByteBuffer.prototype.putShort = function (num) {
    if (0xFFFF < num) {
        throw num + " is over short value";
    }
    var lower = (0x00FF & num);
    var upper = (0xFF00 & num) >> 8;
    this.put(lower);
    this.put(upper);
};

// Read short from buffer by little endian
ByteBuffer.prototype.getShort = function (index) {
    if (index == null) {
        index = this.position;
        this.position += 2;
    }
    if (this.buffer.length < index + 2) {
        return 0;
    }
    var lower = this.buffer[index];
    var upper = this.buffer[index + 1];
    var value = (upper << 8) + lower;
    if (value & 0x8000) {
	value = -((value - 1) ^ 0xFFFF);
    }
    return value;
};

// Write integer to buffer by little endian
ByteBuffer.prototype.putInt = function (num) {
    if (0xFFFFFFFF < num) {
        throw num + " is over integer value";
    }
    var b0 = (0x000000FF & num);
    var b1 = (0x0000FF00 & num) >> 8;
    var b2 = (0x00FF0000 & num) >> 16;
    var b3 = (0xFF000000 & num) >> 24;
    this.put(b0);
    this.put(b1);
    this.put(b2);
    this.put(b3);
};

// Read integer from buffer by little endian
ByteBuffer.prototype.getInt = function (index) {
    if (index == null) {
        index = this.position;
        this.position += 4;
    }
    if (this.buffer.length < index + 4) {
        return 0;
    }
    var b0 = this.buffer[index];
    var b1 = this.buffer[index + 1];
    var b2 = this.buffer[index + 2];
    var b3 = this.buffer[index + 3];

    return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
};

ByteBuffer.prototype.readInt = function () {
    var pos = this.position;
    this.position += 4;
    return this.getInt(pos);
};

ByteBuffer.prototype.putString = function (str) {
    var bytes = stringToUtf8Bytes(str);
    for (var i = 0; i < bytes.length; i++) {
        this.put(bytes[i]);
    }
    // put null character as terminal character
    this.put(0);
};

ByteBuffer.prototype.getString = function (index) {
    var buf = [],
        ch;
    if (index == null) {
        index = this.position;
    }
    while (true) {
        if (this.buffer.length < index + 1) {
            break;
        }
        ch = this.get(index++);
        if (ch === 0) {
            break;
        } else {
            buf.push(ch);
        }
    }
    this.position = index;
    return utf8BytesToString(buf);
};

module.exports = ByteBuffer;

},{}],22:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * Mappings between IPADIC dictionary features and tokenized results
 * @constructor
 */
function IpadicFormatter() {
}

IpadicFormatter.prototype.formatEntry = function (word_id, position, type, features) {
    var token = {};
    token.word_id = word_id;
    token.word_type = type;
    token.word_position = position;

    token.surface_form = features[0];
    token.pos = features[1];
    token.pos_detail_1 = features[2];
    token.pos_detail_2 = features[3];
    token.pos_detail_3 = features[4];
    token.conjugated_type = features[5];
    token.conjugated_form = features[6];
    token.basic_form = features[7];
    token.reading = features[8];
    token.pronunciation = features[9];

    return token;
};

IpadicFormatter.prototype.formatUnknownEntry = function (word_id, position, type, features, surface_form) {
    var token = {};
    token.word_id = word_id;
    token.word_type = type;
    token.word_position = position;

    token.surface_form = surface_form;
    token.pos = features[1];
    token.pos_detail_1 = features[2];
    token.pos_detail_2 = features[3];
    token.pos_detail_3 = features[4];
    token.conjugated_type = features[5];
    token.conjugated_form = features[6];
    token.basic_form = features[7];
    // token.reading = features[8];
    // token.pronunciation = features[9];

    return token;
};

module.exports = IpadicFormatter;

},{}],23:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * String wrapper for UTF-16 surrogate pair (4 bytes)
 * @param {string} str String to wrap
 * @constructor
 */
function SurrogateAwareString(str) {
    this.str = str;
    this.index_mapping = [];

    for (var pos = 0; pos < str.length; pos++) {
        var ch = str.charAt(pos);
        this.index_mapping.push(pos);
        if (SurrogateAwareString.isSurrogatePair(ch)) {
            pos++;
        }
    }
    // Surrogate aware length
    this.length = this.index_mapping.length;
}

SurrogateAwareString.prototype.slice = function (index) {
    if (this.index_mapping.length <= index) {
        return "";
    }
    var surrogate_aware_index = this.index_mapping[index];
    return this.str.slice(surrogate_aware_index);
};

SurrogateAwareString.prototype.charAt = function (index) {
    if (this.str.length <= index) {
        return "";
    }
    var surrogate_aware_start_index = this.index_mapping[index];
    var surrogate_aware_end_index = this.index_mapping[index + 1];

    if (surrogate_aware_end_index == null) {
        return this.str.slice(surrogate_aware_start_index);
    }
    return this.str.slice(surrogate_aware_start_index, surrogate_aware_end_index);
};

SurrogateAwareString.prototype.charCodeAt = function (index) {
    if (this.index_mapping.length <= index) {
        return NaN;
    }
    var surrogate_aware_index = this.index_mapping[index];
    var upper = this.str.charCodeAt(surrogate_aware_index);
    var lower;
    if (upper >= 0xD800 && upper <= 0xDBFF && surrogate_aware_index < this.str.length) {
        lower = this.str.charCodeAt(surrogate_aware_index + 1);
        if (lower >= 0xDC00 && lower <= 0xDFFF) {
            return (upper - 0xD800) * 0x400 + lower - 0xDC00 + 0x10000;
        }
    }
    return upper;
};

SurrogateAwareString.prototype.toString = function () {
    return this.str;
};

SurrogateAwareString.isSurrogatePair = function (ch) {
    var utf16_code = ch.charCodeAt(0);
    if (utf16_code >= 0xD800 && utf16_code <= 0xDBFF) {
        // surrogate pair
        return true;
    } else {
        return false;
    }
};

module.exports = SurrogateAwareString;

},{}],24:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var ViterbiNode = require("./ViterbiNode");
var ViterbiLattice = require("./ViterbiLattice");
var SurrogateAwareString = require("../util/SurrogateAwareString");

/**
 * ViterbiBuilder builds word lattice (ViterbiLattice)
 * @param {DynamicDictionaries} dic dictionary
 * @constructor
 */
function ViterbiBuilder(dic) {
    this.trie = dic.trie;
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
}

/**
 * Build word lattice
 * @param {string} sentence_str Input text
 * @returns {ViterbiLattice} Word lattice
 */
ViterbiBuilder.prototype.build = function (sentence_str) {
    var lattice = new ViterbiLattice();
    var sentence = new SurrogateAwareString(sentence_str);

    var key, trie_id, left_id, right_id, word_cost;
    for (var pos = 0; pos < sentence.length; pos++) {
        var tail = sentence.slice(pos);
        var vocabulary = this.trie.commonPrefixSearch(tail);
        for (var n = 0; n < vocabulary.length; n++) {  // Words in dictionary do not have surrogate pair (only UCS2 set)
            trie_id = vocabulary[n].v;
            key = vocabulary[n].k;

            var token_info_ids = this.token_info_dictionary.target_map[trie_id];
            for (var i = 0; i < token_info_ids.length; i++) {
                var token_info_id = parseInt(token_info_ids[i]);

                left_id = this.token_info_dictionary.dictionary.getShort(token_info_id);
                right_id = this.token_info_dictionary.dictionary.getShort(token_info_id + 2);
                word_cost = this.token_info_dictionary.dictionary.getShort(token_info_id + 4);

                // node_name, cost, start_index, length, type, left_id, right_id, surface_form
                lattice.append(new ViterbiNode(token_info_id, word_cost, pos + 1, key.length, "KNOWN", left_id, right_id, key));
            }
        }

        // Unknown word processing
        var surrogate_aware_tail = new SurrogateAwareString(tail);
        var head_char = new SurrogateAwareString(surrogate_aware_tail.charAt(0));
        var head_char_class = this.unknown_dictionary.lookup(head_char.toString());
        if (vocabulary == null || vocabulary.length === 0 || head_char_class.is_always_invoke === 1) {
            // Process unknown word
            key = head_char;
            if (head_char_class.is_grouping === 1 && 1 < surrogate_aware_tail.length) {
                for (var k = 1; k < surrogate_aware_tail.length; k++) {
                    var next_char = surrogate_aware_tail.charAt(k);
                    var next_char_class = this.unknown_dictionary.lookup(next_char);
                    if (head_char_class.class_name !== next_char_class.class_name) {
                        break;
                    }
                    key += next_char;
                }
            }

            var unk_ids = this.unknown_dictionary.target_map[head_char_class.class_id];
            for (var j = 0; j < unk_ids.length; j++) {
                var unk_id = parseInt(unk_ids[j]);

                left_id = this.unknown_dictionary.dictionary.getShort(unk_id);
                right_id = this.unknown_dictionary.dictionary.getShort(unk_id + 2);
                word_cost = this.unknown_dictionary.dictionary.getShort(unk_id + 4);

                // node_name, cost, start_index, length, type, left_id, right_id, surface_form
                lattice.append(new ViterbiNode(unk_id, word_cost, pos + 1, key.length, "UNKNOWN", left_id, right_id, key.toString()));
            }
        }
    }
    lattice.appendEos();

    return lattice;
};

module.exports = ViterbiBuilder;

},{"../util/SurrogateAwareString":23,"./ViterbiLattice":25,"./ViterbiNode":26}],25:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var ViterbiNode = require("./ViterbiNode");

/**
 * ViterbiLattice is a lattice in Viterbi algorithm
 * @constructor
 */
function ViterbiLattice() {
    this.nodes_end_at = [];
    this.nodes_end_at[0] = [ new ViterbiNode(-1, 0, 0, 0, "BOS", 0, 0, "") ];
    this.eos_pos = 1;
}

/**
 * Append node to ViterbiLattice
 * @param {ViterbiNode} node
 */
ViterbiLattice.prototype.append = function (node) {
    var last_pos = node.start_pos + node.length - 1;
    if (this.eos_pos < last_pos) {
        this.eos_pos = last_pos;
    }

    var prev_nodes = this.nodes_end_at[last_pos];
    if (prev_nodes == null) {
        prev_nodes = [];
    }
    prev_nodes.push(node);

    this.nodes_end_at[last_pos] = prev_nodes;
};

/**
 * Set ends with EOS (End of Statement)
 */
ViterbiLattice.prototype.appendEos = function () {
    var last_index = this.nodes_end_at.length;
    this.eos_pos++;
    this.nodes_end_at[last_index] = [ new ViterbiNode(-1, 0, this.eos_pos, 0, "EOS", 0, 0, "") ];
};

module.exports = ViterbiLattice;

},{"./ViterbiNode":26}],26:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * ViterbiNode is a node of ViterbiLattice
 * @param {number} node_name Word ID
 * @param {number} node_cost Word cost to generate
 * @param {number} start_pos Start position from 1
 * @param {number} length Word length
 * @param {string} type Node type (KNOWN, UNKNOWN, BOS, EOS, ...)
 * @param {number} left_id Left context ID
 * @param {number} right_id Right context ID
 * @param {string} surface_form Surface form of this word
 * @constructor
 */
function ViterbiNode(node_name, node_cost, start_pos, length, type, left_id, right_id, surface_form) {
    this.name = node_name;
    this.cost = node_cost;
    this.start_pos = start_pos;
    this.length = length;
    this.left_id = left_id;
    this.right_id = right_id;
    this.prev = null;
    this.surface_form = surface_form;
    if (type === "BOS") {
        this.shortest_cost = 0;
    } else {
        this.shortest_cost = Number.MAX_VALUE;
    }
    this.type = type;
}

module.exports = ViterbiNode;

},{}],27:[function(require,module,exports){
/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * ViterbiSearcher is for searching best Viterbi path
 * @param {ConnectionCosts} connection_costs Connection costs matrix
 * @constructor
 */
function ViterbiSearcher(connection_costs) {
    this.connection_costs = connection_costs;
}

/**
 * Search best path by forward-backward algorithm
 * @param {ViterbiLattice} lattice Viterbi lattice to search
 * @returns {Array} Shortest path
 */
ViterbiSearcher.prototype.search = function (lattice) {
    lattice = this.forward(lattice);
    return this.backward(lattice);
};

ViterbiSearcher.prototype.forward = function (lattice) {
    var i, j, k;
    for (i = 1; i <= lattice.eos_pos; i++) {
        var nodes = lattice.nodes_end_at[i];
        if (nodes == null) {
            continue;
        }
        for (j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            var cost = Number.MAX_VALUE;
            var shortest_prev_node;

            var prev_nodes = lattice.nodes_end_at[node.start_pos - 1];
            if (prev_nodes == null) {
                // TODO process unknown words (repair word lattice)
                continue;
            }
            for (k = 0; k < prev_nodes.length; k++) {
                var prev_node = prev_nodes[k];

                var edge_cost;
                if (node.left_id == null || prev_node.right_id == null) {
                    // TODO assert
                    console.log("Left or right is null");
                    edge_cost = 0;
                } else {
                    edge_cost = this.connection_costs.get(prev_node.right_id, node.left_id);
                }

                var _cost = prev_node.shortest_cost + edge_cost + node.cost;
                if (_cost < cost) {
                    shortest_prev_node = prev_node;
                    cost = _cost;
                }
            }

            node.prev = shortest_prev_node;
            node.shortest_cost = cost;
        }
    }
    return lattice;
};

ViterbiSearcher.prototype.backward = function (lattice) {
    var shortest_path = [];
    var eos = lattice.nodes_end_at[lattice.nodes_end_at.length - 1][0];

    var node_back = eos.prev;
    if (node_back == null) {
        return [];
    }
    while (node_back.type !== "BOS") {
        shortest_path.push(node_back);
        if (node_back.prev == null) {
            // TODO Failed to back. Process unknown words?
            return [];
        }
        node_back = node_back.prev;
    }

    return shortest_path.reverse();
};

module.exports = ViterbiSearcher;

},{}]},{},[18])(18)
});

return ()=>new Promise((resolve,reject)=>{
  module.exports.builder({dicPath:"."}).build((error,tokenizer)=>error?reject(error):resolve(tokenizer));
});
})();

// Generated from EDRDG JMdict and UD Japanese GSD train, CC BY-SA 4.0.
const japaneseLatinDictionary=new Map(Object.entries({"AA":"エーエー","ABC":"エービーシー","ABI":"エービーアイ","ABM":"エービーエム","AC":"エーシー","ACK":"アック","ACL":"エーシーエル","ACM":"エーシーエム","AD":"エーディー","ADESS":"アデス","ADH":"エーディーエイチ","ADP":"エーディーピー","ADPCM":"エーディーピーシーエム","ADSL":"エーディーエスエル","ADV":"エーディーブイ","AE":"エーイー","AED":"エーイーディー","AEON":"イオン","AF":"エーエフ","AGA":"エージーエー","AGI":"エージーアイ","AGR":"エージーアール","AI":"エーアイ","AIDS":"エイズ","AIFF":"エーアイエフエフ","AIPAC":"アイパック","AIPC":"エーアイピーシー","AIX":"エーアイエックス","ALD":"エーエルディー","ALE":"エーエルイー","ALS":"エーエルエス","ALT":"エーエルティー","AM":"エーエム","AMD":"エーエムディー","AMOLED":"アモレッド","AMP":"エーエムピー","AMeDAS":"アメダス","AND":"アンド","ANK":"アンク","ANZAC":"アンザック","AO":"エーオー","AOL":"エーオーエル","AP":"エーピー","API":"エーピーアイ","APL":"エーピーエル","APU":"エーピーユー","ARDS":"エーアールディーエス","ARP":"アープ","ARPA":"アーパ","ARPG":"エーアールピージー","ART":"アート","AS":"エーエス","ASCII":"アスキー","ASD":"エーエスディー","ASEAN":"アセアン","ASI":"エーエスアイ","ASIC":"エーシック","ASP":"エーエスピー","ASPI":"アスピー","ASROC":"アスロック","AT":"エーティー","ATAPI":"アタピー","ATICS":"アティックス","ATM":"エーティーエム","ATOK":"エイトック","ATP":"エーティーピー","AV":"エーブイ","AVG":"エーブイジー","AVI":"エーブイアイ","AVIF":"エーブイアイエフ","AWACS":"エーワックス","AX":"エーエックス","ActiveX":"アクティブエックス","Ada":"エイダ","Anzac":"アンザック","AppleTalk":"アップルトーク","BAN":"バン","BASIC":"ベーシック","BB":"ビービー","BBC":"ビービーシー","BBS":"ビービーエス","BC":"ビーシー","BCG":"ビーシージー","BCP":"ビーシーピー","BD":"ビーディー","BDSM":"ビーディーエスエム","BER":"ビーイーアール","BG":"ビージー","BGM":"ビージーエム","BIOS":"バイオス","BL":"ビーエル","BM":"ビーエム","BMD":"ビーエムディー","BMP":"ビーエムピー","BMW":"ビーエムダブリュー","BMX":"ビーエムエックス","BNPL":"ビーエヌピーエル","BOD":"ビーオーディー","BOOTP":"ブートピー","BPA":"ビスフェノールエー","BPD":"ビーピーディー","BPM":"ビーピーエム","BPO":"ビーピーオー","BR":"ビーアール","BRICS":"ブリックス","BS":"ビーエス","BSD":"ビーエスディー","BSE":"ビーエスイー","BSL":"ビーエスエル","BTC":"ビーティーシー","BTO":"ビーティーオー","BWR":"ビーダブリューアール","BYOD":"ビーワイオーディー","BitBLT":"ビットブリット","C":"シー","CA":"シーエー","CAD":"キャド","CAE":"シーエーイー","CAFIS":"キャフィス","CAI":"シーエーアイ","CALS":"キャルス","CAM":"キャム","CAPTCHA":"キャプチャ","CATV":"シーエーティーブイ","CAV":"シーエーブイ","CB":"シービー","CBD":"シービーディー","CBT":"シービーティー","CCD":"シーシーディー","CCO":"シーシーオー","CD":"シーディー","CDDA":"シーディーディーエー","CDMA":"シーディーエムエー","CDN":"シーディーエヌ","CDR":"シーディーアール","CDROM":"シーディーロム","CE":"シーイー","CEO":"シーイーオー","CERO":"セロ","CERT":"サート","CF":"シーエフ","CFC":"シーエフシー","CFIT":"シーフィット","CFO":"シーエフオー","CG":"シージー","CGA":"シージーエー","CGI":"シージーアイ","CHAdeMO":"チャデモ","CIA":"シーアイエー","CIE":"シーアイイー","CIO":"シーアイオー","CISC":"シスク","CITES":"サイテス","CLV":"シーエルブイ","CM":"シーエム","CMOS":"シーモス","CNET":"シーネット","CNN":"シーエヌエヌ","COBOL":"コボル","COD":"シーオーディー","CODASYL":"コダシル","COM":"コム","COO":"シーオーオー","CORBA":"コルバ","CP":"シーピー","CPI":"シーピーアイ","CPM":"シーピーエム","CPS":"シーピーエス","CPU":"シーピーユー","CQC":"シーキューシー","CRC":"シーアールシー","CRISPR":"クリスパー","CRM":"シーアールエム","CS":"シーエス","CSR":"シーエスアール","CSS":"シーエスエス","CSV":"シーエスブイ","CT":"シーティー","CTC":"シーティーシー","CTO":"シーティーオー","CTS":"シーティーエス","CUG":"シーユージー","CUI":"シーユーアイ","CV":"シーブイ","CVS":"シーブイエス","CVT":"シーブイティー","Ca":"シーエー","CardBus":"カードバス","ChatGPT":"チャットジーピーティー","DAO":"ダオ","DAP":"ディーエーピー","DASD":"ダスド","DBMS":"ディービーエムエス","DC":"ディーシー","DCE":"ディーシーイー","DDI":"ディーディーアイ","DDL":"ディーディーエル","DDT":"ディーディーティー","DDX":"ディーディーエックス","DEC":"デック","DEN":"デン","DES":"ディーイーエス","DF":"ディーエフ","DHMO":"ディーエイチエムオー","DI":"ディーアイ","DID":"ディーアイディー","DIG":"ディグ","DINKS":"ディンクス","DIY":"ディーアイワイ","DL":"ディーエル","DLC":"ディーエルシー","DLL":"ディーエルエル","DM":"ディーエム","DMA":"ディーエムエー","DMAT":"ディーマット","DML":"ディーエムエル","DMZ":"ディーエムゼット","DN":"ディーエヌ","DNA":"ディーエヌエー","DNS":"ディーエヌエス","DOM":"ドム","DOS":"ドス","DPE":"ディーピーイー","DRAM":"ディーラム","DRM":"ディーアールエム","DSM":"ディーエスエム","DSP":"ディーエスピー","DSS":"ディーエスエス","DSU":"ディーエスユー","DT":"ディーティー","DTM":"ディーティーエム","DTP":"ディーティーピー","DV":"ディーブイ","DVD":"ディーブイディー","DVDR":"ディーブイディーアール","DVDRAM":"ディーブイディーラム","DVDROM":"ディーブイディーロム","DX":"ディーエックス","DeNA":"ディーエヌエー","DevOps":"デブオプス","DirectX":"ダイレクトエックス","E":"イー","EB":"イービー","EBCDIC":"エビシディック","EBM":"イービーエム","EC":"イーシー","ECCS":"イーシーシーエス","ECM":"イーシーエム","ECMO":"エクモ","ECP":"イーシーピー","ED":"イーディー","EDGAR":"エドガー","EDI":"イーディーアイ","EDIFACT":"エディファクト","EDM":"イーディーエム","EDTA":"イーディーティーエー","EEC":"イーイーシー","EEPROM":"イーイーピーロム","EEZ":"イーイーゼット","EFF":"イーエフエフ","EGA":"イージーエー","EIA":"イーアイエー","ELV":"イーエルブイ","EM":"イーエム","EMC":"イーエムシー","EMDR":"イーエムディーアール","EMS":"イーエムエス","ENIAC":"エニアック","EOF":"イーオーエフ","EOS":"イーオーエス","EP":"イーピー","EPG":"イーピージー","EPROM":"イーピーロム","EPWING":"イーピーウィング","EQ":"イーキュー","ERIC":"エリック","EROS":"エロス","ERP":"イーアールピー","ES":"イーエス","ESCAP":"エスカップ","ESL":"イーエスエル","ESM":"イーエスエム","ESP":"イーエスピー","ESS":"イーエスエス","ETC":"イーティーシー","ETD":"イーティーディー","ETF":"イーティーエフ","ETR":"イーティーアール","EU":"イーユー","EUC":"イーユーシー","EV":"イーブイ","EWS":"イーダブリューエス","EX":"イーエックス","Emacs":"イーマックス","F":"エフ","FA":"エフエー","FAGA":"エフエージーエー","FAQ":"エフエーキュー","FAT":"ファット","FB":"エフビー","FBI":"エフビーアイ","FCC":"エフシーシー","FCV":"エフシーブイ","FD":"エフディー","FDD":"エフディーディー","FDDI":"エフディーディーアイ","FDR":"エフディーアール","FEP":"エフイーピー","FFT":"エフエフティー","FGM":"エフジーエム","FIDO":"フィド","FIGS":"フィグス","FIPS":"フィップス","FK":"エフケー","FLOPS":"フロップス","FLOSS":"フロス","FM":"エフエム","FOMO":"フォーモー","FORTRAN":"フォートラン","FOSS":"フォス","FP":"エフピー","FPGA":"エフピージーエー","FPS":"エフピーエス","FPU":"エフピーユー","FQDN":"エフキューディーエヌ","FRP":"エフアールピー","FTA":"エフティーエー","FTC":"エフティーシー","FTP":"エフティーピー","FTTC":"エフティーティーシー","FTTx":"エフティーティーエックス","FW":"エフダブリュー","FX":"エフエックス","FastSCSI":"ファストスカジー","Floorp":"フロープ","Fortran":"フォートラン","FreeBSD":"フリービーエスディー","G":"ジー","GABA":"ギャバ","GATT":"ガット","GB":"ジービー","GBS":"ジービーエス","GCOM":"ジーコム","GDP":"ジーディーピー","GDPR":"ジーディーピーアール","GE":"ジーイー","GI":"ジーアイ","GIGAMO":"ギガモ","GL":"ジーエル","GM":"ジーエム","GMO":"ジーエムオー","GNP":"ジーエヌピー","GP":"ジーピー","GPS":"ジーピーエス","GPT":"ジーピーティー","GS":"ジーエス","GSR":"ジーエスアール","GT":"ジーティー","GU":"ジーユー","GUI":"ジーユーアイ","GW":"ジーダブリュー","GX":"ジーエックス","Google":"グーグル","H":"エッチ","HEIB":"ヒーブ","HTTP":"エイチティーティーピー","HTTPD":"エイチティーティーピーディー","HUD":"ハッド","HUGO":"ヒューゴ","HUMINT":"ヒューミント","HaaS":"ハース","Hib":"ヒブ","I":"アイ","IAB":"アイエービー","IBM":"アイビーエム","IC":"アイシー","ICANN":"アイキャン","ICBM":"アイシービーエム","ICC":"アイシーシー","ICMP":"アイシーエムピー","ICOCA":"イコカ","ICT":"アイシーティー","ICU":"アイシーユー","ID":"アイディー","IDC":"アイディーシー","IDE":"アイディーイー","IDL":"アイディーエル","IE":"アイイー","IELTS":"アイエルツ","IETF":"アイイーティーエフ","IF":"アイエフ","IIJ":"アイアイジェイ","IIS":"アイアイエス","IIoT":"アイアイオーティー","IKEA":"イケア","ILO":"アイエルオー","IM":"アイエム","IMAP":"アイマップ","IMAX":"アイマックス","IME":"アイエムイー","IMF":"アイエムエフ","IMO":"アイエムオー","IN":"イン","INAH":"アイナ","IO":"アイオー","IOC":"アイオーシー","IP":"アイピー","IPA":"アイピーエー","IPO":"アイピーオー","IPTV":"アイピーティーブイ","IQ":"アイキュー","IR":"アイアール","IRBM":"アイアールビーエム","IRC":"アイアールシー","IRQ":"アイアールキュー","IS":"アイエス","ISAM":"アイサム","ISAPI":"アイサピ","ISBN":"アイエスビーエヌ","ISDN":"アイエスディーエヌ","ISIL":"アイシル","ISIS":"アイシス","ISO":"アイエスオー","ISP":"アイエスピー","IT":"アイティー","ITC":"アイティーシー","ITF":"アイティーエフ","ITU":"アイティーユー","IVF":"アイブイエフ","IrDA":"アイアールディーエー","JA":"ジェーエー","JAL":"ジャル","JAS":"ジャス","JASDAQ":"ジャスダック","JASRAC":"ジャスラック","JAXA":"ジャクサ","JETRO":"ジェトロ","JICA":"ジャイカ","JIS":"ジス","JMdict":"ジェイエムディクト","JOMO":"ジョーモー","JPCZ":"ジェーピーシーゼット","JPNIC":"ジェイピーニック","JPYC":"ジェーピーワイシー","Java":"ジャバ","JavaScript":"ジャバスクリプト","KDDI":"ケーディーディーアイ","KK":"ケーケー","KKK":"ケーケーケー","KL":"ケーエル","KO":"ケーオー","KOPF":"コップ","KWIC":"クイック","KYC":"ケーワイシー","Kermit":"カーミット","L":"エル","LA":"エルエー","LAMP":"ランプ","LAN":"ラン","LAP":"ラップ","LAPM":"ラップエム","LARA":"ララ","LASH":"ラッシュ","LBO":"エルビーオー","LCC":"エルシーシー","LCD":"エルシーディー","LD":"エルディー","LDAP":"エルダップ","LDL":"エルディーエル","LDR":"エルディーアール","LDS":"エルディーエス","LED":"エルイーディー","LFG":"エルエフジー","LGBT":"エルジービーティー","LGBTQ":"エルジービーティーキュー","LHR":"ロングホームルーム","LINE":"ライン","LISP":"リスプ","LL":"エルエル","LLC":"エルエルシー","LLM":"エルエルエム","LNG":"エルエヌジー","LO":"エルオー","LOCA":"ロカ","LP":"エルピー","LPE":"エルピーイー","LPG":"エルピージー","LPS":"エルピーエス","LSD":"エルエスディー","LSI":"エルエスアイ","LTE":"エルティーイー","LUT":"ラット","LWR":"エルダブリューアール","LYCOS":"ライコス","LoRA":"ローラ","M":"エム","MAD":"マッド","MAPI":"マッピ","MARCH":"マーチ","MB":"エムビー","MBA":"エムビーエー","MBE":"エムビーイー","MBO":"エムビーオー","MC":"エムシー","MD":"エムディー","MDMA":"エムディーエムエー","ME":"エムイー","MERS":"マーズ","METI":"メティ","MF":"エムエフ","MFA":"エムエフエー","MFN":"エムエフエヌ","MIA":"エムアイエー","MILF":"ミルフ","MIME":"マイム","MIPS":"ミップス","MLS":"エムエルエス","MMD":"エムエムディー","MMORPG":"エムエムオーアールピージー","MMT":"エムエムティー","MMU":"エムエムユー","MNO":"エムエヌオー","MNP":"エムエヌピー","MO":"エムオー","MP":"エムピー","MPEG":"エムペグ","MR":"エムアール","MRA":"エムアールエー","MRE":"エムアールイー","MRI":"エムアールアイ","MRSA":"エムアールエスエー","MSDOS":"エムエスドス","MT":"エムティー","MTB":"エムティービー","MTG":"エムティージー","MTR":"エムティーアール","MUD":"エムユーディー","MUX":"マックス","MVNO":"エムブイエヌオー","MVP":"エムブイピー","Mach":"マーク","MiG":"ミグ","N":"エヌ","NAFTA":"ナフタ","NAK":"ナック","NAMBLA":"ナンブラ","NAND":"ナンド","NAPF":"ナップ","NAPS":"ナプス","NAS":"ナス","NASA":"ナサ","NASDAQ":"ナスダック","NAT":"ナット","NATO":"ナトー","NC":"エヌシー","NCNR":"エヌシーエヌアール","NEC":"エヌイーシー","NEET":"ニート","NEP":"ネップ","NFS":"エヌエフエス","NFT":"エヌエフティー","NG":"エヌジー","NGK":"エヌジーケー","NGO":"エヌジーオー","NIC":"ニック","NICU":"エヌアイシーユー","NIMBY":"ニンビー","NISA":"ニーサ","NMR":"エヌエムアール","NOAA":"ノア","NOR":"ノア","NOS":"ノス","NOT":"ノット","NOTAM":"ノータム","NPB":"エヌピービ","NPC":"エヌピーシー","NPO":"エヌピーオー","NPS":"エヌピーエス","NPT":"エヌピーティー","NPU":"エヌピーユー","NRC":"エヌアールシー","NSFW":"エヌエスエフダブリュー","NT":"エヌティー","NVMe":"エヌブイエムイー","NW":"エヌダブリュー","NZ":"エヌゼット","NeXTSTEP":"ネクストステップ","NetBIOS":"ネットバイオス","Netflix":"ネットフリックス","NumLock":"ナムロック","Nvidia":"エヌビディア","O":"オー","OA":"オーエー","OB":"オービー","OCR":"オーシーアール","OD":"オーディー","ODA":"オーディーエー","ODM":"オーディーエム","ODP":"オーディーピー","OECD":"オーイーシーディー","OEM":"オーイーエム","OFF":"オフ","OG":"オージー","OL":"オーエル","OLED":"オーエルイーディー","ON":"オン","OOTD":"オーオーティーディー","OP":"オーピー","OPEC":"オペック","OPP":"オーピーピー","OR":"オア","OS":"オーエス","OSI":"オーエスアイ","OSINT":"オシント","OSS":"オーエスエス","OT":"オーティー","OTA":"オーティーエー","OTC":"オーティーシー","OTP":"オーティーピー","OUT":"アウト","OV":"オーブイ","OVA":"オーブイエー","P":"ピー","PA":"ピーエー","PASMO":"パスモ","PBX":"ピービーエックス","PC":"ピーシー","PCB":"ピーシービー","PCDOS":"ピーシードス","PCI":"ピーシーアイ","PCM":"ピーシーエム","PD":"ピーディー","PDA":"ピーディーエー","PDF":"ピーディーエフ","PDM":"ピーディーエム","PEN":"ペン","PER":"パー","PET":"ペット","PFAS":"ピーファス","PIM":"ピム","PIP":"ピーアイピー","PIX":"ピックス","PL":"ピーエル","PM":"ピーエム","PMDD":"ピーエムディーディー","PMS":"ピーエムエス","POP":"ポップ","POSIX":"ポジックス","POW":"ピーオーダブリュー","PP":"ピーピー","PPP":"ピーピーピー","PPV":"ピーピーブイ","PR":"ピーアール","PRICEDOWN":"プライスダウン","PRISM":"プリズム","PROLOG":"プロログ","PROM":"ピーロム","PS":"ピーエス","PTA":"ピーティーエー","PTSD":"ピーティーエスディー","PUREX":"ピューレックス","PV":"ピーブイ","PVC":"ピーブイシー","PVP":"ピーブイピー","PWR":"ピーダブリューアール","PYK":"パヨク","Perl":"パール","PiTaPa":"ピタパ","Pix":"ピックス","PnP":"ピーエヌピー","PoC":"ピーオーシー","PostPet":"ポストペット","Prolog":"プロログ","PvP":"ピーブイピー","Q":"キュー","QA":"キューエー","QAnon":"キューアノン","QB":"キュービー","QC":"キューシー","QOL":"キューオーエル","QT":"キューティー","R":"アール","RAG":"ラグ","RAM":"ラム","RAMDAC":"ラムダック","RAS":"ラス","RAW":"ロー","RC":"アールシー","RDBMS":"アールディービーエムエス","RDD":"アールディーディー","RDO":"アールディーオー","REIT":"リート","REM":"レム","RF":"アールエフ","RFID":"アールエフアイディー","RGB":"アールジービー","RIF":"リフ","RISC":"リスク","RNA":"アールエヌエー","RO":"アールオー","ROLAP":"ローラップ","ROM":"ロム","RPG":"アールピージー","RSS":"アールエスエス","RT":"アールティー","RTA":"アールティーエー","RTF":"アールティーエフ","RTS":"アールティーエス","RV":"アールブイ","Rh":"アールエイチ","S":"エス","SA":"エスエー","SABON":"サボン","SAL":"サル","SALT":"ソルト","SAM":"サム","SARS":"サーズ","SAS":"エスエーエス","SB":"エスビー","SCID":"スキッド","SCL":"エスシーエル","SCO":"スコー","SCR":"エスシーアール","SCSI":"スカジー","SDGs":"エスディージーズ","SDK":"エスディーケー","SDR":"エスディーアール","SDRAM":"エスディーラム","SDSL":"エスディーエスエル","SDTV":"エスディーティーブイ","SE":"エスイー","SEM":"エスイーエム","SEO":"エスイーオー","SES":"エスイーエス","SF":"エスエフ","SFA":"エスエフエー","SFX":"エスエフエックス","SGML":"エスジーエムエル","SHR":"ショートホームルーム","SI":"エスアイ","SIC":"エスアイシー","SIG":"シグ","SIGINT":"シギント","SIM":"シム","SIS":"シス","SIT":"エスアイティー","SJIS":"エスジス","SL":"エスエル","SLBM":"エスエルビーエム","SLE":"エスエルイー","SLG":"エスエルジー","SM":"エスエム","SMS":"エスエムエス","SMTP":"エスエムティーピー","SNAP":"スナップ","SNEP":"スネップ","SNOBOL":"スノボル","SNS":"エスエヌエス","SOGI":"ソジ","SOHO":"ソーホー","SOS":"エスオーエス","SOTEC":"ソーテック","SP":"エスピー","SPARC":"スパーク","SPF":"エスピーエフ","SPOF":"エスピーオーエフ","SQL":"エスキューエル","SRAM":"エスラム","SS":"エスエス","SSD":"エスエスディー","SSL":"エスエスエル","SSM":"エスエスエム","SSO":"エスエスオー","SSPE":"エスエスピーイー","SST":"エスエスティー","STD":"エスティーディー","STEM":"ステム","STG":"エスティージー","SUP":"サップ","SVGA":"エスブイジーエー","SWIFT":"スウィフト","Siri":"シリ","SoC":"エスオーシー","StuffIt":"スタッフイット","Suica":"スイカ","T":"ティー","TA":"ティーエー","TAS":"タス","TBS":"ティービーエス","TCG":"ティーシージー","TEL":"テル","TEN":"テン","TEPCO":"テプコ","TEU":"ティーイーユー","TGV":"テジェヴェ","THC":"ティーエイチシー","TIFF":"ティフ","TKO":"ティーケーオー","TLD":"ティーエルディー","TLS":"ティーエルエス","TMD":"ティーエムディー","TNT":"ティーエヌティー","TOB":"ティーオービー","TOEIC":"トーイック","TOPIX":"トピックス","TOPS":"トップス","TPO":"ティーピーオー","TPP":"ティーピーピー","TPS":"ティーピーエス","TQC":"ティーキューシー","TRON":"トロン","TRPG":"ティーアールピージー","TS":"ティーエス","TSL":"ティーエスエル","TTS":"ティーティーエス","TWAIN":"トウェイン","TikTok":"ティックトック","TikToker":"ティックトッカー","U":"ユー","UAE":"ユーエーイー","UB":"ユービー","UD":"ユーディー","UGC":"ユージーシー","UI":"ユーアイ","UK":"ユーケー","UL":"ユーエル","UML":"ユーエムエル","UNEP":"ユネップ","UNESCO":"ユネスコ","UNICEF":"ユニセフ","UNIVAC":"ユニバック","UNIX":"ユニックス","UNOS":"ユーノス","UNTAC":"アンタック","UPF":"ユーピーエフ","UPS":"ユーピーエス","UPSERT":"アップサート","UR":"ユーアール","URI":"ユーアールアイ","URL":"ユーアールエル","URN":"ユーアールエヌ","US":"ユーエス","USA":"ユーエスエー","USB":"ユーエスビー","USCAR":"ユースカー","USMCA":"ユーエスエムシーエー","USSR":"ユーエスエスアール","UU":"ユーユー","UUDECODE":"ユーユーデコード","UUENCODE":"ユーユーエンコード","UV":"ユーブイ","UWB":"ユーダブリュービー","UX":"ユーエックス","Uber":"ウーバー","UberEats":"ウーバーイーツ","Unicode":"ユニコード","Usenet":"ユーズネット","VA":"ブイエー","VAIO":"バイオ","VAR":"ブイエーアール","VAX":"バックス","VB":"ブイビー","VBA":"ブイビーエー","VCCI":"ブイシーシーアイ","VCPI":"ブイシーピーアイ","VCS":"ブイシーエス","VD":"ブイディー","VDI":"ブイディーアイ","VDSL":"ブイディーエスエル","VDT":"ブイディーティー","VE":"ブイイー","VEGF":"ブイイージーエフ","VFX":"ブイエフエックス","VGA":"ブイジーエー","VI":"ブイアイ","VIO":"ブイアイオー","VLSI":"ブイエルエスアイ","VM":"ブイエム","VMS":"ブイエムエス","VOCALOID":"ボーカロイド","VOD":"ブイオーディー","VP":"ブイピー","VPE":"ブイピーイー","VPN":"ブイピーエヌ","VPS":"ブイピーエス","VR":"ブイアール","VRAM":"ブイラム","VRE":"ブイアールイー","VRML":"ブイアールエムエル","VSOP":"ブイエスオーピー","VTOL":"ブイトール","VTuber":"ブイチューバー","VUI":"ブイユーアイ","VX":"ブイエックス","Visa":"ビザ","VoIP":"ブイオーアイピー","W":"ダブリュー","WAF":"ワフ","WAN":"ワン","WANO":"ワノ","WASP":"ワスプ","WC":"ダブリューシー","WCL":"ダブリューシーエル","WG":"ダブリュージー","WIC":"ダブリューアイシー","WLB":"ダブリューエルビー","WMO":"ダブリューエムオー","WTI":"ダブリューティーアイ","WTO":"ダブリューティーオー","WWI":"ダブリューダブリューワン","WWII":"ダブリューダブリューツー","WWW":"ダブリューダブリューダブリュー","WYSIWYG":"ウィジウィグ","WYSIWYS":"ウィジウィズ","Weblio":"ウェブリオ","WhatsApp":"ワッツアップ","Wii":"ウィー","WiiU":"ウィーユー","WindowsNT":"ウィンドウズエヌティー","WindowsXP":"ウィンドウズエックスピー","X":"エックス","XL":"エックスエル","XML":"エックスエムエル","XO":"エックスオー","XP":"エックスピー","XR":"エックスアール","XSS":"エックスエスエス","Y":"ワイ","YouTube":"ユーチューブ","Zoom":"ズーム","aiff":"エーアイエフエフ","am":"エーエム","and":"アンド","au":"エーユー","bcc":"ビーシーシー","bps":"ビーピーエス","c":"シー","cc":"シーシー","cm":"シーエム","ddI":"ディーディーアイ","de":"デ","dis":"ディス","dl":"ディーエル","dpi":"ディーピーアイ","e":"イー","eV":"イーブイ","f":"エフ","fuga":"フガ","g":"ジー","ggrks":"ググレカス","gkbr":"ガクブル","grep":"グレップ","h":"エッチ","hoge":"ホゲ","hogehoge":"ホゲホゲ","hogera":"ホゲラ","http":"エイチティーティーピー","httpd":"エイチティーティーピーディー","i":"アイ","iBook":"アイブック","iCOMP":"アイコンプ","iDeCo":"イデコ","iMac":"アイマック","iPad":"アイパッド","iPod":"アイポッド","iTunes":"アイチューンズ","ing":"アイエヌジー","kg":"ケージー","ktkr":"キタコレ","kwsk":"クワシク","l":"エル","m":"エム","mRNA":"エムアールエヌエー","manaca":"マナカ","miniDVD":"ミニディーブイディー","mixi":"ミクシィ","ml":"エムエル","n":"エヌ","o":"オー","or":"オア","p":"ピー","piyo":"ピヨ","q":"キュー","r":"アール","rem":"レム","rkgk":"ラクガキ","s":"エス","t":"ティー","tRNA":"ティーアールエヌエー","u":"ユー","w":"ダブリュー","wktk":"ワクテカ","xDSL":"エックスディーエスエル","y":"ワイ"}));
const japaneseLatinAttested=new Map(Object.entries({"A":"エー","AC":"エーシー","AI":"エーアイ","AP":"エーピー","ASK":"エーエスケー","AT":"エーティー","ATM":"エーティーエム","AUTO":"オート","B":"ビー","BGM":"ビージーエム","BS":"ビーエス","BlackBerry":"ブラックベリー","Bold":"ボールド","C":"シー","CARP":"カープ","CD":"シーディー","CEO":"シーイーオー","CHEMISTRY":"ケミストリー","CIS":"シーアイエス","CLASSICS":"クラシックス","CM":"シーエム","CPU":"シーピーユー","City":"シティー","D":"ディー","DC":"ディーシー","DNA":"ディーエヌエー","DS":"ディーエス","DVD":"ディーブイディー","Deep":"ディープ","E":"イー","EEP":"イーイーピー","EMI":"イーエムアイ","F":"エフ","FA":"エフエー","FAX":"ファックス","FC":"エフシー","FM":"エフエム","FRIDAY":"フライデー","Firefox":"ファイアフォックス","G":"ジー","GM":"ジーエム","GOOD":"グッド","GP":"ジーピー","GPS":"ジーピーエス","GPT":"ジーピーティー","Geisberg":"ゲーズバーグ","Good":"グッド","Google":"グーグル","H":"エイチ","HCMS":"エーチシーエムエス","HDCD":"エーチディーシーディー","HOH":"エーチオーエイチ","HP":"エイチピー","Heart":"ハート","I":"アイ","IBM":"アイビーエム","IC":"アイシー","ID":"アイディー","II":"ツー","IMS":"アイエムエス","IP":"アイピー","ISO":"アイエスオー","ISS":"アイエスエス","J":"ジェー","JBS":"ジェービーエス","JR":"ジェーアール","JSCPR":"ジェーエスシーピーアール","JUKI":"ジューキ","Japan":"ジャパン","Java":"ジャバ","K":"ケー","L":"エル","Linux":"リナックス","M":"エム","MASAYA":"マサヤ","Macintosh":"マッキントッシュ","Mark":"マーク","Mii":"ミー","Mozilla":"モジラ","N":"エヌ","NBA":"エヌビーエー","NCAA":"エヌシーエーエー","NHK":"エヌエイチケー","NIGHT":"ナイト","NKVD":"エヌカーベーデー","NTT":"エヌティーティー","NY":"エヌワイ","O":"オー","OFDM":"オーエフディーエム","OL":"オーエル","ON":"オン","OVA":"オーブイエー","P":"ピー","PC":"ピーシー","PK":"ピーケー","PR":"ピーアール","Paul":"ポール","Project":"プロジェクト","Q":"キュー","R":"アール","ROM":"ロム","RPG":"アールピージー","Report":"レポート","S":"エス","SF":"エスエフ","SIRUBA":"シルバ","SL":"エスエル","SQL":"エスキューエル","Sarnia":"サーニア","Shredder":"シュレッダー","Speed":"スピード","T":"ティー","TBS":"ティービーエス","TOKYO":"トーキョー","TOSHI":"トシ","Teredo":"テリドー","The":"ザ","Tube":"チューブ","U":"ユー","UCI":"ユーシーアイ","UEFA":"ユーイーエフエー","UK":"ユーケー","UNIX":"ユニックス","UP":"アップ","UR":"ユーアール","URL":"ユーアールエル","V":"ブイ","VESA":"ベサ","VS":"ブイエス","W":"ダブリュー","WAHAHA":"ワハハ","WAVE":"ウエーブ","WBA":"ダブリュービーエー","WBC":"ダブリュービーシー","WEEKEND":"ウィークエンド","WWE":"ダブリューダブリューイー","Web":"ウェブ","Windows":"ウインドーズ","X":"エックス","Y":"ワイ","You":"ユー","Z":"ゼット","Zeus":"ゼウス","e":"イー","eo":"イーオー","facebook":"フェースブック","goo":"グー","i":"アイ","joint":"ジョイント","mixi":"ミクシー","n":"エヌ","of":"オブ","r":"アール","s":"エス","the":"ザ","twitter":"ツイッター"}));
const japaneseLatinUnits=new Map(Object.entries({"cm":"センチメートル","kg":"キログラム","km":"キロメートル","m":"メートル","mm":"ミリメートル","t":"トン"}));

// JMdict by EDRDG, snapshot 2026-11-23. Derived spelling/reading data under CC BY-SA 4.0.
// https://www.edrdg.org/edrdg/licence.html
const japaneseLexiconPayload=asset("japanese-lexicon-1.bin");

// One JMdict common reading per kanji spelling, used only while Kuromoji is unavailable.
const japaneseOfflinePayload=asset("japanese-offline-data-1.bin");

const godanKana={
  v5u:['う','わ','い','え','お','って','った'], v5k:['く','か','き','け','こ','いて','いた'],
  'v5k-s':['く','か','き','け','こ','って','った'], v5g:['ぐ','が','ぎ','げ','ご','いで','いだ'],
  v5s:['す','さ','し','せ','そ','して','した'], v5t:['つ','た','ち','て','と','って','った'],
  v5n:['ぬ','な','に','ね','の','んで','んだ'], v5b:['ぶ','ば','び','べ','ぼ','んで','んだ'],
  v5m:['む','ま','み','め','も','んで','んだ'], v5r:['る','ら','り','れ','ろ','って','った'],
};

function japaneseInflections(word,reading,kind,stems=false) {
  const tail=kind==='adj-i'?'い':kind==='v1'?'る':godanKana[kind]?.[0];
  if(!tail || !word.endsWith(tail) || !reading.endsWith(tail)) return [];
  let endings;
  if(kind==='adj-i') endings=['く','くて','くない','くなかった','くなくて','かった','ければ','かろう'];
  else if(kind==='v1') endings=[...(stems?['']:[]),'た','て','ない','なかった','なくて','ます','ました','ません','れば','よう','られる','られない','させる','ろ'];
  else {
    const [,a,i,e,o,te,ta]=godanKana[kind];
    endings=[...(stems?[i]:[]),te,ta,a+'ない',a+'なかった',a+'なくて',i+'ます',i+'ました',i+'ません',e+'ば',o+'う',a+'れる',a+'せる'];
  }
  return endings.map(end=>[word.slice(0,-1)+end,reading.slice(0,-1)+end]);
}

function buildJapaneseLexicon(text,stems=false) {
  const exact=new Map(), derived=new Map(), longest=new Map();
  function register(word) {
    const first=String.fromCodePoint(word.codePointAt(0));
    longest.set(first,Math.max(longest.get(first)??0,word.length));
  }
  const [rows,protectedSpellings='']=text.split('\n\n');
  const protectedWords=new Set(protectedSpellings.split('\n'));
  for(const row of rows.split('\n')) {
    if(!row) continue;
    const [word,reading,kind]=row.split('\t');
    const entry={reading,kind};
    exact.set(word,entry);
    register(word);
    for(const [surface,kana] of japaneseInflections(word,reading,kind,stems)) {
      if(!derived.has(surface)) derived.set(surface,{reading:kana,kind});
      else if(derived.get(surface)?.reading!==kana) derived.set(surface,null);
      register(surface);
    }
  }
  return {exact,derived,longest,protectedWords};
}

let japaneseLexiconRequest;
async function loadJapaneseLexicon() {
  if(!japaneseLexiconRequest) {
    japaneseLexiconRequest=decompressTextData(japaneseLexiconPayload).then(buildJapaneseLexicon);
  }
  return japaneseLexiconRequest;
}

let japaneseOfflineLexiconRequest;
function loadJapaneseOfflineLexicon() {
  if(!japaneseOfflineLexiconRequest) {
    japaneseOfflineLexiconRequest=Promise.all([decompressTextData(japaneseOfflinePayload),decompressTextData(japaneseLexiconPayload)])
      .then(([common,general])=>buildJapaneseLexicon(common+'\n'+general.split('\n\n')[0],true));
  }
  return japaneseOfflineLexiconRequest;
}

function japaneseReferenceToken(surface,{reading,kind}) {
  const pos=kind==='adj-i'?'形容詞':kind==='v1' || kind in godanKana?'動詞':kind==='adv'?'副詞':'名詞';
  return {surface_form:surface,pronunciation:reading,pos,pos_detail_1:kind==='suf'?'接尾':''};
}

function keepsParticlePronunciation(entry,token,surface) {
  if(surface!==token.surface_form || !token.pronunciation) return true;
  const hiragana=text=>text.replace(/[\u30a1-\u30f6]/gu,letter=>String.fromCharCode(letter.charCodeAt(0)-0x60));
  const proposed=[...hiragana(entry.reading)], known=[...hiragana(token.pronunciation)];
  if(proposed.length!==known.length) return true;
  let changes=0;
  for(let index=0;index<known.length;index++) {
    if(proposed[index]===known[index])continue;
    if(proposed[index]==='は' && known[index]==='わ' || proposed[index]==='へ' && known[index]==='え')changes++;
    else return true;
  }
  return changes===0;
}

function insideJapaneseCompound(line,start,end) {
  const previous=[...line.slice(0,start)].at(-1) ?? '';
  const following=end<line.length?String.fromCodePoint(line.codePointAt(end)):'';
  return /[\p{Script=Han}\p{Script=Katakana}ー]/u.test(previous+following);
}

function referenceJapaneseCandidate(line,index,token,boundaries,lexicon,runs,unreadable,tokenStarts) {
  if(/[\p{Script=Latin}\p{N}]/u.test(line[index-1]??''))return null;
  const firstEnd=index+token.surface_form.length;
  const following=tokenStarts.get(firstEnd);
  if(token.pos_detail_1==='サ変接続' && following?.basic_form==='する')return null;
  const run=runs.get(index);
  const altersParticle=run && [...tokenStarts].some(([position,part])=>position>=index && position<index+run.length &&
    part.pos==='助詞' && ['は','へ'].includes(part.surface_form) &&
    japaneseKanaReading(part.surface_form)!==japaneseKanaReading(part.pronunciation??''));
  if(run && !altersParticle) {
    const full=lexicon.exact.get(run);
    if(full && keepsParticlePronunciation(full,token,run)) return japaneseReferenceToken(run,full);
    if(!lexicon.protectedWords.has(run) && lexicon.derived.get(run)) return japaneseReferenceToken(run,lexicon.derived.get(run));
  }
  const first=String.fromCodePoint(line.codePointAt(index));
  const length=lexicon.longest.get(first) ?? 0;
  if(!japaneseHan.test(first))return null;
  const mayNeedInflection=!token.pronunciation || token.pos==='名詞' &&
    token.pos_detail_1!=='固有名詞' && /^\p{Script=Han}+$/u.test(token.surface_form);
  const maxEnd=Math.min(index+length,line.length);
  for(let end=maxEnd;end>=firstEnd;end--) {
    const surface=line.slice(index,end);
    const entry=lexicon.exact.get(surface) ?? (mayNeedInflection?lexicon.derived.get(surface):null);
    if(!entry || !keepsParticlePronunciation(entry,token,surface))continue;
    if(surface.length===first.length && insideJapaneseCompound(line,index,end))continue;
    if([...tokenStarts].some(([position,part])=>position>index && position<end && part.pos==='助詞'))continue;
    const inflects=entry.kind==='adj-i' || entry.kind==='v1' || entry.kind in godanKana;
    const recoversUnknown=unreadable.some(position=>position>=index && position<end);
    if(!recoversUnknown && !(mayNeedInflection && inflects && /[ぁ-ゖ]$/u.test(surface) && end>firstEnd))continue;
    if(end!==line.length && !boundaries.has(end) && !inflects)continue;
    return japaneseReferenceToken(surface,entry);
  }
  return null;
}

function upstreamJapaneseCandidate(line,index,token,lookup) {
  if(!lookup || token.pronunciation || !japaneseHan.test(token.surface_form))return null;
  const run=line.slice(index).match(/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+/u)?.[0] ?? '';
  const chars=[...run].slice(0,16);
  for(let length=chars.length;length>0;length--) {
    const surface=chars.slice(0,length).join('');
    if(surface.length<token.surface_form.length)break;
    if(length===1 && insideJapaneseCompound(line,index,index+surface.length))continue;
    const reading=uniqueJapaneseReading(lookup[surface]);
    if(reading)return {surface_form:surface,dictionaryIPA:reading,pos:'名詞'};
  }
  return null;
}

function japaneseTokensWithDictionaries(line,tokenizer,lexicon,lookup) {
  const tokens=[];
  let offset=0,protectedEnd=0;
  const runs=new Map([...line.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]+/gu)].map(m=>[m.index,m[0]]));
  while(offset<line.length) {
    const base=tokenizer.tokenize(line.slice(offset));
    const boundaries=new Set();
    let cursor=offset;
    const unreadable=[],tokenStarts=new Map();
    for(const token of base) {
      const start=line.indexOf(token.surface_form,cursor);
      if(start<0)continue;
      cursor=start+token.surface_form.length;
      boundaries.add(cursor);
      tokenStarts.set(start,token);
      if(!token.pronunciation && japaneseHan.test(token.surface_form)) unreadable.push(start);
    }
    let recovered=false;
    for(const token of base) {
      const index=line.indexOf(token.surface_form,offset);
      if(index<0)continue;
      const run=runs.get(index);
      if(run && lexicon?.protectedWords.has(run)) protectedEnd=index+run.length;
      const reference=lexicon && index>=protectedEnd ? referenceJapaneseCandidate(line,index,token,boundaries,lexicon,runs,unreadable,tokenStarts) : null;
      const candidate=reference ?? upstreamJapaneseCandidate(line,index,token,lookup);
      if(candidate) {
        tokens.push(candidate);
        offset=index+candidate.surface_form.length;
        recovered=candidate.surface_form!==token.surface_form;
        if(recovered)break;
      } else {
        tokens.push(token);
        offset=index+token.surface_form.length;
      }
    }
    if(!recovered)break;
  }
  return tokens;
}

// IPA syllables attested in the pinned upstream Chinese dictionaries.
// Cantonese syllable and dictionary additions are derived from the Cantonese Pronunciation List of the Characters for Computers (Cheung Kwan Hin, Lu Qin, and the LSHK Jyutping Workgroup), CC BY 4.0.
// https://github.com/lshk-org/jyutping-table/blob/dad2dd6d6f02fc51138ecc6818f7b38eba5c2ad3/list.tsv
const chineseSyllables={"mandarin":[["a","a"],["ai","aɪ"],["an","an"],["ang","ɑŋ"],["ao","ɑʊ"],["ba","pa"],["bai","paɪ"],["ban","pan"],["bang","pɑŋ"],["bao","pɑʊ"],["bei","peɪ"],["ben","pən"],["beng","pɤŋ"],["bi","pi"],["bian","pjɛn"],["biao","pjɑʊ"],["bie","pjɛ"],["bin","pɪn"],["bing","pɪŋ"],["bo","pɔ"],["bu","pu"],["ca","tsʰa"],["cai","tsʰaɪ"],["can","tsʰan"],["cang","tsʰɑŋ"],["cao","tsʰɑʊ"],["ce","tsʰɤ"],["cen","tsʰən"],["ceng","tsʰɤŋ"],["cha","ʈʂʰa"],["chai","ʈʂʰaɪ"],["chan","ʈʂʰan"],["chang","ʈʂʰɑŋ"],["chao","ʈʂʰɑʊ"],["che","ʈʂʰɤ"],["chen","ʈʂʰən"],["cheng","ʈʂʰɤŋ"],["chi","ʈʂʰɚ"],["chong","ʈʂʰʊŋ"],["chou","ʈʂʰoʊ"],["chu","ʈʂʰu"],["chua","ʈʂʰwa"],["chuai","ʈʂʰuaɪ"],["chuan","ʈʂʰwan"],["chuang","ʈʂʰwɑŋ"],["chui","ʈʂʰweɪ"],["chun","ʈʂʰuən"],["chuo","ʈʂʰuɔ"],["ci","tsʰɯ"],["cong","tsʰʊŋ"],["cou","tsʰoʊ"],["cu","tsʰu"],["cuan","tsʰwan"],["cui","tsʰweɪ"],["cun","tsʰuən"],["cuo","tsʰuɔ"],["da","ta"],["dai","taɪ"],["dan","tan"],["dang","tɑŋ"],["dao","tɑʊ"],["de","tɤ"],["dei","teɪ"],["den","tən"],["deng","tɤŋ"],["di","ti"],["dia","tja"],["dian","tjɛn"],["diao","tjɑʊ"],["die","tjɛ"],["ding","tɪŋ"],["diu","tjoʊ"],["dong","tʊŋ"],["dou","toʊ"],["du","tu"],["duan","twan"],["dui","tweɪ"],["dun","tuən"],["duo","tuɔ"],["e","ɤ"],["ei","eɪ"],["en","ən"],["eng","ɤŋ"],["er","aɻ"],["fa","fa"],["fan","fan"],["fang","fɑŋ"],["fei","feɪ"],["fen","fən"],["feng","fɤŋ"],["fo","fɔ"],["fou","foʊ"],["fu","fu"],["ga","ka"],["gai","kaɪ"],["gan","kan"],["gang","kɑŋ"],["gao","kɑʊ"],["ge","kɤ"],["gei","keɪ"],["gen","kən"],["geng","kɤŋ"],["gong","kʊŋ"],["gou","koʊ"],["gu","ku"],["gua","kwa"],["guai","kuaɪ"],["guan","kwan"],["guang","kwɑŋ"],["gui","kweɪ"],["gun","kuən"],["guo","kuɔ"],["ha","xa"],["hai","xaɪ"],["han","xan"],["hang","xɑŋ"],["hao","xɑʊ"],["he","xɤ"],["hei","xeɪ"],["hen","xən"],["heng","xɤŋ"],["hong","xʊŋ"],["hou","xoʊ"],["hu","xu"],["hua","xwa"],["huai","xuaɪ"],["huan","xwan"],["huang","xwɑŋ"],["hui","xweɪ"],["hun","xuən"],["huo","xuɔ"],["ji","tɕi"],["jia","tɕja"],["jian","tɕjɛn"],["jiang","tɕjɑŋ"],["jiao","tɕjɑʊ"],["jie","tɕjɛ"],["jin","tɕɪn"],["jing","tɕɪŋ"],["jiong","tɕjʊŋ"],["jiu","tɕjoʊ"],["ju","tɕy"],["juan","tɕɥœn"],["jue","tɕɥœ"],["jun","tɕyn"],["ka","kʰa"],["kai","kʰaɪ"],["kan","kʰan"],["kang","kʰɑŋ"],["kao","kʰɑʊ"],["ke","kʰɤ"],["ken","kʰən"],["keng","kʰɤŋ"],["kong","kʰʊŋ"],["kou","kʰoʊ"],["ku","kʰu"],["kua","kʰwa"],["kuai","kʰuaɪ"],["kuan","kʰwan"],["kuang","kʰwɑŋ"],["kui","kʰweɪ"],["kun","kʰuən"],["kuo","kʰuɔ"],["la","la"],["lai","laɪ"],["lan","lan"],["lang","lɑŋ"],["lao","lɑʊ"],["le","lɤ"],["lei","leɪ"],["leng","lɤŋ"],["li","li"],["lia","lja"],["lian","ljɛn"],["liang","ljɑŋ"],["liao","ljɑʊ"],["lie","ljɛ"],["lin","lɪn"],["ling","lɪŋ"],["liu","ljoʊ"],["lo","lɔ"],["long","lʊŋ"],["lou","loʊ"],["lu","lu"],["lü","ly"],["luan","lwan"],["lue","lɥœ"],["lun","luən"],["luo","luɔ"],["ma","ma"],["mai","maɪ"],["man","man"],["mang","mɑŋ"],["mao","mɑʊ"],["me","mɤ"],["mei","meɪ"],["men","mən"],["meng","mɤŋ"],["mi","mi"],["mian","mjɛn"],["miao","mjɑʊ"],["mie","mjɛ"],["min","mɪn"],["ming","mɪŋ"],["miu","mjoʊ"],["mo","mɔ"],["mou","moʊ"],["mu","mu"],["na","na"],["nai","naɪ"],["nan","nan"],["nang","nɑŋ"],["nao","nɑʊ"],["ne","nɤ"],["nei","neɪ"],["nen","nən"],["neng","nɤŋ"],["ni","ni"],["nian","njɛn"],["niang","njɑŋ"],["niao","njɑʊ"],["nie","njɛ"],["nin","nɪn"],["ning","nɪŋ"],["niu","njoʊ"],["nong","nʊŋ"],["nou","noʊ"],["nu","nu"],["nü","ny"],["nuan","nwan"],["nue","nɥœ"],["nuo","nuɔ"],["o","ɔ"],["ou","oʊ"],["pa","pʰa"],["pai","pʰaɪ"],["pan","pʰan"],["pang","pʰɑŋ"],["pao","pʰɑʊ"],["pei","pʰeɪ"],["pen","pʰən"],["peng","pʰɤŋ"],["pi","pʰi"],["pian","pʰjɛn"],["piao","pʰjɑʊ"],["pie","pʰjɛ"],["pin","pʰɪn"],["ping","pʰɪŋ"],["po","pʰɔ"],["pou","pʰoʊ"],["pu","pʰu"],["qi","tɕʰi"],["qia","tɕʰja"],["qian","tɕʰjɛn"],["qiang","tɕʰjɑŋ"],["qiao","tɕʰjɑʊ"],["qie","tɕʰjɛ"],["qin","tɕʰɪn"],["qing","tɕʰɪŋ"],["qiong","tɕʰjʊŋ"],["qiu","tɕʰjoʊ"],["qu","tɕʰy"],["quan","tɕʰɥœn"],["que","tɕʰɥœ"],["qun","tɕʰyn"],["ran","ʐan"],["rang","ʐɑŋ"],["rao","ʐɑʊ"],["re","ʐɤ"],["ren","ʐən"],["reng","ʐɤŋ"],["ri","ʐɚ"],["rong","ʐʊŋ"],["rou","ʐoʊ"],["ru","ʐu"],["ruan","ʐwan"],["rui","ʐweɪ"],["run","ʐuən"],["ruo","ʐuɔ"],["sa","sa"],["sai","saɪ"],["san","san"],["sang","sɑŋ"],["sao","sɑʊ"],["se","sɤ"],["sen","sən"],["seng","sɤŋ"],["sha","ʂa"],["shai","ʂaɪ"],["shan","ʂan"],["shang","ʂɑŋ"],["shao","ʂɑʊ"],["she","ʂɤ"],["shei","ʂeɪ"],["shen","ʂən"],["sheng","ʂɤŋ"],["shi","ʂɚ"],["shou","ʂoʊ"],["shu","ʂu"],["shua","ʂwa"],["shuai","ʂuaɪ"],["shuan","ʂwan"],["shuang","ʂwɑŋ"],["shui","ʂweɪ"],["shun","ʂuən"],["shuo","ʂuɔ"],["si","sɯ"],["song","sʊŋ"],["sou","soʊ"],["su","su"],["suan","swan"],["sui","sweɪ"],["sun","suən"],["suo","suɔ"],["ta","tʰa"],["tai","tʰaɪ"],["tan","tʰan"],["tang","tʰɑŋ"],["tao","tʰɑʊ"],["te","tʰɤ"],["teng","tʰɤŋ"],["ti","tʰi"],["tian","tʰjɛn"],["tiao","tʰjɑʊ"],["tie","tʰjɛ"],["ting","tʰɪŋ"],["tong","tʰʊŋ"],["tou","tʰoʊ"],["tu","tʰu"],["tuan","tʰwan"],["tui","tʰweɪ"],["tun","tʰuən"],["tuo","tʰuɔ"],["wa","wa"],["wai","uaɪ"],["wan","wan"],["wang","wɑŋ"],["wei","weɪ"],["wen","uən"],["wo","uɔ"],["wong","ʊŋ"],["wu","u"],["xi","ɕi"],["xia","ɕja"],["xian","ɕjɛn"],["xiang","ɕjɑŋ"],["xiao","ɕjɑʊ"],["xie","ɕjɛ"],["xin","ɕɪn"],["xing","ɕɪŋ"],["xiong","ɕjʊŋ"],["xiu","ɕjoʊ"],["xu","ɕy"],["xuan","ɕɥœn"],["xue","ɕɥœ"],["xun","ɕyn"],["ya","ja"],["yai","jaɪ"],["yan","jɛn"],["yang","jɑŋ"],["yao","jɑʊ"],["ye","jɛ"],["yi","i"],["yin","ɪn"],["ying","ɪŋ"],["yo","jɔ"],["yong","jʊŋ"],["you","joʊ"],["yu","y"],["yuan","ɥœn"],["yue","ɥœ"],["yun","yn"],["za","tsa"],["zai","tsaɪ"],["zan","tsan"],["zang","tsɑŋ"],["zao","tsɑʊ"],["ze","tsɤ"],["zei","tseɪ"],["zen","tsən"],["zeng","tsɤŋ"],["zha","ʈʂa"],["zhai","ʈʂaɪ"],["zhan","ʈʂan"],["zhang","ʈʂɑŋ"],["zhao","ʈʂɑʊ"],["zhe","ʈʂɤ"],["zhei","ʈʂeɪ"],["zhen","ʈʂən"],["zheng","ʈʂɤŋ"],["zhi","ʈʂɚ"],["zhong","ʈʂʊŋ"],["zhou","ʈʂoʊ"],["zhu","ʈʂu"],["zhua","ʈʂwa"],["zhuai","ʈʂuaɪ"],["zhuan","ʈʂwan"],["zhuang","ʈʂwɑŋ"],["zhui","ʈʂweɪ"],["zhun","ʈʂuən"],["zhuo","ʈʂuɔ"],["zi","tsɯ"],["zong","tsʊŋ"],["zou","tsoʊ"],["zu","tsu"],["zuan","tswan"],["zui","tsweɪ"],["zun","tsuən"],["zuo","tsuɔ"]],"cantonese":[["aa","aː"],["aai","aːi"],["aak","aːk"],["aam","aːm"],["aan","aːn"],["aang","aːŋ"],["aap","aːp"],["aat","aːt"],["aau","aːu"],["ai","ɐi"],["ak","ɐk"],["am","ɐm"],["an","ɐn"],["ang","ɐŋ"],["ap","ɐp"],["at","ɐt"],["au","ɐu"],["baa","paː"],["baai","paːi"],["baak","paːk"],["baan","paːn"],["baang","paːŋ"],["baat","paːt"],["baau","paːu"],["bai","pɐi"],["bak","pɐk"],["bam","pɐm"],["ban","pɐn"],["bang","pɐŋ"],["bat","pɐt"],["bau","pɐu"],["be","pɛː"],["bei","pei"],["bek","pɛːk"],["beng","pɛːŋ"],["bi","piː"],["bik","pɪk"],["bin","piːn"],["bing","pɪŋ"],["bit","piːt"],["biu","piːu"],["bo","pɔː"],["bok","pɔːk"],["bong","pɔːŋ"],["bou","pou"],["bui","puːi"],["buk","pʊk"],["bun","puːn"],["bung","pʊŋ"],["but","puːt"],["caa","tsʰaː"],["caai","tsʰaːi"],["caak","tsʰaːk"],["caam","tsʰaːm"],["caan","tsʰaːn"],["caang","tsʰaːŋ"],["caap","tsʰaːp"],["caat","tsʰaːt"],["caau","tsʰaːu"],["cai","tsʰɐi"],["cak","tsʰɐk"],["cam","tsʰɐm"],["can","tsʰɐn"],["cang","tsʰɐŋ"],["cap","tsʰɐp"],["cat","tsʰɐt"],["cau","tsʰɐu"],["ce","tsʰɛː"],["cek","tsʰɛːk"],["ceng","tsʰɛːŋ"],["ceoi","tsʰɵy"],["ceon","tsʰɵn"],["ceot","tsʰɵt"],["ci","tsʰiː"],["cik","tsʰɪk"],["cim","tsʰiːm"],["cin","tsʰiːn"],["cing","tsʰɪŋ"],["cip","tsʰiːp"],["cit","tsʰiːt"],["ciu","tsʰiːu"],["co","tsʰɔː"],["coek","tsʰœːk"],["coeng","tsʰœːŋ"],["coi","tsʰɔːi"],["cok","tsʰɔːk"],["cong","tsʰɔːŋ"],["cou","tsʰou"],["cuk","tsʰʊk"],["cung","tsʰʊŋ"],["cyu","tsʰyː"],["cyun","tsʰyːn"],["cyut","tsʰyːt"],["daa","taː"],["daai","taːi"],["daak","taːk"],["daam","taːm"],["daan","taːn"],["daang","taːŋ"],["daap","taːp"],["daat","taːt"],["daau","taːu"],["dai","tɐi"],["dak","tɐk"],["dam","tɐm"],["dan","tɐn"],["dang","tɐŋ"],["dap","tɐp"],["dat","tɐt"],["dau","tɐu"],["de","tɛː"],["dei","tei"],["dek","tɛːk"],["deng","tɛːŋ"],["deoi","tɵy"],["deon","tɵn"],["deot","tɵt"],["deu","tɛːu"],["di","tiː"],["dik","tɪk"],["dim","tiːm"],["din","tiːn"],["ding","tɪŋ"],["dip","tiːp"],["dit","tiːt"],["diu","tiːu"],["do","tɔː"],["doek","tœːk"],["doeng","tœːŋ"],["doi","tɔːi"],["dok","tɔːk"],["dong","tɔːŋ"],["dou","tou"],["duk","tʊk"],["dung","tʊŋ"],["dyun","tyːn"],["dyut","tyːt"],["e","ɛː"],["ei","ei"],["faa","faː"],["faai","faːi"],["faan","faːn"],["faat","faːt"],["faau","faːu"],["fai","fɐi"],["fan","fɐn"],["fang","fɐŋ"],["fat","fɐt"],["fau","fɐu"],["fe","fɛː"],["fei","fei"],["fik","fɪk"],["fing","fɪŋ"],["fit","fiːt"],["fiu","fiːu"],["fo","fɔː"],["fok","fɔːk"],["fong","fɔːŋ"],["fu","fuː"],["fui","fuːi"],["fuk","fʊk"],["fun","fuːn"],["fung","fʊŋ"],["fut","fuːt"],["gaa","kaː"],["gaai","kaːi"],["gaak","kaːk"],["gaam","kaːm"],["gaan","kaːn"],["gaang","kaːŋ"],["gaap","kaːp"],["gaat","kaːt"],["gaau","kaːu"],["gai","kɐi"],["gak","kɐk"],["gam","kɐm"],["gan","kɐn"],["gang","kɐŋ"],["gap","kɐp"],["gat","kɐt"],["gau","kɐu"],["ge","kɛː"],["gei","kei"],["geng","kɛːŋ"],["geoi","kɵy"],["gep","kɛːp"],["geu","kɛːu"],["gi","kiː"],["gik","kɪk"],["gim","kiːm"],["gin","kiːn"],["ging","kɪŋ"],["gip","kiːp"],["git","kiːt"],["giu","kiːu"],["go","kɔː"],["goek","kœːk"],["goeng","kœːŋ"],["goi","kɔːi"],["gok","kɔːk"],["gon","kɔːn"],["gong","kɔːŋ"],["got","kɔːt"],["gou","kou"],["gu","kuː"],["gui","kuːi"],["guk","kʊk"],["gun","kuːn"],["gung","kʊŋ"],["gut","kuːt"],["gyun","kyːn"],["gyut","kyːt"],["haa","haː"],["haai","haːi"],["haak","haːk"],["haam","haːm"],["haan","haːn"],["haang","haːŋ"],["haap","haːp"],["haat","haːt"],["haau","haːu"],["hai","hɐi"],["hak","hɐk"],["ham","hɐm"],["han","hɐn"],["hang","hɐŋ"],["hap","hɐp"],["hat","hɐt"],["hau","hɐu"],["he","hɛː"],["hei","hei"],["hek","hɛːk"],["heng","hɛːŋ"],["heoi","hɵy"],["heu","hɛːu"],["hi","hiː"],["him","hiːm"],["hin","hiːn"],["hing","hɪŋ"],["hip","hiːp"],["hit","hiːt"],["hiu","hiːu"],["hng","hŋ̩"],["ho","hɔː"],["hoeng","hœːŋ"],["hoi","hɔːi"],["hok","hɔːk"],["hon","hɔːn"],["hong","hɔːŋ"],["hot","hɔːt"],["hou","hou"],["huk","hʊk"],["hung","hʊŋ"],["hyun","hyːn"],["hyut","hyːt"],["jaa","jaː"],["jaai","jaːi"],["jaak","jaːk"],["jaang","jaːŋ"],["jaap","jaːp"],["jaau","jaːu"],["jai","jɐi"],["jam","jɐm"],["jan","jɐn"],["jap","jɐp"],["jat","jɐt"],["jau","jɐu"],["je","jɛː"],["jeng","jɛːŋ"],["jeoi","jɵy"],["jeon","jɵn"],["ji","jiː"],["jik","jɪk"],["jim","jiːm"],["jin","jiːn"],["jing","jɪŋ"],["jip","jiːp"],["jit","jiːt"],["jiu","jiːu"],["jo","jɔː"],["joek","jœːk"],["joeng","jœːŋ"],["juk","jʊk"],["jung","jʊŋ"],["jyu","jyː"],["jyun","jyːn"],["jyut","jyːt"],["kaa","kʰaː"],["kaai","kʰaːi"],["kaak","kʰaːk"],["kaam","kʰaːm"],["kaan","kʰaːn"],["kaap","kʰaːp"],["kaat","kʰaːt"],["kaau","kʰaːu"],["kai","kʰɐi"],["kak","kʰɐk"],["kam","kʰɐm"],["kan","kʰɐn"],["kang","kʰɐŋ"],["kap","kʰɐp"],["kat","kʰɐt"],["kau","kʰɐu"],["ke","kʰɛː"],["kei","kʰei"],["kek","kʰɛːk"],["keoi","kʰɵy"],["keu","kʰɛːu"],["ki","kʰiː"],["kik","kʰɪk"],["kim","kʰiːm"],["kin","kʰiːn"],["king","kʰɪŋ"],["kip","kʰiːp"],["kit","kʰiːt"],["kiu","kʰiːu"],["ko","kʰɔː"],["koek","kʰœːk"],["koeng","kʰœːŋ"],["koi","kʰɔːi"],["kok","kʰɔːk"],["kong","kʰɔːŋ"],["ku","kʰuː"],["kui","kʰuːi"],["kuk","kʰʊk"],["kun","kʰuːn"],["kung","kʰʊŋ"],["kut","kʰuːt"],["kyun","kʰyːn"],["kyut","kʰyːt"],["laa","laː"],["laai","laːi"],["laak","laːk"],["laam","laːm"],["laan","laːn"],["laang","laːŋ"],["laap","laːp"],["laat","laːt"],["laau","laːu"],["lai","lɐi"],["lak","lɐk"],["lam","lɐm"],["lan","lɐn"],["lang","lɐŋ"],["lap","lɐp"],["lat","lɐt"],["lau","lɐu"],["le","lɛː"],["lei","lei"],["lek","lɛːk"],["lem","lɛːm"],["leng","lɛːŋ"],["leoi","lɵy"],["leon","lɵn"],["leot","lɵt"],["li","liː"],["lik","lɪk"],["lim","liːm"],["lin","liːn"],["ling","lɪŋ"],["lip","liːp"],["lit","liːt"],["liu","liːu"],["lo","lɔː"],["loek","lœːk"],["loeng","lœːŋ"],["loi","lɔːi"],["lok","lɔːk"],["long","lɔːŋ"],["lou","lou"],["luk","lʊk"],["lung","lʊŋ"],["lyun","lyːn"],["lyut","lyːt"],["maa","maː"],["maai","maːi"],["maak","maːk"],["maan","maːn"],["maang","maːŋ"],["maat","maːt"],["maau","maːu"],["mai","mɐi"],["mak","mɐk"],["mam","mɐm"],["man","mɐn"],["mang","mɐŋ"],["mat","mɐt"],["mau","mɐu"],["me","mɛː"],["mei","mei"],["meng","mɛːŋ"],["mi","miː"],["mik","mɪk"],["min","miːn"],["ming","mɪŋ"],["mit","miːt"],["miu","miːu"],["mo","mɔː"],["mok","mɔːk"],["mong","mɔːŋ"],["mou","mou"],["mui","muːi"],["muk","mʊk"],["mun","muːn"],["mung","mʊŋ"],["mut","muːt"],["naa","naː"],["naai","naːi"],["naam","naːm"],["naan","naːn"],["naang","naːŋ"],["naap","naːp"],["naat","naːt"],["naau","naːu"],["nai","nɐi"],["nam","nɐm"],["nan","nɐn"],["nang","nɐŋ"],["nap","nɐp"],["nat","nɐt"],["nau","nɐu"],["ne","nɛː"],["nei","nei"],["neng","nɛːŋ"],["neoi","nɵy"],["neot","nɵt"],["m","m̩"],["ng","ŋ̩"],["ngaa","ŋaː"],["ngaai","ŋaːi"],["ngaak","ŋaːk"],["ngaam","ŋaːm"],["ngaan","ŋaːn"],["ngaang","ŋaːŋ"],["ngaap","ŋaːp"],["ngaat","ŋaːt"],["ngaau","ŋaːu"],["ngai","ŋɐi"],["ngak","ŋɐk"],["ngam","ŋɐm"],["ngan","ŋɐn"],["ngang","ŋɐŋ"],["ngap","ŋɐp"],["ngat","ŋɐt"],["ngau","ŋɐu"],["nge","ŋɛː"],["ngi","ŋiː"],["ngit","ŋiːt"],["ngo","ŋɔː"],["ngoi","ŋɔːi"],["ngok","ŋɔːk"],["ngon","ŋɔːn"],["ngong","ŋɔːŋ"],["ngou","ŋou"],["nguk","ŋʊk"],["ngung","ŋʊŋ"],["ni","niː"],["nik","nɪk"],["nim","niːm"],["nin","niːn"],["ning","nɪŋ"],["nip","niːp"],["nit","niːt"],["niu","niːu"],["no","nɔː"],["noeng","nœːŋ"],["noi","nɔːi"],["nok","nɔːk"],["nong","nɔːŋ"],["nou","nou"],["nuk","nʊk"],["nung","nʊŋ"],["nyun","nyːn"],["o","ɔː"],["oi","ɔːi"],["ok","ɔːk"],["on","ɔːn"],["ong","ɔːŋ"],["ou","ou"],["paa","pʰaː"],["paai","pʰaːi"],["paak","pʰaːk"],["paan","pʰaːn"],["paang","pʰaːŋ"],["paau","pʰaːu"],["pai","pʰɐi"],["pak","pʰɐk"],["pan","pʰɐn"],["pang","pʰɐŋ"],["pat","pʰɐt"],["pau","pʰɐu"],["pe","pʰɛː"],["pei","pʰei"],["pek","pʰɛːk"],["peng","pʰɛːŋ"],["pet","pʰɛːt"],["pik","pʰɪk"],["pin","pʰiːn"],["ping","pʰɪŋ"],["pit","pʰiːt"],["piu","pʰiːu"],["po","pʰɔː"],["pok","pʰɔːk"],["pong","pʰɔːŋ"],["pou","pʰou"],["pui","pʰuːi"],["puk","pʰʊk"],["pun","pʰuːn"],["pung","pʰʊŋ"],["put","pʰuːt"],["saa","saː"],["saai","saːi"],["saak","saːk"],["saam","saːm"],["saan","saːn"],["saang","saːŋ"],["saap","saːp"],["saat","saːt"],["saau","saːu"],["sai","sɐi"],["sak","sɐk"],["sam","sɐm"],["san","sɐn"],["sang","sɐŋ"],["sap","sɐp"],["sat","sɐt"],["sau","sɐu"],["se","sɛː"],["sei","sei"],["sek","sɛːk"],["seng","sɛːŋ"],["seoi","sɵy"],["seon","sɵn"],["seot","sɵt"],["seu","sɛːu"],["si","siː"],["sik","sɪk"],["sim","siːm"],["sin","siːn"],["sing","sɪŋ"],["sip","siːp"],["sit","siːt"],["siu","siːu"],["so","sɔː"],["soek","sœːk"],["soeng","sœːŋ"],["soi","sɔːi"],["sok","sɔːk"],["song","sɔːŋ"],["sou","sou"],["suk","sʊk"],["sung","sʊŋ"],["syu","syː"],["syun","syːn"],["syut","syːt"],["taa","tʰaː"],["taai","tʰaːi"],["taam","tʰaːm"],["taan","tʰaːn"],["taang","tʰaːŋ"],["taap","tʰaːp"],["taat","tʰaːt"],["taau","tʰaːu"],["tai","tʰɐi"],["tam","tʰɐm"],["tan","tʰɐn"],["tang","tʰɐŋ"],["tap","tʰɐp"],["tat","tʰɐt"],["tau","tʰɐu"],["tek","tʰɛːk"],["teng","tʰɛːŋ"],["teoi","tʰɵy"],["teon","tʰɵn"],["teu","tʰɛːu"],["ti","tʰiː"],["tik","tʰɪk"],["tim","tʰiːm"],["tin","tʰiːn"],["ting","tʰɪŋ"],["tip","tʰiːp"],["tit","tʰiːt"],["tiu","tʰiːu"],["to","tʰɔː"],["toi","tʰɔːi"],["tok","tʰɔːk"],["tong","tʰɔːŋ"],["tou","tʰou"],["tuk","tʰʊk"],["tung","tʰʊŋ"],["tyun","tʰyːn"],["tyut","tʰyːt"],["uk","ʊk"],["ung","ʊŋ"],["waa","waː"],["waai","waːi"],["waak","waːk"],["waan","waːn"],["waang","waːŋ"],["waat","waːt"],["wai","wɐi"],["wak","wɐk"],["wan","wɐn"],["wang","wɐŋ"],["wat","wɐt"],["we","wɛː"],["wen","wɛːn"],["wet","wɛːt"],["wi","wiː"],["wik","wɪk"],["wing","wɪŋ"],["wo","wɔː"],["wok","wɔːk"],["wong","wɔːŋ"],["wu","wuː"],["wui","wuːi"],["wun","wuːn"],["wut","wuːt"],["zaa","tsaː"],["zaai","tsaːi"],["zaak","tsaːk"],["zaam","tsaːm"],["zaan","tsaːn"],["zaang","tsaːŋ"],["zaap","tsaːp"],["zaat","tsaːt"],["zaau","tsaːu"],["zai","tsɐi"],["zak","tsɐk"],["zam","tsɐm"],["zan","tsɐn"],["zang","tsɐŋ"],["zap","tsɐp"],["zat","tsɐt"],["zau","tsɐu"],["ze","tsɛː"],["zek","tsɛːk"],["zeng","tsɛːŋ"],["zeoi","tsɵy"],["zeon","tsɵn"],["zeot","tsɵt"],["zi","tsiː"],["zik","tsɪk"],["zim","tsiːm"],["zin","tsiːn"],["zing","tsɪŋ"],["zip","tsiːp"],["zit","tsiːt"],["ziu","tsiːu"],["zo","tsɔː"],["zoek","tsœːk"],["zoeng","tsœːŋ"],["zoi","tsɔːi"],["zok","tsɔːk"],["zong","tsɔːŋ"],["zou","tsou"],["zuk","tsʊk"],["zung","tsʊŋ"],["zyu","tsyː"],["zyun","tsyːn"],["zyut","tsyːt"],["gwaa","kwaː"],["gwaai","kwaːi"],["gwaak","kwaːk"],["gwaan","kwaːn"],["gwaang","kwaːŋ"],["gwaat","kwaːt"],["gwai","kwɐi"],["gwan","kwɐn"],["gwang","kwɐŋ"],["gwat","kwɐt"],["gwe","kwɛː"],["gwi","kwiː"],["gwik","kwɪk"],["gwing","kwɪŋ"],["gwit","kwiːt"],["gwo","kwɔː"],["gwok","kwɔːk"],["gwong","kwɔːŋ"],["gwu","kwuː"],["gwui","kwuːi"],["gwun","kwuːn"],["gwut","kwuːt"],["kwaa","kʰwaː"],["kwaai","kʰwaːi"],["kwaak","kʰwaːk"],["kwaang","kʰwaːŋ"],["kwai","kʰwɐi"],["kwan","kʰwɐn"],["kwang","kʰwɐŋ"],["kwik","kʰwɪk"],["kwok","kʰwɔːk"],["kwong","kʰwɔːŋ"],["kwu","kʰwuː"],["kwui","kʰwuːi"],["kwut","kʰwuːt"],["ngot","ŋɔːt"],["ot","ɔːt"],["zep","tsɛːp"],["hoe","hœː"],["paat","pʰaːt"],["doe","tœː"],["soe","sœː"],["loe","lœː"],["nak","nɐk"],["goe","kœː"],["leu","lɛːu"],["zoet","tsœːt"],["it","iːt"],["kon","kʰɔːn"],["teot","tʰɵt"],["noek","nœːk"],["ngei","ŋei"],["hik","hɪk"],["koe","kʰœː"],["ngm","ŋm̩"],["hm","hm̩"],["toe","tʰœː"],["zoe","tsœː"],["kep","kʰɛːp"],["gum","kom"],["dut","tuːt"],["a","ɐ"],["ga","kɐ"],["oet","œːt"],["goet","kœːt"],["coet","tsʰœːt"],["bap","pɐp"]]};
const officialCheckedCantoneseTones={"mak":"2","zoet":"2","dak":"2","cyut":"24","aap":"2","ngaap":"2","gap":"2","zoek":"2","hok":"2","luk":"2","ngok":"2","ok":"2","ngaak":"2","aak":"2","sik":"2","gok":"24","zaap":"2","wok":"2","zok":"2","laat":"2","jat":"2","jik":"2","caak":"2","mat":"2","dip":"2","seot":"2","naap":"2","laap":"2","fuk":"2","juk":"2","saat":"2","lok":"2","jip":"2","got":"2","bok":"2","joek":"2","goek":"2","mok":"2","zyut":"2","dek":"2","hap":"2","zik":"2","sek":"2","zaat":"2","waak":"2","loek":"2","baak":"2","jit":"2","duk":"2","leot":"2","waat":"2","baat":"2","gwaat":"2","caat":"2","paak":"24","gut":"24","gwut":"24","taap":"2","gaap":"2","gip":"2","zat":"2","zaak":"2","haak":"2","cek":"2","guk":"2","tip":"2","zit":"2","tok":"2","zip":"2","aat":"2","ngaat":"2","but":"2","caap":"2","jyut":"2","mut":"2","pok":"2","wat":"2","gaak":"2","faat":"2","oet":"4","goet":"42","coet":"2","bap":"4"};

// Vietnamese syllables compiled from the pinned Northern IPA-Translator dictionary.
const vietnameseSyllables=[["hoa","hwa",2],["tư","tɯ",1],["như","ɲɯ",2],["đông","doŋ͡m",1],["ca","ka",1],["tinh","tiŋ",1],["ăn","ăn",null],["măt","măt",1],["ban","ban",1],["co","kɔ",1],["gia","za",2],["thanh","tʰɛŋ",2],["ba","ba",1],["đâu","dɤ̆w",1],["công","koŋ͡m",1],["hoc","hɔk͡p",1],["đô","do",1],["con","kɔn",1],["tiên","tiən",2],["bao","baw",1],["đai","daj",1],["chi","ci",2],["binh","biŋ",1],["cô","ko",1],["la","la",1],["tai","taj",1],["ma","ma",1],["thê","tʰe",2],["đa","da",1],["thân","tʰɤ̆n",2],["bô","bo",1],["nươc","nɯək",2],["nha","ɲa",2],["chu","cu",2],["nhân","ɲɤ̆n",2],["phu","fu",2],["quân","kwɤ̆n",2],["canh","kɛŋ",1],["thương","tʰɯəŋ",3],["thi","tʰi",2],["không","xoŋ͡m",2],["thu","tʰu",2],["câu","kɤ̆w",1],["bo","bɔ",1],["xa","sa",1],["vi","vi",1],["long","lɔŋ͡m",1],["noi","nɔj",1],["quan","kwan",2],["phân","fɤ̆n",2],["tay","tăj",1],["tân","tɤ̆n",1],["trung","cuŋ͡m",2],["hôi","hoj",1],["phong","fɔŋ͡m",2],["sinh","siŋ",1],["cao","kaw",1],["sư","sɯ",1],["ki","ki",1],["ra","za",1],["đương","dɯəŋ",2],["an","an",0],["môt","mot",1],["đinh","diŋ",1],["chân","cɤ̆n",2],["cơ","kɤ",1],["đôi","doj",1],["đao","daw",1],["cung","kuŋ͡m",1],["trương","cɯəŋ",3],["nghia","ŋiə",3],["lam","lam",1],["li","li",1],["tâm","tɤ̆m",1],["tương","tɯəŋ",2],["dân","zɤ̆n",1],["da","za",1],["ngươi","ŋɯəj",3],["nôi","noj",1],["điên","diən",2],["biên","biən",2],["hai","haj",1],["âm","ɤ̆m",0],["văn","văn",1],["qua","kwa",2],["thuy","tʰwi",3],["thuy","tʰuj",3],["ao","aw",0],["cai","kaj",1],["lai","laj",1],["thiên","tʰiən",3],["đi","di",1],["ha","ha",1],["sơn","sɤn",1],["may","măj",1],["quang","kwaŋ",2],["hô","ho",1],["đê","de",1],["giao","zaw",2],["kinh","kiŋ",1],["dai","zaj",1],["khi","xi",2],["ta","ta",1],["tri","ci",2],["viên","viən",2],["vô","vo",1],["cho","cɔ",2],["vu","vu",1],["bi","bi",1],["cu","ku",1],["sô","so",1],["chay","căj",2],["băng","băŋ",1],["kê","ke",1],["lê","le",1],["tiêu","tiəw",2],["câm","kɤ̆m",1],["tô","to",1],["đanh","dɛŋ",1],["vang","vaŋ",1],["hương","hɯəŋ",2],["chinh","ciŋ",2],["dâu","zɤ̆w",1],["thưc","tʰɯk",2],["vân","vɤ̆n",1],["ga","ɣa",1],["thư","tʰɯ",2],["đia","diə",1],["năm","năm",1],["sông","soŋ͡m",1],["bât","bɤ̆t",1],["đan","dan",1],["lô","lo",1],["ông","oŋ͡m",0],["hinh","hiŋ",1],["đen","dɛn",1],["miêng","miəŋ",2],["trân","cɤ̆n",2],["gio","zɔ",2],["đo","dɔ",1],["cân","kɤ̆n",1],["chuyên","cwiən",4],["chăng","căŋ",2],["chêt","cet",2],["y","i",0],["bong","bɔŋ͡m",1],["trơi","cɤj",2],["tôi","toj",1],["năng","năŋ",1],["lương","lɯəŋ",2],["mai","maj",1],["cây","kɤ̆j",1],["bai","baj",1],["quy","kwi",2],["ti","ti",1],["a","a",0],["minh","miŋ",1],["sơ","sɤ",1],["cơm","kɤm",1],["phuc","fuk͡p",2],["nguyên","ŋwiən",4],["tông","toŋ͡m",1],["tu","tu",1],["dương","zɯəŋ",2],["thông","tʰoŋ͡m",2],["di","zi",1],["nhât","ɲɤ̆t",2],["tê","te",1],["mang","maŋ",1],["tam","tam",1],["trong","cɔŋ͡m",2],["lao","law",1],["banh","bɛŋ",1],["phai","faj",2],["xuân","swɤ̆n",2],["cưa","kɯə",1],["đoan","dwan",2],["bach","bɛk",1],["lanh","lɛŋ",1],["cam","kam",1],["điêu","diəw",2],["hâu","hɤ̆w",1],["trang","caŋ",2],["cua","kuə",1],["hanh","hɛŋ",1],["quôc","kwok͡p",2],["lơi","lɤj",1],["bac","bak",1],["đăng","dăŋ",1],["mơ","mɤ",1],["hang","haŋ",1],["phi","fi",2],["dây","zɤ̆j",1],["vơ","vɤ",1],["chung","cuŋ͡m",2],["san","san",1],["đât","dɤ̆t",1],["ngoai","ŋwaj",3],["thai","tʰaj",2],["sang","saŋ",1],["vât","vɤ̆t",1],["châu","cɤ̆w",2],["mât","mɤ̆t",1],["mô","mo",1],["thăng","tʰăŋ",2],["thơ","tʰɤ",2],["xe","sɛ",1],["bat","bat",1],["mau","măw",1],["anh","ɛŋ",0],["danh","zɛŋ",1],["dung","zuŋ͡m",1],["cha","ca",2],["chiêu","ciəw",3],["đơi","dɤj",1],["lưa","lɯə",1],["tây","tɤ̆j",1],["sao","saw",1],["bay","băj",1],["cư","kɯ",1],["bê","be",1],["chông","coŋ͡m",2],["hoang","hwaŋ",2],["ngay","ŋăj",2],["tan","tan",1],["đôc","dok͡p",1],["nghi","ŋi",3],["vong","vɔŋ͡m",1],["vinh","viŋ",1],["hiên","hiən",2],["kim","kim",1],["bông","boŋ͡m",1],["lông","loŋ͡m",1],["ngu","ŋu",2],["trông","coŋ͡m",2],["vo","vɔ",1],["xương","sɯəŋ",2],["trai","caj",2],["giai","zaj",2],["lang","laŋ",1],["nao","naw",1],["cưu","kɯw",1],["hiêu","hiəw",2],["tơ","tɤ",1],["trăng","căŋ",2],["chê","ce",2],["chiên","ciən",3],["gian","zan",2],["si","si",1],["tich","tik",1],["kiên","kiən",2],["hôn","hon",1],["ngư","ŋɯ",2],["hông","hoŋ͡m",1],["chư","cɯ",2],["linh","liŋ",1],["ô","o",0],["tra","ca",2],["ai","aj",0],["ky","ki",1],["mui","muj",1],["chưng","cɯŋ",2],["phương","fɯəŋ",3],["cươi","kɯəj",2],["thâm","tʰɤ̆m",2],["thuôc","tʰuək",3],["chơ","cɤ",2],["han","han",1],["van","van",1],["biêt","biət",2],["can","kan",1],["song","sɔŋ͡m",1],["bung","buŋ͡m",1],["bôi","boj",1],["khoa","xwa",3],["nhi","ɲi",2],["tang","taŋ",1],["thơi","tʰɤj",2],["khô","xo",2],["me","mɛ",1],["phat","fat",2],["lâm","lɤ̆m",1],["qui","kwi",2],["ân","ɤ̆n",0],["hơp","hɤp",1],["xi","si",1],["băt","băt",1],["thây","tʰɤ̆j",2],["nam","nam",1],["pha","fa",2],["vê","ve",1],["be","bɛ",1],["lo","lɔ",1],["nga","ŋa",2],["thât","tʰɤ̆t",2],["hưu","hɯw",1],["lơ","lɤ",1],["lưc","lɯk",1],["căn","kăn",1],["đây","dɤ̆j",1],["săc","săk",1],["cach","kɛk",1],["chim","cim",2],["chua","cuə",2],["gai","ɣaj",1],["giang","zaŋ",2],["manh","mɛŋ",1],["mua","muə",1],["trơ","cɤ",2],["giây","zɤ̆j",2],["toan","twan",2],["lâp","lɤ̆p",1],["sa","sa",1],["sâu","sɤ̆w",1],["vai","vaj",1],["hat","hat",1],["rông","zoŋ͡m",1],["tin","tin",1],["mưa","mɯə",1],["côt","kot",1],["đang","daŋ",1],["nơ","nɤ",1],["vao","vaw",1],["chưa","cɯə",2],["ke","kɛ",1],["ngưa","ŋɯə",2],["đên","den",1],["ơ","ɤ",0],["trinh","ciŋ",2],["liêu","liəw",2],["non","nɔn",1],["phan","fan",2],["hơi","hɤj",1],["lac","lak",1],["mo","mɔ",1],["dư","zɯ",1],["môi","moj",1],["mi","mi",1],["tranh","cɛŋ",2],["tung","tuŋ͡m",1],["tuyên","twiən",3],["gan","ɣan",1],["liên","liən",2],["mu","mu",1],["ruôt","zuət",2],["lân","lɤ̆n",1],["nư","nɯ",1],["dao","zaw",1],["xanh","sɛŋ",1],["cương","kɯəŋ",2],["diên","ziən",2],["kho","xɔ",2],["luc","luk͡p",1],["ly","li",1],["nưa","nɯə",1],["thach","tʰɛk",2],["du","zu",1],["hao","haw",1],["tao","taw",1],["va","va",1],["yêu","iəw",1],["man","man",1],["hung","huŋ͡m",1],["luân","lwɤ̆n",2],["nông","noŋ͡m",1],["tiêng","tiəŋ",2],["thao","tʰaw",2],["thuân","tʰwɤ̆n",3],["phap","fap",2],["điêm","diəm",2],["lơn","lɤn",1],["lôi","loj",1],["lăng","lăŋ",1],["lưu","lɯw",1],["nhơ","ɲɤ",2],["hêt","het",1],["lưng","lɯŋ",1],["mây","mɤ̆j",1],["xuât","swɤ̆t",2],["buôn","buən",2],["cay","kăj",1],["lâu","lɤ̆w",1],["tuc","tuk͡p",1],["thô","tʰo",2],["ve","vɛ",1],["bơ","bɤ",1],["che","cɛ",2],["hoan","hwan",2],["băc","băk",1],["bên","ben",1],["bênh","beŋ",1],["câp","kɤ̆p",1],["chât","cɤ̆t",2],["đơn","dɤn",1],["đươc","dɯək",2],["khai","xaj",2],["sach","sɛk",1],["thiêu","tʰiəw",3],["hưng","hɯŋ",1],["măc","măk",1],["le","lɛ",1],["nghiêp","ŋiəp",4],["trâu","cɤ̆w",2],["chao","caw",2],["nghê","ŋe",3],["tiêt","tiət",2],["tôn","ton",1],["giơi","zɤj",2],["lây","lɤ̆j",1],["mat","mat",1],["tham","tʰam",2],["uy","wi",1],["uy","uj",1],["dich","zik",1],["khôn","xon",2],["ngôi","ŋoj",2],["tha","tʰa",2],["đuôi","duəj",2],["giam","zam",2],["khâu","xɤ̆w",2],["thang","tʰaŋ",2],["toa","twa",2],["tôc","tok͡p",1],["quê","kwe",2],["răng","zăŋ",1],["vương","vɯəŋ",2],["dơ","zɤ",1],["ham","ham",1],["hơn","hɤn",1],["kêt","ket",1],["tâp","tɤ̆p",1],["tho","tʰɔ",2],["đăc","dăk",1],["ngâm","ŋɤ̆m",2],["tac","tak",1],["truyên","cwiən",4],["cat","kat",1],["mươi","mɯəj",2],["rau","zăw",1],["thưa","tʰɯə",2],["tuy","twi",2],["tuy","tuj",2],["đam","dam",1],["mâu","mɤ̆w",1],["ninh","niŋ",1],["tau","tăw",1],["bang","baŋ",1],["châm","cɤ̆m",2],["lên","len",null],["ngon","ŋɔn",2],["hay","hăj",1],["sung","suŋ͡m",1],["đong","dɔŋ͡m",1],["no","nɔ",1],["ưng","ɯŋ",0],["bưa","bɯə",1],["kich","kik",1],["loan","lwan",2],["u","u",0],["đưc","dɯk",1],["hê","he",1],["mong","mɔŋ͡m",1],["ngoc","ŋɔk͡p",2],["rôi","zoj",1],["thinh","tʰiŋ",2],["triêu","ciəw",3],["đâm","dɤ̆m",1],["mông","moŋ͡m",1],["nho","ɲɔ",2],["sưc","sɯk",1],["sat","sat",1],["mê","me",1],["nhâp","ɲɤ̆p",2],["nhe","ɲɛ",2],["nhiêt","ɲiət",3],["to","tɔ",1],["tru","cu",2],["duyên","zwiən",null],["đưng","dɯŋ",1],["ngang","ŋaŋ",2],["toc","tɔk͡p",1],["kiêm","kiəm",2],["but","but",1],["dê","ze",1],["gây","ɣɤ̆j",1],["giơ","zɤ",2],["lôc","lok͡p",1],["ngôn","ŋon",2],["huyêt","hwiət",3],["ngô","ŋo",2],["vây","vɤ̆j",1],["ac","ak",0],["đoi","dɔj",1],["lươi","lɯəj",2],["mach","mɛk",1],["chiu","ciw",2],["day","zăj",1],["dâm","zɤ̆m",1],["gao","ɣaw",1],["gi","ɣi",1],["rao","zaw",1],["tăng","tăŋ",1],["thit","tʰit",2],["cưc","kɯk",1],["nên","nen",1],["thâp","tʰɤ̆p",2],["tôt","tot",1],["chin","cin",2],["nô","no",1],["pho","fɔ",2],["cuc","kuk͡p",1],["đon","dɔn",1],["nay","năj",1],["nat","nat",1],["tre","cɛ",2],["voi","vɔj",1],["măng","măŋ",1],["rê","ze",1],["sai","saj",1],["đe","dɛ",1],["nong","nɔŋ͡m",1],["phao","faw",2],["sau","săw",1],["xac","sak",1],["bây","bɤ̆j",1],["chia","ciə",2],["môm","mom",1],["tiêp","tiəp",2],["viêt","viət",2],["vung","vuŋ͡m",1],["bân","bɤ̆n",1],["bâu","bɤ̆w",1],["coc","kɔk͡p",1],["ho","hɔ",1],["nhiêm","ɲiəm",3],["phâm","fɤ̆m",2],["thiêt","tʰiət",3],["trưng","cɯŋ",2],["môn","mon",1],["thung","tʰuŋ͡m",2],["tuân","twɤ̆n",2],["bôn","bon",1],["bui","buj",1],["chanh","cɛŋ",2],["khach","xɛk",2],["lua","luə",1],["muôn","muən",2],["sưa","sɯə",1],["tuyêt","twiət",3],["căt","kăt",1],["nhac","ɲak",2],["nhan","ɲan",2],["ong","ɔŋ͡m",0],["răn","zăn",1],["sương","sɯəŋ",2],["đơ","dɤ",1],["lênh","leŋ",1],["nhau","ɲăw",2],["oan","wan",1],["dong","zɔŋ͡m",1],["muc","muk͡p",1],["ngân","ŋɤ̆n",2],["nhay","ɲăj",2],["chương","cɯəŋ",3],["dưa","zɯə",1],["đua","duə",1],["giac","zak",2],["moc","mɔk͡p",1],["môc","mok͡p",1],["nghe","ŋɛ",3],["quai","kwaj",2],["truc","cuk͡p",2],["ươc","ɯək",1],["dang","zaŋ",1],["đau","dăw",1],["khang","xaŋ",2],["lu","lu",1],["muôi","muəj",2],["siêu","siəw",null],["than","tʰan",2],["chăn","căn",2],["huyên","hwiən",3],["khoai","xwaj",3],["phô","fo",2],["bu","bu",1],["chiêng","ciəŋ",3],["coi","kɔj",1],["mơi","mɤj",1],["pham","fam",2],["phât","fɤ̆t",2],["chưc","cɯk",2],["cui","kuj",1],["hong","hɔŋ͡m",1],["khoan","xwan",3],["rưng","zɯŋ",1],["ap","ap",0],["lôn","lon",1],["thôi","tʰoj",2],["gôi","ɣoj",1],["hi","hi",1],["hư","hɯ",1],["khuc","xuk͡p",2],["mon","mɔn",1],["nê","ne",1],["nghiêm","ŋiəm",4],["ri","zi",1],["thuyên","tʰwiən",4],["xao","saw",1],["gô","ɣo",1],["hiêp","hiəp",2],["kiêu","kiəw",2],["mưc","mɯk",1],["ngo","ŋɔ",2],["tăm","tăm",1],["duc","zuk͡p",1],["goc","ɣɔk͡p",1],["niên","niən",2],["phê","fe",2],["rô","zo",1],["se","sɛ",1],["tia","tiə",1],["vưa","vɯə",1],["chơi","cɤj",2],["đêm","dem",1],["na","na",1],["ngăn","ŋăn",2],["nhiêu","ɲiəw",3],["tât","tɤ̆t",1],["trư","cɯ",2],["trươc","cɯək",3],["hoi","hɔj",1],["i","i",0],["nan","nan",1],["quen","kwɛn",2],["thuât","tʰwɤ̆t",3],["bâm","bɤ̆m",1],["cang","kaŋ",1],["côi","koj",1],["đôn","don",1],["gân","ɣɤ̆n",1],["luât","lwɤ̆t",2],["lung","luŋ͡m",1],["luy","lwi",2],["luy","luj",2],["phiên","fiən",3],["thuyêt","tʰwiət",4],["xâu","sɤ̆w",1],["xư","sɯ",1],["bôc","bok͡p",1],["cau","kăw",1],["đuc","duk͡p",1],["khơi","xɤj",2],["khu","xu",2],["lan","lan",1],["quynh","kwiŋ",2],["suy","swi",2],["trưc","cɯk",2],["văng","văŋ",1],["đôt","dot",1],["giong","zɔŋ͡m",2],["giư","zɯ",2],["mao","maw",1],["nhơn","ɲɤn",2],["ru","zu",1],["trach","cɛk",2],["tron","cɔn",2],["vơi","vɤj",1],["châp","cɤ̆p",2],["chuôt","cuət",3],["cong","kɔŋ͡m",1],["đăt","dăt",1],["găp","ɣăp",1],["lui","luj",1],["ngai","ŋaj",2],["nguyêt","ŋwiət",4],["re","zɛ",1],["tro","cɔ",2],["tui","tuj",1],["bua","buə",1],["chuôi","cuəj",3],["lăn","lăn",1],["mưu","mɯw",1],["tên","ten",null],["vay","văj",1],["vui","vuj",1],["chen","cɛn",2],["côc","kok͡p",1],["gay","ɣăj",1],["in","in",0],["lich","lik",1],["nhăn","ɲăn",2],["cât","kɤ̆t",1],["cuôc","kuək",2],["duy","zwi",null],["e","ɛ",0],["gac","ɣak",1],["loai","lwaj",2],["nhao","ɲaw",2],["rơ","zɤ",1],["tong","tɔŋ͡m",1],["tơi","tɤj",1],["biêu","biəw",2],["chiêm","ciəm",3],["ê","e",0],["giông","zoŋ͡m",2],["khăn","xăn",2],["khê","xe",2],["lư","lɯ",1],["my","mi",1],["ni","ni",1],["quay","kwăj",2],["râu","zɤ̆w",1],["sưng","sɯŋ",1],["tăc","tăk",1],["tim","tim",1],["bon","bɔn",1],["bôt","bot",1],["chôi","coj",2],["dan","zan",1],["dôi","zoj",1],["ngan","ŋan",2],["săt","săt",1],["bươc","bɯək",2],["căm","kăm",1],["căp","kăp",1],["hiêm","hiəm",2],["hoai","hwaj",2],["lăm","lăm",1],["mac","mak",1],["ôn","on",0],["quanh","kwɛŋ",2],["rươu","zɯəw",2],["sâm","sɤ̆m",1],["thâu","tʰɤ̆w",2],["tôm","tom",1],["bop","bɔp",1],["đu","du",1],["kha","xa",2],["khăc","xăk",2],["sanh","sɛŋ",1],["giap","zap",2],["huy","hwi",2],["huy","huj",2],["mâm","mɤ̆m",1],["ngơ","ŋɤ",2],["nhiên","ɲiən",3],["nui","nuj",1],["ôm","om",0],["phep","fɛp",2],["âu","ɤ̆w",0],["ghe","ɣɛ",2],["khao","xaw",2],["khoang","xwaŋ",3],["mênh","meŋ",1],["rang","zaŋ",1],["te","tɛ",1],["xo","sɔ",1],["bơi","bɤj",1],["cưng","kɯŋ",1],["giay","zăj",2],["kem","kɛm",1],["khinh","xiŋ",2],["ngươc","ŋɯək",3],["ơn","ɤn",0],["ruông","zuəŋ",2],["tiêm","tiəm",2],["tươi","tɯəj",2],["diêu","ziəw",2],["dưng","zɯŋ",1],["hâm","hɤ̆m",1],["lay","lăj",1],["liêt","liət",2],["trâm","cɤ̆m",2],["trên","cen",2],["tuôi","tuəj",2],["viêc","viək",2],["chai","caj",2],["chôn","con",2],["khanh","xɛŋ",2],["miên","miən",2],["nang","naŋ",1],["nhăng","ɲăŋ",2],["phung","fuŋ͡m",2],["sôt","sot",1],["tap","tap",1],["thuc","tʰuk͡p",2],["trôi","coj",2],["xu","su",1],["đich","dik",1],["đưa","dɯə",1],["em","ɛm",0],["luyên","lwiən",3],["ôc","ok͡p",0],["rut","zut",1],["son","sɔn",1],["đap","dap",1],["it","it",0],["ken","kɛn",1],["khoi","xɔj",2],["ngot","ŋɔt",2],["noc","nɔk͡p",1],["ro","zɔ",1],["rơi","zɤj",1],["vươn","vɯən",2],["buông","buəŋ",2],["căng","kăŋ",1],["dinh","ziŋ",1],["gach","ɣɛk",1],["nhat","ɲat",2],["nhung","ɲuŋ͡m",2],["phôi","foj",2],["rung","zuŋ͡m",1],["so","sɔ",1],["thich","tʰik",2],["thoai","tʰwaj",3],["vôi","voj",1],["đung","duŋ͡m",1],["hen","hɛn",1],["khôi","xoj",2],["quat","kwat",2],["soi","sɔj",1],["thuê","tʰwe",3],["trao","caw",2],["xuông","suəŋ",2],["ây","ɤ̆j",0],["chuông","cuəŋ",3],["đay","dăj",1],["giâu","zɤ̆w",2],["hôt","hot",1],["nâu","nɤ̆w",1],["nghich","ŋik",3],["nhai","ɲaj",2],["rach","zɛk",1],["râm","zɤ̆m",1],["tưc","tɯk",1],["vit","vit",1],["xê","se",1],["xich","sik",1],["xơ","sɤ",1],["xưng","sɯŋ",1],["bun","bun",1],["com","kɔm",1],["cuông","kuəŋ",2],["de","zɛ",1],["goi","ɣɔj",1],["hơ","hɤ",1],["măm","măm",1],["moi","mɔj",1],["nhu","ɲu",2],["sân","sɤ̆n",1],["ư","ɯ",0],["vach","vɛk",1],["văt","văt",1],["xoa","swa",2],["ben","bɛn",1],["bom","bɔm",1],["cham","cam",2],["chan","can",2],["he","hɛ",1],["nai","naj",1],["nhanh","ɲɛŋ",2],["nương","nɯəŋ",2],["ôi","oj",0],["que","kwɛ",2],["suôi","suəj",2],["trơn","cɤn",2],["xit","sit",1],["am","am",0],["cac","kak",1],["chong","cɔŋ͡m",2],["cut","kut",1],["đưt","dɯt",1],["ganh","ɣɛŋ",1],["gâm","ɣɤ̆m",1],["hut","hut",1],["lươc","lɯək",2],["ngâu","ŋɤ̆w",2],["ngoi","ŋɔj",2],["nguy","ŋwi",3],["nguy","ŋuj",3],["nhin","ɲin",2],["ranh","zɛŋ",1],["săn","săn",1],["thoa","tʰwa",3],["giât","zɤ̆t",2],["hăng","hăŋ",1],["loi","lɔj",1],["niêm","niəm",2],["tâng","tɤ̆ŋ",1],["thay","tʰăj",2],["xin","sin",1],["chau","căw",2],["đep","dɛp",1],["ghê","ɣe",2],["lau","lăw",1],["len","lɛn",1],["suât","swɤ̆t",2],["thăm","tʰăm",2],["trăm","căm",2],["truy","cwi",3],["doanh","zwɛŋ",2],["ep","ɛp",0],["ghi","ɣi",2],["hôm","hom",1],["hu","hu",1],["loc","lɔk͡p",1],["nhuc","ɲuk͡p",2],["nuôi","nuəj",2],["oai","waj",1],["ruôi","zuəj",2],["tanh","tɛŋ",1],["thươc","tʰɯək",3],["ty","ti",1],["via","viə",1],["vưng","vɯŋ",1],["bâc","bɤ̆k",1],["chui","cuj",2],["côn","kon",1],["do","zɔ",1],["dươi","zɯəj",2],["giâc","zɤ̆k",2],["kiêp","kiəp",2],["loa","lwa",2],["măn","măn",1],["men","mɛn",1],["mep","mɛp",1],["phơ","fɤ",2],["tâu","tɤ̆w",1],["thôn","tʰon",2],["băn","băn",1],["bưc","bɯk",1],["chô","co",2],["cươp","kɯəp",2],["dăm","zăm",1],["gương","ɣɯəŋ",2],["khoe","xwe",3],["khư","xɯ",2],["liêm","liəm",2],["lot","lɔt",1],["nham","ɲam",2],["sây","sɤ̆j",1],["giâm","zɤ̆m",2],["giân","zɤ̆n",2],["gôc","ɣok͡p",1],["khac","xak",2],["kin","kin",1],["mân","mɤ̆n",1],["ngăt","ŋăt",2],["nhem","ɲɛm",2],["nung","nuŋ͡m",1],["sơm","sɤm",1],["su","su",1],["thoc","tʰɔk͡p",2],["trôn","con",2],["vac","vak",1],["boc","bɔk͡p",1],["chăt","căt",2],["dươc","zɯək",2],["got","ɣɔt",1],["lach","lɛk",1],["lat","lat",1],["nây","nɤ̆j",1],["rong","zɔŋ͡m",1],["sen","sɛn",1],["tit","tit",1],["xôi","soj",1],["choi","cɔj",2],["hoat","hwat",2],["hon","hɔn",1],["hum","hum",1],["im","im",0],["khoc","xɔk͡p",2],["kia","kiə",1],["kiêt","kiət",2],["nhom","ɲɔm",2],["nơi","nɤj",1],["rưa","zɯə",1],["thoat","tʰwat",3],["tiêc","tiək",2],["vanh","vɛŋ",1],["vôn","von",1],["xet","sɛt",1],["xêp","sep",1],["buôc","buək",2],["choang","cwaŋ",3],["diêm","ziəm",2],["go","ɣɔ",1],["huynh","hwiŋ",2],["ngao","ŋaw",2],["oc","ɔk͡p",0],["ran","zan",1],["ret","zɛt",1],["ưu","ɯw",null],["bươm","bɯəm",2],["cuôn","kuən",2],["diu","ziw",1],["gâu","ɣɤ̆w",1],["hâp","hɤ̆p",1],["nghin","ŋin",3],["o","ɔ",0],["pa","pa",1],["phach","fɛk",2],["quây","kwɤ̆j",2],["rôn","zon",1],["thơm","tʰɤm",2],["xô","so",1],["âp","ɤ̆p",0],["chăm","căm",2],["chon","cɔn",2],["chưi","cɯj",2],["đăm","dăm",1],["hom","hɔm",1],["ket","kɛt",1],["lun","lun",1],["mit","mit",1],["ngây","ŋɤ̆j",2],["nhương","ɲɯəŋ",3],["phiêu","fiəw",3],["rây","zɤ̆j",1],["say","săj",1],["sê","se",1],["thoi","tʰɔj",2],["tran","can",2],["trăc","căk",2],["xung","suŋ͡m",1],["choc","cɔk͡p",2],["cuôi","kuəj",2],["ghet","ɣɛt",2],["hach","hɛk",1],["hoe","hwe",2],["lom","lɔm",1],["mươn","mɯən",2],["nem","nɛm",1],["nhăm","ɲăm",2],["nhâm","ɲɤ̆m",2],["ray","zăj",1],["sơi","sɤj",1],["ven","vɛn",1],["xăng","săŋ",1],["xuôi","suəj",null],["bia","biə",1],["bich","bik",1],["bit","bit",1],["bot","bɔt",1],["bơt","bɤt",1],["chang","caŋ",2],["chăc","căk",2],["chem","cɛm",2],["cơn","kɤn",1],["dôt","zot",1],["đat","dat",1],["gop","ɣɔp",1],["khung","xuŋ͡m",2],["lem","lɛm",1],["mêm","mem",1],["quên","kwen",2],["têt","tet",1],["thua","tʰuə",2],["trê","ce",2],["xem","sɛm",1],["bưng","bɯŋ",1],["chum","cum",2],["cưt","kɯt",1],["diêp","ziəp",2],["đit","dit",1],["ich","ik",0],["kênh","keŋ",1],["khuyên","xwiən",4],["let","lɛt",1],["lôt","lot",1],["nganh","ŋɛŋ",2],["phươc","fɯək",3],["rân","zɤ̆n",1],["sâp","sɤ̆p",1],["sôi","soj",1],["tăt","tăt",1],["the","tʰɛ",2],["vươt","vɯət",2],["xoay","swăj",2],["bêp","bep",1],["chuôn","cuən",3],["doc","zɔk͡p",1],["đom","dɔm",1],["giêng","zeŋ",2],["gơ","ɣɤ",1],["huê","hwe",2],["kiêng","kiəŋ",2],["lêch","lek",1],["lươt","lɯət",2],["nêp","nep",1],["nguôn","ŋuən",3],["nuôt","nuət",2],["rac","zak",1],["rơm","zɤm",1],["thac","tʰak",2],["toi","tɔj",1],["xâm","sɤ̆m",1],["bơm","bɤm",1],["chuân","cwɤ̆n",3],["cop","kɔp",1],["dâp","zɤ̆p",1],["êm","em",0],["găm","ɣăm",1],["giau","zăw",2],["huân","hwɤ̆n",2],["khan","xan",2],["năn","năn",1],["suc","suk͡p",1],["troc","cɔk͡p",2],["vet","vɛt",1],["xen","sɛn",1],["bau","băw",1],["doa","zwa",1],["ghen","ɣɛn",2],["giun","zun",null],["kip","kip",1],["lon","lɔn",1],["miêu","miəw",2],["nâm","nɤ̆m",1],["ngâp","ŋɤ̆p",2],["nhăt","ɲăt",2],["riêng","ziəŋ",2],["tưng","tɯŋ",1],["ung","uŋ͡m",0],["uông","uəŋ",1],["vua","vuə",1],["vưc","vɯk",1],["xam","sam",1],["xuyên","swiən",3],["chơp","cɤp",2],["chuc","cuk͡p",2],["giot","zɔt",2],["kep","kɛp",1],["khiên","xiən",3],["khuân","xwɤ̆n",3],["met","mɛt",1],["nguc","ŋuk͡p",2],["nhây","ɲɤ̆j",2],["nhun","ɲun",2],["roi","zɔj",1],["thiêp","tʰiəp",3],["tram","cam",2],["xuc","suk͡p",1],["ăng","ăŋ",0],["boi","bɔj",1],["chut","cut",2],["côm","kom",1],["dăng","zăŋ",1],["dep","zɛp",1],["diêt","ziət",2],["điêp","diəp",2],["êch","ek",0],["giương","zɯəŋ",3],["hân","hɤ̆n",1],["net","nɛt",1],["nghiên","ŋiən",4],["ngong","ŋɔŋ͡m",2],["nhô","ɲo",2],["phông","foŋ͡m",2],["pi","pi",null],["rai","zaj",1],["râp","zɤ̆p",1],["ren","zɛn",1],["triêt","ciət",3],["vun","vun",1],["vuông","vuəŋ",null],["vuôt","vuət",2],["cap","kap",1],["chây","cɤ̆j",2],["dô","zo",1],["dơi","zɤj",1],["dui","zuj",1],["hac","hak",1],["hôc","hok͡p",1],["khân","xɤ̆n",2],["khe","xɛ",2],["khuynh","xwiŋ",3],["mom","mɔm",1],["mưng","mɯŋ",1],["nghênh","ŋeŋ",3],["nhuân","ɲwɤ̆n",3],["ơt","ɤt",0],["rat","zat",1],["then","tʰɛn",2],["thia","tʰiə",2],["trui","cuj",2],["tua","tuə",1],["tum","tum",1],["xưa","sɯə",1],["don","zɔn",1],["găt","ɣăt",1],["giăng","zăŋ",2],["giô","zo",2],["hăc","hăk",1],["hoanh","hwɛŋ",2],["khuôn","xuən",null],["lăc","lăk",1],["loang","lwaŋ",2],["lơp","lɤp",1],["lươn","lɯən",2],["mun","mun",1],["nanh","nɛŋ",1],["nâng","nɤ̆ŋ",1],["ne","nɛ",1],["nêt","net",1],["ngông","ŋoŋ͡m",2],["ngương","ŋɯəŋ",3],["phim","fim",2],["rit","zit",1],["tom","tɔm",1],["trôm","com",2],["tươc","tɯək",2],["xinh","siŋ",1],["bâp","bɤ̆p",1],["cum","kum",1],["cun","kun",1],["dăt","zăt",1],["ghep","ɣɛp",2],["khuât","xwɤ̆t",3],["liu","liw",1],["loe","lwe",2],["min","min",1],["oi","ɔj",0],["phăng","făŋ",2],["phun","fun",2],["pô","po",null],["riu","ziw",1],["rơn","zɤn",1],["sam","sam",1],["trich","cik",2],["troi","cɔj",2],["tuê","twe",2],["ươt","ɯət",1],["xui","suj",1],["băp","băp",1],["buôm","buəm",2],["gon","ɣɔn",1],["khen","xɛn",2],["lim","lim",1],["nhip","ɲip",2],["thăt","tʰăt",2],["them","tʰɛm",2],["thơt","tʰɤt",2],["thut","tʰut",2],["tưu","tɯw",1],["uôn","uən",1],["uyên","wiən",2],["biu","biw",1],["bơn","bɤn",1],["bưu","bɯw",1],["chăp","căp",2],["chiêt","ciət",3],["dăn","zăn",1],["en","ɛn",0],["hoăc","hwăk",2],["hui","huj",1],["lât","lɤ̆t",1],["lep","lɛp",1],["luông","luəŋ",2],["nghiêng","ŋiəŋ",null],["ngoan","ŋwan",3],["ngơi","ŋɤj",2],["nhang","ɲaŋ",2],["nhưng","ɲɯŋ",2],["phe","fɛ",2],["phinh","fiŋ",2],["rinh","ziŋ",1],["rươi","zɯəj",2],["tat","tat",1],["thêm","tʰem",2],["trât","cɤ̆t",2],["bep","bɛp",1],["đăp","dăp",1],["đâp","dɤ̆p",1],["đum","dum",1],["gâp","ɣɤ̆p",1],["giưa","zɯə",2],["gưi","ɣɯj",1],["khat","xat",2],["khăng","xăŋ",2],["khuyêt","xwiət",4],["lia","liə",1],["ngăm","ŋăm",2],["ngât","ŋɤ̆t",2],["nhon","ɲɔn",2],["oe","we",1],["om","ɔm",0],["ôp","op",0],["ơi","ɤj",0],["phen","fɛn",2],["quet","kwɛt",2],["răm","zăm",1],["thep","tʰɛp",2],["toe","twe",2],["trưa","cɯə",2],["ưa","ɯə",0],["ưc","ɯk",0],["xiên","siən",2],["xiêu","siəw",2],["ach","ɛk",0],["bet","bɛt",1],["chac","cak",2],["chat","cat",2],["choe","cwe",3],["cơi","kɤj",1],["dôc","zok͡p",1],["dôn","zon",1],["dưt","zɯt",1],["đoa","dwa",2],["kham","xam",2],["lăp","lăp",1],["mêt","met",1],["mia","miə",1],["mot","mɔt",1],["nach","nɛk",1],["ngach","ŋɛk",2],["ngoa","ŋwa",3],["nguôi","ŋuəj",3],["nhơt","ɲɤt",2],["rich","zik",1],["set","sɛt",1],["soc","sɔk͡p",1],["voc","vɔk͡p",1],["xoăn","swăn",2],["xong","sɔŋ͡m",1],["băm","băm",1],["chet","cɛt",2],["chich","cik",2],["chun","cun",2],["doi","zɔj",1],["dông","zoŋ͡m",1],["găng","ɣăŋ",1],["gioi","zɔj",2],["hop","hɔp",1],["hôp","hop",1],["khâm","xɤ̆m",2],["lut","lut",1],["mên","men",1],["mut","mut",1],["ngoăc","ŋwăk",3],["nhăc","ɲăk",2],["nhoc","ɲɔk͡p",2],["niêu","niəw",2],["nưc","nɯk",1],["rap","zap",1],["ruc","zuk͡p",1],["sut","sut",1],["tâc","tɤ̆k",1],["tep","tɛp",1],["ương","ɯəŋ",null],["vông","voŋ͡m",1],["xay","săj",1],["xoc","sɔk͡p",1],["bin","bin",1],["chênh","ceŋ",2],["chôm","com",2],["dom","zɔm",1],["điêc","diək",2],["khât","xɤ̆t",2],["khit","xit",2],["khuê","xwe",null],["nghen","ŋɛn",3],["ngưng","ŋɯŋ",2],["rua","zuə",1],["sưt","sɯt",1],["ten","tɛn",1],["toac","twak",2],["triên","ciən",3],["xiu","siw",1],["xom","sɔm",1],["xông","soŋ͡m",1],["chach","cɛk",2],["chuôc","cuək",3],["cươc","kɯək",2],["đui","duj",1],["đun","dun",1],["găn","ɣăn",1],["gât","ɣɤ̆t",1],["giăc","zăk",2],["gông","ɣoŋ͡m",1],["hơt","hɤt",1],["hươu","hɯəw",null],["khoanh","xwɛŋ",3],["khuây","xwɤ̆j",3],["lôp","lop",1],["luôn","luən",2],["nap","nap",1],["nêm","nem",1],["nghinh","ŋiŋ",3],["nhên","ɲen",2],["nhông","ɲoŋ͡m",2],["nin","nin",1],["quăm","kwăm",2],["quơ","kwɤ",2],["rên","zen",1],["ria","ziə",1],["run","zun",1],["săng","săŋ",1],["sui","suj",1],["thap","tʰap",2],["thiêng","tʰiəŋ",3],["thoang","tʰwaŋ",3],["thong","tʰɔŋ͡m",2],["thui","tʰuj",2],["trô","co",2],["up","up",0],["vêt","vet",1],["xach","sɛk",1],["xây","sɤ̆j",1],["xôc","sok͡p",1],["xơi","sɤj",1],["chôc","cok͡p",2],["dat","zat",1],["giăt","zăt",2],["gie","zɛ",2],["giêt","zet",2],["khom","xɔm",2],["lit","lit",1],["ngoay","ŋwăj",3],["ngoe","ŋwe",3],["ngoeo","ŋwew",3],["nhong","ɲɔŋ͡m",2],["nhươc","ɲɯək",3],["nich","nik",1],["nôn","non",1],["nôt","not",1],["oanh","wɛŋ",1],["phơi","fɤj",2],["phưc","fɯk",2],["quơi","kwɤj",2],["sit","sit",1],["soan","swan",2],["sươn","sɯən",2],["tuông","tuəŋ",2],["um","um",0],["vat","vat",1],["vâng","vɤ̆ŋ",1],["vênh","veŋ",1],["xăm","săm",1],["xoai","swaj",2],["xot","sɔt",1],["xôm","som",1],["xôn","son",1],["ăc","ăk",0],["buôi","buəj",2],["chep","cɛp",2],["chươc","cɯək",3],["dip","zip",1],["duyêt","zwiət",3],["đoat","dwat",2],["đôm","dom",1],["đơm","dɤm",1],["gat","ɣat",1],["giui","zuj",2],["giup","zup",2],["hăm","hăm",1],["ia","iə",0],["khơ","xɤ",2],["lin","lin",1],["lum","lum",1],["mươp","mɯəp",2],["nen","nɛn",1],["nhoang","ɲwaŋ",3],["nit","nit",1],["nưt","nɯt",1],["phac","fak",2],["quăn","kwăn",2],["quât","kwɤ̆t",2],["rom","zɔm",1],["rôt","zot",1],["rơt","zɤt",1],["săm","săm",1],["sun","sun",1],["tach","tɛk",1],["thiu","tʰiw",2],["thom","tʰɔm",2],["trac","cak",2],["tưa","tɯə",1],["vom","vɔm",1],["xoang","swaŋ",2],["xoi","sɔj",1],["xon","sɔn",1],["bôp","bop",1],["bư","bɯ",1],["chôt","cot",2],["cooc","kɔk͡p",2],["đac","dak",1],["đoc","dɔk͡p",1],["giăm","zăm",2],["giu","zu",2],["hăn","hăn",1],["hem","hɛm",1],["hup","hup",1],["inh","iŋ",0],["khich","xik",2],["lăt","lăt",1],["lôm","lom",1],["mâp","mɤ̆p",1],["muông","muəŋ",2],["mươt","mɯət",2],["nu","nu",1],["nuc","nuk͡p",1],["nut","nut",1],["ron","zɔn",1],["rưc","zɯk",1],["soat","swat",2],["thiêm","tʰiəm",3],["tuôt","tuət",2],["von","vɔn",1],["xai","saj",1],["xoan","swan",2],["at","at",0],["bam","bam",1],["buôt","buət",2],["chiêc","ciək",3],["chop","cɔp",2],["chup","cup",2],["dât","zɤ̆t",1],["dơn","zɤn",1],["đet","dɛt",1],["đut","dut",1],["ênh","eŋ",0],["gang","ɣaŋ",1],["giâp","zɤ̆p",2],["giôi","zoj",2],["giua","zuə",2],["gươm","ɣɯəm",2],["hăt","hăt",1],["hep","hɛp",1],["hoen","hwen",2],["huc","huk͡p",1],["hun","hun",1],["hưa","hɯə",1],["khôc","xok͡p",2],["khơp","xɤp",2],["lip","lip",1],["lơm","lɤm",1],["ngat","ŋat",2],["phiêm","fiəm",3],["răc","zăk",1],["sin","sin",1],["thau","tʰăw",2],["toang","twaŋ",2],["trươt","cɯət",3],["xêch","sek",1],["xiêm","siəm",2],["xoe","swe",2],["bup","bup",1],["chom","cɔm",2],["chơn","cɤn",2],["dam","zam",1],["đoang","dwaŋ",2],["gion","zɔn",2],["gơi","ɣɤj",1],["guôc","ɣuək",2],["iu","iw",0],["khiêm","xiəm",3],["lêt","let",1],["loet","lwet",2],["mung","muŋ͡m",1],["ngưc","ŋɯk",2],["nhiu","ɲiw",2],["nhoe","ɲwe",3],["nhôi","ɲoj",2],["nhưa","ɲɯə",2],["nhưc","ɲɯk",2],["pê","pe",null],["phet","fɛt",2],["phin","fin",2],["phơt","fɤt",2],["quăng","kwăŋ",2],["quyt","kwit",2],["ram","zam",1],["rươc","zɯək",2],["săp","săp",1],["sênh","seŋ",1],["suôt","suət",2],["sup","sup",1],["tem","tɛm",1],["thot","tʰɔt",2],["thươt","tʰɯət",3],["tiu","tiw",1],["toai","twaj",2],["top","tɔp",1],["tơn","tɤn",1],["trây","cɤ̆j",2],["xâp","sɤ̆p",1],["ăm","ăm",0],["beng","bɛŋ",1],["chot","cɔt",2],["cot","kɔt",1],["đân","dɤ̆n",1],["đem","dɛm",1],["gơm","ɣɤm",1],["hoach","hwɛk",2],["kêch","kek",1],["khênh","xeŋ",2],["khiêu","xiəw",3],["khoac","xwak",3],["khua","xuə",2],["khuya","xwiə",null],["liêng","liəŋ",2],["mơn","mɤn",1],["mương","mɯəŋ",2],["nac","nak",1],["ngac","ŋak",2],["ngom","ŋɔm",2],["ngôc","ŋok͡p",2],["ngun","ŋun",2],["nhôn","ɲon",2],["nhuê","ɲwe",3],["nôm","nom",1],["on","ɔn",0],["phây","fɤ̆j",2],["thưng","tʰɯŋ",2],["toet","twet",2],["trum","cum",2],["ui","uj",0],["ươn","ɯən",1],["vot","vɔt",1],["vut","vut",1],["xep","sɛp",1],["xiêt","siət",2],["xuy","swi",2],["xuyt","swit",2],["ang","aŋ",0],["bip","bip",1],["bum","bum",1],["căc","kăk",1],["chêm","cem",2],["chit","cit",2],["choai","cwaj",3],["côp","kop",1],["cơt","kɤt",1],["dêt","zet",1],["dum","zum",1],["đoai","dwaj",2],["đuôc","duək",2],["et","ɛt",0],["giuc","zuk͡p",2],["hây","hɤ̆j",1],["hên","hen",1],["hiu","hiw",null],["hoac","hwak",2],["hơm","hɤm",1],["khăp","xăp",2],["khiêp","xiəp",3],["khương","xɯəŋ",3],["lap","lap",1],["năc","năk",1],["nân","nɤ̆n",1],["ngưu","ŋɯw",null],["nhâu","ɲɤ̆w",2],["nhot","ɲɔt",2],["nhuôm","ɲuəm",3],["phay","făj",2],["phâp","fɤ̆p",2],["phâu","fɤ̆w",2],["phôn","fon",2],["quach","kwɛk",2],["quăt","kwăt",2],["quit","kwit",2],["rui","zuj",1],["rum","zum",1],["rưt","zɯt",1],["tênh","teŋ",1],["thuơ","tʰuə",3],["uât","wɤ̆t",1],["xum","sum",1],["bơp","bɤp",1],["bươu","bɯəw",2],["chôp","cop",2],["chơm","cɤm",2],["dac","zak",1],["đôp","dop",1],["gianh","zɛŋ",2],["goa","ɣwa",2],["gong","ɣɔŋ͡m",1],["gưng","ɣɯŋ",1],["hâng","hɤ̆ŋ",1],["het","hɛt",1],["hêch","hek",1],["khăm","xăm",2],["khâp","xɤ̆p",2],["khet","xɛt",2],["khoeo","xwew",3],["loat","lwat",2],["lươm","lɯəm",2],["nghêch","ŋek",3],["nghiêt","ŋiət",4],["nguây","ŋwɤ̆j",3],["nhoet","ɲwet",3],["nhoi","ɲɔj",2],["niu","niw",1],["phang","faŋ",2],["quac","kwak",2],["rêt","zet",1],["rin","zin",1],["roc","zɔk͡p",1],["rot","zɔt",1],["sap","sap",1],["sên","sen",1],["sia","siə",1],["soai","swaj",2],["sot","sɔt",1],["sum","sum",1],["tăp","tăp",1],["thăn","tʰăn",2],["thôt","tʰot",2],["thươn","tʰɯən",3],["ton","tɔn",1],["trơt","cɤt",2],["ua","uə",0],["uc","uk͡p",0],["viêm","viəm",null],["vơt","vɤt",1],["xia","siə",1],["xôp","sop",1],["bem","bɛm",1],["bêt","bet",1],["biêng","biəŋ",2],["chêch","cek",2],["choac","cwak",3],["cup","kup",1],["cưi","kɯj",1],["duôi","zuəj",2],["đăn","dăn",1],["đuôn","duən",2],["đư","dɯ",1],["gau","ɣăw",1],["gu","ɣu",1],["hap","hap",1],["hec","hɛk",1],["hênh","heŋ",1],["hy","hi",1],["khiêng","xiəŋ",3],["khoăm","xwăm",3],["khuy","xwi",2],["kit","kit",1],["leng","lɛŋ",1],["liêp","liəp",2],["lup","lup",1],["mooc","mɔk͡p",2],["nau","năw",1],["ngoăn","ŋwăn",3],["nhap","ɲap",2],["nhoen","ɲwen",3],["pan","pan",1],["pe","pɛ",1],["phich","fik",2],["phiêt","fiət",3],["phut","fut",2],["pơ","pɤ",1],["quao","kwaw",2],["quăc","kwăk",2],["rôc","zok͡p",1],["sươt","sɯət",2],["tăn","tăn",1],["trat","cat",2],["ut","ut",0],["vên","ven",1],["xat","sat",1],["xua","suə",1],["xup","sup",1],["bâng","bɤ̆ŋ",1],["bim","bim",1],["bương","bɯəŋ",2],["câc","kɤ̆k",1],["câng","kɤ̆ŋ",1],["chap","cap",2],["choen","cwen",3],["cươm","kɯəm",2],["dâng","zɤ̆ŋ",null],["dên","zen",1],["đươn","dɯən",2],["gam","ɣam",null],["ghênh","ɣeŋ",2],["giat","zat",2],["giăn","zăn",2],["hau","hăw",1],["hit","hit",1],["hoay","hwăj",2],["hoet","hwet",2],["huông","huəŋ",2],["hưc","hɯk",1],["ka","ka",null],["khum","xum",2],["khươu","xɯəw",3],["lop","lɔp",1],["luôc","luək",2],["mim","mim",1],["năp","năp",1],["nep","nɛp",1],["ngăc","ŋăk",2],["nghet","ŋɛt",3],["ngoăng","ŋwăŋ",3],["ngoăt","ŋwăt",3],["ngơm","ŋɤm",2],["nhen","ɲɛn",2],["nhet","ɲɛt",2],["nhơp","ɲɤp",2],["nhuy","ɲuj",2],["nhuy","ɲwi",2],["nhưt","ɲɯt",2],["nia","niə",1],["noan","nwan",2],["nom","nɔm",1],["oang","waŋ",1],["phanh","fɛŋ",2],["phưng","fɯŋ",2],["quâng","kwɤ̆ŋ",2],["rôm","zom",1],["rương","zɯəŋ",2],["som","sɔm",1],["suông","suəŋ",2],["sưu","sɯw",1],["tet","tɛt",1],["thin","tʰin",2],["thôc","tʰok͡p",2],["thun","tʰun",2],["thuông","tʰuəŋ",3],["toong","tɔŋ͡m",2],["trot","cɔt",2],["trôc","cok͡p",2],["truât","cwɤ̆t",3],["tuêch","twek",2],["ươm","ɯəm",1],["vam","vam",1],["vich","vik",1],["xang","saŋ",1],["xiêng","siəŋ",2],["xop","sɔp",1],["xơn","sɤn",1],["xươc","sɯək",2],["boong","bɔŋ͡m",2],["bôm","bom",1],["bươi","bɯəj",2],["choet","cwet",3],["chơt","cɤt",2],["dăc","zăk",1],["det","zɛt",1],["dênh","zeŋ",1],["đot","dɔt",1],["đup","dup",1],["ec","ɛk",0],["ghem","ɣɛm",2],["gin","zin",1],["hât","hɤ̆t",1],["khoat","xwat",3],["khoet","xwet",3],["lec","lɛk",1],["lơt","lɤt",1],["mơm","mɤm",1],["nâp","nɤ̆p",1],["ngap","ŋap",2],["nghên","ŋen",3],["nghit","ŋit",3],["nghiu","ŋiw",3],["ngoam","ŋwam",3],["ngoanh","ŋwɛŋ",3],["ngôt","ŋot",2],["ngơp","ŋɤp",2],["ngung","ŋuŋ͡m",2],["nhach","ɲɛk",2],["nhê","ɲe",2],["nhoa","ɲwa",3],["nhôm","ɲom",2],["nhơi","ɲɤj",2],["nhui","ɲuj",2],["nôp","nop",1],["num","num",1],["oa","wa",0],["phênh","feŋ",2],["quau","kwăw",2],["riêu","ziəw",2],["sua","suə",1],["thet","tʰɛt",2],["thuôn","tʰuən",3],["tot","tɔt",1],["trau","căw",2],["trăn","căn",2],["trâp","cɤ̆p",2],["triêng","ciəŋ",3],["truông","cuəŋ",3],["tun","tun",1],["tuôn","tuən",2],["tươm","tɯəm",2],["uê","we",1],["văc","văk",1],["vâp","vɤ̆p",1],["xap","sap",1],["xec","sɛk",1],["ât","ɤ̆t",0],["biêm","biəm",2],["dim","zim",1],["dua","zuə",1],["đênh","deŋ",1],["đin","din",1],["điu","diw",1],["ghim","ɣim",2],["giên","zen",2],["giơn","zɤn",2],["gôm","ɣom",1],["gơn","ɣɤn",1],["gut","ɣut",1],["hip","hip",1],["hoăng","hwăŋ",2],["hot","hɔt",1],["huych","hwik",2],["huyt","hwit",2],["keng","kɛŋ",1],["khay","xăj",2],["khia","xiə",2],["khuêch","xwek",3],["khưng","xɯŋ",2],["lâc","lɤ̆k",1],["mem","mɛm",1],["mich","mik",1],["miêt","miət",2],["ngam","ŋam",2],["ngăng","ŋăŋ",2],["ngui","ŋuj",2],["ngut","ŋut",2],["nhep","ɲɛp",2],["nhêch","ɲek",2],["nhit","ɲit",2],["nhuyên","ɲwiən",4],["noong","nɔŋ͡m",null],["nưng","nɯŋ",1],["oat","wat",1],["oăn","wăn",1],["op","ɔp",0],["ôt","ot",0],["phăc","făk",2],["pheng","fɛŋ",2],["phia","fiə",2],["phôt","fot",2],["phui","fuj",2],["pu","pu",null],["quăp","kwăp",2],["răp","zăp",1],["rât","zɤ̆t",1],["riêt","ziət",2],["rôp","zop",1],["rươm","zɯəm",2],["rươn","zɯən",2],["sem","sɛm",1],["soa","swa",1],["tec","tɛk",1],["thêch","tʰek",2],["thiêc","tʰiək",3],["thon","tʰɔn",null],["thum","tʰum",2],["toat","twat",2],["tren","cɛn",2],["triu","ciw",2],["tuôc","tuək",2],["un","un",0],["vec","vɛk",1],["viêng","viəŋ",2],["xăn","săn",1],["xoac","swak",2],["xơm","sɤm",1],["xuê","swe",2],["au","ăw",null],["ay","ăj",0],["buyt","bwit",2],["bưt","bɯt",1],["chip","cip",2],["choa","cwa",3],["den","zɛn",1],["diêc","ziək",2],["đach","dɛk",1],["điêng","diəŋ",2],["đoanh","dwɛŋ",2],["giep","zɛp",2],["gôn","ɣon",null],["gôt","ɣot",1],["gư","ɣɯ",1],["him","him",1],["hua","huə",1],["huêch","hwek",2],["kên","ken",1],["khâc","xɤ̆k",2],["khep","xɛp",2],["khoen","xwen",3],["khong","xɔŋ͡m",2],["khuyu","xwiu",3],["loong","lɔŋ͡m",2],["mop","mɔp",1],["mum","mum",1],["mup","mup",1],["ngoac","ŋwak",3],["ngoen","ŋwen",3],["ngơn","ŋɤn",2],["nguyt","ŋwit",3],["nhăp","ɲăp",2],["nhâng","ɲɤ̆ŋ",null],["nhum","ɲum",2],["nơp","nɤp",1],["ot","ɔt",0],["pac","pak",1],["phăt","făt",2],["phêt","fet",2],["phơn","fɤn",2],["pin","pin",null],["rêp","zep",1],["rơp","zɤp",1],["ruôc","zuək",2],["sac","sak",1],["sêp","sep",1],["sêt","set",1],["siêt","siət",2],["suyt","swit",2],["thop","tʰɔp",2],["thup","tʰup",2],["tip","tip",1],["tret","cɛt",2],["trom","cɔm",2],["truân","cwɤ̆n",null],["trut","cut",2],["văm","văm",1],["vâm","vɤ̆m",1],["vin","vin",1],["viu","viw",1],["xăc","săk",1],["xeng","sɛŋ",1],["xơt","sɤt",1],["ăp","ăp",0],["bêch","bek",1],["biêc","biək",2],["boa","bwa",null],["cheng","cɛŋ",2],["choăt","cwăt",3],["dau","zăw",1],["dia","ziə",1],["din","zin",1],["dit","zit",1],["doan","zwan",2],["dun","zun",1],["duôc","zuək",2],["dưc","zɯk",1],["đơp","dɤp",1],["đươm","dɯəm",2],["gich","ɣik",1],["giê","ze",2],["goong","ɣɔŋ͡m",2],["guc","ɣuk͡p",1],["hoăm","hwăm",2],["hươm","hɯəm",2],["khem","xɛm",null],["khiêt","xiət",3],["khin","xin",2],["khưa","xɯə",2],["khươt","xɯət",3],["kiu","kiw",1],["lâng","lɤ̆ŋ",null],["liêc","liək",2],["luôt","luət",2],["ngau","ŋăw",2],["ngoao","ŋwaw",3],["ngoem","ŋwem",3],["ngôm","ŋom",2],["ngơt","ŋɤt",2],["ngưi","ŋɯj",2],["nhiêp","ɲiəp",3],["nhinh","ɲiŋ",2],["nhoai","ɲwaj",3],["nhôt","ɲot",2],["nhơm","ɲɤm",2],["nhuôc","ɲuək",3],["nhut","ɲut",2],["niêng","niəŋ",2],["niêt","niət",2],["nơm","nɤm",1],["nua","nuə",1],["ooc","ɔk͡p",1],["pec","pɛk",1],["phau","făw",null],["phooc","fɔk͡p",3],["pông","poŋ͡m",null],["quênh","kweŋ",2],["quêt","kwet",2],["rup","zup",1],["siêng","siəŋ",2],["sôc","sok͡p",1],["sôp","sop",1],["suyên","swiən",3],["teng","tɛŋ",1],["têch","tek",1],["thăp","tʰăp",2],["thênh","tʰeŋ",null],["thoăt","tʰwăt",3],["thơn","tʰɤn",2],["tôp","top",1],["trem","cɛm",2],["trêt","cet",2],["trưu","cɯw",2],["tup","tup",1],["tut","tut",1],["tươt","tɯət",2],["vơn","vɤn",1],["xan","san",1],["xâc","sɤ̆k",1],["xoong","sɔŋ͡m",null],["xơp","sɤp",1],["ăt","ăt",0],["bec","bɛk",1],["bươn","bɯən",null],["chiêp","ciəp",3],["duê","zwe",2],["đâng","dɤ̆ŋ",1],["đơt","dɤt",1],["đuênh","dweŋ",2],["đuôt","duət",2],["eng","ɛŋ",0],["găc","ɣăk",1],["gâc","ɣɤ̆k",1],["giêc","zek",2],["giuôc","zuək",3],["gom","ɣɔm",null],["gua","ɣuə",1],["guông","ɣuəŋ",2],["hiêng","hiəŋ",2],["kêm","kem",1],["khiu","xiw",2],["khoay","xwăj",3],["loăn","lwăn",2],["loăng","lwăŋ",2],["luôm","luəm",2],["lưt","lɯt",1],["miu","miw",1],["nâc","nɤ̆k",1],["ngâng","ŋɤ̆ŋ",2],["nghim","ŋim",3],["ngoap","ŋwap",3],["ngup","ŋup",2],["nhiêc","ɲiək",3],["nhim","ɲim",2],["nhua","ɲuə",2],["nip","nip",1],["not","nɔt",1],["nôc","nok͡p",1],["nup","nup",1],["oac","wak",1],["oach","wɛk",1],["oap","wap",1],["oăt","wăt",1],["phăm","făm",null],["phăn","făn",2],["phên","fen",2],["phiu","fiw",2],["phoc","fɔk͡p",2],["phôc","fok͡p",2],["phưa","fɯə",2],["phươn","fɯən",3],["phưt","fɯt",2],["pich","pik",1],["pit","pit",1],["puôc","puək",2],["răt","zăt",1],["rênh","zeŋ",1],["sât","sɤ̆t",1],["sich","sik",1],["sooc","sɔk͡p",2],["sươi","sɯəj",2],["thăc","tʰăk",2],["thêt","tʰet",2],["thoan","tʰwan",3],["thươi","tʰɯəj",3],["tơm","tɤm",1],["tray","căj",2],["trăt","căt",2],["tria","ciə",2],["trun","cun",2],["tuya","twiə",null],["tuyt","twit",2],["tươp","tɯəp",2],["uân","wɤ̆n",1],["uôm","uəm",null],["ươp","ɯəp",1],["vâu","vɤ̆w",1],["xau","săw",1],["xênh","seŋ",1],["xoat","swat",2],["xoet","swet",2],["xôt","sot",1],["xun","sun",null],["xươi","sɯəj",2],["xy","si",null],["booc","bɔk͡p",2],["buc","buk͡p",1],["chên","cen",2],["chuêch","cwek",3],["chuênh","cweŋ",3],["chuôm","cuəm",null],["coong","kɔŋ͡m",null],["doang","zwaŋ",2],["duênh","zweŋ",2],["dut","zut",1],["đec","dɛk",1],["đop","dɔp",1],["đươi","dɯəj",2],["ge","ɣɛ",null],["ghit","ɣit",2],["giem","zɛm",2],["gip","zip",1],["gium","zum",2],["giưt","zɯt",2],["gui","ɣuj",1],["gun","ɣun",1],["hich","hik",1],["hoăn","hwăn",2],["khau","xăw",2],["khăt","xăt",2],["khoăn","xwăn",3],["khuông","xuəŋ",null],["khươc","xɯək",3],["khưu","xɯw",2],["lic","lik",1],["loay","lwăj",2],["luya","lwiə",null],["mâng","mɤ̆ŋ",1],["mec","mɛk",1],["meng","mɛŋ",1],["muôm","muəm",2],["muôt","muət",2],["mưt","mɯt",1],["nghêt","ŋet",3],["ngoach","ŋwɛk",3],["ngoet","ŋwet",3],["ngop","ŋɔp",2],["ngum","ŋum",2],["nhâc","ɲɤ̆k",2],["nhoay","ɲwăj",3],["nhop","ɲɔp",2],["nuông","nuəŋ",null],["oăng","wăŋ",1],["ơm","ɤm",0],["panh","pɛŋ",null],["pap","pap",1],["pen","pɛn",null],["pet","pɛt",1],["phec","fɛk",2],["phêch","fek",2],["phoi","fɔj",2],["phot","fɔt",2],["phôp","fop",2],["phua","fuə",2],["ping","piŋ",null],["pua","puə",1],["rem","zɛm",1],["reng","zɛŋ",1],["rêch","zek",1],["roa","zwa",null],["rươt","zɯət",2],["sec","sɛk",1],["sim","sim",null],["soong","sɔŋ͡m",null],["sôn","son",1],["sơt","sɤt",1],["suôn","suən",null],["thêp","tʰep",2],["trêch","cek",2],["trit","cit",2],["tuât","twɤ̆t",2],["tuyn","twin",null],["tuyp","twip",2],["uych","wik",1],["ươi","ɯəj",null],["vap","vap",1],["vươc","vɯək",2],["vưt","vɯt",1],["xăp","săp",1],["xân","sɤ̆n",1],["xiêc","siək",2],["xim","sim",null],["xưc","sɯk",1],["â","ɤ̆",null],["âng","ɤ̆ŋ",0],["bap","bap",1],["buy","bwi",null],["châc","cɤ̆k",2],["chêp","cep",2],["choam","cwam",3],["chuy","cuj",2],["chươi","cɯəj",3],["chươm","cɯəm",3],["dem","zɛm",1],["dêch","zek",1],["dôp","zop",1],["dơm","zɤm",1],["duât","zwɤ̆t",2],["dươt","zɯət",2],["dyn","zin",1],["đêch","dek",1],["đêp","dep",1],["đip","dip",1],["đoac","dwak",2],["đuông","duəŋ",2],["êp","ep",0],["gap","ɣap",1],["ghêch","ɣek",2],["ghiên","ɣiən",3],["ghin","ɣin",2],["ghinh","ɣiŋ",2],["gien","zɛn",null],["gioc","zɔk͡p",2],["gioong","zɔŋ͡m",3],["giôn","zon",null],["gôp","ɣop",1],["gung","ɣuŋ͡m",1],["guôi","ɣuəj",2],["guôt","ɣuət",2],["hin","hin",null],["hoăt","hwăt",2],["hooc","hɔk͡p",2],["huơ","huə",null],["hươc","hɯək",2],["kan","kan",1],["kêp","kep",1],["khap","xap",2],["khâng","xɤ̆ŋ",2],["khây","xɤ̆j",2],["khec","xɛk",2],["khoăng","xwăŋ",3],["khoăt","xwăt",3],["khuơ","xuə",3],["khươn","xɯən",null],["lêc","lek",1],["loac","lwak",2],["loen","lwen",null],["lơng","lɤŋ",null],["luôi","luəj",2],["mam","mam",1],["map","map",1],["mêch","mek",1],["mip","mip",1],["moay","mwăj",null],["moong","mɔŋ͡m",null],["mưn","mɯn",1],["ngâc","ŋɤ̆k",2],["ngoang","ŋwaŋ",3],["ngua","ŋuə",2],["nguêch","ŋwek",3],["nhich","ɲik",2],["nhôc","ɲok͡p",2],["nic","nik",1],["noa","nwa",null],["nuôc","nuək",2],["nuy","nwi",null],["oam","wam",1],["oeo","wew",1],["pai","paj",1],["pang","paŋ",1],["pat","pat",1],["păng","păŋ",null],["phit","fit",2],["phom","fɔm",2],["phôm","fom",2],["phươu","fɯəw",3],["po","pɔ",null],["poa","pwa",null],["pom","pɔm",null],["pun","pun",null],["quêch","kwek",2],["quoang","kwaŋ",3],["quơn","kwɤn",2],["rim","zim",1],["rip","zip",1],["roat","zwat",2],["ruy","zwi",null],["rư","zɯ",1],["sic","sik",1],["siu","siw",null],["soang","swaŋ",2],["suê","swe",null],["sy","si",1],["têm","tem",null],["that","tʰat",2],["thên","tʰen",2],["thoăng","tʰwăŋ",3],["thôp","tʰop",2],["thuôi","tʰuəj",3],["thuôm","tʰuəm",3],["tic","tik",1],["toay","twăj",2],["toen","twen",2],["tooc","tɔk͡p",2],["tơp","tɤp",1],["trap","cap",2],["trâng","cɤ̆ŋ",null],["trôt","cot",2],["trup","cup",2],["tuênh","tweŋ",2],["tươu","tɯəw",2],["uây","wɤ̆j",1],["uyn","win",null],["vooc","vɔk͡p",2],["vop","vɔp",1],["vôc","vok͡p",1],["vuc","vuk͡p",1],["vưu","vɯw",null],["vy","vi",null],["xoach","swɛk",2],["xoen","swen",2],["xuôm","suəm",2],["xut","sut",1],["xuya","swiə",null],["xuyêt","swiət",3],["ă","ă",null],["âc","ɤ̆k",0],["buyp","bwip",2],["bươp","bɯəp",2],["bươt","bɯət",2],["cen","kɛn",null],["châng","cɤ̆ŋ",null],["choan","cwan",3],["choap","cwap",3],["choăn","cwăn",null],["choong","cɔŋ͡m",3],["chuê","cwe",3],["chưn","cɯn",null],["chươp","cɯəp",3],["chưt","cɯt",2],["côông","koŋ͡m",2],["cơp","kɤp",1],["cuôm","kuəm",2],["cuơng","kuəŋ",2],["cy","ki",null],["dach","zɛk",1],["diêng","ziəŋ",2],["doai","zwaj",2],["dop","zɔp",1],["dot","zɔt",1],["dôm","zom",1],["dơp","zɤp",1],["duôn","zuən",2],["dươn","zɯən",2],["dy","zi",null],["đeng","dɛŋ",null],["đuơng","duəŋ",2],["đuy","dwi",null],["đuya","dwiə",null],["đươu","dɯəw",2],["ên","en",0],["êng","eŋ",0],["êt","et",0],["gen","ɣɛn",null],["ghêt","ɣet",2],["ghiêc","ɣiək",3],["gic","zik",null],["giêm","zem",2],["gim","zim",1],["gioang","zwaŋ",3],["gioăng","zwăŋ",null],["giôc","zok͡p",2],["giôp","zop",2],["giôt","zot",2],["gơt","ɣɤt",1],["guôn","ɣuən",2],["gươi","ɣɯəj",2],["hia","hiə",null],["hiêc","hiək",2],["hiêt","hiət",2],["hơng","hɤŋ",null],["huây","hwɤ̆j",2],["huênh","hweŋ",null],["huôt","huət",2],["hưm","hɯm",1],["hươn","hɯən",null],["ic","ik",null],["kap","kap",1],["kay","kăj",null],["kec","kɛk",1],["kêng","keŋ",null],["kheng","xɛŋ",2],["khêch","xek",2],["khoao","xwaw",3],["khon","xɔn",2],["khoong","xɔŋ͡m",null],["khot","xɔt",2],["khôông","xoŋ͡m",3],["khuăng","xwăŋ",3],["khuâng","xwɤ̆ŋ",null],["khui","xuj",null],["khut","xut",2],["khuyp","xwip",3],["khươi","xɯəj",null],["khươm","xɯəm",null],["kot","kɔt",1],["kôc","kok͡p",1],["kôn","kon",null],["kơi","kɤj",null],["ku","ku",null],["kuênh","kweŋ",null],["kuyp","kwip",2],["lêp","lep",1],["loach","lwɛk",2],["loanh","lwɛŋ",null],["loao","lwaw",2],["loăt","lwăt",2],["loeng","lweŋ",2],["loeo","lwew",2],["luych","lwik",2],["luyn","lwin",null],["luynh","lwiŋ",2],["luyt","lwit",2],["lươp","lɯəp",2],["lươu","lɯəw",2],["moa","mwa",null],["moan","mwan",null],["mơp","mɤp",1],["muy","mwi",null],["muya","mwiə",null],["mư","mɯ",1],["mươc","mɯək",2],["nênh","neŋ",null],["nget","ŋɛt",2],["nghiêu","ŋiəw",null],["ngia","ŋiə",2],["ngiu","ŋiw",2],["ngoong","ŋɔŋ͡m",null],["ngôp","ŋop",2],["nguych","ŋwik",3],["nguyu","ŋwiu",3],["ngươ","ŋɯə",3],["ngươn","ŋɯən",null],["ngưt","ŋɯt",2],["nhênh","ɲeŋ",null],["nhia","ɲiə",2],["nhoam","ɲwam",3],["nhoăng","ɲwăŋ",3],["nhôp","ɲop",2],["nhuôn","ɲuən",3],["nhươn","ɲɯən",3],["nop","nɔp",1],["nơt","nɤt",1],["nun","nun",1],["nuôm","nuəm",2],["nươm","nɯəm",2],["nươp","nɯəp",2],["oăm","wăm",null],["oec","wek",1],["oeng","weŋ",null],["oong","ɔŋ͡m",null],["pao","paw",null],["păc","păk",1],["păn","păn",1],["pâc","pɤ̆k",1],["pâu","pɤ̆w",null],["pêch","pek",1],["pêt","pet",1],["phăp","făp",2],["phon","fɔn",null],["phop","fɔp",2],["phup","fup",2],["phuy","fwi",null],["phưn","fɯn",2],["pic","pik",1],["piêu","piəw",null],["pinh","piŋ",null],["pip","pip",1],["pong","pɔŋ͡m",null],["poong","pɔŋ͡m",2],["pop","pɔp",null],["pôông","poŋ͡m",null],["pôt","pot",1],["pơng","pɤŋ",null],["pui","puj",null],["puy","pwi",null],["pươi","pɯəj",null],["quâc","kwɤ̆k",2],["quec","kwɛk",2],["queng","kwɛŋ",null],["quich","kwik",2],["quinh","kwiŋ",2],["quo","kwɔ",2],["quoăt","kwăt",3],["quuyêt","kwiət",4],["quych","kwik",2],["quyp","kwip",2],["rêm","zem",null],["riêm","ziəm",2],["riên","ziən",null],["ring","ziŋ",null],["roang","zwaŋ",2],["roong","zɔŋ͡m",2],["ruê","zwe",null],["ruôm","zuəm",2],["ruôn","zuən",null],["ruyp","zwip",2],["ryn","zin",1],["sâng","sɤ̆ŋ",null],["sep","sɛp",1],["sêch","sek",1],["siêc","siək",2],["siêm","siəm",2],["siên","siən",2],["soam","swam",2],["soap","swap",2],["soet","swet",2],["sưn","sɯn",1],["têp","tep",1],["thim","tʰim",2],["thip","tʰip",2],["thoăn","tʰwăn",null],["thoong","tʰɔŋ͡m",3],["thôm","tʰom",2],["thuôt","tʰuət",3],["thuơng","tʰuəŋ",null],["ting","tiŋ",null],["toanh","twɛŋ",null],["tơt","tɤt",1],["trec","cɛk",2],["treng","cɛŋ",null],["trênh","ceŋ",2],["troet","cwet",3],["trơm","cɤm",2],["trơp","cɤp",2],["trua","cuə",2],["truôi","cuəj",3],["truôt","cuət",3],["truơng","cuəŋ",3],["trươn","cɯən",3],["tuyêc","twiək",3],["tươn","tɯən",2],["uôt","uət",1],["uơ","uə",1],["uynh","wiŋ",1],["vem","vɛm",1],["vêch","vek",1],["vim","vim",1],["voa","vwa",null],["voan","vwan",null],["vum","vum",1],["xăt","săt",1],["xêm","sem",1],["xên","sen",null],["xêt","set",1],["xing","siŋ",null],["xoam","swam",2],["xoanh","swɛŋ",2],["xoeng","sweŋ",2],["xooc","sɔk͡p",2],["xuây","swɤ̆j",null],["xuêch","swek",2],["xuênh","sweŋ",2],["xuynh","swiŋ",null],["xươt","sɯət",2],["xyt","sit",1]];

const vowelIPAFeatures=map('i=000 y=001 ɪ=100 ʏ=101 ɨ=010 ʉ=011 ɯ=020 u=021 ʊ=121 e=200 ø=201 ɘ=210 ɵ=211 ɤ=220 o=221 ə=310 ɛ=400 œ=401 ɜ=410 ɞ=411 ʌ=420 ɔ=421 æ=500 ɐ=510 a=600 ɶ=601 ɑ=620 ɒ=621 ɚ=310 ɝ=410 ɿ=010 ʅ=010');
const consonantPlaces=[
  ['p','b','m','f','v','pf'], ['t','d','s','z','ts','dz','n','l','r','θ','ð','ɬ'],
  ['ʃ','ʒ','tʃ','dʒ','ɲ','ʎ','j','ç'], ['k','g','ŋ','x','ɣ','ɰ','ʁ','w','ɥ'], ['h','ħ','ʕ','ʔ'],
];
const consonantManners=[
  ['b','p','t','d','k','g','ʔ'], ['m','n','ŋ','ɲ'], ['f','v','s','z','ʃ','ʒ','x','h','θ','ð','ʁ','ɣ','ɬ','ç','ħ','ʕ'],
  ['ts','dz','tʃ','dʒ','pf'], ['l','r','ʎ','w','j','ɥ','ɰ'],
];
const classLookup=sets=>new Map(sets.flatMap((set,index)=>set.map(sound=>[sound,index])));
const places=classLookup(consonantPlaces), manners=classLookup(consonantManners);
const diphthongs=new Set(['ai','au','aɪ','aʊ','ɑʊ','ɑɪ','ei','eɪ','ou','oʊ','oi','ɔi','ɔɪ','əʊ','əɪ','ui','ɐu','ɐi','iu','yə','yœ']);
const oralGlides=new Set(['j','w','ɰ','ɥ']);
const rhotics=new Set(['r','ɹ','ɻ','ɾ','ɽ','ʀ','ʁ','ɼ']);

function inventoryBoundaries(word,previous,following) {
  const cluster=word.slice(previous.end,following.start);
  const edge=sourceSyllableEdge(cluster,word[following.start]);
  let preferred=edge?previous.end+edge.offset:Math.max(previous.end,following.start-1);
  if(!edge&&preferred>previous.end&&oralGlides.has(phoneticBase[word[preferred]?.sound]))preferred--;
  const weight=edge?edge.weight*0.37:0.065;
  const first=Math.max(previous.end,preferred-3), last=Math.min(following.start,preferred+3);
  return Array.from({length:last-first+1},(_,index)=>{
    const cut=first+index;
    return {cut,penalty:Math.abs(cut-preferred)*weight};
  }).sort((a,b)=>a.penalty-b.penalty);
}

function phoneDistance(a,b) {
  if(a.vowel!==b.vowel) return 1.65;
  if(a.vowel) {
    const x=vowelIPAFeatures[a.sound] ?? '310', y=vowelIPAFeatures[b.sound] ?? '310';
    return 0.13*Math.abs(x[0]-y[0])+0.23*Math.abs(x[1]-y[1])+0.21*Math.abs(x[2]-y[2])+
      (a.length===b.length?0:0.13)+(a.nasal===b.nasal?0:0.12);
  }
  const x=phoneticBase[a.sound], y=phoneticBase[b.sound];
  const aspiration=a.marks.includes('ʰ')===b.marks.includes('ʰ') ? 0 : 0.16;
  const duration=a.length===b.length?0:0.13;
  if(x===y) return duration+aspiration+(a.sound===b.sound?0:0.07);
  if(rhotics.has(a.sound)&&rhotics.has(b.sound))return 0.06+duration+aspiration;
  if (['h','x','ħ','ɣ'].includes(x) && ['h','x','ħ','ɣ'].includes(y)) return 0.20+duration+aspiration;
  const xPlace=['c','ɟ','tɕ','dʑ'].includes(a.sound)?2:places.get(x) ?? 2;
  const yPlace=['c','ɟ','tɕ','dʑ'].includes(b.sound)?2:places.get(y) ?? 2;
  const place=xPlace===yPlace?0:0.18+0.12*Math.abs(xPlace-yPlace);
  const manner=manners.get(x)===manners.get(y)?0.16:0.63;
  const sibilants=['s','z','ʃ','ʒ','ts','dz','tʃ','dʒ'];
  const voiced=/^[bdgmnlrzv]|^[ŋɲʎʒʁɣð]|^(dz|dʒ)$/u;
  return place+manner+duration+aspiration+(voiced.test(x)===voiced.test(y)?0:0.25)+(sibilants.includes(x)===sibilants.includes(y)?0:0.26);
}

function ipaSequenceDistance(input,candidate,previous,current,costs) {
  for(let j=0;j<=candidate.length;j++) previous[j]=j*0.82;
  for(let i=1;i<=input.length;i++) {
    current[0]=previous[0]+0.88;
    for(let j=1;j<=candidate.length;j++) {
      const cost=costs?costs[i-1][candidate[j-1].inventoryIndex]:phoneDistance(input[i-1],candidate[j-1]);
      current[j]=Math.min(previous[j]+0.88,current[j-1]+0.82,previous[j-1]+cost);
    }
    [previous,current]=[current,previous];
  }
  return previous[candidate.length];
}

// Attested checked Cantonese syllables with non-level tones from the pinned IPA-Translator dictionary.
const checkedCantoneseTones={"mat":"2","dip":"2","gut":"2","juk":"2","leot":"2","caat":"2","hap":"2","gap":"2","gaap":"2","zoek":"2"};

// Contour labels describe how the source IPA moves across Chao's five pitch levels.
const chaoLevels=map('˩=1 ˨=2 ˧=3 ˦=4 ˥=5');
const toneProfiles={
  mandarin:[['1','55'],['2','35'],['3','214'],['4','51']],
  cantonese:[['1','55'],['2','35'],['3','33'],['4','21'],['5','13'],['6','22']],
  vietnamese:[['ngang','33'],['huyen','32'],['huyen','21'],['sac','24'],['sac','34'],['hoi','312'],['hoi','31'],['nga','35',true],['nga','45',true],['nang','21',true],['nang','32',true],['sac','45',false,true],['nang','212',true,true]],
};
const toneMarks={
  mandarin:map('1=̄ 2=́ 3=̌ 4=̀'),
  vietnamese:map('huyen=̀ sac=́ hoi=̉ nga=̃ nang=̣'),
};
const toneChoices=new Map();

function toneShape(points) {
  const begin=points[0], end=points.at(-1);
  if(Math.min(...points)<Math.min(begin,end))return 'dip';
  if(Math.max(...points)>Math.max(begin,end))return 'peak';
  return end===begin?'level':end>begin?'rising':'falling';
}

function toneCurve(levels) {
  const points=[...levels].map(Number);
  return Array.from({length:5},(_,i)=>{
    const t=i/4*(points.length-1);
    const left=Math.floor(t);
    return points[left]+((points[left+1]??points[left])-points[left])*(t-left);
  });
}

function syllableTone(phones,start,end,source) {
  const marked=phones.slice(start,end).filter(phone=>phone.tone);
  if(!marked.length)return null;
  const symbols=marked.map(phone=>phone.tone).join('');
  if(source==='mandarin'&&symbols==='˧')return null;
  return {levels:[...symbols].map(symbol=>chaoLevels[symbol]).join(''),
    glottal:marked.some(phone=>phone.tonalGlottalization)};
}

function selectTone(tone,target,checked=false,changedTones='') {
  if(!tone?.levels)return '';
  const key=target+':'+tone.levels+':'+Number(tone.glottal)+':'+Number(checked)+':'+changedTones;
  if(toneChoices.has(key))return toneChoices.get(key);
  const contour=toneCurve(tone.levels), shape=toneShape(contour);
  let best='', minimum=Infinity;
  for(const [id,pattern,glottal=false,onlyChecked=false] of toneProfiles[target]) {
    if(onlyChecked&&!checked)continue;
    if(checked&&target==='cantonese'&&!('136'+changedTones).includes(id))continue;
    if(checked&&target==='vietnamese'&&!['sac','nang'].includes(id))continue;
    if(target==='vietnamese'&&glottal&&!tone.glottal&&!checked)continue;
    const reference=toneCurve(pattern);
    if(toneShape(reference)!==shape)continue;
    const distance=reference.reduce((sum,pitch,i)=>sum+Math.abs(pitch-contour[i]),0)/reference.length+
      (target==='vietnamese'&&glottal!==tone.glottal?1.15:0);
    if(distance<minimum) {minimum=distance;best=id;}
  }
  const selected=minimum<=1.25?best:'';
  if(toneChoices.size>=2048)toneChoices.clear();
  toneChoices.set(key,selected);
  return selected;
}

function pinyinToneSpelling(syllable,tone) {
  if(!tone)return syllable;
  let index=syllable.search(/[a]/u);
  if(index<0)index=syllable.search(/[eê]/u);
  if(index<0&&syllable.includes('ou'))index=syllable.indexOf('ou');
  if(index<0)index=[...syllable].findLastIndex(letter=>/[aeiouüê]/u.test(letter));
  if(index<0&&/^(?:m|n|ng|hm|hng)$/u.test(syllable))index=syllable.search(/[mn]/u);
  if(index<0)return syllable;
  return (syllable.slice(0,index+1)+toneMarks.mandarin[tone]+syllable.slice(index+1)).normalize('NFC');
}

function vietnameseAccentIndex(syllable) {
  const body=syllable.replace(/^qu(?=[aeiouyăâêôơư])/u,'q·').replace(/^gi(?=[aeiouyăâêôơư])/u,'g·');
  const vowels=[...body].flatMap((letter,index)=>/[aeiouyăâêôơư]/u.test(letter)?[index]:[]);
  const preferred=vowels.findLast(index=>/[êôơ]/u.test(body[index]));
  if(preferred!==undefined)return preferred;
  if(vowels.length>2)return vowels[1];
  if(vowels.length===2 && (vowels[1]<body.length-1 || /^(oa|oe|uy)$/u.test(body.slice(vowels[0]))))return vowels[1];
  return vowels[0]??-1;
}

function inventoryToneSpelling(syllable,tone,target,observedAccent) {
  const checked=target==='cantonese'?/[ptk]$/u.test(syllable):
    target==='vietnamese'&&/(?:ch|[cpt])$/u.test(syllable);
  const checkedTones=target==='cantonese'?(checkedCantoneseTones[syllable]??'')+(officialCheckedCantoneseTones[syllable]??''):'';
  const id=selectTone(tone,target,checked,checkedTones);
  if(!id)return syllable;
  if(target==='mandarin')return pinyinToneSpelling(syllable,id);
  if(target==='cantonese')return syllable+id;
  const accent=toneMarks.vietnamese[id];
  if(!accent)return syllable;
  const index=observedAccent??vietnameseAccentIndex(syllable);
  return index>=0?(syllable.slice(0,index+1)+accent+syllable.slice(index+1)).normalize('NFC'):syllable;
}

function bareToneSpelling(syllable,target) {
  if(target==='cantonese')return syllable.replace(/[1-6]$/u,'');
  if(target==='mandarin')return syllable.normalize('NFD').replace(/[\u0304\u0301\u030c\u0300]/gu,'').normalize('NFC');
  if(target==='vietnamese')return syllable.normalize('NFD').replace(/[\u0301\u0300\u0309\u0303\u0323]/gu,'').normalize('NFC');
  return syllable;
}

// The eSpeak browser wrapper returns tone IDs inside the IPA stream for these voices.
const espeakVietnameseTones={
  vi:map('1=˧˧ 2=˧˨ ɜ=˨˦ 4=˧˩˨ 5=˧ˀ˥ 6=˨ˀ˩ 7=˧˧'),
  'vi-vn-x-central':map('1=˧˥ 2=˦˨ ɜ=˩˧ 4=˧˩˨ 5=˧˩˨ 6=˨ˀ˩ 7=˧˥'),
  'vi-vn-x-south':map('1=˧˧ 2=˧˨ ɜ=˦˥ 4=˨˩˦ 5=˨˩˦ 6=˨˩˨ 7=˧˧'),
};
const espeakCantoneseTones=map('1=˥ 2=˧˥ 3=˧ 4=˨˩ 5=˩˧ 6=˨');

function normalizeEspeakReading(ipa,source,voice) {
  const vietnamese=source==='vietnamese';
  const cantonese=source==='cantonese';
  if(!vietnamese&&!cantonese)return ipa;
  const codes=vietnamese?/[124-7ɜ]/gu:/[1-6]/gu;
  const table=vietnamese?espeakVietnameseTones[voice]??espeakVietnameseTones.vi:espeakCantoneseTones;
  return ipa.split(/(\s+)/u).map(word=>{
    if(!word||/^\s+$/u.test(word)||/[()[\]{}]/u.test(word))return word;
    const markers=word.match(codes)??[];
    let plain=(vietnamese?word.replace(/-(?=[124-7ɜ])/gu,''):word).replace(codes,'');
    if(cantonese)plain=plain.replace(/([aɑɛeəiɔoɵuy])\1/gu,'$1ː');
    if(markers.length>1)return plain;
    const code=markers[0]??(vietnamese&&/[aeiouəɔɛɨɯʊɑ]/u.test(plain)?'1':'');
    if(!code)return plain;
    const checked=/[ptk](?:\p{M}|ʰ|h)*$/u.test(plain);
    return plain+(vietnamese&&checked&&code==='ɜ'?'˦˥':table[code]??'');
  }).join('');
}

// Destination spelling rules use the intended tonic nucleus, never a repair vowel.
const romanceStressRules={
  spanish:{
    defaultPenultimate:/[aeiou]$|[aeiou][ns]$/u,
    accents:map('a=á e=é i=í o=ó u=ú'),
    hiatus:true,
  },
  portuguese:{
    defaultPenultimate:/(?:[aeo]s?|am|em|ens|ão|ães|ões)$/u,
    accents:map('a=á e=é i=í o=ó u=ú'),
    closedVowels:map('e=ê o=ô'),
    hiatus:true,
  },
  italian:{
    defaultPenultimate:null,
    accents:map('a=à e=è i=ì o=ò u=ù'),
    closedVowels:map('e=é o=ó'),
  },
};

function hasStressedHiatus(letters,index,nucleus) {
  if(nucleus.length!==1||!/^[iu]$/u.test(letters[index]))return false;
  const before=letters.slice(0,index).join(''), after=letters.slice(index+1).join('');
  return /[aeo]h?$/u.test(before)||/^h?[aeo]/u.test(after);
}

const portugueseFinalMidVowels=map('e=ê ɛ=é o=ô ɔ=ó');

function renderRomanceStress(plan,target) {
  const {phones}=plan;
  const syllables=plan.syllables.filter(syllable=>syllable.nucleus.some(phone=>phone.vowel));
  const letters=latinLetters(phones,target);
  const policy=romanceStressRules[target];
  const stresses=phones.flatMap((phone,index)=>phone.stress==='ˈ'?[index]:[]);
  if(target==='portuguese' && syllables.length===1 && stresses.length<=1) {
    const {nucleus,coda}=syllables[0];
    if(nucleus.length===1 && !nucleus[0].nasal && !nucleus[0].inserted &&
      (!coda.length || coda.length===1 && coda[0].sound==='s')) {
      const accent=portugueseFinalMidVowels[nucleus[0].sound];
      if(accent)letters[phones.indexOf(nucleus[0])]=accent;
    }
  }
  if(stresses.length!==1 || syllables.length<2)return letters.join('');
  const tonic=syllables.findIndex(syllable=>syllable.nucleus.some(phone=>
    phone.vowel&&!phone.inserted&&phones.indexOf(phone)>=stresses[0]));
  if(tonic<0)return letters.join('');
  const nucleus=syllables[tonic].nucleus.filter(phone=>phone.vowel&&!phone.inserted);
  const slots=nucleus.map(phone=>phones.indexOf(phone));
  const open=slots.find(index=>/^[aeo]$/u.test(letters[index]));
  const index=slots.find(position=>position===stresses[0])??open??slots.at(-1);
  const written=letters.join('');
  const expected=(!policy.defaultPenultimate||policy.defaultPenultimate.test(written))?syllables.length-2:syllables.length-1;
  if(tonic===expected&&!(policy.hiatus&&hasStressedHiatus(letters,index,nucleus)))return written;
  const phone=phones[index];
  const base=letters[index];
  const closed=phone.sound==='e'||phone.sound==='o';
  const accent=(closed?policy.closedVowels?.[base]:undefined)??policy.accents[base];
  if(!accent)return written;
  letters[index]=accent;
  return letters.join('');
}

// Frequent phone and edge-cluster observations from the pinned IPA-Translator dictionaries.
// Italian observations derived from CUNY-CL/WikiPron d282e848a211ea31cfd730f0ced8bc8cdab9e83d (Wiktionary, CC BY-SA 4.0).
const phonologyEvidence={"korean":{"phones":["a","k","ʌ","i","n","ŋ","d","u","o","m","s","p","tɕ","g","ɭ","t","ɯ","j","ɾ","dʑ","ɛ","ɦ","b","ɕ","w","e","ø","h","β","ɲ","ɥ","ɸ","ʝ","ç","ʎ","ɰ","kx","x","ɣ","ʃ","ɘ"],"onsets":["k","tɕ","p","s","","t","m","n","j","ɕ","h","k j","p j","k w","ɸ","m j","ɾ","w","ɸ w","ç j","ɥ","x","ɰ","ç","k ɥ","ɾ j","kx","h ɥ","t ɥ","k ç","ɲ","ɕ j","tɕ ɥ","ʃ ɥ","tɕ w","n ɥ","tɕ j","t w","k ç j","s w","p w","t j","m w"],"codas":["","k","ŋ","n","ɭ","m","p","t"]},"japanese":{"phones":["ɯ","i","a","o","k","e","ɾ","ɴ","s","t","m","ɕ","g","n","b","j","d","dʑ","h","ts","tɕ","z","p","ɸ","ɰ","ç","v"],"onsets":["k","","s","t","ɕ","m","h","b","n","ɾ","d","g","j","dʑ","ɸ","p","tɕ","ç","k j","ts","z","ɰ","ɾ j","g j","n j","ç j","b j","m j","v","p j"],"codas":["","ɴ"]},"english":{"phones":["ɪ","ə","n","ɫ","ɹ","s","k","t","i","d","m","ɝ","ɛ","z","ɑ","ʊ","æ","b","p","o","a","f","g","e","ɔ","v","ŋ","u","h","ʃ","w","dʒ","j","tʃ","ts","θ","dz","ð","ʒ","pf"],"onsets":["","k","m","b","ɹ","d","s","h","ɫ","p","f","t","w","n","g","v","dʒ","ʃ","s t","p ɹ","b ɹ","k ɹ","j","g ɹ","tʃ","t ɹ","k ɫ","z","f ɹ","s p","s k","b ɫ","f ɫ","p ɫ","θ","d ɹ","k w","s t ɹ","s ɫ","g ɫ","s w","h w","s n","s m","k j","ʃ ɹ","h j","s k ɹ","b j","m j","s p ɹ","t w","θ ɹ","f j","ʃ w","s k w","ʒ","ʃ ɫ","g w","p j","ʃ m","ð","ʃ n","d w","s p ɫ","g j","d j","s v","t j","b w","z w","v j","v ɫ","n j","v ɹ","h ɹ","k n","s f","m ɹ","s ɹ","ɫ j","k v","s k j","z ɫ","ts","h ɫ","θ w"],"codas":["","n","z","ɫ","ŋ","k","d","t","s","n z","m","ts","ɫ z","ɹ","k s","s t","n t","n d","ɫ d","g","p","v","f","dz","n ts","m z","ʃ","θ","ɹ z","tʃ","dʒ","n s","ŋ z","ɹ d","s ts","p s","b","k t","ɹ t","z d","ŋ k","n dz","v z","ɫ t","g z","b z","f s","p t","f t","ɹ n","ɹ k","m p","ɫ ts","ɹ ts","m d","ŋ k s","ɫ dz","s k","ɹ dz","k ts","ʃ t","ɫ f","dʒ d","v d","n dʒ","ɹ k s","ɹ f","θ s","n tʃ","ɹ s","ɹ m","tʃ t","ɫ k","n s t","ɹ p","g d","k s t","b d","m p s","ɹ n z","ɫ m","ɹ m z","f ts","ɹ s t","ɹ θ","ð","ɹ dʒ","m p t","n θ","ɹ g","ŋ k t","ɹ m d","ɫ m z","n dʒ d","s k s","h","ɫ p","ɹ b","n tʃ t","ɫ v z","ʒ","ɹ p s","ɹ ʃ","t z","d t","ɫ f s","ɫ k s","ɹ ɫ","ɹ tʃ","ɫ b","ɫ s","ɫ tʃ","ŋ d","p ts","n s k","ɹ k t","s p","z m","ð z","ɫ v","ɫ v d","n ʃ","pf","ʃ k","ð d","ɫ θ","m pf","ɹ dʒ d","ɹ ɫ z","ɹ n d","m f","n θ s","b s t","p k","ɹ v","ɫ s t","ɫ ʃ","s k t","ɫ p s","n k","ɹ b z","ɹ f s","ɹ s k","p s t","ɹ tʃ t","w"]},"mandarin":{"phones":["n","ŋ","j","ʊ","a","ɪ","u","ɑ","tɕ","t","ʈʂ","i","ɛ","p","w","l","k","ɤ","ɕ","ʂ","x","ts","o","e","ə","m","ɔ","y","ɚ","f","œ","ɥ","ʐ","s","ɯ","ɻ"],"onsets":["ʈʂ","t","","p","tɕ","ʂ","k","tɕ j","l","ts","m","x","j","f","ɕ j","ɕ","ʐ","s","w","x w","n","t j","k w","l j","p j","tɕ ɥ","ʈʂ w","ɥ","ɕ ɥ","n j","m j","t w","ʂ w","ts w","s w","l w","ʐ w","l ɥ","n ɥ","n w"],"codas":["","n","ŋ","ɻ"]},"cantonese":{"phones":["i","ɐ","k","ŋ","n","t","ts","u","a","s","m","ɔ","j","p","y","h","ɪ","ʊ","l","o","w","f","e","ɵ","œ","ɛ"],"onsets":["ts","s","t","k","j","p","h","l","m","f","w","k w","n","ŋ",""],"codas":["","ŋ","n","k","t","m","p"]},"arabic":{"phones":["a","i","l","f","t","w","s","ʔ","u","b","r","n","m","k","d","ʕ","q","j","ħ","dʒ","ʃ","h","z","x","e","ɪ","ɣ","ʊ","ð","θ","ʒ","tʃ","ts"],"onsets":["f","w","l","b","k","s","","ʔ","t","n","j","m","ʕ","q","r","d","ʃ","ħ","dʒ","x","h","ɣ","z","ð","θ","b r","b l","f r","k r","k l","s k","tʃ","t r"],"codas":["","r","j j","l","d","m","n","b","s","f","ʕ","q","ʔ","t","ħ","dʒ","ʃ","z","k","h","x","ð","θ","ɣ","d d","l l","r r","m m","b b","z z","f f","n n","ʃ ʃ","q q","dʒ ʒ","w w","s s","t t","θ θ","k k","ħ ħ","w","t r","ð ð","x x","j","n dʒ","r d","k s","n d","s r","b l","x t","t l","b r","s t","r s","s f","h d","h r","s m","r b","r ʕ","r ʃ","m s","z r","b t","f r","k r","s l","f t","l m","ð r","f l","n t","ʕ l","d w","r z","d ʕ","r k","r w","h w","ʔ s","l f","b s","h l","l b","m r","t f","d ħ","ʕ ʕ","l q","r t","s b","r m","ħ l","tʃ","q d","r dʒ","ʃ t","n f","m d","r q","ʃ r","t m","l t","q s","r ʔ","d n","ʔ r","k l","d m","d b","l s","dʒ r","l ʕ","dʒ l","m n","s q","n ʃ","d r","l w","ɣ w","n s","ʔ n","b n","ɣ d","b q","r f","ʕ r","l dʒ","b ħ","t ħ","ʕ t","m ħ","ʕ s","n w","z m","b d","t q","ʕ d","ħ w","m z","q l","b ʕ","r ħ","ʃ m","f ʕ","z l","q f","d l","ħ d","m l","m ʕ","ʕ b","n b","f d","l ħ","x ð","t w","ð w","q w","ʃ w","n k","f s","m t","d dʒ","ʕ w","ʕ θ","ɣ l","r x","dʒ z","f q","q b","q r","t b","ʔ t","ð l","ħ r","n ħ","q m","s ħ","ʕ m","r θ","ʕ j","q n","t ʕ","b k","d f","z q","θ r","r j","s x","t h","ʔ m","n q","s ɣ","f w","x z","b ɣ","b w","z w","n z","s ʔ","ʔ l","n x","θ n","r t z","ʔ d","b h","ð k","h m","ʕ ð","t n","b ʃ","f ʃ","θ l","d s","dʒ m","dʒ s","dʒ ʕ","n ʕ","s d","x r","x s","ʕ n","ħ f","ħ t","l k","t s","f ħ","ħ m","k z","n ɣ","z b","q ʕ","ħ j","ʃ q","ʔ w","ɣ r","z n","l d","s w","dʒ w","ʃ b","ɣ j","ħ n","k w","ɣ z","ʔ q","ħ ʃ","r n","ʔ b","d ʔ","ɣ n","h b","l ɣ","z ʔ","ʕ f","d ɣ","f k","l x","ʔ j","ð q","f n","k d","r h","ʕ q","ð b","d j","ð m","d x","dʒ b","ħ b","ħ ð","k ʃ","l h","m q","s ʕ","ʃ d","ʃ ħ","x l","x m","z ʕ","ʃ j","m dʒ","ɣ m","ħ s","h t","l j","q t","s dʒ","t ʃ","ʕ ʃ","s n","k m","r ɣ","k b","x w","dʒ h","f h","h n","m j","j t","n j","θ j","b ʔ","j j h","h ð","t ɣ","ʔ ʔ","θ ɣ","θ w","θ j l j n","b j","d q","f z","h dʒ","h q","ʔ ð","ʕ dʒ","θ m","b z","ð f","d h","d ʃ","h f","k f","k θ","m ɣ","m ʃ","q ʃ","ʃ f","ʃ ʔ","ʃ ʕ","x n","z f","n h","b x","q j","b θ","ð ʕ","f ð","ɣ t","t h m","z k","ʃ k","dʒ n","s h","s k","ɣ θ","k h","q h","z h","m h","ts","m w","r s w","ʔ z","ʕ k","k n","dʒ f","j j ʔ","l ʔ","l θ","r j j","x d","z ɣ","b ð","ð n","dʒ d","dʒ ð","dʒ ħ","f dʒ","f j","f x","f θ","ɣ s","ħ k","ħ q","h ʃ","ħ θ","k t","m x","m θ","n m","n θ","q ð","ʃ l","x b","x f","x j","z dʒ","z ħ","z j","ʔ ʃ","θ b","d d h","h k","m h m","h j","h θ","l l h","m ð","q ħ","s j","t x","d d h m","f ʔ","m k","t ʔ","m m h","t k","w m","j k","l l h m","t j r","d h m","h h","l h m","l w w l","t r h","ʕ z"]},"persian":{"phones":["æ","ɒ","n","ɾ","e","d","i","t","o","m","s","k","b","z","l","ʃ","u","h","j","g","x","f","ɢ","p","v","dʒ","ʔ","tʃ","ʒ","ʊ","dz","w","ts","kx","a"],"onsets":["","b","m","k","t","s","d","p","n","h","x","ʃ","z","ɾ","g","ɢ","dʒ","f","tʃ","v","l","j","ʔ","ʒ","b ɾ","p ɾ","k ɾ","x w","b l","d ɾ","f ɾ","g ɾ","k l","g n","p l","t ɾ","f l","k v","m j","x ɾ"],"codas":["","n","ɾ","m","t","d","l","k","z","s","ʃ","b","h","ɢ","s t","n d","n g","f","ɾ d","dʒ","j","ʔ","ɾ g","ʃ t","x","g","p","h ɾ","ɾ t","tʃ","s m","ɾ s","f t","ʃ k","n dʒ","ɾ z","v","ɾ f","ɾ k","x t","k s","n s","t ɾ","ʒ","s b","j ɾ","ɾ ɢ","ɾ m","b ɾ","l t","n k","ɾ dʒ","ɾ ʃ","s l","ʃ ɢ","x m","b h","ɢ s","j l","ɾ x","s k","z d","z m","ʔ d","b l","b z","ɢ t","j n","k ɾ","m s","m ʔ","n z","s ɾ","ʃ m","b t","d s","dʒ m","f l","f ʃ","ɢ d","ɢ l","ɢ z","j d","j k","l l","m b ɾ","m ɾ","ɾ b","ɾ n","ɾ v","t m","x ʃ","b ʔ","d d","d ɾ","f n","f z","h d","h l","h n","h ʃ","h v","j b","j f","l ɢ","l k","l m","l n","l x","m p","n n","n s k","ɾ l","ɾ tʃ","s t ɾ","ʃ f","ts k","x s","z n","ʔ l"]},"khmer":{"phones":["a","k","t","ə","e","ɑ","p","m","n","r","c","u","o","ŋ","l","s","i","ʔ","y","h","b","d","v","ɨ","ɔ","ʊ","ɲ","ɛ","f","g","z"],"onsets":["c","k","t","s","ʔ","p","b","r","m","d","p r","n","l","k r","s r","v","h","t r","","c r","p l","k l","k n","t ŋ","ŋ","s t","t n","p t","ɲ","s l","s ʔ","k b","k m","p n","s m","p d","p s","t m","t v","c n","m d","s d","s v","t l","k c","k d","p ʔ","s k","s n","s b","c l","f","k s","k t","m n","p k","c m","k v","c b","l b","l ʔ","s ŋ","c ŋ","k ʔ","p c","p ɲ","c k","k p","m c","m l","m r","s p","c ʔ","m k","m s","t b","ʔ l","ʔ v","b r","g","k ɲ","l m","l ŋ","l v","m t","s k r","t k","t p"],"codas":["","ŋ","k","t","h","n","m","p","l","v","c","ɲ","ʔ"]},"odia":{"phones":["ɔ","a","i","u","k","e","b","r","s","l","t","n","p","ɾ","m","d","dʒ","g","ʈ","tʃ","h","o","ɳ","ŋ","j","ɽ","ɖ","ɲ"],"onsets":["","b","k","p","s","m","dʒ","d","tʃ","g","n","h","t","l","r","ɾ","p ɾ","ʈ","ɖ","p r","b j","s r","k r","s t","k j","s k","b r","s n","b ɾ","g r","j","b l","k l","k ɾ","m r","ŋ k","dʒ j","dʒ ɲ","g ɾ","m j","p j","t r","ʈ r","d r","d ɾ","n r","p l","s b","s m r","s t r","s ʈ"],"codas":["","k","l","m","ʈ","n","s","r","h","p","ŋ","t","b","dʒ","s ʈ","tʃ"]},"dutch":{"phones":["r","ə","t","s","l","n","i","k","ɛ","ɑ","a","m","p","d","e","x","o","ɪ","ɔ","b","v","f","ŋ","ʋ","ɣ","h","z","u","y","j","ʉ","œ","ts","ø","ʃ","g","ʒ","dz","tʃ","ɒ","dʒ"],"onsets":["","b","v","k","m","r","h","x","l","p","ʋ","d","t","s","z","s t","s x","n","p r","f","k r","k l","s p","x r","p l","t r","s l","b r","d r","j","s t r","b l","v r","v l","z ʋ","k n","k ʋ","s n","f l","s x r","x l","s m","f r","ʃ","s p r","t ʋ","d ʋ","p s","s k","ʋ r","g","dʒ","ʒ","s p l","tʃ","k s","s k r","g r","g l","s ʋ","s f","x n","p n","ts","p ʋ","ʃ n"],"codas":["","r","t","l","ŋ","s","k","x","n t","n","m","p","r t","x t","s t","f","l t","r k","ʋ","n s","ts","k t","ŋ k","r s","n s t","f t","r m","l k","j","m p","k s","r ts","l f","l s","r n","l m","m t","n ts","r f","r x","r s t","r k t","p t","r p","l p","m s t","ŋ s t","p s","x s","j t","ŋ s","k s t","l x","s p","ʃ","tʃ","ŋ k t","s k","ʋ t","m s","r p s","ʋ s","x s t","ts t","l f t","n ʃ","j s","l k t","ŋ k s","r ʃ","j n","m f","r f t","r x t","f s","r m t","m p t","j f","j n t","l k s","n tʃ","r k s","x ts"]},"norwegian":{"phones":["ə","ɪ","t","ɾ","s","l","k","ɑ","n","ʉ","ɛ","m","ʋ","f","d","ɔ","e","p","b","g","æ","i","ʂ","ʊ","h","o","ŋ","j","u","ʏ","ɭ","ø","œ","y","ʈ","ɖ","ç","ɳ","ts","w","pf","tʂ","ʈʂ","ɽ","c","ɱ"],"onsets":["","f","b","s","m","h","ʋ","l","t","k","ɾ","d","p","j","n","s t","ʂ","g","ç","f ɾ","t ɾ","g ɾ","s p","k ɾ","k l","p ɾ","s k","b ɾ","b l","f l","s ʋ","ʂ ɭ","d ɾ","s n","s t ɾ","s k ɾ","p l","s m","g l","k ʋ","k n","s p ɾ","ʋ ɾ","f j","t ʋ","g n","m j","s k ʋ","t j","c","d j","s p l","s t j","b j","f n"],"codas":["","k s t","ɾ","n","l","t","s k","s","ŋ","k","m","n t","ʈ","ʋ","d","g","s t","k t","p","l t","n s k","ɳ","ɾ k","f t","l s k","k s","ʂ","n s","ɾ m","f","j","ʂ k","m t","l m","ɖ","p t","l g","l k","m p","m s k","ŋ k","ŋ s","ŋ t","ɾ g","j d","j n","l p","l s","m s","p s","ts","b","l n","l ʋ","ŋ n","g d","l f","n s t","ɾ b","ɾ p","ɾ ʋ","ʂ t","f s","l s t","ɭ","m s t","n ʂ","ŋ s t","p s k","ɽ k","s p","ts k","ʋ d","w k","w n","w t"]},"german":{"phones":["t","n","ə","a","ʁ","s","l","ɪ","ɐ","ɛ","k","m","f","d","ʊ","ʃ","g","i","b","ts","p","o","v","ɔ","e","z","u","h","ç","ŋ","ʔ","x","ʏ","y","ø","pf","œ","j","tʃ","ʒ","dʒ","ɑ","r","æ","w","ɹ","θ","ʌ","ð","dz","ɫ"],"onsets":["","f","h","b","v","ts","g","k","d","m","ʁ","z","l","n","p","t","ʃ t","ʃ","t ʁ","p ʁ","k ʁ","f ʁ","g ʁ","ʃ p","b ʁ","f l","k l","ʃ v","ʃ l","b l","d ʁ","j","ʃ t ʁ","ts v","ʃ p ʁ","g l","ʃ n","ʃ ʁ","k v","k n","p l","ʃ m","pf","s","s t","pf l","tʃ","s k","dʒ","s p","k s","ʔ","ç","p s","s t ʁ","ʒ","s l","g n","v ʁ","s k ʁ","s ts","s n","s k l","ʃ p l","s v","s m","pf ʁ","x","w","t v","d n j","p t","s f","t j","n j","k ʃ","r","p n","m n","s p ʁ","f r","k ʃ t","s ʁ","m j","s k v","f j","ɹ"],"codas":["","n","s","t","m","s t","k","n t","p","ŋ","f","l","x","ts","n s","k t","ʃ","l t","k s","k s t","l s","m s","ç","ʁ ç","f t","ç t","ʁ t","n ts","p t","m t","p s t","m s t","ŋ s","ts t","l s t","x t","f s","x s","ʁ ts","l ts","ŋ t","ŋ s t","p s","n s t","ʃ s","ʁ k","f s t","ʁ m","ŋ k","ŋ k t","ʁ k s","ç s t","ç ts","ʁ n","s ts","x s t","ç s","ʁ f","l ts t","ʃ t","n ts t","k ts","tʃ","pf","ʁ","ŋ k s t","ʁ f t","ʁ k t","ʁ n s","ʁ p","ʃ s t","tʃ t","f ts","ʁ f s","ʁ m s","ʁ s t","ʁ s","ʁ f s t","l n","ŋ k s","pf t","m pf","ʁ p t","pf s","tʃ s t","l f t","m pf t","ʁ ts t","ʁ p s t","l m","ʁ k s t","tʃ s","l k","l f","l m s","ʁ p s","pf s t","l f s t","m pf s","n ʃ","m ts","ŋ k ts","ʁ m t","ʁ n t","ʁ ʃ","n s ts","l p","m pf s t","l k s","m p t","l k t","l ç","ʁ m s t","ʁ n s t","ʁ k ts","m p s t","m p","p ts","l p s t","l p t","ʁ ʃ s","k s ts","l k s t","l f s","ʁ ʃ t","l ʃ","x ts","n f t","p ʃ","ʁ ç t","n ʃ t","z","d","s k","g ŋ","n tʃ","ʁ l","n f","ʁ ʃ s t","ç ts t","ʁ s ts","k ŋ","l ç s","m p s","n ʃ s","ʁ ç s t","l p s","n ʃ s t","ʁ l s","l m t","ʁ ç s","dʒ","p ʃ t","x ts t","n tʃ t","b","l ç t","p s ts","ŋ ŋ","l ʃ t","v","l m s t","l n t","s k s"]},"romanian":{"phones":["r","i","a","e","t","n","o","l","k","u","s","m","ə","p","d","j","b","f","z","g","v","ts","tʃ","ɨ","ʃ","dʒ","h","ʒ","w","dz"],"onsets":["","k","p","m","d","s","r","b","t","n","f","l","p r","v","h","t r","tʃ","g","s t","z","k r","ʃ","p l","ʒ","g r","s p","s k","k l","dʒ","b r","s t r","f r","ts","j","f l","d r","g l","s f","s l","b l","p s","s k r","ʃ t","z b","v r","s m","z d r","z g","k s","p j","k v","s tʃ","h r","z v","s k l","p n","f j","ʃ p","z m","s p r","ʃ l","v l","m j","z g r","s f r","ʃ k","ʃ m","m l","p t","ʃ t r","g n","s p l","ʃ n","s n","h l","f t","m r","ʃ v","z l","ʒ n","b j","k n","k t","s v","ʃ p r","k w","ʃ f","ʃ j","ts j","m n","z d","z g l"],"codas":["","t","r","l","k","n","s","j","n t","s m","ʃ","s t","m","w","ts","v","d","s k","g","ʒ","z","f","p","tʃ","n d","k s","b","n g","r m","ʃ t","r d","r t","k t","n s","n ts","h","r n","l t","p t","r s","n k","m b","r k","r ts","r f","r g","n tʃ","r b","l ts","f t","dʒ","l m","m n","p s","l k","r p","n z","m p","l b","r h","l d","l f","n k t","n ʒ","r v","n ʃ","r ʃ","r z","h t","l p","j t","k s t","l s","l v","m p t","n g v","r s t","t m","j k","m t","n dʒ","n k s","r tʃ","g n","m f","m ts","r dʒ","ʃ k"]},"malay":{"phones":["a","ə","n","r","i","m","t","u","k","s","l","p","b","ŋ","d","o","e","ʔ","h","tʃ","g","ɲ","dʒ","w","f","j","v","z","ts"],"onsets":["m","b","p","k","","s","t","d","tʃ","l","r","g","h","dʒ","n","f","w","p r","t r","v","s t","b r","ɲ","ʔ h","ʔ r","s j","s p","z","ʔ l","d r","j","p l","b l","d w","g r","s k","s t r","f r","g l","ŋ","s w","f l","p s","s h","s l","tʃ r","g h","s r","s ʔ r"],"codas":["","n","ʔ","ŋ","t","r","s","h","l","m","p","f","d","b","g","ʔ s","n s","r s","dʒ","z","r m","ʔ h","l m","n ʔ","p s","r n","r t","k","l f","n t","r f","w"]},"vietnamese":{"phones":["a","ŋ","j","k","m","t","i","ɤ","w","ə","o","ɯ","n","u","d","ɔ","b","l","p","h","c","e","ʂ","ʈ","ɛ","ɲ","f","x","s","ʐ","ɣ","z"],"onsets":["t","j","k","d","b","l","m","c","h","","ʂ","ʈ","n","ɲ","ŋ","f","w","ʐ","x","s","ɣ","h w","t w","ŋ w","x w","l w","s w","c w","d w","j w","ʂ w","ʈ w","p","ɲ w","n w","ɣ w","z","b w"],"codas":["","ŋ","j","ŋ m","k","w","n","m","k p","t","p"]},"swahili":{"phones":["a","i","u","k","m","n","o","e","w","t","l","ɓ","s","ɗ","z","p","ɾ","h","j","ŋ","g","ʃ","f","ʄ","tʃ","v","ɠ","ɲ","ʒ","θ","b","y","d","x","r","c","ts"],"onsets":["","k","w","m","h","n","t","v","ɓ","l","j","s","tʃ","p","z","ɗ","f","ʄ","m t","m k","m w","m s","ʃ","ɠ","m n","ɾ","m l","ɲ","m ɓ","m p","ɗ h","m tʃ","m m","m f","n ɗ","ŋ g","k w","m z","m ʃ","m ɠ","ɓ w","m ʄ","v j","s t","m ɾ","m v","ɠ h","m h","m ɗ","t w","b","m ɲ","θ","g","m ŋ g","ŋ","d","n ɗ ʒ","f j","r","m k w","p w","ɠ w","m ɓ w","m j","s h","s p","c h","m s t","p ɾ","ɓ ɾ","k ɾ","t h","m t w","n z","s w","ɲ w","t ɾ","d h","k l","m ɗ h","m f j","m ŋ","m ʃ t","n ɠ","ŋ g w","p l","s k","ʃ t","ɠ ɾ","m s w","n j","n t","ɓ l","f ɾ","ɠ l","m m w","m p w","n tʃ","m ɲ w","m p j","tʃ w","x","ɗ ɾ","m ɠ h","m ɠ w","m k ɾ","m n ɗ","p j","f l","l k","l n","n ɗ w","n s","ŋ w","s l","s m","ts"],"codas":["","n","k","ʃ","s","w","l","z","m","t","ɾ","ŋ g","ɲ","ʃ w","n ɗ","ɓ","z w","m ɓ","ʄ","ɗ","h","k w","ɗ h","ɠ","tʃ","ɲ w","p","f","v j","v","m z","n ɗ ʒ","ŋ g w","s w","n ɗ w","n z","t w","j","m ɓ w","m s","m ʃ","m z w","c","ɠ h","m k","m w","n w","p w","ɾ ɾ","tʃ w"]},"swedish":{"phones":["r","a","ɛ","s","t","l","n","k","ɪ","d","m","v","p","g","f","e","b","ɑ","ɔ","ɵ","ŋ","i","u","j","o","ʊ","ø","h","ʉ","ɧ","œ","ʏ","ʂ","ʈ","y","ɖ","ɕ","ɳ","ts","ɭ","ʈʂ","tɕ","pf","w"],"onsets":["","f","b","s","r","m","v","t","k","h","l","p","d","s t","j","ɧ","n","p r","t r","ɕ","s k","f r","s l","s p","b r","k r","g r","g","k l","b l","s n","s v","s m","f l","d r","s t r","s k r","p l","k n","k v","t v","g l","s p r","f j","g n","v r","p s","s k v","m j","b j","f n","s p j","p j","s p l","n j","w","d v","ɧ v"],"codas":["","r","n","g","ŋ","l","t","d","s","k","m","s k","p","j","n t","s t","v","n d","k t","ɖ","ʈ","n s","f t","r k","k s","s m","t s","l d","ɳ","ɧ","l t","f","ŋ k","r m","ʂ","b","r j","m p","m d","r v","g d","n s k","ŋ k t","m n","l j","l k","l s","n s t","ŋ n","m s t","j d","l p","ŋ d","p t","l v","p s","ʂ ʈ","k s t","m s","n d s k","l m","j t","m t","v t","f s","l s k","n ɧ","ʂ k","d s","ŋ s","ŋ s t","j s","m b","m n d","r p","ts","j k","l j d","r k t","v s","g s","l s t","ɭ","m s k","r b","r ɧ","r t","t s k","m f","n j","ŋ t","r d","s k t","s p","tɕ","ʈʂ","g m","g t","j l","j n","j p","l f","l n","p s k","r n","t ɧ","t m","v d"]},"spanish":{"phones":["a","e","s","ɾ","o","i","n","t","m","l","k","d","p","β","θ","u","ð","r","j","f","b","ɣ","x","ŋ","z","ʎ","g","tʃ","w","ɲ","ʝ"],"onsets":["","d","r","k","s","m","p","b","t","t ɾ","p ɾ","l","f","θ","x","g","n","tʃ","f ɾ","p l","k ɾ","g ɾ","b ɾ","f l","k w","k l","d j","ʎ","g w","b j","b l","g l","d ɾ","ʝ","m w","p j","w","m j","s w","j","θ j","r j","t ɾ j","r w","f j","l j","p w","b w","k j","n j","k ɾ j","k s","d w","g j","s j","g ɾ j","t j","f w","p s","x w","l w","f l w","f ɾ j","p ɾ j","t w","n w","g n","t ɾ w","m w j","p l j"],"codas":["s","","n","ɾ","ð","l","θ","j","m","t","k s"]},"icelandic":{"phones":["a","r","t","n","ɪ","s","l","ʏ","i","k","u","ɛ","m","ð","p","v","h","j","f","c","œ","o","ɔ","e","ɣ","ŋ","θ","x","ts","ɲ","ç","pf"],"onsets":["","h","l","v","s","p","t","r","m","f","k","c","s t","n","k r","θ","f r","s c","s k","k v","p r","f j","k l","s j","s v","t r","f l","p l","j","s p","l j","θ r","ç","s t l","s t n","θ j","s k r","s t r","p j","s m","s t j","t j","r j","t v","f r j","p r j","m j","θ v","s p r","k n","f l j","t r j","v j","n j","s t n j","k r j","s p j","s t l j","k l j","s m j","θ r j","s k v","s t r j","s p l","f n","p l j","k n j","s k r j"],"codas":["","r","n","m","ð","s t","n s","s","ɣ","l","t","x t","n t","ŋ k","l t","h t","k","r ð","t l","r t","r k","v","p","m t","r s","l s","f t","t n","r t n","k s","x s","p n","h k","ɣ ð","ð s","r v","k n","m s t","n ts","ŋ t","ts","f","l k","f s","p s","s k","h k n","h p","m s","ð s t","r s t","ŋ s","h t n","l ts","r p","l v","n s t","ŋ k s","j ð","j t","j l t","l s t","f s t","r k s","x s t","r m","k l","k s t","p l","v ð","j","j n","m p","s ts","l m","l p","j s t","l k s","r ð s","r ts","s t n","h p s","n s k","j k","h k s","ŋ s t","j ŋ k","j x t","r n t","j ɣ","j ŋ t","j r ð","j t n","n k","r v s","s t l","j n t","j r","l s k","r p s","r s k","j h t","j n s","j s","ŋ","f ts","h p n","h ts","j m","j p","k s t l","m l","p l s","r m t","r t l","s k s","ɣ ð s","ɣ s","h p l","j ɣ ð","j k n","j ŋ s","j s t n","l m s","l v s","m m"]},"esperanto":{"phones":["o","i","a","r","e","t","n","l","k","s","m","u","p","d","g","b","f","v","ts","z","dʒ","h","ʃ","tʃ","ʒ","j","x","dz","pf"],"onsets":["","k","m","s","p","d","f","r","l","b","t","v","h","n","p r","g","t r","tʃ","k r","ts","p l","g r","s t","f r","j","ʃ","f l","b r","k l","s p","g l","s k","dʒ","k v","b l","x","z","d r","s t r","ʒ","ʃ t","s v","s k r","s l","s ts","ʃ r","p s","g v","k s","g n","k n","s f","ʃ p","ʃ l","ʃ v","s p r","s k l","p n","ʃ m","ʃ n","s m","s p l","ʃ p r","v j","s n","ʃ t r","t j","m n","p t","s k v","s r"],"codas":["","n","l","m","r","s","k","d","s t","b","t","n s","p","ʃ","tʃ","f"]},"italian":{"phones":["a","i","o","r","e","t","n","l","k","s","m","d","p","ɛ","u","j","b","v","f","tʃ","ɔ","g","z","dʒ","ts","w","dz","ʃ","ʎ","ɲ","ʒ","ø","y","ɾ","h","x","ə"],"onsets":["","r","k","p","m","s","d","f","b","v","t","l","p r","n","t r","tʃ","s k","dʒ","s p","s t","g","f r","k r","dz","g r","b r","s t r","ʃ","k w","z b","ts","z v","p j","s f","p l","z m","k j","k l","g w","d j","f l","p s","j","g l","f j","z g","s k r","s p r","d r","b j","s k j","s k w","z b r","z l","b l","k s","s f r","v j","s p j","z g r","z d","f w","m j","z n","s w","w","g j","k w j","s j","ɲ","z d r","s k l","n j","b w","l j","s f j","z g w","z b j","z m j","z v j","r j","z dʒ","m w","n w","v w","t j","s p l","z v w","ʎ","p n","d w","p w","t r j","p t","s t j","p r j","t w","z d j","z ɲ","z r","l w","n d r","z b l","z g j","ʒ","b d","h","r w"],"codas":["","n","r","j","l","s","t","m","k","f","d","p","v","n g","s t","ʃ","tʃ","n s","b","n t","k s","l l","n d","r g","j k","j n","r d","g","j t","l t","ts","ʒ","j d","n k","r f","w","z","dʒ","j s","r t","j l","j m","l m","r k","r ts","w n d"]},"jamaican":{"phones":["a","i","n","t","s","l","ɹ","k","ɪ","o","u","e","m","p","d","ɛ","b","f","ɔ","tʃ","j","w","dʒ","ʃ","g","z","h","v","ŋ","ɲ","ɟ","y","ts","r","ʊ"],"onsets":["","s","p","k","d","m","b","ɹ","h","t","f","l","n","w","dʒ","tʃ ɹ","j","k j","tʃ","g","p ɹ","s t","dʒ ɹ","ʃ","b ɹ","g ɹ","v","k ɹ","f ɹ","k l","p l","k w","ɟ","ɲ","s p","b l","f l","s w","s m","s k","s l","b w","s p ɹ","f j","g w","m j","n j","p j","s k w","t w","z"],"codas":["","n","t","s","l","k","m","d","p","ɹ","z","n t","ŋ","dʒ","n s","f","tʃ","k s","ʃ","v","b","g","l s","ŋ k","ŋ k s","ɹ k","n dʒ","l t","m z","n z","l v","ɹ l","ɹ m","ɹ n","ɹ t"]},"portuguese":{"phones":["a","i","s","e","ʊ","ɾ","ə","o","k","t","d","l","p","m","u","n","x","z","v","b","w","tʃ","g","f","y","ɪ","dʒ","ɔ","ɛ","ʒ","ɣ","ʃ","ɲ","ʎ","ts","dz"],"onsets":["","k","s","m","p","x","d","b","f","t","l","p ɾ","v","n","ʒ","dʒ","t ɾ","g","k ɾ","ʃ","f ɾ","b ɾ","g ɾ","k l","p l","tʃ","z","f l","p s","k w","g w","g l","d ɾ","b l","ts","v l","k s","n g","dʒ ɾ","k n","k z","ɲ","t l","m n","k t","ʃ x"],"codas":["","s","x","w","z","ʃ","k s","d ɾ","w s","p s","d s","d w","x w","k ɾ","s n","x s"]},"french":{"phones":["ʁ","a","e","i","ɔ","s","t","ɛ","l","j","ə","k","d","p","ɑ","m","n","z","b","f","y","v","g","u","ʒ","ʃ","o","w","ɥ","œ","ø","ɲ","dʒ","tʃ","ŋ","ts","dz"],"onsets":["","d","ʁ","k","s","p","m","b","f","t","p ʁ","l","v","t ʁ","ʃ","g","ʒ","n","g ʁ","k ʁ","f ʁ","b ʁ","p l","k l","f l","s t","b l","g l","p w","p j","z","s p","d ʁ","s k","v j","j","v w","d j","s t ʁ","k ɥ","m w","k w","f w","s ɥ","s w","w","ʒ w","b w","n w","b j","p s","ʃ j","s j","l j","ʁ ɥ","s k ʁ","s l","p ɥ","t j","t w","b ʁ ɥ","s n","k ʁ w","n j","ɥ","ʃ l","v ʁ","f j","m j","k l w","ʃ w","dʒ","t ɥ","z j","l w","ʃ v","g w","s m","n ɥ","ʁ w","f ʁ w","s k w","d w","s k l","f l ɥ","f ɥ","s p ʁ","b ʁ w","ʃ ɥ","p l w","s k j","m ɥ","p t","tʃ","d ɥ","ts","t ʁ w","b ɥ","k j","p n","d ʁ w","l ɥ"],"codas":["","s","ʁ","t","m","l","z","n","k","ʒ","b l","d","s t","f","v","s m","j","ʃ","p","t ʁ","ʁ d","g","ɲ","b","ʁ t","ʁ n","k t","ʁ s","d ʁ","ʁ m","k s","s k","ŋ","ʁ ʒ","b ʁ","v ʁ","s t ʁ","l t","ʁ k","f l","k l","ʁ b","p l","g l","g ʁ","p t","k ʁ","f ʁ","ʁ v","ʁ ʃ","tʃ","ʁ l","l p","ʁ g","f t","p s","l k","l s","p ʁ","ʁ p","ʁ f","k s t","l m","ʁ d ʁ","ʁ t ʁ","g m","ʁ ɲ","l f","ʁ k l"]},"finnish":{"phones":["i","ɑ","t","s","e","k","u","l","n","o","r","m","p","v","æ","h","y","j","d","ø","g","f","b","ts","w","z","x","q","dz","dʒ"],"onsets":["k","","p","s","t","v","l","m","h","r","n","j","d","f","b","p r","k r","g","t r","s t","p l","s p","s k","k l","g r","b r","f r","p s","f l","k v","s t r","d r","ts","g l","s l","b l","z","s m","w","s p r","s n","s v","s h","g n","t w","k h","k n","s q","t h","dʒ","k s"],"codas":["","s","n","t","r","l","m","p","n g","h","k","w","d","n d","s t","k s","g","x","n t"]}};

// The spelling modules operate on a shared phonological plan. Observed word-edge
// clusters are conservative evidence for syllable edges, with explicit extensions
// for systems whose writing supports forms absent from the pronunciation list.
const targetPhonology={
  korean:     {insert:'ɯ',onset:2,coda:1,glides:true},
  japanese:   {insert:'ɯ',onset:2,coda:1,glides:true,syllabic:'n ŋ ɴ'},
  english:    {insert:'ə',onset:3,coda:4,borrowed:true},
  mandarin:   {insert:'ə',onset:2,coda:1,inventory:true,repairVowel:'ə'},
  cantonese:  {insert:'ɐ',onset:2,coda:1,inventory:true,repairVowel:'ɐ'},
  arabic:     {insert:'i',onset:1,coda:2,borrowed:true},
  persian:    {insert:'e',onset:1,coda:2,borrowed:true},
  khmer:      {insert:'a',onset:2,coda:1,borrowed:true,nucleusPairs:'ae ao aə ea ie iə oa ou uə ɨə ʊə əɨ'},
  odia:       {insert:'ɔ',onset:2,coda:1,borrowed:true,spellMedialGlideAsVowel:true},
  dutch:      {insert:'ə',onset:3,coda:4,borrowed:true,spellMedialGlideAsVowel:true},
  norwegian:  {insert:'ə',onset:3,coda:3,borrowed:true},
  german:     {insert:'ə',onset:3,coda:4,borrowed:true,spellMedialGlideAsVowel:true},
  romanian:   {insert:'ə',onset:3,coda:3,borrowed:true},
  malay:      {insert:'ə',onset:2,coda:1,borrowed:true},
  vietnamese: {insert:'ɯ',onset:2,coda:1,inventory:true,repairVowel:'ɤ',nucleusPairs:'iə uə ɯə oa oe uy'},
  swahili:    {insert:'i',onset:3,coda:1,borrowed:true,syllabic:'m n',syllabicBeforeConsonant:true},
  swedish:    {insert:'ə',onset:3,coda:3,borrowed:true,spellMedialGlideAsVowel:true},
  spanish:    {insert:'e',onset:2,coda:2,prothesis:'s',borrowed:true,spellMedialGlideAsVowel:true},
  icelandic:  {insert:'ʏ',onset:3,coda:3,borrowed:true,spellMedialGlideAsVowel:true},
  esperanto:  {insert:'o',onset:3,coda:3,borrowed:true},
  italian:    {insert:'e',onset:3,coda:2,borrowed:true},
  jamaican:   {insert:'a',onset:3,coda:3,borrowed:true,syllabic:'m n l'},
  portuguese: {insert:'i',onset:2,coda:2,borrowed:true,nucleusPairs:'iʊ eʊ ɛʊ ɔɪ oɪ ɔʊ',syllabicExpansion:false},
  french:     {insert:'ə',onset:3,coda:3,borrowed:true,syllabicExpansion:false},
  finnish:    {insert:'i',onset:2,coda:2,borrowed:true},
};

const writtenSyllables={...chineseSyllables,vietnamese:vietnameseSyllables};
const phonemeSequenceKey=phones=>phones.map(phone=>phone.sound+phone.marks).join('.');
const phonesOf=(values,source)=>values.flatMap(ipa=>tokenizeIPA(ipa,source).filter(token=>token.sound));
const targetCatalog=new Map();
const phoneChoices=new Map();

const supportedWritingPhones={
  japanese:'a i ɯ e o p b t d k g n m ŋ ɲ ɴ ɾ r j w h f v s z ʃ ʒ tʃ dʒ ts ç ʔ ʕ',
  korean:'a ɛ e ʌ o u ɯ i p b t d k g n m ŋ ɲ ɾ ɹ r l ʁ j w ɥ ɰ h f v s z ʃ ʒ tʃ dʒ tɕ dʑ ts ʔ',
  english:'a æ ɑ ɒ ʌ ə ɝ ɚ ɛ e i ɪ o ɔ ʊ u p b t d k g m n ŋ ɲ w j ɹ ɾ l f v θ ð s z ʃ ʒ tʃ dʒ h',
  arabic:'a i u p b t d k q g f v θ ð s z ʃ ʒ x ɣ h ħ ʕ ʔ m n l r w j tʃ dʒ',
  persian:'a ɑ e i o u p b t d k g q f v s z ʃ ʒ x ɣ h ʔ m n l r j w tʃ dʒ',
};

const codaExtensions={
  japanese:'n m ŋ ɲ ɴ',
  korean:'k n t l m p ŋ',
  vietnamese:'p t k m n ŋ ɲ',
  spanish:'n s l r',
};

const vowelChoices={
  japanese:map('ʌ=o ə=e ɛ=e æ=a ɑ=a ɯ=ɯ u=ɯ ʊ=ɯ ɔ=o ɒ=o'),
  korean:map('ə=ʌ æ=ɛ ɑ=a ɔ=o ɒ=o ɪ=i ʊ=u ʉ=u ɐ=a ɜ=ʌ'),
};
const singletonKana=new Set(['ʔ','ʕ']);

function soundId(value) {
  return value==='ɡ'?'g':value;
}

function pronunciationCatalog(target) {
  if(targetCatalog.has(target))return targetCatalog.get(target);
  const config=targetPhonology[target], evidence=phonologyEvidence[target];
  if(!config||!evidence)throw Error('Missing pronunciation profile for '+target);
  const symbols=[...new Set([...(supportedWritingPhones[target]?.split(' ')??[]),config.insert,...evidence.phones])];
  const native=phonesOf(symbols,target);
  const phonemes=new Map(native.map(token=>[soundId(token.sound),token]));
  const onsets=new Set(evidence.onsets);
  const codas=new Set([...evidence.codas,...(codaExtensions[target]?.split(' ')??[])]);
  const nucleusPairs=new Set(config.nucleusPairs?.split(' '));
  const syllabic=new Set(config.syllabic?.split(' '));
  const catalog={...config,nucleusPairs,phonemes,inserted:phonemes.get(config.insert),onsets,codas,syllabic};
  if(config.inventory) {
    catalog.lexicalSyllables=writtenSyllables[target].map(([text,ipa,accent])=>({text,accent,phones:phonesOf([ipa],target)}))
      .filter(record=>record.phones.length);
    const observed=new Map();
    for(const row of catalog.lexicalSyllables)for(const phone of row.phones) {
      const key=phone.sound+phone.marks;
      if(!observed.has(key))observed.set(key,phone);
      const equivalent=observed.get(key);
      equivalent.inventoryIndex??=observed.size-1;
      phone.inventoryIndex=equivalent.inventoryIndex;
    }
    catalog.inventoryExact=new Map();
    for(const row of catalog.lexicalSyllables) {
      const key=phonemeSequenceKey(row.phones);
      if(!catalog.inventoryExact.has(key))catalog.inventoryExact.set(key,row);
    }
    catalog.inventoryPhones=[...observed.values()];
    catalog.inventoryCosts=new Map();
    if(config.repairVowel) {
      catalog.repairNucleus=phonesOf([config.repairVowel],target)[0];
      catalog.repairSyllables=catalog.lexicalSyllables.filter(row=>row.phones.length===2&&!row.phones[0].vowel&&row.phones[1].vowel);
      catalog.repairOnsets=new Map();
    }
    catalog.inventoryWidth=1+Math.max(...catalog.lexicalSyllables.map(row=>row.phones.length));
    catalog.glideOnsets=new Set(catalog.lexicalSyllables.flatMap(({phones})=>
      !phones[0].vowel&&oralGlides.has(phones[1]?.sound)&&phones[2]?.vowel?[clusterKey(phones.slice(0,2))]:[]));
  }
  targetCatalog.set(target,catalog);
  return catalog;
}

function spellingSupportsSound(token,target) {
  const symbol=token.vowel ? token.sound : phoneticBase[token.sound];
  if(latinRules[target])return Object.hasOwn(latinRules[target],symbol)||Object.hasOwn(basicLatin,symbol)||/^[a-z]$/u.test(symbol??'');
  if(target==='arabic'||target==='persian')return token.vowel || Object.hasOwn(abjadConsonants,symbol);
  if(target==='khmer'||target==='odia')return token.vowel || Object.hasOwn(indic[target].consonants,symbol);
  return false;
}

function targetPhone(token,target,profile) {
  const sound=soundId(token.sound);
  const preferred=token.vowel?vowelChoices[target]?.[sound]:undefined;
  if(!preferred&&(profile.phonemes.has(sound) || profile.borrowed && spellingSupportsSound(token,target)))return token;
  const key=target+':'+token.sound;
  if(!phoneChoices.has(key)) {
    let best=Infinity,chosen=profile.phonemes.get(preferred);
    if(!chosen) {
      for(const native of profile.phonemes.values()) {
        if(native.vowel!==token.vowel)continue;
        const cost=phoneDistance({...token,marks:'',length:false,nasal:false},native);
        if(cost<best){best=cost;chosen=native;}
      }
    }
    phoneChoices.set(key,chosen??token);
  }
  const chosen=phoneChoices.get(key);
  return {...token,sound:chosen.sound,vowel:chosen.vowel};
}

const sourceNucleusPairs={
  vietnamese:new Set('iə uə ɯə'.split(' ')),
  cantonese:new Set('ai au aɪ aʊ ei ou ɵy œy ɐi ɐu ɛu ɔi ui iu ɛi'.split(' ')),
};

function syllableNuclei(word,extraPairs,source,separateVowels=false) {
  const sourcePairs=sourceNucleusPairs[source];
  const groups=[];
  for(let index=0;index<word.length;index++) {
    const token=word[index];
    if(!token.vowel&&!token.marks.includes('̩'))continue;
    const previous=groups.at(-1);
    const prior=word[index-1];
    const pair=prior?.sound+token.sound;
    const nativeDiphthong=sourcePairs?.has(pair);
    const nonsyllabic=token.marks.includes('̯');
    if(previous?.end===index && !token.syllableStart && !prior.tone && (!prior.length||nativeDiphthong||nonsyllabic) &&
      previous.end-previous.start<2 && (nonsyllabic||!separateVowels&&(nativeDiphthong||diphthongs.has(pair)||extraPairs?.has(pair)))) {
      previous.end++;
    } else groups.push({start:index,end:index+1});
  }
  return groups;
}

function sourceSyllableEdge(cluster,followingVowel) {
  const dot=followingVowel?.writtenBoundary?cluster.length:cluster.findLastIndex(phone=>phone.writtenBoundary);
  if(dot>=0)return {offset:dot,weight:1.12,kind:'explicit'};
  const tonal=cluster.findLastIndex(phone=>phone.tone);
  if(tonal>=0)return {offset:tonal+1,weight:1,kind:'tone'};
  const coda=cluster.findLastIndex(phone=>phone.coda||phone.syllabicCoda);
  if(coda>=0)return {offset:coda+1,weight:0.96,kind:'unreleased'};
  const stress=followingVowel?.syllableStart?cluster.length:cluster.findLastIndex(phone=>phone.syllableStart);
  if(stress>=0)return {offset:stress,weight:0.62,kind:'stress'};
  return null;
}

function clusterKey(phones) {
  return phones.map(phone=>soundId(phone.sound)).join(' ');
}

function onsetFits(phones,profile) {
  if(phones.length<=1)return true;
  if(profile.glides&&phones.length===2&&oralGlides.has(phones[1].sound))return true;
  return phones.length<=(profile.borrowed?Math.max(profile.onset,4):profile.onset) && (profile.borrowed||profile.onsets.has(clusterKey(phones)));
}

function codaFits(phones,profile,target) {
  if(!phones.length)return true;
  if(target==='japanese')return phones.length===1 && (
    ['n','m','ŋ','ɲ','ɴ'].includes(phones[0].sound) || phones[0].coda && ['p','t','k'].includes(phones[0].sound)
  );
  if(target==='korean')return phones.length===1 && Object.hasOwn(codaKor,phoneticBase[phones[0].sound]);
  return phones.length<=(profile.borrowed?Math.max(profile.coda,4):profile.coda) && (profile.borrowed||profile.codas.has(clusterKey(phones)));
}

function repairedSyllables(cluster,profile,target) {
  const repairs=[];
  for(let offset=0;offset<cluster.length;) {
    let end=Math.min(cluster.length,offset+profile.onset);
    while(end>offset+1 && !onsetFits(cluster.slice(offset,end),profile))end--;
    const onset=cluster.slice(offset,end);
    const last=onset.at(-1);
    const vowel=target==='japanese' && ['t','d'].includes(last.sound) ? profile.phonemes.get('o') : profile.inserted;
    repairs.push({onset,nucleus:[{...vowel,inserted:true}],coda:[]});
    offset=end;
  }
  return repairs;
}

function chooseCluster(cluster,profile,target,hasPrevious,hasNext,followingVowel) {
  const edge=hasPrevious&&hasNext?sourceSyllableEdge(cluster,followingVowel):null;
  let best=null;
  const maxCoda=hasPrevious?Math.min(profile.borrowed?Math.max(profile.coda,4):profile.coda,cluster.length):0;
  for(let left=0;left<=maxCoda;left++) {
    const coda=cluster.slice(0,left);
    if(!codaFits(coda,profile,target))continue;
    const maxOnset=hasNext?Math.min(profile.borrowed?Math.max(profile.onset,4):profile.onset,cluster.length-left):0;
    for(let right=0;right<=maxOnset;right++) {
      const onset=right?cluster.slice(-right):[];
      if(!onsetFits(onset,profile) || (!hasPrevious&&profile.prothesis&&onset.length>=2&&onset[0].sound===profile.prothesis))continue;
      const middle=cluster.slice(left,cluster.length-right);
      const repairs=middle.length?repairedSyllables(middle,profile,target):[];
      if(profile.prothesis && !hasPrevious && hasNext && middle[0]?.sound===profile.prothesis) {
        const prepended={onset:[],nucleus:[{...profile.inserted,inserted:true}],coda:[middle[0]]};
        repairs.splice(0,repairs.length,prepended,...repairedSyllables(middle.slice(1),profile,target));
      }
      const unattested=(coda.length&&!profile.codas.has(clusterKey(coda))?0.22:0)+
        (onset.length>1&&!profile.onsets.has(clusterKey(onset))?0.33:0);
      const crossing=edge?Math.max(0,left-edge.offset)+Math.max(0,edge.offset-(cluster.length-right)):0;
      const penalty=repairs.length*4+middle.length*0.12+left*0.015-right*0.025+unattested+crossing*(edge?.weight??0);
      if(!best || penalty<best.penalty)best={coda,onset,repairs,penalty,edge};
    }
  }
  return best;
}

function composeSyllables(word,profile,target,source) {
  const nuclei=syllableNuclei(word,profile.nucleusPairs,source);
  if(!nuclei.length) {
    if(target==='japanese'&&word.length===1&&singletonKana.has(word[0].sound))return [{onset:word,nucleus:[],coda:[]}];
    return repairedSyllables(word,profile,target);
  }
  const output=[];
  let syllable;
  let offset=0;
  for(const {start,end} of nuclei) {
    const {coda,onset,repairs,edge}=chooseCluster(word.slice(offset,start),profile,target,Boolean(syllable),true,word[start]);
    if(syllable) {
      syllable.coda=coda;
      syllable.preserveCoda=edge?.kind==='explicit'||edge?.kind==='unreleased';
    }
    output.push(...repairs);
    syllable={onset,nucleus:word.slice(start,end),coda:[]};
    output.push(syllable);
    offset=end;
  }
  const final=chooseCluster(word.slice(offset),profile,target,true,false);
  syllable.coda=final.coda;
  output.push(...final.repairs);
  return output;
}

const inventorySelections=new Map();
const glideFeatures=map('j=00 ɥ=01 ɰ=10 w=11');

function inventoryPhoneCost(phone,reference,target,preserveGlides=false) {
  const cost=phoneDistance(phone,reference);
  const leftGlide=glideFeatures[phone.sound], rightGlide=glideFeatures[reference.sound];
  if(preserveGlides&&leftGlide&&rightGlide&&leftGlide[0]!==rightGlide[0]&&leftGlide[1]!==rightGlide[1])return cost+0.24;
  if(target!=='vietnamese')return cost;
  if(reference.sound==='c'&&phoneticBase[phone.sound]==='tʃ')return Math.min(cost,0.19);
  if(phone.vowel&&reference.vowel&&phone.marks.includes('̆')!==reference.marks.includes('̆'))return cost+0.16;
  return cost;
}

function selectInventorySyllable(phones,profile,target,previous,current,preserveGlides) {
  const fingerprint=phonemeSequenceKey(phones);
  const exact=profile.inventoryExact.get(fingerprint);
  if(exact)return {match:exact,cost:0};
  const compareGlides=preserveGlides&&phones.some(phone=>glideFeatures[phone.sound]);
  const key=target+(compareGlides?':glides:':':')+fingerprint;
  if(inventorySelections.has(key))return inventorySelections.get(key);
  const costs=phones.map(phone=>{
    const glideCost=compareGlides&&glideFeatures[phone.sound];
    const id=(glideCost?'glides:':'')+phone.sound+phone.marks;
    const cache=profile.inventoryCosts;
    if(!cache.has(id)) {
      if(cache.size>=2048)cache.clear();
      cache.set(id,Float64Array.from(profile.inventoryPhones,reference=>inventoryPhoneCost(phone,reference,target,glideCost)));
    }
    return cache.get(id);
  });
  let cost=Infinity, match;
  for(const record of profile.lexicalSyllables) {
    const lengthDifference=phones.length-record.phones.length;
    if(lengthDifference*(lengthDifference<0?-0.82:0.88)>=cost)continue;
    const distance=ipaSequenceDistance(phones,record.phones,previous,current,costs);
    if(distance<cost){cost=distance;match=record;}
    if(!cost)break;
  }
  const selected={match,cost};
  if(inventorySelections.size>=12000)inventorySelections.clear();
  inventorySelections.set(key,selected);
  return selected;
}

function inventoryRepairOnset(phone,profile,target) {
  const key=phone.sound+phone.marks;
  if(profile.repairOnsets.has(key))return profile.repairOnsets.get(key);
  let best, cost=Infinity;
  for(const row of profile.repairSyllables) {
    const [onset,vowel]=row.phones;
    const consonantCost=inventoryPhoneCost(phone,onset,target);
    if(consonantCost>0.44)continue;
    const difference=consonantCost+0.18*phoneDistance(profile.repairNucleus,vowel);
    if(difference<cost) {best=row;cost=difference;}
  }
  const result=best?{match:best,cost}:null;
  if(profile.repairOnsets.size>=1024)profile.repairOnsets.clear();
  profile.repairOnsets.set(key,result);
  return result;
}

function selectInventoryUnit(phones,profile,target,previous,current,allowRepair,preserveGlides) {
  const base=selectInventorySyllable(phones,profile,target,previous,current,preserveGlides);
  let best={...base,leading:null,trailing:null};
  if(!allowRepair||!profile.repairNucleus||base.cost<0.74||phones.length<3)return best;
  const isNucleus=phone=>phone.vowel||phone.marks.includes('̩');
  const firstVowel=phones.findIndex(isNucleus);
  if(firstVowel<0)return best;
  const lastVowel=phones.findLastIndex(isNucleus);
  for(const edge of ['leading','trailing']) {
    const atStart=edge==='leading';
    const clusterSize=atStart?firstVowel:phones.length-lastVowel-1;
    if(clusterSize<2)continue;
    const consonant=atStart?phones[0]:phones.at(-1);
    if(consonant.tone||consonant.length||['ʔ','ʕ'].includes(consonant.sound))continue;
    const repair=inventoryRepairOnset(consonant,profile,target);
    if(!repair)continue;
    const main=selectInventorySyllable(atStart?phones.slice(1):phones.slice(0,-1),profile,target,previous,current,preserveGlides);
    const cost=main.cost+repair.cost+0.62;
    if(base.cost-cost<0.12||cost>=best.cost)continue;
    best={...main,leading:null,trailing:null,[edge]:repair.match,cost};
  }
  return best;
}

function spellInventoryUnits(units,tones,target,divisions) {
  const syllables=[],written=[];
  for(const [index,{leading,match,trailing}] of units.entries()) {
    if(leading) {syllables.push(leading);written.push(leading.text);}
    syllables.push(match);
    written.push(inventoryToneSpelling(match.text,tones[index],target,match.accent));
    if(trailing) {syllables.push(trailing);written.push(trailing.text);}
  }
  return {syllables,notation:written.join(' '),divisions};
}

function planInventoryWord(word,profile,target,source,allowRepair=true,preserveGlides=false) {
  const before=new Float64Array(profile.inventoryWidth), after=new Float64Array(profile.inventoryWidth);
  const nuclei=syllableNuclei(word,profile.nucleusPairs,source);
  const finish=(units,tones,divisions)=>{
    const proposed=spellInventoryUnits(units,tones,target,divisions);
    if(!allowRepair||!units.some(unit=>unit.leading||unit.trailing))return proposed;
    const simpler=planInventoryWord(word,profile,target,source,false,preserveGlides);
    const phones=projection=>projection.syllables.flatMap(row=>row.phones);
    const baseline=phones(simpler), revised=phones(proposed);
    const width=1+Math.max(baseline.length,revised.length);
    const left=new Float64Array(width), right=new Float64Array(width);
    if(ipaSequenceDistance(word,revised,left,right)>ipaSequenceDistance(word,baseline,left,right)+1e-9)return simpler;
    return proposed;
  };
  if(nuclei.length<2) {
    const unit=selectInventoryUnit(word,profile,target,before,after,allowRepair,preserveGlides);
    const tone=syllableTone(word,nuclei[0]?.start??0,word.length,source);
    return finish([unit],[tone],[]);
  }
  let states=[{cut:0,cost:0}];
  for(let index=0;index<nuclei.length;index++) {
    const following=nuclei[index+1];
    const endings=following?inventoryBoundaries(word,nuclei[index],following):[{cut:word.length,penalty:0}];
    states=endings.map(({cut,penalty})=>{
      let best;
      for(const previous of states) {
        const unit=selectInventoryUnit(word.slice(previous.cut,cut),profile,target,before,after,allowRepair,preserveGlides);
        const total=previous.cost+unit.cost+penalty;
        if(!best||total<best.cost-1e-9)best={cut,cost:total,unit,previous};
      }
      return best;
    });
  }
  const units=[],divisions=[];
  for(let current=states[0];current.previous;current=current.previous) {
    units.push(current.unit);
    if(current.cut<word.length)divisions.push(current.cut);
  }
  units.reverse();
  divisions.reverse();
  const tones=nuclei.map(({start},index)=>syllableTone(word,start,nuclei[index+1]?.start??word.length,source));
  return finish(units,tones,divisions);
}

function selectInventoryWord(word,profile,target,source) {
  const base=planInventoryWord(word,profile,target,source);
  const originalGlides=word.filter(phone=>glideFeatures[phone.sound]).map(phone=>phone.sound);
  if(!originalGlides.length)return base;
  const candidate=planInventoryWord(word,profile,target,source,true,true);
  if(candidate.notation===base.notation)return base;
  const glidesKept=plan=>{
    const available=plan.syllables.flatMap(row=>row.phones.filter(phone=>glideFeatures[phone.sound]).map(phone=>phone.sound));
    let count=0;
    for(const glide of originalGlides) {
      const index=available.indexOf(glide);
      if(index<0)continue;
      available.splice(index,1);
      count++;
    }
    return count;
  };
  if(glidesKept(candidate)<=glidesKept(base))return base;
  const original=comparisonPhones(word);
  const distance=plan=>{
    const spoken=comparisonPhones(plan.syllables.flatMap(row=>row.phones));
    const left=new Float64Array(spoken.length+1),right=new Float64Array(spoken.length+1);
    return ipaSequenceDistance(original,spoken,left,right);
  };
  // Keep the glide contrast when the whole pronunciation is closer or nearly tied.
  return distance(candidate)<=distance(base)+0.015?candidate:base;
}

const syllabicSonorants=new Set('m n ŋ ɲ ɳ ɴ ɱ l ɫ ɭ ʎ'.split(' '));
const isPortableSyllabic=phone=>!phone.vowel&&phone.marks.includes('̩')&&syllabicSonorants.has(phone.sound);

// A written syllable needs a vowel when the target cannot use this
// consonant as its nucleus. Keep the consonant on a writable side of it.
function spellableSyllabicNuclei(word,profile,target) {
  if(profile.inventory||profile.syllabicExpansion===false||!word.some(isPortableSyllabic))return word;
  return word.flatMap((phone,index)=>{
    if(!isPortableSyllabic(phone))return [phone];
    const next=word[index+1];
    if(profile.syllabic.has(phone.sound)&&(!profile.syllabicBeforeConsonant||next&&!next.vowel))return [phone];
    const {syllableStart,writtenBoundary,stress,tone,tonalGlottalization,...plain}=phone;
    const consonant={...plain,marks:phone.marks.replace(/̩/gu,'')};
    const vowel={sound:target==='japanese'||target==='korean'?'ɯ':'ə',marks:'',vowel:true,
      length:false,nasal:false,coda:false,inserted:true,syllableStart:true};
    const canClose=target!=='japanese'&&target!=='swahili'&&codaFits([targetPhone(consonant,target,profile)],profile,target);
    if(canClose)return [
      {...vowel,writtenBoundary,stress},
      {...consonant,tone,tonalGlottalization,syllabicCoda:true},
    ];
    return [{...consonant,syllableStart,writtenBoundary,stress},{...vowel,tone,tonalGlottalization}];
  });
}

const palatalPhones=new Set('c ɟ ɲ ʎ ç ʝ ɕ ʑ tɕ dʑ'.split(' '));
const frontGlideVowels=new Set('i ɪ y ʏ'.split(' '));

function writesSecondaryGlide(phone,vowel,glide,profile,target) {
  if(target==='korean'){
    const adapted=targetPhone(vowel,target,profile);
    return Object.hasOwn(glidesKor,glide+vowelKor[adapted.sound]);
  }
  if(target==='japanese'){
    const base=phoneticBase[phone.sound];
    const key=kanaConsonant[base]??base;
    if(glide==='j')return Object.hasOwn(kanaRows,kanaPalatalConsonants[key]??key+'y');
    return Boolean(kanaRoundedRows[key]?.['aiueo'.indexOf(fiveVowels[vowel.sound])]);
  }
  const onset=soundId(phone.sound)+' '+glide;
  if(profile.inventory)return profile.glideOnsets.has(onset)||profile.glideOnsets.has(voicelessPeers[phone.sound]+' '+glide);
  if(target==='spanish')return false;
  if(target==='romanian'&&['k','g'].includes(soundId(phone.sound))&&glide==='j'&&['e','ɛ'].includes(vowel.sound))return false;
  return profile.onsets.has(onset);
}

// Reuse an attested consonant + glide only where it can be written before a vowel.
function projectSecondaryGlides(word,profile,target) {
  if(!word.some(phone=>!phone.vowel&&/[ʲʷ]/u.test(phone.marks)))return word;
  return word.flatMap((phone,index)=>{
    const next=word[index+1];
    if(phone.vowel||phone.coda||phone.tone||!next?.vowel||next.syllableStart||oralGlides.has(phone.sound))return [phone];
    const palatal=phone.marks.includes('ʲ'), rounded=phone.marks.includes('ʷ');
    if(palatal===rounded)return [phone];
    if(palatal&&(palatalPhones.has(phone.sound)||frontGlideVowels.has(next.sound)))return [phone];
    const glide=palatal?'j':'w';
    if(!writesSecondaryGlide(phone,next,glide,profile,target))return [phone];
    const consonant={...phone,marks:phone.marks.replace(palatal?'ʲ':'ʷ','')};
    return [consonant,{sound:glide,marks:'',vowel:false,length:false,nasal:false,coda:false,secondaryGlide:true}];
  });
}

const palatalLatinOnsets={swedish:map('ɕ=tj')};
const mergedLatinGlides=Object.fromEntries(Object.entries({
  dutch:'tɕ',
  norwegian:'tɕ dʑ',
  german:'ɕ tɕ',
  swedish:'ɕ dʑ',
  icelandic:'ɕ ʑ tɕ dʑ ɲ',
  romanian:'tɕ dʑ ɲ ʎ',
  esperanto:'ɲ ʎ',
}).map(([language,sounds])=>[language,new Set(sounds.split(' '))]));

function absorbLatinPalatalGlides(word,target) {
  const onsets=mergedLatinGlides[target];
  if(!onsets||!word.some(phone=>phone.sound==='j'))return word;
  return word.filter((glide,index)=>{
    const onset=word[index-1],vowel=word[index+1];
    return glide.sound!=='j'||glide.syllableStart||glide.tone||glide.coda||glide.marks||
      !vowel?.vowel||vowel.syllableStart||!onsets.has(onset?.sound)||onset.coda||onset.tone||
      target==='swedish'&&onset.sound==='ɕ'&&phoneticBase[word[index-2]?.sound]==='s';
  });
}

const fortisLengthTargets=new Set(['japanese','finnish','italian','arabic','persian','swedish','norwegian','odia']);
const koreanFortisObstruents=new Set(['k','t','p','s','ɕ','tɕ']);

function projectKoreanFortis(word,source,target) {
  if(source!=='korean'||!fortisLengthTargets.has(target))return word;
  return word.map((phone,index)=>{
    if(!phone.marks.includes('͈')||!koreanFortisObstruents.has(phone.sound)||
      !word[index-1]?.vowel||phone.coda)return phone;
    const next=word[index+1];
    // A marked Persian consonant before waw can turn the vowel into /v/.
    if(target==='persian'&&persianVowelLetters[next?.sound]==='و')return phone;
    const kanaGlide=target==='japanese'&&next?.sound==='j'&&word[index+2]?.vowel;
    if(!next?.vowel&&!kanaGlide)return phone;
    return {...phone,length:true};
  });
}

function planTargetWord(input,source,target) {
  input=projectKoreanFortis(input,source,target);
  const profile=pronunciationCatalog(target);
  if(target==='romanian'&&input.at(-1).marks.includes('ʲ')&&!input.some(phone=>phone.vowel)){
    // Romanian still needs a vowel in clusters such as /ɡrʲ/ for gri.
    input=[...input,profile.phonemes.get('i')];
  }
  const [first]=input;
  // Cantonese dictionary entries also use a bare nasal for these whole syllables.
  const nuclei=source==='cantonese'&&input.length===1&&['m','ŋ'].includes(first.sound)&&!first.marks.includes('̩') ?
    [{...first,marks:first.marks+'̩'}] : input;
  const spellable=absorbLatinPalatalGlides(projectSecondaryGlides(spellableSyllabicNuclei(nuclei,profile,target),profile,target),target);
  if(profile.inventory)return selectInventoryWord(spellable,profile,target,source);

  const prepared=['japanese','korean'].includes(target) ? adaptMoraicTokens(spellable,source,target) : spellable;
  const adapted=prepared.map(phone=>{
    const written=profile.spellMedialGlideAsVowel&&phone.medialGlide
      ? {...phone,sound:'u',vowel:true}
      : phone;
    return targetPhone(written,target,profile);
  });
  const syllables=composeSyllables(adapted,profile,target,source);
  const marksCodas=target==='korean'||target==='japanese';
  const phones=syllables.flatMap(({onset,nucleus,coda,preserveCoda})=>[
    ...onset,...nucleus,...(marksCodas&&preserveCoda?coda.map(phone=>({...phone,plannedCoda:true})):coda),
  ]);
  return {syllables,phones};
}

// Khmer monosyllable evidence from the pinned IPA-Translator dictionary.
const khmerSpellingEvidence={"onsets":{"k":[["ក",0,43],["គ",1,20]],"kʰ":[["ខ",0,16],["ឃ",1,2]],"ŋ":[["ង",1,6],["ង៉",0,1]],"c":[["ច",0,39],["ជ",1,24]],"cʰ":[["ឆ",0,12],["ឈ",1,9]],"ɲ":[["ញ",1,5],["ញ៉",0,1]],"d":[["ដ",0,35],["ឌ",1,2]],"n":[["ន",1,25],["ណ",0,8]],"t":[["ទ",1,33],["ត",0,19]],"tʰ":[["ថ",0,10],["ធ",1,10]],"b":[["ប",0,42],["ប៊",1,1]],"p":[["ព",1,30],["ប៉",0,13]],"pʰ":[["ផ",0,9],["ភ",1,7]],"m":[["ម",1,27],["ម៉",0,15]],"j":[["យ",1,14],["យ៉",0,2]],"r":[["រ",1,38],["រ៉",0,1]],"l":[["ល",1,33],["ឡ",0,9]],"v":[["វ",1,16],["វ៉",0,2]],"s":[["ស",0,38],["ស៊",1,9]],"h":[["ហ",0,31],["ហ៊",1,2]],"ʔ":[["អ",0,30],["អ៊",1,9]]},"codas":{"":[["",84]],"k":[["ក",75],["ខ",3],["គ",2],["ឃ",1]],"ŋ":[["ង",70]],"t":[["ត",58],["ទ",4],["ដ",1]],"p":[["ប",45],["ព",2]],"m":[["ំ",25],["ម",23]],"c":[["ច",25],["ជ",3]],"n":[["ន",56],["ណ",1]],"j":[["យ",36]],"l":[["ល",34],["រ",2]],"v":[["វ",13]],"h":[["ស",41],["ះ",32]],"ɲ":[["ញ",12]]},"nuclei":{"0|":[["aː","ា","","",11],["ae","ែ","","",6],["ɑː","","","",6],["eː","េ","","",3],["ou","ូ","","",3],["aː","ា","","៎",2],["aə","ើ","","",2],["ao","ោ","","",2],["ɑː","","","៏",2],["ɑː","","","៎",1],["eː","េ","","៎",1],["əɨ","ឺ","","",1],["ou","ូ","","៎",1],["uə","ួ","","",1]],"0|k":[["ae","ែ","ក","",7],["a","ា","ក","់",6],["ɑ","","ក","់",5],["aː","ា","ក","",4],["ɑː","","ក","",4],["o","ុ","ក","",3],["ao","ោ","ក","",2],["eː","េ","ក","",2],["ə","ឹ","ក","",2],["ou","ូ","ក","",2],["aə","ើ","ក","",1],["iə","ៀ","ក","",1],["o","ុ","ខ","",1]],"0|ŋ":[["ɑː","","ង","",8],["ɑ","","ង","់",7],["ə","ឹ","ង","",6],["aː","ា","ង","",5],["ae","ែ","ង","",4],["ao","ោ","ង","",3],["o","ុ","ង","",3],["aə","ើ","ង","",1],["ə","ិ","ង","",1],["ɨə","ឿ","ង","",1],["uə","ួ","ង","",1]],"0|t":[["aː","ា","ត","",5],["ɑ","","ត","់",5],["a","ា","ត","់",4],["ə","ិ","ត","",4],["ɑː","","ត","",3],["ou","ូ","ត","",3],["aə","ើ","ត","",2],["ao","ោ","ត","",2],["o","ុ","ត","",2],["uə","ួ","ត","",2],["aː","ា","ទ","",1],["ɑ","","ទ","",1],["ə","ិ","ទ","",1],["əɨ","ឺ","ត","",1],["iə","ៀ","ត","",1],["ou","ូ","ដ","",1]],"0|p":[["a","ា","ប","់",5],["ɑ","","ប","់",4],["aː","ា","ប","",3],["ae","ែ","ប","",3],["ou","ូ","ប","",3],["aə","ើ","ប","",2],["ɑː","","ប","",2],["ae","េ","ព","",1],["ə","េ","ប","",1],["iə","ៀ","ប","",1]],"0|m":[["a","ា","ំ","",5],["ɑ","","ំ","",4],["o","ុ","ំ","",4],["aː","ា","ម","",3],["ae","ែ","ម","",2],["aə","ើ","ម","",2],["iə","ៀ","ម","",2],["ou","ូ","ម","",2],["ao","ោ","ម","",1],["ɑː","","ម","",1],["ə","ឹ","ម","",1],["o","ុ","ម","",1]],"0|c":[["aː","ា","ច","",4],["a","ា","ច","់",3],["ou","ូ","ច","",3],["aə","ើ","ច","",2],["o","ុ","ច","",2],["ə","ិ","ច","",1],["ə","េ","ច","",1],["o","ុ","ជ","",1],["uː","ូ","ច","",1],["uə","ួ","ច","",1]],"0|n":[["aː","ា","ន","",7],["a","ា","ន","់",4],["ə","ិ","ន","",4],["ae","ែ","ន","",2],["iə","ៀ","ន","",2],["ou","ូ","ន","",2],["uə","ួ","ន","",2],["ae","េ","ន","",1],["aə","ើ","ន","",1],["ɑ","","ន","់",1],["eː","េ","ន","",1],["əɨ","ឺ","ន","",1],["o","ុ","ន","",1]],"0|j":[["aə","ើ","យ","",4],["aː","ា","យ","",3],["o","ុ","យ","",3],["oː","ូ","យ","",2],["ou","ូ","យ","",2],["ao","ោ","យ","",1],["əː","ើ","យ","",1]],"0|l":[["aː","ា","ល","",3],["ɑ","","ល","់",2],["ou","ូ","ល","",2],["uə","ួ","ល","",2],["a","ា","ល","់",1],["ae","ែ","ល","",1],["ao","ោ","ល","",1],["ɑ","","ល","",1],["ɑː","","ល","",1],["ə","ី","ល","",1],["ə","ឹ","រ","",1]],"0|v":[["aː","ា","វ","",5],["ae","ែ","វ","",2],["eː","េ","វ","",2],["ə","ូ","វ","",1],["iə","ៀ","វ","",1]],"0|h":[["e","េ","ះ","",7],["ɑ","ោ","ះ","",6],["aː","ា","ស","",4],["ɑ","","ស","់",4],["a","ា","ស","់",3],["o","ុ","ស","",3],["a","","ះ","",2],["ao","ោ","ស","",2],["o","ុ","ះ","",2],["uə","ួ","ស","",2],["ae","ែ","ស","",1],["eː","េ","ស","",1],["iə","ៀ","ស","",1],["ɨ","ឺ","ះ","",1],["ou","ូ","ស","",1]],"1|":[["ɔː","","","",9],["iː","ី","","",8],["ie","ា","","",6],["eː","េ","","",4],["əː","ើ","","",4],["uː","ូ","","",4],["ɨː","ឺ","","",3],["ae","ែ","","",1],["ɛː","ែ","","",1],["ɨə","ឿ","","",1],["oː","ោ","","",1]],"1|t":[["oa","ា","ត","់",4],["uː","ូ","ត","",4],["ɨ","ិ","ត","",3],["u","ុ","ត","",3],["ɨ","ឹ","ត","",2],["oː","ោ","ត","",2],["ʊə","","ត","់",2],["ie","ា","ត","",1],["iə","ៀ","ត","",1],["ɨː","ឺ","ត","",1],["ɔː","","ត","",1],["uː","ូ","ទ","",1]],"1|p":[["u","","ប","់",5],["oa","ា","ប","់",4],["ie","ា","ប","",3],["əː","ើ","ប","",2],["u","ុ","ប","",2],["uː","ូ","ប","",2],["eː","េ","ប","",1],["ie","ា","ព","",1],["iə","ៀ","ប","",1],["uə","ួ","ប","",1]],"1|l":[["oa","ា","ល","់",3],["ʊə","","ល","់",3],["iə","ៀ","ល","",2],["oː","ោ","ល","",2],["uə","ួ","ល","",2],["eː","េ","ល","",1],["əː","ើ","ល","",1],["ɛː","ែ","ល","",1],["ie","ា","ល","",1],["ɨ","ិ","ល","",1],["ɨ","ី","រ","",1],["u","ុ","ល","",1],["uː","ូ","ល","",1]],"1|h":[["oa","ា","ស","់",5],["ea","","ះ","",4],["əː","ើ","ស","",4],["u","ុ","ះ","",4],["uː","ូ","ស","",3],["eː","េ","ស","",2],["i","ិ","ះ","",2],["ʊə","ោ","ះ","",2],["i","េ","ះ","",1],["ie","ា","ស","",1],["ɨ","ិ","ស","",1],["ɨ","ឹ","ស","",1],["oː","ោ","ស","",1],["u","ោ","ះ","",1],["ʊə","","ស","់",1]],"1|k":[["ea","ា","ក","់",5],["oː","ោ","ក","",4],["ɔː","","ក","",4],["ɨ","ឹ","ក","",3],["u","ុ","ក","",3],["uː","ូ","ក","",3],["uə","ួ","ក","",3],["ʊə","","ក","់",3],["ɛː","ែ","ក","",2],["ie","ា","ក","",2],["ie","ា","គ","",2],["eː","េ","ក","",1],["eː","េ","ខ","",1],["eː","េ","ឃ","",1],["əː","ើ","ក","",1],["iː","ី","ក","",1],["iə","ៀ","ក","",1],["u","ុ","ខ","",1]],"1|n":[["oa","ា","ន","់",5],["ie","ា","ន","",4],["uː","ូ","ន","",3],["iə","ៀ","ន","",2],["u","ុ","ន","",2],["uə","ួ","ន","",2],["ʊə","","ន","់",2],["eː","េ","ន","",1],["ɛː","ែ","ន","",1],["i","ិ","ន","",1],["ie","ៀ","ន","",1],["ɨ","ិ","ន","",1],["ɨə","ឿ","ន","",1],["u","ុ","ណ","",1],["ʊə","","ន","",1]],"1|ŋ":[["ie","ា","ង","",5],["ɛː","ែ","ង","",3],["iː","ី","ង","",3],["ɨ","ឹ","ង","",3],["eː","េ","ង","",2],["əː","ើ","ង","",2],["iə","ៀ","ង","",2],["ɨə","ឿ","ង","",2],["ɔː","","ង","",2],["u","ុ","ង","",2],["ɨ","ិ","ង","",1],["oː","ោ","ង","",1],["uː","ូ","ង","",1],["ʊə","","ង","់",1]],"1|c":[["ɨ","េ","ច","",2],["uə","ួ","ច","",2],["i","ិ","ច","",1],["ɨ","ិ","ច","",1],["u","ុ","ជ","",1],["uː","ូ","ច","",1],["uː","ូ","ជ","",1]],"1|ɲ":[["ɨ","ិ","ញ","",3],["u","ុ","ញ","",2],["əː","ើ","ញ","",1],["ie","ា","ញ","",1],["ɨ","េ","ញ","",1]],"1|j":[["ie","ា","យ","",7],["uə","ួ","យ","",4],["əː","ើ","យ","",2],["ɔː","","យ","",2],["a","ា","យ","",1],["ɨə","ឿ","យ","",1],["ou","ូ","យ","",1],["u","ុ","យ","",1],["uː","ូ","យ","",1]],"0|ɲ":[["a","ា","ញ","់",2],["ə","េ","ញ","",2]],"1|m":[["oa","ា","ំ","",4],["u","ុ","ំ","",4],["ie","ា","ម","",2],["o","","ំ","",2],["u","","ំ","",2],["əː","ើ","ម","",1],["iː","ី","ម","",1],["iə","ៀ","ម","",1],["oː","ោ","ម","",1],["u","ុ","ម","",1],["uə","ួ","ម","",1]],"1|v":[["ie","ា","វ","",1],["ɨ","ូ","វ","",1]]}};

// Clustered Khmer syllables from the pinned IPA-Translator dictionary and Google Khmer lexicon (CC BY 4.0, 2018 Google Inc.).
// https://github.com/google/language-resources/blob/bc72dd6527aee6963910b9afc69a57f7b9aacc1d/km/data/lexicon.tsv
const khmerClusterEvidence={"k d|p":[["a","ក្ដាប់","kdap",2],["ao","ក្ដោប","kdaop",2],["ə","ក្ដិប","kɗəp",1],["ə","ក្ដឹប","kɗəp",1],["iə","ក្ដៀប","kɗiəp",1]],"k d|ŋ":[["ao","ក្ដោង","kdaoŋ",2],["o","ក្ដុង","kɗoŋ",1],["ɨə","ក្ដឿង","kɗɨəŋ",1],["iə","ក្ដៀង","kɗiəŋ",1],["ae","ក្ដែង","kɗaeŋ",1],["ɨ","ក្ឌឹង","kɗɨŋ",1],["u","ក្ឌុង","kɗuŋ",1],["uː","ក្ឌូង","kɗuːŋ",1]],"k d|v":[["a","ក្ដៅ","kdav",2]],"k d|j":[["ə","ក្តី","kdəy",1],["ə","ក្ដី","kɗəj",1],["o","ក្ដុយ","kɗoj",1],["ao","ក្ដោយ","kɗaoj",1]],"k n|ŋ":[["o","ក្នុង","knoŋ",2],["ɑː","ខ្នង","knɑɑŋ",2],["aː","ខ្នាង","knaːŋ",1],["ae","ខ្នែង","knaeŋ",1],["ɔː","ឃ្នង","knɔːŋ",1],["ie","ឃ្នាង","knieŋ",1]],"k b|ŋ":[["ɑ","ក្បង់","kbɑŋ",2],["o","ក្បុង","kɓoŋ",1],["ɨə","ក្បឿង","kɓɨəŋ",1]],"k b|c":[["a","ក្បាច់","kbac",2],["eː","ក្បេច","kɓeːc",1]],"k b|l":[["aː","ក្បាល","kbaal",2],["ə","ក្បិល","kɓəl",1]],"k b|n":[["uə","ក្បួន","kbuən",2],["aː","ក្បាន","kɓaːn",1],["ə","ក្បិន","kɓən",1],["oː","ក្បូន","kɓoːn",1],["ae","ក្បែន","kɓaen",1]],"k b|h":[["iə","ក្បៀស","kbiəh",2],["o","ក្បុស","kɓoh",1],["ɑ","ក្បោះ","kɓɑh",1]],"k m|j":[["uə","ក្មួយ","kmuəy",2],["aː","ខ្មាយ","kmaːj",1],["ə","ខ្មី","kməj",1],["uə","ខ្មួយ","kmuəj",1],["ie","ឃ្មាយ","kmiej",1]],"k m|ŋ":[["eː","ក្មេង","kmeeŋ",2],["aː","ក្មាង","kmaːŋ",1],["ɑː","ខ្មង","kmɑːŋ",1],["u","ឃ្មង់","kmuŋ",1]],"k r|":[["ɑː","ក្រ","krɑɑ",2],["uː","គ្រូ","kruu",2],["ɛː","គ្រែ","krɛɛ",2],["aː","ក្រា","kraː",1],["ɔː","គ្រ","krɔː",1],["ie","គ្រា","krie",1],["iː","គ្រី","kriː",1],["uː","ឃ្រូ","kruː",1]],"k r|p":[["ɑː","ក្រប","krɑɑp",2],["aː","ក្រាប","kraap",2],["ɔː","គ្រប","krɔɔp",2],["u","គ្រប់","krup",2],["oa","គ្រាប់","kroap",2],["a","ក្រាប់","krap",1],["ə","ក្រឹប","krəp",1],["iə","ក្រៀប","kriəp",1],["eː","ក្រេប","kreːp",1],["ae","ក្រែប","kraep",1],["ɑ","ខ្រប់","krɑp",1],["ɨ","គ្រិប","krɨp",1],["iː","គ្រីប","kriːp",1],["ɨ","គ្រឹប","krɨp",1],["u","គ្រុប","krup",1],["uə","គ្រួប","kruəp",1]],"k r|l":[["aː","ក្រាល","kraal",2],["ɑː","ក្រល","krɑːl",1],["a","ក្រាល់","kral",1],["iə","ក្រៀល","kriəl",1],["ae","ក្រែល","krael",1],["ao","ក្រោល","kraol",1],["iː","គ្រីល","kriːl",1],["əː","គ្រើល","krəːl",1],["iə","គ្រៀល","kriəl",1]],"k r|h":[["aː","ក្រាស","kraah",2],["a","ក្រាស់","krah",2],["ɑː","ក្រស","krɑːh",1],["e","ក្រិស","kreh",1],["e","ក្រិះ","kreh",1],["ə","ក្រឹស","krəh",1],["o","ក្រុស","kroh",1],["oː","ក្រូស","kroːh",1],["uə","ក្រួស","kruəh",1],["eː","ក្រេស","kreːh",1],["e","ក្រេះ","kreh",1],["ɛ","ក្រែះ","krɛh",1],["ao","ក្រោស","kraoh",1],["ɑ","ក្រោះ","krɑh",1],["ɑ","ខ្រស់","krɑh",1],["oː","ខ្រូស","kroːh",1],["ie","គ្រាស","krieh",1],["ie","គ្រាះ","krieh",1],["i","គ្រិស","krih",1],["iː","គ្រីស","kriːh",1],["iː","គ្រីះ","kriːh",1],["ɨ","គ្រឹះ","krɨh",1],["u","គ្រុស","kruh",1],["u","គ្រុះ","kruh",1],["uː","គ្រូស","kruːh",1],["iə","គ្រៀស","kriəh",1],["eː","គ្រេស","kreːh",1],["uə","គ្រោះ","kruəh",1]],"k r|t":[["ə","ក្រិត","krət",2],["ɑː","ក្រត","krɑːt",1],["aː","ក្រាត","kraːt",1],["ə","ក្រឹត","krət",1],["əː","ក្រឺត","krəːt",1],["o","ក្រុត","krot",1],["eː","ក្រេដ","kreːt",1],["eː","ក្រេត","kreːt",1],["ae","ក្រែត","kraet",1],["ao","ក្រោធ","kraot",1],["ɔː","គ្រត","krɔːt",1],["ie","គ្រាត","kriet",1],["iː","គ្រីដ","kriːt",1],["iː","គ្រីត","kriːt",1],["ɨː","គ្រឺត","krɨːt",1],["u","គ្រុឌ","krut",1],["uː","គ្រូដ","kruːt",1],["ɨə","គ្រឿត","krɨət",1],["eː","គ្រេត","kreːt",1],["oː","គ្រោត","kroːt",1]],"k r|m":[["ə","ក្រឹម","krəm",2],["o","ក្រុម","krom",2],["iə","ក្រៀម","kriəm",2],["ao","ក្រោម","kraom",2],["oa","គ្រាំ","kroam",2],["ɑ","ក្រម","krɑm",1],["aː","ក្រាម","kraːm",1],["oː","ក្រូម","kroːm",1],["eː","ក្រេម","kreːm",1],["ae","ក្រែម","kraem",1],["ɑ","ក្រំ","krɑm",1],["ie","គ្រាម","kriem",1],["iː","គ្រីម","kriːm",1],["ɨ","គ្រឹម","krɨm",1],["u","គ្រុម","krum",1],["u","គ្រុំ","krum",1],["əː","គ្រើម","krəːm",1],["u","គ្រំ","krum",1]],"k r|c":[["ou","ក្រូច","krouc",1],["ə","ក្រិក","krəc",1],["ə","ក្រិច","krəc",1],["oː","ក្រូច","krouc",1],["uə","ក្រួច","kruəc",1],["ɨ","គ្រិច","krɨc",1],["uə","គ្រួច","kruəc",1],["ɨ","គ្រេច","krɨc",1]],"k r|ŋ":[["ae","ក្រែង","kraeŋ",2],["ɔː","គ្រង","krɔɔŋ",2],["ɨə","គ្រឿង","krɨəŋ",2],["ɑː","ក្រង","krɑːŋ",1],["ɑ","ក្រង់","krɑŋ",1],["ə","ក្រិង","krəŋ",1],["ə","ក្រឹង","krəŋ",1],["əː","ក្រឺង","krəːŋ",1],["o","ក្រុង","kroŋ",1],["iə","ក្រៀង","kriəŋ",1],["ie","គ្រាង","krieŋ",1],["ɨ","គ្រឹង","krɨŋ",1],["eː","គ្រេង","kreːŋ",1],["ɛː","គ្រែង","krɛːŋ",1],["oː","គ្រោង","kroːŋ",1]],"k r|k":[["ao","ក្រោក","kraok",2],["uː","គ្រូក","kruuk",2],["ɑː","ក្រក","krɑːk",1],["aː","ក្រាក","kraːk",1],["a","ក្រាក់","krak",1],["aə","ក្រើក","kraək",1],["iə","ក្រៀក","kriək",1],["eː","ក្រេក","kreːk",1],["ae","ក្រែក","kraek",1],["ɔː","គ្រក","krɔːk",1],["uə","គ្រក់","kruək",1],["ie","គ្រាក","kriek",1],["ea","គ្រាក់","kreak",1],["iː","គ្រីក","kriːk",1],["u","គ្រុក","kruk",1],["əː","គ្រើក","krəːk",1],["oː","គ្រោក","kroːk",1]],"k r|j":[["ao","ក្រោយ","kraoy",2],["aː","ក្រាយ","kraːj",1],["ə","ក្រី","krəj",1],["eː","ក្រេយ","kreːj",1],["a","ក្រៃ","kraj",1],["ie","គ្រាយ","kriej",1],["u","គ្រុយ","kruj",1]],"k r|v":[["a","ក្រៅ","krav",2],["aː","ក្រាវ","kraːw",1],["iə","ក្រៀវ","kriəw",1],["eː","ក្រេវ","kreːw",1],["ie","គ្រាវ","kriew",1],["ɨ","គ្រូវ","krɨw",1],["iə","គ្រៀវ","kriəw",1]],"k l|j":[["aː","ក្លាយ","klaay",2],["ə","ខ្លី","kləy",2],["eː","ក្លេយ","kleːj",1],["o","ខ្លុយ","kloj",1],["u","គ្លុយ","kluj",1],["ɔː","ឃ្លយ","klɔːj",1],["ie","ឃ្លាយ","kliej",1],["e","ឃ្លៃ","klej",1],["oː","ឃ្លោយ","kloːj",1]],"k l|n":[["ə","ក្លិន","klən",2],["uə","ខ្លួន","kluən",2],["ie","ឃ្លាន","klien",2],["ɑː","ក្លន","klɑːn",1],["aː","ក្លាន","klaːn",1],["a","ក្លាន់","klan",1],["iː","ក្លីន","kliːn",1],["oː","ក្លូន","kloːn",1],["eː","ក្លេន","kleːn",1],["ao","ក្លោន","klaon",1],["ə","ខ្លិន","klən",1],["iː","ខ្លីន","kliːn",1],["iː","គ្លីន","kliːn",1],["eː","គ្លេន","kleːn",1],["ɛː","គ្លែន","klɛːn",1],["ɨ","ឃ្លិន","klɨn",1],["iː","ឃ្លីន","kliːn",1],["ɨə","ឃ្លឿន","klɨən",1]],"k l|p":[["ə","ក្លឹប","kləp",2],["ae","ក្លែប","klaep",2],["u","ឃ្លុប","klup",2],["ɑː","ក្លប","klɑːp",1],["ə","ក្លិប","kləp",1],["ɑː","ខ្លប","klɑːp",1],["ɑ","ខ្លប់","klɑp",1],["aː","ខ្លាប","klaːp",1],["ə","ខ្លិប","kləp",1],["ə","ខ្លីប","kləp",1],["iə","ខ្លៀប","kliəp",1],["iː","គ្លីប","kliːp",1],["uː","គ្លូប","kluːp",1],["ie","ឃ្លាប","kliep",1],["ɨ","ឃ្លិប","klɨp",1],["iː","ឃ្លីប","kliːp",1],["uə","ឃ្លួប","kluəp",1]],"k l|k":[["iə","ក្លៀក","kliək",2],["aː","ក្លាក","klaːk",1],["iː","ក្លីក","kliːk",1],["əː","ក្លឺក","kləːk",1],["o","ក្លុក","klok",1],["eː","ក្លេក","kleːk",1],["ao","ក្លោក","klaok",1],["ɑ","ខ្លក់","klɑk",1],["aː","ខ្លាក","klaːk",1],["o","ខ្លុក","klok",1],["oː","ខ្លូក","kloːk",1],["əː","គ្លើក","kləːk",1],["iː","ឃ្លីក","kliːk",1],["iə","ឃ្លៀក","kliək",1],["oː","ឃ្លោក","kloːk",1]],"k ʔ|m":[["ɑː","ក្អម","kʔɑɑm",2],["aː","ក្អាម","kʔaːm",1]],"k ʔ|t":[["uə","ក្អួត","kʔuət",2],["aː","ក្អាត","kʔaːt",1],["a","ក្អាត់","kʔat",1],["ə","ក្អិត","kʔət",1]],"k ʔ|k":[["ɨə","ក្អឿក","kʔɨək",2],["ae","ក្អែក","kʔaek",2],["ɑː","ក្អក","kʔɑːk",1],["aː","ក្អាក","kʔaːk",1],["ə","ក្អីក","kʔək",1],["ə","ក្អឹក","kʔək",1],["o","ក្អុក","kʔok",1]],"k ʔ|l":[["ae","ក្អែល","kʔael",2],["ə","ក្អិល","kʔəl",1]],"k c|p":[["ɑ","ខ្ចប់","kcɑp",2],["oa","ខ្ជាប់","kcoap",2],["ə","ខ្ចឹប","kcəp",1],["ao","ខ្ចោប","kcaop",1],["ɨ","ខ្ជិប","kcɨp",1],["iː","ខ្ជីប","kciːp",1],["ɨ","ខ្ជឹប","kcɨp",1]],"k c|j":[["aː","ខ្ចាយ","kcaay",2],["ə","ខ្ចី","kcəy",2],["ie","ខ្ជាយ","kciej",1],["ie","ឃ្ជាយ","kciej",1]],"k c|k":[["ea","ខ្ជាក់","kceak",2],["ɑː","ខ្ចក","kcɑːk",1],["ie","ខ្ជាក","kciek",1],["oː","ខ្ជោក","kcoːk",1]],"k c|l":[["ɨ","ខ្ជិល","kcɨl",2],["ɑ","ខ្យល់","kcɑl",1],["oː","ខ្ជោល","kcoːl",1]],"k ɲ|m":[["o","ខ្ញុំ","kɲom",2],["ɑː","ខ្ញម","kɲɑːm",1],["a","ខ្ញាំ","kɲam",1],["ae","ខ្ញែម","kɲaem",1],["ao","ខ្ញោម","kɲaom",1]],"k t|h":[["ea","ខ្ទះ","kteah",2],["oa","ខ្ទាស់","ktoah",1],["i","ខ្ទិះ","ktih",1],["u","ខ្ទុះ","ktuh",1]],"k t|ŋ":[["ʊə","ខ្ទង់","ktʊəŋ",1],["u","ខ្ទង់","ktʊəŋ",1],["iː","ខ្ទីង","ktiːŋ",1],["ɨ","ខ្ទឹង","ktɨŋ",1],["ɛː","ខ្ទែង","ktɛːŋ",1]],"k t|p":[["u","ខ្ទប់","ktup",2],["ɔː","ខ្ទប","ktɔːp",1]],"k t|t":[["ie","ខ្ទាត","ktiet",2],["ɑː","ខ្តត","ktɑːt",1],["iː","ខ្ទីត","ktiːt",1],["u","ខ្ទុត","ktut",1],["əː","ខ្ទើត","ktəːt",1],["ɛː","ខ្ទែត","ktɛːt",1]],"k t|m":[["ɨ","ខ្ទឹម","ktɨm",2],["ɔː","ខ្ទម","ktɔːm",1],["oa","ខ្ទាំ","ktoam",1],["u","ខ្ទុំ","ktum",1]],"k t|c":[["ɨ","ខ្ទេច","ktɨc",2]],"k n|l":[["o","ខ្នុរ","knol",2],["ɑ","ថ្នល់","tnɑl",1],["ɑ","ខ្នល់","knɑl",1]],"k n|j":[["aə","ខ្នើយ","knaəy",2],["ɑː","ខ្នយ","knɑːj",1],["aː","ខ្នាយ","knaːj",1]],"k p|h":[["ʊə","ខ្ពស់","kpʊəh",1],["uə","ខ្ពស់","kpʊəh",1]],"k p|l":[["u","ខ្ពុរ","kpul",2]],"k m|c":[["ao","ខ្មោច","kmaoc",2]],"k m|v":[["a","ខ្មៅ","kmav",2],["ə","ខ្មូវ","kməw",1]],"k c|ŋ":[["ɑː","ខ្យង","kcɑɑŋ",1],["uː","ធ្យូង","kcuuŋ",1],["ie","ខ្ជាង","kcieŋ",1],["ɨ","ខ្ជឹង","kcɨŋ",1],["ɛː","ខ្ជែង","kcɛːŋ",1]],"k j|ŋ":[["ɑː","ខ្យង","kcɑɑŋ",2],["aː","ខ្យាង","kjaːŋ",1],["ao","ខ្យោង","kjaoŋ",1],["u","គ្យុង","kjuŋ",1],["u","ឃ្យុង","kjuŋ",1]],"k j|l":[["ɑ","ខ្យល់","kcɑl",2]],"k s|l":[["ɑ","ខ្យល់","kcɑl",1],["o","ខ្សុល","ksol",1],["uə","ខ្សួល","ksuəl",1]],"k l|h":[["a","ខ្លះ","klah",2],["ɑː","ក្លស","klɑːh",1],["ɑ","ក្លស់","klɑh",1],["aː","ក្លាស","klaːh",1],["a","ក្លាស់","klah",1],["ə","ក្លឹស","kləh",1],["oː","ក្លូស","kloːh",1],["aə","ក្លើស","klaəh",1],["ao","ក្លោស","klaoh",1],["o","ខ្លុះ","kloh",1],["oː","ខ្លូស","kloːh",1],["ea","ឃ្លះ","kleah",1]],"k l|c":[["aː","ខ្លាច","klaac",2],["ao","ខ្លោច","klaoc",2],["aː","ក្លាច","klaːc",1],["ie","ឃ្លាច","kliec",1],["iə","ឃ្លៀច","kliəc",1]],"k l|ɲ":[["a","ខ្លាញ់","klaɲ",2],["aː","ក្លាញ","klaːɲ",1]],"k l|ŋ":[["ae","ខ្លែង","klaeŋ",2],["ao","ខ្លោង","klaoŋ",2],["oː","ឃ្លោង","klooŋ",2],["ɑː","ក្លង","klɑːŋ",1],["ɑ","ក្លង់","klɑŋ",1],["aː","ក្លាង","klaːŋ",1],["ə","ក្លឹង","kləŋ",1],["ae","ក្លែង","klaeŋ",1],["ao","ក្លោង","klaoŋ",1],["ɑː","ខ្លង","klɑːŋ",1],["aː","ខ្លាង","klaːŋ",1],["ə","ខ្លឹង","kləŋ",1],["o","ខ្លុង","kloŋ",1],["oː","ខ្លូង","kloːŋ",1],["u","ឃ្លង់","kluŋ",1],["iə","ឃ្លៀង","kliəŋ",1]],"k v|h":[["a","ខ្វះ","kvah",2],["e","ខ្វេះ","kveh",2],["eː","ក្វេស","kweːh",1],["aː","ខ្វាស","kwaːh",1],["ae","ខ្វែះ","kwaeh",1],["ɑ","ខ្វោះ","kwɑh",1],["iː","ឃ្វីស","kwiːh",1],["eː","ឃ្វេស","kweːh",1]],"k v|l":[["ɑ","ខ្វល់","kvɑl",2],["ə","ខ្វិល","kwəl",1],["iə","ខ្វៀល","kwiəl",1],["ie","ឃ្វាល","kwiel",1]],"k v|t":[["ə","ខ្វិត","kvət",2],["aː","ក្វាត","kwaːt",1],["aː","ក្វាថ","kwaːt",1],["aː","ខ្វាត","kwaːt",1],["a","ខ្វាត់","kwat",1],["ə","ខ្វឹត","kwət",1],["ae","ខ្វែត","kwaet",1],["iː","ឃ្វីត","kwiːt",1]],"k s|c":[["a","ខ្សាច់","ksac",2],["o","ខ្សុច","ksoc",1]],"k s|":[["ae","ខ្សែ","ksae",2],["iə","ខ្សៀ","ksiə",1]],"k s|j":[["ao","ខ្សោយ","ksaoy",2],["a","ក្សយ","ksaj",1],["aː","ខ្សាយ","ksaːj",1],["ə","ខ្សី","ksəj",1],["o","ខ្សុយ","ksoj",1]],"k n|":[["ie","គ្នា","knie",2],["ɑː","ក្ន","knɑː",1],["aː","ខ្នា","knaː",1]],"k m|n":[["ie","គ្មាន","kmien",2],["a","ខ្មាន់","kman",1]],"k j|t":[["uː","ឃ្យូត","kyuut",2],["aː","ក្យាត","kjaːt",1]],"k l|":[["ie","ឃ្លា","klie",2],["ɑː","ក្ល","klɑː",1],["aː","ក្លា","klaː",1],["oː","ក្លូ","kloː",1],["aə","ក្លើ","klaə",1],["eː","ក្លេ","kleː",1],["aː","ខ្លា","klaː",1],["oː","ខ្លូ","kloː",1],["uː","គ្លូ","kluː",1],["iː","ឃ្លី","kliː",1],["uː","ឃ្លូ","kluː",1],["ɨə","ឃ្លឿ","klɨə",1],["eː","ឃ្លេ","kleː",1]],"c b|p":[["a","ច្បាប់","cbap",2],["ae","ច្បែប","cɓaep",1]],"c b|m":[["aː","ច្បាម","cbaam",2],["aə","ច្បើម","cɓaəm",1]],"c b|h":[["a","ច្បាស់","cbah",2],["ao","ច្បោស","cɓaoh",1],["ɑ","ច្បោះ","cɓɑh",1]],"c r|k":[["ɑː","ច្រក","crɑɑk",2],["ɔː","ជ្រក","crɔɔk",2],["uː","ជ្រូក","cruuk",2],["ɑ","ច្រក់","crɑk",1],["aː","ច្រាក","craːk",1],["ə","ច្រិក","crək",1],["ə","ច្រឹក","crək",1],["iə","ច្រៀក","criək",1],["eː","ច្រេក","creːk",1],["ao","ច្រោក","craok",1],["uə","ជ្រក់","cruək",1],["ie","ជ្រាក","criek",1],["ɨ","ជ្រឹក","crɨk",1],["uə","ជ្រួក","cruək",1],["iə","ជ្រៀក","criək",1],["ɛː","ជ្រែក","crɛːk",1],["oː","ជ្រោក","croːk",1]],"c r|t":[["ɑ","ច្រត់","crɑt",2],["ou","ច្រូត","crout",1],["aː","ច្រាត","craːt",1],["oː","ច្រូត","crout",1],["ae","ច្រែត","craet",1],["ɨ","ជ្រឹត","crɨt",1],["uə","ជ្រួត","cruət",1],["iə","ជ្រៀត","criət",1]],"c r|h":[["aː","ច្រាស","craah",2],["ea","ជ្រះ","creah",2],["u","ជ្រុះ","cruh",2],["ɑː","ច្រស","crɑːh",1],["ɑ","ច្រស់","crɑh",1],["a","ច្រាស់","crah",1],["ə","ច្រឹះ","crəh",1],["əː","ច្រឺះ","crəːh",1],["o","ច្រុះ","croh",1],["e","ច្រេស","creh",1],["e","ច្រេះ","creh",1],["ae","ច្រែស","craeh",1],["ae","ច្រែះ","craeh",1],["ɑ","ច្រោះ","crɑh",1],["ie","ជ្រាស","crieh",1],["oa","ជ្រាស់","croah",1],["i","ជ្រិះ","crih",1],["uə","ជ្រួស","cruəh",1],["əː","ជ្រើស","crəːh",1],["eː","ជ្រេស","creːh",1],["e","ជ្រេះ","creh",1],["ɛ","ជ្រែះ","crɛh",1],["uə","ជ្រោះ","cruəh",1]],"c r|n":[["aə","ច្រើន","craən",2],["aː","ច្រាន","craːn",1],["a","ច្រាន់","cran",1],["ɔː","ជ្រន","crɔːn",1],["ie","ជ្រាន","crien",1],["ɨ","ជ្រិន","crɨn",1],["u","ជ្រុន","crun",1],["ɨə","ជ្រឿន","crɨən",1]],"c r|ŋ":[["u","ជ្រុង","cruŋ",2],["ie","ច្រៀង","crieŋ",1],["aː","ច្រាង","craːŋ",1],["ə","ច្រឹង","crəŋ",1],["o","ច្រុង","croŋ",1],["oː","ច្រូង","croːŋ",1],["iə","ច្រៀង","crieŋ",1],["ae","ច្រែង","craeŋ",1],["ao","ច្រោង","craoŋ",1],["ɔː","ជ្រង","crɔːŋ",1],["u","ជ្រង់","cruŋ",1],["ɨ","ជ្រឹង","crɨŋ",1],["ɨə","ជ្រឿង","crɨəŋ",1],["iə","ជ្រៀង","criəŋ",1],["ɛː","ជ្រែង","crɛːŋ",1],["oː","ជ្រោង","croːŋ",1]],"c k|h":[["ə","ឆ្កឹះ","ckəh",2],["iə","ឆ្កៀស","ckiəh",1]],"c k|t":[["uə","ឆ្កួត","ckuət",2],["ə","ឆ្កឹត","ckət",1],["əː","ឆ្កឺត","ckəːt",1],["oː","ឆ្កូត","ckoːt",1],["uə","ឆ្គួត","ckuət",1]],"c k|":[["ae","ឆ្កែ","ckae",2],["aː","ឆ្កា","ckaː",1]],"c ŋ|l":[["ɑ","ឆ្ងល់","cŋɑl",2]],"c ŋ|ɲ":[["a","ឆ្ងាញ់","cŋaɲ",2]],"c ŋ|j":[["aː","ឆ្ងាយ","cŋaay",2],["u","ឈ្ងុយ","cŋuy",2],["o","ឆ្ងុយ","cŋoj",1],["aə","ឆ្ងើយ","cŋaəj",1]],"c n|m":[["a","ឆ្នាំ","cnam",2],["aə","ឆ្នើម","cnaəm",2],["ə","ឆ្នឹម","cnəm",1]],"c n|t":[["oː","ឆ្នូត","cnoot",2],["ao","ឆ្នោត","cnaot",1],["uː","ឈ្នូត","cnuːt",1],["uə","ឈ្នួត","cnuət",1]],"c p|h":[["ʊə","ឆ្ពោះ","cpʊəh",1],["ɨ","ឆ្ពឹះ","cpɨh",1],["ɛ","ឆ្ពែះ","cpɛh",1],["uə","ឆ្ពោះ","cpʊəh",1]],"c m|":[["aː","ឆ្មា","cmaa",2],["ɛː","ឈ្មែ","cmɛː",1]],"c m|l":[["oː","ឈ្មោល","cmool",2],["ou","ឆ្មូល","cmoul",1],["oː","ឆ្មូល","cmoul",1],["uə","ឆ្មួល","cmuəl",1],["u","ឈ្មុល","cmul",1]],"c l|ŋ":[["ɑː","ឆ្លង","clɑɑŋ",2],["oː","ឆ្លូង","cloːŋ",1],["ao","ឆ្លោង","claoŋ",1],["əː","ឈ្លើង","cləːŋ",1]],"c l|k":[["a","ឆ្លាក់","clak",2],["ɑː","ឆ្លក","clɑːk",1],["oː","ឆ្លូក","cloːk",1],["ae","ឆ្លែក","claek",1],["uə","ឈ្លក់","cluək",1],["ie","ឈ្លាក","cliek",1],["iː","ឈ្លីក","cliːk",1]],"c l|t":[["aː","ឆ្លាត","claat",2],["iə","ឆ្លៀត","cliət",2],["a","ឆ្លាត់","clat",1],["ie","ឈ្លាត","cliet",1],["iː","ឈ្លីត","cliːt",1]],"c l|h":[["a","ឆ្លាស់","clah",2],["o","ឆ្លុះ","cloh",2],["ie","ឈ្លាស","clieh",1],["uː","ឈ្លូស","cluːh",1],["iə","ឈ្លៀស","cliəh",1],["uə","ឈ្លោះ","cluəh",1]],"c l|j":[["aə","ឆ្លើយ","claəy",2],["ie","ឈ្លាយ","cliej",1],["əː","ឈ្លើយ","cləːj",1]],"c v|ŋ":[["eː","ឆ្វេង","cveeŋ",2],["ae","ច្វែង","cwaeŋ",1],["ɑ","ឆ្វង់","cwɑŋ",1],["aː","ឆ្វាង","cwaːŋ",1],["eː","ឈ្វេង","cweːŋ",1]],"c ʔ|n":[["ə","ឆ្អិន","cʔən",2],["ɑ","ឆ្អន់","cʔɑn",1]],"c ʔ|ŋ":[["ə","ឆ្អឹង","cʔəŋ",2]],"c ʔ|t":[["ae","ឆ្អែត","cʔaet",2],["ə","ឆ្អិត","cʔət",1]],"c r|ɲ":[["ʊə","ជ្រញ់","crʊəɲ",1],["aː","ច្រាញ","craːɲ",1],["a","ច្រាញ់","craɲ",1],["uə","ច្រួញ","cruəɲ",1],["u","ជ្រញ់","crʊəɲ",1],["u","ជ្រុញ","cruɲ",1],["uə","ជ្រួញ","cruəɲ",1],["ɨ","ជ្រេញ","crɨɲ",1]],"c r|p":[["ie","ជ្រាប","criep",2],["ɑ","ច្រប់","crɑp",1],["aː","ច្រាប","craːp",1],["ə","ច្រិប","crəp",1],["ə","ច្រឹប","crəp",1],["əː","ច្រឺប","crəːp",1],["o","ច្រុប","crop",1],["iə","ច្រៀប","criəp",1],["u","ជ្រប់","crup",1],["oa","ជ្រាប់","croap",1],["ɨ","ជ្រឹប","crɨp",1],["u","ជ្រុប","crup",1],["iə","ជ្រៀប","criəp",1]],"c r|l":[["u","ជ្រុល","crul",2],["aː","ច្រាល","craːl",1],["a","ច្រាល់","cral",1],["ə","ច្រិល","crəl",1],["ie","ជ្រាល","criel",1],["uə","ជ្រួល","cruəl",1],["oː","ជ្រោល","croːl",1]],"c r|":[["ɛː","ជ្រែ","crɛɛ",2],["ie","ជ្រា","crie",1],["iː","ជ្រី","criː",1],["eː","ជ្រេ","creː",1],["oː","ជ្រោ","croː",1]],"c r|v":[["ɨ","ជ្រៅ","crɨv",2],["aː","ច្រាវ","craːw",1],["ie","ជ្រាវ","criew",1],["iː","ជ្រីវ","criːw",1],["iə","ជ្រៀវ","criəw",1]],"c ŋ|m":[["iə","ឈ្ងៀម","cŋiəm",2],["iə","ឆ្ងៀម","cŋiəm",1]],"c n|h":[["ea","ឈ្នះ","cneah",2],["e","ច្នេះ","cneh",1],["ɑ","ច្នោះ","cnɑh",1],["aː","ឆ្នាស","cnaːh",1],["a","ឆ្នាស់","cnah",1]],"c n|l":[["uə","ឈ្នួល","cnuəl",2],["a","ឆ្នាល់","cnal",1],["u","ឈ្នុល","cnul",1]],"c m|h":[["ʊə","ឈ្មោះ","cmʊəh",1],["u","ឈ្មុស","cmuh",1],["uə","ឈ្មោះ","cmʊəh",1]],"t n|t":[["ao","ត្នោត","tnaot",2]],"t b|l":[["a","ត្បាល់","tbal",2],["o","ត្បុរ","tɓol",1],["o","ត្បុល","tɓol",1]],"t b|t":[["iə","ត្បៀត","tbiət",2],["ə","ដ្បិត","tɓət",1],["ɑ","ត្បត់","tɓɑt",1],["ə","ត្បិត","tɓət",1],["o","ត្បុត","tɓot",1]],"t r|ŋ":[["ɑː","ត្រង","trɑɑŋ",2],["ɑ","ត្រង់","trɑŋ",2],["uː","ទ្រូង","truuŋ",2],["aː","ត្រាង","traːŋ",1],["ə","ត្រឹង","trəŋ",1],["o","ត្រុង","troŋ",1],["aə","ត្រើង","traəŋ",1],["eː","ត្រេង","treːŋ",1],["ae","ត្រែង","traeŋ",1],["u","ទ្រង់","truŋ",1],["ie","ទ្រាង","trieŋ",1],["ɨ","ទ្រឹង","trɨŋ",1],["u","ទ្រុង","truŋ",1],["əː","ទ្រើង","trəːŋ",1],["ɨə","ទ្រឿង","trɨəŋ",1],["iə","ទ្រៀង","triəŋ",1]],"t r|":[["aː","ត្រា","traa",2],["ɔː","ទ្រ","trɔɔ",2],["ɑː","ត្រ","trɑː",1],["eː","ត្រេ","treː",1],["ae","ត្រែ","trae",1],["ie","ទ្រា","trie",1],["iː","ទ្រី","triː",1],["uː","ទ្រូ","truː",1],["iː","ធ្រី","triː",1],["uː","ធ្រូ","truː",1]],"t r|m":[["a","ត្រាំ","tram",2],["ə","ត្រឹម","trəm",2],["iə","ត្រៀម","triəm",2],["oa","ទ្រាំ","troam",2],["iː","ឌ្រីម","triːm",1],["aː","ត្រាម","traːm",1],["o","ត្រុំ","trom",1],["ɔː","ទ្រម","trɔːm",1],["iː","ទ្រីម","triːm",1],["ɨ","ទ្រឹម","trɨm",1],["oː","ទ្រោម","troːm",1]],"t r|j":[["ə","ត្រី","trəy",2],["aə","ត្រើយ","traəy",2],["aː","ត្រាយ","traːj",1],["o","ត្រុយ","troj",1],["uə","ត្រួយ","truəj",1],["a","ត្រៃ","traj",1],["a","ត្រៃយ៍","traj",1],["ie","ទ្រាយ","triej",1],["u","ទ្រុយ","truj",1],["uə","ទ្រួយ","truəj",1]],"t r|v":[["ə","ត្រូវ","trəv",2],["aː","ត្រាវ","traːw",1],["eː","ត្រេវ","treːw",1]],"t r|t":[["uə","ត្រួត","truət",2],["aː","ត្រាត","traːt",1],["eː","ត្រេដ","treːt",1],["eː","ត្រេត","treːt",1],["iː","ថ្រីត","triːt",1],["ɔː","ទ្រត","trɔːt",1],["ɨ","ទ្រិត","trɨt",1],["iː","ទ្រីត","triːt",1],["u","ទ្រុឌ","trut",1],["əː","ទ្រើត","trəːt",1],["eː","ទ្រេត","treːt",1],["oː","ទ្រោត","troːt",1]],"t ʔ|k":[["aə","ត្អើក","tʔaək",2]],"t k|m":[["ie","ថ្គាម","tkiem",2],["ie","ធ្គាម","tkiem",1]],"t ŋ|h":[["a","ថ្ងាស","tŋah",1],["aː","ថ្ងាស","tŋah",1],["e","ថ្ងេះ","tŋeh",1]],"t ŋ|j":[["a","ថ្ងៃ","tŋay",2],["o","ថ្ងុយ","tŋoj",1]],"t n|m":[["ɑː","ថ្នម","tnɑɑm",2],["a","ថ្នាំ","tnam",2],["ɑ","ថ្នំ","tnɑm",1],["ə","ធ្និម","tnəm",1],["ɨ","ធ្នឹម","tnɨm",1]],"t n|l":[["ɑ","ថ្នល់","tnɑl",2],["aː","ថ្នាល","tnaːl",1],["ao","ថ្នោល","tnaol",1],["u","ធ្នល់","tnul",1]],"t n|k":[["a","ថ្នាក់","tnak",2],["ɑ","ថ្នក់","tnɑk",1],["ə","ថ្នឹក","tnək",1],["ea","ធ្នាក់","tneak",1]],"t p|k":[["ʊə","ថ្ពក់","tpʊək",1],["uə","ថ្ពក់","tpʊək",1],["ɛː","ថ្ពែក","tpɛːk",1]],"t p|l":[["oa","ថ្ពាល់","tpoal",2]],"t m|":[["ɑː","ថ្ម","tmɑɑ",2],["ae","ថ្មែ","tmae",1],["ie","ធ្មា","tmie",1]],"t m|j":[["ə","ថ្មី","tməy",2],["ie","ធ្មាយ","tmiej",1],["e","ធ្មៃ","tmej",1]],"t l|":[["aː","ថ្លា","tlaa",2],["ae","ត្លែ","tlae",1],["ao","ត្លោ","tlao",1],["ie","ធ្លា","tlie",1],["uː","ធ្លូ","tluː",1],["oː","ធ្លោ","tloː",1]],"t l|ŋ":[["ə","ថ្លឹង","tləŋ",2],["ə","ត្លឹង","tləŋ",1],["ɑ","ថ្លង់","tlɑŋ",1],["aː","ថ្លាង","tlaːŋ",1],["o","ថ្លុង","tloŋ",1],["aə","ថ្លើង","tlaəŋ",1],["ae","ថ្លែង","tlaeŋ",1],["iː","ធ្លីង","tliːŋ",1],["u","ធ្លុង","tluŋ",1],["uə","ធ្លួង","tluəŋ",1]],"t l|m":[["aə","ថ្លើម","tlaəm",2],["o","ត្លុម","tlom",1],["o","ត្លុំ","tlom",1]],"t l|j":[["a","ថ្លៃ","tlay",2],["ie","ធ្លាយ","tliey",2],["oː","ធ្លោយ","tloːj",1]],"t r|p":[["oa","ទ្រាប់","troap",2],["ɑ","ត្រប់","trɑp",1],["a","ត្រាប់","trap",1],["ə","ត្រិប","trəp",1],["ə","ត្រឹប","trəp",1],["iə","ត្រៀប","triəp",1],["iː","ថ្រីប","triːp",1],["ie","ទ្រាប","triep",1],["iː","ទ្រីប","triːp",1],["ɨ","ទ្រឹប","trɨp",1],["u","ទ្រុប","trup",1],["əː","ទ្រើប","trəːp",1],["iə","ទ្រៀប","triəp",1],["oː","ទ្រោប","troːp",1]],"t r|h":[["əː","ទ្រើស","trəəh",2],["ɑ","ត្រស់","trɑh",1],["aː","ត្រាស","traːh",1],["a","ត្រាស់","trah",1],["e","ត្រិះ","treh",1],["o","ត្រុះ","troh",1],["oː","ត្រូស","troːh",1],["uə","ត្រួស","truəh",1],["eː","ត្រេស","treːh",1],["e","ត្រេះ","treh",1],["ae","ត្រែះ","traeh",1],["ao","ត្រោស","traoh",1],["ɑ","ត្រោះ","trɑh",1],["ie","ទ្រាស","trieh",1],["oa","ទ្រាស់","troah",1],["iː","ទ្រីស","triːh",1],["u","ទ្រុះ","truh",1],["uə","ទ្រួស","truəh",1],["iə","ទ្រៀស","triəh",1],["uə","ទ្រោះ","truəh",1]],"t ŋ|n":[["ʊə","ធ្ងន់","tŋʊən",1],["a","ថ្ងាន់","tŋan",1],["u","ធ្ងន់","tŋʊən",1]],"t m|ŋ":[["ɨ","ធ្មឹង","tmɨŋ",2],["ao","ត្មោង","tmaoŋ",1],["ae","ថ្មែង","tmaeŋ",1],["ao","ថ្មោង","tmaoŋ",1],["ɔː","ធ្មង","tmɔːŋ",1],["u","ធ្មង់","tmuŋ",1],["u","ធ្មុង","tmuŋ",1],["əː","ធ្មើង","tməːŋ",1],["oː","ធ្មោង","tmoːŋ",1]],"t m|ɲ":[["ɨ","ធ្មេញ","tmɨɲ",2]],"t j|ŋ":[["uː","ធ្យូង","kcuuŋ",2]],"t l|k":[["ea","ធ្លាក់","tleak",2],["o","ត្លុក","tlok",1],["o","ថ្លុក","tlok",1],["aə","ថ្លើក","tlaək",1],["ɔː","ធ្លក","tlɔːk",1],["uː","ធ្លូក","tluːk",1],["oː","ធ្លោក","tloːk",1]],"t l|p":[["oa","ធ្លាប់","tloap",2]],"t v|":[["əː","ធ្វើ","tvəə",2],["aː","ត្វា","twaː",1],["ae","ថ្វែ","twae",1],["iː","ទ្វី","twiː",1],["eː","ទ្វេ","tweː",1]],"p d|ŋ":[["ə","ប្ដឹង","pdəŋ",2],["iə","ផ្ដៀង","pɗiəŋ",1]],"p d|j":[["ə","ប្តី","pdəy",1],["ə","ប្ដី","pɗəj",1]],"p r|m":[["a","ប្រាំ","pram",2],["ɔː","ព្រម","prɔɔm",2],["ɑː","ប្រម","prɑːm",1],["aː","ប្រាម","praːm",1],["ə","ប្រិម","prəm",1],["ə","ប្រឹម","prəm",1],["oː","ប្រូម","proːm",1],["uə","ប្រួម","pruəm",1],["ie","ព្រាម","priem",1],["oa","ព្រាំ","proam",1],["ɨ","ព្រិម","prɨm",1],["iː","ព្រីម","priːm",1],["ɨ","ព្រឹម","prɨm",1],["u","ព្រុំ","prum",1],["uə","ព្រួម","pruəm",1],["əː","ព្រើម","prəːm",1],["eː","ព្រេម","preːm",1],["u","ព្រំ","prum",1]],"p r|k":[["a","ប្រាក់","prak",2],["ɨ","ព្រឹក","prɨk",2],["ɑ","ប្រក់","prɑk",1],["aː","ប្រាក","praːk",1],["uə","ប្រួក","pruək",1],["eː","ប្រេក","preːk",1],["ae","ប្រែក","praek",1],["ao","ប្រោក","praok",1],["ɑː","ផ្រក","prɑːk",1],["ɔː","ព្រក","prɔːk",1],["ie","ព្រាក","priek",1],["iː","ព្រីក","priːk",1],["uə","ព្រួក","pruək",1],["ɛː","ព្រែក","prɛːk",1],["oː","ព្រោក","proːk",1]],"p r|p":[["a","ប្រាប់","prap",2],["iə","ប្រៀប","priəp",2],["ɑː","ប្រប","prɑːp",1],["aː","ប្រាប","praːp",1],["ə","ប្រិប","prəp",1],["ə","ប្រឹប","prəp",1],["oː","ប្រូប","proːp",1],["ie","ព្រាប","priep",1],["ɨ","ព្រឹប","prɨp",1],["iə","ព្រៀប","priəp",1]],"p r|h":[["o","ប្រុស","proh",2],["e","ប្រេះ","preh",2],["ea","ព្រះ","preah",2],["u","ព្រុស","pruh",2],["uə","ព្រួស","pruəh",2],["a","ប្រាស់","prah",1],["ʊə","ព្រោះ","prʊəh",1],["ɑː","ប្រស","prɑːh",1],["ɑ","ប្រស់","prɑh",1],["aː","ប្រាស","praːh",1],["ə","ប្រឹស","prəh",1],["ə","ប្រឹះ","prəh",1],["əː","ប្រឺស","prəːh",1],["o","ប្រុះ","proh",1],["oː","ប្រូស","proːh",1],["aə","ប្រើស","praəh",1],["eː","ប្រេស","preːh",1],["ae","ប្រែះ","praeh",1],["ao","ប្រោស","praoh",1],["ɑ","ប្រោះ","prɑh",1],["a","ប្រះ","prah",1],["eː","ផ្រេស","preːh",1],["oa","ព្រាស់","proah",1],["iː","ព្រីស","priːh",1],["ɨ","ព្រឹស","prɨh",1],["ɨː","ព្រឺស","prɨːh",1],["ɨː","ព្រឺះ","prɨːh",1],["uː","ព្រូស","pruːh",1],["əː","ព្រើស","prəːh",1],["eː","ព្រេស","preːh",1],["uə","ព្រោះ","prʊəh",1],["u","ភ្រុស","pruh",1]],"p r|ŋ":[["ə","ប្រឹង","prəŋ",2],["o","ប្រុង","proŋ",2],["eː","ប្រេង","preeŋ",2],["aː","ប៉្រាង","praːŋ",1],["ɑ","ប្រង់","prɑŋ",1],["ɨə","ប្រឿង","prɨəŋ",1],["iə","ប្រៀង","priəŋ",1],["ae","ប្រែង","praeŋ",1],["ao","ប្រោង","praoŋ",1],["ɔː","ព្រង","prɔːŋ",1],["u","ព្រង់","pruŋ",1],["ie","ព្រាង","prieŋ",1],["iː","ព្រីង","priːŋ",1],["iə","ព្រៀង","priəŋ",1],["eː","ព្រេង","preːŋ",1],["ɛː","ព្រែង","prɛːŋ",1],["oː","ព្រោង","proːŋ",1]],"p r|":[["aə","ប្រើ","praə",2],["ae","ប្រែ","prae",2],["iː","ព្រី","prii",2],["aː","ប្រា","praː",1],["oː","ប្រូ","proː",1],["uː","ប្រ៊ូ","pruː",1],["ie","ព្រា","prie",1],["ɨː","ព្រឺ","prɨː",1],["uː","ព្រូ","pruː",1],["ɛː","ព្រែ","prɛː",1]],"b r|n":[["eː","ប្រេន","breen",1],["ao","ប្រោន","ɓraon",1],["ɛː","ប្រ៊ែន","ɓrɛːn",1]],"p r|j":[["a","ប្រៃ","pray",2],["ie","ព្រាយ","priey",2],["uə","ព្រួយ","pruəy",2],["e","ព្រៃ","prey",2],["aː","ប្រាយ","praːj",1],["ə","ប្រិយ","prəj",1],["ə","ប្រី","prəj",1],["ə","ប្រីយ៍","prəj",1],["o","ប្រុយ","proj",1],["ɔː","ព្រយ","prɔːj",1],["u","ព្រុយ","pruj",1]],"p l|k":[["ae","ប្លែក","plaek",2],["aː","ផ្លាក","plaak",2],["ɨ","ភ្លឹក","plɨk",2],["ao","ប៉្លោក","plaok",1],["ɑ","ប្លក់","plɑk",1],["oː","ប្លូក","ploːk",1],["uə","ប្លួក","pluək",1],["aə","ប្លើក","plaək",1],["iə","ប្លៀក","pliək",1],["ao","ប្លោក","plaok",1],["ɑ","ផ្លក់","plɑk",1],["ə","ផ្លឹក","plək",1],["uə","ផ្លួក","pluək",1],["aə","ផ្លើក","plaək",1],["iə","ផ្លៀក","pliək",1],["eː","ផ្លេក","pleːk",1],["u","ព្លុក","pluk",1],["ɔː","ភ្លក","plɔːk",1],["uə","ភ្លក់","pluək",1],["u","ភ្លុក","pluk",1],["uː","ភ្លូក","pluːk",1],["əː","ភ្លើក","pləːk",1],["iə","ភ្លៀក","pliək",1]],"p ʔ|n":[["ou","ប្អូន","pʔoun",1],["oː","ប្អូន","pʔoun",1]],"p k|":[["aː","ផ្កា","pkaa",2],["uː","ផ្គូ","pkuː",1]],"p k|p":[["a","ផ្កាប់","pkap",2],["ɑ","ផ្កប់","pkɑp",1],["oa","ផ្គាប់","pkoap",1],["uə","ផ្គួប","pkuəp",1]],"p k|m":[["u","ផ្គុំ","pkum",2],["oa","ផ្គាំ","pkoam",1]],"p c|t":[["ə","ផ្ចិត","pcət",2],["ao","ផ្ចោត","pcaot",1],["ɨ","ភ្ជិត","pcɨt",1]],"p s|t":[["ə","ផ្ចិត","pcət",1],["ə","ផ្សិត","psət",1],["ə","ផ្សឹត","psət",1],["ae","ផ្សែត","psaet",1],["ao","ផ្សោត","psaot",1]],"p ɲ|":[["aə","ផ្ញើ","pɲaə",2],["iː","ភ្ញី","pɲiː",1]],"p d|l":[["ɑ","ផ្ដល់","pdɑl",2],["uə","ផ្ដួល","pɗuəl",1]],"p d|c":[["a","ផ្ដាច់","pdac",2],["uə","ផ្ដួច","pɗuəc",1],["iə","ផ្ដៀច","pɗiəc",1],["a","ផ្ដេច","pɗac",1]],"p d|m":[["o","ផ្ដុំ","pdom",2],["aə","ផ្ដើម","pdaəm",2],["a","ផ្ដាំ","pɗam",1],["ao","ផ្ដោម","pɗaom",1]],"p d|k":[["eː","ផ្ដេក","pdeek",2],["a","ផ្ដាក់","pɗak",1],["ə","ផ្ដឹក","pɗək",1],["iə","ផ្ដៀក","pɗiək",1],["ae","ផ្ដែក","pɗaek",1]],"p t|l":[["ə","ផ្តិល","ptəl",2],["oa","ផ្ទាល់","ptoal",2],["ie","ផ្ទាល","ptiel",1],["u","ផ្ទុរ","ptul",1],["u","ផ្ទុល","ptul",1],["oː","ផ្ទោល","ptoːl",1]],"p t|h":[["ea","ផ្ទះ","pteah",2],["u","ផ្ទុះ","ptuh",1]],"p t|p":[["oa","ផ្ទាប់","ptoap",2],["u","ផ្ទប់","ptup",1]],"p t|j":[["u","ផ្ទុយ","ptuy",2],["e","ផ្ទៃ","ptey",2]],"p n|k":[["ae","ផ្នែក","pnaek",2],["ɛː","ភ្នែក","pnɛɛk",2],["ɑ","ផ្នក់","pnɑk",1],["uː","ផ្នូក","pnuːk",1],["ɔː","ភ្នក","pnɔːk",1],["uə","ភ្នក់","pnuək",1],["uː","ភ្នូក","pnuːk",1]],"p l|h":[["a","ផ្លាស់","plah",2],["aː","ប្លាស","plaːh",1],["ɑ","ប្លោះ","plɑh",1],["aː","ផ្លាស","plaːh",1],["ə","ផ្លឹស","pləh",1],["aə","ផ្លើស","plaəh",1],["ɑ","ផ្លោះ","plɑh",1],["ɨ","ភ្លឹះ","plɨh",1],["ɨː","ភ្លឺស","plɨːh",1],["uə","ភ្លោះ","pluəh",1]],"p l|m":[["o","ផ្លុំ","plom",2],["ie","ភ្លាម","pliem",2],["ɑː","ប្លម","plɑːm",1],["a","ប្លាំ","plam",1],["ə","ប្លឹម","pləm",1],["əː","ប្លឺម","pləːm",1],["o","ប្លុំ","plom",1],["ae","ប្លែម","plaem",1],["aː","ផ្លាម","plaːm",1],["ə","ផ្លឹម","pləm",1],["oː","ផ្លូម","ploːm",1],["u","ព្លុំ","plum",1]],"p l|v":[["ə","ផ្លូវ","pləv",2],["ɨ","ភ្លៅ","plɨv",2],["iə","ប្លៀវ","pliəw",1],["ie","ភ្លាវ","pliew",1]],"p l|":[["ae","ផ្លែ","plae",2],["ɨː","ភ្លឺ","plɨɨ",2],["iː","ភ្លី","plii",1],["eː","ផ្លេ","pleː",1],["ie","ភ្លា","plie",1],["uː","ភ្លូ","pluː",1],["əː","ភ្លើ","pləː",1]],"p s|m":[["ɑ","ផ្សំ","psɑm",2],["a","ផ្សាំ","psam",1],["aə","ផ្សើម","psaəm",1],["oa","ផ្ស៊ាំ","psoam",1],["oa","ភ្សាំ","psoam",1]],"p s|ŋ":[["ɑː","ផ្សង","psɑɑŋ",2],["eː","ផ្សេង","pseeŋ",2],["ae","ផ្សែង","psaeŋ",2],["ə","ផ្សឹង","psəŋ",1]],"p s|j":[["aː","ផ្សាយ","psaay",2],["a","ផ្សៃ","psaj",1]],"p ʔ|ŋ":[["iə","ផ្អៀង","pʔiəŋ",2],["ɑː","ផ្អង","pʔɑːŋ",1],["o","ផ្អុង","pʔoŋ",1],["ao","ផ្អោង","pʔaoŋ",1]],"p ʔ|k":[["ae","ផ្អែក","pʔaek",2],["ɑː","ផ្អក","pʔɑːk",1],["aː","ផ្អាក","pʔaːk",1],["oː","ផ្អូក","pʔoːk",1],["ao","ផ្អោក","pʔaok",1]],"p ʔ|m":[["ae","ផ្អែម","pʔaem",2],["oː","ផ្អូម","pʔoːm",1]],"p r|n":[["iː","ព្រីន","priin",2],["ɑː","ប្រន","prɑːn",1],["aː","ប្រាណ","praːn",1],["aː","ប្រាន","praːn",1],["ə","ប្រីន","prən",1],["o","ប្រុន","pron",1],["oː","ប្រូន","proːn",1],["ɨə","ប្រឿន","prɨən",1],["iə","ប្រៀន","priən",1],["eː","ប្រេន","breen",1],["ae","ប្រែន","praen",1],["iː","ប្រ៊ីន","priːn",1],["ie","ព្រាន","prien",1],["uː","ព្រូន","pruːn",1],["ɨə","ព្រឿន","prɨən",1],["iə","ព្រៀន","priən",1],["eː","ព្រេន","preːn",1],["oː","ព្រោន","proːn",1],["uː","ភ្រូណ","pruːn",1]],"p c|p":[["oa","ភ្ជាប់","pcoap",2],["ɑ","ផ្ចប់","pcɑp",1],["a","ផ្ចាប់","pcap",1]],"p ɲ|k":[["ea","ភ្ញាក់","pɲeak",2],["o","ផ្ញុក","pɲok",1]],"p ɲ|v":[["iə","ភ្ញៀវ","pɲiəv",2]],"p n|m":[["u","ភ្នំ","pnum",2],["oa","ភ្នាំ","pnoam",1]],"p n|l":[["oa","ភ្នាល់","pnoal",2],["aː","ផ្នាល","pnaːl",1],["oː","ផ្នូល","pnoːl",1],["ao","ផ្នោល","pnaol",1],["ɨ","ព្និល","pnɨl",1],["ɛː","ភ្នែល","pnɛːl",1]],"p l|ŋ":[["ɨ","ភ្លឹង","plɨŋ",2],["əː","ភ្លើង","pləəŋ",2],["iə","ភ្លៀង","pliəŋ",2],["eː","ភ្លេង","pleeŋ",2],["ɑː","ប្លង","plɑːŋ",1],["ɑ","ប្លង់","plɑŋ",1],["aː","ប្លាង","plaːŋ",1],["o","ប្លុង","ploŋ",1],["eː","ប្លេង","pleːŋ",1],["ae","ប្លែង","plaeŋ",1],["ao","ប្លោង","plaoŋ",1],["ɑː","ផ្លង","plɑːŋ",1],["aː","ផ្លាង","plaːŋ",1],["o","ផ្លុង","ploŋ",1],["ae","ផ្លែង","plaeŋ",1],["ao","ផ្លោង","plaoŋ",1],["ɔː","ភ្លង","plɔːŋ",1],["u","ភ្លង់","pluŋ",1],["ie","ភ្លាង","plieŋ",1],["u","ភ្លុង","pluŋ",1]],"p l|c":[["ɨ","ភ្លេច","plɨc",2],["a","ប្លាច់","plac",1],["ə","ប្លិច","pləc",1],["oː","ប្លូច","ploːc",1],["a","ផ្លាច់","plac",1],["ao","ផ្លោច","plaoc",1],["uː","ភ្លូច","pluːc",1]],"p l|t":[["ɛː","ភ្លែត","plɛɛt",2],["ɑː","ប្លត","plɑːt",1],["aː","ប្លាដ","plaːt",1],["aː","ប្លាត","plaːt",1],["ao","ប្លោត","plaot",1],["aː","ផ្លាត","plaːt",1],["ə","ផ្លិត","plət",1],["oː","ផ្លូត","ploːt",1],["uə","ផ្លួត","pluət",1],["eː","ផ្លេត","pleːt",1],["ao","ផ្លោត","plaot",1],["oa","ភ្លាត់","ploat",1],["uː","ភ្លូត","pluːt",1],["uə","ភ្លួត","pluət",1],["eː","ភ្លេត","pleːt",1]],"m kʰ|ŋ":[["aː","ម្ខាង","mkʰaaŋ",2]],"m c|h":[["a","ម្ចាស់","mcah",2],["ae","ម្ចែស","mcaeh",1]],"m c|l":[["u","ម្ជុល","mcul",2]],"m d|ŋ":[["ɑː","ម្ដង","mdɑɑŋ",2]],"m d|j":[["aː","ម្ដាយ","mdaay",2]],"m d|m":[["o","ម្ដុំ","mdom",2]],"m t|h":[["eː","ម្ទេស","mteeh",2]],"m n|k":[["ea","ម្នាក់","mneak",2]],"m n|h":[["oa","ម្នាស់","mnoah",2],["ɨ","ម្នឹស","mnɨh",1]],"m pʰ|j":[["e","ម្ភៃ","mpʰey",2]],"m j|ŋ":[["aː","ម្យ៉ាង","myaaŋ",2],["aː","ម៉្យាង","mjaːŋ",1]],"m r|m":[["ie","ម្រាម","mriem",2],["u","ម្រុម","mrum",1],["u","ម្រុំ","mrum",1],["əː","ម្រើម","mrəːm",1],["oː","ម្រោម","mroːm",1]],"m l|p":[["u","ម្លប់","mlup",2]],"m l|h":[["i","ម្លិះ","mlih",2],["e","ម្ល៉េះ","mleh",2],["e","ម៉្លេះ","mleh",1],["ɑ","ម្ល៉ោះ","mlɑh",1]],"m s|v":[["a","ម្សៅ","msav",2],["a","ម៉្សៅ","msaw",1],["eː","ម្សេវ","mseːw",1]],"m h|p":[["ou","ម្ហូប","mhoup",1],["ɑː","ម្ហប","mhɑːp",1],["oː","ម្ហូប","mhoup",1],["aə","ម្ហើប","mhaəp",1],["eː","ម្ហេប","mheːp",1]],"l ŋ|c":[["ie","ល្ងាច","lŋiec",2]],"l b|p":[["a","ល្បាប់","lbap",2],["ɑ","ល្បប់","lɓɑp",1]],"l b|j":[["ə","ល្បី","lbəy",2],["aː","ល្បាយ","lɓaːj",1],["ao","ល្បោយ","lɓaoj",1]],"l b|n":[["ɨə","ល្បឿន","lbɨən",2]],"l b|ŋ":[["ae","ល្បែង","lbaeŋ",2],["ɑː","ល្បង","lɓɑːŋ",1],["o","ល្បុង","lɓoŋ",1],["uə","ល្បួង","lɓuəŋ",1],["aə","ល្បើង","lɓaəŋ",1]],"l m|m":[["ɔː","ល្មម","lmɔɔm",2]],"l m|t":[["u","ល្មុត","lmut",2],["uə","ល្មួត","lmuət",1],["iə","ល្មៀត","lmiət",1]],"l v|ŋ":[["iː","ល្វីង","lviiŋ",2],["ɨ","ល្វឹង","lwɨŋ",1],["ɛː","ល្វែង","lwɛːŋ",1]],"l h|ŋ":[["o","ល្ហុង","lhoŋ",2],["iə","ល្ហៀង","lhiəŋ",1]],"l ʔ|":[["ɑː","ល្អ","lʔɑɑ",2]],"s k|t":[["o","ស្កុត","skot",2],["ɑ","ស្កត់","skɑt",1],["aː","ស្កាត","skaːt",1],["a","ស្កាត់","skat",1],["ao","ស្កោត","skaot",1],["iː","ស្គីត","skiːt",1],["u","ស្គុត","skut",1],["uː","ស្គូត","skuːt",1]],"s k|v":[["ə","ស្កូវ","skəv",2]],"s k|p":[["iə","ស្កៀប","skiəp",2],["ɑ","ស្កប់","skɑp",1],["o","ស្កុប","skop",1],["eː","ស្កេប","skeːp",1],["iː","ស្គីប","skiːp",1],["uː","ស្គូប","skuːp",1]],"s k|l":[["oa","ស្គាល់","skoal",2],["ɑ","ស្កល់","skɑl",1],["aː","ស្កាល","skaːl",1],["ə","ស្កិល","skəl",1],["o","ស្កុល","skol",1],["oː","ស្កូល","skoːl",1],["aə","ស្កើល","skaəl",1],["eː","ស្កេល","skeːl",1],["u","ស្គុល","skul",1],["uː","ស្គូល","skuːl",1],["ɛː","ស្គែល","skɛːl",1]],"s k|n":[["ɛː","ស្គែន","skɛɛn",2],["ɑ","ស្កន់","skɑn",1],["o","ស្កុន","skon",1],["eː","ស្កេន","skeːn",1],["u","ស្គន់","skun",1],["iː","ស្គីន","skiːn",1]],"s k r|n":[["iː","ស្គ្រីន","skriin",2]],"s ŋ|t":[["a","ស្ងាត់","sŋat",2],["uə","ស្ងួត","sŋuət",2]],"s ŋ|p":[["aː","ស្ងាប","sŋaap",2],["ɑ","ស្ងប់","sŋɑp",1],["aə","ស្ងើប","sŋaəp",1]],"s ŋ|m":[["iə","ស្ងៀម","sŋiəm",2]],"s d|m":[["a","ស្ដាំ","sdam",2],["ɑː","ស្ដម","sɗɑːm",1]],"s d|p":[["a","ស្ដាប់","sdap",2],["oː","ស្ដូប","sɗoːp",1],["eː","ស្ដេប","sɗeːp",1]],"s d|j":[["aː","ស្ដាយ","sdaay",2],["ə","ស្ដី","sdəy",2],["əː","ស្ដឺយ","sɗəːj",1]],"s d|k":[["o","ស្ដុក","sdok",2],["oː","ស្ដូក","sɗoːk",1]],"s d|ŋ":[["aə","ស្ដើង","sdaəŋ",2],["ə","ស្ដឹង","sɗəŋ",1],["iə","ស្ដៀង","sɗiəŋ",1],["ae","ស្ដែង","sɗaeŋ",1]],"s t|ŋ":[["ɑ","ស្តង់","stɑŋ",2],["uː","ស្ទូង","stuuŋ",2],["ʊə","ស្ទង់","stʊəŋ",1],["ɔː","ស្ទង","stɔːŋ",1],["u","ស្ទង់","stʊəŋ",1],["iː","ស្ទីង","stiːŋ",1],["ɨ","ស្ទឹង","stɨŋ",1],["u","ស្ទុង","stuŋ",1],["əː","ស្ទើង","stəːŋ",1],["iə","ស្ទៀង","stiəŋ",1],["eː","ស្ទេង","steːŋ",1],["oː","ស្ទោង","stoːŋ",1]],"s t|j":[["aː","ស្តាយ","staay",1],["aː","ស្តាយ៍","staːj",1],["aː","ស្ទាយ៍","staːj",1],["u","ស្ទុយ","stuj",1],["uə","ស្ទួយ","stuəj",1],["e","ស្ទៃ","stej",1]],"s t|p":[["o","ស្តុប","stop",2],["ie","ស្ទាប","stiep",2],["ɑ","ស្តប់","stɑp",1],["oː","ស្តូប","stoːp",1],["eː","ស្តេប","steːp",1],["ɔː","ស្ទប","stɔːp",1],["u","ស្ទប់","stup",1]],"s t r|j":[["ə","ស្ត្រី","strəy",2]],"s tʰ|t":[["ə","ស្ថិត","stʰət",2]],"s t|h":[["ea","ស្ទះ","steah",2],["u","ស្ទុះ","stuh",1],["e","ស្ទេះ","steh",1],["ɛ","ស្ទែះ","stɛh",1],["uə","ស្ទោះ","stuəh",1]],"s n|k":[["a","ស្នាក់","snak",2],["oː","ស្នូក","snoːk",1],["eː","ស្នេក","sneːk",1]],"s n|m":[["aː","ស្នាម","snaam",2],["ə","ស្និម","snəm",1],["ə","ស្នឹម","snəm",1],["o","ស្នុំ","snom",1],["ɑ","ស្នំ","snɑm",1]],"s n|t":[["ə","ស្និត","snət",2],["oː","ស្នូត","snoːt",1],["iə","ស្នៀត","sniət",1]],"s n|":[["uə","ស្នួ","snuə",2],["ɑː","ស្ន","snɑː",1],["aː","ស្នា","snaː",1],["aə","ស្នើ","snaə",1],["eː","ស្នេ","sneː",1],["ae","ស្នែ","snae",1],["ao","ស្នោ","snao",1]],"s n|ŋ":[["ae","ស្នែង","snaeŋ",2],["ɑː","ស្នង","snɑːŋ",1],["ə","ស្នឹង","snəŋ",1],["iə","ស្នៀង","sniəŋ",1]],"s b|ŋ":[["ɑ","ស្បង់","sbɑŋ",2],["iə","ស្បៀង","sɓiəŋ",1],["ae","ស្បែង","sɓaeŋ",1],["ao","ស្បោង","sɓaoŋ",1]],"s b|j":[["aə","ស្បើយ","sbaəy",2],["a","ស្បៃ","sɓaj",1]],"s b|k":[["ae","ស្បែក","sbaek",2]],"s p|j":[["ie","ស្ពាយ","spiey",2],["e","ស្ពៃ","spey",2],["u","ស្ពុយ","spuj",1]],"s m|":[["aː","ស្មា","smaa",2],["aə","ស្មើ","smaə",2],["əː","ស្មឺ","sməː",1],["oː","ស្មូ","smoː",1],["eː","ស្មេ","smeː",1],["ae","ស្មែ","smae",1]],"s m|n":[["aː","ស្មាន","smaan",2],["ɑ","ស្មន់","smɑn",1],["a","ស្មាន់","sman",1],["oː","ស្មូន","smoːn",1],["ɨə","ស្មឿន","smɨən",1],["iə","ស្មៀន","smiən",1]],"s m|k":[["o","ស្មុគ","smok",2],["aː","ស្មាក","smaːk",1],["ɨə","ស្មឿក","smɨək",1],["ae","ស្មែក","smaek",1],["ao","ស្មោក","smaok",1]],"s m|h":[["ɑ","ស្មោះ","smɑh",2],["aː","ស្មាស","smaːh",1],["a","ស្មាស់","smah",1]],"s m|v":[["a","ស្មៅ","smav",2]],"s r|h":[["a","ស្រះ","srah",2],["ɑ","ស្រស់","srɑh",2],["o","ស្រុស","sroh",2],["a","ស្រាស់","srah",1],["o","ស្រុះ","sroh",1],["oː","ស្រូស","sroːh",1],["e","ស្រេះ","sreh",1],["ae","ស្រែស","sraeh",1],["ae","ស្រែះ","sraeh",1],["ɑ","ស្រោះ","srɑh",1],["uː","ស្រ៊ូស","sruːh",1]],"s r|ʔ":[["a","ស្រៈ","sraʔ",2]],"s r|k":[["ɑː","ស្រក","srɑɑk",2],["ɑ","ស្រក់","srɑk",2],["o","ស្រុក","srok",2],["eː","ស្រេក","sreek",2],["ae","ស្រែក","sraek",2],["eː","ស៊្រេក","sreːk",1],["aː","ស្រាក","sraːk",1],["a","ស្រាក់","srak",1],["iə","ស្រៀក","sriək",1],["ao","ស្រោក","sraok",1]],"s r|ŋ":[["ɑ","ស្រង់","srɑŋ",2],["ie","ស៊្រាង","srieŋ",1],["ɑː","ស្រង","srɑːŋ",1],["aː","ស្រាង","sraːŋ",1],["ə","ស្រឹង","srəŋ",1],["o","ស្រុង","sroŋ",1],["aə","ស្រើង","sraəŋ",1],["ɨə","ស្រឿង","srɨəŋ",1],["iə","ស្រៀង","sriəŋ",1],["eː","ស្រេង","sreːŋ",1],["ae","ស្រែង","sraeŋ",1],["ao","ស្រោង","sraoŋ",1],["ie","ស្រ៊ាង","srieŋ",1],["u","ស្រ៊ុង","sruŋ",1]],"s r|p":[["ɑː","ស្រប","srɑɑp",2],["a","ស្រាប់","srap",2],["ou","ស្រូប","sroup",1],["ɑ","ស្រប់","srɑp",1],["ɑ","ស្រព","srɑp",1],["ə","ស្រិប","srəp",1],["ə","ស្រឹប","srəp",1],["oː","ស្រូប","sroup",1],["aə","ស្រើប","sraəp",1],["eː","ស្រេប","sreːp",1],["ao","ស្រោប","sraop",1],["u","ស្រ៊ុប","srup",1]],"s r|":[["aː","ស្រា","sraa",2],["ae","ស្រែ","srae",2],["ie","ស៊្រា","srie",1],["ɑː","ស្រ","srɑː",1],["əː","ស្រឺ","srəː",1],["ɨə","ស្រឿ","srɨə",1],["iː","ស្រ៊ី","sriː",1]],"s r|t":[["aː","ស្រាត","sraat",2],["ə","ស្រិត","srət",1],["əː","ស្រឺត","srəːt",1],["o","ស្រុត","srot",1],["oː","ស្រូត","sroːt",1],["uə","ស្រួត","sruət",1]],"s r|j":[["aː","ស្រាយ","sraay",2],["ə","ស្រី","srəy",2],["oː","ស្រូយ","sroːj",1],["uə","ស្រួយ","sruəj",1],["u","ស្រ៊ុយ","sruj",1]],"s r|l":[["aː","ស្រាល","sraal",2],["uə","ស្រួល","sruəl",2],["ɑ","ស្រល់","srɑl",1],["ə","ស្រិល","srəl",1],["oː","ស្រូល","sroːl",1],["aə","ស្រើល","sraəl",1],["ao","ស្រោល","sraol",1]],"s r|v":[["ə","ស្រូវ","srəv",2],["aː","ស្រាវ","sraːw",1],["iə","ស្រៀវ","sriəw",1],["iː","ស្រ៊ីវ","sriːw",1]],"s r|c":[["uə","ស្រួច","sruəc",2],["a","ស្រេច","srac",2],["ao","ស្រោច","sraoc",2],["u","ស្រ៊ុច","sruc",1]],"s r|m":[["ao","ស្រោម","sraom",2],["ɑ","ស្រម","srɑm",1],["aː","ស្រាម","sraːm",1],["a","ស្រាំ","sram",1],["ə","ស្រិម","srəm",1],["ə","ស្រឹម","srəm",1],["ɨə","ស្រឿម","srɨəm",1],["iə","ស្រៀម","sriəm",1],["eː","ស្រេម","sreːm",1],["ɑ","ស្រំ","srɑm",1],["iː","ស្រ៊ីម","sriːm",1]],"s l|":[["ɑː","ស្ល","slɑɑ",2],["uː","ស៊្លូ","sluː",1],["aː","ស្លា","slaː",1],["əː","ស្លឺ","sləː",1],["oː","ស្លូ","sloː",1],["ae","ស្លែ","slae",1],["ao","ស្លោ","slao",1]],"s l|k":[["a","ស្លាក់","slak",2],["ə","ស្លឹក","slək",2],["iə","ស្លៀក","sliək",2],["ɑː","ស្លក","slɑːk",1],["ɑ","ស្លក់","slɑk",1],["aː","ស្លាក","slaːk",1],["eː","ស្លេក","sleːk",1],["ao","ស្លោក","slaok",1],["ɛː","ស្ល៊ែក","slɛːk",1]],"s l|p":[["aː","ស្លាប","slaap",2],["a","ស្លាប់","slap",2],["ɑː","ស្លប","slɑːp",1],["iː","ស្លីប","sliːp",1],["ə","ស្លឹប","sləp",1],["o","ស្លុប","slop",1]],"s v|ŋ":[["aː","ស្វាង","svaaŋ",2],["ae","ស្វែង","swaeŋ",1],["ɛː","ស្វ៊ែង","swɛːŋ",1]],"s v|j":[["aː","ស្វាយ","svaay",2],["ə","ស្វី","swəj",1],["ao","ស្វោយ","swaoj",1]],"s v|t":[["ə","ស្វិត","svət",2],["ɑː","ស្វដ","swɑːt",1],["ɑː","ស្វត","swɑːt",1],["aː","ស្វាត","swaːt",1],["iː","ស្វីត","swiːt",1],["ae","ស្វេត","swaet",1],["iː","ស្វ៊ីត","swiːt",1]],"s ʔ|t":[["aː","ស្អាត","sʔaat",2],["ə","ស្អិត","sʔət",2]],"s ʔ|j":[["ə","ស្អី","sʔəy",2],["o","ស្អុយ","sʔoy",2],["ɑː","ស្អយ","sʔɑːj",1]],"s ʔ|h":[["o","ស្អុះ","sʔoh",2]],"s ʔ|k":[["ae","ស្អែក","sʔaek",2],["ɑː","ស្អក","sʔɑːk",1],["aː","ស្អាក","sʔaːk",1],["eː","ស្អេក","sʔeːk",1]],"ʔ v|j":[["ə","អ្វី","ʔvəy",2]],"k ŋ|":[["ɑː","ក្ង","kŋɑː",1]],"k ŋ|k":[["ɑ","ក្ងក់","kŋɑk",1],["o","ក្ងុក","kŋok",1],["iə","ក្ងៀក","kŋiək",1],["ao","ក្ងោក","kŋaok",1]],"k ŋ|ŋ":[["ɑ","ក្ងង់","kŋɑŋ",1],["o","ក្ងុង","kŋoŋ",1],["iə","ក្ងៀង","kŋiəŋ",1],["ae","ក្ងែង","kŋaeŋ",1]],"k ŋ|n":[["aː","ក្ងាន","kŋaːn",1]],"k ŋ|c":[["ə","ក្ងិច","kŋəc",1]],"k ŋ|t":[["ə","ក្ងិត","kŋət",1]],"k ŋ|l":[["o","ក្ងុល","kŋol",1]],"k ŋ|h":[["o","ក្ងុះ","kŋoh",1],["e","ក្ងេះ","kŋeh",1]],"k d|":[["ɑː","ក្ដ","kɗɑː",1]],"k d|k":[["ɑ","ក្ដក់","kɗɑk",1],["aː","ក្ដាក","kɗaːk",1],["a","ក្ដាក់","kɗak",1],["o","ក្ដុក","kɗok",1],["u","ក្ឌុក","kɗuk",1]],"k d|n":[["ɑ","ក្ដន់","kɗɑn",1],["a","ក្ដាន់","kɗan",1],["iə","ក្ដៀន","kɗiən",1]],"k d|ɲ":[["a","ក្ដាញ់","kɗaɲ",1]],"k d|t":[["aː","ក្ដាត","kɗaːt",1],["a","ក្ដាត់","kɗat",1],["ə","ក្ដិត","kɗət",1],["o","ក្ដុត","kɗot",1]],"k d|m":[["aː","ក្ដាម","kɗaːm",1],["o","ក្ដុំ","kɗom",1],["u","ក្ឌុំ","kɗum",1]],"k d|c":[["ə","ក្ដិច","kɗəc",1],["uə","ក្ដួច","kɗuəc",1]],"k d|h":[["ə","ក្ដឹះ","kɗəh",1]],"k d|l":[["o","ក្ដុល","kɗol",1],["uə","ក្ដួល","kɗuəl",1]],"k n|k":[["ɑ","ក្នក់","knɑk",1],["aː","ខ្នាក","knaːk",1]],"k n|ɲ":[["a","ក្នាញ់","knaɲ",1],["a","ខ្នាញ់","knaɲ",1]],"k n|t":[["a","ក្នាត់","knat",1],["aː","ខ្នាត","knaːt",1],["a","ខ្នាត់","knat",1],["ə","ខ្និត","knət",1],["uə","ខ្នួត","knuət",1],["aə","ខ្នើត","knaət",1],["u","ឃ្នុត","knut",1]],"k n|c":[["ə","ក្និច","knəc",1],["aː","ខ្នាច","knaːc",1],["a","ខ្នាច់","knac",1],["ə","ខ្និច","knəc",1],["uə","ខ្នួច","knuəc",1]],"k b|k":[["ɑː","ក្បក","kɓɑːk",1],["a","ក្បាក់","kɓak",1]],"k b|t":[["ɑ","ក្បត់","kɓɑt",1],["ə","ក្បិត","kɓət",1],["ə","ក្បិទ","kɓət",1],["əː","ក្បឺត","kɓəːt",1],["eː","ក្បេត","kɓeːt",1]],"k b|p":[["aː","ក្បាប","kɓaːp",1],["iə","ក្បៀប","kɓiəp",1]],"k b|j":[["aː","ក្បាយ","kɓaːj",1]],"k b|m":[["ɑ","ក្បំ","kɓɑm",1]],"k m|m":[["oː","ក្មូម","kmoːm",1],["ɔː","ឃ្មម","kmɔːm",1],["u","ឃ្មុំ","kmum",1]],"k m|k":[["eː","ក្មេក","kmeːk",1],["a","ខ្មាក់","kmak",1],["o","ខ្មុក","kmok",1],["ɨ","ឃ្មឹក","kmɨk",1]],"k j|":[["aː","ក្យា","kjaː",1],["oː","ក្យូ","kjoː",1],["aː","ខ្យា","kjaː",1],["uː","ឃ្យូ","kjuː",1]],"k j|h":[["a","ក្យាស់","kjah",1],["oː","ក្យូស","kjoːh",1]],"k j|v":[["ə","ក្យូវ","kjəw",1],["ə","ខ្យូវ","kjəw",1]],"k r|n":[["ɑː","ក្រន","krɑːn",1],["aː","ក្រាន","kraːn",1],["a","ក្រាន់","kran",1],["ə","ក្រិន","krən",1],["ə","ក្រឹន","krən",1],["oː","ក្រូន","kroːn",1],["aə","ក្រើន","kraən",1],["eː","ក្រេន","kreːn",1],["ao","ក្រោន","kraon",1],["u","គ្រន់","krun",1],["oa","គ្រាន់","kroan",1],["ɨ","គ្រិន","krɨn",1],["iː","គ្រីន","kriːn",1],["u","គ្រុន","krun",1],["uː","គ្រូន","kruːn",1],["əː","គ្រើន","krəːn",1],["ɨə","គ្រឿន","krɨən",1],["eː","គ្រេន","kreːn",1],["oː","គ្រោន","kroːn",1]],"k r|ɲ":[["aː","ក្រាញ","kraːɲ",1],["a","ក្រាញ់","kraɲ",1],["aə","ក្រើញ","kraəɲ",1],["ie","គ្រាញ","krieɲ",1],["u","គ្រុញ","kruɲ",1]],"k l|m":[["ɑː","ក្លម","klɑːm",1],["a","ក្លាំ","klam",1],["o","ក្លុំ","klom",1],["ae","ក្លែម","klaem",1],["ɑ","ក្លំ","klɑm",1],["aː","ខ្លាម","klaːm",1],["a","ខ្លាំ","klam",1],["ə","ខ្លឹម","kləm",1],["o","ខ្លុំ","klom",1],["ɑ","ខ្លំ","klɑm",1],["iː","គ្លីម","kliːm",1],["uː","គ្លូម","kluːm",1],["eː","គ្លេម","kleːm",1],["oa","ឃ្លាំ","kloam",1],["u","ឃ្លុម","klum",1],["u","ឃ្លុំ","klum",1]],"k l|t":[["aː","ក្លាដ","klaːt",1],["aː","ក្លាត","klaːt",1],["a","ក្លាត់","klat",1],["aː","ខ្លាត","klaːt",1],["ə","ខ្លឹត","klət",1],["əː","ខ្លឺត","kləːt",1],["oː","ខ្លូត","kloːt",1],["ao","ខ្លោដ","klaot",1],["ao","ខ្លោត","klaot",1],["eː","គ្លេដ","kleːt",1],["ie","ឃ្លាត","kliet",1],["iə","ឃ្លៀត","kliət",1]],"k l|v":[["aː","ក្លាវ","klaːw",1],["iː","ក្លីវ","kliːw",1],["ə","ក្លូវ","kləw",1],["eː","ក្លេវ","kleːw",1],["eː","ខ្លេវ","kleːw",1],["a","ខ្លៅ","klaw",1],["iː","ឃ្លីវ","kliːw",1]],"k v|ŋ":[["ɑ","ក្វង់","kwɑŋ",1],["aː","ក្វាង","kwaːŋ",1],["aə","ក្វើង","kwaəŋ",1],["ɑː","ខ្វង","kwɑːŋ",1],["aː","ខ្វាង","kwaːŋ",1],["ae","ខ្វែង","kwaeŋ",1],["ie","ឃ្វាង","kwieŋ",1],["iː","ឃ្វីង","kwiːŋ",1],["əː","ឃ្វើង","kwəːŋ",1]],"k v|n":[["aː","ក្វាន","kwaːn",1],["iː","ក្វីន","kwiːn",1],["ae","ក្វែន","kwaen",1],["aː","ខ្វាន","kwaːn",1],["a","ខ្វាន់","kwan",1],["ə","ខ្វិន","kwən",1],["iə","ខ្វៀន","kwiən",1],["iː","គ្វីន","kwiːn",1],["ɛː","គ្វែន","kwɛːn",1],["ɨ","ឃ្វិន","kwɨn",1],["iː","ឃ្វីន","kwiːn",1]],"k v|j":[["aː","ក្វាយ","kwaːj",1],["aə","ខ្វើយ","kwaəj",1],["eː","ខ្វេយ","kweːj",1],["a","ខ្វៃ","kwaj",1],["ie","ឃ្វាយ","kwiej",1]],"k v|v":[["aː","ក្វាវ","kwaːw",1],["aː","ខ្វាវ","kwaːw",1],["ae","ខ្វែវ","kwaew",1]],"k s|n":[["ə","ក្សិណ","ksən",1],["ə","ក្សីណ","ksən",1],["aː","ខ្សាន","ksaːn",1]],"k ʔ|j":[["ɑː","ក្អយ","kʔɑːj",1],["aː","ក្អាយ","kʔaːj",1],["ɨə","ក្អឿយ","kʔɨəj",1]],"k ʔ|n":[["ə","ក្អិន","kʔən",1],["oː","ក្អូន","kʔoːn",1]],"k ʔ|ŋ":[["eː","ក្អេង","kʔeːŋ",1],["iː","គ្អីង","kʔiːŋ",1]],"k ʔ|":[["ae","ក្អែ","kʔae",1]],"k ʔ|p":[["ae","ក្អែប","kʔaep",1]],"k c|n":[["ɑː","ខ្ចន","kcɑːn",1],["oa","ខ្ជាន់","kcoan",1]],"k c|":[["aː","ខ្ចា","kcaː",1]],"k c|t":[["a","ខ្ចាត់","kcat",1],["ao","ខ្ចោត","kcaot",1]],"k c|h":[["a","ខ្ចាស់","kcah",1],["ɑ","ខ្ចោះ","kcɑh",1]],"k c|v":[["ə","ខ្ចូវ","kcəw",1],["a","ខ្ចៅ","kcaw",1]],"k c|c":[["aə","ខ្ចើច","kcaəc",1],["əː","ខ្ជើច","kcəːc",1]],"k c|m":[["oa","ខ្ជាំ","kcoam",1]],"k c|ɲ":[["ɨ","ខ្ជេញ","kcɨɲ",1]],"k ɲ|k":[["ɑː","ខ្ញក","kɲɑːk",1],["aː","ខ្ញាក","kɲaːk",1],["o","ខ្ញុក","kɲok",1],["ae","ខ្ញែក","kɲaek",1],["ao","ខ្ញោក","kɲaok",1]],"k ɲ|ŋ":[["ɑ","ខ្ញង់","kɲɑŋ",1],["ə","ខ្ញឹង","kɲəŋ",1],["o","ខ្ញុង","kɲoŋ",1],["oː","ខ្ញូង","kɲoːŋ",1],["ae","ខ្ញែង","kɲaeŋ",1]],"k ɲ|l":[["a","ខ្ញាល់","kɲal",1],["ə","ខ្ញិល","kɲəl",1]],"k ɲ|n":[["ə","ខ្ញិន","kɲən",1]],"k ɲ|j":[["ə","ខ្ញី","kɲəj",1]],"k ɲ|c":[["oː","ខ្ញូច","kɲoːc",1],["aə","ខ្ញើច","kɲaəc",1],["əː","ឃ្ញើច","kɲəːc",1],["oː","ឃ្ញោច","kɲoːc",1]],"k ɲ|v":[["iə","ខ្ញៀវ","kɲiəw",1]],"k ɲ|t":[["ae","ខ្ញែត","kɲaet",1]],"k t|ɲ":[["uə","ខ្ទួញ","ktuəɲ",1]],"k t|j":[["uə","ខ្ទួយ","ktuəj",1],["əː","ខ្ទើយ","ktəːj",1]],"k t|k":[["oː","ខ្ទោក","ktoːk",1]],"k n|n":[["ɑ","ខ្នន់","knɑn",1],["aː","ខ្នាន","knaːn",1],["eː","ខ្នេន","kneːn",1],["oa","គ្នាន់","knoan",1]],"k n|p":[["ɑ","ខ្នប់","knɑp",1],["aː","ខ្នាប","knaːp",1],["ə","ខ្នឹប","knəp",1],["əː","ខ្នឺប","knəːp",1],["uə","ខ្នួប","knuəp",1],["ie","ឃ្នាប","kniep",1],["uə","ឃ្នួប","knuəp",1],["iə","ឃ្នៀប","kniəp",1]],"k n|m":[["o","ខ្នុំ","knom",1]],"k n|h":[["iə","ខ្នៀស","kniəh",1],["ao","ខ្នោស","knaoh",1],["ɑ","ខ្នោះ","knɑh",1],["ie","ឃ្នាស","knieh",1],["oa","ឃ្នាស់","knoah",1],["uː","ឃ្នូស","knuːh",1],["əː","ឃ្នើស","knəːh",1],["iə","ឃ្នៀស","kniəh",1]],"k n|v":[["a","ខ្នៅ","knaw",1]],"k p|":[["ɔː","ខ្ព","kpɔː",1]],"k p|ŋ":[["u","ខ្ពង់","kpuŋ",1]],"k p|p":[["ɔː","ខ្ពប","kpɔːp",1],["u","ខ្ពប់","kpup",1]],"k p|k":[["ie","ខ្ពាក","kpiek",1],["oː","ខ្ពោក","kpoːk",1]],"k p|m":[["əː","ខ្ពើម","kpəːm",1]],"k m|l":[["ɑ","ខ្មល់","kmɑl",1],["o","ខ្មុល","kmol",1],["uə","ខ្មួល","kmuəl",1],["i","ឃ្មិល","kmil",1],["ɨ","ឃ្មឹល","kmɨl",1]],"k m|ɲ":[["a","ខ្មាញ់","kmaɲ",1],["uə","ខ្មួញ","kmuəɲ",1],["uə","ឃ្មួញ","kmuəɲ",1]],"k m|t":[["aː","ខ្មាត","kmaːt",1],["a","ខ្មាត់","kmat",1],["əː","ខ្មឺត","kməːt",1],["oː","ខ្មូត","kmoːt",1],["u","ឃ្មត់","kmut",1],["u","ឃ្មុត","kmut",1]],"k m|h":[["aː","ខ្មាស","kmaːh",1],["e","ខ្មេះ","kmeh",1],["ɑ","ខ្មោះ","kmɑh",1],["ie","ឃ្មាស","kmieh",1],["oa","ឃ្មាស់","kmoah",1],["uə","ឃ្មោះ","kmuəh",1]],"k j|p":[["oː","ខ្យូប","kjoːp",1],["uː","គ្យូប","kjuːp",1],["uː","ឃ្យូប","kjuːp",1]],"k j|m":[["aə","ខ្យើម","kjaəm",1]],"k v|k":[["ɑː","ខ្វក","kwɑːk",1],["ɑ","ខ្វក់","kwɑk",1],["aː","ខ្វាក","kwaːk",1],["a","ខ្វាក់","kwak",1],["aə","ខ្វើក","kwaək",1],["iə","ខ្វៀក","kwiək",1],["ae","ខ្វែក","kwaek",1],["ao","ខ្វោក","kwaok",1],["iː","ឃ្វីក","kwiːk",1],["əː","ឃ្វើក","kwəːk",1]],"k v|":[["aː","ខ្វា","kwaː",1],["aə","ខ្វើ","kwaə",1],["eː","ខ្វេ","kweː",1],["ae","ខ្វែ","kwae",1],["iː","ឃ្វី","kwiː",1],["iə","ឃ្វៀ","kwiə",1],["eː","ឃ្វេ","kweː",1]],"k v|c":[["aː","ខ្វាច","kwaːc",1],["a","ខ្វាច់","kwac",1],["ə","ខ្វិច","kwəc",1],["ie","ឃ្វាច","kwiec",1],["ɨ","ឃ្វិច","kwɨc",1],["əː","ឃ្វើច","kwəːc",1]],"k v|p":[["aː","ខ្វាប","kwaːp",1],["a","ខ្វាប់","kwap",1],["iə","ខ្វៀប","kwiəp",1]],"k v|m":[["aː","ខ្វាម","kwaːm",1],["ie","គ្វាម","kwiem",1],["ie","ឃ្វាម","kwiem",1]],"k s|t":[["ɑː","ខ្សត","ksɑːt",1],["ɑ","ខ្សត់","ksɑt",1],["a","ខ្សាត់","ksat",1],["əː","ខ្សឺត","ksəːt",1],["ae","ខ្សែត","ksaet",1]],"k s|k":[["aː","ខ្សាក","ksaːk",1],["ə","ខ្សឹក","ksək",1],["o","ខ្សុក","ksok",1],["iə","ខ្សៀក","ksiək",1],["ao","ខ្សោក","ksaok",1]],"k s|p":[["aː","ខ្សាប","ksaːp",1],["ə","ខ្សឹប","ksəp",1]],"k s|m":[["aː","ខ្សាម","ksaːm",1],["o","ខ្សុំ","ksom",1],["ɨ","ឃ្សឹម","ksɨm",1]],"k s|v":[["aː","ខ្សាវ","ksaːw",1],["eː","ខ្សេវ","kseːw",1]],"k s|ŋ":[["ə","ខ្សឹង","ksəŋ",1]],"k s|h":[["uə","ខ្សួស","ksuəh",1],["ɑ","ខ្សោះ","ksɑh",1]],"k v|ɲ":[["ie","គ្វាញ","kwieɲ",1],["iː","គ្វីញ","kwiːɲ",1],["ɨ","ឃ្វិញ","kwɨɲ",1]],"k m|p":[["ɨ","ឃ្មឹប","kmɨp",1]],"k m|":[["uə","ឃ្មួ","kmuə",1]],"k j|n":[["u","ឃ្យុន","kjun",1]],"ŋ v|ŋ":[["iə","ង្វៀង","ŋwiəŋ",1]],"ŋ v|n":[["iə","ង្វៀន","ŋwiən",1]],"c n|j":[["a","ច្នៃ","cnaj",1],["a","ឆ្នៃ","cnaj",1],["e","ឈ្នៃ","cnej",1]],"c b|ŋ":[["ɑː","ច្បង","cɓɑːŋ",1]],"c b|k":[["a","ច្បាក់","cɓak",1],["oː","ច្បូក","cɓoːk",1]],"c b|c":[["ə","ច្បិច","cɓəc",1],["o","ច្បុច","cɓoc",1]],"c b|t":[["oː","ច្បូត","cɓoːt",1]],"c b|l":[["ao","ច្បោល","cɓaol",1]],"c r|c":[["ɑː","ច្រច","crɑːc",1],["a","ច្រាច់","crac",1],["ə","ច្រិច","crəc",1],["oː","ច្រូច","croːc",1],["uə","ច្រួច","cruəc",1],["iə","ច្រៀច","criəc",1],["ə","ច្រេច","crəc",1]],"c r|m":[["ɑː","ច្រម","crɑːm",1],["aː","ច្រាម","craːm",1],["ə","ច្រឹម","crəm",1],["əː","ច្រឺម","crəːm",1],["ɑ","ច្រំ","crɑm",1],["ie","ជ្រាម","criem",1],["oa","ជ្រាំ","croam",1],["u","ជ្រុំ","crum",1],["əː","ជ្រើម","crəːm",1],["oː","ជ្រោម","croːm",1],["u","ជ្រំ","crum",1]],"c r|j":[["aː","ច្រាយ","craːj",1],["a","ច្រៃ","craj",1],["ie","ជ្រាយ","criej",1],["uə","ជ្រួយ","cruəj",1],["əː","ជ្រើយ","crəːj",1],["e","ជ្រៃ","crej",1],["oː","ជ្រោយ","croːj",1]],"c k|j":[["ɑː","ឆ្កយ","ckɑːj",1],["o","ឆ្កុយ","ckoj",1]],"c k|ŋ":[["aː","ឆ្កាង","ckaːŋ",1],["ə","ឆ្កឹង","ckəŋ",1],["ɔː","ឆ្គង","ckɔːŋ",1]],"c k|l":[["ə","ឆ្កិល","ckəl",1],["iə","ឆ្កៀល","ckiəl",1]],"c k|k":[["ao","ឆ្កោក","ckaok",1]],"c ŋ|k":[["ɑː","ឆ្ងក","cŋɑːk",1],["ɑ","ឆ្ងក់","cŋɑk",1],["aə","ឆ្ងើក","cŋaək",1],["oː","ឈ្ងោក","cŋoːk",1]],"c ŋ|t":[["ə","ឆ្ងិត","cŋət",1]],"c ŋ|ŋ":[["ə","ឆ្ងឹង","cŋəŋ",1]],"c ŋ|v":[["ə","ឆ្ងូវ","cŋəw",1]],"c d|p":[["o","ឆ្ដុប","cɗop",1]],"c d|ɲ":[["ə","ឆ្ដេញ","cɗəɲ",1]],"c d|":[["ao","ឆ្ដោ","cɗao",1]],"c n|k":[["aː","ឆ្នាក","cnaːk",1],["a","ឆ្នាក់","cnak",1],["o","ឆ្នុក","cnok",1],["uə","ឈ្នក់","cnuək",1]],"c n|p":[["a","ឆ្នាប់","cnap",1],["u","ឈ្នប់","cnup",1],["oa","ឈ្នាប់","cnoap",1]],"c n|c":[["o","ឆ្នុច","cnoc",1]],"c n|n":[["uə","ឆ្នួន","cnuən",1],["ie","ឈ្នាន","cnien",1],["oa","ឈ្នាន់","cnoan",1],["uə","ឈ្នួន","cnuən",1]],"c n|ŋ":[["iə","ឆ្នៀង","cniəŋ",1],["ae","ឆ្នែង","cnaeŋ",1],["ie","ឈ្នាង","cnieŋ",1],["iə","ឈ្នៀង","cniəŋ",1]],"c n|v":[["a","ឆ្នៅ","cnaw",1]],"c p|ŋ":[["u","ឆ្ពង់","cpuŋ",1],["u","ឆ្ពុង","cpuŋ",1]],"c p|m":[["ie","ឆ្ពាម","cpiem",1]],"c p|t":[["ɨ","ឆ្ពិត","cpɨt",1]],"c p|n":[["ɨ","ឆ្ពិន","cpɨn",1],["eː","ឆ្ពេន","cpeːn",1]],"c m|k":[["ɑ","ឆ្មក់","cmɑk",1],["u","ឈ្មុក","cmuk",1]],"c m|p":[["ɑː","ឆ្មប","cmɑːp",1]],"c m|m":[["a","ឆ្មាំ","cmam",1],["ɔː","ឈ្មម","cmɔːm",1]],"c m|ŋ":[["aə","ឆ្មើង","cmaəŋ",1],["iə","ឆ្មៀង","cmiəŋ",1],["ɔː","ឈ្មង","cmɔːŋ",1],["iə","ឈ្មៀង","cmiəŋ",1]],"c m|ɲ":[["ɨ","ឆ្មេញ","cmɨɲ",1],["uə","ឈ្មួញ","cmuəɲ",1]],"c m|j":[["a","ឆ្មៃ","cmaj",1],["uə","ឈ្មួយ","cmuəj",1]],"c l|":[["aː","ឆ្លា","claː",1],["eː","ឆ្លេ","cleː",1],["iː","ឈ្លី","cliː",1]],"c l|m":[["aː","ឆ្លាម","claːm",1],["ə","ឆ្លឹម","cləm",1],["əː","ឆ្លឺម","cləːm",1],["ɔː","ឈ្លម","clɔːm",1],["ie","ឈ្លាម","cliem",1],["əː","ឈ្លើម","cləːm",1],["eː","ឈ្លេម","cleːm",1],["ɛː","ឈ្លែម","clɛːm",1],["oː","ឈ្លោម","cloːm",1]],"c l|ɲ":[["oː","ឆ្លូញ","cloːɲ",1]],"c l|v":[["ə","ឆ្លូវ","cləw",1],["a","ឆ្លៅ","claw",1]],"c v|k":[["a","ឆ្វាក់","cwak",1],["eː","ឆ្វេក","cweːk",1]],"c v|j":[["aː","ឆ្វាយ","cwaːj",1]],"c v|l":[["iə","ឆ្វៀល","cwiəl",1],["ae","ឆ្វែល","cwael",1],["ie","ជ្វាល","cwiel",1]],"c ʔ|l":[["ɑ","ឆ្អល់","cʔɑl",1],["aː","ឆ្អាល","cʔaːl",1]],"c ʔ|p":[["aː","ឆ្អាប","cʔaːp",1],["aə","ឆ្អើប","cʔaəp",1]],"c ʔ|m":[["aə","ឆ្អើម","cʔaəm",1]],"c ʔ|h":[["e","ឆ្អេះ","cʔeh",1]],"c ʔ|v":[["a","ឆ្អៅ","cʔaw",1]],"c j|t":[["oː","ជ្យោត","cjoːt",1]],"c v|":[["ie","ជ្វា","cwie",1],["ie","ឈ្វា","cwie",1]],"c v|h":[["iː","ជ្វីស","cwiːh",1]],"c ŋ|p":[["u","ឈ្ងប់","cŋup",1]],"c n|":[["ie","ឈ្នា","cnie",1]],"c m|t":[["iə","ឈ្មៀត","cmiət",1]],"c l|c":[["u","ឈ្លច់","cluc",1],["ɨ","ឈ្លេច","clɨc",1]],"c l|p":[["ɔː","ឈ្លប","clɔːp",1],["u","ឈ្លប់","clup",1]],"c l|n":[["ɨə","ឈ្លឿន","clɨən",1]],"c v|t":[["ie","ឈ្វាត","cwiet",1]],"d j|n":[["ɑː","ដ្យន","ɗjɑːn",1]],"d j|p":[["ɑ","ដ្យប់","ɗjɑp",1]],"d j|h":[["o","ដ្យុស","ɗjoh",1]],"d j|t":[["oː","ដ្យូត","ɗjoːt",1]],"d r|p":[["ɑː","ដ្រប","ɗrɑːp",1],["ɑ","ដ្រប់","ɗrɑp",1]],"d r|j":[["ɑː","ដ្រយ","ɗrɑːj",1],["aː","ដ្រាយ","ɗraːj",1]],"d r|c":[["a","ដ្រាច់","ɗrac",1],["aː","ដ្រាជ","ɗraːc",1]],"d r|m":[["a","ដ្រាំ","ɗram",1],["iː","ដ្រីម","ɗriːm",1],["oː","ដ្រូម","ɗroːm",1],["eː","ដ្រេម","ɗreːm",1]],"d r|t":[["oː","ដ្រូដ","ɗroːt",1]],"d r|n":[["oː","ដ្រូន","ɗroːn",1]],"d r|v":[["ə","ដ្រូវ","ɗrəw",1],["uː","ឌ្រូវ","ɗruːw",1]],"d r|":[["eː","ដ្រេ","ɗreː",1],["iː","ឌ្រី","ɗriː",1],["uː","ឌ្រូ","ɗruː",1]],"d r|k":[["eː","ដ្រេក","ɗreːk",1],["eː","ឌ្រេក","ɗreːk",1]],"d r|h":[["eː","ដ្រេស","ɗreːh",1]],"d v|t":[["eː","ដ្វេត","ɗweːt",1]],"d v|n":[["eː","ដ្វេន","ɗweːn",1]],"d r|ŋ":[["iː","ឌ្រីង","ɗriːŋ",1]],"n h|j":[["aə","ណ្ហើយ","nhaəj",1]],"t b|k":[["ɑː","ត្បក","tɓɑːk",1]],"t b|c":[["aː","ត្បាច","tɓaːc",1]],"t b|ɲ":[["aː","ត្បាញ","tɓaːɲ",1]],"t b|ŋ":[["oː","ត្បូង","tɓoːŋ",1],["ae","ត្បែង","tɓaeŋ",1]],"t b|h":[["ae","ត្បែស","tɓaeh",1]],"t m|t":[["aː","ត្មាត","tmaːt",1],["a","ថ្មាត់","tmat",1]],"t m|l":[["ə","ត្មិល","tməl",1],["ao","ត្មោល","tmaol",1],["u","ធ្មល់","tmul",1]],"t m|h":[["e","ត្មិះ","tmeh",1],["a","ត្មះ","tmah",1]],"t j|l":[["oː","ត្យូល","tjoːl",1]],"t r|k":[["ɑ","ត្រក់","trɑk",1],["a","ត្រាក់","trak",1],["ə","ត្រិក","trək",1],["ə","ត្រឹក","trək",1],["o","ត្រុក","trok",1],["oː","ត្រូក","troːk",1],["aə","ត្រើក","traək",1],["iə","ត្រៀក","triək",1],["eː","ត្រេក","treːk",1],["ae","ត្រែក","traek",1],["ao","ត្រោក","traok",1],["uə","ទ្រក់","truək",1],["ie","ទ្រាក","triek",1],["uə","ទ្រួក","truək",1],["əː","ទ្រើក","trəːk",1],["ɨə","ទ្រឿក","trɨək",1],["iə","ទ្រៀក","triək",1]],"t r|l":[["ɑ","ត្រល់","trɑl",1],["aː","ត្រាល","traːl",1],["a","ត្រាល់","tral",1],["ə","ត្រិល","trəl",1],["o","ត្រុល","trol",1],["oː","ត្រូល","troːl",1],["iə","ត្រៀល","triəl",1],["eː","ត្រេល","treːl",1],["ae","ត្រែល","trael",1],["ie","ទ្រាល","triel",1],["u","ទ្រុល","trul",1],["iə","ទ្រៀល","triəl",1],["eː","ទ្រេល","treːl",1],["oː","ទ្រោល","troːl",1]],"t r|c":[["aː","ត្រាច","traːc",1],["a","ត្រាច់","trac",1],["ə","ត្រិច","trəc",1],["uə","ត្រួច","truəc",1]],"t r|ɲ":[["a","ត្រាញ់","traɲ",1],["ə","ត្រេញ","trəɲ",1],["ɨ","ទ្រិញ","trɨɲ",1]],"t r|n":[["aː","ត្រាណ","traːn",1],["aː","ត្រាន","traːn",1],["ə","ត្រឹន","trən",1],["o","ត្រុន","tron",1],["aə","ត្រើន","traən",1],["iə","ត្រៀន","triən",1],["eː","ត្រេន","treːn",1],["ie","ទ្រាន","trien",1],["oa","ទ្រាន់","troan",1],["ɨ","ទ្រិន","trɨn",1],["iː","ទ្រីន","triːn",1],["ɨə","ទ្រឿន","trɨən",1],["oː","ទ្រោណ","troːn",1]],"t r|ʔ":[["a","ត្រៈ","traʔ",1]],"t l|v":[["eː","ត្លេវ","tleːw",1],["aː","ថ្លាវ","tlaːw",1]],"t l|t":[["ae","ត្លែត","tlaet",1],["ao","ត្លោត","tlaot",1],["aː","ថ្លាត","tlaːt",1]],"t v|ŋ":[["aː","ត្វាង","twaːŋ",1],["aː","ថ្វាង","twaːŋ",1]],"t v|t":[["aː","ត្វាត","twaːt",1],["a","ថ្វាត់","twat",1],["iː","ទ្វីត","twiːt",1],["eː","ធ្វេត","tweːt",1]],"t v|n":[["eː","ត្វេន","tweːn",1],["ɑː","ថ្វន","twɑːn",1],["aː","ថ្វាន","twaːn",1],["iː","ថ្វីន","twiːn",1],["eː","ថ្វេន","tweːn",1],["iː","ទ្វីន","twiːn",1],["iː","ធ្វីន","twiːn",1],["eː","ធ្វេន","tweːn",1],["ɛː","ធ្វែន","twɛːn",1]],"t v|l":[["ae","ត្វែល","twael",1],["ɛː","ធ្វែល","twɛːl",1]],"t ʔ|ŋ":[["ə","ត្អឹង","tʔəŋ",1]],"t ʔ|ɲ":[["oː","ត្អូញ","tʔoːɲ",1]],"t ʔ|":[["uə","ត្អួ","tʔuə",1]],"t ʔ|h":[["aə","ត្អើស","tʔaəh",1]],"t ʔ|n":[["ao","ត្អោន","tʔaon",1]],"t k|l":[["ɑ","ថ្កល់","tkɑl",1],["o","ថ្កុល","tkol",1],["ao","ថ្កោល","tkaol",1],["oː","ថ្គោល","tkoːl",1]],"t k|t":[["a","ថ្កាត់","tkat",1]],"t k|h":[["aː","ថ្កាស","tkaːh",1]],"t k|p":[["ə","ថ្កិប","tkəp",1],["iə","ថ្កៀប","tkiəp",1]],"t k|v":[["ɨ","ថ្កូវ","tkɨw",1]],"t k|ŋ":[["aə","ថ្កើង","tkaəŋ",1],["ae","ថ្កែង","tkaeŋ",1]],"t ŋ|p":[["ɑː","ថ្ងប","tŋɑːp",1]],"t ŋ|ŋ":[["o","ថ្ងុង","tŋoŋ",1],["ie","ធ្ងាង","tŋieŋ",1],["əː","ធ្ងើង","tŋəːŋ",1],["oː","ធ្ងោង","tŋoːŋ",1]],"t ŋ|ɲ":[["o","ថ្ងុញ","tŋoɲ",1]],"t ŋ|v":[["ə","ថ្ងូវ","tŋəw",1]],"t ŋ|c":[["uə","ថ្ងួច","tŋuəc",1]],"t d|":[["ae","ថ្ដែ","tɗae",1]],"t d|k":[["ao","ថ្ដោក","tɗaok",1]],"t n|ŋ":[["ɑː","ថ្នង","tnɑːŋ",1],["ə","ថ្នឹង","tnəŋ",1],["u","ធ្នង់","tnuŋ",1]],"t n|ɲ":[["aː","ថ្នាញ","tnaːɲ",1],["ie","ធ្នាញ","tnieɲ",1]],"t n|h":[["aː","ថ្នាស","tnaːh",1],["a","ថ្នះ","tnah",1],["uə","ធ្នស់","tnuəh",1],["uː","ធ្នូស","tnuːh",1],["uə","ធ្នោះ","tnuəh",1],["ea","ធ្នះ","tneah",1]],"t p|ŋ":[["ɔː","ថ្ពង","tpɔːŋ",1],["u","ថ្ពង់","tpuŋ",1],["iː","ថ្ពីង","tpiːŋ",1]],"t p|n":[["ɨ","ថ្ពិន","tpɨn",1],["ɨ","ថ្ពឹន","tpɨn",1]],"t p|t":[["uː","ថ្ពូត","tpuːt",1]],"t p|c":[["ɨ","ថ្ពេច","tpɨc",1]],"t p|v":[["ɨ","ថ្ពៅ","tpɨw",1]],"t l|h":[["ɑ","ថ្លស់","tlɑh",1],["ao","ថ្លោស","tlaoh",1],["ɑ","ថ្លោះ","tlɑh",1],["u","ធ្លុះ","tluh",1],["ea","ធ្លះ","tleah",1]],"t l|n":[["a","ថ្លាន់","tlan",1],["ae","ថ្លែន","tlaen",1]],"t l|ɲ":[["o","ថ្លុញ","tloɲ",1],["u","ធ្លុញ","tluɲ",1],["uː","ធ្លូញ","tluːɲ",1]],"t v|h":[["ɑː","ថ្វស","twɑːh",1],["ə","ថ្វីស","twəh",1],["iː","ទ្វីស","twiːh",1],["ie","ធ្វាស","twieh",1],["eː","ធ្វេស","tweːh",1]],"t v|k":[["aː","ថ្វាក","twaːk",1]],"t v|j":[["aː","ថ្វាយ","twaːj",1],["ə","ថ្វី","twəj",1]],"t v|c":[["ə","ថ្វិច","twəc",1]],"t j|t":[["uː","ទ្យូត","tjuːt",1],["oː","ទ្យោត","tjoːt",1]],"t v|p":[["iː","ទ្វីប","twiːp",1]],"t ŋ|l":[["əː","ធ្ងើល","tŋəːl",1],["oː","ធ្ងោល","tŋoːl",1]],"t n|p":[["oa","ធ្នាប់","tnoap",1]],"t n|":[["uː","ធ្នូ","tnuː",1]],"t m|p":[["u","ធ្មប់","tmup",1]],"t m|c":[["ɨ","ធ្មេច","tmɨc",1]],"t m|v":[["ɨ","ធ្មៅ","tmɨw",1]],"t j|":[["ie","ធ្យា","tjie",1]],"t j|n":[["ie","ធ្យាន","tjien",1],["uː","ធ្យូន","tjuːn",1]],"t l|l":[["ɛː","ធ្លែល","tlɛːl",1]],"n r|j":[["ie","ន្រាយ","nriej",1]],"b r|c":[["iː","ប៊្រីជ","ɓriːc",1],["iː","ប្រីជ","ɓriːc",1],["iː","ប្រ៊ីជ","ɓriːc",1]],"b r|h":[["iː","ប៊្រីស","ɓriːh",1],["uː","ប៊្រូស","ɓruːh",1],["i","ប្រ៊ិស","ɓrih",1],["uː","ប្រ៊ូស","ɓruːh",1]],"b r|":[["uː","ប៊្រូ","ɓruː",1]],"b l|":[["uː","ប៊្លូ","ɓluː",1]],"b l|t":[["uː","ប៊្លូដ","ɓluːt",1],["eː","ប្លេដ","ɓleːt",1],["ae","ប្លែត","ɓlaet",1]],"b l|n":[["uː","ប៊្លូន","ɓluːn",1],["eː","ប្លេន","ɓleːn",1]],"b l|p":[["uː","ប៊្លូប","ɓluːp",1]],"b l|m":[["uː","ប៊្លូម","ɓluːm",1]],"b l|k":[["ɛː","ប៊្លែក","ɓlɛːk",1],["iː","ប្លីក","ɓliːk",1],["o","ប្លុក","ɓlok",1],["ɛː","ប្ល៊ែក","ɓlɛːk",1]],"b j|m":[["oː","ប្យូម","ɓjoːm",1]],"p r|c":[["ɑː","ប្រច","prɑːc",1],["a","ប្រាច់","prac",1],["aː","ប្រាជ","praːc",1],["ə","ប្រិច","prəc",1],["oː","ប្រូច","proːc",1],["iə","ប្រៀច","priəc",1],["ie","ព្រាច","priec",1],["ɨ","ព្រិច","prɨc",1],["u","ព្រុច","pruc",1],["uə","ព្រួច","pruəc",1],["iə","ព្រៀច","priəc",1],["ɨ","ព្រេច","prɨc",1]],"p r|l":[["aː","ប្រាល","praːl",1],["ə","ប្រិល","prəl",1],["uə","ប្រួល","pruəl",1],["ɔː","ព្រល","prɔːl",1],["ie","ព្រាល","priel",1],["ɨ","ព្រិល","prɨl",1],["ɨ","ព្រឹល","prɨl",1],["u","ព្រុល","prul",1],["uə","ព្រួល","pruəl",1],["əː","ព្រើល","prəːl",1],["ɛː","ព្រែល","prɛːl",1]],"p r|v":[["aː","ប្រាវ","praːw",1],["ie","ព្រាវ","priew",1],["ɨ","ព្រៅ","prɨw",1]],"p r|ɲ":[["ə","ប្រិញ","prəɲ",1],["o","ប្រុញ","proɲ",1],["uə","ប្រួញ","pruəɲ",1],["ao","ប្រោញ","praoɲ",1],["ɨ","ព្រិញ","prɨɲ",1],["uə","ព្រួញ","pruəɲ",1]],"p r|t":[["ə","ប្រិត","prət",1],["əː","ប្រឺដ","prəːt",1],["uə","ប្រួត","pruət",1],["eː","ប្រេដ","preːt",1],["ae","ប្រេត","praet",1],["ɔː","ព្រត","prɔːt",1],["ie","ព្រាត","priet",1],["oa","ព្រាត់","proat",1],["iː","ព្រីត","priːt",1],["u","ព្រុត","prut",1],["uː","ព្រូត","pruːt",1],["uə","ព្រួត","pruət",1],["əː","ព្រើត","prəːt",1]],"b r|m":[["eː","ប្រេម","ɓreːm",1],["aː","ប្រ៉ាម","ɓraːm",1]],"b r|t":[["ae","ប្រែដ","ɓraet",1],["iː","ប្រ៊ីដ","ɓriːt",1],["eː","ប្រ៊េដ","ɓreːt",1],["ɛː","ប្រ៊ែដ","ɓrɛːt",1]],"b r|k":[["iː","ប្រ៊ីគ","ɓriːk",1],["u","ប្រ៊ុក","ɓruk",1],["uː","ប្រ៊ូក","ɓruːk",1]],"b r|s":[["iː","ប្រ៊ីស","ɓriːs",1]],"p l|n":[["ɑ","ប្លន់","plɑn",1],["oː","ប្លូន","ploːn",1],["ae","ប្លែន","plaen",1],["aː","ផ្លាន","plaːn",1],["oː","ផ្លូន","ploːn",1],["eː","ផ្លេន","pleːn",1],["əː","ព្លើន","pləːn",1],["ɨə","ព្លឿន","plɨən",1],["ɔː","ភ្លន","plɔːn",1],["əː","ភ្លើន","pləːn",1],["eː","ភ្លេន","pleːn",1],["ɛː","ភ្លែន","plɛːn",1]],"p l|p":[["ɑ","ប្លប់","plɑp",1],["aː","ប្លាប","plaːp",1],["a","ប្លាប់","plap",1],["oː","ប្លូប","ploːp",1],["a","ផ្លាប់","plap",1],["ə","ផ្លឹប","pləp",1],["ɨ","ភ្លឹប","plɨp",1]],"p l|ɲ":[["aː","ប្លាញ","plaːɲ",1],["ao","ប្លោញ","plaoɲ",1],["aː","ផ្លាញ","plaːɲ",1],["ie","ភ្លាញ","plieɲ",1]],"p l|j":[["aː","ប្លាយ","plaːj",1],["oː","ប្លូយ","ploːj",1],["ɑː","ផ្លយ","plɑːj",1],["aː","ផ្លាយ","plaːj",1],["ɔː","ភ្លយ","plɔːj",1],["əː","ភ្លើយ","pləːj",1]],"b l|h":[["eː","ប្លេស","ɓleːh",1]],"b l|ŋ":[["ɛː","ប្ល៊ែង","ɓlɛːŋ",1]],"p k|j":[["aː","ផ្កាយ","pkaːj",1]],"p k|l":[["o","ផ្កុល","pkol",1],["o","ព្កុល","pkol",1]],"p k|ŋ":[["ɔː","ផ្គង","pkɔːŋ",1]],"p k|k":[["ea","ផ្គាក់","pkeak",1]],"p k|n":[["əː","ផ្គើន","pkəːn",1]],"p ŋ|k":[["ɑ","ផ្ងក់","pŋɑk",1],["aː","ផ្ងាក","pŋaːk",1],["aə","ផ្ងើក","pŋaək",1],["uə","ភ្ងក់","pŋuək",1]],"p ŋ|v":[["aː","ផ្ងាវ","pŋaːw",1]],"p ŋ|p":[["o","ផ្ងុប","pŋop",1],["u","ភ្ងប់","pŋup",1]],"p ŋ|t":[["oː","ផ្ងូត","pŋoːt",1],["uː","ភ្ងូត","pŋuːt",1]],"p ŋ|j":[["aə","ផ្ងើយ","pŋaəj",1],["əː","ភ្ងើយ","pŋəːj",1]],"p ŋ|m":[["ɑ","ផ្ងំ","pŋɑm",1],["u","ភ្ងំ","pŋum",1]],"p c|ŋ":[["ɑ","ផ្ចង់","pcɑŋ",1],["u","ភ្ជង់","pcuŋ",1]],"p c|c":[["a","ផ្ចាច់","pcac",1],["o","ផ្ចុច","pcoc",1]],"p c|ɲ":[["a","ផ្ចាញ់","pcaɲ",1],["əː","ភ្ជើញ","pcəːɲ",1]],"p c|l":[["aː","ផ្ចាល","pcaːl",1],["u","ភ្ជល់","pcul",1],["u","ភ្ជុល","pcul",1]],"p c|k":[["ə","ផ្ចឹក","pcək",1],["o","ផ្ចុក","pcok",1],["oː","ភ្ជោក","pcoːk",1]],"p ɲ|c":[["a","ផ្ញាច់","pɲac",1],["o","ផ្ញុច","pɲoc",1],["u","ភ្ញច់","pɲuc",1],["oː","ភ្ញោច","pɲoːc",1]],"p ɲ|ɲ":[["aː","ផ្ញាញ","pɲaːɲ",1],["ao","ផ្ញោញ","pɲaoɲ",1]],"p d|h":[["aː","ផ្ដាស","pɗaːh",1],["o","ផ្ដុស","pɗoh",1],["ɑ","ផ្ដោះ","pɗɑh",1]],"p d|t":[["ə","ផ្ដិត","pɗət",1],["əː","ផ្ដឺត","pɗəːt",1],["oː","ផ្ដូត","pɗoːt",1],["uə","ផ្ដួត","pɗuət",1],["eː","ផ្ដេត","pɗeːt",1],["ao","ផ្ដោត","pɗaot",1],["ə","ផ្តិត","pɗət",1]],"p d|":[["ae","ផ្ដែ","pɗae",1]],"p d|v":[["a","ផ្ដៅ","pɗaw",1]],"p t|k":[["ɑ","ផ្តក់","ptɑk",1],["aə","ផ្តើក","ptaək",1],["uə","ផ្ទក់","ptuək",1],["u","ផ្ទុក","ptuk",1]],"p t|t":[["ɑ","ផ្តត់","ptɑt",1],["eː","ផ្តេត","pteːt",1],["oa","ផ្ទាត់","ptoat",1],["ɨ","ផ្ទិត","ptɨt",1]],"p t|ɲ":[["u","ផ្ទញ់","ptuɲ",1]],"p t|n":[["u","ផ្ទន់","ptun",1],["oa","ផ្ទាន់","ptoan",1],["uə","ផ្ទួន","ptuən",1]],"p t|m":[["oa","ផ្ទាំ","ptoam",1],["ɨ","ផ្ទឹម","ptɨm",1],["u","ផ្ទុំ","ptum",1],["u","ផ្ទំ","ptum",1]],"p t|":[["iː","ផ្ទី","ptiː",1],["ɨː","ផ្ទឺ","ptɨː",1]],"p t|ŋ":[["iː","ផ្ទីង","ptiːŋ",1],["iə","ផ្ទៀង","ptiəŋ",1],["oː","ផ្ទោង","ptoːŋ",1]],"p n|ŋ":[["ɑː","ផ្នង","pnɑːŋ",1],["ɑ","ផ្នង់","pnɑŋ",1],["uə","ផ្នួង","pnuəŋ",1],["iə","ផ្នៀង","pniəŋ",1],["ɔː","ព្នង","pnɔːŋ",1]],"p n|t":[["ɑ","ផ្នត់","pnɑt",1],["oː","ផ្នូត","pnoːt",1],["uə","ផ្នួត","pnuət",1],["iə","ព្នៀត","pniət",1],["ie","ភ្នាត","pniet",1],["iə","ភ្នៀត","pniət",1]],"p n|h":[["uə","ផ្នួស","pnuəh",1],["ɑ","ផ្នោះ","pnɑh",1],["ie","ភ្នាស","pnieh",1]],"p j|ŋ":[["aː","ផ្យ៉ាង","pjaːŋ",1]],"p s|":[["aː","ផ្សា","psaː",1],["ao","ផ្សោ","psao",1]],"p s|k":[["ə","ផ្សឹក","psək",1]],"p s|h":[["ɑ","ផ្សោះ","psɑh",1],["a","ផ្សះ","psah",1]],"p ʔ|p":[["ɑː","ផ្អប","pʔɑːp",1],["a","ផ្អាប់","pʔap",1],["ə","ផ្អិប","pʔəp",1],["ə","ផ្អឹប","pʔəp",1],["ae","ផ្អែប","pʔaep",1],["ao","ផ្អោប","pʔaop",1]],"p ʔ|h":[["ɑ","ផ្អស់","pʔɑh",1],["ə","ផ្អឹះ","pʔəh",1],["uə","ផ្អួស","pʔuəh",1],["aə","ផ្អើះ","pʔaəh",1],["e","ផ្អេះ","pʔeh",1],["ɑ","ផ្អោះ","pʔɑh",1],["ɨ","ព្អឹះ","pʔɨh",1]],"p ʔ|v":[["aː","ផ្អាវ","pʔaːw",1]],"p ʔ|c":[["o","ផ្អុច","pʔoc",1],["oː","ផ្អូច","pʔoːc",1],["iə","ផ្អៀច","pʔiəc",1]],"p ʔ|l":[["aə","ផ្អើល","pʔaəl",1]],"p n|j":[["ie","ព្នាយ","pniej",1],["e","ព្នៃ","pnej",1]],"p n|v":[["ɨ","ព្នៅ","pnɨw",1],["ɨ","ភ្នៅ","pnɨw",1]],"p j|t":[["ie","ព្យាដ","pjiet",1]],"p j|m":[["ie","ព្យាម","pjiem",1],["oː","ព្យោម","pjoːm",1]],"p j|h":[["ie","ព្យាស","pjieh",1],["u","ព្យុះ","pjuh",1]],"p j|l":[["uː","ព្យូល","pjuːl",1],["əː","ព្យើល","pjəːl",1]],"p j|n":[["əː","ព្យើន","pjəːn",1]],"p j|":[["ɛː","ព្យែ","pjɛː",1],["uː","ភ្យូ","pjuː",1]],"p ŋ|":[["ie","ភ្ងា","pŋie",1]],"p ŋ|h":[["ie","ភ្ងាស","pŋieh",1],["oa","ភ្ងាស់","pŋoah",1]],"p c|v":[["ie","ភ្ជាវ","pciew",1]],"p c|m":[["oa","ភ្ជាំ","pcoam",1],["u","ភ្ជុំ","pcum",1]],"p ɲ|l":[["u","ភ្ញល់","pɲul",1]],"p ɲ|h":[["oa","ភ្ញាស់","pɲoah",1]],"p n|n":[["ie","ភ្នាន","pnien",1],["əː","ភ្នើន","pnəːn",1],["eː","ភ្នេន","pneːn",1],["ɛː","ភ្នែន","pnɛːn",1]],"p m|h":[["ie","ភ្មាស","pmieh",1]],"p l|l":[["ɛː","ភ្លែល","plɛːl",1]],"m ɲ|p":[["oː","ម៉្ញូប","mɲoːp",1]],"m k|k":[["a","ម្កាក់","mkak",1]],"m k|l":[["aː","ម្កាល","mkaːl",1]],"m k|t":[["o","ម្កុដ","mkot",1]],"m kʰ|h":[["ɑ","ម្ខោះ","mkʰɑh",1]],"m ŋ|j":[["a","ម្ង៉ៃ","mŋaj",1]],"m c|t":[["ɑ","ម្ចត់","mcɑt",1]],"m c|k":[["a","ម្ចាក់","mcak",1],["oː","ម្ចូក","mcoːk",1]],"m c|n":[["aː","ម្ចាន","mcaːn",1]],"m c|p":[["o","ម្ចុប","mcop",1]],"m ɲ|k":[["ɛː","ម្ញែក","mɲɛːk",1]],"m d|c":[["ə","ម្ដេច","mɗəc",1]],"m d|ɲ":[["ɨ","ម្ដេញ","mɗɨɲ",1]],"m n|":[["ie","ម្នា","mnie",1],["iː","ម្នី","mniː",1]],"m n|ŋ":[["ie","ម្នាង","mnieŋ",1]],"m n|l":[["ie","ម្នាល","mniel",1],["ɨ","ម្និល","mnɨl",1]],"m n|v":[["ie","ម្នាវ","mniew",1],["ɨ","ម្នៅ","mnɨw",1]],"m n|ɲ":[["ɨ","ម្នេញ","mnɨɲ",1]],"m j|m":[["ie","ម្យាម","mjiem",1]],"m j|p":[["uː","ម្យូប","mjuːp",1]],"m r|j":[["ɔː","ម្រយ","mrɔːj",1],["aː","ម្រ៉ាយ","mraːj",1]],"m r|k":[["ie","ម្រាក","mriek",1],["ea","ម្រាក់","mreak",1],["iː","ម្រីក","mriːk",1],["ɨ","ម្រឹក","mrɨk",1],["ɨ","ម្រឹគ","mrɨk",1]],"m r|n":[["oa","ម្រាន់","mroan",1]],"m r|ɲ":[["ɨ","ម្រិញ","mrɨɲ",1],["ɨ","ម្រេញ","mrɨɲ",1]],"m r|c":[["ɨ","ម្រេច","mrɨc",1]],"m r|ŋ":[["ɛː","ម្រែង","mrɛːŋ",1]],"m r|h":[["ea","ម្រះ","mreah",1]],"m l|t":[["ɔː","ម្លត","mlɔːt",1]],"m l|":[["uː","ម្លូ","mluː",1]],"m l|ŋ":[["ə","ម្ល៉ឹង","mləŋ",1]],"m s|ɲ":[["a","ម្សាញ់","msaɲ",1]],"m s|l":[["ə","ម្សិល","msəl",1]],"m s|t":[["iə","ម្សៀត","msiət",1]],"m h|t":[["eː","ម្ហេត","mheːt",1]],"m h|h":[["e","ម្ហេះ","mheh",1],["i","ម្ហ៊ិះ","mhih",1]],"m ʔ|m":[["ɑː","ម្អម","mʔɑːm",1]],"r h|t":[["oː","រ្ហូត","rhoːt",1]],"l k|k":[["ɑ","ល្កក់","lkɑk",1],["ɨ","ល្គឹក","lkɨk",1]],"l k|m":[["ɑː","ល្កម","lkɑːm",1]],"l kʰ|n":[["ao","ល្ខោន","lkʰaon",1]],"l k|ŋ":[["ɔː","ល្គង","lkɔːŋ",1]],"l k|j":[["ie","ល្គាយ","lkiej",1]],"l k|n":[["eː","ល្គេន","lkeːn",1]],"l ŋ|":[["ɔː","ល្ង","lŋɔː",1],["əː","ល្ងើ","lŋəː",1]],"l ŋ|ŋ":[["u","ល្ងង់","lŋuŋ",1],["iə","ល្ងៀង","lŋiəŋ",1]],"l ŋ|n":[["oa","ល្ងាន់","lŋoan",1],["əː","ល្ងើន","lŋəːn",1]],"l ŋ|m":[["iə","ល្ងៀម","lŋiəm",1]],"l b|k":[["ɑː","ល្បក","lɓɑːk",1],["ɑ","ល្បក់","lɓɑk",1],["a","ល្បាក់","lɓak",1],["aə","ល្បើក","lɓaək",1]],"l b|t":[["ɑ","ល្បត់","lɓɑt",1],["aː","ល្បាត","lɓaːt",1],["ao","ល្បោត","lɓaot",1]],"l b|h":[["a","ល្បាស់","lɓah",1],["ɑ","ល្បោះ","lɓɑh",1],["a","ល្បះ","lɓah",1]],"l b|c":[["ə","ល្បិច","lɓəc",1]],"l b|":[["əː","ល្បឺ","lɓəː",1]],"l p|k":[["ie","ល្ពាក","lpiek",1]],"l p|c":[["ie","ល្ពាច","lpiec",1]],"l p|v":[["ɨ","ល្ពៅ","lpɨw",1]],"l m|k":[["ea","ល្មាក់","lmeak",1]],"l m|h":[["ie","ល្មាស","lmieh",1],["əː","ល្មើស","lməːh",1],["e","ល្មេះ","lmeh",1]],"l m|c":[["ɨ","ល្មិច","lmɨc",1],["uə","ល្មួច","lmuəc",1],["ɨ","ល្មេច","lmɨc",1]],"l m|ŋ":[["u","ល្មុង","lmuŋ",1],["ɨə","ល្មឿង","lmɨəŋ",1]],"l m|n":[["uː","ល្មូន","lmuːn",1]],"l m|j":[["ɨə","ល្មឿយ","lmɨəj",1],["e","ល្មៃ","lmej",1]],"l m|p":[["oː","ល្មោភ","lmoːp",1]],"l m|":[["aə","ល្ម៉ើ","lmaə",1]],"l j|h":[["ɛː","ល្យែស","ljɛːh",1]],"l j|m":[["u","ល្យំ","ljum",1]],"l v|":[["ɔː","ល្វ","lwɔː",1],["ie","ល្វា","lwie",1],["iː","ល្វី","lwiː",1],["eː","ល្វេ","lweː",1],["oː","ល្វោ","lwoː",1]],"l v|k":[["uə","ល្វក់","lwuək",1],["iː","ល្វីក","lwiːk",1]],"l v|t":[["ɔː","ល្វត","lwɔːt",1],["ɛː","ល្វែត","lwɛːt",1]],"l v|n":[["u","ល្វន់","lwun",1]],"l v|h":[["ie","ល្វាស","lwieh",1],["iː","ល្វីស","lwiːh",1]],"l v|s":[["iː","ល្វីស៍","lwiːs",1]],"l v|j":[["əː","ល្វើយ","lwəːj",1],["e","ល្វៃ","lwej",1]],"l h|":[["ɑː","ល្ហ","lhɑː",1],["ae","ល្ហែ","lhae",1]],"l h|k":[["ɑ","ល្ហក់","lhɑk",1]],"l h|c":[["aː","ល្ហាច","lhaːc",1]],"l h|l":[["aː","ល្ហាល","lhaːl",1],["ao","ល្ហោល","lhaol",1]],"l h|m":[["ə","ល្ហឹម","lhəm",1],["ae","ល្ហែម","lhaem",1]],"l h|t":[["oː","ល្ហូត","lhoːt",1],["uə","ល្ហួត","lhuət",1]],"l h|j":[["aə","ល្ហើយ","lhaəj",1]],"l h|v":[["eː","ល្ហេវ","lheːw",1]],"l h|h":[["ao","ល្ហោស","lhaoh",1]],"l ʔ|k":[["ɑ","ល្អក់","lʔɑk",1],["oː","ល្អូក","lʔoːk",1],["iə","ល្អៀក","lʔiək",1]],"l ʔ|ŋ":[["ɑː","ល្អង","lʔɑːŋ",1],["aː","ល្អាង","lʔaːŋ",1],["iə","ល្អៀង","lʔiəŋ",1]],"l ʔ|n":[["ɑ","ល្អន់","lʔɑn",1],["aː","ល្អាន","lʔaːn",1],["ə","ល្អិន","lʔən",1],["əː","ល្អឺន","lʔəːn",1]],"l ʔ|c":[["a","ល្អាច់","lʔac",1],["iə","ល្អៀច","lʔiəc",1],["ao","ល្អោច","lʔaoc",1]],"l ʔ|t":[["aː","ល្អាត","lʔaːt",1],["ə","ល្អិត","lʔət",1],["oː","ល្អូត","lʔoːt",1],["uə","ល្អួត","lʔuət",1],["iə","ល្អៀត","lʔiət",1]],"l ʔ|j":[["ə","ល្អី","lʔəj",1],["ɨə","ល្អឿយ","lʔɨəj",1]],"l ʔ|ɲ":[["ao","ល្អោញ","lʔaoɲ",1]],"l ʔ|m":[["ao","ល្អោម","lʔaom",1]],"l ʔ|h":[["a","ល្អះ","lʔah",1]],"v j|n":[["ae","វ៉្យែន","wjaen",1],["ɛː","វ្យែន","wjɛːn",1]],"v j|t":[["ie","វ្យាឌ","wjiet",1],["ɛː","វ្យែត","wjɛːt",1]],"v j|m":[["ie","វ្យាម","wjiem",1]],"v j|l":[["ie","វ្យាល","wjiel",1]],"v r|t":[["ie","វ្រាត","wriet",1]],"v l|ŋ":[["əː","វ្លើង","wləːŋ",1]],"v h|j":[["aə","វ្ហើយ","whaəj",1]],"s m|t":[["iː","ស៊្មីត","smiːt",1],["ɑː","ស្មត","smɑːt",1],["aː","ស្មាត","smaːt",1],["ə","ស្មិត","smət",1],["iː","ស្មីត","smiːt",1],["oː","ស្មូត","smoːt",1],["ae","ស្មែត","smaet",1],["iː","ស្ម៊ីត","smiːt",1]],"s r|n":[["ɔː","ស៊្រន","srɔːn",1],["u","ស៊្រន់","srun",1],["oa","ស៊្រាន់","sroan",1],["u","ស៊្រុន","srun",1],["eː","ស៊្រេន","sreːn",1],["ɑ","ស្រន់","srɑn",1],["ə","ស្រិន","srən",1],["iː","ស្រីន","sriːn",1],["o","ស្រុន","sron",1],["uə","ស្រួន","sruən",1],["ɨə","ស្រឿន","srɨən",1],["iə","ស្រៀន","sriən",1],["eː","ស្រេន","sreːn",1],["ae","ស្រែន","sraen",1],["ɔː","ស្រ៊ន","srɔːn",1],["u","ស្រ៊ន់","srun",1],["ie","ស្រ៊ាន","srien",1],["oa","ស្រ៊ាន់","sroan",1],["ɨ","ស្រ៊ិន","srɨn",1],["iː","ស្រ៊ីន","sriːn",1],["u","ស្រ៊ុន","srun",1]],"s v|h":[["iː","ស៊្វីស","swiːh",1],["aː","ស្វាស","swaːh",1],["iː","ស្វីស","swiːh",1],["iː","ស្វ៊ីស","swiːh",1]],"s v|":[["ɛː","ស៊្វែ","swɛː",1],["aː","ស្វា","swaː",1],["eː","ស្វេ","sweː",1],["iː","ស្វ៊ី","swiː",1]],"s v|p":[["ɛː","ស៊្វែប","swɛːp",1],["aː","ស្វាប","swaːp",1]],"s k|k":[["ɑː","ស្កក","skɑːk",1],["aː","ស្កាក","skaːk",1],["aə","ស្កើក","skaək",1],["oː","ស្គោក","skoːk",1]],"s k|":[["aː","ស្កា","skaː",1],["ie","ស្គា","skie",1],["iː","ស្គី","skiː",1]],"s k|ɲ":[["aː","ស្កាញ","skaːɲ",1],["oː","ស្កូញ","skoːɲ",1]],"s k|j":[["aː","ស្កាយ","skaːj",1],["aː","ស្កាយ៍","skaːj",1],["o","ស្កុយ","skoj",1],["uə","ស្កួយ","skuəj",1],["u","ស្គុយ","skuj",1],["uə","ស្គួយ","skuəj",1]],"s k|m":[["a","ស្កាំ","skam",1],["ɔː","ស្គម","skɔːm",1]],"s k|ŋ":[["o","ស្កុង","skoŋ",1]],"s k|h":[["a","ស្កះ","skah",1],["ɨ","ស្គឹះ","skɨh",1],["u","ស្គុស","skuh",1],["u","ស្គុះ","skuh",1]],"s k r|p":[["iː","ស្គ្រីប","skriːp",1],["iː","ស្គ្រីព","skriːp",1]],"s ŋ|c":[["aː","ស្ងាច","sŋaːc",1],["aə","ស្ងើច","sŋaəc",1]],"s ŋ|ɲ":[["aː","ស្ងាញ","sŋaːɲ",1]],"s ŋ|n":[["uə","ស្ងួន","sŋuən",1],["aə","ស្ងើន","sŋaən",1]],"s ŋ|k":[["aə","ស្ងើក","sŋaək",1]],"s ŋ|j":[["aə","ស្ងើយ","sŋaəj",1]],"s ŋ|":[["ae","ស្ងែ","sŋae",1]],"s ɲ|k":[["ɑ","ស្ញក់","sɲɑk",1],["o","ស្ញុក","sɲok",1],["aə","ស្ញើក","sɲaək",1]],"s ɲ|p":[["ɑ","ស្ញប់","sɲɑp",1],["aə","ស្ញើប","sɲaəp",1]],"s ɲ|j":[["ɑː","ស្ញយ","sɲɑːj",1]],"s ɲ|ɲ":[["aː","ស្ញាញ","sɲaːɲ",1],["ə","ស្ញិញ","sɲəɲ",1],["oː","ស្ញូញ","sɲoːɲ",1],["ə","ស្ញេញ","sɲəɲ",1]],"s ɲ|l":[["o","ស្ញុរ","sɲol",1],["o","ស្ញុល","sɲol",1]],"s ɲ|c":[["aə","ស្ញើច","sɲaəc",1]],"s ɲ|":[["ae","ស្ញែ","sɲae",1]],"s ɲ|ŋ":[["ae","ស្ញែង","sɲaeŋ",1]],"s d|":[["ɑː","ស្ដ","sɗɑː",1]],"s d|n":[["ɑ","ស្ដន","sɗɑn",1],["oː","ស្ដូន","sɗoːn",1],["iə","ស្ដៀន","sɗiən",1]],"s d|t":[["əː","ស្ដឺត","sɗəːt",1],["eː","ស្ដេត","sɗeːt",1]],"s d|l":[["o","ស្ដុល","sɗol",1]],"s d|c":[["uə","ស្ដួច","sɗuəc",1],["a","ស្ដេច","sɗac",1]],"s d|h":[["ɑ","ស្ដោះ","sɗɑh",1]],"s d|v":[["a","ស្ដៅ","sɗaw",1]],"s t|t":[["ɑː","ស្តត","stɑːt",1],["aː","ស្តាត","staːt",1],["uə","ស្តួត","stuət",1],["eː","ស្តេត","steːt",1],["ae","ស្តែត","staet",1],["oa","ស្ទាត់","stoat",1],["əː","ស្ទើត","stəːt",1],["eː","ស្ទេដ","steːt",1],["eː","ស្ទេត","steːt",1],["ɛː","ស្ទែត","stɛːt",1]],"s t|m":[["ɑː","ស្តម","stɑːm",1],["iː","ស្ទីម","stiːm",1],["u","ស្ទំ","stum",1]],"s t|":[["aː","ស្តា","staː",1],["eː","ស្តេ","steː",1],["ao","ស្តោ","stao",1],["ie","ស្ទា","stie",1],["ɛː","ស្ទែ","stɛː",1]],"s t|k":[["ə","ស្តឹក","stək",1],["eː","ស្តេក","steːk",1],["ao","ស្តោក","staok",1],["uə","ស្ទក់","stuək",1],["ea","ស្ទាក់","steak",1],["iː","ស្ទីក","stiːk",1],["ɨ","ស្ទឹក","stɨk",1],["uə","ស្ទួក","stuək",1],["eː","ស្ទេក","steːk",1],["oː","ស្ទោក","stoːk",1]],"s t|l":[["o","ស្តុល","stol",1],["oː","ស្តូល","stoːl",1],["ɔː","ស្ទល","stɔːl",1],["u","ស្ទល់","stul",1],["ie","ស្ទាល","stiel",1],["iː","ស្ទីល","stiːl",1],["iː","ស្ទីល៍","stiːl",1],["ɨ","ស្ទឹល","stɨl",1],["u","ស្ទុល","stul",1],["iə","ស្ទៀល","stiəl",1],["ɛː","ស្ទែល","stɛːl",1]],"s t|n":[["oː","ស្តូន","stoːn",1],["eː","ស្តេន","steːn",1],["u","ស្ទន់","stun",1],["iː","ស្ទីន","stiːn",1],["ɨː","ស្ទឺន","stɨːn",1],["uː","ស្ទូន","stuːn",1],["uə","ស្ទួន","stuən",1],["iə","ស្ទៀន","stiən",1],["ɛː","ស្ទែន","stɛːn",1]],"s t|v":[["eː","ស្តេវ","steːw",1],["ie","ស្ទាវ","stiew",1],["iː","ស្ទីវ","stiːw",1],["iə","ស្ទៀវ","stiəw",1],["eː","ស្ទេវ","steːw",1]],"s t r|ŋ":[["ɑː","ស្ត្រង","strɑːŋ",1]],"s t r|k":[["aː","ស្ត្រាក","straːk",1],["oː","ស្ត្រូក","stroːk",1],["uː","ស្ទ្រូក","struːk",1]],"s t r|h":[["aː","ស្ត្រាស","straːh",1],["oː","ស្ត្រូស","stroːh",1],["eː","ស្ត្រេស","streːh",1]],"s t r|p":[["ə","ស្ត្រីប","strəp",1]],"s t r|t":[["eː","ស្ត្រេត","streːt",1],["iː","ស្ទ្រីត","striːt",1]],"s tʰ|n":[["aː","ស្ថាន","stʰaːn",1]],"s t|ɲ":[["ie","ស្ទាញ","stieɲ",1],["əː","ស្ទើញ","stəːɲ",1],["ɨ","ស្ទេញ","stɨɲ",1]],"s t|c":[["uː","ស្ទូច","stuːc",1],["əː","ស្ទើជ","stəːc",1]],"s t r|m":[["iː","ស្ទ្រីម","striːm",1]],"s n|p":[["ɑː","ស្នប","snɑːp",1],["ɑ","ស្នប់","snɑp",1],["aː","ស្នាប","snaːp",1],["a","ស្នាប់","snap",1],["oː","ស្នូប","snoːp",1],["ae","ស្នែប","snaep",1]],"s n|l":[["ɑː","ស្នល","snɑːl",1],["aː","ស្នាល","snaːl",1],["oː","ស្នូល","snoːl",1],["uə","ស្នួល","snuəl",1]],"s n|c":[["aː","ស្នាច","snaːc",1],["iː","ស្នីជ","sniːc",1]],"s n|n":[["aː","ស្នាន","snaːn",1]],"s n|j":[["aː","ស្នាយ","snaːj",1]],"s b|t":[["ɑ","ស្បថ","sɓɑt",1],["ə","ស្បិត","sɓət",1],["əː","ស្បឺត","sɓəːt",1],["iə","ស្បៀត","sɓiət",1],["eː","ស្បេត","sɓeːt",1]],"s b|n":[["ɑː","ស្បន","sɓɑːn",1],["a","ស្បាន់","sɓan",1],["oː","ស្បូន","sɓoːn",1]],"s b|ʔ":[["o","ស្បុរ","sɓoʔ",1]],"s b|l":[["o","ស្បុល","sɓol",1],["ae","ស្បែល","sɓael",1]],"s b|v":[["ə","ស្បូវ","sɓəw",1]],"s b|m":[["aə","ស្បើម","sɓaəm",1]],"s b|p":[["ae","ស្បែប","sɓaep",1]],"s p|":[["ɑː","ស្ប៉","spɑː",1],["aː","ស្ប៉ា","spaː",1],["ɨː","ស្ពឺ","spɨː",1],["iə","ស្ពៀ","spiə",1]],"s p|t":[["ɑː","ស្ប៉ត","spɑːt",1],["eː","ស្ប៉េដ","speːt",1],["ae","ស្ប៉ែត","spaet",1],["ɔː","ស្ពត","spɔːt",1],["iː","ស្ពីដ","spiːt",1],["iː","ស្ពីត","spiːt",1],["iə","ស្ពៀត","spiət",1],["eː","ស្ពេដ","speːt",1],["ɛː","ស្ពែត","spɛːt",1],["oː","ស្ពោត","spoːt",1]],"s p|k":[["aː","ស្ប៉ាក","spaːk",1],["ɔː","ស្ពក","spɔːk",1],["i","ស្ពិក","spik",1],["ɨ","ស្ពឹក","spɨk",1]],"s p|p":[["aː","ស្ប៉ាប","spaːp",1]],"s p|c":[["e","ស្ប៉ិច","spec",1],["u","ស្ពុច","spuc",1]],"s p|m":[["ə","ស្ប៉ឹម","spəm",1],["ɛː","ស្ពែម","spɛːm",1]],"s p|l":[["o","ស្ប៉ុរ","spol",1],["o","ស្ប៉ុល","spol",1],["u","ស្ពុរ","spul",1],["u","ស្ពុល","spul",1]],"s p|h":[["eː","ស្ប៉េស","speːh",1],["eː","ស្ពេស","speːh",1],["e","ស្ពេះ","speh",1],["ɛ","ស្ពែះ","spɛh",1]],"s p|ŋ":[["u","ស្ពង់","spuŋ",1],["iː","ស្ពីង","spiːŋ",1],["ɨ","ស្ពឹង","spɨŋ",1],["u","ស្ពុង","spuŋ",1],["eː","ស្ពេង","speːŋ",1]],"s p|n":[["ɔː","ស្ពន","spɔːn",1],["ie","ស្ពាន","spien",1],["oa","ស្ពាន់","spoan",1],["iː","ស្ពីន","spiːn",1],["uː","ស្ពូន","spuːn",1],["aə","ស្ពើន","spaən",1]],"s p|v":[["ɨ","ស្ពៅ","spɨw",1]],"s p r|":[["iː","ស្ព្រី","spriː",1],["eː","ស្ព្រេ","spreː",1]],"s p r|ŋ":[["iː","ស្ព្រីង","spriːŋ",1]],"s p r|n":[["iː","ស្ព្រីន","spriːn",1]],"s m|ŋ":[["ɑː","ស្មង","smɑːŋ",1],["ə","ស្មិង","sməŋ",1],["ə","ស្មឹង","sməŋ",1],["ae","ស្មែង","smaeŋ",1],["ao","ស្មោង","smaoŋ",1]],"s m|j":[["ɑː","ស្មយ","smɑːj",1],["aː","ស្មាយ","smaːj",1],["o","ស្មុយ","smoj",1]],"s m|l":[["ɑː","ស្មល","smɑːl",1],["aː","ស្មាល","smaːl",1],["ə","ស្មិល","sməl",1],["ə","ស្មីល","sməl",1],["iː","ស្ម៊ីល","smiːl",1]],"s m|c":[["a","ស្មាច់","smac",1]],"s m|ɲ":[["aː","ស្មាញ","smaːɲ",1],["ə","ស្មិញ","sməɲ",1],["oː","ស្មូញ","smoːɲ",1],["ə","ស្មេញ","sməɲ",1],["ao","ស្មោញ","smaoɲ",1]],"s m|p":[["ə","ស្មិប","sməp",1],["ə","ស្មឹប","sməp",1],["əː","ស្មឺប","sməːp",1]],"s m|m":[["ə","ស្មឹម","sməm",1],["o","ស្មុំ","smom",1],["oː","ស្មូម","smoːm",1],["ao","ស្មោម","smaom",1]],"s j|ŋ":[["ɑ","ស្យង់","sjɑŋ",1]],"s j|":[["aː","ស្យា","sjaː",1]],"s j|m":[["aː","ស្យាម","sjaːm",1]],"s j|l":[["a","ស្យាល់","sjal",1],["o","ស្យុល","sjol",1]],"s r|ɲ":[["aː","ស្រាញ","sraːɲ",1],["o","ស្រុញ","sroɲ",1]],"s l|ŋ":[["ɑ","ស្លង់","slɑŋ",1],["iː","ស្លីង","sliːŋ",1],["ə","ស្លឹង","sləŋ",1],["o","ស្លុង","sloŋ",1],["ae","ស្លែង","slaeŋ",1]],"s l|t":[["ɑː","ស្លត","slɑːt",1],["ɑ","ស្លត់","slɑt",1],["aː","ស្លាត","slaːt",1],["iː","ស្លីត","sliːt",1],["əː","ស្លឺត","sləːt",1],["o","ស្លុត","slot",1],["oː","ស្លូត","sloːt",1],["aə","ស្លើត","slaət",1],["ae","ស្លែត","slaet",1]],"s l|n":[["ɑ","ស្លន់","slɑn",1]],"s l|j":[["aː","ស្លាយ","slaːj",1],["o","ស្លុយ","sloj",1]],"s l|v":[["aː","ស្លាវ","slaːw",1],["eː","ស្លេវ","sleːw",1],["ae","ស្លែវ","slaew",1],["a","ស្លៅ","slaw",1]],"s l|h":[["aː","ស្លាស","slaːh",1],["o","ស្លុះ","sloh",1],["e","ស្លេះ","sleh",1]],"s l|m":[["iː","ស្លីម","sliːm",1],["ao","ស្លោម","slaom",1]],"s l|ɲ":[["oː","ស្លូញ","sloːɲ",1]],"s v|n":[["ɑː","ស្វន","swɑːn",1],["aː","ស្វាន","swaːn",1],["ə","ស្វិន","swən",1],["eː","ស្វេន","sweːn",1],["ae","ស្វែន","swaen",1]],"s v|l":[["ae","ស្វែល","swael",1]],"s v|m":[["iː","ស្វ៊ីម","swiːm",1]],"s ʔ|p":[["ɑ","ស្អប់","sʔɑp",1],["a","ស្អាប់","sʔap",1]],"s ʔ|":[["aː","ស្អា","sʔaː",1]],"s ʔ|ŋ":[["aː","ស្អាង","sʔaːŋ",1],["o","ស្អុង","sʔoŋ",1]],"s ʔ|n":[["aː","ស្អាន","sʔaːn",1]],"s ʔ|c":[["oː","ស្អូច","sʔoːc",1],["iə","ស្អៀច","sʔiəc",1]],"s ʔ|m":[["ae","ស្អែម","sʔaem",1],["ɑ","ស្អំ","sʔɑm",1]],"s ʔ|l":[["ae","ស្អែល","sʔael",1],["ɛː","ស្អ៊ែល","sʔɛːl",1]],"h n|":[["aː","ហ្នា៎","hnaː",1]],"h n|j":[["aə","ហ្នើយ","hnaəj",1]],"h m|k":[["ɑː","ហ្មក","hmɑːk",1],["o","ហ្មុក","hmok",1]],"h j|ŋ":[["ɑ","ហ្យង់","hjɑŋ",1]],"h j|t":[["aː","ហ្យាត","hjaːt",1]],"h j|m":[["aː","ហ្យាម","hjaːm",1]],"h j|":[["uː","ហ្យ៊ូ","hjuː",1]],"h j|c":[["uː","ហ្យ៊ូជ","hjuːc",1]],"h r|ŋ":[["ɑ","ហ្រង់","hrɑŋ",1]],"h l|k":[["a","ហ្លាក់","hlak",1]],"h l|m":[["aː","ហ្លាម","hlaːm",1]],"h l|j":[["aː","ហ្លាយ","hlaːj",1]],"f l|h":[["aː","ហ្លាស","flaːh",1],["a","ហ្លាស់","flah",1]],"h l|c":[["ə","ហ្លិច","hləc",1]],"f l|t":[["iː","ហ្លីត","fliːt",1]],"h l|h":[["ae","ហ្លែស","hlaeh",1]],"h l|l":[["ao","ហ្លោល","hlaol",1]],"f v|ŋ":[["ɨə","ហ្វឿង","fwɨəŋ",1]],"h ʔ|k":[["ɑː","ហ្អក","hʔɑːk",1]],"h ʔ|":[["aː","ហ្អា៎","hʔaː",1],["əː","ហ្អឺ","hʔəː",1]],"h ʔ|h":[["e","ហ្អេះ","hʔeh",1]],"h ʔ|ŋ":[["ae","ហ្អែង","hʔaeŋ",1]],"ʔ h|h":[["ɨ","អ៊្ហឹះ","ʔhɨh",1],["aː","អ្ហាះ","ʔhaːh",1],["o","អ្ហុះ","ʔhoh",1],["oː","អ្ហូះ","ʔhoːh",1],["e","អ្ហេះ","ʔheh",1],["ɑ","អ្ហោះ","ʔhɑh",1],["a","អ្ហះ","ʔhah",1],["ɨ","អ្ហ៊ឹះ","ʔhɨh",1],["ɨː","អ្ហ៊ឺះ","ʔhɨːh",1],["ea","អ្ហ៊ះ","ʔheah",1]],"ʔ h|j":[["e","អ៊្ហៃ","ʔhej",1],["ə","អ្ហី","ʔhəj",1],["əː","អ្ហឺយ","ʔhəːj",1],["e","អ្ហ៊ៃ","ʔhej",1]],"ʔ ŋ|ŋ":[["ae","អ្ងែង","ʔŋaeŋ",1]],"ʔ h|":[["ɑː","អ្ហ","ʔhɑː",1],["aː","អ្ហា","ʔhaː",1],["aː","អ្ហា៎","ʔhaː",1],["əː","អ្ហឺ","ʔhəː",1],["oː","អ្ហូ","ʔhoː",1],["oː","អ្ហូ៎","ʔhoː",1],["eː","អ្ហេ","ʔheː",1],["ao","អ្ហោ","ʔhao",1],["ao","អ្ហោ៎","ʔhao",1],["ɔː","អ្ហ៊","ʔhɔː",1],["ɨː","អ្ហ៊ឺ","ʔhɨː",1],["ɑː","អ្ហ៎","ʔhɑː",1]],"ʔ h|k":[["aː","អ្ហាក","ʔhaːk",1]],"ʔ h|ʔ":[["e","អ្ហិ","ʔheʔ",1]],"ʔ h|ŋ":[["ae","អ្ហែង","ʔhaeŋ",1]]};

const khmerOnsetAliases=map('ɡ=k g=k q=k ɟ=c tɕ=c dʑ=c tʃ=c dʒ=c ɾ=r ɹ=r ɻ=r w=v ʋ=v x=kʰ ɣ=k ʕ=ʔ ʡ=ʔ');
const khmerCodaAliases=map('ɡ=k g=k q=k b=p d=t ɾ=l ɹ=l w=v ʋ=v tɕ=c dʑ=c tʃ=c dʒ=c');
const cachedKhmerVowels=new Map();
const khmerSyllableCache=new Map();

function khmerReferenceVowels(ipa) {
  if(!cachedKhmerVowels.has(ipa))cachedKhmerVowels.set(ipa,tokenizeIPA(ipa,'khmer'));
  return cachedKhmerVowels.get(ipa);
}

function khmerPhoneKey(phone,aliases,initial=false) {
  if(!phone)return initial?'ʔ':'';
  const sound=aliases[phone.sound]??phone.sound;
  const aspirated=initial&&phone.marks.includes('ʰ')?sound+'ʰ':sound;
  return Object.hasOwn(initial?khmerSpellingEvidence.onsets:khmerSpellingEvidence.codas,aspirated)?aspirated:sound;
}


function khmerClusterOnsetKey(onset) {
  return onset.map(phone=>{
    const sound=phone.sound==='ɓ'?'b':phone.sound==='ɗ'?'d':phone.sound;
    return khmerPhoneKey({...phone,sound},khmerOnsetAliases,true);
  }).join(' ');
}

function khmerClusterSpelling(onset,nucleus,coda,final,fallback) {
  const variants=khmerClusterEvidence[khmerClusterOnsetKey(onset)+'|'+final];
  if(!variants)return fallback;
  const original=[...onset,...nucleus,...coda];
  const before=new Float64Array(9),after=new Float64Array(9);
  const pronunciationCost=ipa=>{
    const phones=comparisonPhones(khmerReferenceVowels(ipa));
    return ipaSequenceDistance(original,phones,before,after);
  };
  const previous=variants.find(([,writing])=>writing===fallback);
  let best=fallback,cost=previous?pronunciationCost(previous[2]):Infinity;
  for(const [vowels,writing,ipa,count] of variants) {
    if(writing===fallback||ipaSequenceDistance(nucleus,khmerReferenceVowels(vowels),before,after)>0.48)continue;
    const distance=pronunciationCost(ipa)+0.025/(1+count);
    if(distance<cost){best=writing;cost=distance;}
  }
  return best;
}

function khmerSyllable({onset,nucleus,coda}) {
  const fallback=()=>indicWord([...onset,...nucleus,...coda],'khmer');
  if(nucleus.length>3 || coda.length>1 || !nucleus.every(phone=>phone.vowel))return fallback();
  const nasalized=nucleus.some(phone=>phone.nasal);
  const final=nasalized&&!coda.length?'m':khmerPhoneKey(coda[0],khmerCodaAliases);
  if(onset.length>1)return khmerClusterSpelling(onset,nucleus,coda,final,fallback());
  const initial=khmerPhoneKey(onset[0],khmerOnsetAliases,true);
  const heads=khmerSpellingEvidence.onsets[initial], ends=khmerSpellingEvidence.codas[final];
  if(!heads || !ends)return fallback();
  const cacheKey=initial+'|'+nucleus.map(phone=>phone.sound+(phone.length?'ː':'')+(phone.nasal?'̃':'')).join('')+'|'+final;
  if(khmerSyllableCache.has(cacheKey))return khmerSyllableCache.get(cacheKey);
  const before=new Float64Array(5), after=new Float64Array(5);
  let closest=Infinity, spelling='';
  for(const [head,register,headCount] of heads) {
    const exact=khmerSpellingEvidence.nuclei[register+'|'+final]??[];
    const backoff=final?khmerSpellingEvidence.nuclei[register+'|']??[]:[];
    for(const [variants,penalty] of [[exact,0],[backoff,0.36]]) {
      for(const [ipa,sign,tail,modifier,count] of variants) {
        const score=ipaSequenceDistance(nucleus,khmerReferenceVowels(ipa),before,after)+penalty+
          (modifier?0.035:0)+0.08/(1+headCount)+0.12/(1+count);
        if(score<closest) {
          const ending=penalty?(ends.find(([value])=>!/[ំះ]/u.test(value))?.[0]??ends[0][0]):tail;
          closest=score;
          spelling=head+sign+ending+modifier;
        }
      }
    }
  }
  if(!spelling)spelling=fallback();
  if(khmerSyllableCache.size>=6000)khmerSyllableCache.clear();
  khmerSyllableCache.set(cacheKey,spelling);
  return spelling;
}

// Khmer pronunciation lexicon © 2018 Google Inc., CC BY 4.0. Adapted by filtering headwords, normalizing phoneme notation, and collecting recurring syllable readings.
// https://github.com/google/language-resources/blob/bc72dd6527aee6963910b9afc69a57f7b9aacc1d/km/data/lexicon.tsv
const khmerSupplementPayload=asset("khmer-source-data-1.bin");
const khmerSyllableModel=[{"ក":"k","ខ":"kʰ","គ":"k","ឃ":"kʰ","ង":"ŋ","ង៉":"ŋ","ច":"c","ឆ":"cʰ","ជ":"c","ឈ":"cʰ","ញ":"ɲ","ញ៉":"ɲ","ដ":"ɗ","ឌ":"ɗ","ណ":"n","ត":"t","ថ":"tʰ","ទ":"t","ធ":"tʰ","ន":"n","ប":"ɓ","ប៉":"p","ប៊":"ɓ","ផ":"pʰ","ព":"p","ភ":"pʰ","ម":"m","ម៉":"m","យ":"j","យ៉":"j","រ":"r","រ៉":"r","ល":"l","វ":"w","វ៉":"w","ស":"s","ស៊":"s","ហ":"h","ហ៊":"h","ឡ":"l","អ":"ʔ","អ៊":"ʔ"},{"aា":"aː","aាក":"aːk","aាក់":"ak","aាង":"aːŋ","aាច":"aːc","aាច់":"ac","aាញ់":"aɲ","aាត":"aːt","aាត់":"at","aាន":"aːn","aាន់":"an","aាប":"aːp","aាប់":"ap","aាម":"aːm","aាយ":"aːj","aារ":"aː","aាល":"aːl","aាល់":"al","aាវ":"aːw","aាស":"aːh","aិក":"ək","aិញ":"əɲ","aិត":"ət","aិន":"ən","aិប":"əp","aិល":"əl","aី":"əj","aឹក":"ək","aឹង":"əŋ","aឹប":"əp","aឹម":"əm","aឺ":"əː","aឺម":"əːm","aឺយ":"əːj","aុក":"ok","aុង":"oŋ","aុញ":"oɲ","aុន":"on","aុប":"op","aុយ":"oj","aុរ":"ol","aុល":"ol","aូ":"oː","aូក":"oːk","aូដ":"oːt","aូត":"oːt","aូន":"oːn","aូប":"oːp","aូម":"oːm","aូយ":"oːj","aូរ":"oː","aូស":"oːh","aួង":"uəŋ","aួត":"uət","aួន":"uən","aួយ":"uəj","aួរ":"uə","aើ":"aə","aើក":"aək","aើង":"aəŋ","aើត":"aət","aើន":"aən","aើប":"aəp","aើម":"aəm","aើយ":"aəj","aឿង":"ɨəŋ","aឿន":"ɨən","aៀក":"iək","aៀង":"iəŋ","aៀត":"iət","aៀន":"iən","aៀប":"iəp","aៀរ":"iə","aៀវ":"iəw","aេង":"eːŋ","aេត":"eːt","aេន":"eːn","aេម":"eːm","aេរ":"eː","aេល":"eːl","aេវ":"eːw","aែ":"ae","aែក":"aek","aែង":"aeŋ","aែត":"aet","aែន":"aen","aែប":"aep","aែម":"aem","aែវ":"aew","aែស":"aeh","aៃ":"aj","aោ":"ao","aោក":"aok","aោង":"aoŋ","aោត":"aot","aោន":"aon","aោប":"aop","aោយ":"aoj","aោរ":"ao","aោល":"aol","aៅ":"aw","aិម":"əm","aឹស":"əh","aឺន":"əːn","aុត":"ot","aុម":"om","aុស":"oh","aូង":"oːŋ","aូច":"oːc","aូល":"oːl","aួ":"uə","aៀល":"iəl","aេ":"eː","aេក":"eːk","aេប":"eːp","aែល":"ael","aោច":"aoc","oា":"ie","oាក":"iek","oាក់":"eak","oាង":"ieŋ","oាត":"iet","oាត់":"oat","oាន":"ien","oាន់":"oan","oាប":"iep","oាប់":"oap","oាម":"iem","oាយ":"iej","oារ":"ie","oាល់":"oal","oាវ":"iew","oាស់":"oah","oិញ":"ɨɲ","oិត":"ɨt","oិន":"ɨn","oិម":"ɨm","oិល":"ɨl","oី":"iː","oីក":"iːk","oីង":"iːŋ","oីន":"iːn","oីប":"iːp","oីម":"iːm","oីស":"iːh","oឹក":"ɨk","oឹង":"ɨŋ","oឹម":"ɨm","oឹល":"ɨl","oឺ":"ɨː","oុក":"uk","oុច":"uc","oុញ":"uɲ","oុត":"ut","oុន":"un","oុប":"up","oុម":"um","oុយ":"uj","oុល":"ul","oុស":"uh","oូ":"uː","oូក":"uːk","oូច":"uːc","oូត":"uːt","oូន":"uːn","oូម":"uːm","oូយ":"uːj","oូរ":"uː","oូល":"uːl","oូស":"uːh","oួង":"uəŋ","oួច":"uəc","oួន":"uən","oួយ":"uəj","oួរ":"uə","oើ":"əː","oើត":"əːt","oើម":"əːm","oឿង":"ɨəŋ","oឿត":"ɨət","oឿន":"ɨən","oឿម":"ɨəm","oៀក":"iək","oៀង":"iəŋ","oៀត":"iət","oៀន":"iən","oៀប":"iəp","oៀម":"iəm","oៀវ":"iəw","oេ":"eː","oេង":"eːŋ","oេច":"ɨc","oេន":"eːn","oែ":"ɛː","oែន":"ɛːn","oែម":"ɛːm","oៃ":"ej","oោ":"oː","oោក":"oːk","oោង":"oːŋ","oោម":"oːm","oោល":"oːl","oីច":"iːc","oីដ":"iːt","oីត":"iːt","oីល":"iːl","oីវ":"iːw","oឹន":"ɨn","oុង":"uŋ","oួត":"uət","oើន":"əːn","oើស":"əːh","oៀ":"iə","oេត":"eːt","oេម":"eːm","oេល":"eːl","oែត":"ɛːt","oែល":"ɛːl","oាស":"ieh","oឺង":"ɨːŋ","oឺត":"ɨːt","oើក":"əːk","oើប":"əːp","oើយ":"əːj","oើល":"əːl","oឿ":"ɨə","oឿក":"ɨək","oោន":"oːn","oៅ":"ɨw","aឺត":"əːt","aឺស":"əːh","aាស់":"ah","aុច":"oc","aៀម":"iəm","aេញ":"əɲ","aេដ":"eːt","aោម":"aom","aោវ":"aow","aាដ":"aːt","aិច":"əc","aឹន":"ən","aឺង":"əːŋ","aៀ":"iə","oាញ":"ieɲ","oាល":"iel","oឺន":"ɨːn","oួ":"uə","oើង":"əːŋ","oឿប":"ɨəp","oេក":"eːk","oេប":"eːp","oែក":"ɛːk","oែង":"ɛːŋ","oីញ":"iːɲ","oឹប":"ɨp","oូង":"uːŋ","oិច":"ɨc","oេញ":"ɨɲ","oឹត":"ɨt","oៀរ":"iə","oៀល":"iəl","oែប":"ɛːp","aាញ":"aːɲ","oាច":"iec","oឿយ":"ɨəj","oួក":"uək","oាជ":"iec","oោត":"oːt"}];
// Repeated spelling corrections by Seanghay Hay, CC BY-SA 4.0; filtered to unique pairs attested in the pronunciation lexicons.
// https://huggingface.co/datasets/seanghay/khmer-spelling-corrections/tree/3bad46b8a7b1dcfcc4a9f9845f75455f78391a84
// https://creativecommons.org/licenses/by-sa/4.0/
const khmerVariantPayload=asset("khmer-source-data-2.bin");

const khmerSourceRun=/^[\u1780-\u17d3\u17d7\u17dd\u200c\u200d]+$/u;
const khmerSourceParts=/([\u1780-\u17d3\u17d7\u17dd\u200c\u200d]+)/u;
const khmerSourceLetters=/[\u1780-\u17d3\u17d7\u17dd]/u;
const khmerWords=new Intl.Segmenter('km',{granularity:'word'});
const khmerGraphemes=new Intl.Segmenter('km',{granularity:'grapheme'});
let khmerSupplementRequest;

function khmerVariantKey(word) {
  return word.replaceAll(/\u17d2[\u178a\u178f]/gu,'្ដ')
    .replaceAll('ឲ','ឱ').replaceAll('ឣ','អ').replaceAll('ឤ','អា');
}

const khmerFirstSeries=new Set('កខចឆដឋណតថបផសហឡអ');

function khmerSyllableKeys(word) {
  const parts=word.match(/^([ក-អ][៉៊]?)([ា-ៅ])([ក-អ]?)(់?)$/u);
  if(!parts)return null;
  const [,onset,vowel,coda,mark]=parts;
  const series=onset.includes('៊')?'o':onset.includes('៉')||khmerFirstSeries.has(onset[0])?'a':'o';
  return [onset,series+vowel+coda+mark];
}

function khmerSyllableReading(word,[onsets,rhymes]) {
  const keys=khmerSyllableKeys(word);
  if(!keys)return '';
  const onset=onsets[keys[0]],rhyme=rhymes[keys[1]];
  return onset&&rhyme?onset+rhyme:'';
}

function loadKhmerSourceSupplement() {
  if(!khmerSupplementRequest) {
    khmerSupplementRequest=Promise.all([khmerSupplementPayload,khmerVariantPayload].map(payload=>decompressTextData(payload).then(JSON.parse)))
      .then(([table,[unicode,corrections]])=>({
        table,unicode,corrections,
        maximum:Object.keys(table).reduce((length,word)=>Math.max(length,word.length),0),
      })).catch(error=>{khmerSupplementRequest=undefined;throw error;});
  }
  return khmerSupplementRequest;
}

function khmerClusterCuts(input) {
  const cuts=[0];
  for(const {index,segment} of khmerGraphemes.segment(input)) {
    const end=index+segment.length;
    if(end<input.length && (/្[\u200c\u200d]*$/u.test(segment)||/^[\p{M}\u200c\u200d]/u.test(input.slice(end,end+1))))continue;
    cuts.push(end);
  }
  return cuts;
}

function planKhmerSourceRun(input,table,{table:supplement,unicode,corrections},maximum,allowInference=false) {
  const cuts=khmerClusterCuts(input);
  const wordCuts=new Set([0,input.length]);
  for(const {index,segment,isWordLike} of khmerWords.segment(input)) {
    if(isWordLike){wordCuts.add(index);wordCuts.add(index+segment.length);}
  }
  const last=cuts.length-1,paths=new Array(cuts.length);
  paths[last]={missing:0,inferred:0,cost:0};
  for(let start=last-1;start>=0;start--) {
    const base=cuts[start],next=cuts[start+1],following=paths[start+1];
    let best={missing:following.missing+next-base,inferred:following.inferred,cost:following.cost+2,step:start+1};
    for(let end=start+1;end<=last&&cuts[end]-base<=maximum;end++) {
      const edge=cuts[end];
      const word=input.slice(base,edge).replace(/[\u200c\u200d]/gu,'');
      if(!/^[\u1780-\u17b3]/u.test(word))continue;
      if(word.length===1&&(!wordCuts.has(base)||!wordCuts.has(edge)))continue;
      const main=table[word],extra=Object.hasOwn(supplement,word)?supplement[word]:undefined;
      const equivalent=!main&&!extra?unicode[khmerVariantKey(word)]:undefined;
      const alternative=!main&&!extra?(equivalent===word?undefined:equivalent)??corrections[word]:undefined;
      const known=main??extra??(alternative?(table[alternative]??supplement[alternative]):undefined);
      const inferred=!known&&allowInference?khmerSyllableReading(word,khmerSyllableModel):'';
      const value=known||(inferred?'/'+inferred+'/':'');
      if(!value)continue;
      const tail=paths[end];
      const cost=tail.cost+1+(main?0:0.16)+(wordCuts.has(edge)?0:0.24)+(alternative?1:0);
      const guessed=tail.inferred+(inferred?word.length:0);
      if(tail.missing<best.missing||tail.missing===best.missing&&(guessed<best.inferred||guessed===best.inferred&&cost<best.cost)) {
        best={missing:tail.missing,inferred:guessed,cost,step:end,value,extra:Boolean(extra&&!main),alternative,guessed:Boolean(inferred)};
      }
    }
    paths[start]=best;
  }
  const chunks=[];
  for(let start=0;start<last;){
    const step=paths[start];
    const original=input.slice(cuts[start],cuts[step.step]);
    start=step.step;
    if(step.value) {
      const reading=chooseDictionaryReading(step.value,'khmer');
      if(hasKnownSound(reading.ipa,'khmer')) {
        chunks.push({original,...reading,phraseBreak:true,khmerSupplement:step.extra,...(step.alternative?{khmerVariant:step.alternative}:{}),...(step.guessed?{khmerInferred:true}:{})});
        continue;
      }
    }
    const previous=chunks.at(-1);
    if(previous?.unknown)previous.original+=original;
    else chunks.push({original,unknown:true});
  }
  return chunks;
}

async function repairKhmerSource(chunks,table,originalMaximum) {
  const needsLookup=chunks.some((chunk,index)=>
    !chunk.ipa&&khmerSourceLetters.test(chunk.original) ||
    index>0&&khmerSourceRun.test(chunk.original)&&khmerSourceRun.test(chunks[index-1].original)
  );
  if(!needsLookup)return chunks;
  const supplement=await loadKhmerSourceSupplement().catch(()=>null);
  if(!supplement)return chunks;
  const maximum=Math.max(originalMaximum,supplement.maximum);
  const pieces=chunks.flatMap(chunk=>chunk.ipa || !khmerSourceLetters.test(chunk.original) ? [chunk] :
    chunk.original.split(khmerSourceParts).filter(Boolean).map(original=>({...chunk,original})));
  const output=[];
  for(let index=0;index<pieces.length;){
    if(!khmerSourceRun.test(pieces[index].original)){
      output.push(pieces[index++]);
      continue;
    }
    let end=index+1;
    while(end<pieces.length&&khmerSourceRun.test(pieces[end].original))end++;
    const run=pieces.slice(index,end);
    const covered=values=>values.reduce((size,chunk)=>size+(chunk.ipa?chunk.original.length:0),0);
    const text=run.map(piece=>piece.original).join('');
    const entire=run.length>1?supplement.table[text.replace(/[\u200c\u200d]/gu,'')]:undefined;
    if(entire) {
      const reading=chooseDictionaryReading(entire,'khmer');
      output.push({original:text,...reading,phraseBreak:true,khmerSupplement:true});
    } else if(covered(run)<text.length) {
      const repaired=planKhmerSourceRun(text,table,supplement,maximum);
      const attested=covered(repaired)>covered(run)?repaired:run;
      const inferred=covered(attested)<text.length?planKhmerSourceRun(text,table,supplement,maximum,true):attested;
      output.push(...(covered(inferred)>covered(attested)?inferred:attested));
    } else output.push(...run);
    index=end;
  }
  return output;
}

// Italian word readings from CUNY-CL/WikiPron, Wiktionary (CC BY-SA 4.0).
// https://github.com/CUNY-CL/wikipron/tree/d282e848a211ea31cfd730f0ced8bc8cdab9e83d
const italianLexiconPayload=asset("italian-lexicon-1.bin");

// Spellophone v0.2.1 and eSpeak NG, GPL-3.0-or-later.
// https://github.com/Spelling-Creator/spellophone/tree/v0.2.1
const createEmbeddedEspeak=(()=>{
//#region src/data.ts
/** Where the loaders put espeak-ng-data inside the module's virtual file system. */
const DATA_PATH = "/espeak-ng-data";
/**
* The language espeak-ng loads while initializing. Its dictionary has to be
* present before `sp_initialize` runs, so every loader fetches it first.
*/
const DEFAULT_LANGUAGE = "en";
/**
* Copies files from a `DataSource` into the module's virtual file system.
*/
var DataLoader = class {
	module;
	source;
	dataPath;
	#pending = /* @__PURE__ */ new Map();
	constructor(module, source, dataPath = DATA_PATH) {
		this.module = module;
		this.source = source;
		this.dataPath = dataPath;
	}
	/** Languages the data source has a dictionary for. */
	availableLanguages() {
		return Object.keys(this.source.manifest.dictionaries);
	}
	/** Languages whose dictionary is in the virtual file system already. */
	loadedLanguages() {
		return this.availableLanguages().filter((lang) => this.hasDictionary(lang));
	}
	hasDictionary(language) {
		return this.module.FS.analyzePath(this.#dictionaryPath(language)).exists;
	}
	/** Writes everything except the dictionaries. Call this once, before init. */
	async loadCore() {
		const { core } = this.source.manifest;
		this.#writeCore(await this.source.read(core.file));
	}
	loadCoreSync() {
		if (!this.source.readSync) throw new Error("This data source cannot read synchronously.");
		const { core } = this.source.manifest;
		this.#writeCore(this.source.readSync(core.file));
	}
	/** Fetches and writes one language's dictionary. Resolves at once if present. */
	loadDictionary(language) {
		if (this.hasDictionary(language)) return Promise.resolve();
		const pending = this.#pending.get(language);
		if (pending) return pending;
		const entry = this.#dictionaryEntry(language);
		const task = this.source.read(entry.file).then((bytes) => {
			this.#writeFile(this.#dictionaryPath(language), bytes);
		}).finally(() => {
			this.#pending.delete(language);
		});
		this.#pending.set(language, task);
		return task;
	}
	/**
	* Synchronous variant for sources with `readSync`. Returns false when the
	* source cannot read synchronously, so callers can fall back to an error
	* that points at `loadDictionary`.
	*/
	loadDictionarySync(language) {
		if (this.hasDictionary(language)) return true;
		if (!this.source.readSync) return false;
		const entry = this.#dictionaryEntry(language);
		this.#writeFile(this.#dictionaryPath(language), this.source.readSync(entry.file));
		return true;
	}
	#dictionaryEntry(language) {
		const entry = this.source.manifest.dictionaries[language];
		if (!entry) throw new Error(`espeak-ng has no dictionary for "${language}". Available: ${this.availableLanguages().join(", ")}`);
		return entry;
	}
	#dictionaryPath(language) {
		return `${this.dataPath}/${language}_dict`;
	}
	#writeCore(bytes) {
		const { core } = this.source.manifest;
		if (bytes.length !== core.size) throw new Error(`${core.file} is ${bytes.length} bytes, the manifest expects ${core.size}. The data files and manifest.json do not match.`);
		let offset = 0;
		for (const entry of core.entries) {
			this.#writeFile(`${this.dataPath}/${entry.path}`, bytes.subarray(offset, offset + entry.size));
			offset += entry.size;
		}
	}
	#writeFile(path, bytes) {
		const dir = path.slice(0, path.lastIndexOf("/"));
		this.module.FS.mkdirTree(dir);
		this.module.FS.writeFile(path, bytes);
	}
};
/** Decodes a file the way the manifest says it was stored. */
async function decode(bytes, encoding) {
	if (encoding === "identity") return bytes;
	const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}
function isGzip(bytes) {
	return bytes[0] === 31 && bytes[1] === 139;
}
/**
* A `DataSource` that fetches the files over HTTP from `baseUrl`, the
* directory that holds `manifest.json`. A trailing slash is optional.
* `decodeImpl` replaces `decode`, for engines without `DecompressionStream`.
* Files the browser has already unzipped (served with
* `Content-Encoding: gzip`) are passed on as they are.
*/
async function httpDataSource(baseUrl, fetchImpl = fetch, decodeImpl = decode) {
	let base = String(baseUrl);
	if (!base.endsWith("/")) base += "/";
	if (!/^[a-z][a-z0-9+.-]*:/i.test(base)) {
		const location = globalThis.location?.href;
		if (!location) throw new Error(`The espeak-ng data URL must be absolute outside a browser context: ${base}`);
		base = new URL(base, location).href;
	}
	const fetchBytes = async (file) => {
		const response = await fetchImpl(new URL(file, base));
		if (!response.ok) throw new Error(`Failed to fetch espeak-ng data file ${file} from ${base}: ${response.status} ${response.statusText}`);
		return new Uint8Array(await response.arrayBuffer());
	};
	const manifestResponse = await fetchImpl(new URL("manifest.json", base));
	if (!manifestResponse.ok) throw new Error(`Failed to fetch espeak-ng data manifest from ${base}: ${manifestResponse.status} ${manifestResponse.statusText}`);
	const manifest = await manifestResponse.json();
	if (manifest.version !== 1) throw new Error(`Unsupported espeak-ng data manifest version ${String(manifest.version)} at ${base}`);
	return {
		manifest,
		read: async (file) => {
			const bytes = await fetchBytes(file);
			const encoding = manifest.encoding === "gzip" && !isGzip(bytes) ? "identity" : manifest.encoding;
			try {
				return await decodeImpl(bytes, encoding);
			} catch (error) {
				throw new Error(`Failed to decode espeak-ng data file ${file} from ${base}: ${String(error)}`, { cause: error });
			}
		}
	};
}
/**
* The jsDelivr URL of this package's data directory for a given version, for
* apps that would rather not host the data themselves.
*
* This is jsDelivr's npm endpoint, serving the `espeak-ng-data` directory of
* the package as published to npmjs.com.
*/
function jsdelivrDataUrl(version) {
	return `https://cdn.jsdelivr.net/npm/@spelling-creator/spellophone@${version}/espeak-ng-data/`;
}
//#endregion
//#region src/wav.ts
/**
* Encodes 16-bit mono PCM samples as a WAV file (RIFF, PCM format 1).
*
* The output is what `espeak-ng -w out.wav` would write, so it can be saved
* to disk, served over HTTP or handed to an `<audio>` element as a Blob.
*/
function encodeWav(samples, sampleRate) {
	const channels = 1;
	const bytesPerSample = 2;
	const dataSize = samples.length * bytesPerSample;
	const buffer = new ArrayBuffer(44 + dataSize);
	const view = new DataView(buffer);
	const writeAscii = (offset, text) => {
		for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
	};
	writeAscii(0, "RIFF");
	view.setUint32(4, 36 + dataSize, true);
	writeAscii(8, "WAVE");
	writeAscii(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * channels * bytesPerSample, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeAscii(36, "data");
	view.setUint32(40, dataSize, true);
	for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * bytesPerSample, samples[i] ?? 0, true);
	return new Uint8Array(buffer);
}
/**
* Converts 16-bit PCM samples to the float format the Web Audio API wants
* (`AudioBuffer.copyToChannel`), scaled to the range -1 to 1.
*/
function toFloat32(samples) {
	const out = new Float32Array(samples.length);
	for (let i = 0; i < samples.length; i++) out[i] = (samples[i] ?? 0) / 32768;
	return out;
}
//#endregion
//#region src/version.ts
/** This package's version, injected at build time from package.json. */
const VERSION = "0.2.1";
//#endregion
//#region src/core.ts
const PARAMETER_IDS = {
	rate: 1,
	volume: 2,
	pitch: 3,
	range: 4,
	punctuation: 5,
	capitals: 6,
	wordGap: 7
};
const FLAG_SSML = 16;
const FLAG_PHONEMES = 256;
const FLAG_ENDPAUSE = 4096;
const INIT_PHONEME_EVENTS = 1;
const INIT_PHONEME_IPA = 2;
const PHONEMES_IPA = 2;
const PHONEMES_TIE = 128;
const EVENT_WORD = 1;
const EVENT_SENTENCE = 2;
const EVENT_MARK = 3;
const EVENT_PLAY = 4;
const EVENT_END = 5;
const EVENT_PHONEME = 7;
var EspeakError = class extends Error {
	name = "EspeakError";
	/** The espeak_ERROR or espeak_ng_STATUS value. */
	code;
	constructor(message, code) {
		super(message);
		this.code = code;
	}
};
/**
* Thrown when a voice needs a dictionary that has not been loaded into the
* virtual file system and the data source cannot read it synchronously.
* Catch it, `await espeak.loadLanguages([error.language])`, and retry, or use
* `Espeak.loadVoice`, which does exactly that.
*/
var DictionaryNotLoadedError = class extends EspeakError {
	name = "DictionaryNotLoadedError";
	language;
	constructor(language) {
		super(`The "${language}" dictionary is not loaded. Load it with espeak.loadLanguages(["${language}"]) or pass it in the languages option.`, -1);
		this.language = language;
	}
};
/**
* Builds the module factory options the entry points share: an optional wasm
* location, and a stderr filter. espeak-ng prints "Can't read dictionary
* file" whenever a voice's dictionary is not in the virtual file system,
* which is an expected event here (it is what triggers loading it), so that
* line is dropped and everything else still reaches `console.error`.
*/
function moduleFactoryOptions(wasmUrl) {
	const options = { printErr: (line) => {
		if (line.startsWith("Can't read dictionary file:")) return;
		console.error(line);
	} };
	if (wasmUrl !== void 0) {
		const wasm = String(wasmUrl);
		options.locateFile = (file, prefix) => file.endsWith(".wasm") ? wasm : prefix + file;
	}
	return options;
}
function withCString(module, text, fn) {
	const size = module.lengthBytesUTF8(text) + 1;
	const ptr = module._malloc(size);
	try {
		module.stringToUTF8(text, ptr, size);
		return fn(ptr);
	} finally {
		module._free(ptr);
	}
}
function readLanguages(module, ptr) {
	const languages = [];
	if (ptr === 0) return languages;
	let p = ptr;
	for (;;) {
		const priority = module.HEAPU8[p] ?? 0;
		if (priority === 0) break;
		const name = module.UTF8ToString(p + 1);
		languages.push({
			priority,
			name
		});
		p += 1 + module.lengthBytesUTF8(name) + 1;
	}
	return languages;
}
function genderFromCode(code) {
	if (code === 1) return "male";
	if (code === 2) return "female";
}
/**
* A synchronous espeak-ng instance.
*
* Get one from `createEspeak` (the `spellophone/node` and `spellophone/browser`
* entry points) or, to bring your own module and data, from `Espeak.create`.
*/
var Espeak = class Espeak {
	module;
	/** Samples per second of the audio `synthesize` returns. */
	sampleRate;
	/** espeak-ng's version string, such as `1.52.0`. */
	version;
	dataPath;
	#loader;
	#disposed = false;
	/** Lowercased language tag to voice identifier, see `#voiceForLanguage`. */
	#languageVoices;
	constructor(module, sampleRate, dataPath, loader) {
		this.module = module;
		this.sampleRate = sampleRate;
		this.dataPath = dataPath;
		this.#loader = loader;
		const info = module.UTF8ToString(module._sp_version());
		this.version = info.split(/\s+/)[0] ?? info;
	}
	/**
	* Initializes espeak-ng on an already instantiated module whose virtual
	* file system holds espeak-ng-data at `options.dataPath` (default
	* `/espeak-ng-data`), with at least the English dictionary present.
	*/
	static create(module, options = {}) {
		const dataPath = options.dataPath ?? options.loader?.dataPath ?? "/espeak-ng-data";
		let flags = 0;
		if (options.phonemeEvents) flags |= INIT_PHONEME_EVENTS;
		if (options.phonemeEvents === "ipa") flags |= INIT_PHONEME_IPA;
		const rate = withCString(module, dataPath, (ptr) => module._sp_initialize(ptr, flags));
		if (rate <= 0) throw new EspeakError(`espeak-ng failed to initialize with data at ${dataPath} (status ${rate}). Is the data loaded, including the English dictionary?`, rate);
		return new Espeak(module, rate, dataPath, options.loader);
	}
	/** Every voice and language espeak-ng-data defines. */
	listVoices() {
		this.#check();
		const m = this.module;
		const voices = [];
		const count = m._sp_voice_count();
		for (let i = 0; i < count; i++) {
			const voice = {
				name: m.UTF8ToString(m._sp_voice_name(i)),
				identifier: m.UTF8ToString(m._sp_voice_identifier(i)),
				languages: readLanguages(m, m._sp_voice_languages(i))
			};
			const gender = genderFromCode(m._sp_voice_gender(i));
			if (gender) voice.gender = gender;
			const age = m._sp_voice_age(i);
			if (age > 0) voice.age = age;
			voices.push(voice);
		}
		return voices;
	}
	/** The selected voice, or null before any has been selected. */
	get voice() {
		this.#check();
		const m = this.module;
		const namePtr = m._sp_current_voice_name();
		if (namePtr === 0) return null;
		return {
			name: m.UTF8ToString(namePtr),
			languages: readLanguages(m, m._sp_current_voice_languages())
		};
	}
	/**
	* Selects a voice by name, language or properties. Loads the dictionary it
	* needs when the data source can do so synchronously (Node), and throws
	* `DictionaryNotLoadedError` otherwise. Use `loadVoice` to await it instead.
	*/
	setVoice(selector) {
		this.#check();
		this.#selectVoice(selector);
		if (this.module._sp_dictionary_loaded()) return;
		const language = this.module.UTF8ToString(this.module._sp_dictionary_name());
		if (this.#loader?.loadDictionarySync(language)) {
			this.#selectVoice(selector);
			if (this.module._sp_dictionary_loaded()) return;
		}
		throw new DictionaryNotLoadedError(language);
	}
	/** Like `setVoice`, but fetches a missing dictionary first. */
	async loadVoice(selector) {
		try {
			this.setVoice(selector);
		} catch (error) {
			if (!(error instanceof DictionaryNotLoadedError) || !this.#loader) throw error;
			await this.#loader.loadDictionary(error.language);
			this.setVoice(selector);
		}
	}
	/** Languages whose dictionary is loaded and ready to use. */
	loadedLanguages() {
		return this.#loader?.loadedLanguages() ?? [];
	}
	/** Languages the data source can provide a dictionary for. */
	availableLanguages() {
		return this.#loader?.availableLanguages() ?? [];
	}
	/** Fetches the dictionaries for these languages so voices can use them. */
	async loadLanguages(languages) {
		if (!this.#loader) throw new Error("This Espeak instance has no data loader.");
		await Promise.all(languages.map((lang) => this.#loader.loadDictionary(lang)));
	}
	getParameter(parameter, current = true) {
		this.#check();
		return this.module._sp_get_parameter(PARAMETER_IDS[parameter], current ? 1 : 0);
	}
	/** Sets a parameter for every later call. See `Parameter` for the ranges. */
	setParameter(parameter, value, relative = false) {
		this.#check();
		const status = this.module._sp_set_parameter(PARAMETER_IDS[parameter], value, relative ? 1 : 0);
		if (status !== 0) throw new EspeakError(`Could not set ${parameter} to ${value}`, status);
	}
	/**
	* Synthesizes `text` and returns the audio and the events espeak-ng raised
	* while producing it. Parameter overrides apply to this call only.
	*/
	synthesize(text, options = {}) {
		this.#check();
		if (options.voice !== void 0) this.setVoice(options.voice);
		const restore = this.#applyOverrides(options);
		try {
			let flags = 0;
			if (options.ssml) flags |= FLAG_SSML;
			if (options.phonemes) flags |= FLAG_PHONEMES;
			if (options.endPause) flags |= FLAG_ENDPAUSE;
			const status = withCString(this.module, text, (ptr) => this.module._sp_synthesize(ptr, flags));
			if (status !== 0) throw new EspeakError(`Synthesis failed (status ${status})`, status);
			return this.#collectResult();
		} finally {
			restore();
		}
	}
	/**
	* Transcribes `text` to phonemes, in IPA by default. espeak-ng works one
	* clause at a time, so the clauses are joined with a newline, as the
	* `espeak-ng -x` command line does.
	*/
	phonemes(text, options = {}) {
		this.#check();
		if (options.voice !== void 0) this.setVoice(options.voice);
		let mode = options.ipa === false ? 0 : PHONEMES_IPA;
		if (options.tie) mode |= PHONEMES_TIE;
		if (options.separator) {
			const code = options.separator.codePointAt(0) ?? 0;
			if (code > 65535) throw new RangeError("The phoneme separator must be a single BMP character.");
			mode |= code << 8;
		}
		const ptr = withCString(this.module, text, (p) => this.module._sp_text_to_phonemes(p, mode));
		return this.module.UTF8ToString(ptr);
	}
	/** Releases espeak-ng. The instance cannot be used afterwards. */
	dispose() {
		if (this.#disposed) return;
		this.#disposed = true;
		this.module._sp_terminate();
	}
	#check() {
		if (this.#disposed) throw new Error("This Espeak instance has been disposed.");
	}
	#selectVoice(selector) {
		const m = this.module;
		const byName = (name) => withCString(m, name, (ptr) => m._sp_set_voice_by_name(ptr));
		let status;
		if (typeof selector === "string") {
			status = byName(selector);
			if (status !== 0) {
				const plus = selector.indexOf("+");
				const tag = plus < 0 ? selector : selector.slice(0, plus);
				const identifier = this.#voiceForLanguage(tag);
				if (identifier !== void 0) status = byName(identifier + selector.slice(tag.length));
			}
		} else {
			const gender = selector.gender === "male" ? 1 : selector.gender === "female" ? 2 : 0;
			status = withCString(m, selector.name ?? "", (name) => withCString(m, selector.language ?? "", (language) => m._sp_set_voice_by_properties(name, language, gender, selector.age ?? 0, selector.variant ?? 0)));
		}
		if (status !== 0) throw new EspeakError(`No voice matches ${typeof selector === "string" ? `"${selector}"` : JSON.stringify(selector)} (status ${status})`, status);
	}
	/**
	* The identifier of the voice that lists this language tag (ignoring case)
	* with the best priority, which is the one espeak-ng picks for it. Built
	* once, since listing the voices reads every voice file.
	*/
	#voiceForLanguage(tag) {
		if (!this.#languageVoices) {
			const best = /* @__PURE__ */ new Map();
			for (const voice of this.listVoices()) for (const { name, priority } of voice.languages) {
				const key = name.toLowerCase();
				const current = best.get(key);
				if (!current || priority < current.priority) best.set(key, {
					identifier: voice.identifier,
					priority
				});
			}
			this.#languageVoices = new Map([...best].map(([key, { identifier }]) => [key, identifier]));
		}
		return this.#languageVoices.get(tag.toLowerCase());
	}
	#applyOverrides(overrides) {
		const previous = [];
		for (const parameter of [
			"rate",
			"volume",
			"pitch",
			"range",
			"wordGap"
		]) {
			const value = overrides[parameter];
			if (value === void 0) continue;
			previous.push([parameter, this.getParameter(parameter)]);
			this.setParameter(parameter, value);
		}
		return () => {
			for (const [parameter, value] of previous) this.setParameter(parameter, value);
		};
	}
	#collectResult() {
		const m = this.module;
		const sampleCount = m._sp_audio_samples();
		const samplePtr = m._sp_audio_data();
		const samples = new Int16Array(m.HEAP16.buffer, samplePtr, sampleCount).slice();
		const events = [];
		const count = m._sp_events_count();
		const recordSize = m._sp_event_size();
		const base = m._sp_events_data();
		const strings = m._sp_strings_data();
		for (let i = 0; i < count; i++) {
			const at = base + i * recordSize >> 2;
			const heap = m.HEAP32;
			const type = heap[at] ?? 0;
			const common = {
				textPosition: heap[at + 1] ?? 0,
				length: heap[at + 2] ?? 0,
				audioPosition: heap[at + 3] ?? 0,
				sample: heap[at + 4] ?? 0
			};
			const number = heap[at + 5] ?? 0;
			const nameOffset = heap[at + 6] ?? -1;
			const name = nameOffset >= 0 ? m.UTF8ToString(strings + nameOffset) : "";
			switch (type) {
				case EVENT_WORD:
					events.push({
						type: "word",
						...common,
						number
					});
					break;
				case EVENT_SENTENCE:
					events.push({
						type: "sentence",
						...common,
						number
					});
					break;
				case EVENT_MARK:
					events.push({
						type: "mark",
						...common,
						name
					});
					break;
				case EVENT_PLAY:
					events.push({
						type: "play",
						...common,
						name
					});
					break;
				case EVENT_PHONEME:
					events.push({
						type: "phoneme",
						...common,
						phoneme: name
					});
					break;
				case EVENT_END: events.push({
					type: "end",
					...common
				});
			}
		}
		return {
			samples,
			sampleRate: this.sampleRate,
			duration: sampleCount / this.sampleRate,
			events
		};
	}
};
//#endregion


async function createEspeakModule(moduleArg={}){var Module=moduleArg;var ENVIRONMENT_IS_WEB=!!globalThis.window;var ENVIRONMENT_IS_WORKER=!!globalThis.WorkerGlobalScope;var ENVIRONMENT_IS_NODE=globalThis.process?.versions?.node&&globalThis.process?.type!="renderer";if(ENVIRONMENT_IS_NODE){const{createRequire}=await(import("node:module"));var require=createRequire((globalThis.location?.href??"file:///"))}var programArgs=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var _scriptName=(globalThis.location?.href??"file:///");var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var readAsync,readBinary;if(ENVIRONMENT_IS_NODE){var fs=require("node:fs");if(_scriptName.startsWith("file:")){scriptDirectory=require("node:path").dirname(require("node:url").fileURLToPath(_scriptName))+"/"}readBinary=filename=>{filename=isFileURI(filename)?new URL(filename):filename;var ret=fs.readFileSync(filename);return ret};readAsync=async(filename,binary=true)=>{filename=isFileURI(filename)?new URL(filename):filename;var ret=fs.readFileSync(filename,binary?undefined:"utf8");return ret};if(process.argv.length>1){thisProgram=process.argv[1].replace(/\\/g,"/")}programArgs=process.argv.slice(2);quit_=(status,toThrow)=>{process.exitCode=status;throw toThrow}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){try{scriptDirectory=new URL(".",_scriptName).href}catch{}{if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=async url=>{var response=await fetch(url,{credentials:"same-origin"});if(response.ok){return response.arrayBuffer()}throw new Error(response.status+" : "+response.url)}}}else{}var out=console.log.bind(console);var err=console.error.bind(console);var wasmBinary;var ABORT=false;var EXITSTATUS;var isFileURI=filename=>filename.startsWith("file://");class EmscriptenEH{}class EmscriptenSjLj extends EmscriptenEH{}var runtimeInitialized=false;function getMemoryBuffer(){return wasmMemory.buffer}function updateMemoryViews(){if(HEAP8?.buffer?.resizable)return;var b=getMemoryBuffer();HEAP8=new Int8Array(b);Module["HEAP16"]=HEAP16=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);Module["HEAP32"]=HEAP32=new Int32Array(b);HEAPU32=new Uint32Array(b);HEAP64=new BigInt64Array(b)}function preRun(){}function initRuntime(){runtimeInitialized=true;if(!Module["noFSInit"]&&!FS.initialized)FS.init();TTY.init();wasmExports["t"]();FS.ignorePermissions=false}function postRun(){}function abort(what){what=`Aborted(${what})`;err(what);ABORT=true;what+=". Build with -sASSERTIONS for more info.";var e=new WebAssembly.RuntimeError(what);throw e}var wasmBinaryFile;function findWasmBinary(){if(Module["locateFile"]){return locateFile("espeak-ng.wasm")}return new URL("espeak-ng.wasm",(globalThis.location?.href??"file:///")).href}function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}async function getWasmBinary(binaryFile){if(!wasmBinary){try{var response=await readAsync(binaryFile);return new Uint8Array(response)}catch{}}return getBinarySync(binaryFile)}async function instantiateArrayBuffer(binaryFile,imports){try{var binary=await getWasmBinary(binaryFile);var instance=await WebAssembly.instantiate(binary,imports);return instance}catch(reason){err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason)}}async function instantiateAsync(binary,binaryFile,imports){if(!binary&&!ENVIRONMENT_IS_NODE){try{var response=fetch(binaryFile,{credentials:"same-origin"});var instantiationResult=await WebAssembly.instantiateStreaming(response,imports);return instantiationResult}catch(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation")}}return instantiateArrayBuffer(binaryFile,imports)}function getWasmImports(){var imports={a:wasmImports};return imports}async function createWasm(){function receiveInstance(instance){wasmExports=instance.exports;assignWasmExports(wasmExports);updateMemoryViews();return wasmExports}function receiveInstantiationResult(result){return receiveInstance(result["instance"])}var info=getWasmImports();var instantiateWasm=Module["instantiateWasm"];if(instantiateWasm){return new Promise(resolve=>{instantiateWasm(info,inst=>resolve(receiveInstance(inst)))})}wasmBinaryFile??=findWasmBinary();var result=await instantiateAsync(wasmBinary,wasmBinaryFile,info);var exports=receiveInstantiationResult(result);return exports}class ExitStatus{name="ExitStatus";constructor(status){this.message=`Program terminated with exit(${status})`;this.status=status}}var HEAP8;var HEAP32;var syscallGetVarargI=()=>{var ret=HEAP32[+SYSCALLS.varargs>>2];SYSCALLS.varargs+=4;return ret};var syscallGetVarargP=syscallGetVarargI;var PATH={isAbs:path=>path.charAt(0)==="/",splitPath:filename=>{var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:(parts,allowAboveRoot)=>{var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up;up--){parts.unshift("..")}}return parts},normalize:path=>{var isAbsolute=PATH.isAbs(path),trailingSlash=path.slice(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(p=>!!p),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path},dirname:path=>{var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.slice(0,-1)}return root+dir},basename:path=>path&&path.match(/([^\/]+|\/)\/*$/)[1],join:(...paths)=>PATH.normalize(paths.join("/")),join2:(l,r)=>PATH.normalize(l+"/"+r)};var initRandomFill=()=>view=>(crypto.getRandomValues(view),0);var randomFill=view=>(randomFill=initRandomFill())(view);var PATH_FS={resolve:(...args)=>{var resolvedPath="",resolvedAbsolute=false;for(var i=args.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?args[i]:FS.cwd();if(typeof path!="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=PATH.isAbs(path)}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter(p=>!!p),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."},relative:(from,to)=>{from=PATH_FS.resolve(from).slice(1);to=PATH_FS.resolve(to).slice(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")}};var UTF8Decoder=new TextDecoder;var findStringEnd=(heapOrArray,idx,maxBytesToRead,ignoreNul)=>{var maxIdx=idx+maxBytesToRead;if(ignoreNul)return maxIdx;while(heapOrArray[idx]&&!(idx>=maxIdx))++idx;return idx};var UTF8ArrayToString=(heapOrArray,idx=0,maxBytesToRead,ignoreNul)=>{var endPtr=findStringEnd(heapOrArray,idx,maxBytesToRead,ignoreNul);return UTF8Decoder.decode(heapOrArray.buffer?heapOrArray.subarray(idx,endPtr):new Uint8Array(heapOrArray.slice(idx,endPtr)))};var FS_stdin_getChar_buffer=[];var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.codePointAt(i);if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;i++}}heap[outIdx]=0;return outIdx-startIdx};var intArrayFromString=(stringy,dontAddNull,length)=>{var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array};var FS_stdin_getChar=()=>{if(!FS_stdin_getChar_buffer.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;try{bytesRead=fs.readSync(process.stdin.fd,buf,0,BUFSIZE)}catch(e){if(e.toString().includes("EOF"))bytesRead=0;else throw e}if(bytesRead>0){result=buf.toString("utf-8",0,bytesRead)}}else if(globalThis.window?.prompt){result=window.prompt("Input: ");if(result!==null){result+="\n"}}else{}if(!result){return null}FS_stdin_getChar_buffer=intArrayFromString(result,true)}return FS_stdin_getChar_buffer.shift()};var TTY={ttys:[],init(){},shutdown(){},register(dev,ops){TTY.ttys[dev]={input:[],output:[],ops};FS.registerDevice(dev,TTY.stream_ops)},stream_ops:{open(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43)}stream.tty=tty;stream.seekable=false},close(stream){stream.tty.ops.fsync(stream.tty)},fsync(stream){stream.tty.ops.fsync(stream.tty)},read(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&!bytesRead){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;if(result===10)break}if(bytesRead){stream.node.atime=Date.now()}return bytesRead},write(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60)}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i])}}catch(e){throw new FS.ErrnoError(29)}if(length){stream.node.mtime=stream.node.ctime=Date.now()}return i}},default_tty_ops:{get_char(tty){return FS_stdin_getChar()},put_char(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync(tty){if(tty.output?.length>0){out(UTF8ArrayToString(tty.output));tty.output=[]}},ioctl_tcgets(tty){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(tty,optional_actions,data){return 0},ioctl_tiocgwinsz(tty){return[24,80]}},default_tty1_ops:{put_char(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync(tty){if(tty.output?.length>0){err(UTF8ArrayToString(tty.output));tty.output=[]}}}};var mmapAlloc=size=>{abort()};var MEMFS={ops_table:null,mount(mount){return MEMFS.createNode(null,"/",16895,0)},createNode(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(63)}MEMFS.ops_table||={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=MEMFS.emptyFileContents??=new Uint8Array(0)}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.atime=node.mtime=node.ctime=Date.now();if(parent){parent.contents[name]=node;parent.atime=parent.mtime=parent.ctime=node.atime}return node},getFileDataAsTypedArray(node){return node.contents.subarray(0,node.usedBytes)},expandFileStorage(node,newCapacity){var prevCapacity=node.contents.length;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)>>>0);if(prevCapacity)newCapacity=Math.max(newCapacity,256);var oldContents=MEMFS.getFileDataAsTypedArray(node);node.contents=new Uint8Array(newCapacity);node.contents.set(oldContents)},resizeFileStorage(node,newSize){if(node.usedBytes==newSize)return;var oldContents=node.contents;node.contents=new Uint8Array(newSize);node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)));node.usedBytes=newSize},node_ops:{getattr(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.atime);attr.mtime=new Date(node.mtime);attr.ctime=new Date(node.ctime);attr.atimeMs=node.atime;attr.mtimeMs=node.mtime;attr.ctimeMs=node.ctime;attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr},setattr(node,attr){for(const key of["mode","atime","mtime","ctime"]){if(attr[key]!=null){node[key]=attr[key]}}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}},lookup(parent,name){if(!MEMFS.doesNotExistError){MEMFS.doesNotExistError=new FS.ErrnoError(44);MEMFS.doesNotExistError.stack="<generic error, no stack>"}throw MEMFS.doesNotExistError},mknod(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)},rename(old_node,new_dir,new_name){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node&&FS.isDir(old_node.mode)){for(var i in new_node.contents){throw new FS.ErrnoError(55)}}delete old_node.parent.contents[old_node.name];new_dir.contents[new_name]=old_node;old_node.name=new_name;new_dir.ctime=new_dir.mtime=old_node.parent.ctime=old_node.parent.mtime=Date.now()},unlink(parent,name){delete parent.contents[name];parent.ctime=parent.mtime=Date.now()},rmdir(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55)}delete parent.contents[name];parent.ctime=parent.mtime=Date.now()},readdir(node){return[".","..",...Object.keys(node.contents)]},symlink(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node},readlink(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28)}return node.link}},stream_ops:{read(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);buffer.set(contents.subarray(position,position+size),offset);return size},write(stream,buffer,offset,length,position,canOwn){if(buffer.buffer===HEAP8.buffer){canOwn=false}if(!length)return 0;var node=stream.node;node.mtime=node.ctime=Date.now();if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length}else if(!node.usedBytes&&!position){node.contents=buffer.slice(offset,offset+length);node.usedBytes=length}else{MEMFS.expandFileStorage(node,position+length);node.contents.set(buffer.subarray(offset,offset+length),position);node.usedBytes=Math.max(node.usedBytes,position+length)}return length},llseek(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(28)}return position},mmap(stream,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&contents.buffer===HEAP8.buffer){allocated=false;ptr=contents.byteOffset}else{allocated=true;ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}if(contents){if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}HEAP8.set(contents,ptr)}}return{ptr,allocated}},msync(stream,buffer,offset,length,mmapFlags){MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};var FS_modeStringToFlags=str=>{if(typeof str!="string")return str;var flagModes={r:0,"r+":2,w:512|64|1,"w+":512|64|2,a:1024|64|1,"a+":1024|64|2};var flags=flagModes[str];if(typeof flags=="undefined"){throw new Error(`Unknown file open mode: ${str}`)}return flags};var FS_fileDataToTypedArray=data=>{if(typeof data=="string"){data=intArrayFromString(data,true)}if(!data.subarray){data=new Uint8Array(data)}return data};var FS_getMode=(canRead,canWrite)=>{var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode};var ERRNO_CODES={EPERM:63,ENOENT:44,ESRCH:71,EINTR:27,EIO:29,ENXIO:60,E2BIG:1,ENOEXEC:45,EBADF:8,ECHILD:12,EAGAIN:6,EWOULDBLOCK:6,ENOMEM:48,EACCES:2,EFAULT:21,ENOTBLK:105,EBUSY:10,EEXIST:20,EXDEV:75,ENODEV:43,ENOTDIR:54,EISDIR:31,EINVAL:28,ENFILE:41,EMFILE:33,ENOTTY:59,ETXTBSY:74,EFBIG:22,ENOSPC:51,ESPIPE:70,EROFS:69,EMLINK:34,EPIPE:64,EDOM:18,ERANGE:68,ENOMSG:49,EIDRM:24,ECHRNG:106,EL2NSYNC:156,EL3HLT:107,EL3RST:108,ELNRNG:109,EUNATCH:110,ENOCSI:111,EL2HLT:112,EDEADLK:16,ENOLCK:46,EBADE:113,EBADR:114,EXFULL:115,ENOANO:104,EBADRQC:103,EBADSLT:102,EDEADLOCK:16,EBFONT:101,ENOSTR:100,ENODATA:116,ETIME:117,ENOSR:118,ENONET:119,ENOPKG:120,EREMOTE:121,ENOLINK:47,EADV:122,ESRMNT:123,ECOMM:124,EPROTO:65,EMULTIHOP:36,EDOTDOT:125,EBADMSG:9,ENOTUNIQ:126,EBADFD:127,EREMCHG:128,ELIBACC:129,ELIBBAD:130,ELIBSCN:131,ELIBMAX:132,ELIBEXEC:133,ENOSYS:52,ENOTEMPTY:55,ENAMETOOLONG:37,ELOOP:32,EOPNOTSUPP:138,EPFNOSUPPORT:139,ECONNRESET:15,ENOBUFS:42,EAFNOSUPPORT:5,EPROTOTYPE:67,ENOTSOCK:57,ENOPROTOOPT:50,ESHUTDOWN:140,ECONNREFUSED:14,EADDRINUSE:3,ECONNABORTED:13,ENETUNREACH:40,ENETDOWN:38,ETIMEDOUT:73,EHOSTDOWN:142,EHOSTUNREACH:23,EINPROGRESS:26,EALREADY:7,EDESTADDRREQ:17,EMSGSIZE:35,EPROTONOSUPPORT:66,ESOCKTNOSUPPORT:137,EADDRNOTAVAIL:4,ENETRESET:39,EISCONN:30,ENOTCONN:53,ETOOMANYREFS:141,EUSERS:136,EDQUOT:19,ESTALE:72,ENOTSUP:138,ENOMEDIUM:148,EILSEQ:25,EOVERFLOW:61,ECANCELED:11,ENOTRECOVERABLE:56,EOWNERDEAD:62,ESTRPIPE:135};var NODEFS={isWindows:false,staticInit(){NODEFS.isWindows=!!process.platform.match(/^win/);var flags=process.binding("constants")["fs"];NODEFS.flagsForNodeMap={1024:flags["O_APPEND"],64:flags["O_CREAT"],128:flags["O_EXCL"],256:flags["O_NOCTTY"],0:flags["O_RDONLY"],2:flags["O_RDWR"],4096:flags["O_SYNC"],512:flags["O_TRUNC"],1:flags["O_WRONLY"],131072:flags["O_NOFOLLOW"]}},convertNodeCode(e){var code=e.code;return ERRNO_CODES[code]},tryFSOperation(f){try{return f()}catch(e){if(!e.code)throw e;if(e.code==="UNKNOWN")throw new FS.ErrnoError(28);throw new FS.ErrnoError(NODEFS.convertNodeCode(e))}},mount(mount){return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)},createNode(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(28)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node},getMode(path){return NODEFS.tryFSOperation(()=>{var mode=fs.lstatSync(path).mode;if(NODEFS.isWindows){mode|=(mode&292)>>2}return mode})},realPath(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent}parts.push(node.mount.opts.root);parts.reverse();return PATH.join(...parts)},flagsForNode(flags){flags&=~2097152;flags&=~2048;flags&=~32768;flags&=~524288;flags&=~65536;var newFlags=0;for(var k in NODEFS.flagsForNodeMap){if(flags&k){newFlags|=NODEFS.flagsForNodeMap[k];flags^=k}}if(flags){throw new FS.ErrnoError(28)}return newFlags},doGetAttr(func,node){var stat=NODEFS.tryFSOperation(func);if(NODEFS.isWindows){if(!stat.blksize){stat.blksize=4096}if(!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0}stat.mode|=(stat.mode&292)>>2}return{dev:stat.dev,ino:node.id,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,atimeMs:stat.atimeMs,mtimeMs:stat.mtimeMs,ctimeMs:stat.ctimeMs,blksize:stat.blksize,blocks:stat.blocks}},doSetAttr(arg,node,attr,chmod,utimes,truncate,stat){NODEFS.tryFSOperation(()=>{if(attr.mode!==undefined){var mode=attr.mode;if(NODEFS.isWindows){mode&=384}chmod(arg,mode);node.mode=attr.mode}if(typeof(attr.atime??attr.mtime)==="number"){var atime=attr.atime;var mtime=attr.mtime;if(atime==null||mtime==null){var st=stat(arg);atime??=st.atimeMs;mtime??=st.mtimeMs}utimes(arg,atime/1e3,mtime/1e3)}if(attr.size!==undefined){truncate(arg,attr.size)}})},node_ops:{getattr(node){var path=NODEFS.realPath(node);return NODEFS.doGetAttr(()=>fs.lstatSync(path),node)},setattr(node,attr){var path=NODEFS.realPath(node);if(attr.mode!=null&&attr.dontFollow){throw new FS.ErrnoError(52)}var utimes=attr.dontFollow?fs.lutimesSync:fs.utimesSync;NODEFS.doSetAttr(path,node,attr,fs.chmodSync,utimes,fs.truncateSync,fs.lstatSync)},lookup(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)},mknod(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);NODEFS.tryFSOperation(()=>{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode)}else{fs.writeFileSync(path,"",{mode:node.mode})}});return node},rename(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);NODEFS.tryFSOperation(()=>fs.renameSync(oldPath,newPath));oldNode.name=newName},unlink(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);NODEFS.tryFSOperation(()=>fs.unlinkSync(path))},rmdir(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);NODEFS.tryFSOperation(()=>fs.rmdirSync(path))},readdir(node){var path=NODEFS.realPath(node);return NODEFS.tryFSOperation(()=>fs.readdirSync(path))},symlink(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);NODEFS.tryFSOperation(()=>fs.symlinkSync(oldPath,newPath))},readlink(node){var path=NODEFS.realPath(node);return NODEFS.tryFSOperation(()=>fs.readlinkSync(path))},statfs(path){var stats=NODEFS.tryFSOperation(()=>fs.statfsSync(path));stats.frsize=stats.bsize;return stats}},stream_ops:{getattr(stream){return NODEFS.doGetAttr(()=>fs.fstatSync(stream.nfd),stream.node)},setattr(stream,attr){NODEFS.doSetAttr(stream.nfd,stream.node,attr,fs.fchmodSync,fs.futimesSync,fs.ftruncateSync,fs.fstatSync)},open(stream){var path=NODEFS.realPath(stream.node);NODEFS.tryFSOperation(()=>{stream.shared.refcount=1;stream.nfd=fs.openSync(path,NODEFS.flagsForNode(stream.flags))})},close(stream){NODEFS.tryFSOperation(()=>{if(stream.nfd&&! --stream.shared.refcount){fs.closeSync(stream.nfd)}})},dup(stream){stream.shared.refcount++},read(stream,buffer,offset,length,position){return NODEFS.tryFSOperation(()=>fs.readSync(stream.nfd,buffer,offset,length,position))},write(stream,buffer,offset,length,position){return NODEFS.tryFSOperation(()=>fs.writeSync(stream.nfd,buffer,offset,length,position))},llseek(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){NODEFS.tryFSOperation(()=>{var stat=fs.fstatSync(stream.nfd);position+=stat.size})}}if(position<0){throw new FS.ErrnoError(28)}return position},mmap(stream,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr=mmapAlloc(length);NODEFS.stream_ops.read(stream,HEAP8,ptr,length,position);return{ptr,allocated:true}},msync(stream,buffer,offset,length,mmapFlags){NODEFS.stream_ops.write(stream,buffer,0,length,offset);return 0}}};var asyncLoad=async url=>{var arrayBuffer=await readAsync(url);return new Uint8Array(arrayBuffer)};var FS_createDataFile=(...args)=>FS.createDataFile(...args);var getUniqueRunDependency=id=>id;var dependenciesPromise=null;var resolveRunDependencies=async()=>dependenciesPromise;var runDependencies=0;var dependenciesPromiseResolve=null;var removeRunDependency=id=>{runDependencies--;if(!runDependencies){dependenciesPromiseResolve()}};var addRunDependency=id=>{if(!runDependencies){dependenciesPromise=new Promise(resolve=>dependenciesPromiseResolve=resolve)}runDependencies++};var preloadPlugins=[];var FS_handledByPreloadPlugin=async(byteArray,fullname)=>{if(typeof Browser!="undefined")Browser.init();for(var plugin of preloadPlugins){if(plugin["canHandle"](fullname)){return plugin["handle"](byteArray,fullname)}}return byteArray};var FS_preloadFile=async(parent,name,url,canRead,canWrite,dontCreateFile,canOwn,preFinish)=>{var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency(`cp ${fullname}`);addRunDependency(dep);try{var byteArray=url;if(typeof url=="string"){byteArray=await asyncLoad(url)}byteArray=await FS_handledByPreloadPlugin(byteArray,fullname);preFinish?.();if(!dontCreateFile){FS_createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}}finally{removeRunDependency(dep)}};var FS_createPreloadedFile=(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish)=>{FS_preloadFile(parent,name,url,canRead,canWrite,dontCreateFile,canOwn,preFinish).then(onload).catch(onerror)};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:[],currentPath:"/",initialized:false,ignorePermissions:true,filesystems:null,syncFSRequests:0,ErrnoError:class{name="ErrnoError";constructor(errno){this.errno=errno}},FSStream:class{shared={};get object(){return this.node}set object(val){this.node=val}get isRead(){return(this.flags&2097155)!==1}get isWrite(){return(this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(val){this.shared.flags=val}get position(){return this.shared.position}set position(val){this.shared.position=val}},FSNode:class{node_ops={};stream_ops={};readMode=292|73;writeMode=146;mounted=null;constructor(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.rdev=rdev;this.atime=this.mtime=this.ctime=Date.now()}get read(){return(this.mode&this.readMode)===this.readMode}set read(val){val?this.mode|=this.readMode:this.mode&=~this.readMode}get write(){return(this.mode&this.writeMode)===this.writeMode}set write(val){val?this.mode|=this.writeMode:this.mode&=~this.writeMode}get isFolder(){return FS.isDir(this.mode)}get isDevice(){return FS.isChrdev(this.mode)}addListener(cb,exclusive=false){var entry={cb,exclusive};var listeners=this.listeners??=new Set;listeners.add(entry);return{listeners,entry}}notifyListeners(flags){if(!this.listeners)return;var excl;for(var entry of this.listeners){if(entry.exclusive)(excl||=[]).push(entry);else entry.cb(flags)}if(excl){var i=(this.exclTurn||0)%excl.length;this.exclTurn=i+1;excl[i].cb(flags)}}},lookupPath(path,opts={}){if(!path){throw new FS.ErrnoError(44)}opts.follow_mount??=true;if(!PATH.isAbs(path)){path=FS.cwd()+"/"+path}linkloop:for(var nlinks=0;nlinks<40;nlinks++){var parts=path.split("/").filter(p=>!!p);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}if(parts[i]==="."){continue}if(parts[i]===".."){current_path=PATH.dirname(current_path);if(FS.isRoot(current)){path=current_path+"/"+parts.slice(i+1).join("/");nlinks--;continue linkloop}else{current=current.parent}continue}current_path=PATH.join2(current_path,parts[i]);try{current=FS.lookupNode(current,parts[i])}catch(e){if(e?.errno===44&&islast&&opts.noent_okay){return{path:current_path}}throw e}if(FS.isMountpoint(current)&&(!islast||opts.follow_mount)){current=current.mounted.root}if(FS.isLink(current.mode)&&(!islast||opts.follow)){if(!current.node_ops.readlink){throw new FS.ErrnoError(52)}var link=current.node_ops.readlink(current);if(!PATH.isAbs(link)){link=PATH.dirname(current_path)+"/"+link}path=link+"/"+parts.slice(i+1).join("/");continue linkloop}}return{path:current_path,node:current}}throw new FS.ErrnoError(32)},getPath(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?`${mount}/${path}`:mount+path}path=path?`${node.name}/${path}`:node.name;node=node.parent}},hashName(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length},hashAddNode(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node},hashRemoveNode(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}},lookupNode(parent,name){var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)},createNode(parent,name,mode,rdev){var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node},destroyNode(node){FS.hashRemoveNode(node)},isRoot(node){return node===node.parent},isMountpoint(node){return!!node.mounted},isFile(mode){return(mode&61440)===32768},isDir(mode){return(mode&61440)===16384},isLink(mode){return(mode&61440)===40960},isChrdev(mode){return(mode&61440)===8192},isBlkdev(mode){return(mode&61440)===24576},isFIFO(mode){return(mode&61440)===4096},isSocket(mode){return(mode&49152)===49152},flagsToPermissionString(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms},nodePermissions(node,perms){if(FS.ignorePermissions){return 0}if(perms.includes("r")&&!(node.mode&292)){return 2}if(perms.includes("w")&&!(node.mode&146)){return 2}if(perms.includes("x")&&!(node.mode&73)){return 2}return 0},mayLookup(dir){if(!FS.isDir(dir.mode))return 54;var errCode=FS.nodePermissions(dir,"x");if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0},mayCreate(dir,name){if(!FS.isDir(dir.mode)){return 54}try{var node=FS.lookupNode(dir,name);return 20}catch(e){}return FS.nodePermissions(dir,"wx")},mayDelete(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var errCode=FS.nodePermissions(dir,"wx");if(errCode){return errCode}if(isdir){if(!FS.isDir(node.mode)){return 54}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10}}else if(FS.isDir(node.mode)){return 31}return 0},mayOpen(node,flags){if(!node){return 44}if(FS.isLink(node.mode)){return 32}var mode=FS.flagsToPermissionString(flags);if(FS.isDir(node.mode)){if(mode!=="r"||flags&(512|64)){return 31}}return FS.nodePermissions(node,mode)},checkOpExists(op,err){if(!op){throw new FS.ErrnoError(err)}return op},MAX_OPEN_FDS:4096,nextfd(){for(var fd=0;fd<=FS.MAX_OPEN_FDS;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(33)},getStreamChecked(fd){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}return stream},getStream:fd=>FS.streams[fd],createStream(stream,fd=-1){stream=Object.assign(new FS.FSStream,stream);if(fd==-1){fd=FS.nextfd()}stream.fd=fd;FS.streams[fd]=stream;return stream},closeStream(fd){FS.streams[fd]=null},dupStream(origStream,fd=-1){var stream=FS.createStream(origStream,fd);stream.stream_ops?.dup?.(stream);return stream},doSetAttr(stream,node,attr){var setattr=stream?.stream_ops.setattr;var arg=setattr?stream:node;setattr??=node.node_ops.setattr;FS.checkOpExists(setattr,63);try{setattr(arg,attr)}catch(e){if(e instanceof RangeError){throw new FS.ErrnoError(22)}throw e}},chrdev_stream_ops:{open(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;stream.stream_ops.open?.(stream)},llseek(){throw new FS.ErrnoError(70)}},major:dev=>dev>>8,minor:dev=>dev&255,makedev:(ma,mi)=>ma<<8|mi,registerDevice(dev,ops){FS.devices[dev]={stream_ops:ops}},getDevice:dev=>FS.devices[dev],getMounts(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push(...m.mounts)}return mounts},syncfs(populate,callback){if(typeof populate=="function"){callback=populate;populate=false}FS.syncFSRequests++;if(FS.syncFSRequests>1){err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode)}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode)}return}if(++completed>=mounts.length){doCallback(null)}}for(var mount of mounts){if(mount.type.syncfs){mount.type.syncfs(mount,populate,done)}else{done(null)}}},mount(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}}var mount={type,opts,mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot},unmount(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);for(var[hash,current]of Object.entries(FS.nameTable)){while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current)}current=next}}node.mounted=null;var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1)},lookup(parent,name){return parent.node_ops.lookup(parent,name)},mknod(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name){throw new FS.ErrnoError(28)}if(name==="."||name===".."){throw new FS.ErrnoError(20)}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63)}return parent.node_ops.mknod(parent,name,mode,dev)},statfs(path){return FS.statfsNode(FS.lookupPath(path,{follow:true}).node)},statfsStream(stream){return FS.statfsNode(stream.node)},statfsNode(node){var rtn={bsize:4096,frsize:4096,blocks:1e6,bfree:5e5,bavail:5e5,files:FS.nextInode,ffree:FS.nextInode-1,fsid:42,flags:2,namelen:255};if(node.node_ops.statfs){Object.assign(rtn,node.node_ops.statfs(node.mount.opts.root))}return rtn},create(path,mode=438){mode&=4095;mode|=32768;return FS.mknod(path,mode,0)},mkdir(path,mode=511){mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)},mkdirTree(path,mode=511){var dirs=path.split("/");var d="";for(var dir of dirs){if(!dir)continue;if(d||PATH.isAbs(path))d+="/";d+=dir;try{FS.mkdir(d,mode)}catch(e){if(e.errno!=20)throw e}}},mkdev(path,mode,dev){if(typeof dev=="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)},symlink(oldpath,newpath){if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63)}return parent.node_ops.symlink(parent,newname,oldpath)},link(oldpath,newpath,flags){var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.link){throw new FS.ErrnoError(34)}return parent.node_ops.link(parent,newname,oldpath,flags)},rename(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(28)}relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(55)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode)}errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10)}if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,"w");if(errCode){throw new FS.ErrnoError(errCode)}}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name);if(new_node){FS.hashRemoveNode(new_node)}old_node.parent=new_dir}catch(e){throw e}finally{FS.hashAddNode(old_node)}},rmdir(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node)},readdir(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;var readdir=FS.checkOpExists(node.node_ops.readdir,54);return readdir(node)},unlink(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.unlink(parent,name);FS.destroyNode(node)},readlink(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44)}if(!link.node_ops.readlink){throw new FS.ErrnoError(28)}return link.node_ops.readlink(link)},stat(path,dontFollow=false){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;var getattr=FS.checkOpExists(node.node_ops.getattr,63);return getattr(node)},fstat(fd){var stream=FS.getStreamChecked(fd);var node=stream.node;var getattr=stream.stream_ops.getattr;var arg=getattr?stream:node;getattr??=node.node_ops.getattr;FS.checkOpExists(getattr,63);return getattr(arg)},lstat(path){return FS.stat(path,true)},doChmod(stream,node,mode,dontFollow=false){FS.doSetAttr(stream,node,{mode:mode&4095|node.mode&~4095,ctime:Date.now(),dontFollow})},chmod(path,mode,dontFollow=false){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}FS.doChmod(null,node,mode,dontFollow)},lchmod(path,mode){FS.chmod(path,mode,true)},fchmod(fd,mode){var stream=FS.getStreamChecked(fd);FS.doChmod(stream,stream.node,mode,false)},doChown(stream,node,dontFollow=false){FS.doSetAttr(stream,node,{timestamp:Date.now(),dontFollow})},chown(path,uid,gid,dontFollow=false){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}FS.doChown(null,node,dontFollow)},lchown(path,uid,gid){FS.chown(path,uid,gid,true)},fchown(fd,uid,gid){var stream=FS.getStreamChecked(fd);FS.doChown(stream,stream.node,false)},doTruncate(stream,node,len){if(FS.isDir(node.mode)){throw new FS.ErrnoError(31)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28)}var errCode=FS.nodePermissions(node,"w");if(errCode){throw new FS.ErrnoError(errCode)}FS.doSetAttr(stream,node,{size:len,timestamp:Date.now()})},truncate(path,len){if(len<0){throw new FS.ErrnoError(28)}var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}FS.doTruncate(null,node,len)},ftruncate(fd,len){var stream=FS.getStreamChecked(fd);if(len<0||(stream.flags&2097155)===0){throw new FS.ErrnoError(28)}FS.doTruncate(stream,stream.node,len)},utime(path,atime,mtime,dontFollow=false){var lookup=FS.lookupPath(path,{follow:!dontFollow});FS.doSetAttr(null,lookup.node,{atime,mtime,dontFollow})},open(path,flags,mode=438){if(path===""){throw new FS.ErrnoError(44)}flags=FS_modeStringToFlags(flags);if(flags&64){mode=mode&4095|32768}else{mode=0}var node;var isDirPath;if(typeof path=="object"){node=path}else{isDirPath=path.endsWith("/");var lookup=FS.lookupPath(path,{follow:!(flags&131072),noent_okay:true});node=lookup.node;path=lookup.path}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(20)}}else if(isDirPath){throw new FS.ErrnoError(31)}else{node=FS.mknod(path,mode|511,0);created=true}}if(!node){throw new FS.ErrnoError(44)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode)}}if(flags&512&&!created){FS.truncate(node,0)}flags&=~(128|512|131072);var stream=FS.createStream({node,path:FS.getPath(node),flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false});if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(created){FS.chmod(node,mode&511)}return stream},close(stream){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(stream.getdents)stream.getdents=null;stream.node?.notifyListeners(32);try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}stream.fd=null},isClosed(stream){return stream.fd===null},llseek(stream,offset,whence){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70)}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position},read(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.read){throw new FS.ErrnoError(28)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead},write(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.write){throw new FS.ErrnoError(28)}if(stream.seekable&&stream.flags&1024){FS.llseek(stream,0,2)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten},mmap(stream,length,position,prot,flags){if(prot&2&&!(flags&2)&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43)}if(!length){throw new FS.ErrnoError(28)}return stream.stream_ops.mmap(stream,length,position,prot,flags)},msync(stream,buffer,offset,length,mmapFlags){if(!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)},ioctl(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59)}return stream.stream_ops.ioctl(stream,cmd,arg)},readFile(path,opts={}){opts.flags??=0;opts.encoding??="binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){abort(`Invalid encoding type "${opts.encoding}"`)}var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){buf=UTF8ArrayToString(buf)}FS.close(stream);return buf},writeFile(path,data,opts={}){opts.flags??=577;var stream=FS.open(path,opts.flags,opts.mode);data=FS_fileDataToTypedArray(data);FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn);FS.close(stream)},cwd:()=>FS.currentPath,chdir(path){var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44)}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54)}var errCode=FS.nodePermissions(lookup.node,"x");if(errCode){throw new FS.ErrnoError(errCode)}FS.currentPath=lookup.path},createDefaultDirectories(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")},createDefaultDevices(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(stream,buffer,offset,length,pos)=>length,llseek:()=>0});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var randomBuffer=new Uint8Array(1024),randomLeft=0;var randomByte=()=>{if(!randomLeft){randomFill(randomBuffer);randomLeft=randomBuffer.byteLength}return randomBuffer[--randomLeft]};FS.createDevice("/dev","random",randomByte);FS.createDevice("/dev","urandom",randomByte);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")},createSpecialDirectories(){FS.mkdir("/proc");var proc_self=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount(){var node=FS.createNode(proc_self,"fd",16895,73);node.stream_ops={llseek:MEMFS.stream_ops.llseek};node.node_ops={lookup(parent,name){var fd=+name;var stream=FS.getStreamChecked(fd);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>stream.path},id:fd+1};ret.parent=ret;return ret},readdir(){return Array.from(FS.streams.entries()).filter(([k,v])=>v).map(([k,v])=>k.toString())}};return node}},{},"/proc/self/fd")},createStandardStreams(input,output,error){if(input){FS.createDevice("/dev","stdin",input)}else{FS.symlink("/dev/tty","/dev/stdin")}if(output){FS.createDevice("/dev","stdout",null,output)}else{FS.symlink("/dev/tty","/dev/stdout")}if(error){FS.createDevice("/dev","stderr",null,error)}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin",0);var stdout=FS.open("/dev/stdout",1);var stderr=FS.open("/dev/stderr",1)},staticInit(){FS.nameTable.length=4096;FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={MEMFS,NODEFS}},init(input,output,error){FS.initialized=true;FS.createStandardStreams(input,output,error)},quit(){FS.initialized=false;for(var stream of FS.streams){if(stream){FS.close(stream)}}},analyzePath(path,dontResolveLastLink=false){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret},createPath(parent,path,canRead,canWrite){parent=typeof parent=="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){if(e.errno!=20)throw e}parent=current}return current},createFile(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(canRead,canWrite);return FS.create(path,mode)},createDataFile(parent,name,data,canRead,canWrite,canOwn){var path=name;if(parent){parent=typeof parent=="string"?parent:FS.getPath(parent);path=name?PATH.join2(parent,name):parent}var mode=FS_getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){data=FS_fileDataToTypedArray(data);FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}},createDevice(parent,name,input,output){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(!!input,!!output);FS.createDevice.major??=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open(stream){stream.seekable=false},close(stream){if(output?.buffer?.length){output(10)}},read(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&!bytesRead){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.atime=Date.now()}return bytesRead},write(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(29)}}if(length){stream.node.mtime=stream.node.ctime=Date.now()}return i}});return FS.mkdev(path,mode,dev)},forceLoadFile(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(globalThis.XMLHttpRequest){abort("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else{try{obj.contents=readBinary(obj.url)}catch(e){throw new FS.ErrnoError(29)}}},createLazyFile(parent,name,url,canRead,canWrite){class LazyUint8Array{lengthKnown=false;chunks=[];get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]}setDataGetter(getter){this.getter=getter}cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))abort(`Couldn't load ${url}. Status: ${xhr.status}`);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(from,to)=>{if(from>to)abort(`invalid range (${from}, ${to}) or no bytes requested!`);if(to>datalength-1)abort(`only ${datalength} bytes available! programmer error!`);var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range",`bytes=${from}-${to}`);xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))abort(`Couldn't load ${url}. Status: ${xhr.status}`);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}return intArrayFromString(xhr.responseText??"",true)};var lazyArray=this;lazyArray.setDataGetter(chunkNum=>{var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]=="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]=="undefined")abort("doXHR failed!");return lazyArray.chunks[chunkNum]});if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed")}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true}get length(){if(!this.lengthKnown){this.cacheLength()}return this._length}get chunkSize(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize}}if(globalThis.XMLHttpRequest){if(!ENVIRONMENT_IS_WORKER)abort("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");var lazyArray=new LazyUint8Array;var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperties(node,{usedBytes:{get:function(){return this.contents.length}}});var stream_ops={};for(const[key,fn]of Object.entries(node.stream_ops)){stream_ops[key]=(...args)=>{FS.forceLoadFile(node);return fn(...args)}}function writeChunks(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size}stream_ops.read=(stream,buffer,offset,length,position)=>{FS.forceLoadFile(node);return writeChunks(stream,buffer,offset,length,position)};stream_ops.mmap=(stream,length,position,prot,flags)=>{FS.forceLoadFile(node);var ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}writeChunks(stream,HEAP8,ptr,length,position);return{ptr,allocated:true}};node.stream_ops=stream_ops;return node}};var HEAPU8;var UTF8ToString=(ptr,maxBytesToRead,ignoreNul)=>{if(!ptr)return"";var end=findStringEnd(HEAPU8,ptr,maxBytesToRead,ignoreNul);return UTF8Decoder.decode(HEAPU8.subarray(ptr,end))};var HEAPU32;var HEAP64;var SYSCALLS={currentUmask:18,calculateAt(dirfd,path,allowEmpty=false){if(PATH.isAbs(path)){return path}var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=SYSCALLS.getStreamFromFD(dirfd);dir=dirstream.path}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44)}return dir}return dir+"/"+path},writeStat(buf,stat){HEAPU32[buf>>2]=stat.dev;HEAPU32[buf+4>>2]=stat.mode;HEAPU32[buf+8>>2]=stat.nlink;HEAPU32[buf+12>>2]=stat.uid;HEAPU32[buf+16>>2]=stat.gid;HEAPU32[buf+20>>2]=stat.rdev;HEAP64[buf+24>>3]=BigInt(stat.size);HEAP32[buf+32>>2]=4096;HEAP32[buf+36>>2]=stat.blocks;var atime=stat.atimeMs??stat.atime.getTime();var mtime=stat.mtimeMs??stat.mtime.getTime();var ctime=stat.ctimeMs??stat.ctime.getTime();HEAP64[buf+40>>3]=BigInt(Math.floor(atime/1e3));HEAPU32[buf+48>>2]=Math.floor(atime%1e3*1e6);HEAP64[buf+56>>3]=BigInt(Math.floor(mtime/1e3));HEAPU32[buf+64>>2]=Math.floor(mtime%1e3*1e6);HEAP64[buf+72>>3]=BigInt(Math.floor(ctime/1e3));HEAPU32[buf+80>>2]=Math.floor(ctime%1e3*1e6);HEAP64[buf+88>>3]=BigInt(stat.ino);return 0},writeStatFs(buf,stats){HEAPU32[buf+4>>2]=stats.bsize;HEAPU32[buf+60>>2]=stats.bsize;HEAP64[buf+8>>3]=BigInt(stats.blocks);HEAP64[buf+16>>3]=BigInt(stats.bfree);HEAP64[buf+24>>3]=BigInt(stats.bavail);HEAP64[buf+32>>3]=BigInt(stats.files);HEAP64[buf+40>>3]=BigInt(stats.ffree);HEAPU32[buf+48>>2]=stats.fsid;HEAPU32[buf+64>>2]=stats.flags;HEAPU32[buf+56>>2]=stats.namelen},doMsync(addr,stream,len,flags,offset){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(flags&2){return 0}var buffer=HEAPU8.subarray(addr,addr+len);FS.msync(stream,buffer,offset,len,flags)},getStreamFromFD(fd){var stream=FS.getStreamChecked(fd);return stream},varargs:undefined,getStr(ptr){var ret=UTF8ToString(ptr);return ret}};var HEAP16;function ___syscall_fcntl64(fd,cmd,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(cmd){case 0:{var arg=syscallGetVarargI();if(arg<0){return-28}while(FS.streams[arg]){arg++}var newStream;newStream=FS.dupStream(stream,arg);return newStream.fd}case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=syscallGetVarargI();var mask=289792;stream.flags=stream.flags&~mask|arg&mask;return 0}case 12:{var arg=syscallGetVarargP();var offset=0;HEAP16[arg+offset>>1]=2;return 0}case 13:case 14:return 0}return-28}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite);function ___syscall_getdents64(fd,dirp,count){try{var stream=SYSCALLS.getStreamFromFD(fd);stream.getdents||=FS.readdir(stream.path);var struct_size=280;var pos=0;var off=FS.llseek(stream,0,1);var startIdx=Math.floor(off/struct_size);var endIdx=Math.min(stream.getdents.length,startIdx+Math.floor(count/struct_size));for(var idx=startIdx;idx<endIdx;idx++){var id;var type;var name=stream.getdents[idx];if(name==="."){id=stream.node.id;type=4}else if(name===".."){var lookup=FS.lookupPath(stream.path,{parent:true});id=lookup.node.id;type=4}else{var child;try{child=FS.lookupNode(stream.node,name)}catch(e){if(e?.errno===28){continue}throw e}id=child.id;type=FS.isChrdev(child.mode)?2:FS.isDir(child.mode)?4:FS.isLink(child.mode)?10:8}HEAP64[dirp+pos>>3]=BigInt(id);HEAP64[dirp+pos+8>>3]=BigInt((idx+1)*struct_size);HEAP16[dirp+pos+16>>1]=280;HEAP8[dirp+pos+18]=type;stringToUTF8(name,dirp+pos+19,256);pos+=struct_size}FS.llseek(stream,idx*struct_size,0);return pos}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_ioctl(fd,op,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(op){case 21509:{if(!stream.tty)return-59;return 0}case 21505:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tcgets){var termios=stream.tty.ops.ioctl_tcgets(stream);var argp=syscallGetVarargP();HEAP32[argp>>2]=termios.c_iflag||0;HEAP32[argp+4>>2]=termios.c_oflag||0;HEAP32[argp+8>>2]=termios.c_cflag||0;HEAP32[argp+12>>2]=termios.c_lflag||0;for(var i=0;i<32;i++){HEAP8[argp+i+17]=termios.c_cc[i]||0}return 0}return 0}case 21510:case 21511:case 21512:{if(!stream.tty)return-59;return 0}case 21506:case 21507:case 21508:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tcsets){var argp=syscallGetVarargP();var c_iflag=HEAP32[argp>>2];var c_oflag=HEAP32[argp+4>>2];var c_cflag=HEAP32[argp+8>>2];var c_lflag=HEAP32[argp+12>>2];var c_cc=[];for(var i=0;i<32;i++){c_cc.push(HEAP8[argp+i+17])}return stream.tty.ops.ioctl_tcsets(stream.tty,op,{c_iflag,c_oflag,c_cflag,c_lflag,c_cc})}return 0}case 21519:{if(!stream.tty)return-59;var argp=syscallGetVarargP();HEAP32[argp>>2]=0;return 0}case 21520:{if(!stream.tty)return-59;return-28}case 21537:case 21531:{var argp=syscallGetVarargP();return FS.ioctl(stream,op,argp)}case 21523:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tiocgwinsz){var winsize=stream.tty.ops.ioctl_tiocgwinsz(stream.tty);var argp=syscallGetVarargP();HEAP16[argp>>1]=winsize[0];HEAP16[argp+2>>1]=winsize[1]}return 0}case 21524:{if(!stream.tty)return-59;return 0}case 21515:{if(!stream.tty)return-59;return 0}default:return-28}}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_openat(dirfd,path,flags,varargs){SYSCALLS.varargs=varargs;try{path=SYSCALLS.getStr(path);path=SYSCALLS.calculateAt(dirfd,path);var mode=varargs?syscallGetVarargI():0;if(flags&64){mode&=~SYSCALLS.currentUmask}return FS.open(path,flags,mode).fd}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_rmdir(path){try{path=SYSCALLS.getStr(path);FS.rmdir(path);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_stat64(path,buf){try{path=SYSCALLS.getStr(path);return SYSCALLS.writeStat(buf,FS.stat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_unlinkat(dirfd,path,flags){try{path=SYSCALLS.getStr(path);path=SYSCALLS.calculateAt(dirfd,path);if(!flags){FS.unlink(path)}else if(flags===512){FS.rmdir(path)}else{return-28}return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var __abort_js=()=>abort("");var _emscripten_get_now=()=>performance.now();var _emscripten_date_now=()=>Date.now();var nowIsMonotonic=1;var checkWasiClock=clock_id=>clock_id>=0&&clock_id<=3;var INT53_MAX=9007199254740992;var INT53_MIN=-9007199254740992;var bigintToI53Checked=num=>num<INT53_MIN||num>INT53_MAX?NaN:Number(num);function _clock_time_get(clk_id,ignored_precision,ptime){ignored_precision=bigintToI53Checked(ignored_precision);if(!checkWasiClock(clk_id)){return 28}var now;if(clk_id===0){now=_emscripten_date_now()}else if(nowIsMonotonic){now=_emscripten_get_now()}else{return 52}var nsec=Math.round(now*1e6);HEAP64[ptime>>3]=BigInt(nsec);return 0}var getHeapMax=()=>2147483648;var alignMemory=(size,alignment)=>Math.ceil(size/alignment)*alignment;var growMemory=size=>{var oldHeapSize=wasmMemory.buffer.byteLength;var pages=(size-oldHeapSize+65535)/65536|0;try{wasmMemory.grow(pages);updateMemoryViews();return 1}catch(e){}};var _emscripten_resize_heap=requestedSize=>{var oldSize=HEAPU8.length;requestedSize>>>=0;var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignMemory(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false};var ENV={};var getExecutableName=()=>thisProgram;var getEnvStrings=()=>{if(!getEnvStrings.strings){var lang=(globalThis.navigator?.language??"C").replace("-","_")+".UTF-8";var env={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:lang,_:getExecutableName()};for(var x in ENV){if(ENV[x]===undefined)delete env[x];else env[x]=ENV[x]}var strings=[];for(var x in env){strings.push(`${x}=${env[x]}`)}getEnvStrings.strings=strings}return getEnvStrings.strings};var _environ_get=(__environ,environ_buf)=>{var bufSize=0;var envp=0;for(var string of getEnvStrings()){var ptr=environ_buf+bufSize;HEAPU32[__environ+envp>>2]=ptr;bufSize+=stringToUTF8(string,ptr,Infinity)+1;envp+=4}return 0};var _environ_sizes_get=(penviron_count,penviron_buf_size)=>{var strings=getEnvStrings();HEAPU32[penviron_count>>2]=strings.length;var bufSize=0;for(var string of strings){bufSize+=lengthBytesUTF8(string)+1}HEAPU32[penviron_buf_size>>2]=bufSize;return 0};var keepRuntimeAlive=()=>true;var _proc_exit=code=>{EXITSTATUS=code;if(!keepRuntimeAlive()){ABORT=true}quit_(code,new ExitStatus(code))};var exitJS=(status,implicit)=>{EXITSTATUS=status;_proc_exit(status)};var _exit=exitJS;function _fd_close(fd){try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doReadv=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];iov+=8;try{var curr=FS.read(stream,HEAP8,ptr,len,offset)}catch(e){if(ret>0&&e instanceof FS.ErrnoError&&(e.errno==6||e.errno==6)){break}throw e}if(curr<0)return-1;ret+=curr;if(curr<len)break;if(typeof offset!="undefined"){offset+=curr}}return ret};function _fd_read(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doReadv(stream,iov,iovcnt);HEAPU32[pnum>>2]=num;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _fd_seek(fd,offset,whence,newOffset){offset=bigintToI53Checked(offset);try{if(isNaN(offset))return 22;var stream=SYSCALLS.getStreamFromFD(fd);FS.llseek(stream,offset,whence);HEAP64[newOffset>>3]=BigInt(stream.position);if(stream.getdents&&!offset&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doWritev=(stream,iov,iovcnt,offset)=>{if(iovcnt==1){return FS.write(stream,HEAP8,HEAPU32[iov>>2],HEAPU32[iov+4>>2],offset)}var total=0;for(var i=0,p=iov;i<iovcnt;i++,p+=8){total+=HEAPU32[p+4>>2]}var view=new Uint8Array(total);var voff=0;for(var i=0;i<iovcnt;i++,iov+=8){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];view.set(HEAPU8.subarray(ptr,ptr+len),voff);voff+=len}return FS.write(stream,view,0,total,offset)};function _fd_write(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doWritev(stream,iov,iovcnt);HEAPU32[pnum>>2]=num;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var FS_createPath=(...args)=>FS.createPath(...args);var FS_unlink=(...args)=>FS.unlink(...args);var FS_createLazyFile=(...args)=>FS.createLazyFile(...args);var FS_createDevice=(...args)=>FS.createDevice(...args);FS.createPreloadedFile=FS_createPreloadedFile;FS.preloadFile=FS_preloadFile;FS.staticInit();if(ENVIRONMENT_IS_NODE){NODEFS.staticInit()}{if(Module["print"])out=Module["print"];if(Module["printErr"])err=Module["printErr"];if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"]}Module["addRunDependency"]=addRunDependency;Module["removeRunDependency"]=removeRunDependency;Module["UTF8ToString"]=UTF8ToString;Module["stringToUTF8"]=stringToUTF8;Module["lengthBytesUTF8"]=lengthBytesUTF8;Module["FS_preloadFile"]=FS_preloadFile;Module["FS_unlink"]=FS_unlink;Module["FS_createPath"]=FS_createPath;Module["FS_createDevice"]=FS_createDevice;Module["FS"]=FS;Module["FS_createDataFile"]=FS_createDataFile;Module["FS_createLazyFile"]=FS_createLazyFile;Module["NODEFS"]=NODEFS;var _sp_initialize,_sp_sample_rate_get,_sp_terminate,_free,_sp_version,_sp_synthesize,_sp_audio_data,_sp_audio_samples,_sp_events_data,_sp_events_count,_sp_event_size,_sp_strings_data,_sp_text_to_phonemes,_sp_voice_count,_sp_voice_name,_sp_voice_identifier,_sp_voice_languages,_sp_voice_gender,_sp_voice_age,_sp_set_voice_by_name,_sp_set_voice_by_properties,_sp_current_voice_name,_sp_current_voice_languages,_sp_dictionary_name,_sp_dictionary_loaded,_sp_set_parameter,_sp_get_parameter,_sp_set_punctuation_list,_malloc,memory,__indirect_function_table,wasmMemory;function assignWasmExports(wasmExports){_sp_initialize=Module["_sp_initialize"]=wasmExports["u"];_sp_sample_rate_get=Module["_sp_sample_rate_get"]=wasmExports["v"];_sp_terminate=Module["_sp_terminate"]=wasmExports["w"];_free=Module["_free"]=wasmExports["x"];_sp_version=Module["_sp_version"]=wasmExports["y"];_sp_synthesize=Module["_sp_synthesize"]=wasmExports["z"];_sp_audio_data=Module["_sp_audio_data"]=wasmExports["A"];_sp_audio_samples=Module["_sp_audio_samples"]=wasmExports["B"];_sp_events_data=Module["_sp_events_data"]=wasmExports["C"];_sp_events_count=Module["_sp_events_count"]=wasmExports["D"];_sp_event_size=Module["_sp_event_size"]=wasmExports["E"];_sp_strings_data=Module["_sp_strings_data"]=wasmExports["F"];_sp_text_to_phonemes=Module["_sp_text_to_phonemes"]=wasmExports["G"];_sp_voice_count=Module["_sp_voice_count"]=wasmExports["H"];_sp_voice_name=Module["_sp_voice_name"]=wasmExports["I"];_sp_voice_identifier=Module["_sp_voice_identifier"]=wasmExports["J"];_sp_voice_languages=Module["_sp_voice_languages"]=wasmExports["K"];_sp_voice_gender=Module["_sp_voice_gender"]=wasmExports["L"];_sp_voice_age=Module["_sp_voice_age"]=wasmExports["M"];_sp_set_voice_by_name=Module["_sp_set_voice_by_name"]=wasmExports["N"];_sp_set_voice_by_properties=Module["_sp_set_voice_by_properties"]=wasmExports["O"];_sp_current_voice_name=Module["_sp_current_voice_name"]=wasmExports["P"];_sp_current_voice_languages=Module["_sp_current_voice_languages"]=wasmExports["Q"];_sp_dictionary_name=Module["_sp_dictionary_name"]=wasmExports["R"];_sp_dictionary_loaded=Module["_sp_dictionary_loaded"]=wasmExports["S"];_sp_set_parameter=Module["_sp_set_parameter"]=wasmExports["T"];_sp_get_parameter=Module["_sp_get_parameter"]=wasmExports["U"];_sp_set_punctuation_list=Module["_sp_set_punctuation_list"]=wasmExports["V"];_malloc=Module["_malloc"]=wasmExports["W"];memory=wasmMemory=wasmExports["s"];__indirect_function_table=wasmExports["__indirect_function_table"]}var wasmImports={c:___syscall_fcntl64,m:___syscall_getdents64,g:___syscall_ioctl,d:___syscall_openat,k:___syscall_rmdir,j:___syscall_stat64,l:___syscall_unlinkat,q:__abort_js,n:_clock_time_get,h:_emscripten_date_now,i:_emscripten_resize_heap,p:_environ_get,e:_environ_sizes_get,r:_exit,a:_fd_close,f:_fd_read,o:_fd_seek,b:_fd_write};async function run(){preRun();if(runDependencies){await resolveRunDependencies()}if(ABORT)return;initRuntime();postRun()}var wasmExports;wasmExports=await createWasm();await run();
;return Module}

const manifest={"version":1,"espeakVersion":"1.52.0","encoding":"gzip","core":{"file":"core.bin.gz","size":725529,"entries":[{"path":"intonations","size":2312},{"path":"lang/aav/vi","size":111},{"path":"lang/aav/vi-VN-x-central","size":143},{"path":"lang/aav/vi-VN-x-south","size":142},{"path":"lang/art/eo","size":41},{"path":"lang/art/ia","size":29},{"path":"lang/art/io","size":50},{"path":"lang/art/jbo","size":69},{"path":"lang/art/lfn","size":135},{"path":"lang/art/piqd","size":56},{"path":"lang/art/py","size":140},{"path":"lang/art/qdb","size":57},{"path":"lang/art/qya","size":173},{"path":"lang/art/sjn","size":175},{"path":"lang/art/xex","size":103},{"path":"lang/azc/nci","size":114},{"path":"lang/bat/lt","size":28},{"path":"lang/bat/ltg","size":312},{"path":"lang/bat/lv","size":229},{"path":"lang/bnt/sw","size":41},{"path":"lang/bnt/tn","size":42},{"path":"lang/ccs/ka","size":124},{"path":"lang/cel/cy","size":37},{"path":"lang/cel/ga","size":66},{"path":"lang/cel/gd","size":51},{"path":"lang/cus/om","size":39},{"path":"lang/dra/kn","size":55},{"path":"lang/dra/ml","size":57},{"path":"lang/dra/ta","size":51},{"path":"lang/dra/te","size":70},{"path":"lang/esx/kl","size":30},{"path":"lang/eu","size":54},{"path":"lang/gmq/da","size":43},{"path":"lang/gmq/fo","size":104},{"path":"lang/gmq/is","size":27},{"path":"lang/gmq/nb","size":87},{"path":"lang/gmq/sv","size":25},{"path":"lang/gmw/af","size":123},{"path":"lang/gmw/de","size":42},{"path":"lang/gmw/en","size":140},{"path":"lang/gmw/en-029","size":335},{"path":"lang/gmw/en-GB-scotland","size":295},{"path":"lang/gmw/en-GB-x-gbclan","size":238},{"path":"lang/gmw/en-GB-x-gbcwmd","size":188},{"path":"lang/gmw/en-GB-x-rp","size":249},{"path":"lang/gmw/en-Shaw","size":119},{"path":"lang/gmw/en-US","size":257},{"path":"lang/gmw/en-US-nyc","size":271},{"path":"lang/gmw/lb","size":31},{"path":"lang/gmw/nl","size":23},{"path":"lang/grk/el","size":23},{"path":"lang/grk/grc","size":99},{"path":"lang/inc/as","size":42},{"path":"lang/inc/bn","size":25},{"path":"lang/inc/bpy","size":39},{"path":"lang/inc/gu","size":42},{"path":"lang/inc/hi","size":23},{"path":"lang/inc/kok","size":26},{"path":"lang/inc/mr","size":41},{"path":"lang/inc/ne","size":37},{"path":"lang/inc/or","size":39},{"path":"lang/inc/pa","size":25},{"path":"lang/inc/sd","size":66},{"path":"lang/inc/si","size":55},{"path":"lang/inc/ur","size":94},{"path":"lang/ine/hy","size":61},{"path":"lang/ine/hyw","size":365},{"path":"lang/ine/sq","size":103},{"path":"lang/ira/fa","size":90},{"path":"lang/ira/fa-Latn","size":269},{"path":"lang/ira/ku","size":40},{"path":"lang/iro/chr","size":569},{"path":"lang/itc/la","size":297},{"path":"lang/jpx/ja","size":52},{"path":"lang/ko","size":51},{"path":"lang/map/haw","size":42},{"path":"lang/miz/mto","size":183},{"path":"lang/myn/quc","size":210},{"path":"lang/poz/id","size":134},{"path":"lang/poz/mi","size":367},{"path":"lang/poz/ms","size":430},{"path":"lang/qu","size":88},{"path":"lang/roa/an","size":27},{"path":"lang/roa/ca","size":38},{"path":"lang/roa/ca-ba","size":80},{"path":"lang/roa/ca-nw","size":73},{"path":"lang/roa/ca-va","size":81},{"path":"lang/roa/es","size":63},{"path":"lang/roa/es-419","size":167},{"path":"lang/roa/fr","size":79},{"path":"lang/roa/fr-BE","size":84},{"path":"lang/roa/fr-CH","size":86},{"path":"lang/roa/ht","size":140},{"path":"lang/roa/it","size":109},{"path":"lang/roa/pap","size":62},{"path":"lang/roa/pt","size":95},{"path":"lang/roa/pt-BR","size":109},{"path":"lang/roa/ro","size":26},{"path":"lang/sai/gn","size":47},{"path":"lang/sem/am","size":41},{"path":"lang/sem/ar","size":50},{"path":"lang/sem/he","size":40},{"path":"lang/sem/mt","size":41},{"path":"lang/sem/ti","size":93},{"path":"lang/sit/cmn","size":686},{"path":"lang/sit/cmn-Latn-pinyin","size":161},{"path":"lang/sit/hak","size":128},{"path":"lang/sit/my","size":56},{"path":"lang/sit/yue","size":194},{"path":"lang/sit/yue-Latn-jyutping","size":213},{"path":"lang/tai/shn","size":92},{"path":"lang/tai/th","size":37},{"path":"lang/trk/az","size":45},{"path":"lang/trk/ba","size":25},{"path":"lang/trk/cv","size":40},{"path":"lang/trk/kaa","size":28},{"path":"lang/trk/kk","size":40},{"path":"lang/trk/ky","size":43},{"path":"lang/trk/nog","size":39},{"path":"lang/trk/tk","size":25},{"path":"lang/trk/tr","size":25},{"path":"lang/trk/tt","size":23},{"path":"lang/trk/ug","size":24},{"path":"lang/trk/uz","size":39},{"path":"lang/urj/et","size":237},{"path":"lang/urj/fi","size":237},{"path":"lang/urj/hu","size":73},{"path":"lang/urj/smj","size":45},{"path":"lang/zle/be","size":52},{"path":"lang/zle/ru","size":57},{"path":"lang/zle/ru-LV","size":280},{"path":"lang/zle/ru-cl","size":91},{"path":"lang/zle/uk","size":97},{"path":"lang/zls/bg","size":111},{"path":"lang/zls/bs","size":230},{"path":"lang/zls/hr","size":262},{"path":"lang/zls/mk","size":28},{"path":"lang/zls/sl","size":43},{"path":"lang/zls/sr","size":250},{"path":"lang/zlw/cs","size":23},{"path":"lang/zlw/pl","size":38},{"path":"lang/zlw/sk","size":24},{"path":"phondata","size":554740},{"path":"phonindex","size":43316},{"path":"phontab","size":58652},{"path":"voices/!v/Alex","size":128},{"path":"voices/!v/Alicia","size":474},{"path":"voices/!v/Andrea","size":357},{"path":"voices/!v/Andy","size":320},{"path":"voices/!v/Annie","size":315},{"path":"voices/!v/AnxiousAndy","size":361},{"path":"voices/!v/Demonic","size":3858},{"path":"voices/!v/Denis","size":305},{"path":"voices/!v/Diogo","size":379},{"path":"voices/!v/Gene","size":281},{"path":"voices/!v/Gene2","size":283},{"path":"voices/!v/Henrique","size":381},{"path":"voices/!v/Hugo","size":378},{"path":"voices/!v/Jacky","size":267},{"path":"voices/!v/Lee","size":338},{"path":"voices/!v/Marco","size":467},{"path":"voices/!v/Mario","size":270},{"path":"voices/!v/Michael","size":270},{"path":"voices/!v/Mike","size":112},{"path":"voices/!v/Mr serious","size":3193},{"path":"voices/!v/Nguyen","size":280},{"path":"voices/!v/Reed","size":202},{"path":"voices/!v/RicishayMax","size":233},{"path":"voices/!v/RicishayMax2","size":435},{"path":"voices/!v/RicishayMax3","size":435},{"path":"voices/!v/Storm","size":420},{"path":"voices/!v/Tweaky","size":3189},{"path":"voices/!v/UniRobot","size":417},{"path":"voices/!v/adam","size":75},{"path":"voices/!v/anika","size":493},{"path":"voices/!v/anikaRobot","size":512},{"path":"voices/!v/announcer","size":300},{"path":"voices/!v/antonio","size":381},{"path":"voices/!v/aunty","size":358},{"path":"voices/!v/belinda","size":340},{"path":"voices/!v/benjamin","size":201},{"path":"voices/!v/boris","size":224},{"path":"voices/!v/caleb","size":57},{"path":"voices/!v/croak","size":93},{"path":"voices/!v/david","size":112},{"path":"voices/!v/ed","size":287},{"path":"voices/!v/edward","size":151},{"path":"voices/!v/edward2","size":152},{"path":"voices/!v/f1","size":324},{"path":"voices/!v/f2","size":357},{"path":"voices/!v/f3","size":375},{"path":"voices/!v/f4","size":350},{"path":"voices/!v/f5","size":432},{"path":"voices/!v/fast","size":149},{"path":"voices/!v/grandma","size":263},{"path":"voices/!v/grandpa","size":256},{"path":"voices/!v/gustave","size":253},{"path":"voices/!v/ian","size":3168},{"path":"voices/!v/iven","size":261},{"path":"voices/!v/iven2","size":279},{"path":"voices/!v/iven3","size":262},{"path":"voices/!v/iven4","size":261},{"path":"voices/!v/john","size":3186},{"path":"voices/!v/kaukovalta","size":361},{"path":"voices/!v/klatt","size":38},{"path":"voices/!v/klatt2","size":38},{"path":"voices/!v/klatt3","size":39},{"path":"voices/!v/klatt4","size":39},{"path":"voices/!v/klatt5","size":39},{"path":"voices/!v/klatt6","size":39},{"path":"voices/!v/linda","size":350},{"path":"voices/!v/m1","size":335},{"path":"voices/!v/m2","size":264},{"path":"voices/!v/m3","size":300},{"path":"voices/!v/m4","size":290},{"path":"voices/!v/m5","size":262},{"path":"voices/!v/m6","size":188},{"path":"voices/!v/m7","size":254},{"path":"voices/!v/m8","size":284},{"path":"voices/!v/marcelo","size":251},{"path":"voices/!v/max","size":225},{"path":"voices/!v/michel","size":404},{"path":"voices/!v/miguel","size":382},{"path":"voices/!v/mike2","size":188},{"path":"voices/!v/norbert","size":3189},{"path":"voices/!v/pablo","size":3142},{"path":"voices/!v/paul","size":284},{"path":"voices/!v/pedro","size":352},{"path":"voices/!v/quincy","size":354},{"path":"voices/!v/rob","size":265},{"path":"voices/!v/robert","size":274},{"path":"voices/!v/robosoft","size":451},{"path":"voices/!v/robosoft2","size":454},{"path":"voices/!v/robosoft3","size":455},{"path":"voices/!v/robosoft4","size":447},{"path":"voices/!v/robosoft5","size":445},{"path":"voices/!v/robosoft6","size":287},{"path":"voices/!v/robosoft7","size":410},{"path":"voices/!v/robosoft8","size":243},{"path":"voices/!v/sandro","size":530},{"path":"voices/!v/shelby","size":280},{"path":"voices/!v/steph","size":364},{"path":"voices/!v/steph2","size":367},{"path":"voices/!v/steph3","size":377},{"path":"voices/!v/travis","size":383},{"path":"voices/!v/victor","size":253},{"path":"voices/!v/whisper","size":186},{"path":"voices/!v/whisperf","size":392},{"path":"voices/!v/zac","size":275}]},"dictionaries":{"ar":{"file":"ar_dict.gz","size":478165},"cmn":{"file":"cmn_dict.gz","size":1566347},"de":{"file":"de_dict.gz","size":69277},"en":{"file":"en_dict.gz","size":168204},"eo":{"file":"eo_dict.gz","size":4666},"es":{"file":"es_dict.gz","size":49285},"fa":{"file":"fa_dict.gz","size":292907},"fi":{"file":"fi_dict.gz","size":43928},"fr":{"file":"fr_dict.gz","size":63727},"is":{"file":"is_dict.gz","size":44354},"it":{"file":"it_dict.gz","size":154408},"ko":{"file":"ko_dict.gz","size":47523},"ms":{"file":"ms_dict.gz","size":53541},"nl":{"file":"nl_dict.gz","size":65396},"no":{"file":"no_dict.gz","size":4178},"or":{"file":"or_dict.gz","size":89246},"pt":{"file":"pt_dict.gz","size":76389},"ro":{"file":"ro_dict.gz","size":68538},"sv":{"file":"sv_dict.gz","size":47836},"sw":{"file":"sw_dict.gz","size":47804},"vi":{"file":"vi_dict.gz","size":52608},"yue":{"file":"yue_dict.gz","size":563571}}};
const files={"core.bin.gz":asset("embedded-espeak-1.bin"),"ar_dict.gz":asset("embedded-espeak-2.bin"),"cmn_dict.gz":asset("embedded-espeak-3.bin"),"de_dict.gz":asset("embedded-espeak-4.bin"),"en_dict.gz":asset("embedded-espeak-5.bin"),"eo_dict.gz":asset("embedded-espeak-6.bin"),"es_dict.gz":asset("embedded-espeak-7.bin"),"fa_dict.gz":asset("embedded-espeak-8.bin"),"fi_dict.gz":asset("embedded-espeak-9.bin"),"fr_dict.gz":asset("embedded-espeak-10.bin"),"is_dict.gz":asset("embedded-espeak-11.bin"),"it_dict.gz":asset("embedded-espeak-12.bin"),"ko_dict.gz":asset("embedded-espeak-13.bin"),"ms_dict.gz":asset("embedded-espeak-14.bin"),"nl_dict.gz":asset("embedded-espeak-15.bin"),"no_dict.gz":asset("embedded-espeak-16.bin"),"or_dict.gz":asset("embedded-espeak-17.bin"),"pt_dict.gz":asset("embedded-espeak-18.bin"),"ro_dict.gz":asset("embedded-espeak-19.bin"),"sv_dict.gz":asset("embedded-espeak-20.bin"),"sw_dict.gz":asset("embedded-espeak-21.bin"),"vi_dict.gz":asset("embedded-espeak-22.bin"),"yue_dict.gz":asset("embedded-espeak-23.bin")};
const wasm=asset("embedded-espeak-24.bin");
return async function createEmbeddedEspeak() {
  const wasmBinary=new Uint8Array(await decompressData(wasm).arrayBuffer());
  const module=await createEspeakModule({wasmBinary,locateFile:file=>file});
  const source={manifest,read:async file=>new Uint8Array(await decompressData(files[file]).arrayBuffer())};
  const loader=new DataLoader(module,source);
  await loader.loadCore();
  await loader.loadDictionary(DEFAULT_LANGUAGE);
  const engine=Espeak.create(module,{loader});
  engine.setVoice("en-us");
  return engine;
};
})();

const italianReadingConfig={processor:'longestMatch'};
let italianLexiconRequest;

function decompressData(payload) {
  const compressed=new ReadableStream({
    async start(controller) {
      controller.enqueue(payload instanceof URL ? await readAsset(payload) : decodeBase64(payload));
      controller.close();
    },
  });
  return new Response(compressed.pipeThrough(new DecompressionStream("gzip")));
}

function decompressTextData(payload) {
  return decompressData(payload).text();
}

function loadItalianLexicon() {
  if(!italianLexiconRequest) {
    italianLexiconRequest=decompressTextData(italianLexiconPayload)
      .then(text=>addDictionaryTypographyAliases(Object.assign(Object.create(null),Object.fromEntries(JSON.parse(text)))));
  }
  return italianLexiconRequest;
}

const kuromojiURL='https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/';
const espeakURL='https://cdn.jsdelivr.net/npm/@spelling-creator/spellophone@0.2.1/dist/browser.js';
let japaneseTokenizerRequest;
let espeakRequest;

function within(promise,milliseconds,message) {
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);});
  return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
}

function loadJapaneseTokenizer() {
  if(!japaneseTokenizerRequest) {
    japaneseTokenizerRequest=within(createEmbeddedJapaneseTokenizer().catch(()=>new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=kuromojiURL+'build/kuromoji.min.js';
      script.crossOrigin='anonymous';
      script.integrity='sha384-BZVO+/aJTNGjiUcObWTXC0sX0QJ8fjVK0lJ4E93zqHpSHKfAiZVa27BwLfGoAY+O';
      script.onerror=()=>{script.remove();reject(new Error('일본어 분석기를 불러오지 못했습니다.'));};
      script.onload=()=>window.kuromoji.builder({dicPath:kuromojiURL+'dict/'}).build((error,tokenizer)=>{
        if(error) {script.remove();reject(new Error('일본어 분석 사전을 불러오지 못했습니다.')); }
        else resolve(tokenizer);
      });
      document.head.append(script);
    })),18000,'일본어 분석 사전의 응답이 늦습니다.').catch(error=>{japaneseTokenizerRequest=undefined;throw error;});
  }
  return japaneseTokenizerRequest;
}

async function readJapanese(input) {
  const hasHan=japaneseHan.test(input);
  const tokenizer=await loadJapaneseTokenizer().catch(()=>null);
  const lexicon=hasHan?await (tokenizer?loadJapaneseLexicon():loadJapaneseOfflineLexicon()).catch(()=>null):null;
  const chunks=japaneseMorphologyChunks(input,tokenizer,lexicon);
  const withOfflineNote=readings=>tokenizer?readings:readings.map(chunk=>
    chunk.ipa?{...chunk,offlineJapanese:true}:chunk);
  if(!chunks.some(chunk=>chunk.unknown && japaneseHan.test(chunk.original)))return withOfflineNote(chunks);
  let lookup;
  try {lookup=await loadDictionary('japanese','');}
  catch {return withOfflineNote(chunks);}
  return withOfflineNote(japaneseMorphologyChunks(input,tokenizer,lexicon,lookup));
}

const espeakVoices={
  arabic:'ar', cantonese:'yue', dutch:'nl', english:'en-us', esperanto:'eo', finnish:'fi',
  french:'fr-fr', german:'de', icelandic:'is', italian:'it', korean:'ko', malay:'ms', mandarin:'cmn',
  norwegian:'nb', odia:'or', persian:'fa', portuguese:'pt-br', romanian:'ro', spanish:'es',
  swahili:'sw', swedish:'sv', vietnamese:'vi-vn-x-south',
};
const espeakVariants={
  english:{UK:'en-gb'}, french:{QC:'fr-fr'}, spanish:{MX:'es-419'},
  vietnamese:{C:'vi-vn-x-central',N:'vi',S:'vi-vn-x-south'},
};

function loadEspeak() {
  if(!espeakRequest) {
    espeakRequest=within(createEmbeddedEspeak().catch(()=>
      import(espeakURL).then(module=>module.createEspeak({cdn:'jsdelivr'}))),15000,'발음 엔진을 불러오지 못했습니다.')
      .catch(error=>{espeakRequest=undefined;throw error;});
  }
  return espeakRequest;
}

function espeakWordReading(raw,source,voice) {
  const switched=raw.trim().match(/^\(([a-z]{2,3}(?:-[a-z0-9]+)*)\)([^()[\]{}]+)\([a-z]{2,3}(?:-[a-z0-9]+)*\)$/iu);
  let language=source;
  if(switched) {
    const [,actual,ipa]=switched;
    const base=actual.toLowerCase().split('-')[0];
    language=Object.keys(espeakVoices).find(id=>espeakVoices[id].split('-')[0]===base);
    if(!language)return null;
    raw=ipa;
    voice=actual;
  }
  const ipa=normalizeEspeakReading(raw,language,voice).trim().replace(/[_\r\n]+/gu,' ');
  const phones=tokenizeIPA(ipa,language);
  if(!phones.some(phone=>phone.sound)||/[()[\]{}]/u.test(ipa)||switched&&phones.unknownPhones.size)return null;
  return {ipa,...(language===source?{}:{source:language})};
}

async function fillMissingReadings(chunks,source,variant) {
  const voice=espeakVariants[source]?.[variant] ?? espeakVoices[source];
  if(!voice || !chunks.some(chunk=>chunk.unknown)) return chunks;
  let engine;
  try {
    engine=await loadEspeak();
    await within(engine.loadVoice(voice),12000,'발음 데이터를 불러오지 못했습니다.');
    engine.setVoice(voice);
  } catch {
    return chunks;
  }
  return chunks.flatMap(chunk=>{
    if(!chunk.unknown) return [chunk];
    return splitMissingText(chunk.original).map(piece=>{
      if(!piece.unknown || !sourceScriptMatches(piece.original,source)) return piece;
      if(source==='arabic' && !/[\u064b-\u0652]/u.test(piece.original)) return piece;
      let reading;
      try {reading=espeakWordReading(engine.phonemes(piece.original),source,voice);}
      catch {return piece;}
      return reading?{original:piece.original,...reading,fallback:true}:piece;
    });
  });
}

function sourceScriptMatches(text,source) {
  const scripts={
    arabic:/^[\p{Script=Arabic}\p{M}'’\-]+$/u, persian:/^[\p{Script=Arabic}\p{M}'’\-\u200c]+$/u,
    odia:/^[\p{Script=Oriya}\p{M}'’\-\u200c\u200d]+$/u, korean:/^\p{Script=Hangul}+$/u,
    mandarin:/^\p{Script=Han}+$/u, cantonese:/^\p{Script=Han}+$/u,
  };
  return (scripts[source] ?? /^[\p{Script=Latin}\p{M}'’\-]+$/u).test(text);
}

function splitMissingText(text) {
  return Array.from(text.matchAll(/\p{L}[\p{L}\p{M}\u200c\u200d]*(?:['’\-][\p{L}\p{M}]+)*|[^\p{L}]+/gu),([original])=>(
    /\p{L}/u.test(original) ? {original,unknown:true} : {original}
  ));
}

function hasKnownSound(ipa,source) {
  return tokenizeIPA(ipa,source).some(token=>token.sound);
}

// Cached dictionaries from the pinned IPA-Translator release. Cantonese additions are from the LSHK Jyutping table (CC BY 4.0), credited in chinese-data.js.
const offlineSourceDictionaries={"khmer":asset("offline-sources-data-1.bin"),"jamaican":asset("offline-sources-data-2.bin"),"japanese":asset("offline-sources-data-3.bin"),"cantonese":asset("offline-sources-data-4.bin"),"./json/zh_hans.json":asset("offline-sources-data-5.bin"),"./json/zh_hant.json":asset("offline-sources-data-6.bin")};

// Pronunciations from the pinned IPA-Translator dictionaries.
// The frequency subsets use word counts from Tatoeba, CC BY 2.0 FR. https://tatoeba.org/en/downloads
const additionalOfflineDictionaries={"./json/en_UK.json":asset("offline-dictionary-tiers-data-1.bin"),"./json/vi_C.json":asset("offline-dictionary-tiers-data-2.bin"),"./json/vi_N.json":asset("offline-dictionary-tiers-data-3.bin"),"./json/vi_S.json":asset("offline-dictionary-tiers-data-4.bin"),"./json/ko.json":asset("offline-dictionary-tiers-data-5.bin"),"./json/eo.json":asset("offline-dictionary-tiers-data-6.bin"),"./json/fa.json":asset("offline-dictionary-tiers-data-7.bin"),"./json/is.json":asset("offline-dictionary-tiers-data-8.bin"),"./json/ma.json":asset("offline-dictionary-tiers-data-9.bin"),"./json/nb.json":asset("offline-dictionary-tiers-data-10.bin"),"./json/or.json":asset("offline-dictionary-tiers-data-11.bin"),"./json/pt_BR.json":asset("offline-dictionary-tiers-data-12.bin"),"./json/ro.json":asset("offline-dictionary-tiers-data-13.bin"),"./json/sw.json":asset("offline-dictionary-tiers-data-14.bin"),"./json/sv.json":asset("offline-dictionary-tiers-data-15.bin")};
const frequentOfflineDictionaries={"./json/en_US.json":asset("offline-dictionary-tiers-data-16.bin"),"./json/fr_FR.json":asset("offline-dictionary-tiers-data-17.bin"),"./json/fr_QC.json":asset("offline-dictionary-tiers-data-18.bin"),"./json/es_ES.json":asset("offline-dictionary-tiers-data-19.bin"),"./json/es_MX.json":asset("offline-dictionary-tiers-data-20.bin"),"./json/ar.json":asset("offline-dictionary-tiers-data-21.bin"),"./json/fi.json":asset("offline-dictionary-tiers-data-22.bin"),"./json/de.json":asset("offline-dictionary-tiers-data-23.bin"),"./json/nl.json":asset("offline-dictionary-tiers-data-24.bin")};

// Arabic pronunciations mined by WikiPron from Wiktionary, CC BY-SA 4.0. Filtered and normalized.
// https://github.com/CUNY-CL/wikipron/blob/d282e848a211ea31cfd730f0ced8bc8cdab9e83d/data/scrape/tsv/ara_arab_broad.tsv
const arabicSupplementPayload=asset("arabic-supplement-data-1.bin");

// Adapted English Wiktionary Jawi forms (CC BY-SA 4.0) via Kaikki.org, paired with Malay IPA-Translator entries, Wiktionary IPA and marked eSpeak NG estimates.
// https://huggingface.co/datasets/miserableface/kaikki-melayu-entries/tree/c8a4ca496502e76c5de947fdf8eb18e2966844c3
const malayJawiPayload=asset("malay-jawi-data-1.bin");

const knownJawiParticles=map('كه=kah له=lah');
let jawiLexiconRequest;

function normalizeJawi(word) {
  return word.normalize('NFKC').replace(/[کڪ]/gu,'ك').replace(/ی/gu,'ي').replace(/ڬ/gu,'ݢ')
    .replace(/[\u0640\u200c\u200d]/gu,'');
}

function loadJawiLexicon() {
  return jawiLexiconRequest??=decompressTextData(malayJawiPayload).then(JSON.parse)
    .catch(error=>{jawiLexiconRequest=undefined;throw error;});
}

function jawiWordReading(word,table) {
  const key=normalizeJawi(word);
  const exact=table[key];
  if(exact) {
    const [value,estimated,derived]=exact;
    return {...chooseDictionaryReading(value,'malay'),fallback:estimated||undefined,ruleBased:derived||undefined};
  }
  const ending=key.match(/(?:كه|له|[٢۲])$/u)?.[0];
  if(!ending)return null;
  const stem=table[key.slice(0,-ending.length)];
  if(!stem)return null;
  const reading=chooseDictionaryReading(stem[0],'malay');
  const isReduplication=/^[٢۲]$/u.test(ending);
  const addEnding=ipa=>ipa+'.'+(isReduplication?ipa:knownJawiParticles[ending]);
  return {ipa:addEnding(reading.ipa),ambiguous:reading.ambiguous,
    alternatives:reading.alternatives?.map(addEnding),fallback:stem[1]||undefined,ruleBased:true};
}

async function readMalayJawi(input) {
  const table=await loadJawiLexicon().catch(()=>null);
  return input.split(/([\p{Script=Arabic}\p{M}\u0640\u200c\u200d]+)/u).filter(Boolean).map(original=>{
    if(!/\p{L}/u.test(original))return {original};
    const reading=table&&jawiWordReading(original,table);
    return reading?{original,...reading}:{original,unknown:true};
  });
}

// Cassidy–JLU distinguishes vowel quality, length, and nasalization in spelling.
const jamaicanSourceVowels=map('a=a e=e i=i o=o u=u aa=aː ii=iː uu=uː ie=ɪɛ uo=uɔ ai=aɪ ou=ɔu');
const jamaicanSourceConsonants=map('b=b d=d ch=tʃ f=f g=g h=h j=dʒ k=k l=l m=m n=n ng=ŋ ny=ɲ p=p r=ɹ s=s sh=ʃ t=t v=v w=w y=j z=z zh=ʒ ʼ=ʔ');

function jamaicanRuleReading(word) {
  const normalized=word.toLowerCase().replace(/’/gu,"'");
  if(!/^[a-zʼ]+(?:[-'][a-zʼ]+)*$/u.test(normalized))return '';
  const pieces=[];
  let hasVowel=false;
  for(const part of normalized.split(/[-']/u)) {
    let ipa='';
    for(let index=0;index<part.length;) {
      const pair=part.slice(index,index+2);
      const usesPair=Object.hasOwn(jamaicanSourceVowels,pair)||Object.hasOwn(jamaicanSourceConsonants,pair);
      const symbol=usesPair?pair:part[index];
      index+=symbol.length;
      let vowel=jamaicanSourceVowels[symbol];
      if(vowel) {
        hasVowel=true;
        if(part.startsWith('hn',index)) {
          vowel=vowel.replace(/ː?$/u,length=>'\u0303'+length);
          index+=2;
        }
        ipa+=vowel;
      } else {
        if(!Object.hasOwn(jamaicanSourceConsonants,symbol))return '';
        ipa+=jamaicanSourceConsonants[symbol];
      }
    }
    pieces.push(ipa);
  }
  return hasVowel?pieces.join('.'):'';

}

function jamaicanConventionalReading(word,table) {
  // Non-Cassidy spellings can retain ck, hard c, and doubled consonants.
  const lower=word.toLowerCase();
  const hardC=lower.replace(/ck|c(?=[^eiyh]|$)/gu,'k');
  if(hardC===lower)return null;
  const normalized=hardC.replace(/([bdfgklmnprstvz])\1/gu,'$1');
  const spellings=new Set([normalized,normalized.replace(/(?<=[bdfgklmnprstvz])e?y$/u,'i')]);
  const attested=[...spellings].flatMap(spelling=>{
    if(!table?.[spelling])return [];
    const reading=chooseDictionaryReading(table[spelling],'jamaican');
    const phones=tokenizeIPA(reading.ipa,'jamaican');
    return !phones.unknownPhones.size&&phones.some(phone=>phone.vowel)?[reading]:[];
  });
  if(attested.length===1||attested.length===2&&attested[0].ipa===attested[1].ipa)return attested[0];
  if(attested.length)return null;
  const ipa=jamaicanRuleReading(normalized);
  return ipa?{ipa}:null;
}

const arabicSunLetters=map('ت=t ث=θ د=d ذ=ð ر=r ز=z س=s ش=ʃ ص=s ض=d ط=t ظ=ð ل=l ن=n');
const arabicArticlePrefixes=map('وال=wa فال=fa بال=bi كال=ka لل=li');
let arabicSupplementRequest;

function loadArabicSupplement() {
  return arabicSupplementRequest??=decompressTextData(arabicSupplementPayload).then(JSON.parse)
    .catch(error=>{arabicSupplementRequest=undefined;throw error;});
}

function singleArabicReading(value) {
  if(!value)return '';
  const reading=chooseDictionaryReading(value,'arabic');
  if(reading.ambiguous||!/^[^\s()[\]{}]+$/u.test(reading.ipa))return '';
  const phones=tokenizeIPA(reading.ipa,'arabic');
  return !phones.unknownPhones.size&&phones.some(phone=>phone.vowel)?reading.ipa:'';
}

function arabicFeminineReading(stem,lookup) {
  const ipa=singleArabicReading(lookup(stem));
  if(!ipa)return '';
  const last=tokenizeIPA(ipa,'arabic').at(-1);
  if(!last?.sound)return '';
  if(!last.vowel)return ipa+'ah';
  if(stem.endsWith('ي')&&/iː$/u.test(ipa))return ipa.replace(/iː$/u,'ija');
  return '';
}

function arabicRuleReading(word,table,supplement) {
  const lookup=word=>table?.[word]??supplement?.[word];
  const joined=word.match(/^(وال|فال|بال|كال|لل)([ء-ي]{3,})$/u);
  if(joined) {
    const definite='ال'+joined[2];
    const pronunciation=singleArabicReading(lookup(definite))||arabicRuleReading(definite,table,supplement);
    const article=pronunciation.match(/^[ʔʼ]?aː?(?=.+)/u);
    return article?arabicArticlePrefixes[joined[1]]+pronunciation.slice(article[0].length):'';
  }
  const definite=word.match(/^ال([ء-ي]{3,})$/u);
  if(!definite)return /^[ء-ي]{3,}ة$/u.test(word)?arabicFeminineReading(word.slice(0,-1),lookup):'';
  const noun=definite[1];
  let ipa=singleArabicReading(lookup(noun));
  const definiteStem=word.slice(0,-1);
  if(!ipa&&noun.endsWith('ة')&&lookup(definiteStem)) {
    ipa=arabicFeminineReading(noun.slice(0,-1),lookup);
    if(!ipa) {
      const full=arabicFeminineReading(definiteStem,lookup);
      const article=full.match(/^[ʔʼ]?aː?l(?=.+)/u);
      if(article)ipa=full.slice(article[0].length);
    }
  }
  if(!ipa)return '';
  const phones=tokenizeIPA(ipa,'arabic',true),initial=phones[0];
  if(!initial?.sound)return '';
  const sun=arabicSunLetters[noun[0]];
  if(!sun)return 'ʔal'+ipa;
  if(phoneticBase[initial.sound]!==sun||initial.offset!==0)return '';
  const characters=phones.inputCharacters.slice();
  if(!initial.length) {
    let end=1;
    while(/[ˤʰ\u032a]/u.test(characters[end]??''))end++;
    characters.splice(end,0,'ː');
  }
  return 'ʔa'+characters.join('');
}

function arabicMissingHamzaSpelling(word,table,supplement) {
  if(!/^[ء-ي]+$/u.test(word))return '';
  const lookup=entry=>table?.[entry]??supplement?.[entry];
  const article=word.match(/^(?:[وف])?[بك]?ال(?=.)/u)?.[0];
  const protectedAlif=article&&lookup(word.slice(article.length))?article.length-2:-1;
  const proposals=new Set();
  for(const {index} of word.matchAll(/ا(?=[ء-ي]{2})/gu)) {
    if(index===protectedAlif)continue;
    const prefix=word.slice(0,index);
    if(!/^(?:(?:[وف])?[بكل]?(?:ال)?|[وف]?لل)$/u.test(prefix))continue;
    for(const alif of 'أإآ') {
      const stem=alif+word.slice(index+1),spelling=prefix+stem;
      if(lookup(spelling)||prefix&&lookup(stem))proposals.add(spelling);
    }
  }
  return proposals.size===1?[...proposals][0]:'';
}

const ruleReadings={jamaican:jamaicanRuleReading,arabic:arabicRuleReading};

async function fillRuleReadings(chunks,source,table) {
  const rule=ruleReadings[source];
  if(!rule||!chunks.some(chunk=>chunk.unknown))return chunks;
  const supplement=source==='arabic'?await loadArabicSupplement().catch(()=>null):null;
  return chunks.map(chunk=>{
    if(!chunk.unknown)return chunk;
    const extra=supplement?.[chunk.original];
    if(extra) {
      const reading=chooseDictionaryReading(extra,'arabic');
      const phones=tokenizeIPA(reading.ipa,'arabic');
      if(!phones.unknownPhones.size&&phones.some(phone=>phone.vowel))return {original:chunk.original,...reading,ruleBased:true};
    }
    const ipa=rule(chunk.original,table,supplement);
    if(ipa)return {original:chunk.original,ipa,ruleBased:true};
    if(source==='jamaican') {
      const conventional=jamaicanConventionalReading(chunk.original,table);
      if(conventional)return {original:chunk.original,...conventional,ruleBased:true,spellingRecovered:true};
    } else {
      const spelling=arabicMissingHamzaSpelling(chunk.original,table,supplement);
      if(spelling)return {...chunk,arabicSpelling:spelling};
    }
    return chunk;
  });
}

const koreanInitialJamo='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const koreanVowelJamo='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const koreanFinalJamo=' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
const koreanFinalIPA=map('ㄱ=k̚ ㄴ=n ㄷ=t̚ ㄹ=ɭ ㅁ=m ㅂ=p̚ ㅇ=ŋ');
const koreanOnsetIPA=map('ㄱ=k ㄲ=k͈ ㄴ=n ㄷ=t ㄸ=t͈ ㄹ=ɾ ㅁ=m ㅂ=p ㅃ=p͈ ㅅ=sʰ ㅆ=s͈ ㅈ=t͡ɕ ㅉ=t͡ɕ͈ ㅊ=t͡ɕʰ ㅋ=kʰ ㅌ=tʰ ㅍ=pʰ ㅎ=h');
const koreanVowelIPA=map('ㅏ=a̠ ㅐ=e̞ ㅑ=ja̠ ㅒ=je̞ ㅓ=ʌ̹ ㅔ=e̞ ㅕ=jʌ̹ ㅖ=je̞ ㅗ=o̞ ㅘ=wa̠ ㅙ=we̞ ㅚ=we̞ ㅛ=jo̞ ㅜ=u ㅝ=wʌ̹ ㅞ=we̞ ㅟ=ɥi ㅠ=ju ㅡ=ɯ ㅢ=ɰi ㅣ=i');
const koreanCodaReduction=map('ㄲ=ㄱ ㄳ=ㄱ ㄵ=ㄴ ㄶ=ㄴ ㄺ=ㄱ ㄻ=ㅁ ㄼ=ㄹ ㄽ=ㄹ ㄾ=ㄹ ㄿ=ㅂ ㅀ=ㄹ ㅄ=ㅂ ㅅ=ㄷ ㅆ=ㄷ ㅈ=ㄷ ㅊ=ㄷ ㅋ=ㄱ ㅌ=ㄷ ㅍ=ㅂ ㅎ=ㄷ');
const koreanClusterParts=map('ㄳ=ㄱㅆ ㄵ=ㄴㅈ ㄶ=ㄴㅎ ㄺ=ㄹㄱ ㄻ=ㄹㅁ ㄼ=ㄹㅂ ㄽ=ㄹㅆ ㄾ=ㄹㅌ ㄿ=ㄹㅍ ㅀ=ㄹㅎ ㅄ=ㅂㅆ');
const koreanAspiration=map('ㄱ=ㅋ ㄷ=ㅌ ㅂ=ㅍ ㅈ=ㅊ');
const koreanTensing=map('ㄱ=ㄲ ㄷ=ㄸ ㅂ=ㅃ ㅅ=ㅆ ㅈ=ㅉ');
const koreanNasalCoda=map('ㄱ=ㅇ ㄷ=ㄴ ㅂ=ㅁ');
const koreanVoicedOnset=map('ㄱ=ɡ ㄷ=d ㄴ=n ㅂ=b ㅈ=d͡ʑ ㅎ=ɦ');

function koreanReadingSyllables(word) {
  return Array.from(word,letter=>{
    const code=letter.charCodeAt(0)-0xac00;
    return {
      onset:koreanInitialJamo[Math.floor(code/588)],
      vowel:koreanVowelJamo[Math.floor(code%588/28)],
      coda:koreanFinalJamo[code%28].trim(),
      letter,
    };
  });
}

function koreanCodaBeforeVowel(current,next) {
  if(!current.coda||current.coda==='ㅇ')return;
  if(next.vowel==='ㅢ') {
    current.coda=koreanCodaReduction[current.coda]??current.coda;
    return;
  }
  const cluster=koreanClusterParts[current.coda];
  const moved=cluster?.at(-1)??current.coda;
  current.coda=cluster?.[0]??'';
  if(moved==='ㅎ') {
    if(cluster) {
      next.onset=current.coda;
      current.coda='';
    }
  } else {
    next.onset=next.vowel==='ㅣ' && /[ㄷㅌ]/u.test(moved) ? (moved==='ㄷ'?'ㅈ':'ㅊ') : moved;
  }
}

function koreanCodaBeforeConsonant(current,next) {
  const original=current.coda;
  const cluster=koreanClusterParts[original];
  if(original.endsWith('ㅎ')||cluster?.endsWith('ㅎ')) {
    if(koreanAspiration[next.onset]||next.onset==='ㅅ') {
      current.coda=cluster?.[0]??'';
      next.onset=koreanAspiration[next.onset]??'ㅆ';
      return;
    }
    if(next.onset==='ㄴ'&&!cluster)current.coda='ㄴ';
  } else if(next.onset==='ㅎ') {
    const obstruent=cluster?.at(-1)??original;
    const stop=koreanAspiration[obstruent]?obstruent:koreanCodaReduction[obstruent]??obstruent;
    if(koreanAspiration[stop]) {
      current.coda=cluster?.[0]??'';
      next.onset=stop==='ㄷ'&&next.vowel==='ㅣ'?'ㅊ':koreanAspiration[stop];
      return;
    }
  }

  if(original==='ㄺ'&&next.onset==='ㄱ'&&/[고게기]/u.test(next.letter)&&!/[닭흙칡]/u.test(current.letter)) {
    current.coda='ㄹ';
    next.onset='ㄲ';
  } else if(original==='ㄼ'&&current.letter==='밟') {
    current.coda='ㅂ';
  }
  current.coda=koreanCodaReduction[current.coda]??current.coda;
  if(next.onset==='ㄹ'&&/[ㄱㄷㅂㅁㅇ]/u.test(current.coda))next.onset='ㄴ';
  if(current.coda==='ㄴ'&&next.onset==='ㄹ')current.coda='ㄹ';
  if(current.coda==='ㄹ'&&next.onset==='ㄴ')next.onset='ㄹ';
  if(/[ㄴㅁ]/u.test(next.onset)) {
    current.coda=koreanNasalCoda[current.coda]??current.coda;
  } else if(koreanNasalCoda[current.coda]||/[ㄵㄻㄼㄾ]/u.test(original)&&/[다던도록지자구고게기]/u.test(next.letter)) {
    next.onset=koreanTensing[next.onset]??next.onset;
  }
}

function koreanContextReading(word,interactionPositions) {
  if(!/^[가-힣]+$/u.test(word))return '';
  const syllables=koreanReadingSyllables(word);
  for(let i=0;i<syllables.length-1;i++){
    const current=syllables[i],next=syllables[i+1];
    const initial=next.onset;
    const isolatedCoda=koreanCodaReduction[current.coda]??current.coda;
    if(next.onset==='ㅇ')koreanCodaBeforeVowel(current,next);
    else koreanCodaBeforeConsonant(current,next);
    if(next.onset!==initial||current.coda!==isolatedCoda)interactionPositions?.add(i+1);
  }
  const last=syllables.at(-1);
  last.coda=koreanCodaReduction[last.coda]??last.coda;
  if(last.letter==='밟')last.coda='ㅂ';
  return syllables.map(({onset,vowel,coda},index)=>{
    const previous=syllables[index-1];
    const palatal=vowel==='ㅣ'||vowel==='ㅢ'&&onset!=='ㅇ'||koreanVowelIPA[vowel].startsWith('j');
    let consonant=koreanOnsetIPA[onset]??'';
    let nucleus=koreanVowelIPA[vowel];
    if(previous&&(!previous.coda||/[ㄴㄹㅁㅇ]/u.test(previous.coda)))consonant=koreanVoicedOnset[onset]??consonant;
    if(onset==='ㄹ'&&previous?.coda==='ㄹ')consonant='l';
    if(nucleus.startsWith('j')&&onset==='ㄴ') {
      consonant='ɲ';
      nucleus=nucleus.replace(/^j/u,'');
    }
    if(palatal&&onset==='ㅅ')consonant='ɕʰ';
    if(palatal&&onset==='ㅆ')consonant='ɕ͈';
    if(palatal&&onset==='ㅎ'&&consonant==='h')consonant='ç';
    if(vowel==='ㅢ'&&onset!=='ㅇ')nucleus='i';
    return consonant+nucleus+(koreanFinalIPA[coda]??'');
  }).join('');
}

function recoverKoreanWords(chunks) {
  const recovered=[];
  for(let i=0;i<chunks.length;){
    const start=i;
    while(i<chunks.length&&/^[가-힣]+$/u.test(chunks[i].original))i++;
    if(start===i) {
      recovered.push(chunks[i++]);
      continue;
    }
    const parts=chunks.slice(start,i);
    if(parts.length===1&&!parts[0].unknown) {
      recovered.push(parts[0]);
      continue;
    }
    const word=parts.map(part=>part.original).join('');
    const interactions=new Set();
    const ipa=koreanContextReading(word,interactions);
    let offset=0;
    const crossesDictionaryBoundary=parts.slice(0,-1).some(({original})=>{
      offset+=original.length;
      return interactions.has(offset);
    });
    if(parts.some(part=>part.unknown)||crossesDictionaryBoundary)recovered.push({original:word,ipa,ruleBased:true});
    else recovered.push(...parts);
  }
  return recovered;
}

// CLDR release 48 (Unicode data license), revision acd6d88ae493633240e19a87a721076a8a75c310.
// https://github.com/unicode-org/cldr/tree/acd6d88ae493633240e19a87a721076a8a75c310/common/rbnf
// Odia number names adapted from https://en.wikipedia.org/w/index.php?title=Odia_numerals&oldid=1331382088 (CC BY-SA 4.0).
// Jamaican cardinal forms based on https://opengrammar.github.io/jam/#_cardinal_numerals.
const cardinalData={"korean":{"locale":"ko","sets":{"%spellout-numbering":[[0,1,"공"],[1,1,"=%spellout-cardinal-sinokorean="]],"%spellout-cardinal-sinokorean":[[-1,1,"마이너스 →→"],[0,1,"영"],[1,1,"일"],[2,1,"이"],[3,1,"삼"],[4,1,"사"],[5,1,"오"],[6,1,"육"],[7,1,"칠"],[8,1,"팔"],[9,1,"구"],[10,10,"십[→→]"],[20,10,"←←십[→→]"],[100,100,"백[→→]"],[200,100,"←←백[→→]"],[1000,1000,"천[→→]"],[2000,1000,"←←천[→→]"],[10000,10000,"만[ →→]"],[20000,10000,"←←만[ →→]"],[100000000,100000000,"←←억[ →→]"]]}},"japanese":{"locale":"ja","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"マイナス→→"],[0,1,"〇"],[1,1,"一"],[2,1,"二"],[3,1,"三"],[4,1,"四"],[5,1,"五"],[6,1,"六"],[7,1,"七"],[8,1,"八"],[9,1,"九"],[10,10,"十[→→]"],[20,10,"←←十[→→]"],[100,100,"百[→→]"],[200,100,"←←百[→→]"],[1000,1000,"千[→→]"],[2000,1000,"←←千[→→]"],[10000,10000,"←←万[→→]"],[100000000,100000000,"←←億[→→]"]]}},"english":{"locale":"en","sets":{"%spellout-numbering":[[-1,1,"minus →→"],[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"minus →→"],[0,1,"zero"],[1,1,"one"],[2,1,"two"],[3,1,"three"],[4,1,"four"],[5,1,"five"],[6,1,"six"],[7,1,"seven"],[8,1,"eight"],[9,1,"nine"],[10,10,"ten"],[11,10,"eleven"],[12,10,"twelve"],[13,10,"thirteen"],[14,10,"fourteen"],[15,10,"fifteen"],[16,10,"sixteen"],[17,10,"seventeen"],[18,10,"eighteen"],[19,10,"nineteen"],[20,10,"twenty[-→→]"],[30,10,"thirty[-→→]"],[40,10,"forty[-→→]"],[50,10,"fifty[-→→]"],[60,10,"sixty[-→→]"],[70,10,"seventy[-→→]"],[80,10,"eighty[-→→]"],[90,10,"ninety[-→→]"],[100,100,"←← hundred[ →→]"],[1000,1000,"←← thousand[ →→]"],[1000000,1000000,"←← million[ →→]"]]}},"mandarin":{"locale":"zh","sets":{"%spellout-numbering":[[-1,1,"负→→"],[0,1,"〇"],[1,1,"一"],[2,1,"二"],[3,1,"三"],[4,1,"四"],[5,1,"五"],[6,1,"六"],[7,1,"七"],[8,1,"八"],[9,1,"九"],[10,10,"十[→→]"],[20,10,"←←十[→→]"],[100,100,"←←百[→%%number2→]"],[1000,1000,"←←千[→%%number3→]"],[10000,10000,"←←万[→%%number4→]"],[100000000,100000000,"←←亿[→%%number5→]"]],"%%number5":[[1,1,"〇=%spellout-numbering="],[10,10,"〇一=%spellout-numbering="],[20,10,"〇=%spellout-numbering="],[10000,10000,"=%spellout-numbering="]],"%%number4":[[1,1,"〇=%spellout-numbering="],[10,10,"〇一=%spellout-numbering="],[20,10,"〇=%spellout-numbering="],[1000,1000,"=%spellout-numbering="]],"%%number3":[[1,1,"〇=%spellout-numbering="],[10,10,"〇一=%spellout-numbering="],[20,10,"〇=%spellout-numbering="],[100,100,"=%spellout-numbering="]],"%%number2":[[1,1,"〇=%spellout-numbering="],[10,10,"一=%spellout-numbering="],[20,10,"=%spellout-numbering="]]}},"cantonese":{"locale":"yue","sets":{"%spellout-numbering":[[-1,1,"負→→"],[0,1,"零"],[1,1,"一"],[2,1,"二"],[3,1,"三"],[4,1,"四"],[5,1,"五"],[6,1,"六"],[7,1,"七"],[8,1,"八"],[9,1,"九"],[10,10,"十[→→]"],[20,10,"←←十[→→]"],[100,100,"←←百[→%%number2→]"],[1000,1000,"←←千[→%%number3→]"],[10000,10000,"←←萬[→%%number4→]"],[100000000,100000000,"←←億[→%%number5→]"]],"%%number5":[[1,1,"零=%spellout-numbering="],[10,10,"零一=%spellout-numbering="],[20,10,"零=%spellout-numbering="],[10000,10000,"=%spellout-numbering="]],"%%number4":[[1,1,"零=%spellout-numbering="],[10,10,"零一=%spellout-numbering="],[20,10,"零=%spellout-numbering="],[1000,1000,"=%spellout-numbering="]],"%%number3":[[1,1,"零=%spellout-numbering="],[10,10,"零一=%spellout-numbering="],[20,10,"零=%spellout-numbering="],[100,100,"=%spellout-numbering="]],"%%number2":[[1,1,"零=%spellout-numbering="],[10,10,"一=%spellout-numbering="],[20,10,"=%spellout-numbering="]]}},"arabic":{"locale":"ar","sets":{"%spellout-numbering":[[-1,1,"ناقص →→"],[0,1,"صفر"],[1,1,"واحد"],[2,1,"إثنان"],[3,1,"ثلاثة"],[4,1,"أربعة"],[5,1,"خمسة"],[6,1,"ستة"],[7,1,"سبعة"],[8,1,"ثمانية"],[9,1,"تسعة"],[10,10,"عشرة"],[11,10,"إحدى عشر"],[12,10,"إثنا عشر"],[13,10,"→%spellout-numbering→ عشر"],[20,10,"[→%spellout-numbering→ و]عشرون"],[30,10,"[→%spellout-numbering→ و]ثلاثون"],[40,10,"[→%spellout-numbering→ و]أربعون"],[50,10,"[→%spellout-numbering→ و]خمسون"],[60,10,"[→%spellout-numbering→ و]ستون"],[70,10,"[→%spellout-numbering→ و]سبعون"],[80,10,"[→%spellout-numbering→ و]ثمانون"],[90,10,"[→%spellout-numbering→ و]تسعون"],[100,100,"مائة[ و→%spellout-numbering→]"],[200,100,"مائتان[ و→%spellout-numbering→]"],[300,100,"←%spellout-numbering← مائة[ و→%spellout-numbering→]"],[1000,1000,"ألف[ و→%spellout-numbering→]"],[2000,1000,"ألفين[ و→%spellout-numbering→]"],[3000,1000,"←%spellout-numbering← آلاف[ و→%spellout-numbering→]"],[11000,1000,"←%%spellout-numbering-m← ألف[ و→%spellout-numbering→]"],[1000000,1000000,"مليون[ و→%spellout-numbering→]"],[2000000,1000000,"←%%spellout-numbering-m← مليون[ و→%spellout-numbering→]"]],"%%spellout-numbering-m":[[0,1,"صفر"],[1,1,"واحد"],[2,1,"إثنان"],[3,1,"ثلاثة"],[4,1,"أربعة"],[5,1,"خمسة"],[6,1,"ستة"],[7,1,"سبعة"],[8,1,"ثمانية"],[9,1,"تسعة"],[10,10,"عشرة"],[11,10,"إحدى عشر"],[12,10,"إثنا عشر"],[13,10,"→→ عشر"],[20,10,"[→%%spellout-numbering-m→ و]عشرون"],[30,10,"[→%%spellout-numbering-m→ و]ثلاثون"],[40,10,"[→%%spellout-numbering-m→ و]أربعون"],[50,10,"[→%%spellout-numbering-m→ و]خمسون"],[60,10,"[→%%spellout-numbering-m→ و]ستون"],[70,10,"[→%%spellout-numbering-m→ و]سبعون"],[80,10,"[→%%spellout-numbering-m→ و]ثمانون"],[90,10,"[→%%spellout-numbering-m→ و]تسعون"],[100,100,"مائة[ و→%%spellout-numbering-m→]"],[200,100,"مائتان[ و→%%spellout-numbering-m→]"],[300,100,"←%spellout-numbering← مائة[ و→%%spellout-numbering-m→]"],[1000,1000,"ألف[ و→%%spellout-numbering-m→]"],[2000,1000,"ألفي[ و→%%spellout-numbering-m→]"],[3000,1000,"←%spellout-numbering← آلاف[ و→%%spellout-numbering-m→]"],[11000,1000,"←%%spellout-numbering-m← ألف[ و→%%spellout-numbering-m→]"],[1000000,1000000,"مليون[ و→%%spellout-numbering-m→]"],[2000000,1000000,"←%%spellout-numbering-m← مليون[ و→%%spellout-numbering-m→]"]]}},"persian":{"locale":"fa","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"منفی →→"],[0,1,"صفر"],[1,1,"یک"],[2,1,"دو"],[3,1,"سه"],[4,1,"چهار"],[5,1,"پنج"],[6,1,"شش"],[7,1,"هفت"],[8,1,"هشت"],[9,1,"نه"],[10,10,"ده"],[11,10,"یازده"],[12,10,"دوازده"],[13,10,"سیزده"],[14,10,"چهارده"],[15,10,"پانزده"],[16,10,"شانزده"],[17,10,"هفده"],[18,10,"هجده"],[19,10,"نوزده"],[20,10,"بیست[ و →→]"],[30,10,"سی[ و →→]"],[40,10,"چهل[ و →→]"],[50,10,"پنجاه[ و →→]"],[60,10,"شصت[ و →→]"],[70,10,"هفتاد[ و →→]"],[80,10,"هشتاد[ و →→]"],[90,10,"نود[ و →→]"],[100,100,"صد[ و →→]"],[200,100,"دویست[ و →→]"],[300,100,"سیصد[ و →→]"],[400,100,"چهارصد[ و →→]"],[500,100,"پانصد[ و →→]"],[600,100,"ششصد[ و →→]"],[700,100,"هفتصد[ و →→]"],[800,100,"هشتصد[ و →→]"],[900,100,"نهصد[ و →→]"],[1000,1000,"←← هزار[ و →→]"],[1000000,1000000,"←← میلیون[ و →→]"]]}},"khmer":{"locale":"km","sets":{"%spellout-numbering":[[-1,1,"ដក​→→"],[0,1,"សូន្យ"],[1,1,"មួយ"],[2,1,"ពីរ"],[3,1,"បី"],[4,1,"បួន"],[5,1,"ប្រាំ"],[6,1,"ប្រាំមួយ"],[7,1,"ប្រាំពីរ"],[8,1,"ប្រាំបី"],[9,1,"ប្រាំបួន"],[10,10,"ដប់[​→→]"],[20,10,"ម្ភៃ[​→→]"],[30,10,"សាមសិប[​→→]"],[40,10,"សែសិប[​→→]"],[50,10,"ហាសិប[​→→]"],[60,10,"ហុកសិប[​→→]"],[70,10,"ចិតសិប[​→→]"],[80,10,"ប៉ែតសិប[​→→]"],[90,10,"កៅសិប[​→→]"],[100,100,"←←​រយ[​→→]"],[1000,1000,"←←​ពាន់[​→→]"],[10000,10000,"←←​ម៉ឺន[​→→]"],[100000,100000,"←←​សែន[​→→]"],[1000000,1000000,"←←​លាន[​→→]"]]}},"dutch":{"locale":"nl","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"min →→"],[0,1,"nul"],[1,1,"een"],[2,1,"twee"],[3,1,"drie"],[4,1,"vier"],[5,1,"vijf"],[6,1,"zes"],[7,1,"zeven"],[8,1,"acht"],[9,1,"negen"],[10,10,"tien"],[11,10,"elf"],[12,10,"twaalf"],[13,10,"dertien"],[14,10,"veertien"],[15,10,"vijftien"],[16,10,"zestien"],[17,10,"zeventien"],[18,10,"achttien"],[19,10,"negentien"],[20,10,"[→%%number-en→]twintig"],[30,10,"[→%%number-en→]dertig"],[40,10,"[→%%number-en→]veertig"],[50,10,"[→%%number-en→]vijftig"],[60,10,"[→%%number-en→]zestig"],[70,10,"[→%%number-en→]zeventig"],[80,10,"[→%%number-en→]tachtig"],[90,10,"[→%%number-en→]negentig"],[100,100,"honderd[→→]"],[200,100,"←←­honderd[­→→]"],[1000,1000,"duizend[­→→]"],[2000,1000,"←←­duizend[­→→]"],[100000,1000,"←←­duizend[­→→]"],[1000000,1000000,"←← miljoen[ →→]"]],"%%number-en":[[1,1,"een­en­"],[2,1,"twee­ën­"],[3,1,"drie­ën­"],[4,1,"=%spellout-cardinal=­en­"]]}},"norwegian":{"locale":"no","sets":{"%spellout-numbering":[[0,1,"=%%spellout-cardinal-reale="]],"%%spellout-cardinal-reale":[[-1,1,"minus →→"],[0,1,"null"],[1,1,"én"],[2,1,"to"],[3,1,"tre"],[4,1,"fire"],[5,1,"fem"],[6,1,"seks"],[7,1,"sju"],[8,1,"åtte"],[9,1,"ni"],[10,10,"ti"],[11,10,"elleve"],[12,10,"tolv"],[13,10,"tretten"],[14,10,"fjorten"],[15,10,"femten"],[16,10,"seksten"],[17,10,"sytten"],[18,10,"atten"],[19,10,"nitten"],[20,10,"tjue[­→→]"],[30,10,"tretti[­→→]"],[40,10,"førti[­→→]"],[50,10,"femti[­→→]"],[60,10,"seksti[­→→]"],[70,10,"sytti[­→→]"],[80,10,"åtti[­→→]"],[90,10,"nitti[­→→]"],[100,100,"hundre[ og →→]"],[200,100,"←%spellout-cardinal-neuter← hundre[ og →→]"],[1000,1000,"tusen[ →%%and-small→]"],[2000,1000,"←%spellout-cardinal-neuter← tusen[ →%%and-small→]"],[1000000,1000000,"én million[ →→]"],[2000000,1000000,"←← millioner[ →→]"]],"%%and-small":[[0,1,"og =%%spellout-cardinal-reale="],[100,100,"=%%spellout-cardinal-reale="]],"%spellout-cardinal-neuter":[[-1,1,"minus →→"],[0,1,"null"],[1,1,"ett"],[2,1,"=%%spellout-cardinal-reale="],[20,10,"tjue[­→→]"],[30,10,"tretti[­→→]"],[40,10,"førti[­→→]"],[50,10,"femti[­→→]"],[60,10,"seksti[­→→]"],[70,10,"sytti[­→→]"],[80,10,"åtti[­→→]"],[90,10,"nitti[­→→]"],[100,100,"hundre[ og →→]"],[200,100,"←%spellout-cardinal-neuter← hundre[ og →→]"],[1000,1000,"tusen[ →%%and-small-n→]"],[2000,1000,"←%spellout-cardinal-neuter← tusen[ →%%and-small-n→]"],[1000000,1000000,"én million[ →→]"],[2000000,1000000,"←%%spellout-cardinal-reale← millioner[ →→]"]],"%%and-small-n":[[0,1,"og =%spellout-cardinal-neuter="],[100,100,"=%spellout-cardinal-neuter="]]}},"german":{"locale":"de","sets":{"%spellout-numbering":[[-1,1,"minus →→"],[0,1,"null"],[1,1,"eins"],[2,1,"zwei"],[3,1,"drei"],[4,1,"vier"],[5,1,"fünf"],[6,1,"sechs"],[7,1,"sieben"],[8,1,"acht"],[9,1,"neun"],[10,10,"zehn"],[11,10,"elf"],[12,10,"zwölf"],[13,10,"→→zehn"],[16,10,"sechzehn"],[17,10,"siebzehn"],[18,10,"→→zehn"],[20,10,"[→%spellout-cardinal-masculine→­und­]zwanzig"],[30,10,"[→%spellout-cardinal-masculine→­und­]dreißig"],[40,10,"[→%spellout-cardinal-masculine→­und­]vierzig"],[50,10,"[→%spellout-cardinal-masculine→­und­]fünfzig"],[60,10,"[→%spellout-cardinal-masculine→­und­]sechzig"],[70,10,"[→%spellout-cardinal-masculine→­und­]siebzig"],[80,10,"[→%spellout-cardinal-masculine→­und­]achtzig"],[90,10,"[→%spellout-cardinal-masculine→­und­]neunzig"],[100,100,"←%spellout-cardinal-masculine←­hundert[­→→]"],[1000,1000,"←%spellout-cardinal-masculine←­tausend[­→→]"],[1000000,1000000,"eine Million[ →→]"],[2000000,1000000,"←%spellout-cardinal-feminine← Millionen[ →→]"]],"%spellout-cardinal-feminine":[[-1,1,"minus →→"],[0,1,"null"],[1,1,"eine"],[2,1,"=%spellout-numbering="],[100,100,"←%spellout-cardinal-masculine←­hundert[­→→]"],[1000,1000,"←%spellout-cardinal-masculine←­tausend[­→→]"],[1000000,1000000,"eine Million[ →→]"],[2000000,1000000,"←%spellout-cardinal-feminine← Millionen[ →→]"]],"%spellout-cardinal-masculine":[[-1,1,"minus →→"],[0,1,"null"],[1,1,"ein"],[2,1,"=%spellout-numbering="],[100,100,"←%spellout-cardinal-masculine←­hundert[­→→]"],[1000,1000,"←%spellout-cardinal-masculine←­tausend[­→→]"],[1000000,1000000,"eine Million[ →→]"],[2000000,1000000,"←%spellout-cardinal-feminine← Millionen[ →→]"]]}},"romanian":{"locale":"ro","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal-masculine="]],"%spellout-cardinal-masculine":[[-1,1,"minus →→"],[0,1,"zero"],[1,1,"unu"],[2,1,"doi"],[3,1,"trei"],[4,1,"patru"],[5,1,"cinci"],[6,1,"șase"],[7,1,"șapte"],[8,1,"opt"],[9,1,"nouă"],[10,10,"zece"],[11,10,"unsprezece"],[12,10,"→→sprezece"],[20,10,"←%spellout-cardinal-feminine←zeci[ și →→]"],[100,100,"una sută[ →→]"],[200,100,"←%spellout-cardinal-feminine← sute[ →→]"],[1000,1000,"una mie[ →→]"],[2000,1000,"←%spellout-cardinal-feminine← mii[ →→]"],[1000000,1000000,"←%spellout-cardinal-neuter← milion[ →→]"],[2000000,1000000,"←%spellout-cardinal-neuter← milioane[ →→]"]],"%spellout-cardinal-neuter":[[-1,1,"minus →→"],[0,1,"zero"],[1,1,"unu"],[2,1,"=%spellout-cardinal-feminine="],[20,10,"←%spellout-cardinal-feminine←zeci[ și →→]"],[100,100,"una sută[ →→]"],[200,100,"←%spellout-cardinal-feminine← sute[ →→]"],[1000,1000,"una mie[ →→]"],[2000,1000,"←%spellout-cardinal-feminine← mii[ →→]"],[1000000,1000000,"←%spellout-cardinal-neuter← milion[ →→]"],[2000000,1000000,"←%spellout-cardinal-neuter← milioane[ →→]"]],"%spellout-cardinal-feminine":[[-1,1,"minus →→"],[0,1,"zero"],[1,1,"una"],[2,1,"două"],[3,1,"=%spellout-cardinal-masculine="],[12,10,"→→sprezece"],[20,10,"←%spellout-cardinal-feminine←zeci[ și →→]"],[100,100,"una sută[ →→]"],[200,100,"←%spellout-cardinal-feminine← sute[ →→]"],[1000,1000,"una mie[ →→]"],[2000,1000,"←%spellout-cardinal-feminine← mii[ →→]"],[1000000,1000000,"←%spellout-cardinal-neuter← milion[ →→]"],[2000000,1000000,"←%spellout-cardinal-neuter← milioane[ →→]"]]}},"malay":{"locale":"ms","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"negatif →→"],[0,1,"kosong"],[1,1,"satu"],[2,1,"dua"],[3,1,"tiga"],[4,1,"empat"],[5,1,"lima"],[6,1,"enam"],[7,1,"tujuh"],[8,1,"lapan"],[9,1,"sembilan"],[10,10,"sepuluh"],[11,10,"sebelas"],[12,10,"→→ belas"],[20,10,"←← puluh[ →→]"],[100,100,"seratus[ →→]"],[200,100,"←← ratus[ →→]"],[1000,1000,"seribu[ →→]"],[2000,1000,"←← ribu[ →→]"],[1000000,1000000,"sejuta[ →→]"],[2000000,1000000,"←← juta[ →→]"]]}},"vietnamese":{"locale":"vi","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"âm →→"],[0,1,"không"],[1,1,"một"],[2,1,"hai"],[3,1,"ba"],[4,1,"bốn"],[5,1,"năm"],[6,1,"sáu"],[7,1,"bảy"],[8,1,"tám"],[9,1,"chín"],[10,10,"mười[ →%%teen→]"],[20,10,"←← mươi[ →%%x-ty→]"],[100,100,"←← trăm[ →%%after-hundred→]"],[1000,1000,"←← nghìn[ →%%after-thousand-or-more→]"],[1000000,1000000,"←← triệu[ →%%after-hundred→]"]],"%%after-hundred":[[0,1,"lẻ =%spellout-cardinal="],[10,10,"=%spellout-cardinal="]],"%%after-thousand-or-more":[[0,1,"không trăm =%%after-hundred="],[100,100,"=%spellout-cardinal="]],"%%x-ty":[[0,1,"=%spellout-cardinal="],[1,1,"mốt"],[2,1,"=%%teen="],[4,1,"tư"],[5,1,"=%%teen="]],"%%teen":[[0,1,"=%spellout-cardinal="],[5,1,"lăm"],[6,1,"=%spellout-cardinal="]]}},"swahili":{"locale":"sw","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"kasoro →→"],[0,1,"sifuri"],[1,1,"moja"],[2,1,"mbili"],[3,1,"tatu"],[4,1,"nne"],[5,1,"tano"],[6,1,"sita"],[7,1,"saba"],[8,1,"nane"],[9,1,"tisa"],[10,10,"kumi[ na →→]"],[20,10,"ishirini[ na →→]"],[30,10,"thelathini[ na →→]"],[40,10,"arobaini[ na →→]"],[50,10,"hamsini[ na →→]"],[60,10,"sitini[ na →→]"],[70,10,"sabini[ na →→]"],[80,10,"themanini[ na →→]"],[90,10,"tisini[ na →→]"],[100,100,"mia ←←[ na →→]"],[1000,1000,"elfu ←←[, →→]"],[1000000,1000000,"milioni ←←[, →→]"]]}},"swedish":{"locale":"sv","sets":{"%spellout-numbering":[[-1,1,"minus →→"],[0,1,"noll"],[1,1,"ett"],[2,1,"två"],[3,1,"tre"],[4,1,"fyra"],[5,1,"fem"],[6,1,"sex"],[7,1,"sju"],[8,1,"åtta"],[9,1,"nio"],[10,10,"tio"],[11,10,"elva"],[12,10,"tolv"],[13,10,"tretton"],[14,10,"fjorton"],[15,10,"femton"],[16,10,"sexton"],[17,10,"sjutton"],[18,10,"arton"],[19,10,"nitton"],[20,10,"tjugo[­→→]"],[30,10,"trettio[­→→]"],[40,10,"fyrtio[­→→]"],[50,10,"femtio[­→→]"],[60,10,"sextio[­→→]"],[70,10,"sjuttio[­→→]"],[80,10,"åttio[­→→]"],[90,10,"nittio[­→→]"],[100,100,"←%spellout-numbering←­hundra[­→→]"],[1000,1000,"←%%spellout-numbering-t←­tusen[ →→]"],[1000000,1000000,"en miljon[ →→]"],[2000000,1000000,"←%spellout-cardinal-reale← miljoner[ →→]"]],"%spellout-cardinal-reale":[[-1,1,"minus →→"],[0,1,"noll"],[1,1,"en"],[2,1,"=%spellout-numbering="],[20,10,"tjugo[­→→]"],[30,10,"trettio[­→→]"],[40,10,"fyrtio[­→→]"],[50,10,"femtio[­→→]"],[60,10,"sextio[­→→]"],[70,10,"sjuttio[­→→]"],[80,10,"åttio[­→→]"],[90,10,"nittio[­→→]"],[100,100,"←%spellout-cardinal-neuter←­hundra[­→→]"],[1000,1000,"ettusen[ →→]"],[2000,1000,"←%spellout-cardinal-reale←­tusen[ →→]"],[1000000,1000000,"en miljon[ →→]"],[2000000,1000000,"←%spellout-cardinal-reale← miljoner[ →→]"]],"%spellout-cardinal-neuter":[[0,1,"=%spellout-numbering="]],"%%spellout-numbering-t":[[1,1,"et"],[2,1,"två"],[3,1,"tre"],[4,1,"fyra"],[5,1,"fem"],[6,1,"sex"],[7,1,"sju"],[8,1,"åtta"],[9,1,"nio"],[10,10,"tio"],[11,10,"elva"],[12,10,"tolv"],[13,10,"tretton"],[14,10,"fjorton"],[15,10,"femton"],[16,10,"sexton"],[17,10,"sjutton"],[18,10,"arton"],[19,10,"nitton"],[20,10,"tjugo[­→→]"],[30,10,"trettio[­→→]"],[40,10,"fyrtio[­→→]"],[50,10,"femtio[­→→]"],[60,10,"sextio[­→→]"],[70,10,"sjuttio[­→→]"],[80,10,"åttio[­→→]"],[90,10,"nittio[­→→]"],[100,100,"←%spellout-numbering←­hundra[­→→]"],[1000,1000,"ERROR"]]}},"spanish":{"locale":"es","sets":{"%spellout-numbering":[[-1,1,"menos →→"],[0,1,"cero"],[1,1,"uno"],[2,1,"dos"],[3,1,"tres"],[4,1,"cuatro"],[5,1,"cinco"],[6,1,"seis"],[7,1,"siete"],[8,1,"ocho"],[9,1,"nueve"],[10,10,"diez"],[11,10,"once"],[12,10,"doce"],[13,10,"trece"],[14,10,"catorce"],[15,10,"quince"],[16,10,"dieciséis"],[17,10,"dieci→→"],[20,10,"veinte"],[21,10,"veintiuno"],[22,10,"veintidós"],[23,10,"veintitrés"],[24,10,"veinticuatro"],[25,10,"veinticinco"],[26,10,"veintiséis"],[27,10,"veinti→→"],[30,10,"treinta[ y →→]"],[40,10,"cuarenta[ y →→]"],[50,10,"cincuenta[ y →→]"],[60,10,"sesenta[ y →→]"],[70,10,"setenta[ y →→]"],[80,10,"ochenta[ y →→]"],[90,10,"noventa[ y →→]"],[100,100,"cien"],[101,100,"ciento →→"],[200,100,"doscientos[ →→]"],[300,100,"trescientos[ →→]"],[400,100,"cuatrocientos[ →→]"],[500,100,"quinientos[ →→]"],[600,100,"seiscientos[ →→]"],[700,100,"setecientos[ →→]"],[800,100,"ochocientos[ →→]"],[900,100,"novecientos[ →→]"],[1000,1000,"mil[ →→]"],[2000,1000,"←%spellout-cardinal-masculine← mil[ →→]"],[1000000,1000000,"un millón[ →→]"],[2000000,1000000,"←%spellout-cardinal-masculine← millones[ →→]"]],"%spellout-cardinal-masculine":[[-1,1,"menos →→"],[0,1,"cero"],[1,1,"un"],[2,1,"=%spellout-numbering="],[21,10,"veintiún"],[22,10,"=%spellout-numbering="],[30,10,"treinta[ y →→]"],[40,10,"cuarenta[ y →→]"],[50,10,"cincuenta[ y →→]"],[60,10,"sesenta[ y →→]"],[70,10,"setenta[ y →→]"],[80,10,"ochenta[ y →→]"],[90,10,"noventa[ y →→]"],[100,100,"cien"],[101,100,"ciento →→"],[200,100,"doscientos[ →→]"],[300,100,"trescientos[ →→]"],[400,100,"cuatrocientos[ →→]"],[500,100,"quinientos[ →→]"],[600,100,"seis­cientos[ →→]"],[700,100,"sete­cientos[ →→]"],[800,100,"ocho­cientos[ →→]"],[900,100,"nove­cientos[ →→]"],[1000,1000,"mil[ →→]"],[2000,1000,"←%spellout-cardinal-masculine← mil[ →→]"],[1000000,1000000,"un millón[ →→]"],[2000000,1000000,"←%spellout-cardinal-masculine← millones[ →→]"]]}},"icelandic":{"locale":"is","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal-masculine="]],"%spellout-cardinal-masculine":[[-1,1,"mínus →→"],[0,1,"núll"],[1,1,"einn"],[2,1,"tveir"],[3,1,"þrír"],[4,1,"fjórir"],[5,1,"fimm"],[6,1,"sex"],[7,1,"sjó"],[8,1,"átta"],[9,1,"níu"],[10,10,"tíu"],[11,10,"ellefu"],[12,10,"tólf"],[13,10,"þrettán"],[14,10,"fjórtán"],[15,10,"fimmtán"],[16,10,"sextán"],[17,10,"sautján"],[18,10,"átján"],[19,10,"nítján"],[20,10,"tuttugu[ og →→]"],[30,10,"þrjátíu[ og →→]"],[40,10,"fjörutíu[ og →→]"],[50,10,"fimmtíu[ og →→]"],[60,10,"sextíu[ og →→]"],[70,10,"sjötíu[ og →→]"],[80,10,"áttatíu[ og →→]"],[90,10,"níutíu[ og →→]"],[100,100,"←%spellout-cardinal-neuter←­hundrað[ og →→]"],[1000,1000,"←%spellout-cardinal-neuter← þúsund[ og →→]"],[1000000,1000000,"ein millión[ og →→]"],[2000000,1000000,"←%spellout-cardinal-feminine← milliónur[ og →→]"]],"%spellout-cardinal-feminine":[[-1,1,"mínus →→"],[0,1,"núll"],[1,1,"ein"],[2,1,"tvær"],[3,1,"þrjár"],[4,1,"fjórar"],[5,1,"=%spellout-cardinal-masculine="],[20,10,"tuttugu[ og →→]"],[30,10,"þrjátíu[ og →→]"],[40,10,"fjörutíu[ og →→]"],[50,10,"fimmtíu[ og →→]"],[60,10,"sextíu[ og →→]"],[70,10,"sjötíu[ og →→]"],[80,10,"áttatíu[ og →→]"],[90,10,"níutíu[ og →→]"],[100,100,"←%spellout-cardinal-neuter←­hundrað[ og →→]"],[1000,1000,"←%spellout-cardinal-neuter← þúsund[ og →→]"],[1000000,1000000,"ein millión[ og →→]"],[2000000,1000000,"←%spellout-cardinal-feminine← milliónur[ og →→]"]],"%spellout-cardinal-neuter":[[-1,1,"mínus →→"],[0,1,"núll"],[1,1,"eitt"],[2,1,"tvö"],[3,1,"þrjú"],[4,1,"fjögur"],[5,1,"=%spellout-cardinal-masculine="],[20,10,"tuttugu[ og →→]"],[30,10,"þrjátíu[ og →→]"],[40,10,"fjörutíu[ og →→]"],[50,10,"fimmtíu[ og →→]"],[60,10,"sextíu[ og →→]"],[70,10,"sjötíu[ og →→]"],[80,10,"áttatíu[ og →→]"],[90,10,"níutíu[ og →→]"],[100,100,"←%spellout-cardinal-neuter←­hundrað[ og →→]"],[1000,1000,"←%spellout-cardinal-neuter← þúsund[ og →→]"],[1000000,1000000,"ein millión[ og →→]"],[2000000,1000000,"←%spellout-cardinal-feminine← milliónur[ og →→]"]]}},"esperanto":{"locale":"eo","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"minus →→"],[0,1,"nulo"],[1,1,"unu"],[2,1,"du"],[3,1,"tri"],[4,1,"kvar"],[5,1,"kvin"],[6,1,"ses"],[7,1,"sep"],[8,1,"ok"],[9,1,"naŭ"],[10,10,"dek[ →→]"],[20,10,"←←dek[ →→]"],[100,100,"cent[ →→]"],[200,100,"←←cent[ →→]"],[1000,1000,"mil[ →→]"],[2000,1000,"←← mil[ →→]"],[1000000,1000000,"miliono[ →→]"],[2000000,1000000,"←← milionoj[ →→]"]]}},"italian":{"locale":"it","sets":{"%spellout-numbering":[[-1,1,"meno →→"],[0,1,"zero"],[1,1,"uno"],[2,1,"due"],[3,1,"tre"],[4,1,"quattro"],[5,1,"cinque"],[6,1,"sei"],[7,1,"sette"],[8,1,"otto"],[9,1,"nove"],[10,10,"dieci"],[11,10,"undici"],[12,10,"dodici"],[13,10,"tredici"],[14,10,"quattordici"],[15,10,"quindici"],[16,10,"sedici"],[17,10,"diciassette"],[18,10,"diciotto"],[19,10,"diciannove"],[20,10,"vent→%%msco-with-i→"],[30,10,"trent→%%msco-with-a→"],[40,10,"quarant→%%msco-with-a→"],[50,10,"cinquant→%%msco-with-a→"],[60,10,"sessant→%%msco-with-a→"],[70,10,"settant→%%msco-with-a→"],[80,10,"ottant→%%msco-with-a→"],[90,10,"novant→%%msco-with-a→"],[100,100,"cent→%%msco-with-o→"],[200,100,"←←­cent→%%msco-with-o→"],[1000,1000,"mille[­→→]"],[2000,1000,"←%%msc-no-final←­mila[­→→]"],[1000000,1000000,"un milione[ →→]"],[2000000,1000000,"←%spellout-cardinal-masculine← milioni[ →→]"]],"%spellout-cardinal-masculine":[[-1,1,"meno →→"],[0,1,"zero"],[1,1,"un"],[2,1,"=%spellout-numbering="],[20,10,"vent→%%msc-with-i→"],[30,10,"trent→%%msc-with-a→"],[40,10,"quarant→%%msc-with-a→"],[50,10,"cinquant→%%msc-with-a→"],[60,10,"sessant→%%msc-with-a→"],[70,10,"settant→%%msc-with-a→"],[80,10,"ottant→%%msc-with-a→"],[90,10,"novant→%%msc-with-a→"],[100,100,"cent→%%msc-with-o→"],[200,100,"←←­cent→%%msc-with-o→"],[1000,1000,"mille[­→→]"],[2000,1000,"←%%msc-no-final←­mila[­→→]"],[1000000,1000000,"un milione[ →→]"],[2000000,1000000,"←%spellout-cardinal-masculine← milioni[ →→]"]],"%%msc-no-final":[[0,1,"=%spellout-cardinal-masculine="],[20,10,"vent→%%msc-with-i-nofinal→"],[30,10,"trent→%%msc-with-a-nofinal→"],[40,10,"quarant→%%msc-with-a-nofinal→"],[50,10,"cinquant→%%msc-with-a-nofinal→"],[60,10,"sessant→%%msc-with-a-nofinal→"],[70,10,"settant→%%msc-with-a-nofinal→"],[80,10,"ottant→%%msc-with-a-nofinal→"],[90,10,"novant→%%msc-with-a-nofinal→"],[100,100,"cent→%%msc-with-o-nofinal→"],[200,100,"←←­cent→%%msc-with-o-nofinal→"]],"%%msc-with-o-nofinal":[[0,1,"=%%msc-with-o="],[3,1,"o­tre"],[4,1,"=%%msc-with-o="]],"%%msc-with-o":[[0,1,"o"],[1,1,"o­uno"],[2,1,"o­due"],[3,1,"o­tré"],[4,1,"o­=%spellout-numbering="],[8,1,"­otto"],[9,1,"o­=%spellout-numbering="],[80,10,"­=%spellout-numbering="],[90,10,"o­=%spellout-numbering="]],"%%msc-with-a-nofinal":[[0,1,"=%%msc-with-a="],[3,1,"a­tre"],[4,1,"=%%msc-with-a="]],"%%msc-with-a":[[0,1,"a"],[1,1,"­un"],[2,1,"=%%msco-with-a="]],"%%msco-with-a":[[0,1,"a"],[1,1,"­uno"],[2,1,"a­due"],[3,1,"a­tré"],[4,1,"a­=%spellout-numbering="],[8,1,"­otto"],[9,1,"a­nove"]],"%%msc-with-i-nofinal":[[0,1,"=%%msc-with-i="],[3,1,"i­tre"],[4,1,"=%%msc-with-i="]],"%%msc-with-i":[[0,1,"i"],[1,1,"­un"],[2,1,"=%%msco-with-i="]],"%%msco-with-i":[[0,1,"i"],[1,1,"­uno"],[2,1,"i­due"],[3,1,"i­tré"],[4,1,"i­=%spellout-numbering="],[8,1,"­otto"],[9,1,"i­nove"]],"%%msco-with-o":[[0,1,"o"],[1,1,"o­uno"],[2,1,"o­due"],[3,1,"o­tré"],[4,1,"o­=%spellout-numbering="],[8,1,"­otto"],[9,1,"o­=%spellout-numbering="],[80,10,"­=%spellout-numbering="],[90,10,"o­=%spellout-numbering="]]}},"portuguese":{"locale":"pt","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal-masculine="]],"%spellout-cardinal-masculine":[[-1,1,"menos →→"],[0,1,"zero"],[1,1,"um"],[2,1,"dois"],[3,1,"três"],[4,1,"quatro"],[5,1,"cinco"],[6,1,"seis"],[7,1,"sete"],[8,1,"oito"],[9,1,"nove"],[10,10,"dez"],[11,10,"onze"],[12,10,"doze"],[13,10,"treze"],[14,10,"catorze"],[15,10,"quinze"],[16,10,"dezesseis"],[17,10,"dezessete"],[18,10,"dezoito"],[19,10,"dezenove"],[20,10,"vinte[ e →→]"],[30,10,"trinta[ e →→]"],[40,10,"quarenta[ e →→]"],[50,10,"cinquenta[ e →→]"],[60,10,"sessenta[ e →→]"],[70,10,"setenta[ e →→]"],[80,10,"oitenta[ e →→]"],[90,10,"noventa[ e →→]"],[100,100,"cem"],[101,100,"cento e →→"],[200,100,"duzentos[ e →→]"],[300,100,"trezentos[ e →→]"],[400,100,"quatrocentos[ e →→]"],[500,100,"quinhentos[ e →→]"],[600,100,"seiscentos[ e →→]"],[700,100,"setecentos[ e →→]"],[800,100,"oitocentos[ e →→]"],[900,100,"novecentos[ e →→]"],[1000,1000,"mil[→%%spellout-cardinal-masculine-with-e→]"],[2000,1000,"←← mil[→%%spellout-cardinal-masculine-with-e→]"],[1000000,1000000,"←← $(cardinal,one{milhão}other{milhões})$[→%%spellout-cardinal-masculine-with-e→]"]],"%%spellout-cardinal-masculine-with-e":[[0,1," e =%spellout-cardinal-masculine="],[100,100,"→%%optional-e→=%spellout-cardinal-masculine="]],"%%optional-e":[[0,1," e "],[1,1," "]]}},"french":{"locale":"fr","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal-masculine="]],"%spellout-cardinal-masculine":[[-1,1,"moins →→"],[0,1,"zéro"],[1,1,"un"],[2,1,"deux"],[3,1,"trois"],[4,1,"quatre"],[5,1,"cinq"],[6,1,"six"],[7,1,"sept"],[8,1,"huit"],[9,1,"neuf"],[10,10,"dix"],[11,10,"onze"],[12,10,"douze"],[13,10,"treize"],[14,10,"quatorze"],[15,10,"quinze"],[16,10,"seize"],[17,10,"dix-→→"],[20,10,"vingt[-→%%et-un→]"],[30,10,"trente[-→%%et-un→]"],[40,10,"quarante[-→%%et-un→]"],[50,10,"cinquante[-→%%et-un→]"],[60,20,"soixante[-→%%et-un→]"],[80,20,"quatre-vingt→%%subcents-m→"],[100,100,"cent[ →→]"],[200,100,"←← cent→%%cents-m→"],[1000,1000,"mille[ →→]"],[2000,1000,"←%%spellout-leading← mille[ →→]"],[1000000,1000000,"un million[ →→]"],[2000000,1000000,"←%%spellout-leading← millions[ →→]"]],"%%spellout-leading":[[0,1,"=%spellout-cardinal-masculine="],[80,20,"quatre-vingt[-→→]"],[100,100,"cent[ →→]"],[200,100,"←← cent[ →→]"],[1000,1000,"=%spellout-cardinal-masculine="]],"%%cents-m":[[0,1,"s"],[1,1," =%spellout-cardinal-masculine="]],"%%subcents-m":[[0,1,"s"],[1,1,"-=%spellout-cardinal-masculine="]],"%%et-un":[[1,1,"et-un"],[2,1,"=%spellout-cardinal-masculine="],[11,10,"et-onze"],[12,10,"=%spellout-cardinal-masculine="]]}},"finnish":{"locale":"fi","sets":{"%spellout-numbering":[[0,1,"=%spellout-cardinal="]],"%spellout-cardinal":[[-1,1,"miinus →→"],[0,1,"nolla"],[1,1,"yksi"],[2,1,"kaksi"],[3,1,"kolme"],[4,1,"neljä"],[5,1,"viisi"],[6,1,"kuusi"],[7,1,"seitsemän"],[8,1,"kahdeksan"],[9,1,"yhdeksän"],[10,10,"kymmenen"],[11,10,"→→toista"],[20,10,"←←­kymmentä[­→→]"],[100,100,"sata[­→→]"],[200,100,"←←­sataa[­→→]"],[1000,1000,"tuhat[­→→]"],[2000,1000,"←←­tuhatta[­→→]"],[1000000,1000000,"←← miljoona[ →→]"],[2000000,1000000,"←← miljoonaa[ →→]"]]}}};
const odiaCardinals=["ଶୂନ୍ୟ","ଏକ","ଦୁଇ","ତିନି","ଚାରି","ପାଞ୍ଚ","ଛଅ","ସାତ","ଆଠ","ନଅ","ଦଶ","ଏଗାର","ବାର","ତେର","ଚଉଦ","ପନ୍ଦର","ଷୋହଳ","ସତର","ଅଠର","ଉଣେଇଶି","କୋଡ଼ିଏ","ଏକୋଇଶି","ବାଇଶି","ତେଇଶି","ଚବିଶି","ପଚିଶି","ଛବିଶି","ସତେଇଶି","ଅଠେଇଶି","ଅଣତିରିଶି","ତିରିଶ","ଏକତିରିଶି","ବତିଶି","ତେତିଶି","ଚଉତିରିଶି","ପଞ୍ଚତିରିଶି","ଛତିଶି","ସଇଁତିରିଶି","ଅଠତିରିଶି","ଅଣଚାଳିଶି","ଚାଳିଶ","ଏକଚାଳିଶି","ବୟାଳିଶି","ତେୟାଳିଶି","ଚଉରାଳିଶି","ପଞ୍ଚଚାଳିଶି","ଛୟାଳିଶି","ସତଚାଳିଶି","ଅଠଚାଳିଶି","ଅଣଚାଶ","ପଚାଶ","ଏକାବନ","ବାଉନ","ତେପନ","ଚଉବନ","ପଞ୍ଚାବନ","ଛପନ","ସତାବନ","ଅଠାବନ","ଅଣଷଠି","ଷାଠିଏ","ଏକଷଠି","ବାଷଠି","ତେଷଠି","ଚଉଷଠି","ପଞ୍ଚଷଠି","ଛଅଷଠି","ସତଷଠି","ଅଠଷଠି","ଅଣସ୍ତରି","ସତୁରି","ଏକସ୍ତରି","ବାସ୍ତରି","ତେସ୍ତରି","ଚଉସ୍ତରି","ପଞ୍ଚସ୍ତରି","ଛଅସ୍ତରି","ସତସ୍ତରି","ଅଠସ୍ତରି","ଅଣାଅଶୀ","ଅଶୀ","ଏକାଅଶୀ","ବୟାଅଶୀ","ତେୟାଅଶୀ","ଚଉରାଅଶୀ","ପଞ୍ଚାଅଶୀ","ଛୟାଅଶୀ","ସତାଅଶୀ","ଅଠାଅଶୀ","ଅଣାନବେ","ନବେ","ଏକାନବେ","ବୟାନବେ","ତେୟାନବେ","ଚଉରାନବେ","ପଞ୍ଚାନବେ","ଛୟାନବେ","ସତାନବେ","ଅଠାନବେ","ଅନେଶୋତ"];
const jamaicanCardinals=[["ziiro","wan","tuu","chrii","fuor","faiv","siks","sebn","iet","nain","ten","lebm","twelb","tertiin","fuotiin","fiftiin","sikstiin","sebntiin","ietiin","naintiin"],["twenti","toti","faati","fifti","siksti","sevnti","ieti","nainti"]];

const maxCardinal=999999999;
const digitBases=[0x30,0x660,0x6f0,0xb66,0x17e0,0xff10];
const numberDigits=/[0-9٠-٩۰-۹୦-୯០-៩０-９]/u;
const wholeCardinal=/^\s*[-−]?[0-9٠-٩۰-۹୦-୯០-៩０-９]+\s*$/u;
const cardinalSpans=/[-−]?[0-9٠-٩۰-۹୦-୯០-៩０-９]+/gu;
const attachedNumber=/[\p{L}\p{N}\p{M}\p{Sc}_+#@%٪×÷=]/u;

function parseCardinal(spelling) {
  const unsigned=spelling.replace(/^[-−]/u,'');
  if(unsigned.length>9)return null;
  const base=digitBases.find(first=>unsigned.codePointAt(0)>=first&&unsigned.codePointAt(0)<first+10);
  if(base===undefined)return null;
  const digits=[...unsigned].map(digit=>digit.codePointAt(0)-base);
  if(digits.some(digit=>digit<0||digit>9)||digits.length>1&&digits[0]===0)return null;
  const value=Number(digits.join(''));
  return spelling===unsigned?value:-value;
}

function spellCLDRCardinal(value,{locale,sets}) {
  function format(number,name='%spellout-numbering',depth=0,forceIndex) {
    if(depth>24)throw Error('Numeric rule recursion');
    const rules=sets[name];
    const at=forceIndex??(number<0?rules.findIndex(([base])=>base===-1):rules.findLastIndex(([base])=>base>=0&&base<=number));
    if(number<0&&at<0) {
      const alias=rules.flatMap(([base,_,rule])=>base>=0?[rule.match(/^=(%%?[\w-]+)=$/u)]:[]).find(Boolean);
      if(alias)return format(number,alias[1],depth+1);
    }
    if(at<0)throw Error('Missing cardinal rule');
    const [base,divisor,pattern]=rules[at];
    const rest=number<0?-number:number%divisor;
    if(number>=0&&at>0&&base%divisor!==0&&rest===0&&pattern.includes('→'))return format(number,name,depth+1,at-1);
    const quotient=Math.floor(number/divisor);
    return pattern.replace(/\[([^\]]*)\]/gu,(_,inside)=>rest?inside:'')
      .replace(/\$\((cardinal|ordinal),([^)]*)\)\$/gu,(_,type,choices)=>{
        const forms=Object.fromEntries([...choices.matchAll(/(\w+)\{([^}]*)\}/gu)].map(([,key,text])=>[key,text]));
        return forms[new Intl.PluralRules(locale,{type}).select(quotient)]??forms.other??'';
      })
      .replace(/→→→|([←→=])([^←→=]*?)\1/gu,(token,operator,rule)=>{
        if(token==='→→→')return format(rest,name,depth+1,at-1);
        if(rule&&!rule.startsWith('%'))throw Error('Non-spellout cardinal rule');
        return format(operator==='←'?quotient:operator==='→'?rest:number,rule||name,depth+1);
      });
  }
  return format(value);
}

function spellLocalCardinal(value,source) {
  const odia=source==='odia';
  if(value<0)return (odia?'ବିଯୁକ୍ତ':'mainas')+' '+spellLocalCardinal(-value,source);
  if(odia&&value<100)return odiaCardinals[value];
  if(!odia&&value<20)return jamaicanCardinals[0][value];
  if(!odia&&value<100) {
    const tens=jamaicanCardinals[1][Math.floor(value/10)-2],rest=value%10;
    return rest?tens+'-'+jamaicanCardinals[0][rest]:tens;
  }
  const groups=odia?[[10000000,'କୋଟି'],[100000,'ଲକ୍ଷ'],[1000,'ହଜାର'],[100,'ଶହ']]:
    [[1000000,'miliyan'],[1000,'touzn'],[100,'onjrid']];
  const [base,word]=groups.find(([n])=>value>=n);
  const prefix=spellLocalCardinal(Math.floor(value/base),source)+' '+word;
  return value%base?prefix+' '+spellLocalCardinal(value%base,source):prefix;
}

function cardinalWords(value,source) {
  if(!Number.isInteger(value)||Math.abs(value)>maxCardinal)return '';
  let words;
  try {
    words=cardinalData[source]?spellCLDRCardinal(value,cardinalData[source]):spellLocalCardinal(value,source);
  } catch {
    return '';
  }
  return /[\d←→$=%[\]{}]/u.test(words)?'':words.replaceAll('\u00ad','').trim();
}

const arabicCardinalMarks=map('صفر=صِفْر واحد=وَاحِد أحد=أَحَد إثنا=إِثْنَا إثنان=إِثْنَان ثلاثة=ثَلَاثَة أربعة=أَرْبَعَة خمسة=خَمْسَة ستة=سِتَّة سبعة=سَبْعَة ثمانية=ثَمَانِيَة تسعة=تِسْعَة عشر=عَشَر عشرة=عَشَرَة عشرون=عِشْرُون ثلاثون=ثَلَاثُون أربعون=أَرْبَعُون خمسون=خَمْسُون ستون=سِتُّون سبعون=سَبْعُون ثمانون=ثَمَانُون تسعون=تِسْعُون مائة=مِئَة مائتان=مِئَتَان ألف=أَلْف ألفين=أَلْفَيْن آلاف=آلَاف مليون=مِلْيُون ناقص=نَاقِص');

function arabicCardinalReading(words) {
  const parts=words.split(/\s+/u).map(word=>{
    const full=arabicCardinalMarks[word];
    if(full)return arabicPhonemes(full);
    const suffix=word.startsWith('و')&&arabicCardinalMarks[word.slice(1)];
    return suffix?'wa'+arabicPhonemes(suffix):'';
  });
  return parts.every(Boolean)?parts.join(' '):'';
}

function canReadEmbeddedCardinal(input,start,end) {
  const before=input.slice(0,start),after=input.slice(end);
  const prior=before.at(-1)??'',following=after[0]??'';
  if(attachedNumber.test(prior)||attachedNumber.test(following))return false;
  const compound=/[.:\/\-−–—]/u, alphanumeric=/[\p{L}\p{N}]/u;
  if(compound.test(prior)&&alphanumeric.test(before.at(-2)??''))return false;
  if(compound.test(following)&&alphanumeric.test(after[1]??''))return false;
  const connector=/[.,:\/\-−–—٪٫٬]/u;
  if(connector.test(prior)&&numberDigits.test(before.at(-2)??''))return false;
  if(connector.test(following)&&numberDigits.test(after[1]??''))return false;
  return !/(?<=\p{Nd})[ \u00a0\u202f]+$/u.test(before)&&!/^[ \u00a0\u202f]+\p{Nd}/u.test(after);
}

async function cardinalInputChunks(input,source,variant,embedded) {
  if(!embedded&&!wholeCardinal.test(input))return null;
  const spans=[...input.matchAll(cardinalSpans)].flatMap(({0:spelling,index})=>{
    const end=index+spelling.length;
    if(!canReadEmbeddedCardinal(input,index,end))return [];
    const value=parseCardinal(spelling);
    let words=cardinalWords(value,source);
    if(source==='japanese'&&value===0)words='ゼロ';
    if(source==='mandarin')words=words.replaceAll('〇','零');
    if(source==='arabic')words=words.replaceAll('إحدى عشر','أحد عشر');
    if(source==='romanian')words=words.replaceAll('una sută','o sută').replaceAll('una mie','o mie');
    if(source==='icelandic')words=words.replaceAll('milliónur','milljónir').replaceAll('millión','milljón');
    return words?[{index,end,spelling,words}]:[];
  });
  if(!spans.length)return null;
  const pending=[];
  let offset=0;
  for(const {index,end,spelling,words} of spans){
    if(index>offset)pending.push(readMixedText(input.slice(offset,index),source,variant));
    const tagged=source==='arabic'?arabicCardinalReading(words):'';
    pending.push(tagged?Promise.resolve([{original:spelling,ipa:tagged,numberWords:words}]):readSourceText(words,source,variant).then(pieces=>{
      if(pieces.some(piece=>piece.unknown||!piece.ipa&&/[\p{L}\p{Nl}]/u.test(piece.original)))return [{original:spelling}];
      let ipa='',gap=false;
      for(const piece of pieces) {
        if(!piece.ipa) {
          gap||=/\s/u.test(piece.original)||piece.wordBoundary;
          continue;
        }
        if(tokenizeIPA(piece.ipa,source).unknownPhones.size)return [{original:spelling}];
        if(ipa&&(gap||piece.phraseBreak||piece.spaceBefore))ipa+=' ';
        ipa+=piece.ipa;
        gap=false;
      }
      return ipa?[{original:spelling,ipa,numberWords:words}]:[{original:spelling}];
    }).catch(()=>[{original:spelling}]));
    offset=end;
  }
  if(offset<input.length)pending.push(readMixedText(input.slice(offset),source,variant));
  return (await Promise.all(pending)).flat();
}

/* libtashkeel-wasm 1.6.4, https://github.com/mush42/libtashkeel
MIT License

Copyright (c) 2023 Musharraf

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const arabicVocalizerPayload=asset("arabic-vocalizer-data-1.bin");
async function makeArabicVocalizer() {
let wasm;
function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
* @param {string} text
* @param {number | undefined} [taskeen_threshold]
* @param {boolean | undefined} [preprocessed]
* @returns {string}
*/
function do_tashkeel(text, taskeen_threshold, preprocessed) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.do_tashkeel(retptr, ptr0, len0, !isLikeNone(taskeen_threshold), isLikeNone(taskeen_threshold) ? 0 : taskeen_threshold, isLikeNone(preprocessed) ? 0xFFFFFF : preprocessed ? 1 : 0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        deferred2_0 = r0;
        deferred2_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

function __wbg_now_3014639a94423537() {
    const ret = Date.now();
    return ret;
};

function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};


    const binary=await decompressData(arabicVocalizerPayload).arrayBuffer();
    const {instance}=await WebAssembly.instantiate(binary,{"./libtashkeel_wasm_bg.js":{__wbg_now_3014639a94423537,__wbindgen_throw}});
    __wbg_set_wasm(instance.exports);
    return do_tashkeel;
}

const arabicLetters=/[\u0621-\u063a\u0641-\u064a\u0671]/u;
const arabicWords=/(?=\p{L})\p{Script=Arabic}(?:(?=\p{L})\p{Script=Arabic}|\p{M})*/gu;
const arabicGraphemes=/([\u0621-\u063a\u0641-\u064a\u0671])([\u064b-\u0652\u0670]*)/gu;
const arabicVowels=map('َ=a ُ=u ِ=i ً=an ٌ=un ٍ=in ٰ=aː');
const arabicVocalizedConsonants=map('ء=ʔ أ=ʔ إ=ʔ ؤ=ʔ ئ=ʔ ب=b ت=t ث=θ ج=d͡ʒ ح=ħ خ=x د=d ذ=ð ر=r ز=z س=s ش=ʃ ص=sˤ ض=dˤ ط=tˤ ظ=ðˤ ع=ʕ غ=ɣ ف=f ق=q ك=k ل=l م=m ن=n ه=h و=w ي=j');
let arabicVocalizerRequest;

function vocalizedArabicLetters(word) {
  return [...word.normalize('NFC').matchAll(arabicGraphemes)];
}

function explicitArabicMarks(original,predicted) {
  const words=vocalizedArabicLetters(original), vocalized=vocalizedArabicLetters(predicted);
  return words.map(([,letter,marks],index)=>{
    let inferred=vocalized[index][2];
    if(/[ً-ِْٰ]/u.test(marks))inferred=inferred.replace(/[ً-ِْٰ]/gu,'');
    return letter+[...new Set(marks+inferred)].join('');
  }).join('');
}

function arabicPhonemes(word) {
  const graphemes=vocalizedArabicLetters(word);
  if(!graphemes.length||graphemes.map(letter=>letter[0]).join('')!==word.normalize('NFC'))return '';
  const spelling=graphemes.map(letter=>letter[1]).join('');
  const article=spelling.match(/^(?:[وف])?(?:(?:[بك])?[اٱ]ل|لل)(?=.)/u);
  const articleL=article?article[0].length-1:-1;
  const sounds=[];
  for(const [index,[,letter,marks]] of graphemes.entries()) {
    const last=index===graphemes.length-1;
    const previous=sounds.at(-1);
    const vowelMark=[...marks].find(mark=>arabicVowels[mark]);
    const vowel=arabicVowels[vowelMark]??'';
    const next=graphemes[index+1];
    if(letter==='آ') {
      sounds.push('ʔ','aː');
    } else if(letter==='ا'||letter==='ٱ'||letter==='ى') {
      if(index===0) {
        const opening=articleL===1?'a':next?.[2].replace('ّ','')==='ْ'?'i':'a';
        sounds.push('ʔ',vowel||opening);
      } else if(index===articleL-1) {
        continue;
      } else if(previous==='an'&&last) {
        continue;
      } else if(vowel==='an'&&last) {
        if(previous==='a')sounds.pop();
        sounds.push('an');
      } else if(previous==='aː'&&last) {
        continue;
      } else {
        if(previous==='a')sounds.pop();
        if(previous==='i'||previous==='u'||marks.includes('ْ'))return '';
        sounds.push('aː');
      }
    } else if(letter==='ة') {
      if(!last)return '';
      if(previous==='a')sounds.pop();
      sounds.push('a');
    } else if(index===articleL&&next?.[2].includes('ّ')&&arabicSunLetters[next[1]]) {
      continue;
    } else if(!marks&&((letter==='و'&&previous==='u')||(letter==='ي'&&previous==='i'))) {
      sounds[sounds.length-1]=previous+'ː';
    } else {
      const consonant=arabicVocalizedConsonants[letter];
      if(!consonant)return '';
      sounds.push(consonant+(marks.includes('ّ')?'ː':''));
      if(vowel)sounds.push(vowel);
    }
  }
  const ipa=sounds.join('');
  return /[aiu]/u.test(ipa)?ipa:'';
}

function arabicWordShape(word) {
  return [...word].filter(char=>arabicLetters.test(char)).join('');
}

function collectArabicReadings(vocalize,input,context,readings,only) {
  for(const {0:line,index:lineStart} of context.matchAll(/[^\r\n.!?؟]+/gu)) {
    if(line.length>1000)continue;
    const originals=[...line.matchAll(arabicWords)];
    const words=originals.map(match=>match[0].normalize('NFC'));
    const shapes=words.map(arabicWordShape);
    let predicted;
    try {predicted=[...vocalize(line.normalize('NFC')).matchAll(arabicWords)];}
    catch {continue;}
    if(predicted.length!==words.length||predicted.some((match,index)=>arabicWordShape(match[0])!==shapes[index]))continue;
    for(const [index,match] of originals.entries()) {
      const word=words[index], guessed=predicted[index][0];
      const start=lineStart+match.index;
      if(only&&!only.has(start))continue;
      const exact=input.slice(start,start+match[0].length);
      const graphemes=vocalizedArabicLetters(word);
      if(!shapes[index]||graphemes.map(letter=>letter[0]).join('')!==word||shapes[index]!==arabicWordShape(guessed))continue;
      const guessedLetters=vocalizedArabicLetters(guessed);
      if(guessedLetters.length!==graphemes.length)continue;
      const ipa=arabicPhonemes(explicitArabicMarks(word,guessed));
      if(!ipa||tokenizeIPA(ipa,'arabic').unknownPhones.size)continue;
      readings.set(start,{original:exact,ipa,spellingRecovered:word!==exact.normalize('NFC')});
    }
  }
}

async function recoverArabicReadings(chunks,source) {
  if(source!=='arabic'||!chunks.some(chunk=>chunk.unknown&&[...chunk.original.matchAll(arabicWords)].some(([word])=>arabicLetters.test(word.normalize('NFC')))))return chunks;
  let vocalize;
  try {
    arabicVocalizerRequest??=makeArabicVocalizer().catch(error=>{arabicVocalizerRequest=undefined;throw error;});
    vocalize=await arabicVocalizerRequest;
  } catch {
    return chunks;
  }
  const input=chunks.map(chunk=>chunk.original).join('');
  const readings=new Map();
  collectArabicReadings(vocalize,input,input,readings);
  const recoverable=new Set();
  let contextOffset=0;
  const context=chunks.map(chunk=>{
    const start=contextOffset;
    contextOffset+=chunk.original.length;
    if(!chunk.arabicSpelling||readings.has(start))return chunk.original;
    recoverable.add(start);
    return chunk.arabicSpelling;
  }).join('');
  if(recoverable.size)collectArabicReadings(vocalize,input,context,readings,recoverable);

  let offset=0;
  return chunks.flatMap(chunk=>{
    const start=offset;
    offset+=chunk.original.length;
    if(!chunk.unknown)return [chunk];
    let pieceOffset=start;
    return splitMissingText(chunk.original).map(piece=>{
      const reading=readings.get(pieceOffset);
      pieceOffset+=piece.original.length;
      return piece.unknown&&reading?.original===piece.original?
        {...piece,ipa:reading.ipa,unknown:false,vocalized:true,spellingRecovered:reading.spellingRecovered}:piece;
    });
  });
}

// Rank existing dictionary readings against a pronunciation of their phrase.
// A candidate may be selected only when the phrase can be aligned and the
// alternative is appreciably closer. This step never invents a dictionary IPA.
function comparisonPhones(tokens) {
  return tokens.flatMap(phone=>{
    if(!phone.sound)return [];
    if(phone.sound!=='ɝ' && phone.sound!=='ɚ')return [phone];
    return [{...phone,sound:phone.sound==='ɝ'?'ɜ':'ə'},
      {sound:'ɹ',vowel:false,marks:'',nasal:false,length:false}];
  });
}

function speechPhones(ipa,source) {
  return comparisonPhones(tokenizeIPA(ipa,source));
}

function mapPhonemeBoundaries(primary,reference) {
  const rows=primary.length+1,columns=reference.length+1;
  const trail=new Uint8Array(rows*columns);
  let before=new Float64Array(columns),after=new Float64Array(columns);
  for(let j=1;j<columns;j++) {before[j]=j*0.82;trail[j]=2;}
  for(let i=1;i<rows;i++) {
    const row=i*columns;
    after[0]=i*0.88;
    trail[row]=1;
    for(let j=1;j<columns;j++) {
      const paired=before[j-1]+phoneDistance(primary[i-1],reference[j-1]);
      const removal=before[j]+0.88, insertion=after[j-1]+0.82;
      if(paired<=removal&&paired<=insertion){after[j]=paired;trail[row+j]=0;}
      else if(removal<=insertion){after[j]=removal;trail[row+j]=1;}
      else {after[j]=insertion;trail[row+j]=2;}
    }
    [before,after]=[after,before];
  }
  const positions=new Int32Array(rows).fill(-1);
  let i=rows-1,j=columns-1;
  while(i||j) {
    if(positions[i]===-1)positions[i]=j;
    const direction=trail[i*columns+j];
    if(direction!==2)i--;
    if(direction!==1)j--;
  }
  positions[0]=0;
  return {positions,distance:before[columns-1]};
}

function choosePhraseReadings(phrase,referenceIPA,source) {
  if(/[()[\]{}]/u.test(referenceIPA))return phrase;
  const reference=speechPhones(referenceIPA,source);
  const primary=[];
  const spans=phrase.map(chunk=>{
    const start=primary.length;
    if(chunk.ipa)for(const phone of speechPhones(chunk.ipa,source))primary.push(phone);
    return {start,end:primary.length};
  });
  if(!primary.length||!reference.length||reference.length>850||primary.length>850)return phrase;
  const {positions,distance}=mapPhonemeBoundaries(primary,reference);
  if(distance/Math.max(primary.length,reference.length)>0.48)return phrase;
  return phrase.map((chunk,index)=>{
    if(!chunk.alternatives?.length)return chunk;
    const {start,end}=spans[index];
    const local=reference.slice(positions[start],positions[end]);
    if(!local.length)return chunk;
    let baseline,best=Infinity,chosen=chunk.ipa;
    for(const ipa of chunk.alternatives) {
      const parsed=tokenizeIPA(ipa,source);
      const candidate=comparisonPhones(parsed);
      if(!candidate.length||parsed.unknownPhones.size)continue;
      const before=new Float64Array(candidate.length+1),after=new Float64Array(candidate.length+1);
      const score=ipaSequenceDistance(local,candidate,before,after);
      if(ipa===chunk.ipa)baseline=score;
      if(score<best){best=score;chosen=ipa;}
    }
    if(chosen===chunk.ipa||baseline===undefined||baseline-best<0.44||best/Math.max(local.length,1)>0.40)return chunk;
    return {...chunk,ipa:chosen,contextual:true};
  });
}

function contextPhrases(chunks) {
  const groups=[];
  let phrase=[];
  const flush=()=>{if(phrase.length)groups.push(phrase);phrase=[];};
  for(const chunk of chunks) {
    if(chunk.unknown || (chunk.ipa==null&&/[\p{N}\r\n.!?。！？;；]/u.test(chunk.original))) {
      flush();
      groups.push([chunk]);
    } else {
      phrase.push(chunk);
      if(phrase.length>=96)flush();
    }
  }
  flush();
  return groups;
}

// Restore printed word boundaries in a phrase reading when the component
// readings give a consistent alignment. The selected pronunciation stays intact.
function restorePhraseWordSpaces(chunks,source,table) {
  return chunks.map(chunk=>{
    if(!chunk.ipa||/\s/u.test(chunk.ipa)||!/\S\s+\S/u.test(chunk.original))return chunk;
    const words=[...chunk.original.matchAll(/\S+/gu)];
    if(words.length<2||words.length>12)return chunk;
    const primary=[], boundaries=[];
    for(const word of words) {
      const found=table[word[0]]??table[word[0].toLowerCase()];
      if(!found)return chunk;
      const parsed=tokenizeIPA(chooseDictionaryReading(found,source).ipa,source);
      const reading=comparisonPhones(parsed);
      if(!reading.length||parsed.unknownPhones.size)return chunk;
      if(primary.length)boundaries.push(primary.length);
      primary.push(...reading);
    }
    const parsed=tokenizeIPA(chunk.ipa,source,true);
    const reference=parsed.flatMap(phone=>comparisonPhones([phone]).map(part=>({...part,offset:phone.offset})));
    if(parsed.unknownPhones.size||reference.length<words.length||
      Math.max(primary.length,reference.length)>160)return chunk;
    const {positions,distance}=mapPhonemeBoundaries(primary,reference);
    if(distance/Math.max(primary.length,reference.length)>0.28)return chunk;
    const characters=parsed.inputCharacters.slice();
    let innerEnd=characters.length;
    for(let i=boundaries.length-1;i>=0;i--) {
      const boundary=positions[boundaries[i]];
      if(boundary<=0||boundary>=reference.length||reference[boundary-1].offset===reference[boundary].offset)return chunk;
      let offset=reference[boundary].offset;
      while(offset>0&&/[.ˈˌ]/u.test(characters[offset-1]))offset--;
      if(offset<=0||offset>=innerEnd)return chunk;
      const preceding=words[i],space=chunk.original.slice(preceding.index+preceding[0].length,words[i+1].index);
      characters.splice(offset,0,space);
      innerEnd=offset;
    }
    const ipa=characters.join('');
    return {...chunk,ipa,phraseSpacing:true};
  });
}


const phrasePunctuation=/[,،、.!?。！？؛;；:…「」『』“”„‘«»‹›（）()¿¡]/gu;
const hanPhraseSources=new Set(['mandarin','cantonese']);

function punctuatedPhraseParts(text) {
  const boundaries=[];
  for(const match of text.matchAll(phrasePunctuation)) {
    const [mark]=match, position=match.index;
    const before=text[position-1]??'', after=text[position+1]??'';
    if(mark===','&&/\p{N}/u.test(before)&&/\p{N}/u.test(after))continue;
    if((mark==='.'||mark===':')&&/[\p{L}\p{N}\p{M}]/u.test(before)&&/[\p{L}\p{N}\p{M}]/u.test(after))continue;
    let start=position, end=position+mark.length;
    while(start>0&&/[ \t]/u.test(text[start-1]))start--;
    while(end<text.length&&/[ \t]/u.test(text[end]))end++;
    const previous=boundaries.at(-1);
    if(previous&&start<=previous.end)previous.end=end;
    else boundaries.push({start,end});
  }
  const parts=[];
  let from=0;
  for(const {start,end} of boundaries) {
    if(from<start)parts.push({original:text.slice(from,start),spoken:true});
    parts.push({original:text.slice(start,end)});
    from=end;
  }
  if(from<text.length)parts.push({original:text.slice(from),spoken:true});
  return parts;
}

function splitDictionaryPhraseReading(ipa,parts,source,readPortion) {
  if(parts.length===1)return [ipa];
  const hasReading=text=>{
    const parsed=tokenizeIPA(text,source);
    return !parsed.unknownPhones.size&&parsed.some(phone=>phone.sound);
  };
  const clauses=ipa.trim().split(/\s*[|‖]+\s*/u);
  if(clauses.length===parts.length&&clauses.every(hasReading))return clauses;
  const groups=ipa.trim().split(/\s+/u);
  const unitCounts=parts.map(text=>hanPhraseSources.has(source)&&/^\p{Script=Han}+$/u.test(text)
    ? [...text].length
    : text.trim().split(/\s+/u).length);
  const hasWrittenBoundaries=unitCounts.reduce((sum,count)=>sum+count,0)===groups.length;
  if(hasWrittenBoundaries&&groups.every(hasReading)) {
    let start=0;
    return unitCounts.map(count=>{
      const reading=groups.slice(start,start+count).join(' ');
      start+=count;
      return reading;
    });
  }

  const primary=[], boundaries=[];
  for(const part of parts) {
    const chunks=readPortion(part);
    const reference=[];
    for(const chunk of chunks) {
      if(chunk.unknown)return null;
      if(!chunk.ipa)continue;
      const parsed=tokenizeIPA(chunk.ipa,source);
      if(parsed.unknownPhones.size)return null;
      reference.push(...comparisonPhones(parsed));
    }
    if(!reference.length)return null;
    if(primary.length)boundaries.push(primary.length);
    primary.push(...reference);
  }
  const parsed=tokenizeIPA(ipa,source,true);
  const reference=parsed.flatMap(phone=>comparisonPhones([phone]).map(part=>({...part,offset:phone.offset})));
  if(parsed.unknownPhones.size||reference.length<parts.length||Math.max(primary.length,reference.length)>160)return null;
  const {positions,distance}=mapPhonemeBoundaries(primary,reference);
  if(distance/Math.max(primary.length,reference.length)>0.28)return null;
  const readings=[];
  let start=0;
  for(const boundary of boundaries) {
    const position=positions[boundary];
    if(position<=0||position>=reference.length||reference[position-1].offset===reference[position].offset)return null;
    let end=reference[position].offset;
    while(end>start&&/[.ˈˌ]/u.test(parsed.inputCharacters[end-1]))end--;
    if(end<=start)return null;
    readings.push(parsed.inputCharacters.slice(start,end).join('').trim());
    start=end;
  }
  readings.push(parsed.inputCharacters.slice(start).join('').trim());
  return readings;
}

function restoreDictionaryPunctuation(chunks,source,readPortion) {
  return chunks.flatMap(chunk=>{
    if(!chunk.ipa)return [chunk];
    const parts=punctuatedPhraseParts(chunk.original);
    if(parts.length<2)return [chunk];
    const spoken=parts.filter(part=>part.spoken);
    const readings=splitDictionaryPhraseReading(chunk.ipa,spoken.map(part=>part.original),source,readPortion);
    if(!readings)return [chunk];
    let index=0;
    return parts.map(({original,spoken})=>spoken?{...chunk,original,ipa:readings[index++]}:{original});
  });
}

async function applyContextualPronunciation(chunks,source,variant) {
  if(!chunks.some(chunk=>chunk.alternatives?.length>1))return chunks;
  if(source==='french'&&variant==='QC')return chunks;
  const voice=espeakVariants[source]?.[variant]??espeakVoices[source];
  if(!voice)return chunks;
  let reader;
  try {
    reader=await loadEspeak();
    await within(reader.loadVoice(voice),12000,'문장 발음 데이터를 불러오지 못했습니다.');
    reader.setVoice(voice);
  } catch {return chunks;}
  return contextPhrases(chunks).flatMap(phrase=>{
    if(!phrase.some(chunk=>chunk.alternatives?.length>1))return phrase;
    const text=phrase.map(chunk=>chunk.original).join('').trim();
    if(!text||text.length>600)return phrase;
    let reference;
    try {reference=normalizeEspeakReading(reader.phonemes(text),source,voice);}
    catch {return phrase;}
    return choosePhraseReadings(phrase,reference,source);
  });
}

// These policies apply only to plain words confirmed by a source dictionary.
const sourceStressPolicies={
  spanish:{letters:/^[a-zñáéíóúü]+$/u},
  icelandic:{letters:/^[a-záðéíóúýþæö]+$/u,position:'first'},
  esperanto:{letters:/^[a-zĉĝĥĵŝŭ]+$/u,position:'penultimate'},
  swahili:{letters:/^[a-z]+[aeiou]$/u,position:'penultimate',maxSyllables:2},
};
const spanishWeakForms=new Set('aunque como cuando cuanto cuanta cuantos cuantas cuyos cuyas cuyo cuya desde donde durante entre hacia hasta mediante mientras para porque sobre versus'.split(' '));

function spanishWrittenSyllables(word) {
  const written=word.replace(/([qg])u(?=[eiéí])/gu,'$1')
    .replace(/([aeiouáéíóúü])h(?=[aeiouáéíóúü])/gu,'$1')
    .replace(/([aeiouáéíóúü])y$/u,'$1i');
  const open=/[aeoáéó]/u;
  const groups=[];
  let adjacent=false;
  for(const letter of written) {
    if(!/[aeiouáéíóúü]/u.test(letter)){adjacent=false;continue;}
    const previous=groups.at(-1), last=previous?.at(-1);
    const diphthong=adjacent&&previous.length<3&&letter!==last&&
      !(open.test(letter)&&open.test(last))&&!/[íú]/u.test(letter+last);
    if(diphthong)groups[groups.length-1]+=letter;
    else groups.push(letter);
    adjacent=true;
  }
  return groups;
}

function spanishWrittenStress(word,groups) {
  if(spanishWeakForms.has(word))return -1;
  const accented=groups.flatMap((group,index)=>/[áéíóú]/u.test(group)?[index]:[]);
  if(accented.length)return accented.length===1?accented[0]:-1;
  return romanceStressRules.spanish.defaultPenultimate.test(word)?groups.length-2:groups.length-1;
}

function alignSpanishVowels(phones,groups) {
  const vowelIndices=phones.flatMap((phone,index)=>phone.vowel?[index]:[]);
  const written=groups.join('').normalize('NFD').replace(/\p{M}/gu,'');
  if(vowelIndices.map(index=>phones[index].sound).join('')!==written)return null;
  const nuclei=[];
  let offset=0;
  for(const group of groups) {
    const positions=vowelIndices.slice(offset,offset+group.length);
    if(positions.some((index,i)=>i>0&&(index!==positions[i-1]+1||phones[index].writtenBoundary)))return null;
    nuclei.push({start:positions[0],end:positions.at(-1)+1});
    offset+=group.length;
  }
  return nuclei;
}

function sourceTonicOnset(phones,nuclei,index,source) {
  if(index===0)return phones[0].offset;
  const previous=nuclei[index-1], stressed=nuclei[index];
  const explicit=phones.slice(previous.end,stressed.start+1).findIndex(phone=>phone.writtenBoundary);
  if(explicit>=0)return phones[previous.end+explicit].offset;
  if(previous.end===stressed.start)return phones[stressed.start].offset;
  const catalog=pronunciationCatalog(source);
  for(let start=Math.max(previous.end,stressed.start-3);start<stressed.start-1;start++){
    if(catalog.onsets.has(clusterKey(phones.slice(start,stressed.start))))return phones[start].offset;
  }
  return phones[stressed.start-1].offset;
}

function recoverDictionaryStress(ipa,original,source) {
  const policy=sourceStressPolicies[source];
  if(!policy||/[ˈˌ˩˨˧˦˥\s\-]/u.test(ipa)||/^[A-Z]{2,}$/u.test(original))return ipa;
  const word=original.toLowerCase().normalize('NFC');
  if(!policy.letters.test(word)||source==='swahili'&&/^[mn][^aeiou]/u.test(word))return ipa;
  const phones=tokenizeIPA(ipa,source,true);
  if(phones.unknownPhones.size||phones.some(phone=>!phone.sound))return ipa;
  const defaultNuclei=syllableNuclei(phones,null,source);
  const separateVowels=source==='esperanto'||source==='swahili';
  let nuclei=separateVowels?syllableNuclei(phones,null,source,true):defaultNuclei;
  let position;
  if(source==='spanish') {
    const groups=spanishWrittenSyllables(word);
    if(groups.length!==nuclei.length)nuclei=alignSpanishVowels(phones,groups);
    if(!nuclei)return ipa;
    position=spanishWrittenStress(word,groups);
  }
  else if(policy.position==='first') {
    if((word.match(/[aeiouyáéíóúýæö]+/gu)??[]).length<2)return ipa;
    position=0;
  } else if(policy.position==='penultimate') {
    if((word.match(/[aeiou]/gu)??[]).length!==nuclei.length)return ipa;
    position=nuclei.length-2;
  }
  if(nuclei.length<2||nuclei.length>(policy.maxSyllables??Infinity)||!Number.isInteger(position)||position<0)return ipa;
  const offset=sourceTonicOnset(phones,nuclei,position,source);
  if(offset===undefined)return ipa;
  const hiatus=new Set();
  for(const {start} of nuclei.slice(1)) {
    const character=phones[start].offset;
    if(character!==offset&&defaultNuclei.some(group=>group.start<start&&group.end>start))hiatus.add(character);
  }
  return phones.inputCharacters.map((letter,index)=>(index===offset?'ˈ':hiatus.has(index)?'.':'')+letter).join('').normalize('NFC');
}

function fillDictionaryStress(chunks,source) {
  if(!sourceStressPolicies[source])return chunks;
  return chunks.map(chunk=>{
    if(!chunk.ipa||chunk.fallback||chunk.ruleBased)return chunk;
    const ipa=recoverDictionaryStress(chunk.ipa,chunk.original,source);
    return ipa===chunk.ipa?chunk:{...chunk,ipa,stressRecovered:true};
  });
}

// Kakao Brain g2pM, Apache-2.0, revision 170526efad0a3ef9b55a9ad4579f73218f9be06c. See the bundled license.
// Traditional-to-Simplified character pairs from BYVoid/OpenCC fae2a0a911c30764e669a7d8b0591cd8e852934a, Apache-2.0.
const mandarinContextPayload=asset("mandarin-context-data-1.bin");

// Browser inference for Kakao Brain g2pM (Park and Lee, Interspeech 2020).
// Architecture and weights from revision 170526efad0a3ef9b55a9ad4579f73218f9be06c, Apache-2.0.
const mandarinModelWidth=32, mandarinEmbeddingWidth=64;
let mandarinModelRequest;

function decodeMandarinModel(data) {
  const weights=Object.fromEntries(Object.entries(data.weights).map(([name,value])=>
    [name,new Float32Array(Uint8Array.from(atob(value),letter=>letter.charCodeAt(0)).buffer)]));
  const direction=suffix=>({
    input:weights['lstm.weight_ih_l0'+suffix],
    recurrent:weights['lstm.weight_hh_l0'+suffix],
    bias:Float32Array.from(weights['lstm.bias_ih_l0'+suffix],(value,index)=>value+weights['lstm.bias_hh_l0'+suffix][index]),
    embeddings:new Map(),
  });
  return {vocab:data.vocab,labels:data.labels,lexicon:data.lexicon,traditional:data.traditional,embedding:weights['embedding.weight'],
    forward:direction(''), backward:direction('_reverse'),
    hidden:weights['logit_layer.0.weight'],hiddenBias:weights['logit_layer.0.bias'],
    output:weights['logit_layer.2.weight'],outputBias:weights['logit_layer.2.bias']};
}

function loadMandarinContextModel() {
  return mandarinModelRequest??=decompressTextData(mandarinContextPayload).then(JSON.parse).then(decodeMandarinModel)
    .catch(error=>{mandarinModelRequest=undefined;throw error;});
}

function mandarinLstm(ids,model,layer,reverse) {
  const width=mandarinModelWidth, gates=width*4;
  const cell=new Float64Array(width), hidden=new Float64Array(width), activation=new Float64Array(gates);
  const all=new Float32Array(ids.length*width);
  const sigmoid=value=>1/(1+Math.exp(-value));
  for(let step=0;step<ids.length;step++) {
    const position=reverse?ids.length-step-1:step;
    const id=ids[position], embeddingOffset=id*mandarinEmbeddingWidth;
    let affine=layer.embeddings.get(id);
    if(!affine){
      affine=new Float64Array(gates);
      for(let row=0;row<gates;row++){
        let sum=layer.bias[row];
        const offset=row*mandarinEmbeddingWidth;
        for(let column=0;column<mandarinEmbeddingWidth;column++)sum+=layer.input[offset+column]*model.embedding[embeddingOffset+column];
        affine[row]=sum;
      }
      if(layer.embeddings.size<2048)layer.embeddings.set(id,affine);
    }
    for(let row=0;row<gates;row++){
      let sum=affine[row];
      const offset=row*width;
      for(let column=0;column<width;column++)sum+=layer.recurrent[offset+column]*hidden[column];
      activation[row]=sum;
    }
    for(let column=0;column<width;column++){
      cell[column]=sigmoid(activation[column+width])*cell[column]+sigmoid(activation[column])*Math.tanh(activation[column+2*width]);
      hidden[column]=sigmoid(activation[column+3*width])*Math.tanh(cell[column]);
    }
    all.set(hidden,position*width);
  }
  return all;
}

function predictMandarinContext(text,model,selected) {
  const letters=Array.from(text,letter=>model.traditional[letter]??letter);
  const readings=letters.map(letter=>model.lexicon[letter]?.[0]??null);
  const targets=[...letters.keys()].filter(index=>selected?selected.has(index):model.lexicon[letters[index]]?.length>1);
  if(!targets.length)return readings;
  const ids=[model.vocab['시'],...letters.map(letter=>model.vocab[letter]??model.vocab['<UNK>']),model.vocab['끝']];
  const forward=mandarinLstm(ids,model,model.forward,false);
  const backward=mandarinLstm(ids,model,model.backward,true);
  const width=mandarinModelWidth;
  const state=new Float64Array(width);
  for(const index of targets){
    const position=(index+1)*width;
    for(let row=0;row<width;row++){
      let sum=model.hiddenBias[row];
      const offset=row*width*2;
      for(let column=0;column<width;column++)sum+=model.hidden[offset+column]*forward[position+column]+model.hidden[offset+width+column]*backward[position+column];
      state[row]=Math.max(0,sum);
    }
    let score=-Infinity,chosen=0;
    for(let row=0;row<model.labels.length;row++){
      let sum=model.outputBias[row];
      const offset=row*width;
      for(let column=0;column<width;column++)sum+=model.output[offset+column]*state[column];
      if(sum>score){score=sum;chosen=row;}
    }
    readings[index]=model.labels[chosen];
  }
  return readings;
}

const mandarinPinyinIPA=new Map(chineseSyllables.mandarin);
const mandarinSourceTone=['','˥','˧˥','˨˩˦','˥˩','˧'];

function normalizeMandarinPinyin(reading) {
  return reading?.toLowerCase().replace(/u:|v/gu,'ü').replace(/^(?:([jqxy])ü)/u,'$1u').replace(/([a-zü])0$/u,'$15');
}

function numberedMandarinPinyin(spelling) {
  return spelling.trim().split(/\s+/u).map(word=>{
    const marks={'̄':'1','́':'2','̌':'3','̀':'4'};
    const tone=[...word.normalize('NFD')].map(mark=>marks[mark]).find(Boolean)??'5';
    return bareToneSpelling(word,'mandarin')+tone;
  });
}

function readingFromMandarinPinyin(reading) {
  const match=normalizeMandarinPinyin(reading)?.match(/^([a-zü]+)([1-5])$/u);
  if(!match)return '';
  const ipa=mandarinPinyinIPA.get(match[1]);
  return ipa?ipa+mandarinSourceTone[Number(match[2])]:'';
}

async function applyMandarinContext(chunks) {
  const text=chunks.map(chunk=>chunk.original).join('');
  if(!/\p{Script=Han}/u.test(text))return chunks;
  let model;
  try {model=await loadMandarinContextModel();}
  catch {return chunks;}
  const hasContext=[...text.matchAll(/\p{Script=Han}/gu)].length>1;
  const predictions=predictMandarinContext(text,model);
  const optionsFor=letter=>model.lexicon[model.traditional[letter]??letter];
  const permitted=(letter,value)=>optionsFor(letter)?.some(pron=>normalizeMandarinPinyin(pron)===value);
  const pronounce=ipa=>numberedMandarinPinyin(renderTarget(ipa,'mandarin','mandarin')).map(normalizeMandarinPinyin);
  let offset=0;
  return chunks.flatMap(chunk=>{
    const letters=Array.from(chunk.original);
    const readings=predictions.slice(offset,offset+letters.length);
    offset+=letters.length;
    if(chunk.unknown&&/^\p{Script=Han}+$/u.test(chunk.original)) return letters.map((character,index)=>{
      const pinyin=normalizeMandarinPinyin(readings[index]);
      const ipa=permitted(character,pinyin)?
        readingFromMandarinPinyin(pinyin):'';
      return ipa?{original:character,ipa,mandarinContext:true}:{original:character,unknown:true};
    });
    const single=letters.length===1&&optionsFor(letters[0])?.length>1;
    if(!hasContext||!chunk.ipa||!/^\p{Script=Han}+$/u.test(chunk.original)||!single&&!chunk.alternatives?.length)return [chunk];
    const pinyin=readings.map(normalizeMandarinPinyin);
    let selected='';
    if(chunk.alternatives&&pinyin.every((value,index)=>permitted(letters[index],value))) {
      const expected=pinyin.join(' ');
      selected=chunk.alternatives.find(ipa=>pronounce(ipa).join(' ')===expected)??'';
    }
    if(!selected&&single&&!model.traditional[letters[0]]&&permitted(letters[0],pinyin[0])) {
      const prior=pronounce(chunk.ipa);
      if(prior.length===1&&prior[0]!==pinyin[0])selected=readingFromMandarinPinyin(pinyin[0]);
    }
    return selected&&selected!==chunk.ipa?[{...chunk,ipa:selected,contextual:true,mandarinContext:true}]:[chunk];
  });
}

const upstreamRevision = '5fae91c611caf62d47a8a1fefedaa225f17fdb2a';
const processors = {
  charBased:processTextCharBased, longestMatch:processTextLongestMatch, khmer:processKhmerText, korean:processKorean,
};
const dictionaries=new Map(), dictionaryRequests=new Map(), frequentDictionaries=new Map();
const ipaExample = '/a̠nɲjʌ̹ŋɦa̠sʰe̞jo/';

// These lookup substitutions preserve UTF-16 offsets so we can restore the original text.
function lookupTypography(text) {
  return text.replace(/[’‐‑！-～]/gu,letter=>{
    if(letter==='’')return "'";
    if(letter==='‐'||letter==='‑')return '-';
    return String.fromCharCode(letter.charCodeAt(0)-0xfee0);
  });
}

function addDictionaryTypographyAliases(table) {
  for(const key of Object.keys(table)) {
    const alias=lookupTypography(key);
    if(!Object.hasOwn(table,alias))table[alias]=table[key];
  }
  return table;
}

function normalizePronunciationDictionary(data) {
  const lookup=Object.create(null);
  const entries=Object.values(data)[0];
  for(const record of entries)for(const [word,value] of Object.entries(record)) {
    const normalized=word.normalize('NFC').trim().replace(/\s+/gu,' ');
    if(!normalized)continue;
    const existing=lookup[normalized];
    lookup[normalized]=existing && existing!==value ? existing+', '+value : value;
  }
  return addDictionaryTypographyAliases(lookup);
}

function chooseDictionaryReading(value,source) {
  const candidates=[...value.matchAll(/\/([^/]+)\//gu)].map(match=>match[1].trim());
  const readings=candidates.length?candidates:[firstReading(value)];
  // The converted MaRePhoR data marks silent alignment slots as syllabic.
  const pronunciations=[...new Set(source==='romanian'?readings.map(ipa=>ipa.replace(/[̩̍]/gu,'')):readings)];
  const primary=pronunciations.find(ipa=>{
    const parsed=tokenizeIPA(ipa,source);
    return parsed.some(token=>token.sound) && !parsed.unknownPhones.size;
  }) ?? pronunciations[0];
  return pronunciations.length>1 ? {ipa:primary,ambiguous:true,alternatives:pronunciations} : {ipa:primary};
}

async function loadDictionary(source, variant) {
  const databasePath=resolveDatabasePath(source,variant);
  if(dictionaries.has(databasePath)) {
    const table=dictionaries.get(databasePath);
    dictionaries.delete(databasePath);
    dictionaries.set(databasePath,table);
    return table;
  }
  if(dictionaryRequests.has(databasePath))return dictionaryRequests.get(databasePath);
  const complete=offlineSourceDictionaries[databasePath]??offlineSourceDictionaries[source]??additionalOfflineDictionaries[databasePath];
  const frequent=frequentOfflineDictionaries[databasePath];
  const useFrequent=error=>{
    if(!frequent)throw error;
    if(!frequentDictionaries.has(databasePath)) {
      const parsed=readEmbeddedDictionary(frequent).catch(failure=>{
        if(frequentDictionaries.get(databasePath)===parsed)frequentDictionaries.delete(databasePath);
        throw failure;
      });
      frequentDictionaries.set(databasePath,parsed);
      if(frequentDictionaries.size>3)frequentDictionaries.delete(frequentDictionaries.keys().next().value);
    }
    return frequentDictionaries.get(databasePath);
  };
  const query=complete?readEmbeddedDictionary(complete):
    fetch('https://raw.githubusercontent.com/lotusfa/IPA-Translator/'+upstreamRevision+'/'+databasePath.slice(2),{signal:AbortSignal.timeout(18000)})
      .then(response=>{
        if(!response.ok)throw new Error('사전 요청 실패 (HTTP '+response.status+').');
        return response.json();
      })
      .then(normalizePronunciationDictionary);
  const request=query.then(table=>{
    dictionaries.set(databasePath,table);
    if(dictionaries.size>3)dictionaries.delete(dictionaries.keys().next().value);
    return table;
  }).catch(useFrequent).finally(()=>dictionaryRequests.delete(databasePath));
  dictionaryRequests.set(databasePath,request);
  return request;
}

function readEmbeddedDictionary(payload) {
  return decompressTextData(payload).then(JSON.parse).then(normalizePronunciationDictionary);
}

const escapeRegex = value => value.replace(/[.*+?^$(){}|[\]\\]/gu,'\\$&');
function alignPairs(input, pairs, source, wholeWords=false) {
  let offset=0;
  const chunks=[];
  for (const [word, originalIPA] of pairs) {
    if (typeof originalIPA!=='string' || !originalIPA.trim()) continue;
    const pattern=word.trim().split(/\s+/u).map(escapeRegex).join('\\s+');
    if (!pattern) continue;
    const expression=wholeWords?'(?<!\\S)'+pattern+'(?!\\S)':pattern;
    const match=new RegExp(expression,'iu').exec(input.slice(offset));
    if (!match) continue;
    const position=offset+match.index;
    if (position>offset) chunks.push(...splitMissingText(input.slice(offset,position)));
    chunks.push({original:match[0],...chooseDictionaryReading(originalIPA,source)});
    offset=position+match[0].length;
  }
  if (offset<input.length) chunks.push(...splitMissingText(input.slice(offset)));
  return chunks;
}

const wordCharacter=/[\p{L}\p{N}\p{M}]/u;
const extraPunctuation=/[^\p{L}\p{N}\p{M}\s'’\-\u200c]|(?<![\p{L}\p{N}])['’\-]|['’\-](?![\p{L}\p{N}])/u;
const dictionaryInfo=new WeakMap();
const wordConnector=/^['’-]$/u;

function withinJoinedWord(text,index) {
  const left=text[index-1]??'',right=text[index]??'';
  const leftWord=wordCharacter.test(left), rightWord=wordCharacter.test(right);
  return leftWord&&rightWord || leftWord&&wordConnector.test(right)&&wordCharacter.test(text[index+1]??'') ||
    rightWord&&wordConnector.test(left)&&wordCharacter.test(text[index-2]??'');
}

function describeDictionary(table){
  if(dictionaryInfo.has(table))return dictionaryInfo.get(table);
  let phraseLength=1, characterLength=1;
  const specialHeads=new Map();
  for(const word of Object.keys(table)){
    phraseLength=Math.max(phraseLength,word.split(/\s+/u).length);
    characterLength=Math.max(characterLength,word.length);
    if(extraPunctuation.test(word) && wordCharacter.test(word)){
      const first=String.fromCodePoint(word.codePointAt(0)).toLowerCase();
      specialHeads.set(first,Math.max(specialHeads.get(first)??0,word.length));
    }
  }
  const settings={phraseLength,characterLength,specialHeads};
  dictionaryInfo.set(table,settings);
  return settings;
}

function readDictionaryPortion(input,table,config,source,settings) {
  const parts=config.processor==='longestMatch'
    ? input.split(/((?<![\p{L}\p{N}])['’\-]|['’\-](?![\p{L}\p{N}])|[^\p{L}\p{N}\p{M}\s'’\-\u200c]+)/u)
    : [input];
  return parts.flatMap(part=>{
    if(!part || !wordCharacter.test(part))return part?[{original:part}]:[];
    const result=processors[config.processor]({
      input:part,lookupTable:table,pairsOnly:true,allowWordSearch:true,
      maxWordLength:settings.characterLength,maxPhraseLength:settings.phraseLength,
    });
    return alignPairs(part,result.pairs ?? [],source,config.processor==='longestMatch');
  });
}

function readDictionaryLine(line,table,config,source,settings) {
  const exact=line.trim().replace(/\s+/gu,' ');
  const known=table[exact] ?? table[exact.toLowerCase()];
  if(exact && known)return alignPairs(line,[[exact,known]],source);
  const chunks=[];
  let start=0;
  for(let offset=0;offset<line.length;) {
    const letter=String.fromCodePoint(line.codePointAt(offset));
    const maximum=settings.specialHeads.get(letter.toLowerCase()) ?? 0;
    let match=null;
    if(maximum && (config.processor!=='longestMatch' || !withinJoinedWord(line,offset))) {
      for(let end=Math.min(line.length,offset+maximum);end>offset;end--) {
        const surface=line.slice(offset,end);
        if(!extraPunctuation.test(surface) || !wordCharacter.test(surface))continue;
        const normalized=surface.replace(/\s+/gu,' ');
        const value=table[normalized] ?? table[normalized.toLowerCase()];
        if(!value)continue;
        if(config.processor==='longestMatch' && withinJoinedWord(line,end))continue;
        match={original:surface,...chooseDictionaryReading(value,source)};
        break;
      }
    }
    if(match) {
      if(start<offset)chunks.push(...readDictionaryPortion(line.slice(start,offset),table,config,source,settings));
      chunks.push(match);
      offset+=match.original.length;
      start=offset;
    } else offset+=letter.length;
  }
  if(start<line.length)chunks.push(...readDictionaryPortion(line.slice(start),table,config,source,settings));
  return chunks;
}

const nonLatinSource=new Set(['korean','japanese','mandarin','cantonese','arabic','persian','khmer','odia']);
const eastAsianHanSource=new Set(['japanese','mandarin','cantonese']);
const mixedScriptRuns=/(?<eastAsian>[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]+)|(?<korean>\p{Script=Hangul}[\p{Script=Hangul}\p{M}]*)|(?<arabic>\p{Script=Arabic}[\p{Script=Arabic}\p{M}\u200c]*)|(?<khmer>\p{Script=Khmer}[\p{Script=Khmer}\p{M}\u200b-\u200d]*)|(?<odia>\p{Script=Oriya}[\p{Script=Oriya}\p{M}\u200c\u200d]*)|(?<latin>\p{Script=Latin}[\p{Script=Latin}\p{M}]*(?:['’\-]\p{Script=Latin}[\p{Script=Latin}\p{M}]*)*)|\p{L}\p{M}*/gu;

function sourceForScriptRun(match,source,input) {
  const scripts=match.groups;
  if(scripts.eastAsian) {
    if(/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(match[0]))return 'japanese';
    return eastAsianHanSource.has(source)?source:'mandarin';
  }
  if(scripts.arabic) {
    if(source==='arabic'||source==='persian'||source==='malay')return source;
    return /[پچژگکی]/u.test(match[0])?'persian':'arabic';
  }
  if(scripts.latin) {
    if(source==='japanese'&&japaneseLatinReading(input,match.index,match[0]))return source;
    return nonLatinSource.has(source)?'english':source;
  }
  if(scripts.korean)return 'korean';
  if(scripts.khmer)return 'khmer';
  if(scripts.odia)return 'odia';
  return source;
}

function mixedTextSpans(input,source) {
  const spans=[];
  let start=0;
  for(const match of input.matchAll(mixedScriptRuns)) {
    const language=sourceForScriptRun(match,source,input);
    const jawi=language==='malay'&&Boolean(match.groups.arabic);
    const gap=input.slice(start,match.index);
    const previous=spans.at(-1);
    if(previous?.language===language&&previous.jawi===jawi)previous.text+=gap+match[0];
    else {
      const unitPrefix=language==='japanese'&&match.groups.latin&&japaneseUnitReading(gap,match[0])
        ? gap.match(/[\p{Nd},.，．]+[ \t]*$/u)?.[0]??'' : '';
      const separator=gap.slice(0,gap.length-unitPrefix.length);
      if(separator)spans.push({text:separator});
      spans.push({text:unitPrefix+match[0],language,jawi});
    }
    start=match.index+match[0].length;
  }
  if(start<input.length)spans.push({text:input.slice(start)});
  return spans;
}

async function readMixedText(input,source,variant) {
  const spans=mixedTextSpans(input,source);
  const detected=new Set(spans.map(span=>span.language).filter(Boolean));
  if(detected.size<2&&!spans.some(span=>span.jawi))return readSourceText(input,source,variant);
  const results=await Promise.all(spans.map(async ({text,language,jawi})=>{
    if(!language)return [{original:text}];
    try {
      const chunks=jawi?await readMalayJawi(text):await readSourceText(text,language,language===source?variant:'');
      return language===source?chunks:chunks.map(chunk=>chunk.ipa&&!chunk.source?{...chunk,source:language}:chunk);
    } catch {
      return splitMissingText(text).map(chunk=>chunk.unknown?{...chunk,unavailable:language}:chunk);
    }
  }));
  return results.flat();
}

const directIPABoundaries=/[.,;!?…，、；！？။।៕。؟،؛|‖—–‐‑\-"“”‘’«»‹›(){}[\]\/／［］]/gu;
const directIPAWrappers=/\/([^/[\]]+)\/|\[([^/[\]]+)\]/gu;
const directIPADelimiters=/[\/[\]／［］]/u;

function splitDirectIPA(input,output,spaceBefore=false) {
  let start=0;
  function append(end) {
    const section=input.slice(start,end);
    const reading=section.match(/\S(?:[\s\S]*\S)?/u);
    if(!reading) {
      if(section)output.push({original:section});
      return;
    }
    if(reading.index)output.push({original:section.slice(0,reading.index)});
    output.push({original:reading[0],ipa:reading[0],spaceBefore});
    spaceBefore=false;
    const readingEnd=reading.index+reading[0].length;
    if(readingEnd<section.length)output.push({original:section.slice(readingEnd)});
  }
  for(const {0:mark,index} of input.matchAll(directIPABoundaries)) {
    const syllableDot=mark==='.'&&input[index-1]!=='.'&&/^[ˈˌ]*\p{L}/u.test(input.slice(index+1));
    if(syllableDot)continue;
    append(index);
    output.push({original:mark,ipaDelimiterIssue:directIPADelimiters.test(mark)});
    start=index+mark.length;
  }
  append(input.length);
}

const directToneHeights=map('1=˩ 2=˨ 3=˧ 4=˦ 5=˥ ¹=˩ ²=˨ ³=˧ ⁴=˦ ⁵=˥');
const directTonalSources=new Set(['mandarin','cantonese','vietnamese']);

function normalizeDirectTones(ipa) {
  return ipa.replace(/([\p{L}\p{M}])([1-5]{2,3}|[¹²³⁴⁵]{2,3})(?!\p{N})/gu,
    (whole,phone,levels)=>/[˥˦˧˨˩]/u.test(phone)?whole:phone+[...levels].map(level=>directToneHeights[level]).join(''));
}

function readDirectIPA(input) {
  const delimiters={'／':'/','［':'[','］':']'};
  const normalized=input.replace(/[／［］]/gu,mark=>delimiters[mark]);
  const wrapped=[...normalized.matchAll(directIPAWrappers)];
  const output=[];
  if(!wrapped.length) {
    splitDirectIPA(input,output);
    return output;
  }
  let start=0;
  for(const span of wrapped) {
    if(span.index>start)output.push({original:input.slice(start,span.index)});
    const end=span.index+span[0].length;
    splitDirectIPA(input.slice(span.index+1,end-1),output,true);
    start=end;
  }
  if(start<input.length)output.push({original:input.slice(start)});
  return output;
}

async function getChunks(input,source,variant,mode,embeddedNumbers=false) {
  if(mode==='ipa') {
    const chunks=readDirectIPA(input);
    if(!directTonalSources.has(source))return chunks;
    return chunks.map(chunk=>chunk.ipa?{...chunk,ipa:normalizeDirectTones(chunk.ipa)}:chunk);
  }
  const normalized=lookupTypography(input);
  const chunks=await cardinalInputChunks(normalized,source,variant,embeddedNumbers)??await readMixedText(normalized,source,variant);
  if(normalized===input||chunks.map(chunk=>chunk.original).join('')!==normalized)return chunks;
  let offset=0;
  return chunks.map(chunk=>{
    const end=offset+chunk.original.length;
    const original=input.slice(offset,end);
    offset=end;
    return original===chunk.original?chunk:{...chunk,original};
  });
}

async function completeSourceReadings(chunks,source,variant,table) {
  if(source==='korean')chunks=recoverKoreanWords(chunks);
  const spelled=await fillRuleReadings(chunks,source,table);
  const recovered=await recoverArabicReadings(spelled,source);
  return fillMissingReadings(recovered,source,variant);
}

async function readSourceText(input,source,variant) {
  if(source==='japanese') return readJapanese(input);
  if(source==='korean' && input==='안녕하세요') return [{original:input,ipa:firstReading(ipaExample)}];
  const config=source==='italian'?italianReadingConfig:LANGUAGES[source];
  let table;
  try {
    table=source==='italian'?await loadItalianLexicon():await loadDictionary(source,variant);
  } catch(error) {
    if(!espeakVoices[source]&&!ruleReadings[source]) throw error;
    return completeSourceReadings(splitMissingText(input),source,variant);
  }
  const settings=describeDictionary(table);
  const separators=source==='khmer'?/(\r?\n|\u200b+)/u:/(\r?\n)/u;
  const chunks=input.split(separators).flatMap(line=>{
    if(/^\r?\n$/u.test(line))return [{original:line}];
    if(source==='khmer'&&/^\u200b+$/u.test(line))return [{original:line,wordBoundary:true}];
    return readDictionaryLine(line,table,config,source,settings);
  });
  const repaired=source==='khmer'?await repairKhmerSource(chunks,table,settings.characterLength):chunks;
  const local=source==='mandarin'?await applyMandarinContext(repaired):repaired;
  const filled=await completeSourceReadings(local,source,variant,table);
  const contextual=source==='mandarin'?filled:await applyContextualPronunciation(filled,source,variant);
  const spaced=restorePhraseWordSpaces(contextual,source,table);
  const punctuated=restoreDictionaryPunctuation(spaced,source,part=>readDictionaryPortion(part,table,config,source,settings));
  return fillDictionaryStress(punctuated,source);
}

function renderChunks(chunks,source,target) {
  let output='', previousWasReading=false, previousLanguage;
  for(const chunk of chunks) {
    const language=chunk.source??source;
    const reading=chunk.ipa ? renderStructuredTarget(chunk.sounds ?? tokenizeIPA(chunk.ipa,language),language,target,chunk.phraseBreak) : '';
    if(reading && previousWasReading && (
      chunk.phraseBreak || chunk.spaceBefore || language!==previousLanguage || ['mandarin','cantonese'].includes(target) || (['mandarin','cantonese'].includes(language) && latinRules[target])
    )) output+=' ';
    output+=reading || (chunk.unknown || chunk.ipa ? '□' : chunk.wordBoundary ? ' ' : chunk.original);
    previousWasReading=Boolean(reading);
    previousLanguage=language;
  }
  return output;
}

const romanOnsets=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const romanVowels=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const romanCodas=['','k','k','k','n','n','n','t','l','k','m','p','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
function hangulRomanization(original) {
  return original.replace(/[가-힣]/gu,char=>{
    const index=char.codePointAt(0)-0xac00;
    return romanOnsets[Math.floor(index/588)]+romanVowels[Math.floor(index%588/28)]+romanCodas[index%28];
  });
}

const ipaRoman = map('a=a ɑ=a ʌ=eo ə=eo o=o u=u ɯ=eu i=i e=e ɛ=ae y=wi ø=oe ɰ=w j=y w=w ɲ=ny ŋ=ng ʎ=l ʃ=s ʒ=j dʒ=j tʃ=ch ts=ch dz=j ʔ=');
function koreanIPARomanization(chunks) {
  return chunks.map((chunk,index)=>chunk.ipa ? (chunk.spaceBefore&&chunks[index-1]?.ipa?' ':'')+tokenizeIPA(chunk.ipa,'korean').map(token=>{
    if (token.separator !== undefined) return token.separator;
    const sound = token.vowel ? token.sound : phoneticBase[token.sound];
    if (token.coda && !token.vowel) return ({k:'k',t:'t',p:'p'})[sound] ?? ipaRoman[sound] ?? sound;
    if (token.marks.includes('ʰ') || token.marks.includes('͈')) {
      return ({k:'k',t:'t',p:'p',s:'s'})[sound] ?? ipaRoman[sound] ?? sound;
    }
    return ({k:'g',t:'d',p:'b'})[sound] ?? ipaRoman[sound] ?? basicLatin[sound] ?? sound;
  }).join('') : chunk.original).join('');
}

const controls=Object.fromEntries(['converter','source','variant','variant-label','input','convert','example','status','ipa','ipa-box','results','cards','input-hint','number-option','read-numbers'].map(id=>[id,document.getElementById(id)]));
let inputMode='text', activeRequest=0;
for (const profile of profiles) controls.source.add(new Option(profile.name,profile.id));

function updateVariant() {
  const config=LANGUAGES[controls.source.value];
  const keys=Object.keys(config?.variants ?? {});
  controls.variant.replaceChildren(...keys.map(key=>new Option(key,key,false,key===config.defaultVariant)));
  controls.variant.hidden=controls['variant-label'].hidden=inputMode==='ipa'||keys.length===0;
  controls['number-option'].hidden=inputMode==='ipa';
}
function setStatus(message,error=false) {
  controls.status.textContent=message;
  controls.status.dataset.error=String(error);
}

function makeCard(profile,text,romanization) {
  const card=document.createElement('article');
  card.className='card';
  card.dataset.target=profile.id;
  card.dataset.key=String(['japanese','korean','english'].includes(profile.id));
  const top=document.createElement('div');
  top.className='card-head';
  const label=document.createElement('div');
  const heading=document.createElement('h3');
  heading.textContent=profile.name;
  const script=document.createElement('div');
  script.className='script';
  script.textContent=profile.script;
  label.append(heading,script);
  const button=document.createElement('button');
  button.type='button';
  button.className='copy';
  button.textContent='복사';
  button.setAttribute('aria-label',profile.name+' 발음 표기 복사');
  const reading=document.createElement('p');
  reading.className='reading';
  reading.dir='auto';
  reading.textContent=text;
  button.onclick=async()=>{
    try {
      await navigator.clipboard.writeText(text);
      button.textContent='복사됨';
      setTimeout(()=>{button.textContent='복사';},1200);
    } catch {
      const selection=window.getSelection();
      const range=document.createRange();
      range.selectNodeContents(reading);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent='선택됨';
    }
  };
  top.append(label,button);
  card.append(top,reading);
  if(romanization) {
    const extra=document.createElement('p');
    extra.className='extra';
    extra.textContent=(inputMode==='text'?'한글 기반 로마자 병기 · ':'IPA 기반 로마자 병기 · ')+romanization;
    card.append(extra);
  }
  return card;
}

async function convert() {
  const request=++activeRequest;
  const input=controls.input.value.trim().normalize('NFC');
  const source=controls.source.value, variant=controls.variant.value, mode=inputMode;
  controls.results.hidden=true;
  controls['ipa-box'].hidden=true;
  if(!input) {
    setStatus('변환할 '+(mode==='ipa'?'IPA를':'원문을')+' 입력해 주세요.',true);
    controls.input.focus();
    return;
  }
  controls.convert.disabled=true;
  setStatus(mode==='text'?'발음 사전을 확인하는 중…':'IPA를 변환하는 중…');
  try {
    const chunks=await getChunks(input,source,variant,mode,controls['read-numbers'].checked);
    if(request!==activeRequest) return;
    const checked=chunks.map(chunk=>chunk.ipa ? {...chunk,sounds:tokenizeIPA(chunk.ipa,chunk.source ?? source)} : chunk);
    const usable=checked.filter(chunk=>chunk.sounds?.some(token=>token.sound));
    const unresolved=[...new Set(checked.filter(chunk=>chunk.unknown || chunk.ipa && !chunk.sounds.some(token=>token.sound)).map(chunk=>chunk.original))];
    if(!usable.length) {
      setStatus(mode==='ipa'?'읽을 수 있는 IPA 기호를 찾지 못했습니다.':
        '입력에서 읽기를 찾지 못했습니다'+(unresolved.length?' · '+unresolved.slice(0,5).join(', '):'')+'. 원어를 확인하거나 IPA를 직접 입력해 보세요.',true);
      return;
    }
    const notes=[];
    if(checked.some(chunk=>chunk.ipaDelimiterIssue))notes.push('짝이 없는 IPA 구분 기호가 있습니다.');
    if(unresolved.length) notes.push('□ 읽기 미확인 · '+unresolved.slice(0,6).join(', ')+(unresolved.length>6?' 외 '+(unresolved.length-6)+'개':''));
    const unavailable=[...new Set(checked.map(chunk=>chunk.unavailable).filter(Boolean))];
    if(unavailable.length)notes.push('사전을 불러오지 못한 언어 · '+unavailable.map(id=>profiles.find(profile=>profile.id===id).name).join(', '));
    const unknownPhones=[...new Set(checked.flatMap(chunk=>[...(chunk.sounds?.unknownPhones ?? [])]))];
    if(unknownPhones.length) notes.push('처리하지 못한 IPA 기호 · '+unknownPhones.slice(0,8).join(' '));
    const inferred=new Map();
    for(const chunk of checked)if(chunk.source) {
      if(!inferred.has(chunk.source))inferred.set(chunk.source,new Set());
      inferred.get(chunk.source).add(chunk.original);
    }
    for(const [language,words] of inferred) {
      const name=profiles.find(profile=>profile.id===language).name;
      notes.push(name+'로 읽음 · '+[...words].slice(0,6).join(', ')+(words.size>6?' 외 '+(words.size-6)+'개':''));
    }
    if(checked.some(chunk=>chunk.numberWords))notes.push('정수를 원어의 기수로 읽었습니다.');
    if(checked.some(chunk=>chunk.ruleBased))notes.push('사전에 없는 일부 읽기는 철자 규칙으로 추정했습니다.');
    if(checked.some(chunk=>chunk.khmerInferred))notes.push('일부 크메르어 읽기는 철자에서 음절 발음을 추정했습니다.');
    if(checked.some(chunk=>chunk.khmerVariant))notes.push('일부 크메르어 읽기는 사전의 다른 철자와 연결했습니다.');
    if(checked.some(chunk=>chunk.khmerSupplement))notes.push('일부 크메르어 읽기는 내장 보조 발음 사전으로 찾았습니다.');
    if(checked.some(chunk=>chunk.offlineJapanese))notes.push('일본어 읽기는 내장 사전과 기본 분절로 보완했습니다.');
    const ambiguous=[...new Set(checked.filter(chunk=>chunk.ambiguous).map(chunk=>chunk.original))];
    if(ambiguous.length) notes.push('사전에 발음 후보가 여러 개 있음 · '+ambiguous.slice(0,5).join(', ')+(ambiguous.length>5?' 외 '+(ambiguous.length-5)+'개':''));
    const suggested=[...new Set(checked.filter(chunk=>chunk.contextual).map(chunk=>chunk.original))];
    if(suggested.length)notes.push('문장 발음으로 후보 선택 · '+suggested.slice(0,5).join(', '));
    if(checked.some(chunk=>chunk.spellingRecovered))notes.push('일부 읽기는 다른 철자에서 발음을 추정했습니다.');
    if(checked.some(chunk=>chunk.vocalized))notes.push('아랍어 일부 읽기는 문맥으로 모음을 추정했습니다.');
    if(checked.some(chunk=>chunk.fallback)) notes.push('일부 읽기는 eSpeak NG로 보완했습니다.');
    if(checked.some(chunk=>chunk.stressRecovered))notes.push('일부 읽기의 강세는 원어 규칙에 따라 표시했습니다.');
    controls.ipa.textContent=mode==='ipa'?input:checked.map(chunk=>chunk.ipa && chunk.sounds.some(token=>token.sound)
      ? '/'+chunk.ipa.trim()+'/' : chunk.unknown || chunk.ipa ? '□' : chunk.wordBoundary ? ' ' : chunk.original).join('').replace(/\/\//gu,'/ /');
    controls['ipa-box'].hidden=false;
    const romanizationText=chunks.map(chunk=>chunk.numberWords??chunk.original).join('');
    const romanized=source==='korean' && !unresolved.length ? (mode==='ipa' ? koreanIPARomanization(chunks) :
      /[가-힣]/u.test(romanizationText) ? hangulRomanization(romanizationText) : '') : '';
    const capitalized=romanized && romanized[0].toUpperCase()+romanized.slice(1);
    controls.cards.replaceChildren(...profiles.filter(profile=>profile.id!==source).map(profile=>makeCard(
      profile,renderChunks(checked,source,profile.id),profile.id==='english'?capitalized:''
    )));
    setStatus(notes.join('  '));
    controls.results.hidden=false;
  } catch(error) {
    if(request===activeRequest) setStatus(error.message+' 인터넷 연결을 확인하거나 IPA 입력을 사용해 주세요.',true);
  } finally {
    if(request===activeRequest) controls.convert.disabled=false;
  }
}

function clearResults() {
  activeRequest++;
  controls.results.hidden=true;
  controls['ipa-box'].hidden=true;
  controls.convert.disabled=false;
  setStatus('');
}
controls.converter.addEventListener('submit',event=>{event.preventDefault();convert();});
controls.input.addEventListener('input',clearResults);
controls.variant.addEventListener('change',clearResults);
controls['read-numbers'].addEventListener('change',clearResults);
controls.source.addEventListener('change',()=>{
  updateVariant();
  clearResults();
});
const currentExample=()=>profiles.find(profile=>profile.id===controls.source.value).example;
controls.example.addEventListener('click',()=>{
  if(inputMode==='ipa') {
    controls.source.value='korean';
    controls.input.value=ipaExample;
  } else controls.input.value=currentExample();
  updateVariant();
  convert();
});
let lastText='', lastDirectIPA='';
for (const button of document.querySelectorAll('[data-mode]')) {
  button.addEventListener('click',()=>{
    if(inputMode===button.dataset.mode) return;
    const currentIPA=controls['ipa-box'].hidden?'':controls.ipa.textContent;
    if(inputMode==='text') {
      lastText=controls.input.value;
      controls.input.value=lastDirectIPA || currentIPA;
    } else {
      lastDirectIPA=controls.input.value;
      controls.input.value=lastText || currentExample();
    }
    inputMode=button.dataset.mode;
    for (const modeButton of document.querySelectorAll('[data-mode]')) {
      modeButton.setAttribute('aria-pressed',String(modeButton===button));
    }
    controls.input.setAttribute('aria-label',inputMode==='ipa'?'IPA':'원문');
    controls['input-hint'].textContent=inputMode==='ipa'
      ?'IPA를 붙여 넣으세요. /…/나 […]가 있으면 그 안을 변환합니다. 원어 설정은 소리 해석에 사용됩니다.'
      :'선택한 원어의 IPA 사전을 불러옵니다. 입력한 문장은 브라우저에서 처리됩니다.';
    updateVariant();
    clearResults();
    if(controls.input.value.trim()) convert();
  });
}
updateVariant();
convert();
