import fallback from '../data/demonlist.json' with { type: 'json' };
import { readUpstream } from './youtube.js';

export const DEMONLIST_KEY = 'pointercrate:top150:v1';
export const SYNC_INTERVAL = 5 * 60 * 1000;
export const DEMONLIST_CRON = '*/5 * * * *';

function videoUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && ['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) return url.href;
  } catch { /* Optional video. */ }
  return null;
}

export function normalizeDemons(input) {
  if (!Array.isArray(input) || input.length !== 150) throw new Error('IncompleteDemonlist');
  const demons = input.map(demon => {
    if (!Number.isInteger(demon.id) || demon.id <= 0 || !Number.isInteger(demon.position) ||
      typeof demon.name !== 'string' || !demon.name.trim() || typeof demon.publisher?.name !== 'string' ||
      typeof demon.verifier?.name !== 'string' || !Number.isInteger(demon.requirement) || demon.requirement < 0 || demon.requirement > 100) throw new Error('InvalidDemon');
    return {
      id: demon.id, position: demon.position, name: demon.name,
      publisher: { name: demon.publisher.name }, verifier: { name: demon.verifier.name },
      level_id: Number.isInteger(demon.level_id) && demon.level_id > 0 ? demon.level_id : null,
      requirement: demon.requirement, video: videoUrl(demon.video),
      thumbnail: typeof demon.thumbnail === 'string' && /^https:\/\/i\.ytimg\.com\/vi\/[\w-]+\/[\w.-]+\.jpg$/.test(demon.thumbnail) ? demon.thumbnail : null,
    };
  }).sort((a, b) => a.position - b.position);
  if (demons.some((demon, index) => demon.position !== index + 1) || new Set(demons.map(demon => demon.id)).size !== 150) throw new Error('InvalidDemonlistRanks');
  return demons;
}

export async function collectDemonlist(read = readUpstream) {
  // Bound both pages on the server: never fetch, follow links to, or inspect rank 151+.
  const pages = [];
  for (const [after, before, limit] of [[0, 101, 100], [100, 151, 50]]) {
    const url = new URL('https://pointercrate.com/api/v2/demons/listed/');
    url.search = new URLSearchParams({ after, before, limit }).toString();
    const page = JSON.parse(await read(url.href, { headers: { Accept: 'application/json' } }, 10000, 500_000));
    if (!Array.isArray(page) || page.length !== limit || page.some(demon => demon.position <= after || demon.position >= before)) throw new Error('InvalidDemonlistPage');
    pages.push(...page);
  }
  return normalizeDemons(pages);
}

export async function syncDemonlist(env, { collect = collectDemonlist, now = Date.now() } = {}) {
  if (!env?.MLL_DATA) throw new Error('MissingMLLStorage');
  const previous = await env.MLL_DATA.get(DEMONLIST_KEY, 'json');
  // Fetch and validate the complete bounded list before replacing any stored data.
  const demons = await collect();
  const changed = !previous || JSON.stringify(previous.demons) !== JSON.stringify(demons);
  const checkedAt = new Date(now).toISOString();
  const snapshot = { demons, checkedAt, updatedAt: changed ? checkedAt : previous.updatedAt };
  await env.MLL_DATA.put(DEMONLIST_KEY, JSON.stringify(snapshot));
  console.log(JSON.stringify({ event: 'demonlist_synced', changed, count: demons.length, checkedAt }));
  return { changed, ...snapshot };
}

export async function getDemonlist(env, now = Date.now()) {
  let snapshot = fallback, stored = false;
  try {
    const saved = await env?.MLL_DATA?.get(DEMONLIST_KEY, 'json');
    if (saved) { snapshot = { ...saved, demons: normalizeDemons(saved.demons) }; stored = true; }
  } catch (error) {
    console.warn(JSON.stringify({ event: 'demonlist_storage_unavailable', error: error?.name || 'Error' }));
  }
  return {
    ok: true, source: 'Pointercrate', limit: 150, syncIntervalSeconds: 300,
    status: stored && now - Date.parse(snapshot.checkedAt) <= SYNC_INTERVAL + 90_000 ? 'fresh' : 'stale',
    ...snapshot,
  };
}
