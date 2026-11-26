// Browser inference for Kakao Brain g2pM (Park and Lee, Interspeech 2020).
// Architecture and weights from revision 170526efad0a3ef9b55a9ad4579f73218f9be06c, Apache-2.0.
const mandarinModelWidth=32, mandarinEmbeddingWidth=64;
let mandarinModelRequest;

function decodeMandarinModel(data) {
  const weights=Object.fromEntries(Object.entries(data.weights).map(([name,value])=>
    [name,new Float32Array(Uint8Array.from(atob(value),letter=>letter.charCodeAt(0)).buffer)]));
  const direction=suffix=>({
    input:weights['lstm.weight_ih_l0'+suffix],
    recurrent:weights['lstm.weight_hh_l0'+suffix],
    bias:Float32Array.from(weights['lstm.bias_ih_l0'+suffix],(value,index)=>value+weights['lstm.bias_hh_l0'+suffix][index]),
    embeddings:new Map(),
  });
  return {vocab:data.vocab,labels:data.labels,lexicon:data.lexicon,traditional:data.traditional,embedding:weights['embedding.weight'],
    forward:direction(''), backward:direction('_reverse'),
    hidden:weights['logit_layer.0.weight'],hiddenBias:weights['logit_layer.0.bias'],
    output:weights['logit_layer.2.weight'],outputBias:weights['logit_layer.2.bias']};
}

function loadMandarinContextModel() {
  return mandarinModelRequest??=decompressTextData(mandarinContextPayload).then(JSON.parse).then(decodeMandarinModel)
    .catch(error=>{mandarinModelRequest=undefined;throw error;});
}

function mandarinLstm(ids,model,layer,reverse) {
  const width=mandarinModelWidth, gates=width*4;
  const cell=new Float64Array(width), hidden=new Float64Array(width), activation=new Float64Array(gates);
  const all=new Float32Array(ids.length*width);
  const sigmoid=value=>1/(1+Math.exp(-value));
  for(let step=0;step<ids.length;step++) {
    const position=reverse?ids.length-step-1:step;
    const id=ids[position], embeddingOffset=id*mandarinEmbeddingWidth;
    let affine=layer.embeddings.get(id);
    if(!affine){
      affine=new Float64Array(gates);
      for(let row=0;row<gates;row++){
        let sum=layer.bias[row];
        const offset=row*mandarinEmbeddingWidth;
        for(let column=0;column<mandarinEmbeddingWidth;column++)sum+=layer.input[offset+column]*model.embedding[embeddingOffset+column];
        affine[row]=sum;
      }
      if(layer.embeddings.size<2048)layer.embeddings.set(id,affine);
    }
    for(let row=0;row<gates;row++){
      let sum=affine[row];
      const offset=row*width;
      for(let column=0;column<width;column++)sum+=layer.recurrent[offset+column]*hidden[column];
      activation[row]=sum;
    }
    for(let column=0;column<width;column++){
      cell[column]=sigmoid(activation[column+width])*cell[column]+sigmoid(activation[column])*Math.tanh(activation[column+2*width]);
      hidden[column]=sigmoid(activation[column+3*width])*Math.tanh(cell[column]);
    }
    all.set(hidden,position*width);
  }
  return all;
}

function predictMandarinContext(text,model,selected) {
  const letters=Array.from(text,letter=>model.traditional[letter]??letter);
  const readings=letters.map(letter=>model.lexicon[letter]?.[0]??null);
  const targets=[...letters.keys()].filter(index=>selected?selected.has(index):model.lexicon[letters[index]]?.length>1);
  if(!targets.length)return readings;
  const ids=[model.vocab['시'],...letters.map(letter=>model.vocab[letter]??model.vocab['<UNK>']),model.vocab['끝']];
  const forward=mandarinLstm(ids,model,model.forward,false);
  const backward=mandarinLstm(ids,model,model.backward,true);
  const width=mandarinModelWidth;
  const state=new Float64Array(width);
  for(const index of targets){
    const position=(index+1)*width;
    for(let row=0;row<width;row++){
      let sum=model.hiddenBias[row];
      const offset=row*width*2;
      for(let column=0;column<width;column++)sum+=model.hidden[offset+column]*forward[position+column]+model.hidden[offset+width+column]*backward[position+column];
      state[row]=Math.max(0,sum);
    }
    let score=-Infinity,chosen=0;
    for(let row=0;row<model.labels.length;row++){
      let sum=model.outputBias[row];
      const offset=row*width;
      for(let column=0;column<width;column++)sum+=model.output[offset+column]*state[column];
      if(sum>score){score=sum;chosen=row;}
    }
    readings[index]=model.labels[chosen];
  }
  return readings;
}

const mandarinPinyinIPA=new Map(chineseSyllables.mandarin);
const mandarinSourceTone=['','˥','˧˥','˨˩˦','˥˩','˧'];

function normalizeMandarinPinyin(reading) {
  return reading?.toLowerCase().replace(/u:|v/gu,'ü').replace(/^(?:([jqxy])ü)/u,'$1u').replace(/([a-zü])0$/u,'$15');
}

function numberedMandarinPinyin(spelling) {
  return spelling.trim().split(/\s+/u).map(word=>{
    const marks={'̄':'1','́':'2','̌':'3','̀':'4'};
    const tone=[...word.normalize('NFD')].map(mark=>marks[mark]).find(Boolean)??'5';
    return bareToneSpelling(word,'mandarin')+tone;
  });
}

function readingFromMandarinPinyin(reading) {
  const match=normalizeMandarinPinyin(reading)?.match(/^([a-zü]+)([1-5])$/u);
  if(!match)return '';
  const ipa=mandarinPinyinIPA.get(match[1]);
  return ipa?ipa+mandarinSourceTone[Number(match[2])]:'';
}

async function applyMandarinContext(chunks) {
  const text=chunks.map(chunk=>chunk.original).join('');
  if(!/\p{Script=Han}/u.test(text))return chunks;
  let model;
  try {model=await loadMandarinContextModel();}
  catch {return chunks;}
  const hasContext=[...text.matchAll(/\p{Script=Han}/gu)].length>1;
  const predictions=predictMandarinContext(text,model);
  const optionsFor=letter=>model.lexicon[model.traditional[letter]??letter];
  const permitted=(letter,value)=>optionsFor(letter)?.some(pron=>normalizeMandarinPinyin(pron)===value);
  const pronounce=ipa=>numberedMandarinPinyin(renderTarget(ipa,'mandarin','mandarin')).map(normalizeMandarinPinyin);
  let offset=0;
  return chunks.flatMap(chunk=>{
    const letters=Array.from(chunk.original);
    const readings=predictions.slice(offset,offset+letters.length);
    offset+=letters.length;
    if(chunk.unknown&&/^\p{Script=Han}+$/u.test(chunk.original)) return letters.map((character,index)=>{
      const pinyin=normalizeMandarinPinyin(readings[index]);
      const ipa=permitted(character,pinyin)?
        readingFromMandarinPinyin(pinyin):'';
      return ipa?{original:character,ipa,mandarinContext:true}:{original:character,unknown:true};
    });
    const single=letters.length===1&&optionsFor(letters[0])?.length>1;
    if(!hasContext||!chunk.ipa||!/^\p{Script=Han}+$/u.test(chunk.original)||!single&&!chunk.alternatives?.length)return [chunk];
    const pinyin=readings.map(normalizeMandarinPinyin);
    let selected='';
    if(chunk.alternatives&&pinyin.every((value,index)=>permitted(letters[index],value))) {
      const expected=pinyin.join(' ');
      selected=chunk.alternatives.find(ipa=>pronounce(ipa).join(' ')===expected)??'';
    }
    if(!selected&&single&&!model.traditional[letters[0]]&&permitted(letters[0],pinyin[0])) {
      const prior=pronounce(chunk.ipa);
      if(prior.length===1&&prior[0]!==pinyin[0])selected=readingFromMandarinPinyin(pinyin[0]);
    }
    return selected&&selected!==chunk.ipa?[{...chunk,ipa:selected,contextual:true,mandarinContext:true}]:[chunk];
  });
}
