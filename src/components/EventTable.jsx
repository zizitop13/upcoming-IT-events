import { Link } from 'react-router-dom';
import { formatDate, formatDateRange } from '../lib/events.js';

export default function EventTable({ events }) {
  return (
    <section className="event-section">
      <div className="table-wrap">
        <table className="event-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Event</th>
              <th>Deadline</th>
              <th>Format</th>
              <th>Description</th>
              <th>Project before event?</th>
              <th>Cost</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.key}>
                <td className="event-name">
                  {event.detailRoute ? <Link to={event.detailRoute}>{event.name}</Link> : event.name}
                </td>
                <td>{formatDateRange(event.starts, event.ends)}<small>{event.location}</small></td>
                <td>{formatDate(event.mainDeadline)}</td>
                <td><span className="format-pill">{event.format}</span></td>
                <td className="description-cell">{event.description}</td>
                <td>{event.preSubmitProject ? <>Yes<small>{formatDate(event.projectDeadline)}</small></> : 'No'}</td>
                <td>{event.cost}</td>
                <td><a href={event.website} target="_blank" rel="noreferrer">Official ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
