/**
 * Row assignment for the merged two-column timeline.
 *
 * The layout has to answer one question at a glance: which job was I in when I
 * built this? So both columns share a single set of grid rows. Projects each
 * take one row on the right; a role becomes a bar on the left that spans every
 * row its date range covers, which is what makes "this project happened inside
 * that job" true geometrically rather than just stated in text.
 *
 * Rows are content-sized rather than proportional to elapsed time. A strictly
 * proportional axis would spend most of its height on the quiet years and
 * squeeze the recent, dense ones — the opposite of what a reader needs.
 *
 * Pure and DOM-free, so the alignment rules are unit-tested rather than
 * eyeballed in a browser.
 */

export interface RoleInput {
  readonly id: string;
  readonly start: string;
  /** Absent means ongoing. */
  readonly end?: string;
}

export interface ProjectInput {
  readonly id: string;
  readonly start: string;
}

export interface PlacedProject {
  readonly id: string;
  /** 1-indexed CSS grid row. */
  readonly row: number;
}

export interface PlacedRole {
  readonly id: string;
  /** 1-indexed CSS grid line the bar starts on. */
  readonly rowStart: number;
  /** Grid line the bar ends on: exclusive, so `rowEnd - rowStart` rows are covered. */
  readonly rowEnd: number;
}

export interface TimelineLayout {
  readonly projects: readonly PlacedProject[];
  readonly roles: readonly PlacedRole[];
  readonly yearMarkers: readonly { year: string; row: number }[];
  readonly rowCount: number;
}

/** A row on the shared axis. `project` is absent for rows that only anchor a role. */
interface Slot {
  readonly date: string;
  readonly project?: string;
}

/** `YYYY-MM` strings compare correctly as strings, which is why the schema demands them. */
const NEWEST_FIRST = (a: string, b: string) => b.localeCompare(a);

/**
 * Was this role held at that date? Exported because the filtered view hides the
 * role bars, so each surviving project card has to state its own context — and
 * that context is exactly "which role covered this project's date".
 */
export function roleCovers(role: RoleInput, date: string): boolean {
  if (date < role.start) return false;
  return role.end === undefined || date <= role.end;
}

const covers = roleCovers;

export function layoutTimeline(
  roles: readonly RoleInput[],
  projects: readonly ProjectInput[],
): TimelineLayout {
  // One slot per project, newest first. Ties broken by id so the result does not
  // depend on the order the content files happened to be read in.
  const slots: Slot[] = [...projects]
    .sort((a, b) => NEWEST_FIRST(a.start, b.start) || a.id.localeCompare(b.id))
    .map((p) => ({ date: p.start, project: p.id }));

  // A role whose range contains no project would otherwise have nothing to span.
  // That is not an edge case to shrug at — it happens the moment a new job is
  // added before any of its projects. Give it an anchor row of its own, inserted
  // in date order so it still lands in the right place chronologically.
  const uncovered = [...roles]
    .filter((role) => !slots.some((slot) => covers(role, slot.date)))
    .sort((a, b) => NEWEST_FIRST(a.start, b.start) || a.id.localeCompare(b.id));

  for (const role of uncovered) {
    const at = slots.findIndex((slot) => slot.date < role.start);
    const anchor: Slot = { date: role.start };
    if (at === -1) slots.push(anchor);
    else slots.splice(at, 0, anchor);
  }

  const placedProjects: PlacedProject[] = [];
  slots.forEach((slot, index) => {
    if (slot.project !== undefined) {
      placedProjects.push({ id: slot.project, row: index + 1 });
    }
  });

  const placedRoles: PlacedRole[] = [...roles]
    .sort((a, b) => NEWEST_FIRST(a.start, b.start) || a.id.localeCompare(b.id))
    .map((role) => {
      const rows = slots
        .map((slot, index) => (covers(role, slot.date) ? index + 1 : -1))
        .filter((row) => row > 0);
      // `uncovered` above guarantees rows is non-empty for every role.
      const first = Math.min(...rows);
      const last = Math.max(...rows);
      return { id: role.id, rowStart: first, rowEnd: last + 1 };
    });

  const yearMarkers: { year: string; row: number }[] = [];
  let previous: string | null = null;
  slots.forEach((slot, index) => {
    const year = slot.date.slice(0, 4);
    if (year !== previous) {
      yearMarkers.push({ year, row: index + 1 });
      previous = year;
    }
  });

  return {
    projects: placedProjects,
    roles: placedRoles,
    yearMarkers,
    rowCount: slots.length,
  };
}
