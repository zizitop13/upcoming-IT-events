import { useEffect, useState } from 'react';
import { useAccount, AccountButton } from '../Account.jsx';
import { selectStarredEvents } from '../lib/stars.js';
import { calendarMarkers, sortEvents } from '../lib/events.js';
import { CalendarAgenda } from './CalendarView.jsx';
import EventTable from './EventTable.jsx';

// Keep the current page stable while stars are removed; reset on navigation/account change.
function SavedEvents({ events, stars }) {
  const [seenKeys, setSeenKeys] = useState(() => new Set(stars));
  useEffect(() => { setSeenKeys(previous => new Set([...previous, ...stars])); }, [stars]);
  const selected = sortEvents(selectStarredEvents(events, new Set([...seenKeys, ...stars])), 'event');
  if (!selected.length) return <p>Star events in the lists or calendar to see them here.</p>;
  return <>
    <p>Unstarred events stay visible until you leave this page, so you can add them back.</p>
    <h2>Your calendar</h2><CalendarAgenda markers={calendarMarkers(selected)} />
    <h2>Your events ({selected.length} shown · {selectStarredEvents(events, stars).length} starred)</h2><EventTable events={selected} />
  </>;
}
export default function MyEvents({ events }) {
  const { user, ready, starsReady, stars, configured, deleteAccount } = useAccount();
  const [deleting, setDeleting] = useState(false);
  async function confirmDeleteAccount() {
    const confirmed = window.confirm('Delete your account and all your starred events? This cannot be undone.');
    if (!confirmed) return;
    setDeleting(true);
    try { await deleteAccount(); } catch { /* The account provider displays the failure. */ }
    finally { setDeleting(false); }
  }
  return <main className="page my-events"><h1>My starred events</h1>
    {!ready ? <p>Loading account…</p> : !user ? <><p>{configured ? 'Sign in to save events and see your personal calendar.' : 'Sign-in is being configured. Please check back soon.'}</p><AccountButton /></> : !starsReady ? <p>Loading your events…</p> : <><SavedEvents key={user.uid} events={events} stars={stars} /><section className="delete-account"><h2>Account</h2><p>Deleting your account also removes your saved events.</p><button className="danger-button" disabled={deleting} onClick={confirmDeleteAccount}>{deleting ? 'Deleting account…' : 'Delete account'}</button></section></>}
  </main>;
}
