import { parseEnturResponse } from './entur.js';

let _demoCache = null;
export async function getDemoData(){
  if(_demoCache) return _demoCache;
  // Prefer fetch in browsers to avoid MIME/import assertion issues when serving demo.json
  try{
    if(typeof process !== 'undefined' && process.versions && process.versions.node){
      // Node: read file via fs
      const fs = await import('fs/promises');
      const raw = await fs.readFile(new URL('./demo.json', import.meta.url));
      const j = JSON.parse(raw.toString());
      _demoCache = parseEnturResponse(j);
      return _demoCache;
    }
    // Browser: fetch relative URL
    const res = await fetch(new URL('./demo.json', import.meta.url).href);
    const j = await res.json();
    _demoCache = parseEnturResponse(j);
    return _demoCache;
  }catch(err){
    console.warn('Failed to load demo.json', err);
    _demoCache = [];
    return _demoCache;
  }
}

export async function parseUploadedJson(file){
  // file is a File object when used in browser; in tests we'll accept raw JSON
  if (typeof file === 'string'){
    try{ return parseEnturResponse(JSON.parse(file)); }catch(e){throw e}
  }
  if (file instanceof File){
    const text = await file.text();
    return parseEnturResponse(JSON.parse(text));
  }
  // if already an object
  return parseEnturResponse(file);
}
