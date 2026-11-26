// Contour labels describe how the source IPA moves across Chao's five pitch levels.
const chaoLevels=map('˩=1 ˨=2 ˧=3 ˦=4 ˥=5');
const toneProfiles={
  mandarin:[['1','55'],['2','35'],['3','214'],['4','51']],
  cantonese:[['1','55'],['2','35'],['3','33'],['4','21'],['5','13'],['6','22']],
  vietnamese:[['ngang','33'],['huyen','32'],['huyen','21'],['sac','24'],['sac','34'],['hoi','312'],['hoi','31'],['nga','35',true],['nga','45',true],['nang','21',true],['nang','32',true],['sac','45',false,true],['nang','212',true,true]],
};
const toneMarks={
  mandarin:map('1=̄ 2=́ 3=̌ 4=̀'),
  vietnamese:map('huyen=̀ sac=́ hoi=̉ nga=̃ nang=̣'),
};
const toneChoices=new Map();

function toneShape(points) {
  const begin=points[0], end=points.at(-1);
  if(Math.min(...points)<Math.min(begin,end))return 'dip';
  if(Math.max(...points)>Math.max(begin,end))return 'peak';
  return end===begin?'level':end>begin?'rising':'falling';
}

function toneCurve(levels) {
  const points=[...levels].map(Number);
  return Array.from({length:5},(_,i)=>{
    const t=i/4*(points.length-1);
    const left=Math.floor(t);
    return points[left]+((points[left+1]??points[left])-points[left])*(t-left);
  });
}

function syllableTone(phones,start,end,source) {
  const marked=phones.slice(start,end).filter(phone=>phone.tone);
  if(!marked.length)return null;
  const symbols=marked.map(phone=>phone.tone).join('');
  if(source==='mandarin'&&symbols==='˧')return null;
  return {levels:[...symbols].map(symbol=>chaoLevels[symbol]).join(''),
    glottal:marked.some(phone=>phone.tonalGlottalization)};
}

function selectTone(tone,target,checked=false,changedTones='') {
  if(!tone?.levels)return '';
  const key=target+':'+tone.levels+':'+Number(tone.glottal)+':'+Number(checked)+':'+changedTones;
  if(toneChoices.has(key))return toneChoices.get(key);
  const contour=toneCurve(tone.levels), shape=toneShape(contour);
  let best='', minimum=Infinity;
  for(const [id,pattern,glottal=false,onlyChecked=false] of toneProfiles[target]) {
    if(onlyChecked&&!checked)continue;
    if(checked&&target==='cantonese'&&!('136'+changedTones).includes(id))continue;
    if(checked&&target==='vietnamese'&&!['sac','nang'].includes(id))continue;
    if(target==='vietnamese'&&glottal&&!tone.glottal&&!checked)continue;
    const reference=toneCurve(pattern);
    if(toneShape(reference)!==shape)continue;
    const distance=reference.reduce((sum,pitch,i)=>sum+Math.abs(pitch-contour[i]),0)/reference.length+
      (target==='vietnamese'&&glottal!==tone.glottal?1.15:0);
    if(distance<minimum) {minimum=distance;best=id;}
  }
  const selected=minimum<=1.25?best:'';
  if(toneChoices.size>=2048)toneChoices.clear();
  toneChoices.set(key,selected);
  return selected;
}

function pinyinToneSpelling(syllable,tone) {
  if(!tone)return syllable;
  let index=syllable.search(/[a]/u);
  if(index<0)index=syllable.search(/[eê]/u);
  if(index<0&&syllable.includes('ou'))index=syllable.indexOf('ou');
  if(index<0)index=[...syllable].findLastIndex(letter=>/[aeiouüê]/u.test(letter));
  if(index<0&&/^(?:m|n|ng|hm|hng)$/u.test(syllable))index=syllable.search(/[mn]/u);
  if(index<0)return syllable;
  return (syllable.slice(0,index+1)+toneMarks.mandarin[tone]+syllable.slice(index+1)).normalize('NFC');
}

function vietnameseAccentIndex(syllable) {
  const body=syllable.replace(/^qu(?=[aeiouyăâêôơư])/u,'q·').replace(/^gi(?=[aeiouyăâêôơư])/u,'g·');
  const vowels=[...body].flatMap((letter,index)=>/[aeiouyăâêôơư]/u.test(letter)?[index]:[]);
  const preferred=vowels.findLast(index=>/[êôơ]/u.test(body[index]));
  if(preferred!==undefined)return preferred;
  if(vowels.length>2)return vowels[1];
  if(vowels.length===2 && (vowels[1]<body.length-1 || /^(oa|oe|uy)$/u.test(body.slice(vowels[0]))))return vowels[1];
  return vowels[0]??-1;
}

function inventoryToneSpelling(syllable,tone,target,observedAccent) {
  const checked=target==='cantonese'?/[ptk]$/u.test(syllable):
    target==='vietnamese'&&/(?:ch|[cpt])$/u.test(syllable);
  const checkedTones=target==='cantonese'?(checkedCantoneseTones[syllable]??'')+(officialCheckedCantoneseTones[syllable]??''):'';
  const id=selectTone(tone,target,checked,checkedTones);
  if(!id)return syllable;
  if(target==='mandarin')return pinyinToneSpelling(syllable,id);
  if(target==='cantonese')return syllable+id;
  const accent=toneMarks.vietnamese[id];
  if(!accent)return syllable;
  const index=observedAccent??vietnameseAccentIndex(syllable);
  return index>=0?(syllable.slice(0,index+1)+accent+syllable.slice(index+1)).normalize('NFC'):syllable;
}

function bareToneSpelling(syllable,target) {
  if(target==='cantonese')return syllable.replace(/[1-6]$/u,'');
  if(target==='mandarin')return syllable.normalize('NFD').replace(/[\u0304\u0301\u030c\u0300]/gu,'').normalize('NFC');
  if(target==='vietnamese')return syllable.normalize('NFD').replace(/[\u0301\u0300\u0309\u0303\u0323]/gu,'').normalize('NFC');
  return syllable;
}

// The eSpeak browser wrapper returns tone IDs inside the IPA stream for these voices.
const espeakVietnameseTones={
  vi:map('1=˧˧ 2=˧˨ ɜ=˨˦ 4=˧˩˨ 5=˧ˀ˥ 6=˨ˀ˩ 7=˧˧'),
  'vi-vn-x-central':map('1=˧˥ 2=˦˨ ɜ=˩˧ 4=˧˩˨ 5=˧˩˨ 6=˨ˀ˩ 7=˧˥'),
  'vi-vn-x-south':map('1=˧˧ 2=˧˨ ɜ=˦˥ 4=˨˩˦ 5=˨˩˦ 6=˨˩˨ 7=˧˧'),
};
const espeakCantoneseTones=map('1=˥ 2=˧˥ 3=˧ 4=˨˩ 5=˩˧ 6=˨');

function normalizeEspeakReading(ipa,source,voice) {
  const vietnamese=source==='vietnamese';
  const cantonese=source==='cantonese';
  if(!vietnamese&&!cantonese)return ipa;
  const codes=vietnamese?/[124-7ɜ]/gu:/[1-6]/gu;
  const table=vietnamese?espeakVietnameseTones[voice]??espeakVietnameseTones.vi:espeakCantoneseTones;
  return ipa.split(/(\s+)/u).map(word=>{
    if(!word||/^\s+$/u.test(word)||/[()[\]{}]/u.test(word))return word;
    const markers=word.match(codes)??[];
    let plain=(vietnamese?word.replace(/-(?=[124-7ɜ])/gu,''):word).replace(codes,'');
    if(cantonese)plain=plain.replace(/([aɑɛeəiɔoɵuy])\1/gu,'$1ː');
    if(markers.length>1)return plain;
    const code=markers[0]??(vietnamese&&/[aeiouəɔɛɨɯʊɑ]/u.test(plain)?'1':'');
    if(!code)return plain;
    const checked=/[ptk](?:\p{M}|ʰ|h)*$/u.test(plain);
    return plain+(vietnamese&&checked&&code==='ɜ'?'˦˥':table[code]??'');
  }).join('');
}
