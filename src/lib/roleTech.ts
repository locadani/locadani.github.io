/**
 * The technology recap on a role card, derived rather than authored.
 *
 * A role's card sums up what was used while it was held: the role's own `tech`
 * plus every project whose dates overlap it. Adding a project is therefore
 * enough to update every role card it touches; there is no second list to keep
 * in step.
 *
 * Pure and DOM-free, like lib/filter.ts, so the overlap and ordering rules are
 * unit-tested rather than eyeballed.
 */

import { TECH, type TechSlug } from '../data/tech';
import { groupChips, type Chip, type ChipGroup } from './filter';

export interface DatedTech {
  readonly start: string;
  /** Absent: ongoing for a role, a single month for a project. */
  readonly end?: string;
  readonly tech: readonly string[];
}

function isTechSlug(value: string): value is TechSlug {
  return Object.hasOwn(TECH, value);
}

/**
 * Did the project run at any point while the role was held? A project without
 * an end is a one-off dated to its start month (that is how the timeline shows
 * it), so it overlaps only the role covering that month.
 */
export function overlaps(role: Omit<DatedTech, 'tech'>, project: Omit<DatedTech, 'tech'>): boolean {
  const projectEnd = project.end ?? project.start;
  return project.start <= (role.end ?? '9999-12') && projectEnd >= role.start;
}

/**
 * Count every technology across the role and its overlapping projects, and
 * group them by kind, most used first within each group.
 *
 * How many of them show is decided in the browser, not here: a folded card
 * shows whatever fits on each row's first line, which depends on the card's
 * width (see the script in Timeline.astro).
 *
 * Ties are common (many technologies appear once or twice), so the tie-break
 * decides what lands at the front of a row, where it is seen while folded. The
 * role's own technologies win a tie: they are what the job was about, and its
 * bullets name them. Without this, a framework from a weekend project could
 * push the job's main language to the end. Then alphabetical, so the order
 * never depends on file-read order.
 */
export function roleTech(role: DatedTech, projects: readonly DatedTech[]): ChipGroup[] {
  const own = new Set(role.tech);
  const counts = new Map<TechSlug, number>();
  for (const entry of [role, ...projects.filter((p) => overlaps(role, p))]) {
    for (const slug of new Set(entry.tech)) {
      if (!isTechSlug(slug)) continue;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  const ranked: Chip[] = [...counts.entries()]
    .map(([slug, count]) => ({ slug, name: TECH[slug].name, count }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        Number(own.has(b.slug)) - Number(own.has(a.slug)) ||
        a.slug.localeCompare(b.slug),
    );

  return groupChips(ranked);
}
