import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { TextWork, TextSection, TextBlock } from './models.js';

const PARTS: Array<{ id: string; label: string; start: number; end: number }> = [
  { id: 'prologue', label: 'Prologue', start: 1, end: 32 },
  { id: 'part-1', label: 'Part I: The Profession of Faith', start: 33, end: 1065 },
  { id: 'part-2', label: 'Part II: The Celebration of the Christian Mystery', start: 1066, end: 1690 },
  { id: 'part-3', label: 'Part III: Life in Christ', start: 1691, end: 2557 },
  { id: 'part-4', label: 'Part IV: Christian Prayer', start: 2558, end: 2865 },
];

function extractTextFromElements(elements: Array<{ type: string; text?: string }>): string {
  return elements
    .filter((el) => el.type === 'text' && el.text)
    .map((el) => el.text!)
    .join(' ')
    .trim();
}

export function parseCatechism(inputPath: string, outputPath: string): void {
  const raw = JSON.parse(readFileSync(inputPath, 'utf-8'));

  const pageNodes: Record<string, { id: string; paragraphs: Array<{ elements: Array<{ type: string; text?: string }> }> }> = raw.page_nodes;

  const allTexts: Array<{ id: string; text: string; nodeIndex: number }> = [];

  const sortedKeys = Object.keys(pageNodes)
    .map((k) => ({ key: k, num: parseInt(k.replace('toc-', ''), 10) }))
    .sort((a, b) => a.num - b.num);

  for (const { key, num } of sortedKeys) {
    const node = pageNodes[key];
    if (!node?.paragraphs) continue;

    for (const para of node.paragraphs) {
      const text = extractTextFromElements(para.elements);
      if (text) {
        allTexts.push({ id: `p${num}`, text, nodeIndex: num });
      }
    }
  }

  const numberedParagraphs: Array<{ number: number; text: string; id: string }> = [];

  for (const entry of allTexts) {
    const match = entry.text.match(/^(\d{1,4})\s+(.+)/s);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 2865) {
        numberedParagraphs.push({ number: num, text: match[2], id: entry.id });
        continue;
      }
    }
    numberedParagraphs.push({ number: numberedParagraphs.length + 1, text: entry.text, id: entry.id });
  }

  const sections: TextSection[] = PARTS.map((part) => {
    const blocks: TextBlock[] = numberedParagraphs
      .filter((p) => p.number >= part.start && p.number <= part.end)
      .map((p) => ({
        id: `p${p.number}`,
        number: p.number,
        text: p.text,
      }));

    return {
      id: part.id,
      label: part.label,
      content: blocks,
    };
  });

  const work: TextWork = {
    id: 'catechism',
    name: 'Catechism of the Catholic Church',
    workType: 'catechism',
    sections,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(work, null, 2));
  const totalBlocks = sections.reduce((sum, s) => sum + s.content.length, 0);
  console.log(`  catechism: ${sections.length} parts, ${totalBlocks} paragraphs → ${outputPath}`);
}
