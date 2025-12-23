import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './public/images/';
const outputDir = './public/images_optimized/'; // Новая временная папка

// Создаем временную папку, если её нет
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.webp'));

console.log(`Найдено ${files.length} файлов. Начинаю сжатие в новую папку...`);

async function compress() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      await sharp(inputPath)
        .webp({ 
          quality: 60, 
          effort: 6,
          smartSubsample: true 
        })
        .toFile(outputPath);
      
      console.log(`✅ ${file} готов`);
    } catch (err) {
      console.error(`❌ Ошибка в файле ${file}:`, err.message);
    }
  }

  console.log('\n--- Сжатие завершено! ---');
  console.log('Теперь сделай следующее:');
  console.log('1. Удали вручную старую папку public/images/');
  console.log('2. Переименуй public/images_optimized/ в public/images/');
}

compress();