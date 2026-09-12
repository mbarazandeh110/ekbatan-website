// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
// import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://ekbatan.tech',
  // integrations: [tailwind()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
