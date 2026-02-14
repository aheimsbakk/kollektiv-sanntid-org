import demo from './demo.json' assert { type: 'json' };
import { parseEnturResponse } from './entur.js';

export function getDemoData(){
  return parseEnturResponse(demo);
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
