import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// --- НАСТРОЙКИ ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = __dirname; 

// Настройки стабильности
const MAX_RETRIES = 3;       // Количество попыток на одну картинку
const TIMEOUT_MS = 60000;    // Таймаут запроса (60 сек)

// --- ЗАДАЧИ ГЕНЕРАЦИИ (ПОЛНЫЙ СПИСОК) ---
const tasks = [
 // --- 12. EXPERIENCES (DOŚWIADCZENIA) ---
 {
    filename: "public/images/club-roulette.webp",
    prompt: "Luxury wooden roulette wheel in motion, golden ball spinning, dark moody lighting, elegant casino atmosphere, macro architectural shot --ar 4:3"
  },
  {
    filename: "public/images/club-slots.webp",
    prompt: "Modern high-end slot machines in a dark luxury lounge, glowing neon accents, blur background, sophisticated gaming room, 8k --ar 4:3"
  },
  {
    filename: "public/images/club-cards.webp",
    prompt: "Close up of playing cards and luxury chips on green felt poker table, glass of whiskey nearby, cinematic lighting, boutique hotel style --ar 4:3"
  }
];

// --- УТИЛИТЫ ---

async function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    console.log(` 📁 Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch с таймаутом (AbortController)
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Функция с логикой повторных попыток
async function downloadAndConvertImage(prompt, filepath) {
  let attempt = 1;

  while (attempt <= MAX_RETRIES) {
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&seed=${seed}&nologo=true`;

      if (attempt > 1) {
          console.log(`   🔄 Retry ${attempt}/${MAX_RETRIES}...`);
      } else {
          console.log(`   🔗 Fetching...`);
      }

      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await sharp(buffer)
        .webp({ quality: 95 })
        .toFile(filepath);

      return; // Успех, выходим из функции

    } catch (error) {
      console.error(`   ❌ Error (Attempt ${attempt}):`, error.message);
      
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Failed to generate after ${MAX_RETRIES} attempts.`);
      }

      // Пауза перед следующей попыткой (нарастающая: 3сек, 6сек...)
      const waitTime = attempt * 3000;
      console.log(`   ⏳ Waiting ${waitTime/1000}s before retry...`);
      await sleep(waitTime);
      
      attempt++;
    }
  }
}

// --- ОСНОВНАЯ ФУНКЦИЯ ---

async function pollinate() {
  console.log('🌱 Starting Pollination Process...');
  console.log(`📂 Project Root: ${PROJECT_ROOT}`);
  
  for (const [index, task] of tasks.entries()) {
    const fullPath = path.join(PROJECT_ROOT, task.filename);

    await ensureDirectoryExists(fullPath);

    if (fs.existsSync(fullPath)) {
      console.log(`[${index + 1}/${tasks.length}] ⏭️  Skipping (exists): ${task.filename}`);
      continue;
    }

    console.log(`[${index + 1}/${tasks.length}] 🎨 Generating: ${task.filename}`);

    try {
      await downloadAndConvertImage(task.prompt, fullPath);
      console.log(`   ✅ Saved!`);
      
      // Случайная пауза между успешными загрузками (3-6 секунд)
      const randomDelay = Math.floor(Math.random() * 3000) + 3000;
      console.log(`   💤 Sleeping ${randomDelay/1000}s...`);
      await sleep(randomDelay);

    } catch (error) {
      console.error(`   💀 FATAL: Could not generate ${task.filename}`);
    }
  }

  console.log('🌺 Pollination Complete!');
}

pollinate();