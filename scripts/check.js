import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
function visit(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) visit(file);
    else if (/\.(?:js|mjs)$/.test(file)) {
      const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
      if (result.status !== 0) process.exit(result.status || 1);
    }
  }
}
for (const dir of ['lib', 'public', 'scripts', 'tests']) visit(dir);
const result = spawnSync(process.execPath, ['--check', 'worker.js'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
console.log('JavaScript syntax checks passed.');
