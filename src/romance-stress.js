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
