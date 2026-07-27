import * as fs from "fs";
import * as path from "path";
import { TextWork, TextSection, TextBlock } from "./models.js";

function stripGutenbergHeader(text: string): string {
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const startIdx = text.indexOf(startMarker);
  if (startIdx !== -1) {
    const afterMarker = text.indexOf("\n", startIdx);
    if (afterMarker !== -1) {
      text = text.substring(afterMarker + 1);
    }
  }
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  const endIdx = text.indexOf(endMarker);
  if (endIdx !== -1) {
    text = text.substring(0, endIdx);
  }
  return text.trim();
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
}

export function parseConfessions(inputPath: string, outputPath: string): void {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const cleaned = stripGutenbergHeader(raw);

  const bookPattern = /^(BOOK\s+(I{1,3}|IV|V|VI{0,3}|IX|X|XI{0,3}|XIII))\s*$/gm;
  const bookMatches: { match: RegExpExecArray; label: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = bookPattern.exec(cleaned)) !== null) {
    bookMatches.push({ match: m, label: m[1] });
  }

  const sections: TextSection[] = [];
  let globalParaNum = 0;

  for (let i = 0; i < bookMatches.length; i++) {
    const start = bookMatches[i].match.index + bookMatches[i].match[0].length;
    const end = i + 1 < bookMatches.length ? bookMatches[i + 1].match.index : cleaned.length;
    const bookText = cleaned.substring(start, end).trim();
    const paragraphs = splitIntoParagraphs(bookText);

    const blocks: TextBlock[] = [];
    for (const para of paragraphs) {
      globalParaNum++;
      blocks.push({
        id: `p${globalParaNum}`,
        number: globalParaNum,
        text: para,
      });
    }

    sections.push({
      id: `book-${i + 1}`,
      label: bookMatches[i].label,
      content: blocks,
    });
  }

  const work: TextWork = {
    id: "confessions",
    name: "Confessions",
    author: "St. Augustine",
    workType: "confessions",
    sections,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(work, null, 2));
  console.log(`  confessions: ${sections.length} books, ${globalParaNum} paragraphs → ${outputPath}`);
}
