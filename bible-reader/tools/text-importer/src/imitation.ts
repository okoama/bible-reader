import * as fs from "fs";
import * as path from "path";
import { TextWork, TextSection, TextBlock } from "./models.js";

const BOOK_NAMES: Record<number, string> = {
  1: "Admonitions Profitable for the Spiritual Life",
  2: "Directions for the Interior Life",
  3: "Of Interior Consolation",
  4: "Of the Blessed Sacrament",
};

function stripGutenbergHeader(text: string): string {
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const startIdx = text.indexOf(startMarker);
  if (startIdx !== -1) {
    const afterMarker = text.indexOf("\n", startIdx);
    if (afterMarker !== -1) text = text.substring(afterMarker + 1);
  }
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  const endIdx = text.indexOf(endMarker);
  if (endIdx !== -1) text = text.substring(0, endIdx);
  return text.trim();
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
}

function romanToInt(s: string): number {
  const map: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]];
    const next = map[s[i + 1]];
    if (next && cur < next) result -= cur;
    else result += cur;
  }
  return result;
}

export function parseImitation(inputPath: string, outputDir: string): void {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const cleaned = stripGutenbergHeader(raw);

  const bookPattern = /^THE\s+(FIRST|SECOND|THIRD|FOURTH)\s+BOOK/gm;
  const bookMatches: { match: RegExpExecArray; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = bookPattern.exec(cleaned)) !== null) {
    bookMatches.push({ match: m, index: m.index });
  }

  fs.mkdirSync(outputDir, { recursive: true });

  let globalParaNum = 0;

  for (let i = 0; i < bookMatches.length; i++) {
    const bookNum = i + 1;
    const bookStart = bookMatches[i].index;
    const bookEnd = i + 1 < bookMatches.length ? bookMatches[i + 1].index : cleaned.length;
    const bookText = cleaned.substring(bookStart, bookEnd);

    const chapterPattern = /^CHAPTER\s+([IVXLCDM]+)\s*$/gm;
    const chapters: { match: RegExpExecArray; num: number }[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = chapterPattern.exec(bookText)) !== null) {
      chapters.push({ match: cm, num: romanToInt(cm[1]) });
    }

    const sections: TextSection[] = [];

    if (chapters.length === 0) {
      const paragraphs = splitIntoParagraphs(bookText);
      const blocks: TextBlock[] = [];
      for (const para of paragraphs) {
        globalParaNum++;
        blocks.push({ id: `p${globalParaNum}`, number: globalParaNum, text: para });
      }
      if (blocks.length > 0) {
        sections.push({
          id: "all",
          label: `Book ${bookNum}`,
          content: blocks,
        });
      }
    } else {
      for (let j = 0; j < chapters.length; j++) {
        const chStart = chapters[j].match.index + chapters[j].match[0].length;
        const chEnd = j + 1 < chapters.length ? chapters[j + 1].match.index : bookText.length;
        const chText = bookText.substring(chStart, chEnd).trim();
        const paragraphs = splitIntoParagraphs(chText);

        const blocks: TextBlock[] = [];
        for (const para of paragraphs) {
          globalParaNum++;
          blocks.push({ id: `p${globalParaNum}`, number: globalParaNum, text: para });
        }

        if (blocks.length > 0) {
          sections.push({
            id: `ch-${chapters[j].num}`,
            label: `Chapter ${chapters[j].num}`,
            content: blocks,
          });
        }
      }
    }

    const work: TextWork = {
      id: `imitation-book-${bookNum}`,
      name: `Book ${bookNum}: ${BOOK_NAMES[bookNum]}`,
      author: "Thomas à Kempis",
      workType: "imitation",
      sections,
    };

    const outPath = path.join(outputDir, `imitation-book-${bookNum}.json`);
    fs.writeFileSync(outPath, JSON.stringify(work, null, 2));
    console.log(`  imitation-book-${bookNum}: ${sections.length} chapters → ${outPath}`);
  }
}
