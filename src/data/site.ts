/** Everything about the person, in one place. */
export const site = {
  name: 'Daniele Locatelli',
  role: 'Full-stack engineer',
  location: 'Berlin, Germany',
  /** The line that gets scanned first, so it names the stack outright. */
  tagline:
    'Full-stack engineer in Berlin, building AI-powered products in TypeScript, C# and Python.',
  intro:
    'I build and ship production software end to end, from PostgreSQL schemas and .NET services to the React front ends on top of them. Before that I built React and Python apps at KPMG in Milan, researched graph neural networks at Fujitsu in Japan, and studied computer science and engineering at Politecnico di Milano. Outside work I enjoy building in Rust, a language I started learning at university.',
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
