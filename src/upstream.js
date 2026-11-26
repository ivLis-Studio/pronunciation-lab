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
