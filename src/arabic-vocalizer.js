const arabicLetters=/[\u0621-\u063a\u0641-\u064a\u0671]/u;
const arabicWords=/(?=\p{L})\p{Script=Arabic}(?:(?=\p{L})\p{Script=Arabic}|\p{M})*/gu;
const arabicGraphemes=/([\u0621-\u063a\u0641-\u064a\u0671])([\u064b-\u0652\u0670]*)/gu;
const arabicVowels=map('َ=a ُ=u ِ=i ً=an ٌ=un ٍ=in ٰ=aː');
const arabicVocalizedConsonants=map('ء=ʔ أ=ʔ إ=ʔ ؤ=ʔ ئ=ʔ ب=b ت=t ث=θ ج=d͡ʒ ح=ħ خ=x د=d ذ=ð ر=r ز=z س=s ش=ʃ ص=sˤ ض=dˤ ط=tˤ ظ=ðˤ ع=ʕ غ=ɣ ف=f ق=q ك=k ل=l م=m ن=n ه=h و=w ي=j');
let arabicVocalizerRequest;

function vocalizedArabicLetters(word) {
  return [...word.normalize('NFC').matchAll(arabicGraphemes)];
}

function explicitArabicMarks(original,predicted) {
  const words=vocalizedArabicLetters(original), vocalized=vocalizedArabicLetters(predicted);
  return words.map(([,letter,marks],index)=>{
    let inferred=vocalized[index][2];
    if(/[ً-ِْٰ]/u.test(marks))inferred=inferred.replace(/[ً-ِْٰ]/gu,'');
    return letter+[...new Set(marks+inferred)].join('');
  }).join('');
}

function arabicPhonemes(word) {
  const graphemes=vocalizedArabicLetters(word);
  if(!graphemes.length||graphemes.map(letter=>letter[0]).join('')!==word.normalize('NFC'))return '';
  const spelling=graphemes.map(letter=>letter[1]).join('');
  const article=spelling.match(/^(?:[وف])?(?:(?:[بك])?[اٱ]ل|لل)(?=.)/u);
  const articleL=article?article[0].length-1:-1;
  const sounds=[];
  for(const [index,[,letter,marks]] of graphemes.entries()) {
    const last=index===graphemes.length-1;
    const previous=sounds.at(-1);
    const vowelMark=[...marks].find(mark=>arabicVowels[mark]);
    const vowel=arabicVowels[vowelMark]??'';
    const next=graphemes[index+1];
    if(letter==='آ') {
      sounds.push('ʔ','aː');
    } else if(letter==='ا'||letter==='ٱ'||letter==='ى') {
      if(index===0) {
        const opening=articleL===1?'a':next?.[2].replace('ّ','')==='ْ'?'i':'a';
        sounds.push('ʔ',vowel||opening);
      } else if(index===articleL-1) {
        continue;
      } else if(previous==='an'&&last) {
        continue;
      } else if(vowel==='an'&&last) {
        if(previous==='a')sounds.pop();
        sounds.push('an');
      } else if(previous==='aː'&&last) {
        continue;
      } else {
        if(previous==='a')sounds.pop();
        if(previous==='i'||previous==='u'||marks.includes('ْ'))return '';
        sounds.push('aː');
      }
    } else if(letter==='ة') {
      if(!last)return '';
      if(previous==='a')sounds.pop();
      sounds.push('a');
    } else if(index===articleL&&next?.[2].includes('ّ')&&arabicSunLetters[next[1]]) {
      continue;
    } else if(!marks&&((letter==='و'&&previous==='u')||(letter==='ي'&&previous==='i'))) {
      sounds[sounds.length-1]=previous+'ː';
    } else {
      const consonant=arabicVocalizedConsonants[letter];
      if(!consonant)return '';
      sounds.push(consonant+(marks.includes('ّ')?'ː':''));
      if(vowel)sounds.push(vowel);
    }
  }
  const ipa=sounds.join('');
  return /[aiu]/u.test(ipa)?ipa:'';
}

function arabicWordShape(word) {
  return [...word].filter(char=>arabicLetters.test(char)).join('');
}

function collectArabicReadings(vocalize,input,context,readings,only) {
  for(const {0:line,index:lineStart} of context.matchAll(/[^\r\n.!?؟]+/gu)) {
    if(line.length>1000)continue;
    const originals=[...line.matchAll(arabicWords)];
    const words=originals.map(match=>match[0].normalize('NFC'));
    const shapes=words.map(arabicWordShape);
    let predicted;
    try {predicted=[...vocalize(line.normalize('NFC')).matchAll(arabicWords)];}
    catch {continue;}
    if(predicted.length!==words.length||predicted.some((match,index)=>arabicWordShape(match[0])!==shapes[index]))continue;
    for(const [index,match] of originals.entries()) {
      const word=words[index], guessed=predicted[index][0];
      const start=lineStart+match.index;
      if(only&&!only.has(start))continue;
      const exact=input.slice(start,start+match[0].length);
      const graphemes=vocalizedArabicLetters(word);
      if(!shapes[index]||graphemes.map(letter=>letter[0]).join('')!==word||shapes[index]!==arabicWordShape(guessed))continue;
      const guessedLetters=vocalizedArabicLetters(guessed);
      if(guessedLetters.length!==graphemes.length)continue;
      const ipa=arabicPhonemes(explicitArabicMarks(word,guessed));
      if(!ipa||tokenizeIPA(ipa,'arabic').unknownPhones.size)continue;
      readings.set(start,{original:exact,ipa,spellingRecovered:word!==exact.normalize('NFC')});
    }
  }
}

async function recoverArabicReadings(chunks,source) {
  if(source!=='arabic'||!chunks.some(chunk=>chunk.unknown&&[...chunk.original.matchAll(arabicWords)].some(([word])=>arabicLetters.test(word.normalize('NFC')))))return chunks;
  let vocalize;
  try {
    arabicVocalizerRequest??=makeArabicVocalizer().catch(error=>{arabicVocalizerRequest=undefined;throw error;});
    vocalize=await arabicVocalizerRequest;
  } catch {
    return chunks;
  }
  const input=chunks.map(chunk=>chunk.original).join('');
  const readings=new Map();
  collectArabicReadings(vocalize,input,input,readings);
  const recoverable=new Set();
  let contextOffset=0;
  const context=chunks.map(chunk=>{
    const start=contextOffset;
    contextOffset+=chunk.original.length;
    if(!chunk.arabicSpelling||readings.has(start))return chunk.original;
    recoverable.add(start);
    return chunk.arabicSpelling;
  }).join('');
  if(recoverable.size)collectArabicReadings(vocalize,input,context,readings,recoverable);

  let offset=0;
  return chunks.flatMap(chunk=>{
    const start=offset;
    offset+=chunk.original.length;
    if(!chunk.unknown)return [chunk];
    let pieceOffset=start;
    return splitMissingText(chunk.original).map(piece=>{
      const reading=readings.get(pieceOffset);
      pieceOffset+=piece.original.length;
      return piece.unknown&&reading?.original===piece.original?
        {...piece,ipa:reading.ipa,unknown:false,vocalized:true,spellingRecovered:reading.spellingRecovered}:piece;
    });
  });
}
