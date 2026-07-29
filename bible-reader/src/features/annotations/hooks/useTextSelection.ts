import { useCallback, useEffect, useState } from 'react';

export interface SelectedVerse {
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
}

export interface TextSelection {
  text: string;
  rect: DOMRect;
  verses: SelectedVerse[];
}

export interface SelectionConfig {
  itemSelector: string;
  bookAttr: string;
  chapterAttr: string;
  verseAttr: string;
}

export const BIBLE_SELECTION_CONFIG: SelectionConfig = {
  itemSelector: '[data-verse]',
  bookAttr: 'data-book',
  chapterAttr: 'data-chapter',
  verseAttr: 'data-verse',
};

export const COMPANION_TEXT_SELECTION_CONFIG: SelectionConfig = {
  itemSelector: '[data-block]',
  bookAttr: 'data-work',
  chapterAttr: 'data-section',
  verseAttr: 'data-block',
};

function collectVerses(
  selection: globalThis.Selection,
  config: SelectionConfig,
): SelectedVerse[] {
  if (selection.rangeCount === 0) {
    return [];
  }

  const range = selection.getRangeAt(0);
  const nodes = getRangeNodes(range);
  const seen = new Set<string>();
  const verses: SelectedVerse[] = [];

  for (const node of nodes) {
    const el =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as Element).closest<HTMLElement>(config.itemSelector)
        : (node.parentElement as HTMLElement | null)?.closest<HTMLElement>(config.itemSelector);

    if (!el) {
      continue;
    }

    const bookId = el.getAttribute(config.bookAttr) ?? '';
    const chapterRaw = el.getAttribute(config.chapterAttr) ?? '';
    const verseRaw = el.getAttribute(config.verseAttr) ?? '';

    if (!bookId) continue;

    const chapterNumber = Number(chapterRaw);
    const verseNumber = Number(verseRaw);

    const key = `${bookId}:${chapterRaw}:${verseRaw}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    verses.push({
      bookId,
      chapterNumber: Number.isNaN(chapterNumber) ? 0 : chapterNumber,
      verseNumber: Number.isNaN(verseNumber) ? 0 : verseNumber,
    });
  }

  verses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
  return verses;
}

function getRangeNodes(range: Range): Node[] {
  const nodes: Node[] = [];
  const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.currentNode;

  while (node) {
    if (range.intersectsNode(node)) {
      nodes.push(node);
    }
    node = walker.nextNode();
  }

  if (nodes.length === 0) {
    nodes.push(range.commonAncestorContainer);
  }

  return nodes;
}

function computeUnionRect(verseEls: Element[]): DOMRect {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const el of verseEls) {
    const rect = el.getBoundingClientRect();
    if (rect.left < left) left = rect.left;
    if (rect.top < top) top = rect.top;
    if (rect.right > right) right = rect.right;
    if (rect.bottom > bottom) bottom = rect.bottom;
  }

  return new DOMRect(left, top, right - left, bottom - top);
}

export function useTextSelection(
  containerElement: HTMLDivElement | null,
  config: SelectionConfig = BIBLE_SELECTION_CONFIG,
): {
  selection: TextSelection | null;
  clearSelection: () => void;
} {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  useEffect(() => {
    if (!containerElement) {
      return;
    }

    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
        clearSelection();
        return;
      }

      const verses = collectVerses(sel, config);
      if (verses.length === 0) {
        clearSelection();
        return;
      }

      const range = sel.getRangeAt(0);
      const verseEls = verses.map((v) =>
        containerElement.querySelector(
          `[${config.bookAttr}="${v.bookId}"][${config.chapterAttr}="${v.chapterNumber}"][${config.verseAttr}="${v.verseNumber}"]`,
        ),
      ).filter((el): el is Element => el !== null);

      const rect = verseEls.length > 0
        ? computeUnionRect(verseEls)
        : range.getBoundingClientRect();

      setSelection({
        text: sel.toString(),
        rect,
        verses,
      });
    };

    containerElement.addEventListener('mouseup', handleMouseUp);
    return () => {
      containerElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerElement, clearSelection, config]);

  return { selection, clearSelection };
}
