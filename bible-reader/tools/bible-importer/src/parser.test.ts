import { parseUsfm, validateBibleBook } from './parser';

const sampleUsfm = `\\id GEN Sample Translation
\\h Genesis
\\toc1 Genesis
\\toc2 Genesis
\\toc3 Gen
\\mt1 Genesis
\\s1 The Beginning
\\p
\\q1
\\c 1
\\v 1 In the beginning God created the heavens and the earth.
\\v 2 The earth was without form and void.
\\q1
\\c 2
\\v 1 And God said, let there be light.
`;

const parsed = parseUsfm(sampleUsfm, { id: 'genesis', name: 'Genesis', abbreviation: 'GEN', testament: 'old' });

if (parsed.chapters[0]?.number !== 1) {
  throw new Error('Expected chapter 1 to be parsed');
}

if (parsed.chapters[0]?.verses[0]?.text !== 'In the beginning God created the heavens and the earth.') {
  throw new Error('Expected verse text to be preserved');
}

if (parsed.chapters[1]?.verses[0]?.text !== 'And God said, let there be light.') {
  throw new Error('Expected second chapter verse to be parsed');
}

const validWarnings = validateBibleBook(parsed);
if (validWarnings.length > 0) {
  throw new Error(`Expected valid book to have no warnings, got ${validWarnings.join(', ')}`);
}

const invalidBook = {
  id: 'genesis',
  name: 'Genesis',
  abbreviation: 'GEN',
  testament: 'old' as const,
  chapters: [
    { number: 3, verses: [{ number: 1, text: '' }] },
    { number: 1, verses: [{ number: 1, text: 'First verse' }, { number: 1, text: 'Duplicate verse' }] },
  ],
};

const invalidWarnings = validateBibleBook(invalidBook);
const requiredWarnings = ['missing chapters', 'duplicate verse numbers', 'empty verses', 'invalid ordering'];
for (const requiredWarning of requiredWarnings) {
  if (!invalidWarnings.some((warning) => warning.includes(requiredWarning))) {
    throw new Error(`Expected warning containing "${requiredWarning}", got ${invalidWarnings.join(', ')}`);
  }
}

console.log('parser ok', parsed.chapters.length, parsed.chapters[0]?.verses.length);
