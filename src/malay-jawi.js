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
