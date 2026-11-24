// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const buildDate = new Date().toISOString();

export default defineConfig({
  site: 'https://ekbatan.tech',
  trailingSlash: 'always',
  redirects: {
    '/blog/numa-domain-kubernetes': '/blog/nginx-numa-kernel-vod/',
  },
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/blog/category/') &&
        !page.includes('/services/category/') &&
        !page.includes('/blog/numa-domain-kubernetes') &&
        !page.includes('/404'),
      serialize(item) {
        item.lastmod = buildDate;

        if (item.url === 'https://ekbatan.tech/') {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else if (item.url.includes('/services/') || item.url.includes('/assessment/')) {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (
          item.url.includes('/enterprise/') ||
          item.url.includes('/experience/') ||
          item.url.includes('/blog/')
        ) {
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