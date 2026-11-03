import { describe, expect, it } from 'vitest';
import { overlaps, roleTech, type DatedTech } from './roleTech';

const role = (start: string, end: string | undefined, tech: string[]): DatedTech => ({ start, end, tech });
const project = role;

const slugs = (groups: ReturnType<typeof roleTech>) => groups.flatMap((g) => g.chips.map((c) => c.slug));

describe('overlaps', () => {
  const job = { start: '2024-10', end: '2025-10' };

  it('includes a project that starts during the role', () => {
    expect(overlaps(job, { start: '2025-02', end: '2025-10' })).toBe(true);
  });

  it('includes a project that started before and ran into the role', () => {
    expect(overlaps(job, { start: '2024-06', end: '2024-11' })).toBe(true);
  });

  it('includes a project that started during and outlived the role', () => {
    // Anki uploader (Aug 2025 – Jan 2026) belongs to both KPMG and Backwell.
    expect(overlaps(job, { start: '2025-08', end: '2026-01' })).toBe(true);
    expect(overlaps({ start: '2025-11' }, { start: '2025-08', end: '2026-01' })).toBe(true);
  });

  it('treats a project without an end as a single month', () => {
    expect(overlaps(job, { start: '2024-09' })).toBe(false);
    expect(overlaps(job, { start: '2024-10' })).toBe(true);
  });

  it('treats a role without an end as ongoing', () => {
    expect(overlaps({ start: '2025-11' }, { start: '2030-01' })).toBe(true);
  });

  it('excludes projects entirely outside the role', () => {
    expect(overlaps(job, { start: '2023-01', end: '2024-09' })).toBe(false);
    expect(overlaps(job, { start: '2025-11' })).toBe(false);
  });
});

describe('roleTech', () => {
  it('combines the role with every overlapping project, and nothing else', () => {
    const groups = roleTech(role('2024-10', '2025-10', ['python']), [
      project('2025-02', '2025-10', ['react']),
      project('2023-01', '2023-06', ['rust']),
    ]);
    expect(slugs(groups).sort()).toEqual(['python', 'react']);
  });

  it('orders by usage within each group', () => {
    const groups = roleTech(role('2025-11', undefined, ['typescript']), [
      project('2025-12', undefined, ['python', 'typescript']),
      project('2026-01', undefined, ['python', 'typescript']),
      project('2026-02', undefined, ['rust']),
    ]);
    const languages = groups.find((g) => g.category === 'language')!;
    expect(languages.chips.map((c) => [c.slug, c.count])).toEqual([
      ['typescript', 3],
      ['python', 2],
      ['rust', 1],
    ]);
  });

  it("breaks a tie in favour of the role's own technologies", () => {
    // Both used twice; alphabetically Rust would come first.
    const groups = roleTech(role('2025-11', undefined, ['typescript']), [
      project('2025-12', undefined, ['typescript']),
      project('2026-01', undefined, ['rust']),
      project('2026-02', undefined, ['rust']),
    ]);
    expect(slugs(groups)).toEqual(['typescript', 'rust']);
  });

  it('drops empty groups and counts a technology once per entry', () => {
    const groups = roleTech(role('2024-01', '2024-08', ['python', 'python']), []);
    expect(groups.map((g) => g.category)).toEqual(['language']);
    expect(groups[0].chips[0].count).toBe(1);
  });
});
