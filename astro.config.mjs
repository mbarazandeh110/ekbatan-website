// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/** @type {Map<string, string | undefined>} */
const gitDateCache = new Map();

/**
 * @param {string} filePath
 * @returns {string | undefined}
 */
function getGitLastMod(filePath) {
  if (!filePath || !existsSync(filePath)) return undefined;
  if (gitDateCache.has(filePath)) return gitDateCache.get(filePath);

  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    const result = out || undefined;
    gitDateCache.set(filePath, result);
    return result;
  } catch {
    gitDateCache.set(filePath, undefined);
    return undefined;
  }
}

/**
 * @param {string} pathname
 * @returns {string}
 */
function resolveSourceFile(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return 'src/pages/index.astro';
  if (clean === '/about') return 'src/pages/about.astro';
  if (clean === '/assessment') return 'src/pages/assessment.astro';
  if (clean === '/services') return 'src/pages/services/index.astro';
  if (clean === '/enterprise') return 'src/pages/enterprise/index.astro';
  if (clean === '/experience') return 'src/pages/experience/index.astro';
  if (clean === '/blog') return 'src/pages/blog/index.astro';

  if (clean.startsWith('/services/')) {
    return `src/content/services/${clean.slice('/services/'.length)}.md`;
  }
  if (clean.startsWith('/enterprise/')) {
    return `src/content/tools/${clean.slice('/enterprise/'.length)}.md`;
  }
  if (clean.startsWith('/experience/')) {
    return `src/content/experiences/${clean.slice('/experience/'.length)}.md`;
  }
  if (clean.startsWith('/blog/')) {
    return `src/content/blog/${clean.slice('/blog/'.length)}.md`;
  }
  return '';
}

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
        const pathname = new URL(item.url).pathname;
        const sourceFile = resolveSourceFile(pathname);
        const realLastMod = getGitLastMod(sourceFile);
        if (realLastMod) {
          item.lastmod = realLastMod;
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