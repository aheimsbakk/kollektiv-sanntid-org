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
      // Normalize demo times: if a demo time is in the past shift it into the future for demo UX
      const now = Date.now();
      _demoCache = _demoCache.map((d, i) => {
        if (!d.expectedDepartureISO) return d;
        const epoch = Date.parse(d.expectedDepartureISO);
        if (epoch <= now) {
          // schedule them offset by 5*(i+1) minutes into the future
          const offset = (5 * (i+1)) * 60 * 1000;
          return { ...d, expectedDepartureISO: new Date(now + offset).toISOString() };
        }
        return d;
      });
      return _demoCache;
    }
    // Browser: fetch relative URL
    const res = await fetch(new URL('./demo.json', import.meta.url).href);
    const j = await res.json();
    _demoCache = parseEnturResponse(j);
    const now = Date.now();
    _demoCache = _demoCache.map((d, i) => {
      if (!d.expectedDepartureISO) return d;
      const epoch = Date.parse(d.expectedDepartureISO);
      if (epoch <= now) {
        const offset = (5 * (i+1)) * 60 * 1000;
        return { ...d, expectedDepartureISO: new Date(now + offset).toISOString() };
      }
      return d;
    });
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
