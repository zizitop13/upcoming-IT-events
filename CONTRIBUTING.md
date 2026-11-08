# Contributing events

Human and AI contributions use the same process.

1. Read [AGENTS.md](AGENTS.md) for the exact schema, scope and canonical event key.
2. Check all conference and hackathon files for the event name and start year. Update an existing row instead of adding a duplicate.
3. Verify the official organizer page, dates, deadlines, price and eligibility. Do not invent missing information; use the documented `-` value and explain meaningful uncertainty.
4. Edit `content/conferences/<year>.md` or `content/hackathons/<year>.md`, partitioned by the event start year.
5. Add an optional plain Markdown description in `content/details/<category>/<year>/<slug>.md` and link it from the Name cell.
6. Open a pull request against `main`. Explain the change and cite the official sources you checked.
7. Wait for **Validate events and links**. Fix structural errors, duplicate keys, broken links and event-identity mismatches. Blocked or rate-limited websites are flagged for manual verification in the `link-check-report` artifact.

Only Markdown content/documentation and validation workflows belong here. Do not add website code, HTML, JavaScript, package files or deployment configuration.

Contributors never need Firebase credentials or access to the private application repository. Once accepted into main and validated, the private deployment picks up the Markdown snapshot and updates https://upcoming-it-events.web.app/ .

AI-assisted contributions must be reviewed against official sources and must not include fabricated facts. Keep generated text concise and factual.
