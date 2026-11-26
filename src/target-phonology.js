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
