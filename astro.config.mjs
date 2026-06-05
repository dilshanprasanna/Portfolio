import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://dilshanprasanna.github.io',
  base: process.env.BASE_PATH || '/Portfolio',
  integrations: [react(), sitemap()],
  trailingSlash: 'ignore'
});