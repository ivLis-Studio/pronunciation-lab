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
