const koreanInitialJamo='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const koreanVowelJamo='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const koreanFinalJamo=' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
const koreanFinalIPA=map('ㄱ=k̚ ㄴ=n ㄷ=t̚ ㄹ=ɭ ㅁ=m ㅂ=p̚ ㅇ=ŋ');
const koreanOnsetIPA=map('ㄱ=k ㄲ=k͈ ㄴ=n ㄷ=t ㄸ=t͈ ㄹ=ɾ ㅁ=m ㅂ=p ㅃ=p͈ ㅅ=sʰ ㅆ=s͈ ㅈ=t͡ɕ ㅉ=t͡ɕ͈ ㅊ=t͡ɕʰ ㅋ=kʰ ㅌ=tʰ ㅍ=pʰ ㅎ=h');
const koreanVowelIPA=map('ㅏ=a̠ ㅐ=e̞ ㅑ=ja̠ ㅒ=je̞ ㅓ=ʌ̹ ㅔ=e̞ ㅕ=jʌ̹ ㅖ=je̞ ㅗ=o̞ ㅘ=wa̠ ㅙ=we̞ ㅚ=we̞ ㅛ=jo̞ ㅜ=u ㅝ=wʌ̹ ㅞ=we̞ ㅟ=ɥi ㅠ=ju ㅡ=ɯ ㅢ=ɰi ㅣ=i');
const koreanCodaReduction=map('ㄲ=ㄱ ㄳ=ㄱ ㄵ=ㄴ ㄶ=ㄴ ㄺ=ㄱ ㄻ=ㅁ ㄼ=ㄹ ㄽ=ㄹ ㄾ=ㄹ ㄿ=ㅂ ㅀ=ㄹ ㅄ=ㅂ ㅅ=ㄷ ㅆ=ㄷ ㅈ=ㄷ ㅊ=ㄷ ㅋ=ㄱ ㅌ=ㄷ ㅍ=ㅂ ㅎ=ㄷ');
const koreanClusterParts=map('ㄳ=ㄱㅆ ㄵ=ㄴㅈ ㄶ=ㄴㅎ ㄺ=ㄹㄱ ㄻ=ㄹㅁ ㄼ=ㄹㅂ ㄽ=ㄹㅆ ㄾ=ㄹㅌ ㄿ=ㄹㅍ ㅀ=ㄹㅎ ㅄ=ㅂㅆ');
const koreanAspiration=map('ㄱ=ㅋ ㄷ=ㅌ ㅂ=ㅍ ㅈ=ㅊ');
const koreanTensing=map('ㄱ=ㄲ ㄷ=ㄸ ㅂ=ㅃ ㅅ=ㅆ ㅈ=ㅉ');
const koreanNasalCoda=map('ㄱ=ㅇ ㄷ=ㄴ ㅂ=ㅁ');
const koreanVoicedOnset=map('ㄱ=ɡ ㄷ=d ㄴ=n ㅂ=b ㅈ=d͡ʑ ㅎ=ɦ');

function koreanReadingSyllables(word) {
  return Array.from(word,letter=>{
    const code=letter.charCodeAt(0)-0xac00;
    return {
      onset:koreanInitialJamo[Math.floor(code/588)],
      vowel:koreanVowelJamo[Math.floor(code%588/28)],
      coda:koreanFinalJamo[code%28].trim(),
      letter,
    };
  });
}

function koreanCodaBeforeVowel(current,next) {
  if(!current.coda||current.coda==='ㅇ')return;
  if(next.vowel==='ㅢ') {
    current.coda=koreanCodaReduction[current.coda]??current.coda;
    return;
  }
  const cluster=koreanClusterParts[current.coda];
  const moved=cluster?.at(-1)??current.coda;
  current.coda=cluster?.[0]??'';
  if(moved==='ㅎ') {
    if(cluster) {
      next.onset=current.coda;
      current.coda='';
    }
  } else {
    next.onset=next.vowel==='ㅣ' && /[ㄷㅌ]/u.test(moved) ? (moved==='ㄷ'?'ㅈ':'ㅊ') : moved;
  }
}

function koreanCodaBeforeConsonant(current,next) {
  const original=current.coda;
  const cluster=koreanClusterParts[original];
  if(original.endsWith('ㅎ')||cluster?.endsWith('ㅎ')) {
    if(koreanAspiration[next.onset]||next.onset==='ㅅ') {
      current.coda=cluster?.[0]??'';
      next.onset=koreanAspiration[next.onset]??'ㅆ';
      return;
    }
    if(next.onset==='ㄴ'&&!cluster)current.coda='ㄴ';
  } else if(next.onset==='ㅎ') {
    const obstruent=cluster?.at(-1)??original;
    const stop=koreanAspiration[obstruent]?obstruent:koreanCodaReduction[obstruent]??obstruent;
    if(koreanAspiration[stop]) {
      current.coda=cluster?.[0]??'';
      next.onset=stop==='ㄷ'&&next.vowel==='ㅣ'?'ㅊ':koreanAspiration[stop];
      return;
    }
  }

  if(original==='ㄺ'&&next.onset==='ㄱ'&&/[고게기]/u.test(next.letter)&&!/[닭흙칡]/u.test(current.letter)) {
    current.coda='ㄹ';
    next.onset='ㄲ';
  } else if(original==='ㄼ'&&current.letter==='밟') {
    current.coda='ㅂ';
  }
  current.coda=koreanCodaReduction[current.coda]??current.coda;
  if(next.onset==='ㄹ'&&/[ㄱㄷㅂㅁㅇ]/u.test(current.coda))next.onset='ㄴ';
  if(current.coda==='ㄴ'&&next.onset==='ㄹ')current.coda='ㄹ';
  if(current.coda==='ㄹ'&&next.onset==='ㄴ')next.onset='ㄹ';
  if(/[ㄴㅁ]/u.test(next.onset)) {
    current.coda=koreanNasalCoda[current.coda]??current.coda;
  } else if(koreanNasalCoda[current.coda]||/[ㄵㄻㄼㄾ]/u.test(original)&&/[다던도록지자구고게기]/u.test(next.letter)) {
    next.onset=koreanTensing[next.onset]??next.onset;
  }
}

function koreanContextReading(word,interactionPositions) {
  if(!/^[가-힣]+$/u.test(word))return '';
  const syllables=koreanReadingSyllables(word);
  for(let i=0;i<syllables.length-1;i++){
    const current=syllables[i],next=syllables[i+1];
    const initial=next.onset;
    const isolatedCoda=koreanCodaReduction[current.coda]??current.coda;
    if(next.onset==='ㅇ')koreanCodaBeforeVowel(current,next);
    else koreanCodaBeforeConsonant(current,next);
    if(next.onset!==initial||current.coda!==isolatedCoda)interactionPositions?.add(i+1);
  }
  const last=syllables.at(-1);
  last.coda=koreanCodaReduction[last.coda]??last.coda;
  if(last.letter==='밟')last.coda='ㅂ';
  return syllables.map(({onset,vowel,coda},index)=>{
    const previous=syllables[index-1];
    const palatal=vowel==='ㅣ'||vowel==='ㅢ'&&onset!=='ㅇ'||koreanVowelIPA[vowel].startsWith('j');
    let consonant=koreanOnsetIPA[onset]??'';
    let nucleus=koreanVowelIPA[vowel];
    if(previous&&(!previous.coda||/[ㄴㄹㅁㅇ]/u.test(previous.coda)))consonant=koreanVoicedOnset[onset]??consonant;
    if(onset==='ㄹ'&&previous?.coda==='ㄹ')consonant='l';
    if(nucleus.startsWith('j')&&onset==='ㄴ') {
      consonant='ɲ';
      nucleus=nucleus.replace(/^j/u,'');
    }
    if(palatal&&onset==='ㅅ')consonant='ɕʰ';
    if(palatal&&onset==='ㅆ')consonant='ɕ͈';
    if(palatal&&onset==='ㅎ'&&consonant==='h')consonant='ç';
    if(vowel==='ㅢ'&&onset!=='ㅇ')nucleus='i';
    return consonant+nucleus+(koreanFinalIPA[coda]??'');
  }).join('');
}

function recoverKoreanWords(chunks) {
  const recovered=[];
  for(let i=0;i<chunks.length;){
    const start=i;
    while(i<chunks.length&&/^[가-힣]+$/u.test(chunks[i].original))i++;
    if(start===i) {
      recovered.push(chunks[i++]);
      continue;
    }
    const parts=chunks.slice(start,i);
    if(parts.length===1&&!parts[0].unknown) {
      recovered.push(parts[0]);
      continue;
    }
    const word=parts.map(part=>part.original).join('');
    const interactions=new Set();
    const ipa=koreanContextReading(word,interactions);
    let offset=0;
    const crossesDictionaryBoundary=parts.slice(0,-1).some(({original})=>{
      offset+=original.length;
      return interactions.has(offset);
    });
    if(parts.some(part=>part.unknown)||crossesDictionaryBoundary)recovered.push({original:word,ipa,ruleBased:true});
    else recovered.push(...parts);
  }
  return recovered;
}
