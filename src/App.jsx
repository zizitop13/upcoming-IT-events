import React from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import CalendarView from './components/CalendarView.jsx';
import EventDetail from './components/EventDetail.jsx';
import EventTable from './components/EventTable.jsx';
import { loadContent } from './content.js';
import { filterVisibleEvents, sortEvents } from './lib/events.js';
import './styles.css';

const content = loadContent();

function Home() {
  const [showPast, setShowPast] = React.useState(false);
  const [sortMode, setSortMode] = React.useState('deadline');
  const visible = filterVisibleEvents(content.events, { showPast });
  const sorted = sortEvents(visible, sortMode);
  const conferences = sorted.filter((event) => event.type === 'conferences');
  const hackathons = sorted.filter((event) => event.type === 'hackathons');

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Europe · from Frankfurt</p>
        <h1>Upcoming IT events</h1>
        <p>Software engineering conferences, hackathons and their deadlines. Markdown is the source of truth; React only renders it.</p>
        <div className="toolbar">
          <div className="segmented">
            <button className={sortMode === 'deadline' ? 'active' : ''} onClick={() => setSortMode('deadline')}>Deadline first</button>
            <button className={sortMode === 'event' ? 'active' : ''} onClick={() => setSortMode('event')}>Event date first</button>
          </div>
          <button className="history-button" onClick={() => setShowPast((value) => !value)}>
            {showPast ? 'Hide past events' : 'Show past events'}
          </button>
        </div>
      </section>
      {content.duplicates.length > 0 && <div className="warning">Duplicate event keys detected. Check AGENTS.md and the Markdown tables.</div>}
      <EventTable title="Conferences" events={conferences} />
      <EventTable title="Hackathons & competitions" events={hackathons} />
    </main>
  );
}

function DetailRoute() {
  const location = useLocation();
  return <EventDetail markdown={content.details.get(location.pathname)} />;
}

export default function App() {
  return (
    <HashRouter>
      <header className="site-header">
        <Link className="brand" to="/">Upcoming IT Events</Link>
        <nav>
          <NavLink to="/" end>Tables</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<CalendarView events={content.events} />} />
        <Route path="/event/:type/:year/:slug" element={<DetailRoute />} />
      </Routes>
    </HashRouter>
  );
}
