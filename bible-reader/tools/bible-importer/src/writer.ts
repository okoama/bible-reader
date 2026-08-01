import * as fs from 'fs';
import * as path from 'path';
import type { BibleBook } from './models.js';

export function writeBooks(books: BibleBook[], outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  for (const book of books) {
    const filePath = path.join(outputDir, `${book.id}.json`);
    const json = JSON.stringify(book, null, 2);
    fs.writeFileSync(filePath, json, 'utf8');
  }
}
