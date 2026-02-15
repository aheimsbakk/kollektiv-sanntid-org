#!/usr/bin/env node
import fs from 'fs';
import child from 'child_process';

function exec(cmd){
  try{ return child.execSync(cmd, { encoding: 'utf8' }).trim(); }catch(e){ return ''; }
}

// Get staged files from git index (Added/Modified/Copied)
const staged = exec('git diff --cached --name-only --diff-filter=ACM');
if (!staged){
  // nothing staged, nothing to validate
  process.exit(0);
}

const files = staged.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const worklogs = files.filter(p => p.startsWith('agent/worklogs/') && p.endsWith('.md') && !p.includes('/archived/'));
if (worklogs.length === 0){
  process.exit(0);
}

const REQUIRED_KEYS = ['when','why','what','model','tags'];
let ok = true;
const errors = [];

for (const p of worklogs){
  // read staged version from git index to validate what will be committed
  let content = '';
  try{
    content = exec(`git show :${p}`);
  }catch(e){
    // fallback to fs if git show fails
    try{ content = fs.readFileSync(p, 'utf8'); }catch(e2){ content = ''; }
  }
  if (!content){
    ok = false; errors.push(`${p}: empty or unreadable`); continue;
  }
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if(!m){ ok = false; errors.push(`${p}: missing required YAML front-matter (--- YAML ---)`); continue; }
  const front = m[1];
  // extract keys in order
  const lines = front.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const keys = lines.map(l => { const mm = l.match(/^([A-Za-z0-9_-]+)\s*:/); return mm ? mm[1] : null; }).filter(Boolean);
  // compare sequences
  const keySeq = keys.join(',');
  const reqSeq = REQUIRED_KEYS.join(',');
  if (keySeq !== reqSeq){
    ok = false;
    errors.push(`${p}: YAML keys must be exactly in this order: ${reqSeq} (found: ${keySeq})`);
    continue;
  }
  // basic ISO check for when
  const whenLine = lines.find(l=>l.startsWith('when:'));
  if (whenLine){
    const whenVal = whenLine.replace(/^when:\s*/,'').trim();
    const d = new Date(whenVal);
    if (isNaN(d.getTime())){ ok = false; errors.push(`${p}: 'when' value is not valid ISO timestamp: ${whenVal}`); }
  }
  // tags should look like [a,b]
  const tagsLine = lines.find(l=>l.startsWith('tags:'));
  if (tagsLine){
    const tagsVal = tagsLine.replace(/^tags:\s*/,'').trim();
    if (!tagsVal.startsWith('[') || !tagsVal.endsWith(']')){ ok = false; errors.push(`${p}: 'tags' must be a YAML list-like value, e.g. [a,b]`); }
  }
}

if (!ok){
  console.error('\nWorklog validation failed for staged worklog files:');
  for (const e of errors) console.error(' -', e);
  console.error('\nPlease fix the worklog(s) to include the required YAML front-matter with keys in order:', REQUIRED_KEYS.join(', '));
  process.exit(1);
}

process.exit(0);
