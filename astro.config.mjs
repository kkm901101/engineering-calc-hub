import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://engineering-calc-hub-seven.vercel.app',
  integrations: [tailwind()],
});
