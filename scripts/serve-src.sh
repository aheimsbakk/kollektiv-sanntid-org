#!/usr/bin/env bash
# Serve the src/ directory over HTTP for manual browser testing.
# Tries Python3, then Python2, then Node. Usage: ./scripts/serve-src.sh [port]

set -euo pipefail
PORT=${1:-8000}
ROOT_DIR="src"

if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: $ROOT_DIR not found" >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "Serving $PWD on http://localhost:$PORT"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
fi

if command -v python >/dev/null 2>&1; then
  exec python -m SimpleHTTPServer "$PORT"
fi

# Try Node wrapper first
if [ -x "../node/node" ]; then
  exec ../node/node -e "require('http').createServer((req,res)=>{const fs=require('fs');const path=require('path');let file=path.join(process.cwd(),req.url==='/'?'/index.html':req.url);fs.readFile(file,(err,data)=>{if(err){res.statusCode=404;res.end('Not found')}else{res.end(data)}})}).listen($PORT,()=>console.log('listening'))"
fi

if command -v node >/dev/null 2>&1; then
  exec node -e "require('http').createServer((req,res)=>{const fs=require('fs');const path=require('path');let file=path.join(process.cwd(),req.url==='/'?'/index.html':req.url);fs.readFile(file,(err,data)=>{if(err){res.statusCode=404;res.end('Not found')}else{res.end(data)}})}).listen($PORT,()=>console.log('listening'))"
fi

echo "No suitable server found (install python3 or node)" >&2
exit 1
