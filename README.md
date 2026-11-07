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

## GitHub sign-in and stars

Copy `.env.example` to `.env.local` and fill the Firebase web app configuration. Set the same four `VITE_FIREBASE_*` values as Actions repository variables for Pages builds. These web configuration identifiers are public; never include a GitHub client secret.

Enable GitHub in Firebase Authentication, add `zizitop13.github.io` as an authorized domain, and configure the OAuth callback shown by Firebase in the GitHub OAuth app. Backend rules and detailed provider setup live in `upcoming-IT-events-private/firebase/`. Deploy those rules before enabling the frontend.

Stars sync across devices under `users/{uid}/starredEvents/{encodedEventKey}`. My events includes all starred catalogue events, including past events. Missing Firebase configuration leaves the catalogue available with sign-in disabled.
