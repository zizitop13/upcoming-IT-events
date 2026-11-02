import { Link } from 'react-router-dom';
import { calendarMarkers } from '../lib/events.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function markerClass(kind) {
  return `marker marker-${kind}`;
}

function MarkerLink({ marker }) {
  const content = <span className={markerClass(marker.kind)} title={marker.label}>{marker.label}</span>;
  return marker.event.detailRoute ? <Link to={marker.event.detailRoute}>{content}</Link> : content;
}

function CalendarAgenda({ markers }) {
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

  return (
    <main className="page calendar-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Dates + deadlines</p>
          <h1>Calendar</h1>
        </div>
      </div>
      <div className="legend">
        <span><i className="legend-event" /> Event</span>
        <span><i className="legend-deadline" /> Main deadline</span>
        <span><i className="legend-project" /> Project deadline</span>
      </div>
      <CalendarAgenda markers={markers} />
    </main>
  );
}
