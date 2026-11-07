import { it, expect } from 'vitest';
import { urls, matchesEvent } from '../../scripts/check-links.mjs';
it('extracts distinct external links from markdown and source', () => {
 expect(urls('[Event](https://event.test/) <a href="https://event.test/">')).toEqual(['https://event.test/']);
});
it('rejects unrelated successful pages and accepts an event page', () => {
 expect(matchesEvent('<title>Example Summit 2027</title>', 'Example Summit 2027')).toBe(true);
 expect(matchesEvent('<title>Domain for sale</title>', 'Example Summit 2027')).toBe(false);
});
