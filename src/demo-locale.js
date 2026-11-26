const uiLocaleList=Object.values(uiCatalogs);
const uiModeButtons=[...document.querySelectorAll('[data-mode]')];
const rtlLocales=new Set(['ar','fa']);
const tonalOutputs=new Set(['mandarin','cantonese','vietnamese']);

function matchUILocale(value='') {
  const code=value.toLowerCase().replaceAll('_','-');
  const exact=uiLocaleList.find(({id,locale})=>code===id || code===locale.toLowerCase());
  if(exact) return exact;
  const base=code.split('-')[0];
  if (base==='zh' && /(?:^|-)(?:hk|mo)(?:-|$)/u.test(code)) return uiCatalogs.cantonese;
  if (base==='no' || base==='nn') return uiCatalogs.norwegian;
  return uiLocaleList.find(({locale})=>locale.toLowerCase().split('-')[0]===base);
}

function preferredUILocale() {
  const fromUrl=matchUILocale(new URL(location.href).searchParams.get('lang') ?? '');
  if(fromUrl) return fromUrl;
  try {
    const saved=matchUILocale(localStorage.getItem('pronunciation-lab:language') ?? '');
    if(saved) return saved;
  } catch {}
  return navigator.languages.map(matchUILocale).find(Boolean) ?? uiCatalogs.english;
}

let ui, uiNumbers, uiList;

function message(key,values={}) {
  const text=ui.ui[key].replace(/\{(\w+)\}/gu,(_,name)=>values[name] ?? '');
  return rtlLocales.has(ui.locale)?text.replaceAll('/…/','\u2066/…/\u2069').replaceAll('[…]','\u2066[…]\u2069'):text;
}
function uiLanguageName(id) {
  return ui.names[id];
}
function uiScriptName(profile) {
  const script=ui.scripts[profile.id] ?? ui.scripts.latin;
  return tonalOutputs.has(profile.id)?script+' · '+message('tone'):script;
}
function uiVariantName(key) {
  if(controls.source.value==='mandarin') return ui.scripts[key==='hant'?'traditional':'simplified'];
  return ui.variants[key]?ui.variants[key]+' ('+key+')':key;
}

function updateModeLabels() {
  controls.input.setAttribute('aria-label',inputMode==='ipa'?'IPA':message('textInput'));
  controls['input-hint'].textContent=message(inputMode==='ipa'?'ipaHint':'textHint');
}

function selectUILocale(catalog) {
  ui=catalog;
  uiNumbers=new Intl.NumberFormat([ui.locale,'en']);
  uiList=new Intl.ListFormat([ui.locale,'en']);
  document.documentElement.lang=ui.locale;
  document.documentElement.dir=rtlLocales.has(ui.locale)?'rtl':'ltr';
  document.title=message('title');
  controls['ui-language'].value=ui.locale;
  for(const element of document.querySelectorAll('[data-i18n]')) element.textContent=message(element.dataset.i18n);
  for(const element of document.querySelectorAll('[data-i18n-label]')) element.setAttribute('aria-label',message(element.dataset.i18nLabel));
  for(const option of controls.source.options) option.text=uiLanguageName(option.value);
  for(const option of controls.variant.options) option.text=uiVariantName(option.value);
  updateModeLabels();
  renderStatus();
  for(const card of controls.cards.children) updateCardLabels(card);
}
