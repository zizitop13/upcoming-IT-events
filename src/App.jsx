import React from 'react';
import { HashRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import CalendarView from './components/CalendarView.jsx';
import EventDetail from './components/EventDetail.jsx';
import EventTable from './components/EventTable.jsx';
import { loadContent } from './content.js';
import { filterVisibleEvents, sortEvents } from './lib/events.js';
import { categoryRoute, DEFAULT_ROUTE, NAV_ITEMS } from './routes.js';
import './styles.css';

const content = loadContent();

const CATEGORY_META = {
  conferences: {
    title: 'Conferences',
    description: 'Software engineering conferences, CFPs and developer events with strong technical, speaking or networking value.'
  },
  hackathons: {
    title: 'Hackathons & competitions',
    description: 'Hackathons, coding competitions, CTFs and engineering challenges with useful prizes, portfolio or recruiting value.'
  }
};

function EventsPage({ type }) {
  const [showPast, setShowPast] = React.useState(false);
  const [sortMode, setSortMode] = React.useState('deadline');
  const categoryEvents = content.events.filter((event) => event.type === type);
  const visible = filterVisibleEvents(categoryEvents, { showPast });
  const sorted = sortEvents(visible, sortMode);
  const meta = CATEGORY_META[type];

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Europe · from Frankfurt</p>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
        <div className="toolbar">
          <div className="segmented">
            <button className={sortMode === 'deadline' ? 'active' : ''} onClick={() => setSortMode('deadline')}>Deadline first</button>
            <button className={sortMode === 'event' ? 'active' : ''} onClick={() => setSortMode('event')}>Event date first</button>
          </div>
          <div className="toolbar-right">
            <span className="event-count">{sorted.length} shown</span>
            <button className="history-button" onClick={() => setShowPast((value) => !value)}>
              {showPast ? 'Hide past events' : 'Show past events'}
            </button>
          </div>
        </div>
      </section>
      {content.duplicates.length > 0 && <div className="warning">Duplicate event keys detected. Check AGENTS.md and the Markdown tables.</div>}
      <EventTable events={sorted} />
    </main>
  );
}

function DetailRoute() {
  const location = useLocation();
  const { type } = useParams();
  const backTo = categoryRoute(type);
  const backLabel = type === 'hackathons' ? 'All hackathons' : 'All conferences';
  return <EventDetail markdown={content.details.get(location.pathname)} backTo={backTo} backLabel={backLabel} />;
}

export default function App() {
  return (
    <HashRouter>
      <header className="site-header">
        <Link className="brand" to={DEFAULT_ROUTE}>Upcoming IT Events</Link>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
          ))}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="/conferences" element={<EventsPage type="conferences" />} />
        <Route path="/hackathons" element={<EventsPage type="hackathons" />} />
        <Route path="/calendar" element={<CalendarView events={content.events} />} />
        <Route path="/event/:type/:year/:slug" element={<DetailRoute />} />
      </Routes>
    </HashRouter>
  );
}
