import { it, expect } from 'vitest';
import { urls, matchesEvent, markdownProse, unverifiedStatus } from '../../scripts/check-links.mjs';
it('extracts distinct external links from markdown and source', () => {
 expect(urls('[Event](https://event.test/) <a href="https://event.test/">')).toEqual(['https://event.test/']);
});
it('rejects unrelated successful pages and accepts an event page', () => {
 expect(matchesEvent('<title>Example Summit 2027</title>', 'Example Summit 2027')).toBe(true);
 expect(matchesEvent('<title>Domain for sale</title>', 'Example Summit 2027')).toBe(false);
});

it('ignores documentation code examples while preserving actual links', () => {
 const text = "`[Example](../missing.md)` and `https://...`\n```md\n[Sample](missing.md)\n```\n[Real](https://real.test/)";
 expect(urls(markdownProse(text))).toEqual(['https://real.test/']);
 expect(markdownProse(text)).not.toContain('missing.md');
});
it('distinguishes blocked checks from broken links', () => {
 for (const status of [401,403,429]) expect(unverifiedStatus(status)).toBe(true);
 for (const status of [200,404,410,500]) expect(unverifiedStatus(status)).toBe(false);
});
