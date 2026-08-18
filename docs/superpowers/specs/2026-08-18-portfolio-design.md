# Portfolio Site — Design

**Date:** 2026-08-18
**Repo:** locadani.github.io
**Status:** Implemented. Revised 2026-08-18 — see Revisions.

## Goal

A recruiter-facing portfolio for Daniele Locatelli, targeting full-stack engineering
roles. A recruiter must be able to answer three questions in under 30 seconds:

1. What does this person do, and where?
2. Do they know our stack?
3. What have they actually shipped, and how recently?

Success means the site answers all three without the reader scrolling past the fold
for the first two, and without reading prose for the third.

## Audience and tone

Primary reader: a technical recruiter or hiring manager in Berlin or the wider EU
market, skimming. Secondary reader: an engineer verifying the work is real.

Content density beats visual experimentation. The site is English-only.

## Non-goals

Deliberately excluded. Each is a small addition later if wanted.

- No blog, no posts collection
- No contact form, no backend of any kind
- No CMS
- No analytics
- No dark mode (light-only, see Visual direction)
- No CV PDF download
- No i18n
- No public email address or phone number

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7.2.x | 2026 default for content-first sites; ships ~0 KB JS by default |
| Styling | Tailwind 4.3.x via `@tailwindcss/vite` | Standard in 2026, familiar from day-job React work |
| Language | TypeScript, strict | Matches existing skills; catches content-schema drift |
| Content | Astro content collections (Markdown + Zod) | Adding an entry is one new file, no template edits |
| Hosting | GitHub Pages, `withastro/action` | Free, official action, already the repo's home |

Verified locally: Node 24.11.1, npm 11.6.2.

Rejected: **Next.js** (app-first framework; static-export config overhead for no gain on
a content site). **Framer** (hosted subscription, outside the repo, demonstrates no
engineering). **Keeping the Particle Jekyll theme** (2019 Gulp + node-sass toolchain that
will not install on Node 24, and no timeline or experience section).

## Information architecture

Single page, `src/pages/index.astro`, four sections top to bottom.

### 1. Hero

Name, one-line positioning, location, languages, two links.

- Positioning line names the stack explicitly, because that is what gets scanned:
  full-stack engineer in Berlin working in Next.js, Python, C#, PostgreSQL.
- Languages: Italian (native), English (C1), German (B1). Relevant to EU hiring;
  Turkish and Japanese (A2) omitted as noise for this audience.
- Links: LinkedIn, GitHub. No email, no phone, per explicit decision.

### 2. Career & projects — one merged timeline

**Revised.** The original design put projects alone on the timeline with a separate
Experience block above it. That answered "what did they build" but left the reader to
join two lists mentally to learn *when*. The two are now one two-column timeline sharing
a single set of rows:

- **Left column** — each role as a card with a vertical **rail whose length is the job's
  real duration**, marked with start and end ticks. The card is sticky within its span,
  so the job stays visible next to every project belonging to it.
- **Centre column** — the year axis and a continuous spine.
- **Right column** — projects, one per row, at their own dates.

The point is geometric rather than stated: a project built during a job physically sits
beside that job's bar. It also surfaces something a two-list layout hides — that the Anki
uploader and the drone simulator were built while employed at KPMG.

Row assignment lives in `src/lib/timeline.ts` as a pure, unit-tested function. Rows are
**content-sized, not proportional to elapsed time**: a strictly proportional axis would
spend most of its height on the quiet years and squeeze the recent, dense ones — the
opposite of what a reader needs.

A role whose date range contains no projects gets an anchor row of its own, inserted in
date order. This is not a hypothetical: it happens the moment a new job is added before
any of its projects, and without it the bar would have no rows to span.

**On a phone** the grid switches off and the page becomes one column following DOM order,
which the component sorts into "here is the job, here is what I built during it" — the
same story the two columns tell on a wide screen.

### 4. Footer

LinkedIn, GitHub, and a "built with Astro" link to this repo's source.

## The technology filter

The one piece of interactivity on the site.

**Semantics:** multi-select, **OR**. Selecting React and Python matches any project
using either. This is what a recruiter scanning for their own stack wants; AND would
return empty sets for most pairs and read as broken.

**Behaviour on non-matching entries:** dim and collapse. Matching entries stay full size
and full colour; non-matching shrink to a thin muted stub. The spine and the true sense
of chronology survive filtering, and there is no jarring reflow. A live count
("3 of 15 match") sits next to the chips.

**Chip list is derived, not authored.** It is the union of tech slugs actually used
across all projects, ordered by frequency and then alphabetically for ties, so the order
is stable across builds.

**Grouped by category** — Languages, Frameworks, Data, Infrastructure, AI, Tooling — using
the `category` already carried by every registry entry. Flat, the 42 chips filled eleven
rows on a phone and buried the first timeline entry; grouped, a reader looking for a
language scans one short labelled row. Empty groups are dropped rather than rendered as
bare headings. Adding a project with a new technology makes
its chip appear automatically; no second list to maintain.

**Implementation: no framework, no hydration.** Each entry renders with
`data-tech="react typescript"`. A small vanilla TypeScript script (~1 KB) reads the
checkbox state, sets `data-match="true|false"` on each entry and `data-filtering` on the
timeline root; CSS handles all dimming, collapsing, and transitions. A React island was
considered and rejected — it would be the only JS framework on the site, for a feature
that is attribute toggling.

**URL state.** Selected chips sync to `?tech=react,python`, and the page reads that
param on load. This makes a filtered view linkable — a message to a recruiter can point
at exactly the subset of work in their stack. Uses `history.replaceState`, so it never
pollutes the back button.

**Scope.** The filter narrows projects only. Role bars are never dimmed or collapsed — a
recruiter filtering by React must not appear to erase the career history. Their rails do
shorten as project rows collapse, which keeps the alignment honest.

**Known gap.** Chips derive from projects, so technologies appearing only in a role's
description — Azure, Bicep, MongoDB, Entra ID, Railway, GitHub Actions — have no chip.
Now that roles sit on the same timeline this is more visible: a reader can see "Azure" on
the KPMG card and find no Azure chip. Padding project tags with technologies those
projects did not use would be a lie, so the honest options are a separate "also worked
with" line, or deriving chips from roles too and letting role bars match. Unresolved.

**Without JavaScript** the full timeline renders normally and the filter hides itself.
The page never depends on script to be readable.

## Data model

```
src/content/
  experience/*.md    role, company, location, start, end?, tech[], body = achievements
  projects/*.md      title, context, start, end?, tech[], repo?, body = summary
src/data/
  tech.ts            canonical registry: slug -> { name, category }
  site.ts            name, tagline, location, languages, links
src/lib/
  filter.ts          pure matching logic
```

`tech.ts` is the load-bearing piece. A single registry maps each slug to a display name
and a category (`language` | `framework` | `data` | `infra` | `ai`). Every `tech` entry
in every Markdown file is validated against it by the collection's Zod schema.

Without this registry, `React` / `react` / `ReactJS` drift into the content within
weeks, and the derived chip list fills with near-duplicates that each match a different
subset. The registry makes that class of bug impossible.

The registry holds **technologies only** — things a recruiter would filter by. Topics and
domains (computer vision, GPU computing, multi-tenancy) are not slugs; they belong in an
entry's prose summary. A filter chip reading "computer vision" would match on subject
matter rather than skill and dilute the one job the filter has. Multi-word technologies
get one slug each (`microsoft-graph`, `minio`, `s3`), never a combined `MinIO/S3`.

## Data flow

1. Markdown frontmatter parsed and validated by Zod at build time
2. Entries sorted by start date, descending
3. Rendered to static HTML carrying `data-tech` attributes
4. Client script reads checkbox state, calls the pure matcher, writes `data-match`
5. CSS renders the dim-and-collapse state

Steps 1–3 happen at build; 4–5 are the only runtime work.

## Error handling

The realistic failure mode for a content-driven site is a silent content typo, not a
runtime exception. So the build is the guard:

- **Unknown tech slug** — Zod enum rejects it, build fails with the offending file and
  value. A project tagged `Reactjs` can never silently become unfilterable.
- **Malformed or missing date** — build fails rather than producing an entry that sorts
  to an arbitrary position.
- **`end` before `start`** — build fails.
- **Missing required field** — build fails, naming the file.

At runtime there is nothing to fail: the filter degrades to "no filter" if the script
does not load.

## Visual direction

Light-only, editorial. Strong typography, generous whitespace, one accent colour, no
gradients or particle effects. Rationale: the audience includes non-technical recruiters
reading on bright office monitors; a print-like light page also reads as senior rather
than trendy, and saves cleanly if someone prints or PDFs the page.

Timeline spine and tech chips carry the visual interest. Restraint everywhere else.

## Accessibility

- Filter is a real `<fieldset>` of `<input type="checkbox">` — keyboard-navigable and
  screen-reader-legible without ARIA gymnastics
- Match count in an `aria-live="polite"` region, so filtering is announced
- Timeline is an ordered list (`<ol>`), because chronological order is meaning
- `prefers-reduced-motion` disables the collapse transition
- Dimmed stubs stay above 4.5:1 contrast — "de-emphasised" must not mean unreadable
- Visible focus rings, never removed

## SEO

Someone will google "Daniele Locatelli". Target that: descriptive `<title>`, meta
description, Open Graph and Twitter card tags, `@type: Person` JSON-LD naming the
current employer and skills, canonical URL, and a sitemap via `@astrojs/sitemap`.

## Testing

| Layer | Tool | Covers |
| --- | --- | --- |
| Types and templates | `astro check` | Type errors, template mistakes |
| Content integrity | `astro build` | Every schema rule in Error handling |
| Filter logic | Vitest on `src/lib/filter.ts` | OR semantics, empty selection, multi-tag entries, unknown slug, URL round-trip, chip grouping |
| Row assignment | Vitest on `src/lib/timeline.ts` | Bar spans, overlapping roles, roles with no projects, year markers, determinism |
| Filter interaction | Playwright | Collapse, count, URL round-trip, role bars never dimmed, **bar/project alignment measured in real pixels**, mobile single-column order |

`filter.ts` is pure and DOM-free specifically so it is unit-testable without a browser;
it is written test-first. Playwright covers the wiring that unit tests cannot.

A Lighthouse pass before first deploy, targeting 100 on accessibility and SEO.

## Deployment

`.github/workflows/deploy.yml` — `withastro/action` to build, `actions/deploy-pages` to
publish, triggered on push to `main`.

Two things to get right:

- **No `base` path.** `locadani.github.io` is a *user* site served from the domain root.
  Setting `base` (correct for project sites) is the classic cause of broken asset paths
  here. `site: 'https://locadani.github.io'`, no `base`.
- **Pages source must be set to "GitHub Actions"** in repo settings, not "Deploy from a
  branch".

**Blocked on the user:** the `gh` CLI in this environment is authenticated as
`locatelli-d`, and `github.com/locadani/locadani.github.io` returns 404 to that account.
Daniele will run `gh auth login` as `locadani` — this is interactive and cannot be
automated from here. All local work can proceed before this is resolved.

## Removing the Particle theme

The repo currently holds an unmodified copy of the Particle Jekyll theme with lorem
ipsum content. It all goes:

```
_config.yml  _includes/  _layouts/  gulpfile.js  package.json  yarn.lock
src/  assets/  particle.jpg  index.html  LICENSE.txt
```

`LICENSE.txt` is Nathan Randecker's MIT licence covering the code being removed, so it
goes with it. `README.md` is rewritten to describe the new site.

Git history preserves everything — recoverable at commit `57314c5`. Confirm with the
user before deleting.

## Timeline content inventory

15 entries spanning 2020–2026, which is what makes the filter worth building.

### Work — Backwell Tech Corp (Nov 2025 – present)

| Project | Tech |
| --- | --- |
| MailSense — multi-tenant email automation platform; migrated from single-tenant to multi-tenant (master DB routing to per-tenant databases), IMAP/SMTP and Microsoft Graph ingestion, per-tenant object storage, legacy MVC dashboard being retired | C#, .NET, ASP.NET Core, PostgreSQL, Docker, MinIO, Microsoft Graph |
| Customer Intelligence — multi-tenant SaaS for printed-letter campaigns: CSV import and geocoding, map segmentation, prospect discovery, personalised landing pages and letters, churn/CLV predictions, Stripe-backed credit ledger, per-tenant feature flags, four locales | Next.js, React, TypeScript, Supabase, PostgreSQL, Tailwind, Stripe, OpenAI, Leaflet, Vitest |
| Scale-up platform — modular platform shell composing production intelligence, M&A, design studio and reporting modules; interactive 3D machine model with a RAG agent grounded on filtered CAD component data; load-tested | Next.js, React, TypeScript, Supabase, three.js, OpenAI, Mistral, AWS S3, Playwright, k6 |

### Work — KPMG Italy (Oct 2024 – Oct 2025)

| Project | Tech |
| --- | --- |
| Cashflow visualization — frontend tool to visualise company cashflow across the year with filtering and transaction drill-down | React, TypeScript |

### Personal

| Project | When | Tech |
| --- | --- | --- |
| Anki uploader — CLI that generates AI-enhanced flashcards into custom Anki decks; built to apply a Spring Boot course | Aug 2025 – Jan 2026 | Java, Spring Boot, Spring AI, OpenAI, SQLite, Gradle |
| Drone simulator | Aug 2025 | C++, GLSL |
| Smoky — Android app deployed at a local restaurant: menu, orders, payments | Jul 2020 – Apr 2021 | Kotlin, Firebase |

### Research

| Project | When | Tech |
| --- | --- | --- |
| Graph neural networks for chemistry at Fujitsu — adapted GNN models to a chemistry problem, investigated pre-training hyperparameter influence on fine-tuning accuracy, presented at a research workshop | Jan – Aug 2024 | Python, PyTorch Geometric |
| M.Sc. thesis — state-of-the-art analysis of GPU computing with Rust | 2023 | Rust |

### Academic

| Project | When | Tech |
| --- | --- | --- |
| IACV MultiDendroCut — optimal multi-level dendrogram cut for agglomerative-clustering segmentation | 2023 | MATLAB |
| Computer graphics exercises | 2022 | C++, GLSL |
| SeaDronesSee — maritime object detection | 2022 | Python |
| DB2 course project | 2022 | Java, SQL |
| ImageEqualizer — hardware image equaliser | 2021 | VHDL |
| Agile software engineering group project | 2020 | Java |

## Open items for the user

1. **Confidentiality review — required before publishing.** The three Backwell projects
   and the KPMG cashflow tool are employer work. The descriptions above are written at
   capability level and name no clients, but Daniele must confirm each is shareable.
   Two internal client/partner names were encountered while surveying those repos and
   are deliberately excluded from this document as well as from the site. They must
   stay excluded — this file is published in a public repository.
2. **Repo READMEs.** The site links to `github.com/locadani`, so recruiters will look.
   Several public repos have no description and bare READMEs. Worth a pass; out of scope
   for this spec.
3. **Academic project details.** Technology tags for every public repo were read from
   GitHub's language stats and build files, so they are accurate. **Dates** are a
   different matter — they are inferred from repo creation timestamps and course years,
   and several are approximate. Correct any that matter.
4. **Summaries for four entries are thin**, because the repos carry no description and
   little README: drone simulator, computer graphics exercises, the DB2 project, and the
   Agile software engineering group project. The Anki repo's README is literally one
   line. A sentence each from Daniele would improve these more than anything else in
   this spec.

## Revisions

### 2026-08-18 — merged the two sections into one aligned timeline

Superseded the original "projects-only timeline, separate Experience block" decision at
Daniele's request: *"I want the career and projects info on two columns and the timeline
to match, so people can see what I did when."*

What changed:

- `Experience.astro` deleted; roles and projects now render from one component over a
  shared grid.
- Added `src/lib/timeline.ts` — pure row assignment, 10 unit tests.
- Filter chips grouped by category, fixing the eleven-row chip block on mobile.
- Page containers widened from `max-w-3xl` to `max-w-5xl` to hold two columns, with hero
  prose still constrained for readability.

What did not change: content, schemas, the technology registry, filter semantics, the
build-time guards, and the decision to keep contact to LinkedIn and GitHub only.
