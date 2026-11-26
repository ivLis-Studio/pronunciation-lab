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
