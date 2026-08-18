# locadani.github.io

Personal site and portfolio — [locadani.github.io](https://locadani.github.io)

Built with [Astro](https://astro.build) and Tailwind CSS. Static output, no
client-side framework: the only JavaScript on the page is ~3.5 KB driving the
timeline's technology filter.

## Working on it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check, then a static build into dist/
npm test         # unit tests
npx playwright test   # filter interaction tests
```

## Adding a project or a job

Add one Markdown file. Nothing else needs touching — the timeline, the ordering
and the filter chips all follow from the content.

```
src/content/projects/my-thing.md
src/content/experience/my-job.md
```

```markdown
---
title: My thing
context: work # work | personal | research | academic
org: Some Company # optional
start: 2026-03 # YYYY-MM
end: 2026-07 # omit while ongoing
summary: One or two sentences, shown directly under the title.
tech: [nextjs, typescript, postgresql]
repo: https://github.com/locadani/my-thing # optional
---

Optional longer body in Markdown, shown under the summary.
```

Every `tech` slug must exist in [`src/data/tech.ts`](src/data/tech.ts). Adding a
technology means adding it there first — an unknown slug fails the build on
purpose, so a typo can never produce an entry the filter silently ignores.
Filter chips are derived from the slugs actually in use, so a new technology's
chip appears by itself.

Each technology also carries a `category` (language, framework, data, infra, ai,
tooling). Nothing renders it yet; it exists so the chips can be grouped by kind
if the flat list gets too long.

## Deploying

Pushing to `main` builds and publishes via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The repository's
Pages source must be set to **GitHub Actions** (Settings → Pages), not "Deploy
from a branch".

`astro.config.mjs` deliberately sets no `base`: this is a *user* site served from
the domain root, and setting `base` is the usual cause of broken asset paths here.

## Layout

```
src/
  content/
    experience/    one Markdown file per role or degree
    projects/      one Markdown file per project
  content.config.ts  Zod schemas — the build fails on bad content
  data/
    tech.ts        canonical technology registry
    site.ts        name, tagline, links, languages
  lib/
    filter.ts      filter logic: pure, DOM-free, unit-tested
    format.ts      date formatting
  components/      Hero, Experience, Timeline, FilterScript, Footer
  pages/index.astro
docs/superpowers/specs/   design documents
```

The design and the reasoning behind it are in
[`docs/superpowers/specs/2026-08-18-portfolio-design.md`](docs/superpowers/specs/2026-08-18-portfolio-design.md).
