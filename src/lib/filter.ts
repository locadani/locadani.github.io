/**
 * Timeline filter logic.
 *
 * Pure and DOM-free on purpose: this is the only real logic on the site, so it
 * lives where it can be unit-tested without a browser. The client script is a
 * thin shell that reads checkbox state, calls into here, and writes attributes.
 */

import { TECH, techName, type TechCategory, type TechSlug } from '../data/tech';

/** The minimum an entry needs to be filterable. */
export interface Filterable {
  readonly id: string;
  readonly tech: readonly string[];
}

export interface Chip {
  readonly slug: TechSlug;
  readonly name: string;
  /** How many entries use it — drives chip order. */
  readonly count: number;
}

function isTechSlug(value: string): value is TechSlug {
  return Object.hasOwn(TECH, value);
}

/**
 * OR semantics: an entry matches if it uses *any* selected technology.
 *
 * AND was considered and rejected — most pairs of technologies never co-occur in
 * one project, so an AND filter would return empty sets and read as broken.
 *
 * An empty selection means "no filter", so everything matches.
 */
export function matches(entry: Filterable, selected: ReadonlySet<string>): boolean {
  if (selected.size === 0) return true;
  return entry.tech.some((slug) => selected.has(slug));
}

/**
 * The chip list, derived from the technologies actually in use rather than
 * authored by hand — so adding a project with a new technology makes its chip
 * appear with no second list to maintain.
 *
 * Ordered by descending usage, then alphabetically. The tie-break matters: it
 * keeps chip order identical between builds regardless of file-read order.
 */
export function chipsFor(entries: readonly Filterable[]): Chip[] {
  const counts = new Map<TechSlug, number>();
  for (const entry of entries) {
    for (const slug of entry.tech) {
      if (!isTechSlug(slug)) continue;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, name: techName(slug), count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

/**
 * Read a selection from `?tech=react,python`.
 *
 * Forgiving by design — a URL is user-editable and may be stale, so blanks,
 * duplicates and unknown slugs are dropped rather than producing a chip that
 * filters nothing out.
 *
 * Returns `Set<string>` rather than `Set<TechSlug>` deliberately: every caller
 * tests membership against arbitrary strings read out of the DOM, so the
 * narrower type would only force casts at each call site. Validity is a runtime
 * guarantee here, enforced by the `isTechSlug` filter below.
 */
export function parseTechParam(param: string | null | undefined): Set<string> {
  if (!param) return new Set();
  return new Set(
    param
      .split(',')
      .map((part) => part.trim())
      .filter(isTechSlug),
  );
}

/**
 * Serialize a selection for the URL, or `null` when empty so the caller can drop
 * the parameter entirely. Sorted, so a link shared twice is byte-identical.
 */
export function serializeTechParam(selected: ReadonlySet<string>): string | null {
  if (selected.size === 0) return null;
  return [...selected].sort().join(',');
}

/** Display order and labels for the chip groups. */
const CATEGORY_ORDER: readonly { category: TechCategory; label: string }[] = [
  { category: 'language', label: 'Languages' },
  { category: 'framework', label: 'Frameworks' },
  { category: 'data', label: 'Data' },
  { category: 'infra', label: 'Infrastructure' },
  { category: 'ai', label: 'AI' },
  { category: 'tooling', label: 'Tooling' },
];

export interface ChipGroup {
  readonly category: TechCategory;
  readonly label: string;
  readonly chips: readonly Chip[];
}

/**
 * Group chips by kind, so a reader looking for a language scans one short row
 * instead of a wall of forty-odd pills. Groups with nothing in them are dropped
 * rather than rendered as empty headings.
 */
export function groupChips(chips: readonly Chip[]): ChipGroup[] {
  return CATEGORY_ORDER.flatMap(({ category, label }) => {
    const inGroup = chips.filter((chip) => TECH[chip.slug].category === category);
    return inGroup.length === 0 ? [] : [{ category, label, chips: inGroup }];
  });
}
