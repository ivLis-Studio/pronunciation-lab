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
