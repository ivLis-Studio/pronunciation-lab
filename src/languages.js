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
