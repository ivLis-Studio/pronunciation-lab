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
      return language===source?chunks:chunks.map(chunk=>(chunk.ipa||chunk.unknown)&&!chunk.source?{...chunk,source:language}:chunk);
    } catch {
      return splitMissingText(text).map(chunk=>chunk.unknown?{...chunk,source:language,unavailable:language}:chunk);
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
  function appendOutside(text) {
    for(const original of text.split(/([\/[\]／［］])/u).filter(Boolean)) {
      output.push({original,ipaDelimiterIssue:directIPADelimiters.test(original)});
    }
  }
  let start=0;
  for(const span of wrapped) {
    appendOutside(input.slice(start,span.index));
    const end=span.index+span[0].length;
    output.push({original:input[span.index],ipaWrapper:true});
    splitDirectIPA(input.slice(span.index+1,end-1),output,true);
    output.push({original:input[end-1],ipaWrapper:true});
    start=end;
  }
  appendOutside(input.slice(start));
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

function analyzeReadings(chunks,source) {
  return chunks.map(chunk=>chunk.ipa?{...chunk,sounds:tokenizeIPA(chunk.ipa,chunk.source??source)}:chunk);
}

function startsReadingGroup(chunk,previousLanguage,language) {
  return chunk.phraseBreak||chunk.spaceBefore||language!==previousLanguage;
}

function renderChunks(chunks,source,target) {
  let output='', previousWasReading=false, previousLanguage;
  for(const chunk of chunks) {
    if(chunk.ipaWrapper)continue;
    const language=chunk.source??source;
    const reading=chunk.ipa ? renderStructuredTarget(chunk.sounds ?? tokenizeIPA(chunk.ipa,language),language,target,chunk.phraseBreak) : '';
    if(reading && previousWasReading && (
      startsReadingGroup(chunk,previousLanguage,language) || ['mandarin','cantonese'].includes(target) || (['mandarin','cantonese'].includes(language) && latinRules[target])
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

function formatKoreanRomanization(chunks,source,mode,hasUnresolved) {
  if(source!=='korean'||hasUnresolved)return '';
  const text=chunks.map(chunk=>chunk.numberWords??chunk.original).join('');
  const romanized=mode==='ipa'?koreanIPARomanization(chunks.filter(chunk=>!chunk.ipaWrapper)):/[가-힣]/u.test(text)?hangulRomanization(text):'';
  return romanized&&romanized[0].toUpperCase()+romanized.slice(1);
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
    const checked=analyzeReadings(chunks,source);
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
    const capitalized=formatKoreanRomanization(chunks,source,mode,unresolved.length>0);
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
