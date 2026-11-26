// Rank existing dictionary readings against a pronunciation of their phrase.
// A candidate may be selected only when the phrase can be aligned and the
// alternative is appreciably closer. This step never invents a dictionary IPA.
function comparisonPhones(tokens) {
  return tokens.flatMap(phone=>{
    if(!phone.sound)return [];
    if(phone.sound!=='ɝ' && phone.sound!=='ɚ')return [phone];
    return [{...phone,sound:phone.sound==='ɝ'?'ɜ':'ə'},
      {sound:'ɹ',vowel:false,marks:'',nasal:false,length:false}];
  });
}

function speechPhones(ipa,source) {
  return comparisonPhones(tokenizeIPA(ipa,source));
}

function mapPhonemeBoundaries(primary,reference) {
  const rows=primary.length+1,columns=reference.length+1;
  const trail=new Uint8Array(rows*columns);
  let before=new Float64Array(columns),after=new Float64Array(columns);
  for(let j=1;j<columns;j++) {before[j]=j*0.82;trail[j]=2;}
  for(let i=1;i<rows;i++) {
    const row=i*columns;
    after[0]=i*0.88;
    trail[row]=1;
    for(let j=1;j<columns;j++) {
      const paired=before[j-1]+phoneDistance(primary[i-1],reference[j-1]);
      const removal=before[j]+0.88, insertion=after[j-1]+0.82;
      if(paired<=removal&&paired<=insertion){after[j]=paired;trail[row+j]=0;}
      else if(removal<=insertion){after[j]=removal;trail[row+j]=1;}
      else {after[j]=insertion;trail[row+j]=2;}
    }
    [before,after]=[after,before];
  }
  const positions=new Int32Array(rows).fill(-1);
  let i=rows-1,j=columns-1;
  while(i||j) {
    if(positions[i]===-1)positions[i]=j;
    const direction=trail[i*columns+j];
    if(direction!==2)i--;
    if(direction!==1)j--;
  }
  positions[0]=0;
  return {positions,distance:before[columns-1]};
}

function choosePhraseReadings(phrase,referenceIPA,source) {
  if(/[()[\]{}]/u.test(referenceIPA))return phrase;
  const reference=speechPhones(referenceIPA,source);
  const primary=[];
  const spans=phrase.map(chunk=>{
    const start=primary.length;
    if(chunk.ipa)for(const phone of speechPhones(chunk.ipa,source))primary.push(phone);
    return {start,end:primary.length};
  });
  if(!primary.length||!reference.length||reference.length>850||primary.length>850)return phrase;
  const {positions,distance}=mapPhonemeBoundaries(primary,reference);
  if(distance/Math.max(primary.length,reference.length)>0.48)return phrase;
  return phrase.map((chunk,index)=>{
    if(!chunk.alternatives?.length)return chunk;
    const {start,end}=spans[index];
    const local=reference.slice(positions[start],positions[end]);
    if(!local.length)return chunk;
    let baseline,best=Infinity,chosen=chunk.ipa;
    for(const ipa of chunk.alternatives) {
      const parsed=tokenizeIPA(ipa,source);
      const candidate=comparisonPhones(parsed);
      if(!candidate.length||parsed.unknownPhones.size)continue;
      const before=new Float64Array(candidate.length+1),after=new Float64Array(candidate.length+1);
      const score=ipaSequenceDistance(local,candidate,before,after);
      if(ipa===chunk.ipa)baseline=score;
      if(score<best){best=score;chosen=ipa;}
    }
    if(chosen===chunk.ipa||baseline===undefined||baseline-best<0.44||best/Math.max(local.length,1)>0.40)return chunk;
    return {...chunk,ipa:chosen,contextual:true};
  });
}

function contextPhrases(chunks) {
  const groups=[];
  let phrase=[];
  const flush=()=>{if(phrase.length)groups.push(phrase);phrase=[];};
  for(const chunk of chunks) {
    if(chunk.unknown || (chunk.ipa==null&&/[\p{N}\r\n.!?。！？;；]/u.test(chunk.original))) {
      flush();
      groups.push([chunk]);
    } else {
      phrase.push(chunk);
      if(phrase.length>=96)flush();
    }
  }
  flush();
  return groups;
}

// Restore printed word boundaries in a phrase reading when the component
// readings give a consistent alignment. The selected pronunciation stays intact.
function restorePhraseWordSpaces(chunks,source,table) {
  return chunks.map(chunk=>{
    if(!chunk.ipa||/\s/u.test(chunk.ipa)||!/\S\s+\S/u.test(chunk.original))return chunk;
    const words=[...chunk.original.matchAll(/\S+/gu)];
    if(words.length<2||words.length>12)return chunk;
    const primary=[], boundaries=[];
    for(const word of words) {
      const found=table[word[0]]??table[word[0].toLowerCase()];
      if(!found)return chunk;
      const parsed=tokenizeIPA(chooseDictionaryReading(found,source).ipa,source);
      const reading=comparisonPhones(parsed);
      if(!reading.length||parsed.unknownPhones.size)return chunk;
      if(primary.length)boundaries.push(primary.length);
      primary.push(...reading);
    }
    const parsed=tokenizeIPA(chunk.ipa,source,true);
    const reference=parsed.flatMap(phone=>comparisonPhones([phone]).map(part=>({...part,offset:phone.offset})));
    if(parsed.unknownPhones.size||reference.length<words.length||
      Math.max(primary.length,reference.length)>160)return chunk;
    const {positions,distance}=mapPhonemeBoundaries(primary,reference);
    if(distance/Math.max(primary.length,reference.length)>0.28)return chunk;
    const characters=parsed.inputCharacters.slice();
    let innerEnd=characters.length;
    for(let i=boundaries.length-1;i>=0;i--) {
      const boundary=positions[boundaries[i]];
      if(boundary<=0||boundary>=reference.length||reference[boundary-1].offset===reference[boundary].offset)return chunk;
      let offset=reference[boundary].offset;
      while(offset>0&&/[.ˈˌ]/u.test(characters[offset-1]))offset--;
      if(offset<=0||offset>=innerEnd)return chunk;
      const preceding=words[i],space=chunk.original.slice(preceding.index+preceding[0].length,words[i+1].index);
      characters.splice(offset,0,space);
      innerEnd=offset;
    }
    const ipa=characters.join('');
    return {...chunk,ipa,phraseSpacing:true};
  });
}


const phrasePunctuation=/[,،、.!?。！？؛;；:…「」『』“”„‘«»‹›（）()¿¡]/gu;
const hanPhraseSources=new Set(['mandarin','cantonese']);

function punctuatedPhraseParts(text) {
  const boundaries=[];
  for(const match of text.matchAll(phrasePunctuation)) {
    const [mark]=match, position=match.index;
    const before=text[position-1]??'', after=text[position+1]??'';
    if(mark===','&&/\p{N}/u.test(before)&&/\p{N}/u.test(after))continue;
    if((mark==='.'||mark===':')&&/[\p{L}\p{N}\p{M}]/u.test(before)&&/[\p{L}\p{N}\p{M}]/u.test(after))continue;
    let start=position, end=position+mark.length;
    while(start>0&&/[ \t]/u.test(text[start-1]))start--;
    while(end<text.length&&/[ \t]/u.test(text[end]))end++;
    const previous=boundaries.at(-1);
    if(previous&&start<=previous.end)previous.end=end;
    else boundaries.push({start,end});
  }
  const parts=[];
  let from=0;
  for(const {start,end} of boundaries) {
    if(from<start)parts.push({original:text.slice(from,start),spoken:true});
    parts.push({original:text.slice(start,end)});
    from=end;
  }
  if(from<text.length)parts.push({original:text.slice(from),spoken:true});
  return parts;
}

function splitDictionaryPhraseReading(ipa,parts,source,readPortion) {
  if(parts.length===1)return [ipa];
  const hasReading=text=>{
    const parsed=tokenizeIPA(text,source);
    return !parsed.unknownPhones.size&&parsed.some(phone=>phone.sound);
  };
  const clauses=ipa.trim().split(/\s*[|‖]+\s*/u);
  if(clauses.length===parts.length&&clauses.every(hasReading))return clauses;
  const groups=ipa.trim().split(/\s+/u);
  const unitCounts=parts.map(text=>hanPhraseSources.has(source)&&/^\p{Script=Han}+$/u.test(text)
    ? [...text].length
    : text.trim().split(/\s+/u).length);
  const hasWrittenBoundaries=unitCounts.reduce((sum,count)=>sum+count,0)===groups.length;
  if(hasWrittenBoundaries&&groups.every(hasReading)) {
    let start=0;
    return unitCounts.map(count=>{
      const reading=groups.slice(start,start+count).join(' ');
      start+=count;
      return reading;
    });
  }

  const primary=[], boundaries=[];
  for(const part of parts) {
    const chunks=readPortion(part);
    const reference=[];
    for(const chunk of chunks) {
      if(chunk.unknown)return null;
      if(!chunk.ipa)continue;
      const parsed=tokenizeIPA(chunk.ipa,source);
      if(parsed.unknownPhones.size)return null;
      reference.push(...comparisonPhones(parsed));
    }
    if(!reference.length)return null;
    if(primary.length)boundaries.push(primary.length);
    primary.push(...reference);
  }
  const parsed=tokenizeIPA(ipa,source,true);
  const reference=parsed.flatMap(phone=>comparisonPhones([phone]).map(part=>({...part,offset:phone.offset})));
  if(parsed.unknownPhones.size||reference.length<parts.length||Math.max(primary.length,reference.length)>160)return null;
  const {positions,distance}=mapPhonemeBoundaries(primary,reference);
  if(distance/Math.max(primary.length,reference.length)>0.28)return null;
  const readings=[];
  let start=0;
  for(const boundary of boundaries) {
    const position=positions[boundary];
    if(position<=0||position>=reference.length||reference[position-1].offset===reference[position].offset)return null;
    let end=reference[position].offset;
    while(end>start&&/[.ˈˌ]/u.test(parsed.inputCharacters[end-1]))end--;
    if(end<=start)return null;
    readings.push(parsed.inputCharacters.slice(start,end).join('').trim());
    start=end;
  }
  readings.push(parsed.inputCharacters.slice(start).join('').trim());
  return readings;
}

function restoreDictionaryPunctuation(chunks,source,readPortion) {
  return chunks.flatMap(chunk=>{
    if(!chunk.ipa)return [chunk];
    const parts=punctuatedPhraseParts(chunk.original);
    if(parts.length<2)return [chunk];
    const spoken=parts.filter(part=>part.spoken);
    const readings=splitDictionaryPhraseReading(chunk.ipa,spoken.map(part=>part.original),source,readPortion);
    if(!readings)return [chunk];
    let index=0;
    return parts.map(({original,spoken})=>spoken?{...chunk,original,ipa:readings[index++]}:{original});
  });
}

async function applyContextualPronunciation(chunks,source,variant) {
  if(!chunks.some(chunk=>chunk.alternatives?.length>1))return chunks;
  if(source==='french'&&variant==='QC')return chunks;
  const voice=espeakVariants[source]?.[variant]??espeakVoices[source];
  if(!voice)return chunks;
  let reader;
  try {
    reader=await loadEspeak();
    await within(reader.loadVoice(voice),12000,'문장 발음 데이터를 불러오지 못했습니다.');
    reader.setVoice(voice);
  } catch {return chunks;}
  return contextPhrases(chunks).flatMap(phrase=>{
    if(!phrase.some(chunk=>chunk.alternatives?.length>1))return phrase;
    const text=phrase.map(chunk=>chunk.original).join('').trim();
    if(!text||text.length>600)return phrase;
    let reference;
    try {reference=normalizeEspeakReading(reader.phonemes(text),source,voice);}
    catch {return phrase;}
    return choosePhraseReadings(phrase,reference,source);
  });
}
