import About from './components/About.jsx';
import { AccountProvider, AccountButton, useAccount } from './Account.jsx';
import MyEvents from './components/MyEvents.jsx';
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
        <p className="eyebrow">Europe</p>
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

function SiteHeader() {
  const { user } = useAccount();
  const [open, setOpen] = React.useState(false);
  const toggleRef = React.useRef(null);
  const location = useLocation();
  React.useEffect(() => { setOpen(false); }, [location.pathname, user?.uid]);
  return (      <header className="site-header" onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } }}>
        <div className="header-left">
        <Link className="brand" to={DEFAULT_ROUTE}><img className="brand-logo" src={`${import.meta.env.BASE_URL}calendar.svg`} width="32" height="32" alt="" />Upcoming IT Events</Link>
        </div>
        <div className="header-actions">
          {user ? <NavLink className="my-events-shortcut" to="/my-events" aria-label="My events" title="My events"><svg width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 14h40a4 4 0 0 1 4 4v8a6 6 0 0 0 0 12v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-8a6 6 0 0 0 0-12v-8a4 4 0 0 1 4-4Z"/><path d="m32 22 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" strokeWidth="3.5"/></svg><span>My events</span></NavLink> : <AccountButton compact />}
        <button ref={toggleRef} className="nav-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(value => !value)}>{open ? 'Close' : 'Menu'}</button>
        {user && <AccountButton />}
        </div>
        <nav id="site-navigation" aria-label="Main navigation" className={open ? 'is-open' : ''} onClick={event => { if (event.target.closest('a')) setOpen(false); }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
          ))}


          <NavLink to="/about">About</NavLink>
        </nav>
      </header>);
}

function ContributeLink() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 120);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (      <a href="https://github.com/zizitop13/upcoming-IT-events" target="_blank" rel="noreferrer" aria-label="Contribute on GitHub" className={`contribute-link ${scrolled ? 'is-scrolled' : ''}`}><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.4 4.4 0 0 1 .1-3.2s1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.5 1.1.2 2.4.1 3.2a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.5c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" /></svg><span>Contribute</span></a>);
}

export default function App() {
  return (
    <AccountProvider><HashRouter>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="/conferences" element={<EventsPage type="conferences" />} />
        <Route path="/hackathons" element={<EventsPage type="hackathons" />} />
        <Route path="/my-events" element={<MyEvents events={content.events} />} />
        <Route path="/about" element={<About />} />
        <Route path="/calendar" element={<CalendarView events={content.events} />} />
        <Route path="/event/:type/:year/:slug" element={<DetailRoute />} />
      </Routes>
      <ContributeLink />
    </HashRouter></AccountProvider>
  );
}
