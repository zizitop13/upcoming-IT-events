import { dedupeEvents, parseEventTable } from './lib/events.js';

const markdownModules = import.meta.glob('/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

export function loadContent() {
  const events = [];
  const details = new Map();

  for (const [path, markdown] of Object.entries(markdownModules)) {
    const tableMatch = path.match(/\/content\/(conferences|hackathons)\/(\d{4})\.md$/);
    if (tableMatch) {
      events.push(...parseEventTable(markdown, tableMatch[1], path));
      continue;
    }

    const detailMatch = path.match(/\/content\/details\/(conferences|hackathons)\/(\d{4})\/([^/]+)\.md$/);
    if (detailMatch) {
      details.set(`/event/${detailMatch[1]}/${detailMatch[2]}/${detailMatch[3]}`, markdown);
    }
  }

  const { unique, duplicates } = dedupeEvents(events);
  if (duplicates.length) {
    console.warn('Duplicate event keys found:', duplicates.map((item) => item.key));
  }

  return { events: unique, duplicates, details };
}
