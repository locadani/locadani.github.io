/** Everything about the person, in one place. */
export const site = {
  name: 'Daniele Locatelli',
  role: 'Full-stack engineer',
  location: 'Berlin, Germany',
  /** The line that gets scanned first, so it names the role outright. */
  tagline:
    'Full-stack and DevOps engineer in Berlin, shipping products end to end, from code to deployment.',
  intro:
    "Bachelor's and master's at Politecnico di Milano, then researcher at Fujitsu in Japan. Since then full-stack engineer at KPMG in Milan and now at Backwell in Berlin. Rust developer in my free time.",
  languages: [
    { name: 'Italian', level: 'Native' },
    { name: 'English', level: 'C1' },
    { name: 'German', level: 'B1' },
    { name: 'Turkish', level: 'A2' },
  ],
  links: {
    github: 'https://github.com/locadani',
    linkedin: 'https://www.linkedin.com/in/daniele-locatelli-34a5b2119',
    source: 'https://github.com/locadani/locadani.github.io',
  },
} as const;
