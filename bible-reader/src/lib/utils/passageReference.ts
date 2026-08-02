import type { BibleBook } from '../../types';

export interface ParsedPassage {
  book: BibleBook;
  chapterNumber: number;
  verseNumber?: number;
}

const BOOK_ABBREVIATIONS: Record<string, string> = {
  '1CH': '1-chronicles',
  '1CO': '1-corinthians',
  '1JN': '1-john',
  '1KI': '1-kings',
  '1MA': '1-maccabees',
  '1PE': '1-peter',
  '1SA': '1-samuel',
  '1TH': '1-thessalonians',
  '1TI': '1-timothy',
  '2CH': '2-chronicles',
  '2CO': '2-corinthians',
  '2JN': '2-john',
  '2KI': '2-kings',
  '2MA': '2-maccabees',
  '2PE': '2-peter',
  '2SA': '2-samuel',
  '2TH': '2-thessalonians',
  '2TI': '2-timothy',
  '3JN': '3-john',
  ACT: 'acts',
  AMO: 'amos',
  BAR: 'baruch',
  COL: 'colossians',
  DAN: 'daniel',
  DEU: 'deuteronomy',
  ECC: 'ecclesiastes',
  EPH: 'ephesians',
  EST: 'esther',
  EXO: 'exodus',
  EZK: 'ezekiel',
  EZR: 'ezra',
  GAL: 'galatians',
  GEN: 'genesis',
  HAB: 'habakkuk',
  HAG: 'haggai',
  HEB: 'hebrews',
  HOS: 'hosea',
  ISA: 'isaiah',
  JAM: 'james',
  JDG: 'judges',
  JDT: 'judith',
  JER: 'jeremiah',
  JHN: 'john',
  JOB: 'job',
  JOL: 'joel',
  JON: 'jonah',
  JOS: 'joshua',
  JUD: 'jude',
  LAM: 'lamentations',
  LEV: 'leviticus',
  LUK: 'luke',
  MAL: 'malachi',
  MAT: 'matthew',
  MIC: 'micah',
  MRK: 'mark',
  NAM: 'nahum',
  NEH: 'nehemiah',
  NUM: 'numbers',
  OBA: 'obadiah',
  PHM: 'philemon',
  PHP: 'philippians',
  PRO: 'proverbs',
  PSA: 'psalms',
  REV: 'revelation',
  ROM: 'romans',
  RUT: 'ruth',
  SIR: 'sirach',
  SNG: 'song-of-solomon',
  TIT: 'titus',
  TOB: 'tobit',
  WIS: 'wisdom',
  ZEC: 'zechariah',
  ZEP: 'zephaniah',
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveBook(books: BibleBook[], token: string): BibleBook | null {
  const normalized = normalize(token);
  if (!normalized) return null;

  const abbrId = BOOK_ABBREVIATIONS[normalized.toUpperCase()];
  if (abbrId) {
    const byAbbr = books.find((b) => b.id === abbrId);
    if (byAbbr) return byAbbr;
  }

  return books.find(
    (b) => normalize(b.id) === normalized || normalize(b.name) === normalized,
  ) ?? null;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

export function parsePassageReference(
  sourceReference: string,
  books: BibleBook[],
): ParsedPassage | null {
  const raw = sourceReference.trim();
  if (!raw) return null;

  const spaceMatch = raw.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/);
  if (spaceMatch) {
    const [, bookToken, chapterRaw, verseRaw] = spaceMatch;
    const book = resolveBook(books, bookToken);
    const chapterNumber = toNumber(chapterRaw);
    if (!book || chapterNumber === undefined) return null;
    const verseNumber = toNumber(verseRaw);
    return { book, chapterNumber, verseNumber };
  }

  const colonMatch = raw.match(/^([^:]+):(\d+)(?::(\d+))?(?:-(\d+))?$/);
  if (colonMatch) {
    const [, bookToken, chapterRaw, verseRaw] = colonMatch;
    const book = resolveBook(books, bookToken);
    const chapterNumber = toNumber(chapterRaw);
    if (!book || chapterNumber === undefined) return null;
    const verseNumber = toNumber(verseRaw);
    return { book, chapterNumber, verseNumber };
  }

  return null;
}
