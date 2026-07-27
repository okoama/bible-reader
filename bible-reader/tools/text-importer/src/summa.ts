import * as fs from "fs";
import * as path from "path";
import { TextWork, TextSection, TextBlock } from "./models.js";

interface SummaArticle {
  id: number;
  question: number;
  type: string;
  part: string;
  title: string[];
  text: string[];
  objections?: Record<string, { text: string[] }>;
  counter?: string[];
  body?: string[];
  replies?: Record<string, { text: string[] }>;
}

interface SummaQuestion {
  id: number;
  part: string;
  title: string;
  outer?: string[];
  article: Record<string, SummaArticle>;
}

interface SummaPart {
  title: string;
  questions: Record<string, SummaQuestion>;
}

const PART_LABELS: Record<string, string> = {
  FP: "Prima Pars (First Part)",
  FS: "Prima Secundae (First Part of the Second Part)",
  SS: "Secunda Secundae (Second Part of the Second Part)",
  TP: "Tertia Pars (Third Part)",
  X1: "Supplementum (Supplement)",
  X2: "Appendix",
  XP: "Extra",
};

function romanize(num: number): string {
  const lookup: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  for (const [value, numeral] of lookup) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

function buildArticleBlocks(article: SummaArticle, qNum: number, aNum: number): TextBlock[] {
  const blocks: TextBlock[] = [];
  const prefix = `q${qNum}:a${aNum}`;

  if (article.objections) {
    const objKeys = Object.keys(article.objections).sort((a, b) => +a - +b);
    for (const key of objKeys) {
      const obj = article.objections[key];
      const text = obj.text.join(" ").trim();
      if (text) {
        blocks.push({
          id: `${prefix}:obj${key}`,
          number: +key,
          text,
          label: "Objection",
        });
      }
    }
  }

  if (article.counter && article.counter.length > 0) {
    const text = article.counter.join(" ").trim();
    if (text) {
      blocks.push({
        id: `${prefix}:sed-contra`,
        text,
        label: "Sed Contra",
      });
    }
  }

  if (article.body && article.body.length > 0) {
    const text = article.body.join(" ").trim();
    if (text) {
      blocks.push({
        id: `${prefix}:respondeo`,
        text,
        label: "Respondeo",
      });
    }
  }

  if (article.replies) {
    const repKeys = Object.keys(article.replies).sort((a, b) => +a - +b);
    for (const key of repKeys) {
      const rep = article.replies[key];
      const text = rep.text.join(" ").trim();
      if (text) {
        blocks.push({
          id: `${prefix}:rep${key}`,
          number: +key,
          text,
          label: "Reply",
        });
      }
    }
  }

  return blocks;
}

export function parseSumma(inputPath: string, outputPath: string): void {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const data: Record<string, SummaPart> = JSON.parse(raw);

  const works: TextWork[] = [];

  for (const [partKey, partData] of Object.entries(data)) {
    if (!partData.questions) continue;

    const sections: TextSection[] = [];
    const questionKeys = Object.keys(partData.questions)
      .map(Number)
      .sort((a, b) => a - b);

    for (const qNum of questionKeys) {
      const question = partData.questions[qNum];
      if (!question || !question.article) continue;

      const blocks: TextBlock[] = [];

      if (question.outer && question.outer.length > 0) {
        const text = question.outer.join(" ").trim();
        if (text) {
          blocks.push({
            id: `q${qNum}:intro`,
            text,
            label: "Introduction",
          });
        }
      }

      const articleKeys = Object.keys(question.article)
        .map(Number)
        .sort((a, b) => a - b);

      for (const aNum of articleKeys) {
        const article = question.article[aNum];
        blocks.push(...buildArticleBlocks(article, qNum, aNum));
      }

      if (blocks.length > 0) {
        sections.push({
          id: `q${qNum}`,
          label: `Q. ${qNum}: ${question.title}`,
          content: blocks,
        });
      }
    }

    if (sections.length > 0) {
      works.push({
        id: `summa-${partKey.toLowerCase()}`,
        name: `Summa Theologiae — ${PART_LABELS[partKey] || partKey}`,
        author: "St. Thomas Aquinas",
        workType: "summa",
        sections,
      });
    }
  }

  fs.mkdirSync(outputPath, { recursive: true });
  for (const work of works) {
    const outPath = path.join(outputPath, `${work.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(work, null, 2));
    console.log(`  ${work.id}: ${work.sections.length} questions → ${outPath}`);
  }
}
