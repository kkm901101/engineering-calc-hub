import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://engineering-calc-hub-seven.vercel.app',
  integrations: [tailwind(), sitemap()],
});
