import { useEffect, useRef, useState } from 'react';
import type { SelectedVerse, TextSelection } from '../features/annotations/hooks/useTextSelection';

type AnnotationToolbarProps = {
  selection: TextSelection;
  onHighlight: (text: string, verses: SelectedVerse[]) => void;
  onNote: (text: string, verses: SelectedVerse[]) => void;
  onBookmark: (verses: SelectedVerse[]) => void;
};

const TOOLBAR_HEIGHT = 40;
const VIEWPORT_PADDING = 8;

export default function AnnotationToolbar({
  selection,
  onHighlight,
  onNote,
  onBookmark,
}: AnnotationToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const toolbarWidth = ref.current.offsetWidth;
    const { rect } = selection;

    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    let top = rect.top - TOOLBAR_HEIGHT - 8;

    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    } else if (left + toolbarWidth > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - VIEWPORT_PADDING - toolbarWidth;
    }

    if (top < VIEWPORT_PADDING) {
      top = rect.bottom + 8;
    }

    setPosition({ left, top });
  }, [selection]);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      style={{ position: 'fixed', left: position.left, top: position.top }}
      className="z-50 flex items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-md"
    >
      <button
        type="button"
        onClick={() => onHighlight(selection.text, selection.verses)}
        className="rounded px-2 py-1 text-sm hover:bg-yellow-100"
      >
        Highlight
      </button>
      <button
        type="button"
        onClick={() => onNote(selection.text, selection.verses)}
        className="rounded px-2 py-1 text-sm hover:bg-blue-100"
      >
        Note
      </button>
      <button
        type="button"
        onClick={() => onBookmark(selection.verses)}
        className="rounded px-2 py-1 text-sm hover:bg-gray-100"
      >
        Bookmark
      </button>
    </div>
  );
}
