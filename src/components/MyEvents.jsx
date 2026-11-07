import { useAccount, AccountButton } from '../Account.jsx';
import { selectStarredEvents } from '../lib/stars.js';
import { calendarMarkers, sortEvents } from '../lib/events.js';
import { CalendarAgenda } from './CalendarView.jsx';
import EventTable from './EventTable.jsx';
export default function MyEvents({ events }) {
  const { user, ready, starsReady, stars, configured } = useAccount();
  const selected = sortEvents(selectStarredEvents(events, stars), 'event');
  return <main className="page my-events"><h1>My starred events</h1>
    {!ready ? <p>Loading account…</p> : !user ? <><p>{configured ? 'Sign in to save events and see your personal calendar.' : 'Sign-in is being configured. Please check back soon.'}</p><AccountButton /></> : !starsReady ? <p>Loading your events…</p> : selected.length === 0 ? <p>Star events in the lists or calendar to see them here.</p> : <>
      <h2>Your calendar</h2><CalendarAgenda markers={calendarMarkers(selected)} />
      <h2>Your events ({selected.length})</h2><EventTable events={selected} />
    </>}
  </main>;
}
