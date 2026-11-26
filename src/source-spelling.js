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
