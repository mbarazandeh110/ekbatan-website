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
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/blog/category/') &&
        !page.includes('/services/category/') &&
        !page.includes('/404'),
      serialize(item) {
        if (item.url === 'https://ekbatan.tech/') {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else if (item.url.includes('/services/') || item.url.includes('/assessment/')) {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (item.url.includes('/experience/') || item.url.includes('/blog/')) {
          item.changefreq = 'weekly';
          item.priority = 0.8;
        } else {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});