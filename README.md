# Upcoming IT Events

A community-maintained Markdown catalogue of software engineering conferences, hackathons and competitions in Europe.

**Website:** https://upcoming-it-events.web.app/

## Contribute

Human and AI contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md), edit the [conference](content/conferences) or [hackathon](content/hackathons) files, and open a pull request against `main`.

Keep one yearly table per category. Optional longer descriptions live in [content/details](content/details). Verify dates, deadlines and prices against official organizer sources, and check existing files for duplicate name/year keys.

## Validation

Every pull request and main update runs the [event and link validator](.github/workflows/check-links.yml). It checks the Markdown schema, dates, duplicate events, local links and official websites. Successful link checks are cached; uncertain destinations are reported for manual review.

This repository contains Markdown and validation workflows only. The application, its tests, build dependencies and Firebase Hosting deployment are maintained privately. Validated changes on public `main` are picked up automatically by the private deployment. GitHub Pages is no longer used.

Event discovery is AI-assisted and may miss changes. Always check the official event page before applying, registering, paying or travelling.

