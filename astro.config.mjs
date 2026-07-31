// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project site → served under /vista-estate
export default defineConfig({
  site: 'https://soroush83faraz.github.io',
  base: '/vista-estate',
  vite: {
    plugins: [tailwindcss()],
  },
});
