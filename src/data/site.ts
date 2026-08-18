/** Everything about the person, in one place. */
export const site = {
  name: 'Daniele Locatelli',
  role: 'Full-stack engineer',
  location: 'Berlin, Germany',
  /** The line that gets scanned first, so it names the stack outright. */
  tagline:
    'Full-stack engineer in Berlin, building multi-tenant products in Next.js, C# and Python.',
  intro:
    'I build and ship production software end to end — from PostgreSQL schemas and .NET services to the React front ends on top of them. Previously a neural-network researcher in Japan, and before that a computer science engineer at Politecnico di Milano.',
  languages: [
    { name: 'Italian', level: 'Native' },
    { name: 'English', level: 'C1' },
    { name: 'German', level: 'B1' },
  ],
  links: {
    github: 'https://github.com/locadani',
    linkedin: 'https://www.linkedin.com/in/daniele-locatelli-34a5b2119',
    source: 'https://github.com/locadani/locadani.github.io',
  },
} as const;
