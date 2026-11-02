import React from 'react';
import { Link } from 'react-router-dom';
import { calendarMarkers } from '../lib/events.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function markerClass(kind) {
  return `marker marker-${kind}`;
}

function MarkerLink({ marker }) {
  const content = <span className={markerClass(marker.kind)} title={marker.label}>{marker.label}</span>;
  return marker.event.detailRoute ? <Link to={marker.event.detailRoute}>{content}</Link> : content;
}

function MonthCard({ year, month, markers }) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const byDay = new Map();
  for (const marker of markers) {
    const day = Number(marker.date.slice(8, 10));
    const list = byDay.get(day) || [];
    list.push(marker);
    byDay.set(day, list);
  }

  return (
    <article className="month-card">
      <h3>{MONTHS[month]} {year}</h3>
      <div className="month-grid weekday-row">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="month-grid">
        {Array.from({ length: offset }).map((_, index) => <span key={`blank-${index}`} className="day blank" />)}
        {Array.from({ length: days }).map((_, index) => {
          const day = index + 1;
          const dayMarkers = byDay.get(day) || [];
          return (
            <div key={day} className={`day ${dayMarkers.length ? 'has-items' : ''}`}>
              <strong>{day}</strong>
              {dayMarkers.slice(0, 2).map((marker, markerIndex) => <MarkerLink key={`${marker.kind}-${markerIndex}`} marker={marker} />)}
              {dayMarkers.length > 2 && <small>+{dayMarkers.length - 2}</small>}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function YearGrid({ year, markers }) {
  return (
    <div className="year-grid">
      {MONTHS.map((_, month) => (
        <MonthCard
          key={month}
          year={year}
          month={month}
          markers={markers.filter((marker) => Number(marker.date.slice(0, 4)) === year && Number(marker.date.slice(5, 7)) === month + 1)}
        />
      ))}
    </div>
  );
}

function MultiYearAgenda({ markers }) {
  const groups = new Map();
  for (const marker of markers) {
    const year = marker.date.slice(0, 4);
    const month = marker.date.slice(5, 7);
    const key = `${year}-${month}`;
    const list = groups.get(key) || [];
    list.push(marker);
    groups.set(key, list);
  }
  return (
    <div className="multi-year">
      {[...groups.entries()].map(([key, items]) => (
        <section key={key} className="agenda-month">
          <h3>{MONTHS[Number(key.slice(5, 7)) - 1]} {key.slice(0, 4)}</h3>
          {items.map((marker, index) => (
            <div className="agenda-item" key={`${marker.date}-${marker.kind}-${index}`}>
              <time>{marker.date.slice(8, 10)}</time>
              <MarkerLink marker={marker} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function CalendarView({ events }) {
  const markers = calendarMarkers(events);
  const markerYears = [...new Set(markers.map((marker) => Number(marker.date.slice(0, 4))))].sort();
  const currentYear = new Date().getFullYear();
  const initialYear = markerYears.includes(currentYear) ? currentYear : markerYears[0];
  const [selectedYear, setSelectedYear] = React.useState(initialYear);
  const [allYears, setAllYears] = React.useState(false);

  return (
    <main className="page calendar-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Dates + deadlines</p>
          <h1>Calendar</h1>
        </div>
        <div className="calendar-controls">
          <button className={!allYears ? 'active' : ''} onClick={() => setAllYears(false)}>Year</button>
          <button className={allYears ? 'active' : ''} onClick={() => setAllYears(true)}>All years</button>
          {!allYears && (
            <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>
              {markerYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          )}
        </div>
      </div>
      <div className="legend">
        <span><i className="legend-event" /> Event</span>
        <span><i className="legend-deadline" /> Main deadline</span>
        <span><i className="legend-project" /> Project deadline</span>
      </div>
      {allYears ? <MultiYearAgenda markers={markers} /> : <YearGrid year={selectedYear} markers={markers} />}
    </main>
  );
}
