/** Date presentation. Content stores `YYYY-MM`; readers see "Nov 2025". */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** `end` absent means ongoing. */
export function formatRange(start: string, end?: string): string {
  if (!end) return `${formatMonth(start)} — present`;
  if (start === end) return formatMonth(start);
  const [startYear] = start.split('-');
  const [endYear] = end.split('-');
  // Same year reads better without repeating it: "Oct – Dec 2024".
  if (startYear === endYear) {
    const [, startMonth] = start.split('-');
    return `${MONTHS[Number(startMonth) - 1]} – ${formatMonth(end)}`;
  }
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

export function year(value: string): string {
  return value.split('-')[0];
}
