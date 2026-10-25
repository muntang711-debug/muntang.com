import fs from 'node:fs/promises';
import { collectDemonlist } from '../lib/demonlist.js';

const demons = await collectDemonlist();
const checkedAt = new Date().toISOString();
await fs.writeFile(new URL('../data/demonlist.json', import.meta.url), JSON.stringify({ demons, checkedAt, updatedAt: checkedAt }, null, 2) + '\n');
console.log('Saved Pointercrate ranks 1–150.');
