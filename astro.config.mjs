// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap"; // Импорт

export default defineConfig({
  site: 'https://wislastay.org', // ЗАМЕНИ на свой реальный домен
  
  integrations: [sitemap()], // Добавление интеграции

  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  
  compressHTML: true,
  
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
      },
    },
  },
});