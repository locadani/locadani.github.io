/**
 * Canonical technology registry.
 *
 * Every `tech` value in every content file is validated against these slugs at
 * build time, and the timeline's filter chips are derived from the slugs actually
 * in use. One registry is what stops `React` / `react` / `ReactJS` drifting into
 * the content and splintering the filter into near-duplicate chips that each
 * match a different subset of the work.
 *
 * Technologies only. Topics and domains — computer vision, GPU computing,
 * multi-tenancy — belong in an entry's prose, not here: a chip reading
 * "computer vision" would filter on subject matter rather than on skill.
 */

export type TechCategory =
  | 'language'
  | 'framework'
  | 'data'
  | 'infra'
  | 'ai'
  | 'tooling';

export interface TechMeta {
  /** Display name, exactly as it should appear on a chip. */
  readonly name: string;
  readonly category: TechCategory;
}

export const TECH = {
  // Languages
  typescript: { name: 'TypeScript', category: 'language' },
  javascript: { name: 'JavaScript', category: 'language' },
  python: { name: 'Python', category: 'language' },
  csharp: { name: 'C#', category: 'language' },
  java: { name: 'Java', category: 'language' },
  kotlin: { name: 'Kotlin', category: 'language' },
  cpp: { name: 'C++', category: 'language' },
  rust: { name: 'Rust', category: 'language' },
  matlab: { name: 'MATLAB', category: 'language' },
  vhdl: { name: 'VHDL', category: 'language' },
  glsl: { name: 'GLSL', category: 'language' },
  sql: { name: 'SQL', category: 'language' },

  // Frameworks and runtimes
  nextjs: { name: 'Next.js', category: 'framework' },
  react: { name: 'React', category: 'framework' },
  astro: { name: 'Astro', category: 'framework' },
  dotnet: { name: '.NET', category: 'framework' },
  'aspnet-core': { name: 'ASP.NET Core', category: 'framework' },
  'spring-boot': { name: 'Spring Boot', category: 'framework' },
  android: { name: 'Android', category: 'framework' },
  'java-ee': { name: 'Java EE', category: 'framework' },
  tailwind: { name: 'Tailwind CSS', category: 'framework' },
  threejs: { name: 'three.js', category: 'framework' },
  leaflet: { name: 'Leaflet', category: 'framework' },
  'tanstack-query': { name: 'TanStack Query', category: 'framework' },

  // Data stores
  postgresql: { name: 'PostgreSQL', category: 'data' },
  supabase: { name: 'Supabase', category: 'data' },
  mongodb: { name: 'MongoDB', category: 'data' },
  sqlite: { name: 'SQLite', category: 'data' },
  mysql: { name: 'MySQL', category: 'data' },
  firebase: { name: 'Firebase', category: 'data' },
  minio: { name: 'MinIO', category: 'data' },
  'aws-s3': { name: 'AWS S3', category: 'data' },

  // Infrastructure
  docker: { name: 'Docker', category: 'infra' },
  'github-actions': { name: 'GitHub Actions', category: 'infra' },
  railway: { name: 'Railway', category: 'infra' },
  azure: { name: 'Azure', category: 'infra' },
  bicep: { name: 'Bicep', category: 'infra' },
  stripe: { name: 'Stripe', category: 'infra' },
  'microsoft-graph': { name: 'Microsoft Graph', category: 'infra' },
  'entra-id': { name: 'Microsoft Entra ID', category: 'infra' },

  // AI and ML
  openai: { name: 'OpenAI', category: 'ai' },
  mistral: { name: 'Mistral', category: 'ai' },
  'spring-ai': { name: 'Spring AI', category: 'ai' },
  pytorch: { name: 'PyTorch', category: 'ai' },
  'pytorch-geometric': { name: 'PyTorch Geometric', category: 'ai' },
  rag: { name: 'RAG', category: 'ai' },

  // Tooling
  vitest: { name: 'Vitest', category: 'tooling' },
  playwright: { name: 'Playwright', category: 'tooling' },
  k6: { name: 'k6', category: 'tooling' },
  gradle: { name: 'Gradle', category: 'tooling' },
} as const satisfies Record<string, TechMeta>;

export type TechSlug = keyof typeof TECH;

/**
 * Non-empty tuple of every slug, for `z.enum()`. The tuple type is what makes an
 * unknown slug in a Markdown file a build failure rather than a dead filter chip.
 */
export const TECH_SLUGS = Object.keys(TECH) as [TechSlug, ...TechSlug[]];

export function techName(slug: TechSlug): string {
  return TECH[slug].name;
}

// `category` is carried on every entry but not yet rendered. It is the hook for
// grouping the filter chips by kind (languages, frameworks, data, …) if the flat
// list proves too long — see the note in the README.
