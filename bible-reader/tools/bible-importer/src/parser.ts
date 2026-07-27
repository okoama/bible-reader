import * as fs from 'fs';
import * as path from 'path';
import type { BibleBook, Chapter, Verse } from './models.js';

export function parseUsfm(usfm: string, bookMetadata: Partial<BibleBook> = {}): BibleBook {
  const lines = usfm.replace(/\r\n?/g, '\n').split('\n');
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;
  let currentVerse: Verse | null = null;

  const flushVerse = () => {
    if (currentChapter && currentVerse) {
      currentChapter.verses.push(currentVerse);
    }
    currentVerse = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith('\\id ')) {
      continue;
    }

    if (line.startsWith('\\h') || line.startsWith('\\toc') || line.startsWith('\\mt') || line.startsWith('\\s') || line.startsWith('\\p') || line.startsWith('\\q') || line.startsWith('\\ms') || line.startsWith('\\m') || line.startsWith('\\d') || line.startsWith('\\b') || line.startsWith('\\cl') || line.startsWith('\\cd') || line.startsWith('\\im') || line.startsWith('\\ide') || line.startsWith('\\mte') || line.startsWith('\\ipi') || line.startsWith('\\ip ') || line.startsWith('\\ili') || line.startsWith('\\pm') || line.startsWith('\\tr') || line.startsWith('\\ib')) {
      continue;
    }

    if (line.startsWith('\\c ')) {
      flushVerse();
      const chapterNumber = Number.parseInt(line.replace('\\c ', ''), 10);
      currentChapter = {
        number: chapterNumber,
        verses: [],
      };
      chapters.push(currentChapter);
      continue;
    }

    if (line.startsWith('\\v ')) {
      flushVerse();
      const match = line.match(/^\\v\s+(\d+)/);
      if (!match) {
        continue;
      }

      const verseNumber = match[1];
      if (!verseNumber) {
        continue;
      }

      currentVerse = {
        number: Number.parseInt(verseNumber, 10),
        text: '',
      };

      const content = line.slice(match[0].length).trim();
      if (content) {
        currentVerse.text = stripUsfmFormatting(content);
      }

      continue;
    }

    if (currentChapter && currentVerse) {
      currentVerse.text += ` ${stripUsfmFormatting(line)}`.trim();
    }
  }

  flushVerse();

  return {
    id: bookMetadata.id ?? 'unknown-book',
    name: bookMetadata.name ?? 'Unknown Book',
    abbreviation: bookMetadata.abbreviation ?? 'UNK',
    testament: bookMetadata.testament ?? 'old',
    chapters,
  };
}

export function parseUsfmFile(filePath: string, bookMetadata: Partial<BibleBook> = {}): BibleBook {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  return parseUsfm(content, bookMetadata);
}

export function validateBibleBook(book: BibleBook): string[] {
  const warnings: string[] = [];

  if (!book.chapters || book.chapters.length === 0) {
    warnings.push('missing chapters');
    return warnings;
  }

  const chapterNumbers = book.chapters.map((chapter) => chapter.number);
  const sortedChapterNumbers = [...chapterNumbers].sort((a, b) => a - b);
  if (chapterNumbers.some((number, index) => number !== sortedChapterNumbers[index])) {
    warnings.push('invalid ordering');
  }

  const missingChapters = [] as number[];
  const lastChapterNumber = sortedChapterNumbers[sortedChapterNumbers.length - 1];
  if (lastChapterNumber !== undefined) {
    for (let chapterNumber = 1; chapterNumber <= lastChapterNumber; chapterNumber += 1) {
      if (!chapterNumbers.includes(chapterNumber)) {
        missingChapters.push(chapterNumber);
      }
    }
  }
  if (missingChapters.length > 0) {
    warnings.push(`missing chapters: ${missingChapters.join(', ')}`);
  }

  for (const chapter of book.chapters) {
    const verseNumbers = chapter.verses.map((verse) => verse.number);
    const sortedVerseNumbers = [...verseNumbers].sort((a, b) => a - b);
    if (verseNumbers.some((number, index) => number !== sortedVerseNumbers[index])) {
      warnings.push(`invalid ordering in chapter ${chapter.number}`);
    }

    const duplicates = verseNumbers.filter((number, index) => verseNumbers.indexOf(number) !== index);
    if (duplicates.length > 0) {
      warnings.push(`duplicate verse numbers in chapter ${chapter.number}: ${[...new Set(duplicates)].join(', ')}`);
    }

    const emptyVerses = chapter.verses.filter((verse) => !verse.text || verse.text.trim().length === 0);
    if (emptyVerses.length > 0) {
      warnings.push(`empty verses in chapter ${chapter.number}`);
    }
  }

  return warnings;
}

export function stripUsfmFormatting(text: string): string {
  let result = text;

  result = result.replace(/\\f\s[^]*?\\f\*/g, ' ');

  result = result.replace(/\\\+wh\b[^]*?\\\+wh\*/g, '');

  result = result.replace(/\\wj\s/g, ' ').replace(/\\wj\*\s*/g, '');

  result = result.replace(/\\va\s[^\\]*?\\va\*/g, '');
  result = result.replace(/\\ca\s[^\\]*?\\ca\*/g, '');

  result = result.replace(/\\w\s([^|]*?)\|[^\\]*?\\w\*/g, '$1');

  result = result.replace(/\\[a-zA-Z0-9]+\s+[^\\\n]+/g, ' ');
  result = result.replace(/\\[a-zA-Z0-9]+/g, '');

  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

