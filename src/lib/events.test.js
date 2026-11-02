import { describe, expect, it } from 'vitest';
import {
  calendarMarkers,
  dedupeEvents,
  filterVisibleEvents,
  parseEventTable,
  sortEvents
} from './events.js';

const markdown = `# Hackathons 2027

| Name | Starts | Ends | Location | Format | Main deadline | Pre-submit project | Project deadline | Cost | Description | Website |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Example Hack](../details/hackathons/2027/example-hack.md) | 2027-03-10 | 2027-03-12 | Berlin, Germany | On-site | 2027-02-20 | Yes | 2027-03-09 | Free | Build a useful thing. | https://example.com |
`;

describe('event markdown parser', () => {
  it('parses the fixed table schema and detail route', () => {
    const [event] = parseEventTable(markdown, 'hackathons', 'content/hackathons/2027.md');
    expect(event.name).toBe('Example Hack');
    expect(event.detailRoute).toBe('/event/hackathons/2027/example-hack');
    expect(event.preSubmitProject).toBe(true);
    expect(event.projectDeadline).toBe('2027-03-09');
  });

  it('deduplicates by normalized name and event year', () => {
    const [event] = parseEventTable(markdown, 'hackathons');
    const duplicate = { ...event, sourcePath: 'another.md' };
    const result = dedupeEvents([event, duplicate]);
    expect(result.unique).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });
});

describe('event visibility and ordering', () => {
  it('hides events only after the two-day grace period', () => {
    const events = [
      { name: 'Old', starts: '2026-10-28', ends: '2026-10-30' },
      { name: 'Grace', starts: '2026-10-31', ends: '2026-10-31' },
      { name: 'Future', starts: '2026-11-10', ends: '2026-11-10' }
    ];
    const visible = filterVisibleEvents(events, { now: new Date('2026-11-02T12:00:00Z') });
    expect(visible.map((event) => event.name)).toEqual(['Grace', 'Future']);
  });

  it('sorts by the next useful deadline, then by event date', () => {
    const events = [
      { name: 'Later', starts: '2026-12-10', mainDeadline: '2026-11-20' },
      { name: 'Sooner', starts: '2026-12-20', mainDeadline: '2026-11-10' },
      { name: 'Closed', starts: '2026-11-05', mainDeadline: '2026-10-01' }
    ];
    expect(sortEvents(events, 'deadline', new Date('2026-11-02T00:00:00Z')).map((event) => event.name))
      .toEqual(['Closed', 'Sooner', 'Later']);
  });

  it('creates markers for event and both distinct deadlines', () => {
    const markers = calendarMarkers([{
      name: 'Demo',
      starts: '2027-04-20',
      mainDeadline: '2027-02-01',
      projectDeadline: '2027-04-19'
    }]);
    expect(markers.map((marker) => marker.kind)).toEqual(['deadline', 'project', 'event']);
  });
});
