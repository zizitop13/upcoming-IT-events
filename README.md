# Upcoming IT Events

A Markdown-first catalogue of software-engineering conferences and hackathons that are practical to attend from Germany.

The site is rendered with React and deployed to GitHub Pages. Event data stays independent from the rendering engine: the source of truth is plain Markdown under `content/`.

## Local development

```bash
npm install
npm test
npm run dev
```

Production build:

```bash
npm run build
```

## Content

- `content/conferences/<year>.md` — yearly conference tables.
- `content/hackathons/<year>.md` — yearly hackathon tables.
- `content/details/<type>/<year>/<slug>.md` — optional Markdown detail pages.
- `AGENTS.md` — exact schema, duplicate rules, partitioning, and weekly update workflow.

The home page hides events that ended more than two calendar days ago. Use **Show past events** to reveal the archive. The calendar page displays event dates and deadlines in a one-year calendar or a multi-year agenda.
