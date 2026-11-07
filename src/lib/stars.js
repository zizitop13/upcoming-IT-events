export function starDocumentId(key) { return encodeURIComponent(key); }
export function selectStarredEvents(events, keys) { return events.filter(event => keys.has(event.key)); }
