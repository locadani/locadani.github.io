// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // User site (locadani.github.io) is served from the domain root.
  // Do NOT set `base` here — that is only for project sites, and setting it
  // is the usual cause of broken asset paths on a user site.
  site: 'https://locadani.github.io',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
