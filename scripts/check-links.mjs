import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { parseEventTable, dedupeEvents, normalizeEventName } from '../src/lib/events.js';

export function urls(text) { return [...new Set(text.match(/https?:\/\/[^\s<>"')|]+/g) || [])].map(url => url.replace(/[.,;]+$/, '')); }
export function matchesEvent(html, name) {
  const plain = normalizeEventName(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' '));
  const words = normalizeEventName(name).split(' ').filter(w => w.length > 2 && !/^\d+$/.test(w) && !['the','conference','hackathon','online','europe'].includes(w));
  return words.length > 0 && words.every(word => plain.includes(word));
}
async function files(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.cache', 'link-check-report.json'].includes(entry.name) || /\.test\.[cm]?jsx?$/.test(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await files(file));
    else if (/\.(md|html|jsx?|mjs|json|ya?ml|css|svg)$/.test(file) && !file.endsWith('package-lock.json')) found.push(file);
  }
  return found;
}
export async function check() {
  const all = await files('.'); const events = []; const links = new Map(); const failures = [];
  for (const file of all) {
    const text = await readFile(file, 'utf8');
    for (const url of urls(text)) { if (!links.has(url)) links.set(url, new Set()); links.get(url).add(file); }
    const category = file.match(/^content\/(conferences|hackathons)\/\d{4}\.md$/);
    if (category) events.push(...parseEventTable(text, category[1], file));
    if (file.endsWith('.md')) for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      try { await access(path.resolve(path.dirname(file), decodeURIComponent(target.split('#')[0]))); }
      catch { failures.push(`${file}: missing local link ${target}`); }
    }
  }
  for (const duplicate of dedupeEvents(events).duplicates) failures.push(`Duplicate ${duplicate.key}: ${duplicate.first.sourcePath}, ${duplicate.duplicate.sourcePath}`);
  let cache = {};
  try { cache = JSON.parse(await readFile('.cache/checked-links.json', 'utf8')); } catch {}
  const report = []; let skipped = 0;
  for (const [url, sources] of links) {
    // Template/example URLs cannot be fetched; report them explicitly.
    if (/[{}$]/.test(url) || url.includes('example.') || url.includes('localhost')) { report.push({url, status:'template skipped'}); continue; }
    const names = events.filter(e => e.website === url).map(e => e.name).sort();
    const key = createHash('sha256').update(JSON.stringify([2, url, names])).digest('hex');
    if (cache[key] && process.env.RECHECK !== 'true') { skipped++; continue; }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'UpcomingITEvents-LinkChecker/1.0' } });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      if (names.length) {
        const html = await response.text();
        for (const name of names) if (!matchesEvent(html, name)) throw Error(`Event identity not confirmed: ${name} (manual review needed)`);
      } else await response.body?.cancel();
      cache[key] = { url, finalUrl: response.url, names, checkedAt: new Date().toISOString() };
      report.push({url, status:'passed', finalUrl:response.url});
    } catch (error) { failures.push(`${url} (${[...sources].join(', ')}): ${error.message}`); report.push({url,status:'failed',reason:error.message}); }
  }
  await mkdir('.cache', {recursive:true});
  await writeFile('.cache/checked-links.json', JSON.stringify(cache, null, 2));
  await writeFile('link-check-report.json', JSON.stringify({skipped, failures, report}, null, 2));
  console.log(`${links.size} URLs; ${skipped} cached; ${failures.length} failures`);
  for (const failure of failures) console.error(failure);
  if (failures.length) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await check();
