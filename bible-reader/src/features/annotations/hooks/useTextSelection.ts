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

function collectVerses(selection: globalThis.Selection): SelectedVerse[] {
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
        ? (node as Element).closest<HTMLElement>('[data-verse]')
        : (node.parentElement as HTMLElement | null)?.closest<HTMLElement>('[data-verse]');

    if (!el) {
      continue;
    }

    const bookId = el.dataset.book;
    const chapterNumber = Number.parseInt(el.dataset.chapter ?? '', 10);
    const verseNumber = Number.parseInt(el.dataset.verse ?? '', 10);

    if (!bookId || Number.isNaN(chapterNumber) || Number.isNaN(verseNumber)) {
      continue;
    }

    const key = `${bookId}:${chapterNumber}:${verseNumber}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    verses.push({ bookId, chapterNumber, verseNumber });
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

      const verses = collectVerses(sel);
      if (verses.length === 0) {
        clearSelection();
        return;
      }

      const range = sel.getRangeAt(0);
      const verseEls = verses.map((v) =>
        containerElement.querySelector(`[data-book="${v.bookId}"][data-chapter="${v.chapterNumber}"][data-verse="${v.verseNumber}"]`),
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
  }, [containerElement, clearSelection]);

  return { selection, clearSelection };
}
