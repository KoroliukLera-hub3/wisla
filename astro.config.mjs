// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Опции сборки
  build: {
    format: 'file', // Оптимизирует структуру файлов
    inlineStylesheets: 'always', // Помогает уменьшить количество лишних запросов
  },
  
  // Опции компрессии HTML
  compressHTML: true, // Это ГЛАВНЫЙ ПАРАМЕТР: он удаляет пробелы и HTML-комментарии при билде
  
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Удаление комментариев из JS и CSS файлов
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false, // Полностью удаляет комментарии из скомпилированного JS
        },
      },
    },
  },
});