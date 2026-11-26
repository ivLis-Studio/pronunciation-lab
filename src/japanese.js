const japaneseMoras=Object.fromEntries(Object.entries({
  'アイウエオ':'a i ɯ e o',
  'カキクケコ':'ka ki kɯ ke ko',
  'ガギグゲゴ':'ɡa ɡi ɡɯ ɡe ɡo',
  'サシスセソ':'sa ɕi sɯ se so',
  'ザジズゼゾ':'za d͡ʑi zɯ ze zo',
  'タチツテト':'ta t͡ɕi t͡sɯ te to',
  'ダヂヅデド':'da d͡ʑi zɯ de do',
  'ナニヌネノ':'na ni nɯ ne no',
  'ハヒフヘホ':'ha çi ɸɯ he ho',
  'バビブベボ':'ba bi bɯ be bo',
  'パピプペポ':'pa pi pɯ pe po',
  'マミムメモ':'ma mi mɯ me mo',
  'ラリルレロ':'ɾa ɾi ɾɯ ɾe ɾo',
  'ヤユヨワヰヱヲン':'ja jɯ jo wa i e o ɴ',
  'ヴァ ヴィ ヴ ヴェ ヴォ':'va vi vɯ ve vo',
  'ファ フィ フェ フォ':'ɸa ɸi ɸe ɸo',
  'ウィ ウェ ウォ イェ':'wi we wo je',
  'ティ トゥ ディ ドゥ':'ti tɯ di dɯ',
  'シェ ジェ チェ':'ɕe d͡ʑe t͡ɕe',
  'ツァ ツィ ツェ ツォ':'t͡sa t͡si t͡se t͡so',
  'クァ クィ クェ クォ グァ':'kwa kwi kwe kwo ɡwa',
  'スィ ズィ':'si zi',
}).flatMap(([letters,sounds])=>{
  const kana=letters.includes(' ') ? letters.split(' ') : [...letters];
  return sounds.split(' ').map((ipa,index)=>[kana[index],ipa]);
}));

for (const [kana,onset] of Object.entries({
  キ:'kj',ギ:'ɡj',シ:'ɕ',ジ:'d͡ʑ',チ:'t͡ɕ',ヂ:'d͡ʑ',ニ:'nj',ヒ:'ç',ビ:'bj',
  ピ:'pj',ミ:'mj',リ:'ɾj',フ:'ɸj',テ:'tj',デ:'dj',ヴ:'vj',
})) {
  for (const [small,vowel] of Object.entries({ャ:'a',ュ:'ɯ',ョ:'o'})) {
    japaneseMoras[kana+small]=onset+vowel;
  }
}

const japaneseKana=/[\p{Script=Hiragana}\p{Script=Katakana}\u30fc\uff66-\uff9f]/u;
const japaneseHan=/\p{Script=Han}/u;
const japaneseKanaOnly=/^[\p{Script=Hiragana}\p{Script=Katakana}\u30fc\uff66-\uff9f]+$/u;
const japaneseSegmenter=new Intl.Segmenter('ja',{granularity:'word'});

function japaneseKanaReading(kana) {
  const joined=kana.normalize('NFKC').replace(/[\u3041-\u3096]/gu,letter=>String.fromCharCode(letter.charCodeAt(0)+0x60));
  const units=[];
  let gemination=false, newWord=false;
  for (let index=0;index<joined.length;) {
    const current=joined[index];
    if (current==='|') {newWord=true;index++;continue;}
    if (current==='ッ') {
      gemination=true;
      index++;
      continue;
    }
    if (current==='ー') {
      if (units.length && /[aeioɯ]$/u.test(units.at(-1))) units[units.length-1]+='ː';
      index++;
      continue;
    }
    const compound=joined.slice(index,index+2);
    const written=japaneseMoras[compound] ? compound : current;
    let reading=japaneseMoras[written] ?? japaneseMoras[({ァ:'ア',ィ:'イ',ゥ:'ウ',ェ:'エ',ォ:'オ',ヮ:'ワ',ヵ:'カ',ヶ:'ケ'})[written]];
    if (!reading) return '';
    index+=written.length;
    const previousVowel=units.at(-1)?.match(/([aeioɯ])$/u)?.[1];
    if (!newWord && !gemination && previousVowel && (reading===previousVowel || previousVowel==='o' && written==='ウ' || previousVowel==='e' && written==='イ')) {
      units[units.length-1]+='ː';
      continue;
    }
    newWord=false;
    if (gemination) {
      const onset=reading.match(/^(t͡s|t͡ɕ|d͡ʑ|[^aeioɯɴ])/u)?.[0];
      reading=onset ? onset+'ː'+reading.slice(onset.length) : 'ʔ'+reading;
      gemination=false;
    }
    units.push(reading);
  }
  return units.join('')+(gemination?'ʔ':'');
}

function startsJapanesePhrase(token,previous) {
  if (['助詞','助動詞'].includes(token.pos) || token.pos_detail_1==='接尾' || token.pos_detail_1==='非自立' && ['動詞','形容詞'].includes(token.pos)) return false;
  if (previous.pos==='接頭詞' || previous.pos==='名詞' && token.pos==='名詞') return false;
  if (token.pos==='動詞') {
    if (previous.pos==='名詞' && previous.pos_detail_1==='サ変接続' && ['する','できる','出来る'].includes(token.basic_form)) return false;
    if (previous.pos==='動詞' && previous.conjugated_form?.startsWith('連用')) return false;
  }
  return true;
}

function uniqueJapaneseReading(value) {
  if(typeof value!=='string') return '';
  const readings=new Set([...value.matchAll(/\/([^/]+)\//gu)].map(match=>match[1].replace(/\s+/gu,'').normalize('NFC')));
  if(readings.size!==1) return '';
  const [ipa]=readings;
  const phones=tokenizeIPA(ipa,'japanese');
  return phones.some(phone=>phone.sound) && !phones.unknownPhones.size ? ipa : '';
}

const japaneseOfflineParticles=new Set('は が を に で と の も へ や か な ね よ から まで だけ ほど'.split(' '));
const japaneseOfflineTokenizer={
  tokenize(text) {
    return [...japaneseSegmenter.segment(text)].flatMap(({segment,isWordLike})=>{
      const attached=segment.match(/^([\p{Nd}.,，．]+)(\p{Script=Latin}+)$/u);
      if(attached&&japaneseUnitReading(attached[1],attached[2])) {
        return [{surface_form:attached[1],pos:'名詞'},{surface_form:attached[2],pos:'名詞'}];
      }
      return [{
        surface_form:segment,
        pronunciation:isWordLike&&japaneseKanaOnly.test(segment)?segment:null,
        pos:japaneseOfflineParticles.has(segment)?'助詞':isWordLike?'名詞':'記号',
      }];
    });
  },
};

const japaneseNearLatin=/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]/u;
const japaneseLatinJoiners=/^[ \t\p{Ps}\p{Pe}\p{Pi}\p{Pf}\p{Nd}]+|[ \t\p{Ps}\p{Pe}\p{Pi}\p{Pf}\p{Nd}]+$/gu;

function japaneseUnitReading(before,term) {
  return /\p{Nd}[ \t]*$/u.test(before) ? japaneseLatinUnits.get(term.normalize('NFKC')) : undefined;
}

function japaneseLatinReading(text,at,term) {
  const spelling=term.normalize('NFKC');
  if(!/^[A-Za-z]+$/u.test(spelling))return undefined;
  const before=text.slice(0,at);
  const unit=japaneseUnitReading(before,spelling);
  if(unit)return unit;
  const after=text.slice(at+term.length);
  // Keep multiword Latin passages intact for the mixed-script reader.
  if(/[\p{Script=Latin}\p{M}][ \t.‐‑-]*$/u.test(before) || /^[ \t.‐‑-]*\p{Script=Latin}/u.test(after))return undefined;
  const nearBefore=before.replace(japaneseLatinJoiners,'').at(-1)??'';
  const nearAfter=after.replace(japaneseLatinJoiners,'')[0]??'';
  if(!japaneseNearLatin.test(nearBefore+nearAfter) && term!==text.trim())return undefined;
  const attested=japaneseLatinAttested.get(spelling)||
    (/^[A-Z][a-z]+$/u.test(spelling)?japaneseLatinAttested.get(spelling.toLowerCase()):undefined);
  return attested||japaneseLatinDictionary.get(spelling);
}

function japaneseMorphologyChunks(input,tokenizer,lexicon,lookup) {
  const chunks=[];
  for(const line of input.split(/(\r?\n)/u)) {
    if(!line) continue;
    if(!/\p{L}/u.test(line)) {chunks.push({original:line});continue;}
    const segmenter=tokenizer??japaneseOfflineTokenizer;
    const tokens=lexicon||lookup ? japaneseTokensWithDictionaries(line,segmenter,lexicon,lookup) : segmenter.tokenize(line);
    let previousToken=null,offset=0;
    for(const token of tokens) {
      const original=token.surface_form;
      const start=line.indexOf(original,offset);
      if(start<0) continue;
      if(start>offset) {chunks.push(...splitMissingText(line.slice(offset,start)));previousToken=null;}
      offset=start+original.length;
      if(/[・･]/u.test(original)) {
        const parts=original.split(/([・･])/u).filter(Boolean).map(part=>({
          original:part,ipa:japaneseKanaOnly.test(part)?japaneseKanaReading(part):'',
        }));
        if(parts.every(part=>part.ipa||/^[・･]$/u.test(part.original))) {
          chunks.push(...parts);
          previousToken=null;
          continue;
        }
      }
      const kanaOnly=japaneseKanaOnly.test(original);
      let kana=japaneseLatinReading(line,start,original) ||
        (kanaOnly || japaneseHan.test(original) ? (token.pronunciation || (kanaOnly?original:'')) : '');
      if(!tokenizer && ['こんにちは','こんばんは'].includes(original)) kana=original.slice(0,-1)+'わ';
      if(!tokenizer && previousToken && original==='は') kana='わ';
      if(!tokenizer && previousToken && original==='へ') kana='え';
      if(!kana && !token.dictionaryIPA) {
        chunks.push(...splitMissingText(original));
        previousToken=null;
        continue;
      }
      const previous=chunks.at(-1);
      const identifiesWord=tokenizer || japaneseHan.test(original) && token.pronunciation;
      const phraseBreak=Boolean(identifiesWord && previous?.readings && previousToken && startsJapanesePhrase(token,previousToken));
      if(!previous?.readings || phraseBreak) chunks.push({original:'',readings:[],phraseBreak});
      const phrase=chunks.at(-1);
      phrase.original+=original;
      const last=phrase.readings.at(-1);
      if(token.dictionaryIPA) phrase.readings.push({ipa:token.dictionaryIPA});
      else if(last?.kana) {
        const vowelSuffix=token.pos==='助動詞' && original==='う';
        last.kana+=(vowelSuffix || !tokenizer ? '' : '|')+kana;
      } else phrase.readings.push({kana});
      previousToken=token;
    }
    if(offset<line.length) chunks.push(...splitMissingText(line.slice(offset)));
  }
  return chunks.map(chunk=>{
    if(!chunk.readings) return chunk;
    const parts=chunk.readings.map(reading=>reading.ipa ?? japaneseKanaReading(reading.kana));
    return parts.every(Boolean)
      ? {original:chunk.original,ipa:parts.join(''),phraseBreak:chunk.phraseBreak}
      : {original:chunk.original,unknown:true};
  });
}

const japaneseKoreanMoras={
  '':'아 이 우 에 오',
  k:'카 키 쿠 케 코', g:'가 기 구 게 고', s:'사 시 스 세 소', z:'자 지 즈 제 조',
  t:'타 티 투 테 토', d:'다 디 두 데 도', n:'나 니 누 네 노', h:'하 히 후 헤 호',
  b:'바 비 부 베 보', p:'파 피 푸 페 포', m:'마 미 무 메 모', r:'라 리 루 레 로',
  j:'야 이 유 예 요', w:'와 위 우 웨 워', f:'파 피 후 페 포', v:'바 비 부 베 보',
  ʃ:'샤 시 슈 셰 쇼', ʒ:'자 지 주 제 조', 'tʃ':'차 치 추 체 초', 'dʒ':'자 지 주 제 조',
  ts:'차 치 쓰 체 초', dz:'자 지 즈 제 조', ɲ:'냐 니 뉴 녜 뇨', ç:'햐 히 휴 혜 효',
  kj:'캬 키 큐 켸 쿄', gj:'갸 기 규 계 교', nj:'냐 니 뉴 녜 뇨',
  bj:'뱌 비 뷰 볘 뵤', pj:'퍄 피 퓨 폐 표', mj:'먀 미 뮤 몌 묘', rj:'랴 리 류 례 료',
  fj:'퍄 피 퓨 폐 표', vj:'뱌 비 뷰 볘 뵤', tj:'탸 티 튜 톄 툐', dj:'댜 디 듀 뎨 됴',
  kw:'콰 퀴 쿠 퀘 쿼', gw:'과 귀 구 궤 궈',
};
const japaneseKoreanRows=Object.fromEntries(Object.entries(japaneseKoreanMoras).map(([key,row])=>[key,row.split(' ')]));
const japaneseKoreanInitial=map('카=가 키=기 쿠=구 케=게 코=고 캬=갸 큐=규 쿄=교 타=다 테=데 토=도 치=지 차=자 추=주 초=조');

function japaneseKoreanWord(word,useInitialForms) {
  const output=[];
  const vowelOf=token=>token?.sound==='ɯ'?'u':fiveVowels[token?.sound];
  const soundOf=token=>token?.sound==='ɰ'?'w':phoneticBase[token?.sound];
  function addFinal(coda) {
    const last=output.at(-1)?.codePointAt(0);
    if (last>=0xac00 && last<=0xd7a3 && (last-0xac00)%28===0) {
      output[output.length-1]=String.fromCodePoint(last+coda);
    } else {
      output.push(coda===19?'읏':'은');
    }
  }
  for (let index=0;index<word.length;) {
    const current=word[index],next=word[index+1];
    let onset='';
    if (!current.vowel) {
      const key=soundOf(current);
      if (current.sound==='ɴ' || ['m','n','ŋ'].includes(key) && !next?.vowel && !['j','w'].includes(soundOf(next))) {
        addFinal(4);
        index++;
        continue;
      }
      if (current.sound==='ʔ') {
        addFinal(19);
        index++;
        continue;
      }
      onset=key==='ŋ'?'g':key==='l'?'r':key;
      const doubled=next && !next.vowel && soundOf(next)===key && word[index+2]?.vowel;
      if ((current.length && !['m','n','ŋ','r','l'].includes(key)) || doubled) addFinal(19);
      if (doubled) { index++; continue; }
      if (current.marks.includes('ʲ') && japaneseKoreanRows[onset+'j']) onset+='j';
      index++;
      if (['w','j'].includes(soundOf(word[index])) && word[index+1]?.vowel && japaneseKoreanRows[onset+soundOf(word[index])]) {
        onset+=soundOf(word[index++]);
      }
    }

    const nucleus=word[index]?.vowel ? word[index++] : null;
    const vowel=vowelOf(nucleus) ?? 'u';
    let glyph=(japaneseKoreanRows[onset] ?? japaneseKoreanRows[''])['aiueo'.indexOf(vowel)];
    if (useInitialForms && output.length===0) glyph=japaneseKoreanInitial[glyph] ?? glyph;
    output.push(glyph);
  }
  return output.join('');
}
