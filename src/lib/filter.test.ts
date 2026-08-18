import { describe, expect, it } from 'vitest';
import {
  chipsFor,
  groupChips,
  matches,
  parseTechParam,
  serializeTechParam,
  type Filterable,
} from './filter';

const entry = (id: string, tech: string[]): Filterable => ({ id, tech });

const ENTRIES: Filterable[] = [
  entry('mailsense', ['csharp', 'dotnet', 'postgresql']),
  entry('customer-intelligence', ['nextjs', 'react', 'typescript', 'postgresql']),
  entry('cashflow', ['react', 'typescript']),
  entry('smoky', ['kotlin', 'firebase']),
];

describe('matches', () => {
  it('matches everything when nothing is selected', () => {
    // An empty filter is "no filter" — not "no results".
    for (const e of ENTRIES) {
      expect(matches(e, new Set())).toBe(true);
    }
  });

  it('matches an entry carrying the selected technology', () => {
    expect(matches(entry('a', ['react']), new Set(['react']))).toBe(true);
  });

  it('rejects an entry without the selected technology', () => {
    expect(matches(entry('a', ['kotlin']), new Set(['react']))).toBe(false);
  });

  it('uses OR across selections, not AND', () => {
    // A recruiter picking two stacks wants either, not the intersection —
    // AND would return empty for most pairs and read as a broken filter.
    const selected = new Set(['react', 'kotlin']);
    expect(ENTRIES.filter((e) => matches(e, selected)).map((e) => e.id)).toEqual([
      'customer-intelligence',
      'cashflow',
      'smoky',
    ]);
  });

  it('matches an entry on any one of its many technologies', () => {
    const e = entry('multi', ['nextjs', 'react', 'typescript', 'postgresql']);
    for (const slug of ['nextjs', 'react', 'typescript', 'postgresql']) {
      expect(matches(e, new Set([slug]))).toBe(true);
    }
  });

  it('ignores a selected technology that no entry uses', () => {
    expect(matches(entry('a', ['react']), new Set(['vhdl']))).toBe(false);
  });

  it('treats an entry with no technologies as non-matching once filtering', () => {
    expect(matches(entry('bare', []), new Set(['react']))).toBe(false);
    expect(matches(entry('bare', []), new Set())).toBe(true);
  });
});

describe('chipsFor', () => {
  it('returns the union of technologies actually in use', () => {
    expect(new Set(chipsFor(ENTRIES).map((c) => c.slug))).toEqual(
      new Set([
        'csharp',
        'dotnet',
        'postgresql',
        'nextjs',
        'react',
        'typescript',
        'kotlin',
        'firebase',
      ]),
    );
  });

  it('counts how many entries use each technology', () => {
    const counts = Object.fromEntries(chipsFor(ENTRIES).map((c) => [c.slug, c.count]));
    expect(counts.react).toBe(2);
    expect(counts.postgresql).toBe(2);
    expect(counts.kotlin).toBe(1);
  });

  it('orders by descending count, then alphabetically, so builds are stable', () => {
    const chips = chipsFor(ENTRIES);
    expect(chips.slice(0, 3).map((c) => c.slug)).toEqual([
      'postgresql',
      'react',
      'typescript',
    ]);
    expect(chipsFor([...ENTRIES].reverse()).map((c) => c.slug)).toEqual(
      chips.map((c) => c.slug),
    );
  });

  it('returns nothing for no entries', () => {
    expect(chipsFor([])).toEqual([]);
  });
});

describe('URL parameter round-trip', () => {
  it('parses a comma-separated list', () => {
    expect(parseTechParam('react,python')).toEqual(new Set(['react', 'python']));
  });

  it('survives a round-trip in a stable order', () => {
    const selected = new Set(['react', 'csharp', 'python']);
    expect(parseTechParam(serializeTechParam(selected))).toEqual(selected);
    // Sorted output keeps a shared link byte-identical between visits.
    expect(serializeTechParam(selected)).toBe('csharp,python,react');
  });

  it('serializes an empty selection to null so the param can be dropped', () => {
    expect(serializeTechParam(new Set())).toBeNull();
  });

  it('tolerates junk: empty, blank, missing, and duplicated values', () => {
    expect(parseTechParam(null)).toEqual(new Set());
    expect(parseTechParam('')).toEqual(new Set());
    expect(parseTechParam(',,')).toEqual(new Set());
    expect(parseTechParam(' react , react ,,python ')).toEqual(
      new Set(['react', 'python']),
    );
  });

  it('drops values that are not known technologies', () => {
    // A hand-edited or stale URL must not create a chip that filters nothing out.
    expect(parseTechParam('react,notathing')).toEqual(new Set(['react']));
  });
});

describe('groupChips', () => {
  const chips = chipsFor([
    entry('a', ['typescript', 'react', 'postgresql', 'docker', 'openai', 'vitest']),
    entry('b', ['python', 'react']),
  ]);

  it('splits chips into labelled groups in a fixed order', () => {
    expect(groupChips(chips).map((g) => g.label)).toEqual([
      'Languages',
      'Frameworks',
      'Data',
      'Infrastructure',
      'AI',
      'Tooling',
    ]);
  });

  it('puts each chip in exactly one group', () => {
    const grouped = groupChips(chips).flatMap((g) => g.chips.map((c) => c.slug));
    expect(grouped.sort()).toEqual(chips.map((c) => c.slug).sort());
  });

  it('drops empty groups rather than rendering an empty heading', () => {
    const only = chipsFor([entry('a', ['typescript'])]);
    expect(groupChips(only).map((g) => g.label)).toEqual(['Languages']);
  });

  it('keeps the frequency order inside a group', () => {
    const grouped = groupChips(chips).find((g) => g.label === 'Frameworks')!;
    expect(grouped.chips[0].slug).toBe('react');
  });

  it('returns nothing for no chips', () => {
    expect(groupChips([])).toEqual([]);
  });
});
