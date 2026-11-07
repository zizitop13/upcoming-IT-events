export function starDocumentId(key) { return encodeURIComponent(key); }
export function selectStarredEvents(events, keys) { return events.filter(event => keys.has(event.key)); }

// A star clicked before sign-in remains an add, even if the event was already saved.
export async function applyStarClick({ user, login, starred, event, write }) {
  const account = user || await login();
  if (!account) return;
  await write(account.uid, event, Boolean(user && starred));
}
