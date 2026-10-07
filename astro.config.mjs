// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ekbatan.tech',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [sitemap({
    changefreq: 'weekly',
    priority: 0.8
  })],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});