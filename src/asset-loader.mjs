const asset = filename => new URL('../assets/' + filename, import.meta.url);

function decodeBase64(payload) {
  return Uint8Array.fromBase64 ? Uint8Array.fromBase64(payload) :
    Uint8Array.from(atob(payload), character => character.charCodeAt(0));
}

async function readAsset(url) {
  if (url.protocol === 'file:' && globalThis.process?.versions?.node) {
    const { readFile } = await import('node:fs/promises');
    return readFile(url);
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('Pronunciation asset request failed (' + response.status + '): ' + url.pathname);
  return new Uint8Array(await response.arrayBuffer());
}
