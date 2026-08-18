import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
import { TECH_SLUGS } from './data/tech';

/**
 * A month, `YYYY-MM`. Strict on purpose: every date is then directly comparable
 * as a string, so sorting needs no parsing, and a typo cannot quietly place an
 * entry at an arbitrary point in the timeline.
 */
const month = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'expected a YYYY-MM month, e.g. 2025-11');

const tech = z
  .array(z.enum(TECH_SLUGS))
  .nonempty('list at least one technology')
  .describe('slugs from src/data/tech.ts — an unknown slug fails the build');

/** `end` absent means ongoing. */
const endNotBeforeStart = (v: { start: string; end?: string }) =>
  v.end === undefined || v.end >= v.start;
const endNotBeforeStartError = {
  message: 'end must not be earlier than start',
  path: ['end'],
};

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z
    .object({
      role: z.string(),
      org: z.string(),
      location: z.string(),
      start: month,
      end: month.optional(),
      tech,
      /** Education entries render with lighter emphasis than roles. */
      kind: z.enum(['role', 'education']).default('role'),
    })
    .refine(endNotBeforeStart, endNotBeforeStartError),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z
    .object({
      title: z.string(),
      /** Drives prominence: work and personal lead, the rest fill out the years. */
      context: z.enum(['work', 'personal', 'research', 'academic']),
      org: z.string().optional(),
      summary: z.string(),
      start: month,
      end: month.optional(),
      tech,
      repo: z.url().optional(),
    })
    .refine(endNotBeforeStart, endNotBeforeStartError),
});

export const collections = { experience, projects };
