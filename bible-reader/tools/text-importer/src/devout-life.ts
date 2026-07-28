import * as fs from "fs";
import * as path from "path";
import { TextWork, TextSection, TextBlock } from "./models.js";

const PART_NAMES: Record<number, string> = {
  1: "Counsels and Practices for the Soul's Guidance",
  2: "Counsels for Uplifting the Soul to God in Prayer",
  3: "Counsels Concerning the Practice of Virtue",
  4: "Counsels Concerning Ordinary Temptations",
  5: "Counsels for Renewing and Confirming the Soul in Devotion",
};

function stripHeader(text: string): string {
  const startMarker = " __________________________________________________________________";
  const startIdx = text.indexOf(startMarker, 300);
  if (startIdx !== -1) {
    const afterMarker = text.indexOf("\n", startIdx + 1);
    if (afterMarker !== -1) text = text.substring(afterMarker + 1);
  }
  const endMarker = "End of the Project Gutenberg";
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

export function parseDevoutLife(inputPath: string, outputDir: string): void {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const cleaned = stripHeader(raw);

  const partPattern = /^\s*PART\s+(I{1,3}|IV|V)\.\s+(.*)$/gm;
  const partMatches: { match: RegExpExecArray; num: number; title: string }[] = [];
  let pm: RegExpExecArray | null;
  while ((pm = partPattern.exec(cleaned)) !== null) {
    const num = romanToInt(pm[1]);
    if (num >= 1 && num <= 5) {
      partMatches.push({ match: pm, num, title: pm[2].trim() });
    }
  }

  const chapterPattern = /^\s*CHAPTER\s+([IVXLCDM]+)\.\s*(.*)$/gm;
  const allChapters: { match: RegExpExecArray; num: number; title: string; globalIdx: number }[] = [];
  let cm: RegExpExecArray | null;
  while ((cm = chapterPattern.exec(cleaned)) !== null) {
    allChapters.push({
      match: cm,
      num: romanToInt(cm[1]),
      title: cm[2].trim(),
      globalIdx: cm.index,
    });
  }

  fs.mkdirSync(outputDir, { recursive: true });

  let globalParaNum = 0;

  for (let p = 0; p < partMatches.length; p++) {
    const partNum = partMatches[p].num;
    const partStart = partMatches[p].match.index;
    const partEnd = p + 1 < partMatches.length ? partMatches[p + 1].match.index : cleaned.length;

    const chaptersInPart = allChapters.filter(
      (ch) => ch.globalIdx >= partStart && ch.globalIdx < partEnd
    );

    const sections: TextSection[] = [];

    for (let c = 0; c < chaptersInPart.length; c++) {
      const chStart = chaptersInPart[c].match.index + chaptersInPart[c].match[0].length;
      const chEnd =
        c + 1 < chaptersInPart.length
          ? chaptersInPart[c + 1].globalIdx
          : p + 1 < partMatches.length
            ? partMatches[p + 1].match.index
            : cleaned.length;
      const chText = cleaned.substring(chStart, chEnd).trim();
      const paragraphs = splitIntoParagraphs(chText);

      const blocks: TextBlock[] = [];
      for (const para of paragraphs) {
        globalParaNum++;
        blocks.push({
          id: `p${globalParaNum}`,
          number: globalParaNum,
          text: para,
        });
      }

      if (blocks.length > 0) {
        sections.push({
          id: `ch-${chaptersInPart[c].num}`,
          label: `Chapter ${chaptersInPart[c].num}: ${chaptersInPart[c].title}`,
          content: blocks,
        });
      }
    }

    const work: TextWork = {
      id: `devout-life-part-${partNum}`,
      name: `Part ${partNum}: ${PART_NAMES[partNum]}`,
      author: "St. Francis de Sales",
      workType: "devout-life",
      sections,
    };

    const outPath = path.join(outputDir, `devout-life-part-${partNum}.json`);
    fs.writeFileSync(outPath, JSON.stringify(work, null, 2));
    console.log(`  devout-life-part-${partNum}: ${sections.length} chapters → ${outPath}`);
  }
}
