import { describe, expect, it } from 'vitest';
import { layoutTimeline, roleCovers, type RoleInput, type ProjectInput } from './timeline';

const role = (id: string, start: string, end?: string): RoleInput => ({ id, start, end });
const project = (id: string, start: string): ProjectInput => ({ id, start });

describe('layoutTimeline', () => {
  it('gives every project its own row, newest first', () => {
    const layout = layoutTimeline([], [
      project('old', '2020-03'),
      project('new', '2026-05'),
      project('mid', '2024-01'),
    ]);
    expect(layout.projects.map((p) => [p.id, p.row])).toEqual([
      ['new', 1],
      ['mid', 2],
      ['old', 3],
    ]);
    expect(layout.rowCount).toBe(3);
  });

  it('gives projects starting in the same month separate rows', () => {
    // They must not collide: two grid items in one row would overlap.
    const layout = layoutTimeline([], [project('a', '2025-08'), project('b', '2025-08')]);
    expect(new Set(layout.projects.map((p) => p.row)).size).toBe(2);
  });

  it('spans a role bar across exactly the rows its dates cover', () => {
    const layout = layoutTimeline(
      [role('kpmg', '2024-10', '2025-10')],
      [
        project('after', '2026-05'), // row 1 — after the job
        project('during-late', '2025-08'), // row 2 — inside
        project('during-early', '2024-10'), // row 3 — inside, on the start month
        project('before', '2024-01'), // row 4 — before the job
      ],
    );
    const kpmg = layout.roles.find((r) => r.id === 'kpmg')!;
    // Rows 2–3 inclusive, expressed as CSS grid lines.
    expect(kpmg.rowStart).toBe(2);
    expect(kpmg.rowEnd).toBe(4);
  });

  it('runs an ongoing role from the newest row it covers down to its start', () => {
    const layout = layoutTimeline(
      [role('backwell', '2025-11')],
      [project('newest', '2026-05'), project('inside', '2025-12'), project('older', '2024-01')],
    );
    const bar = layout.roles[0];
    expect(bar.rowStart).toBe(1);
    expect(bar.rowEnd).toBe(3);
  });

  it('lets two overlapping roles both span their own rows', () => {
    const layout = layoutTimeline(
      [role('day-job', '2024-01', '2026-01'), role('side-role', '2025-01', '2025-06')],
      [project('p1', '2025-03'), project('p2', '2024-06')],
    );
    expect(layout.roles.find((r) => r.id === 'side-role')).toMatchObject({
      rowStart: 1,
      rowEnd: 2,
    });
    expect(layout.roles.find((r) => r.id === 'day-job')).toMatchObject({
      rowStart: 1,
      rowEnd: 3,
    });
  });

  it('gives a role with no projects yet its own row rather than breaking', () => {
    // This happens the moment a new job is added before any of its projects.
    const layout = layoutTimeline(
      [role('brand-new', '2026-07')],
      [project('older', '2024-01')],
    );
    const bar = layout.roles[0];
    expect(Number.isFinite(bar.rowStart)).toBe(true);
    expect(bar.rowEnd).toBeGreaterThan(bar.rowStart);
    expect(layout.rowCount).toBe(2);
    // Placed chronologically: 2026-07 is newer, so it takes the top row.
    expect(bar.rowStart).toBe(1);
    expect(layout.projects[0]).toMatchObject({ id: 'older', row: 2 });
  });

  it('places an empty role row in date order among the projects', () => {
    const layout = layoutTimeline(
      [role('gap', '2023-01', '2023-06')],
      [project('newer', '2025-01'), project('older', '2020-01')],
    );
    expect(layout.projects.map((p) => [p.id, p.row])).toEqual([
      ['newer', 1],
      ['older', 3],
    ]);
    expect(layout.roles[0]).toMatchObject({ rowStart: 2, rowEnd: 3 });
    expect(layout.rowCount).toBe(3);
  });

  it('marks the first row of each year, once', () => {
    const layout = layoutTimeline([], [
      project('a', '2026-05'),
      project('b', '2025-12'),
      project('c', '2025-01'),
      project('d', '2024-06'),
    ]);
    expect(layout.yearMarkers).toEqual([
      { year: '2026', row: 1 },
      { year: '2025', row: 2 },
      { year: '2024', row: 4 },
    ]);
  });

  it('handles no content at all', () => {
    const layout = layoutTimeline([], []);
    expect(layout).toMatchObject({ projects: [], roles: [], yearMarkers: [], rowCount: 0 });
  });

  it('is deterministic regardless of input order', () => {
    const roles = [role('a', '2024-01', '2025-01'), role('b', '2025-02')];
    const projects = [project('p1', '2025-06'), project('p2', '2024-06')];
    expect(layoutTimeline(roles, projects)).toEqual(
      layoutTimeline([...roles].reverse(), [...projects].reverse()),
    );
  });
});

describe('roleCovers', () => {
  const job = role('job', '2024-10', '2025-10');
  const ongoing = role('ongoing', '2025-11');

  it('includes the start and end months themselves', () => {
    expect(roleCovers(job, '2024-10')).toBe(true);
    expect(roleCovers(job, '2025-10')).toBe(true);
  });

  it('excludes dates outside the range', () => {
    expect(roleCovers(job, '2024-09')).toBe(false);
    expect(roleCovers(job, '2025-11')).toBe(false);
  });

  it('treats a missing end as still running', () => {
    expect(roleCovers(ongoing, '2099-01')).toBe(true);
    expect(roleCovers(ongoing, '2025-10')).toBe(false);
  });
});
