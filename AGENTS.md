# AGENTS.md

## Purpose

This repository is a Markdown-first catalogue of upcoming software-engineering conferences and hackathons that are useful to someone based in Frankfurt, Germany. This repository contains only Markdown content, contribution documentation and validation workflows. Website JavaScript, builds and Firebase deployment live in the private repository. Event content must remain portable plain Markdown.

## Repository map

- `content/conferences/<year>.md` — conference and developer-event rows for one event year.
- `content/hackathons/<year>.md` — hackathon, coding-competition, CTF, engineering-challenge and build-event rows for one event year.
- `content/details/<type>/<year>/<slug>.md` — optional long-form event page. Pure Markdown only; no YAML frontmatter, JSX, HTML metadata or React-specific syntax.
- `.github/workflows/check-links.yml` — self-contained Markdown/event/link validation for pull requests and main.
- `CONTRIBUTING.md` — human and AI contribution instructions.
- `README.md` — project overview and live Firebase website link.

## Content partitioning

Never create one global events table. Partition by **event start year**:

- `content/conferences/2026.md`
- `content/conferences/2027.md`
- `content/hackathons/2026.md`
- `content/hackathons/2027.md`
- and so on.

This is the archive strategy. Old rows are never moved into a growing archive file and normally are never deleted. The React UI hides an event by default once its `Ends` date is more than two calendar days in the past. The **Show past events** button reveals those rows again.

If an event crosses New Year, store it in the file matching its `Starts` year.

## Exact table schema

Every yearly content file must contain exactly this header, in this order:

| Name | Starts | Ends | Location | Format | Main deadline | Pre-submit project | Project deadline | Cost | Description | Website |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Rules for fields:

- `Name`: canonical public event name. It may be a Markdown link to an optional detail file. The link text itself is the canonical name.
- `Starts`: required ISO date `YYYY-MM-DD`.
- `Ends`: required ISO date `YYYY-MM-DD`. For one-day events, repeat `Starts`.
- `Location`: `City, Country` for physical/hybrid events, or `Online` for fully online events.
- `Format`: exactly one of `On-site`, `Online`, or `Hybrid`.
- `Main deadline`: the most useful application, registration, CFP, qualification, or early-bird deadline currently known, in ISO `YYYY-MM-DD`; use `-` if none is known. Keep a passed deadline if the event itself is still upcoming and the deadline remains meaningful context.
- `Pre-submit project`: exactly `Yes` or `No`. Use `Yes` when participation requires or is judged on a project/proposal/submission prepared before or during a submission window rather than only showing up at an on-site event.
- `Project deadline`: ISO `YYYY-MM-DD` when `Pre-submit project` is `Yes`; otherwise `-`. If the exact deadline is genuinely unknown, use `-` and explain in `Description`.
- `Cost`: concise text such as `Free`, `€180 early`, `2,890.5 PLN incl. VAT`, or `See site`.
- `Description`: one concise sentence, preferably under 180 characters. Do not put a raw `|` character inside table cells; use words or `&#124;` if unavoidable.
- `Website`: official event URL. Prefer the organizer/event page over aggregators. A Markdown link is allowed, but a plain `https://...` URL is simplest.

Do not add, remove, rename, or reorder columns during routine content updates. A schema change requires corresponding parser/UI changes and JavaScript tests.

## Event identity and duplicate prevention

The repository-wide event key is:

`normalize(Name) + event year from Starts`

Normalization is case-insensitive and ignores punctuation/repeated whitespace, using NFKD normalization, lower-case ASCII letters/digits, and collapsed whitespace.

Examples that are duplicates:

- `KotlinConf 2027` + `2027`
- `KotlinConf 2027!` + `2027`

Before adding an event, search **all** conference and hackathon yearly files for the same name/year. An event must appear in exactly one category. If the key already exists, update the existing row instead of appending another row. The validation workflow rejects duplicate keys across all conference and hackathon files. Prevent duplicates at source.

## Sorting and visibility

Do not manually reorder content just to match the UI. React sorts rows at runtime.

Default UI order is the next actionable date: future `Main deadline` / `Project deadline`, then `Starts`; users can switch to event-date sorting.

Events ending more than two calendar days ago are hidden by default but remain in their yearly Markdown file and in the calendar/archive.

## Optional detail pages

Add a detail page when an event has useful information that does not fit in one table sentence: team rules, challenge tracks, prizes, CFP formats, speaker benefits, schedule, hiring path, preparation notes, or travel notes.

Path:

`content/details/<conferences|hackathons>/<year>/<slug>.md`

A detail file must be plain Markdown and should start with `# Event name`. No frontmatter. Link to it from the table `Name` cell with a relative Markdown link, for example:

`[CASSINI Hackathon](../details/hackathons/2026/cassini-hackathon.md)`

Keep factual event data in Markdown. Do not put event-specific names, dates, or descriptions into React components.

## Weekly ChatGPT update workflow

For an automated weekly update:

1. Read this `AGENTS.md` before any repository change.
2. Read the relevant current/future yearly Markdown files and search them for duplicate keys.
3. Search for newly announced events and meaningful updates. Prefer official organizer sources and verify dates/deadlines against them.
4. Add a new row only when the event matches the repository scope. Otherwise update the existing row in place.
5. Create or update an optional detail page only when it adds real value.
6. Do not delete old events merely because they passed; the UI handles visibility and history.
7. For a normal weekly content refresh, modify only `content/**`. Do not add application code, package files, scripts or build/deploy workflows. Changes to the schema or validation workflow require explicit maintainer approval.
8. Keep conference updates in conference files and hackathon/competition updates in hackathon files.
9. Commit with a concise message describing the content refresh and open a pull request against `main`. Human and AI contributions follow the same validation. Do not merge or push directly to main unless the user explicitly requests it.

## Scope and quality bar

Prioritize Germany and nearby Europe: Netherlands, Belgium, Luxembourg, France, Switzerland, Austria, Denmark, Czechia, Poland and similarly practical destinations from Frankfurt. Farther events should have unusually strong technical/recruiting value.

Prefer English-language or clearly English-accessible events, professional eligibility, low/free cost, strong engineering content, reputable sponsors, public demos/leaderboards, CFP opportunities, recruiting/networking value, or meaningful prizes. Do not claim a hiring fast-track unless an official source says so; describe indirect networking as indirect.

## Validation and publication

- Every pull request and every push to main runs `.github/workflows/check-links.yml`.
- It checks exact table columns, real ISO dates, start-year partitions, enum values, internal Markdown links, duplicate keys, official URL reachability and event identity.
- Successful URL checks are cached; duplicates and event structure are checked every run. Blocked/rate-limited sites are reported for manual verification and are never cached as passed. Other link failures and identity mismatches fail the check.
- Review the `link-check-report` artifact for failed/unverified URLs, event names and short descriptions.
- The private website deployment watches public main, waits for validation of that exact revision, then copies only `content/**/*.md` and rebuilds Firebase Hosting. GitHub schedules may be delayed.
- Do not add JavaScript, HTML, npm dependencies, Firebase configuration, symlinks or GitHub Pages workflows to this repository.
- AI contributors must verify factual claims against organizer sources, preserve Markdown portability, and use the same pull-request process as humans.
