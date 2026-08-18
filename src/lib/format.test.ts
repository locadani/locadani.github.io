import { describe, expect, it } from 'vitest';
import { formatMonth, formatRange, year } from './format';

describe('formatMonth', () => {
  it('renders a month and year', () => {
    expect(formatMonth('2025-11')).toBe('Nov 2025');
    expect(formatMonth('2024-01')).toBe('Jan 2024');
    expect(formatMonth('2022-12')).toBe('Dec 2022');
  });
});

describe('formatRange', () => {
  it('marks a missing end as ongoing', () => {
    expect(formatRange('2025-11')).toBe('Nov 2025 — present');
  });

  it('collapses a single month', () => {
    expect(formatRange('2022-06', '2022-06')).toBe('Jun 2022');
  });

  it('does not repeat a shared year', () => {
    expect(formatRange('2024-10', '2024-12')).toBe('Oct – Dec 2024');
  });

  it('spells out both ends across years', () => {
    expect(formatRange('2024-10', '2025-01')).toBe('Oct 2024 – Jan 2025');
  });
});

describe('year', () => {
  it('extracts the year', () => {
    expect(year('2025-11')).toBe('2025');
  });
});
