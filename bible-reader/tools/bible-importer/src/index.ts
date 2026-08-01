import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parseUsfmFile, validateBibleBook } from './parser.js';
import { writeBooks } from './writer.js';
import type { BibleBook } from './models.js';

const BOOK_METADATA: Record<string, { name: string; abbr: string; testament: 'old' | 'deuterocanon' | 'new' }> = {
  genesis:     { name: 'Genesis',          abbr: 'GEN', testament: 'old' },
  exodus:      { name: 'Exodus',           abbr: 'EXO', testament: 'old' },
  leviticus:   { name: 'Leviticus',        abbr: 'LEV', testament: 'old' },
  numbers:     { name: 'Numbers',          abbr: 'NUM', testament: 'old' },
  deuteronomy: { name: 'Deuteronomy',      abbr: 'DEU', testament: 'old' },
  joshua:      { name: 'Joshua',           abbr: 'JOS', testament: 'old' },
  judges:      { name: 'Judges',           abbr: 'JDG', testament: 'old' },
  ruth:        { name: 'Ruth',             abbr: 'RUT', testament: 'old' },
  '1-samuel':  { name: '1 Samuel',         abbr: '1SA', testament: 'old' },
  '2-samuel':  { name: '2 Samuel',         abbr: '2SA', testament: 'old' },
  '1-kings':   { name: '1 Kings',          abbr: '1KI', testament: 'old' },
  '2-kings':   { name: '2 Kings',          abbr: '2KI', testament: 'old' },
  '1-chronicles': { name: '1 Chronicles',  abbr: '1CH', testament: 'old' },
  '2-chronicles': { name: '2 Chronicles',  abbr: '2CH', testament: 'old' },
  ezra:        { name: 'Ezra',             abbr: 'EZR', testament: 'old' },
  nehemiah:    { name: 'Nehemiah',         abbr: 'NEH', testament: 'old' },
  esther:      { name: 'Esther',           abbr: 'EST', testament: 'old' },
  job:         { name: 'Job',              abbr: 'JOB', testament: 'old' },
  psalms:      { name: 'Psalms',           abbr: 'PSA', testament: 'old' },
  proverbs:    { name: 'Proverbs',         abbr: 'PRO', testament: 'old' },
  ecclesiastes:{ name: 'Ecclesiastes',     abbr: 'ECC', testament: 'old' },
  'song-of-solomon': { name: 'Song of Solomon', abbr: 'SNG', testament: 'old' },
  isaiah:      { name: 'Isaiah',           abbr: 'ISA', testament: 'old' },
  jeremiah:    { name: 'Jeremiah',         abbr: 'JER', testament: 'old' },
  lamentations:{ name: 'Lamentations',     abbr: 'LAM', testament: 'old' },
  ezekiel:     { name: 'Ezekiel',          abbr: 'EZK', testament: 'old' },
  daniel:      { name: 'Daniel',           abbr: 'DAN', testament: 'old' },
  hosea:       { name: 'Hosea',            abbr: 'HOS', testament: 'old' },
  joel:        { name: 'Joel',             abbr: 'JOL', testament: 'old' },
  amos:        { name: 'Amos',             abbr: 'AMO', testament: 'old' },
  obadiah:     { name: 'Obadiah',          abbr: 'OBA', testament: 'old' },
  jonah:       { name: 'Jonah',            abbr: 'JON', testament: 'old' },
  micah:       { name: 'Micah',            abbr: 'MIC', testament: 'old' },
  nahum:       { name: 'Nahum',            abbr: 'NAM', testament: 'old' },
  habakkuk:    { name: 'Habakkuk',         abbr: 'HAB', testament: 'old' },
  zephaniah:   { name: 'Zephaniah',        abbr: 'ZEP', testament: 'old' },
  haggai:      { name: 'Haggai',           abbr: 'HAG', testament: 'old' },
  zechariah:   { name: 'Zechariah',        abbr: 'ZEC', testament: 'old' },
  malachi:     { name: 'Malachi',          abbr: 'MAL', testament: 'old' },
  tobit:       { name: 'Tobit',            abbr: 'TOB', testament: 'deuterocanon' },
  judith:      { name: 'Judith',           abbr: 'JDT', testament: 'deuterocanon' },
  wisdom:      { name: 'Wisdom',           abbr: 'WIS', testament: 'deuterocanon' },
  sirach:      { name: 'Sirach',           abbr: 'SIR', testament: 'deuterocanon' },
  baruch:      { name: 'Baruch',           abbr: 'BAR', testament: 'deuterocanon' },
  '1-maccabees': { name: '1 Maccabees',    abbr: '1MA', testament: 'deuterocanon' },
  '2-maccabees': { name: '2 Maccabees',    abbr: '2MA', testament: 'deuterocanon' },
  matthew:     { name: 'Matthew',          abbr: 'MAT', testament: 'new' },
  mark:        { name: 'Mark',             abbr: 'MRK', testament: 'new' },
  luke:        { name: 'Luke',             abbr: 'LUK', testament: 'new' },
  john:        { name: 'John',             abbr: 'JHN', testament: 'new' },
  acts:        { name: 'Acts',             abbr: 'ACT', testament: 'new' },
  romans:      { name: 'Romans',           abbr: 'ROM', testament: 'new' },
  '1-corinthians': { name: '1 Corinthians', abbr: '1CO', testament: 'new' },
  '2-corinthians': { name: '2 Corinthians', abbr: '2CO', testament: 'new' },
  galatians:   { name: 'Galatians',        abbr: 'GAL', testament: 'new' },
  ephesians:   { name: 'Ephesians',        abbr: 'EPH', testament: 'new' },
  philippians: { name: 'Philippians',      abbr: 'PHP', testament: 'new' },
  colossians:  { name: 'Colossians',       abbr: 'COL', testament: 'new' },
  '1-thessalonians': { name: '1 Thessalonians', abbr: '1TH', testament: 'new' },
  '2-thessalonians': { name: '2 Thessalonians', abbr: '2TH', testament: 'new' },
  '1-timothy': { name: '1 Timothy',        abbr: '1TI', testament: 'new' },
  '2-timothy': { name: '2 Timothy',        abbr: '2TI', testament: 'new' },
  titus:       { name: 'Titus',            abbr: 'TIT', testament: 'new' },
  philemon:    { name: 'Philemon',         abbr: 'PHM', testament: 'new' },
  hebrews:     { name: 'Hebrews',          abbr: 'HEB', testament: 'new' },
  james:       { name: 'James',            abbr: 'JAM', testament: 'new' },
  '1-peter':   { name: '1 Peter',          abbr: '1PE', testament: 'new' },
  '2-peter':   { name: '2 Peter',          abbr: '2PE', testament: 'new' },
  '1-john':    { name: '1 John',           abbr: '1JN', testament: 'new' },
  '2-john':    { name: '2 John',           abbr: '2JN', testament: 'new' },
  '3-john':    { name: '3 John',           abbr: '3JN', testament: 'new' },
  jude:        { name: 'Jude',             abbr: 'JUD', testament: 'new' },
  revelation:  { name: 'Revelation',       abbr: 'REV', testament: 'new' },
};

const ABBR_TO_ID: Record<string, string> = {};
for (const [id, meta] of Object.entries(BOOK_METADATA)) {
  ABBR_TO_ID[meta.abbr] = id;
}

const SKIPPED_FILES = new Set<string>();

interface ImportResult {
  bookId: string;
  chapters: number;
  verses: number;
  warnings: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __directory = path.dirname(__filename);

function main(): void {
  const inputDir = path.resolve(__directory, '..', 'input');
  const outputDir = path.resolve(__directory, '..', 'output');

  const usfmFiles = fs.readdirSync(inputDir)
    .filter((name) => name.endsWith('.sfm') && !SKIPPED_FILES.has(name))
    .map((name) => path.join(inputDir, name));

  console.log(`Found ${usfmFiles.length} USFM files\n`);

  const results: ImportResult[] = [];
  const allBooks: BibleBook[] = [];

  for (const filePath of usfmFiles) {
    const fileName = path.basename(filePath);
    const match = fileName.match(/^[0-9]+-([A-Z0-9]+)-.*\.sfm$/);
    const abbr = match?.[1];

    if (!abbr || !ABBR_TO_ID[abbr]) {
      console.log(`SKIP  ${fileName} (no metadata mapping)`);
      continue;
    }

    const bookId = ABBR_TO_ID[abbr]!;
    const meta = BOOK_METADATA[bookId]!;

    const book = parseUsfmFile(filePath, {
      id: bookId,
      name: meta.name,
      abbreviation: meta.abbr,
      testament: meta.testament,
    });

    const warnings = validateBibleBook(book);
    const verseCount = book.chapters.reduce((sum, ch) => sum + ch.verses.length, 0);

    results.push({ bookId, chapters: book.chapters.length, verses: verseCount, warnings });
    allBooks.push(book);

    const status = warnings.length > 0 ? 'WARN' : 'OK';
    console.log(`${status}   ${meta.name.padEnd(22)} ${book.chapters.length} chapters, ${verseCount} verses`);
    for (const warning of warnings) {
      console.log(`      ${warning}`);
    }
  }

  writeBooks(allBooks, outputDir);

  const totalChapters = results.reduce((sum, r) => sum + r.chapters, 0);
  const totalVerses = results.reduce((sum, r) => sum + r.verses, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log('\n--- Summary ---');
  console.log(`Books:      ${results.length}`);
  console.log(`Chapters:   ${totalChapters}`);
  console.log(`Verses:     ${totalVerses}`);
  console.log(`Warnings:   ${totalWarnings}`);
  console.log(`Output:     ${outputDir}`);
}

main();
