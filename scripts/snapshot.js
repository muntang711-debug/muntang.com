import fs from 'node:fs/promises';
import { collectCatalog } from '../lib/youtube.js';
for (const language of ['ko', 'en']) {
  const file = new URL(`../data/youtube-${language}.json`, import.meta.url);
  const previous = JSON.parse(await fs.readFile(file, 'utf8'));
  const data = await collectCatalog(language, previous);
  if (!data.videos?.length || !data.sources.videos || !data.sources.shorts) throw new Error('Both video tabs must be available before updating the saved snapshot');
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log(language, data.videos.length, 'videos saved, sources:', data.sources);
}
