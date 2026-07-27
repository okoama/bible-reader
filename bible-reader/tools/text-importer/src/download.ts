import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = join(import.meta.dirname, '..', 'input');

const SOURCES: Array<{ url: string; file: string }> = [
  { url: 'https://raw.githubusercontent.com/aseemsavio/catholicism-in-json/main/catechism.json', file: 'catechism.json' },
  { url: 'https://raw.githubusercontent.com/Jacob-Gray/summa.json/master/json/ALL.json', file: 'summa-all.json' },
  { url: 'https://www.gutenberg.org/cache/epub/3296/pg3296.txt', file: 'confessions.txt' },
  { url: 'https://www.gutenberg.org/cache/epub/1653/pg1653.txt', file: 'imitation.txt' },
  { url: 'https://www.ccel.org/ccel/d/desales/devout_life/cache/devout_life.txt', file: 'devout-life.txt' },
];

async function download() {
  for (const { url, file } of SOURCES) {
    console.log(`Downloading ${file}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  FAILED: ${res.status} ${res.statusText}`);
      continue;
    }
    const text = await res.text();
    writeFileSync(join(INPUT_DIR, file), text, 'utf-8');
    console.log(`  Saved ${file} (${(text.length / 1024).toFixed(0)} KB)`);
  }
}

await download();
