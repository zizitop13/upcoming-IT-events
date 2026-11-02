const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const TABLE_COLUMNS = [
  'Name',
  'Starts',
  'Ends',
  'Location',
  'Format',
  'Main deadline',
  'Pre-submit project',
  'Project deadline',
  'Cost',
  'Description',
  'Website'
];

export function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function parseMarkdownLink(value) {
  const match = value.trim().match(/^\[([^\]]+)]\(([^)]+)\)$/);
  return match ? { label: match[1], href: match[2] } : { label: value.trim(), href: null };
}

export function normalizeEventName(name) {
  return name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function eventKey(name, startDate) {
  const year = startDate?.slice(0, 4) || 'unknown';
  return `${normalizeEventName(name)}::${year}`;
}

export function detailRouteFromHref(href) {
  if (!href) return null;
  const match = href.match(/details\/(conferences|hackathons)\/(\d{4})\/([^/]+)\.md$/);
  return match ? `/event/${match[1]}/${match[2]}/${match[3]}` : null;
}

export function parseEventTable(markdown, type, sourcePath = '') {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    if (!line.trim().startsWith('|')) return false;
    const cells = splitMarkdownRow(line);
    return TABLE_COLUMNS.every((column, index) => cells[index] === column);
  });

  if (headerIndex === -1) return [];

  const events = [];
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith('|')) break;
    const cells = splitMarkdownRow(line);
    if (cells.length < TABLE_COLUMNS.length) continue;

    const row = Object.fromEntries(TABLE_COLUMNS.map((column, cellIndex) => [column, cells[cellIndex] ?? '-']));
    const nameLink = parseMarkdownLink(row.Name);
    const websiteLink = parseMarkdownLink(row.Website);
    const event = {
      type,
      name: nameLink.label,
      starts: row.Starts,
      ends: row.Ends === '-' ? row.Starts : row.Ends,
      location: row.Location,
      format: row.Format,
      mainDeadline: row['Main deadline'] === '-' ? null : row['Main deadline'],
      preSubmitProject: row['Pre-submit project'].toLowerCase() === 'yes',
      projectDeadline: row['Project deadline'] === '-' ? null : row['Project deadline'],
      cost: row.Cost,
      description: row.Description,
      website: websiteLink.href || row.Website,
      detailRoute: detailRouteFromHref(nameLink.href),
      sourcePath
    };
    event.key = eventKey(event.name, event.starts);
    events.push(event);
  }
  return events;
}

export function dedupeEvents(events) {
  const unique = [];
  const duplicates = [];
  const seen = new Map();
  for (const event of events) {
    if (seen.has(event.key)) {
      duplicates.push({ key: event.key, first: seen.get(event.key), duplicate: event });
      continue;
    }
    seen.set(event.key, event);
    unique.push(event);
  }
  return { unique, duplicates };
}

function isoDay(value) {
  if (!value || !DATE_RE.test(value)) return null;
  return new Date(`${value}T00:00:00Z`);
}

function todayUtc(now = new Date()) {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function isPastBeyondGrace(event, now = new Date()) {
  const end = isoDay(event.ends || event.starts);
  if (!end) return false;
  const cutoff = todayUtc(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 2);
  return end < cutoff;
}

export function filterVisibleEvents(events, { showPast = false, now = new Date() } = {}) {
  return showPast ? events : events.filter((event) => !isPastBeyondGrace(event, now));
}

function compareIso(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function upcomingDeadline(event, today) {
  const candidates = [event.mainDeadline, event.projectDeadline]
    .filter(Boolean)
    .filter((value) => value >= today)
    .sort();
  return candidates[0] || event.starts;
}

export function sortEvents(events, mode = 'deadline', now = new Date()) {
  const today = todayUtc(now).toISOString().slice(0, 10);
  return [...events].sort((left, right) => {
    if (mode === 'event') {
      return compareIso(left.starts, right.starts) || compareIso(left.mainDeadline, right.mainDeadline) || left.name.localeCompare(right.name);
    }
    return compareIso(upcomingDeadline(left, today), upcomingDeadline(right, today)) || compareIso(left.starts, right.starts) || left.name.localeCompare(right.name);
  });
}

export function calendarMarkers(events) {
  const markers = [];
  for (const event of events) {
    if (event.starts) markers.push({ date: event.starts, kind: 'event', label: event.name, event });
    if (event.mainDeadline) markers.push({ date: event.mainDeadline, kind: 'deadline', label: `${event.name} deadline`, event });
    if (event.projectDeadline && event.projectDeadline !== event.mainDeadline) {
      markers.push({ date: event.projectDeadline, kind: 'project', label: `${event.name} project deadline`, event });
    }
  }
  return markers.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

export function formatDate(value) {
  const date = isoDay(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatDateRange(starts, ends) {
  if (!ends || starts === ends) return formatDate(starts);
  return `${formatDate(starts)} – ${formatDate(ends)}`;
}
