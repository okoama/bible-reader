import { useEffect, useRef, useState } from 'react';
import type { SelectedVerse, TextSelection } from '../hooks/useTextSelection';
import { HIGHLIGHT_COLORS } from '../../../lib/constants';

type AnnotationToolbarProps = {
  selection: TextSelection;
  onHighlight: (text: string, verses: SelectedVerse[], color: string) => void;
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
  const [showColors, setShowColors] = useState(false);

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
  }, [selection, showColors]);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      style={{ position: 'fixed', left: position.left, top: position.top }}
      className="z-50 flex items-center gap-0.5 rounded-lg border bg-white px-1.5 py-1 shadow-lg animate-fade-in"
    >
      {showColors ? (
        <>
          <div className="flex items-center gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                onClick={() => {
                  onHighlight(selection.text, selection.verses, c.value);
                  setShowColors(false);
                }}
                className="h-5 w-5 rounded-full border border-gray-300 transition-all duration-150 hover:scale-125 hover:shadow-sm"
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          <div className="mx-1 h-4 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => setShowColors(false)}
            className="rounded px-2 py-1 text-xs transition-colors duration-150 hover:bg-gray-100"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowColors(true)}
            className="rounded px-2 py-1 text-sm transition-colors duration-150 hover:bg-amber-100 hover:text-amber-800"
          >
            Highlight
          </button>
          <button
            type="button"
            onClick={() => onNote(selection.text, selection.verses)}
            className="rounded px-2 py-1 text-sm transition-colors duration-150 hover:bg-accent-lighter hover:text-accent-hover"
          >
            Note
          </button>
          <button
            type="button"
            onClick={() => onBookmark(selection.verses)}
            className="rounded px-2 py-1 text-sm transition-colors duration-150 hover:bg-gray-100"
          >
            Bookmark
          </button>
        </>
      )}
    </div>
  );
}
