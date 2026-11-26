const godanKana={
  v5u:['う','わ','い','え','お','って','った'], v5k:['く','か','き','け','こ','いて','いた'],
  'v5k-s':['く','か','き','け','こ','って','った'], v5g:['ぐ','が','ぎ','げ','ご','いで','いだ'],
  v5s:['す','さ','し','せ','そ','して','した'], v5t:['つ','た','ち','て','と','って','った'],
  v5n:['ぬ','な','に','ね','の','んで','んだ'], v5b:['ぶ','ば','び','べ','ぼ','んで','んだ'],
  v5m:['む','ま','み','め','も','んで','んだ'], v5r:['る','ら','り','れ','ろ','って','った'],
};

function japaneseInflections(word,reading,kind,stems=false) {
  const tail=kind==='adj-i'?'い':kind==='v1'?'る':godanKana[kind]?.[0];
  if(!tail || !word.endsWith(tail) || !reading.endsWith(tail)) return [];
  let endings;
  if(kind==='adj-i') endings=['く','くて','くない','くなかった','くなくて','かった','ければ','かろう'];
  else if(kind==='v1') endings=[...(stems?['']:[]),'た','て','ない','なかった','なくて','ます','ました','ません','れば','よう','られる','られない','させる','ろ'];
  else {
    const [,a,i,e,o,te,ta]=godanKana[kind];
    endings=[...(stems?[i]:[]),te,ta,a+'ない',a+'なかった',a+'なくて',i+'ます',i+'ました',i+'ません',e+'ば',o+'う',a+'れる',a+'せる'];
  }
  return endings.map(end=>[word.slice(0,-1)+end,reading.slice(0,-1)+end]);
}

function buildJapaneseLexicon(text,stems=false) {
  const exact=new Map(), derived=new Map(), longest=new Map();
  function register(word) {
    const first=String.fromCodePoint(word.codePointAt(0));
    longest.set(first,Math.max(longest.get(first)??0,word.length));
  }
  const [rows,protectedSpellings='']=text.split('\n\n');
  const protectedWords=new Set(protectedSpellings.split('\n'));
  for(const row of rows.split('\n')) {
    if(!row) continue;
    const [word,reading,kind]=row.split('\t');
    const entry={reading,kind};
    exact.set(word,entry);
    register(word);
    for(const [surface,kana] of japaneseInflections(word,reading,kind,stems)) {
      if(!derived.has(surface)) derived.set(surface,{reading:kana,kind});
      else if(derived.get(surface)?.reading!==kana) derived.set(surface,null);
      register(surface);
    }
  }
  return {exact,derived,longest,protectedWords};
}

let japaneseLexiconRequest;
async function loadJapaneseLexicon() {
  if(!japaneseLexiconRequest) {
    japaneseLexiconRequest=decompressTextData(japaneseLexiconPayload).then(buildJapaneseLexicon);
  }
  return japaneseLexiconRequest;
}

let japaneseOfflineLexiconRequest;
function loadJapaneseOfflineLexicon() {
  if(!japaneseOfflineLexiconRequest) {
    japaneseOfflineLexiconRequest=Promise.all([decompressTextData(japaneseOfflinePayload),decompressTextData(japaneseLexiconPayload)])
      .then(([common,general])=>buildJapaneseLexicon(common+'\n'+general.split('\n\n')[0],true));
  }
  return japaneseOfflineLexiconRequest;
}

function japaneseReferenceToken(surface,{reading,kind}) {
  const pos=kind==='adj-i'?'形容詞':kind==='v1' || kind in godanKana?'動詞':kind==='adv'?'副詞':'名詞';
  return {surface_form:surface,pronunciation:reading,pos,pos_detail_1:kind==='suf'?'接尾':''};
}

function keepsParticlePronunciation(entry,token,surface) {
  if(surface!==token.surface_form || !token.pronunciation) return true;
  const hiragana=text=>text.replace(/[\u30a1-\u30f6]/gu,letter=>String.fromCharCode(letter.charCodeAt(0)-0x60));
  const proposed=[...hiragana(entry.reading)], known=[...hiragana(token.pronunciation)];
  if(proposed.length!==known.length) return true;
  let changes=0;
  for(let index=0;index<known.length;index++) {
    if(proposed[index]===known[index])continue;
    if(proposed[index]==='は' && known[index]==='わ' || proposed[index]==='へ' && known[index]==='え')changes++;
    else return true;
  }
  return changes===0;
}

function insideJapaneseCompound(line,start,end) {
  const previous=[...line.slice(0,start)].at(-1) ?? '';
  const following=end<line.length?String.fromCodePoint(line.codePointAt(end)):'';
  return /[\p{Script=Han}\p{Script=Katakana}ー]/u.test(previous+following);
}

function referenceJapaneseCandidate(line,index,token,boundaries,lexicon,runs,unreadable,tokenStarts) {
  if(/[\p{Script=Latin}\p{N}]/u.test(line[index-1]??''))return null;
  const firstEnd=index+token.surface_form.length;
  const following=tokenStarts.get(firstEnd);
  if(token.pos_detail_1==='サ変接続' && following?.basic_form==='する')return null;
  const run=runs.get(index);
  const altersParticle=run && [...tokenStarts].some(([position,part])=>position>=index && position<index+run.length &&
    part.pos==='助詞' && ['は','へ'].includes(part.surface_form) &&
    japaneseKanaReading(part.surface_form)!==japaneseKanaReading(part.pronunciation??''));
  if(run && !altersParticle) {
    const full=lexicon.exact.get(run);
    if(full && keepsParticlePronunciation(full,token,run)) return japaneseReferenceToken(run,full);
    if(!lexicon.protectedWords.has(run) && lexicon.derived.get(run)) return japaneseReferenceToken(run,lexicon.derived.get(run));
  }
  const first=String.fromCodePoint(line.codePointAt(index));
  const length=lexicon.longest.get(first) ?? 0;
  if(!japaneseHan.test(first))return null;
  const mayNeedInflection=!token.pronunciation || token.pos==='名詞' &&
    token.pos_detail_1!=='固有名詞' && /^\p{Script=Han}+$/u.test(token.surface_form);
  const maxEnd=Math.min(index+length,line.length);
  for(let end=maxEnd;end>=firstEnd;end--) {
    const surface=line.slice(index,end);
    const entry=lexicon.exact.get(surface) ?? (mayNeedInflection?lexicon.derived.get(surface):null);
    if(!entry || !keepsParticlePronunciation(entry,token,surface))continue;
    if(surface.length===first.length && insideJapaneseCompound(line,index,end))continue;
    if([...tokenStarts].some(([position,part])=>position>index && position<end && part.pos==='助詞'))continue;
    const inflects=entry.kind==='adj-i' || entry.kind==='v1' || entry.kind in godanKana;
    const recoversUnknown=unreadable.some(position=>position>=index && position<end);
    if(!recoversUnknown && !(mayNeedInflection && inflects && /[ぁ-ゖ]$/u.test(surface) && end>firstEnd))continue;
    if(end!==line.length && !boundaries.has(end) && !inflects)continue;
    return japaneseReferenceToken(surface,entry);
  }
  return null;
}

function upstreamJapaneseCandidate(line,index,token,lookup) {
  if(!lookup || token.pronunciation || !japaneseHan.test(token.surface_form))return null;
  const run=line.slice(index).match(/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+/u)?.[0] ?? '';
  const chars=[...run].slice(0,16);
  for(let length=chars.length;length>0;length--) {
    const surface=chars.slice(0,length).join('');
    if(surface.length<token.surface_form.length)break;
    if(length===1 && insideJapaneseCompound(line,index,index+surface.length))continue;
    const reading=uniqueJapaneseReading(lookup[surface]);
    if(reading)return {surface_form:surface,dictionaryIPA:reading,pos:'名詞'};
  }
  return null;
}

function japaneseTokensWithDictionaries(line,tokenizer,lexicon,lookup) {
  const tokens=[];
  let offset=0,protectedEnd=0;
  const runs=new Map([...line.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]+/gu)].map(m=>[m.index,m[0]]));
  while(offset<line.length) {
    const base=tokenizer.tokenize(line.slice(offset));
    const boundaries=new Set();
    let cursor=offset;
    const unreadable=[],tokenStarts=new Map();
    for(const token of base) {
      const start=line.indexOf(token.surface_form,cursor);
      if(start<0)continue;
      cursor=start+token.surface_form.length;
      boundaries.add(cursor);
      tokenStarts.set(start,token);
      if(!token.pronunciation && japaneseHan.test(token.surface_form)) unreadable.push(start);
    }
    let recovered=false;
    for(const token of base) {
      const index=line.indexOf(token.surface_form,offset);
      if(index<0)continue;
      const run=runs.get(index);
      if(run && lexicon?.protectedWords.has(run)) protectedEnd=index+run.length;
      const reference=lexicon && index>=protectedEnd ? referenceJapaneseCandidate(line,index,token,boundaries,lexicon,runs,unreadable,tokenStarts) : null;
      const candidate=reference ?? upstreamJapaneseCandidate(line,index,token,lookup);
      if(candidate) {
        tokens.push(candidate);
        offset=index+candidate.surface_form.length;
        recovered=candidate.surface_form!==token.surface_form;
        if(recovered)break;
      } else {
        tokens.push(token);
        offset=index+token.surface_form.length;
      }
    }
    if(!recovered)break;
  }
  return tokens;
}
