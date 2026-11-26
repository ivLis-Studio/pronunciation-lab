const maxCardinal=999999999;
const digitBases=[0x30,0x660,0x6f0,0xb66,0x17e0,0xff10];
const numberDigits=/[0-9٠-٩۰-۹୦-୯០-៩０-９]/u;
const wholeCardinal=/^\s*[-−]?[0-9٠-٩۰-۹୦-୯០-៩０-９]+\s*$/u;
const cardinalSpans=/[-−]?[0-9٠-٩۰-۹୦-୯០-៩０-９]+/gu;
const attachedNumber=/[\p{L}\p{N}\p{M}\p{Sc}_+#@%٪×÷=]/u;

function parseCardinal(spelling) {
  const unsigned=spelling.replace(/^[-−]/u,'');
  if(unsigned.length>9)return null;
  const base=digitBases.find(first=>unsigned.codePointAt(0)>=first&&unsigned.codePointAt(0)<first+10);
  if(base===undefined)return null;
  const digits=[...unsigned].map(digit=>digit.codePointAt(0)-base);
  if(digits.some(digit=>digit<0||digit>9)||digits.length>1&&digits[0]===0)return null;
  const value=Number(digits.join(''));
  return spelling===unsigned?value:-value;
}

function spellCLDRCardinal(value,{locale,sets}) {
  function format(number,name='%spellout-numbering',depth=0,forceIndex) {
    if(depth>24)throw Error('Numeric rule recursion');
    const rules=sets[name];
    const at=forceIndex??(number<0?rules.findIndex(([base])=>base===-1):rules.findLastIndex(([base])=>base>=0&&base<=number));
    if(number<0&&at<0) {
      const alias=rules.flatMap(([base,_,rule])=>base>=0?[rule.match(/^=(%%?[\w-]+)=$/u)]:[]).find(Boolean);
      if(alias)return format(number,alias[1],depth+1);
    }
    if(at<0)throw Error('Missing cardinal rule');
    const [base,divisor,pattern]=rules[at];
    const rest=number<0?-number:number%divisor;
    if(number>=0&&at>0&&base%divisor!==0&&rest===0&&pattern.includes('→'))return format(number,name,depth+1,at-1);
    const quotient=Math.floor(number/divisor);
    return pattern.replace(/\[([^\]]*)\]/gu,(_,inside)=>rest?inside:'')
      .replace(/\$\((cardinal|ordinal),([^)]*)\)\$/gu,(_,type,choices)=>{
        const forms=Object.fromEntries([...choices.matchAll(/(\w+)\{([^}]*)\}/gu)].map(([,key,text])=>[key,text]));
        return forms[new Intl.PluralRules(locale,{type}).select(quotient)]??forms.other??'';
      })
      .replace(/→→→|([←→=])([^←→=]*?)\1/gu,(token,operator,rule)=>{
        if(token==='→→→')return format(rest,name,depth+1,at-1);
        if(rule&&!rule.startsWith('%'))throw Error('Non-spellout cardinal rule');
        return format(operator==='←'?quotient:operator==='→'?rest:number,rule||name,depth+1);
      });
  }
  return format(value);
}

function spellLocalCardinal(value,source) {
  const odia=source==='odia';
  if(value<0)return (odia?'ବିଯୁକ୍ତ':'mainas')+' '+spellLocalCardinal(-value,source);
  if(odia&&value<100)return odiaCardinals[value];
  if(!odia&&value<20)return jamaicanCardinals[0][value];
  if(!odia&&value<100) {
    const tens=jamaicanCardinals[1][Math.floor(value/10)-2],rest=value%10;
    return rest?tens+'-'+jamaicanCardinals[0][rest]:tens;
  }
  const groups=odia?[[10000000,'କୋଟି'],[100000,'ଲକ୍ଷ'],[1000,'ହଜାର'],[100,'ଶହ']]:
    [[1000000,'miliyan'],[1000,'touzn'],[100,'onjrid']];
  const [base,word]=groups.find(([n])=>value>=n);
  const prefix=spellLocalCardinal(Math.floor(value/base),source)+' '+word;
  return value%base?prefix+' '+spellLocalCardinal(value%base,source):prefix;
}

function cardinalWords(value,source) {
  if(!Number.isInteger(value)||Math.abs(value)>maxCardinal)return '';
  let words;
  try {
    words=cardinalData[source]?spellCLDRCardinal(value,cardinalData[source]):spellLocalCardinal(value,source);
  } catch {
    return '';
  }
  return /[\d←→$=%[\]{}]/u.test(words)?'':words.replaceAll('\u00ad','').trim();
}

const arabicCardinalMarks=map('صفر=صِفْر واحد=وَاحِد أحد=أَحَد إثنا=إِثْنَا إثنان=إِثْنَان ثلاثة=ثَلَاثَة أربعة=أَرْبَعَة خمسة=خَمْسَة ستة=سِتَّة سبعة=سَبْعَة ثمانية=ثَمَانِيَة تسعة=تِسْعَة عشر=عَشَر عشرة=عَشَرَة عشرون=عِشْرُون ثلاثون=ثَلَاثُون أربعون=أَرْبَعُون خمسون=خَمْسُون ستون=سِتُّون سبعون=سَبْعُون ثمانون=ثَمَانُون تسعون=تِسْعُون مائة=مِئَة مائتان=مِئَتَان ألف=أَلْف ألفين=أَلْفَيْن آلاف=آلَاف مليون=مِلْيُون ناقص=نَاقِص');

function arabicCardinalReading(words) {
  const parts=words.split(/\s+/u).map(word=>{
    const full=arabicCardinalMarks[word];
    if(full)return arabicPhonemes(full);
    const suffix=word.startsWith('و')&&arabicCardinalMarks[word.slice(1)];
    return suffix?'wa'+arabicPhonemes(suffix):'';
  });
  return parts.every(Boolean)?parts.join(' '):'';
}

function canReadEmbeddedCardinal(input,start,end) {
  const before=input.slice(0,start),after=input.slice(end);
  const prior=before.at(-1)??'',following=after[0]??'';
  if(attachedNumber.test(prior)||attachedNumber.test(following))return false;
  const compound=/[.:\/\-−–—]/u, alphanumeric=/[\p{L}\p{N}]/u;
  if(compound.test(prior)&&alphanumeric.test(before.at(-2)??''))return false;
  if(compound.test(following)&&alphanumeric.test(after[1]??''))return false;
  const connector=/[.,:\/\-−–—٪٫٬]/u;
  if(connector.test(prior)&&numberDigits.test(before.at(-2)??''))return false;
  if(connector.test(following)&&numberDigits.test(after[1]??''))return false;
  return !/(?<=\p{Nd})[ \u00a0\u202f]+$/u.test(before)&&!/^[ \u00a0\u202f]+\p{Nd}/u.test(after);
}

async function cardinalInputChunks(input,source,variant,embedded) {
  if(!embedded&&!wholeCardinal.test(input))return null;
  const spans=[...input.matchAll(cardinalSpans)].flatMap(({0:spelling,index})=>{
    const end=index+spelling.length;
    if(!canReadEmbeddedCardinal(input,index,end))return [];
    const value=parseCardinal(spelling);
    let words=cardinalWords(value,source);
    if(source==='japanese'&&value===0)words='ゼロ';
    if(source==='mandarin')words=words.replaceAll('〇','零');
    if(source==='arabic')words=words.replaceAll('إحدى عشر','أحد عشر');
    if(source==='romanian')words=words.replaceAll('una sută','o sută').replaceAll('una mie','o mie');
    if(source==='icelandic')words=words.replaceAll('milliónur','milljónir').replaceAll('millión','milljón');
    return words?[{index,end,spelling,words}]:[];
  });
  if(!spans.length)return null;
  const pending=[];
  let offset=0;
  for(const {index,end,spelling,words} of spans){
    if(index>offset)pending.push(readMixedText(input.slice(offset,index),source,variant));
    const tagged=source==='arabic'?arabicCardinalReading(words):'';
    pending.push(tagged?Promise.resolve([{original:spelling,ipa:tagged,numberWords:words}]):readSourceText(words,source,variant).then(pieces=>{
      if(pieces.some(piece=>piece.unknown||!piece.ipa&&/[\p{L}\p{Nl}]/u.test(piece.original)))return [{original:spelling}];
      let ipa='',gap=false;
      for(const piece of pieces) {
        if(!piece.ipa) {
          gap||=/\s/u.test(piece.original)||piece.wordBoundary;
          continue;
        }
        if(tokenizeIPA(piece.ipa,source).unknownPhones.size)return [{original:spelling}];
        if(ipa&&(gap||piece.phraseBreak||piece.spaceBefore))ipa+=' ';
        ipa+=piece.ipa;
        gap=false;
      }
      return ipa?[{original:spelling,ipa,numberWords:words}]:[{original:spelling}];
    }).catch(()=>[{original:spelling}]));
    offset=end;
  }
  if(offset<input.length)pending.push(readMixedText(input.slice(offset),source,variant));
  return (await Promise.all(pending)).flat();
}
