const khmerSourceRun=/^[\u1780-\u17d3\u17d7\u17dd\u200c\u200d]+$/u;
const khmerSourceParts=/([\u1780-\u17d3\u17d7\u17dd\u200c\u200d]+)/u;
const khmerSourceLetters=/[\u1780-\u17d3\u17d7\u17dd]/u;
const khmerWords=new Intl.Segmenter('km',{granularity:'word'});
const khmerGraphemes=new Intl.Segmenter('km',{granularity:'grapheme'});
let khmerSupplementRequest;

function khmerVariantKey(word) {
  return word.replaceAll(/\u17d2[\u178a\u178f]/gu,'្ដ')
    .replaceAll('ឲ','ឱ').replaceAll('ឣ','អ').replaceAll('ឤ','អា');
}

const khmerFirstSeries=new Set('កខចឆដឋណតថបផសហឡអ');

function khmerSyllableKeys(word) {
  const parts=word.match(/^([ក-អ][៉៊]?)([ា-ៅ])([ក-អ]?)(់?)$/u);
  if(!parts)return null;
  const [,onset,vowel,coda,mark]=parts;
  const series=onset.includes('៊')?'o':onset.includes('៉')||khmerFirstSeries.has(onset[0])?'a':'o';
  return [onset,series+vowel+coda+mark];
}

function khmerSyllableReading(word,[onsets,rhymes]) {
  const keys=khmerSyllableKeys(word);
  if(!keys)return '';
  const onset=onsets[keys[0]],rhyme=rhymes[keys[1]];
  return onset&&rhyme?onset+rhyme:'';
}

function loadKhmerSourceSupplement() {
  if(!khmerSupplementRequest) {
    khmerSupplementRequest=Promise.all([khmerSupplementPayload,khmerVariantPayload].map(payload=>decompressTextData(payload).then(JSON.parse)))
      .then(([table,[unicode,corrections]])=>({
        table,unicode,corrections,
        maximum:Object.keys(table).reduce((length,word)=>Math.max(length,word.length),0),
      })).catch(error=>{khmerSupplementRequest=undefined;throw error;});
  }
  return khmerSupplementRequest;
}

function khmerClusterCuts(input) {
  const cuts=[0];
  for(const {index,segment} of khmerGraphemes.segment(input)) {
    const end=index+segment.length;
    if(end<input.length && (/្[\u200c\u200d]*$/u.test(segment)||/^[\p{M}\u200c\u200d]/u.test(input.slice(end,end+1))))continue;
    cuts.push(end);
  }
  return cuts;
}

function planKhmerSourceRun(input,table,{table:supplement,unicode,corrections},maximum,allowInference=false) {
  const cuts=khmerClusterCuts(input);
  const wordCuts=new Set([0,input.length]);
  for(const {index,segment,isWordLike} of khmerWords.segment(input)) {
    if(isWordLike){wordCuts.add(index);wordCuts.add(index+segment.length);}
  }
  const last=cuts.length-1,paths=new Array(cuts.length);
  paths[last]={missing:0,inferred:0,cost:0};
  for(let start=last-1;start>=0;start--) {
    const base=cuts[start],next=cuts[start+1],following=paths[start+1];
    let best={missing:following.missing+next-base,inferred:following.inferred,cost:following.cost+2,step:start+1};
    for(let end=start+1;end<=last&&cuts[end]-base<=maximum;end++) {
      const edge=cuts[end];
      const word=input.slice(base,edge).replace(/[\u200c\u200d]/gu,'');
      if(!/^[\u1780-\u17b3]/u.test(word))continue;
      if(word.length===1&&(!wordCuts.has(base)||!wordCuts.has(edge)))continue;
      const main=table[word],extra=Object.hasOwn(supplement,word)?supplement[word]:undefined;
      const equivalent=!main&&!extra?unicode[khmerVariantKey(word)]:undefined;
      const alternative=!main&&!extra?(equivalent===word?undefined:equivalent)??corrections[word]:undefined;
      const known=main??extra??(alternative?(table[alternative]??supplement[alternative]):undefined);
      const inferred=!known&&allowInference?khmerSyllableReading(word,khmerSyllableModel):'';
      const value=known||(inferred?'/'+inferred+'/':'');
      if(!value)continue;
      const tail=paths[end];
      const cost=tail.cost+1+(main?0:0.16)+(wordCuts.has(edge)?0:0.24)+(alternative?1:0);
      const guessed=tail.inferred+(inferred?word.length:0);
      if(tail.missing<best.missing||tail.missing===best.missing&&(guessed<best.inferred||guessed===best.inferred&&cost<best.cost)) {
        best={missing:tail.missing,inferred:guessed,cost,step:end,value,extra:Boolean(extra&&!main),alternative,guessed:Boolean(inferred)};
      }
    }
    paths[start]=best;
  }
  const chunks=[];
  for(let start=0;start<last;){
    const step=paths[start];
    const original=input.slice(cuts[start],cuts[step.step]);
    start=step.step;
    if(step.value) {
      const reading=chooseDictionaryReading(step.value,'khmer');
      if(hasKnownSound(reading.ipa,'khmer')) {
        chunks.push({original,...reading,phraseBreak:true,khmerSupplement:step.extra,...(step.alternative?{khmerVariant:step.alternative}:{}),...(step.guessed?{khmerInferred:true}:{})});
        continue;
      }
    }
    const previous=chunks.at(-1);
    if(previous?.unknown)previous.original+=original;
    else chunks.push({original,unknown:true});
  }
  return chunks;
}

async function repairKhmerSource(chunks,table,originalMaximum) {
  const needsLookup=chunks.some((chunk,index)=>
    !chunk.ipa&&khmerSourceLetters.test(chunk.original) ||
    index>0&&khmerSourceRun.test(chunk.original)&&khmerSourceRun.test(chunks[index-1].original)
  );
  if(!needsLookup)return chunks;
  const supplement=await loadKhmerSourceSupplement().catch(()=>null);
  if(!supplement)return chunks;
  const maximum=Math.max(originalMaximum,supplement.maximum);
  const pieces=chunks.flatMap(chunk=>chunk.ipa || !khmerSourceLetters.test(chunk.original) ? [chunk] :
    chunk.original.split(khmerSourceParts).filter(Boolean).map(original=>({...chunk,original})));
  const output=[];
  for(let index=0;index<pieces.length;){
    if(!khmerSourceRun.test(pieces[index].original)){
      output.push(pieces[index++]);
      continue;
    }
    let end=index+1;
    while(end<pieces.length&&khmerSourceRun.test(pieces[end].original))end++;
    const run=pieces.slice(index,end);
    const covered=values=>values.reduce((size,chunk)=>size+(chunk.ipa?chunk.original.length:0),0);
    const text=run.map(piece=>piece.original).join('');
    const entire=run.length>1?supplement.table[text.replace(/[\u200c\u200d]/gu,'')]:undefined;
    if(entire) {
      const reading=chooseDictionaryReading(entire,'khmer');
      output.push({original:text,...reading,phraseBreak:true,khmerSupplement:true});
    } else if(covered(run)<text.length) {
      const repaired=planKhmerSourceRun(text,table,supplement,maximum);
      const attested=covered(repaired)>covered(run)?repaired:run;
      const inferred=covered(attested)<text.length?planKhmerSourceRun(text,table,supplement,maximum,true):attested;
      output.push(...(covered(inferred)>covered(attested)?inferred:attested));
    } else output.push(...run);
    index=end;
  }
  return output;
}
