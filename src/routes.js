export const DEFAULT_ROUTE = '/conferences';

export const NAV_ITEMS = [
  { to: '/conferences', label: 'Conferences' },
  { to: '/hackathons', label: 'Hackathons' },
  { to: '/calendar', label: 'Calendar' }
];

export function categoryRoute(type) {
  return type === 'hackathons' ? '/hackathons' : '/conferences';
}
