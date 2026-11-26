const vowelIPAFeatures=map('i=000 y=001 ɪ=100 ʏ=101 ɨ=010 ʉ=011 ɯ=020 u=021 ʊ=121 e=200 ø=201 ɘ=210 ɵ=211 ɤ=220 o=221 ə=310 ɛ=400 œ=401 ɜ=410 ɞ=411 ʌ=420 ɔ=421 æ=500 ɐ=510 a=600 ɶ=601 ɑ=620 ɒ=621 ɚ=310 ɝ=410 ɿ=010 ʅ=010');
const consonantPlaces=[
  ['p','b','m','f','v','pf'], ['t','d','s','z','ts','dz','n','l','r','θ','ð','ɬ'],
  ['ʃ','ʒ','tʃ','dʒ','ɲ','ʎ','j','ç'], ['k','g','ŋ','x','ɣ','ɰ','ʁ','w','ɥ'], ['h','ħ','ʕ','ʔ'],
];
const consonantManners=[
  ['b','p','t','d','k','g','ʔ'], ['m','n','ŋ','ɲ'], ['f','v','s','z','ʃ','ʒ','x','h','θ','ð','ʁ','ɣ','ɬ','ç','ħ','ʕ'],
  ['ts','dz','tʃ','dʒ','pf'], ['l','r','ʎ','w','j','ɥ','ɰ'],
];
const classLookup=sets=>new Map(sets.flatMap((set,index)=>set.map(sound=>[sound,index])));
const places=classLookup(consonantPlaces), manners=classLookup(consonantManners);
const diphthongs=new Set(['ai','au','aɪ','aʊ','ɑʊ','ɑɪ','ei','eɪ','ou','oʊ','oi','ɔi','ɔɪ','əʊ','əɪ','ui','ɐu','ɐi','iu','yə','yœ']);
const oralGlides=new Set(['j','w','ɰ','ɥ']);
const rhotics=new Set(['r','ɹ','ɻ','ɾ','ɽ','ʀ','ʁ','ɼ']);

function inventoryBoundaries(word,previous,following) {
  const cluster=word.slice(previous.end,following.start);
  const edge=sourceSyllableEdge(cluster,word[following.start]);
  let preferred=edge?previous.end+edge.offset:Math.max(previous.end,following.start-1);
  if(!edge&&preferred>previous.end&&oralGlides.has(phoneticBase[word[preferred]?.sound]))preferred--;
  const weight=edge?edge.weight*0.37:0.065;
  const first=Math.max(previous.end,preferred-3), last=Math.min(following.start,preferred+3);
  return Array.from({length:last-first+1},(_,index)=>{
    const cut=first+index;
    return {cut,penalty:Math.abs(cut-preferred)*weight};
  }).sort((a,b)=>a.penalty-b.penalty);
}

function phoneDistance(a,b) {
  if(a.vowel!==b.vowel) return 1.65;
  if(a.vowel) {
    const x=vowelIPAFeatures[a.sound] ?? '310', y=vowelIPAFeatures[b.sound] ?? '310';
    return 0.13*Math.abs(x[0]-y[0])+0.23*Math.abs(x[1]-y[1])+0.21*Math.abs(x[2]-y[2])+
      (a.length===b.length?0:0.13)+(a.nasal===b.nasal?0:0.12);
  }
  const x=phoneticBase[a.sound], y=phoneticBase[b.sound];
  const aspiration=a.marks.includes('ʰ')===b.marks.includes('ʰ') ? 0 : 0.16;
  const duration=a.length===b.length?0:0.13;
  if(x===y) return duration+aspiration+(a.sound===b.sound?0:0.07);
  if(rhotics.has(a.sound)&&rhotics.has(b.sound))return 0.06+duration+aspiration;
  if (['h','x','ħ','ɣ'].includes(x) && ['h','x','ħ','ɣ'].includes(y)) return 0.20+duration+aspiration;
  const xPlace=['c','ɟ','tɕ','dʑ'].includes(a.sound)?2:places.get(x) ?? 2;
  const yPlace=['c','ɟ','tɕ','dʑ'].includes(b.sound)?2:places.get(y) ?? 2;
  const place=xPlace===yPlace?0:0.18+0.12*Math.abs(xPlace-yPlace);
  const manner=manners.get(x)===manners.get(y)?0.16:0.63;
  const sibilants=['s','z','ʃ','ʒ','ts','dz','tʃ','dʒ'];
  const voiced=/^[bdgmnlrzv]|^[ŋɲʎʒʁɣð]|^(dz|dʒ)$/u;
  return place+manner+duration+aspiration+(voiced.test(x)===voiced.test(y)?0:0.25)+(sibilants.includes(x)===sibilants.includes(y)?0:0.26);
}

function ipaSequenceDistance(input,candidate,previous,current,costs) {
  for(let j=0;j<=candidate.length;j++) previous[j]=j*0.82;
  for(let i=1;i<=input.length;i++) {
    current[0]=previous[0]+0.88;
    for(let j=1;j<=candidate.length;j++) {
      const cost=costs?costs[i-1][candidate[j-1].inventoryIndex]:phoneDistance(input[i-1],candidate[j-1]);
      current[j]=Math.min(previous[j]+0.88,current[j-1]+0.82,previous[j-1]+cost);
    }
    [previous,current]=[current,previous];
  }
  return previous[candidate.length];
}
