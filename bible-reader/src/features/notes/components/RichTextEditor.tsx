import { useCallback, useEffect, useRef, useState } from 'react';
import InsertLinkModal from './InsertLinkModal';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
};

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write here...',
  rows = 6,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const skipNextSync = useRef(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, []);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    skipNextSync.current = true;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      exec('insertHTML', '&emsp;');
    }
  }, []);

  const handleInsertLink = useCallback((syntax: string) => {
    if (!ref.current) return;
    ref.current.focus();
    exec('insertText', syntax);
    handleInput();
  }, [handleInput]);

  const minH = rows * 1.5;

  return (
    <div className="rounded-md border transition-colors duration-150 focus-within:border-[var(--accent)] focus-within:ring-[var(--accent-light)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-1 py-1">
        <ToolBtn onClick={() => exec('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Heading 2">
          H2
        </ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h3')} title="Heading 3">
          H3
        </ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraph">
          P
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bullet list">
          &#8226;
        </ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Numbered list">
          1.
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('formatBlock', 'blockquote')} title="Blockquote">
          &ldquo;
        </ToolBtn>
        <ToolBtn onClick={() => {
          const ref = window.prompt('Scripture reference (e.g. John 3:16):');
          if (ref) {
            exec('insertHTML', `<span class="scripture-ref" style="color:#2563eb;font-style:italic">${escapeHtml(ref)}</span>&nbsp;`);
          }
        }} title="Scripture reference">
          &#x2710;
        </ToolBtn>
        <ToolBtn onClick={() => setShowLinkModal(true)} title="Insert cross-link">
          &#x1F517;
        </ToolBtn>
        <ToolBtn onClick={() => exec('removeFormat')} title="Clear formatting">
          &#x2717;
        </ToolBtn>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="p-3 text-sm outline-none empty:before:pointer-events-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-70 [&_blockquote]:my-2"
        style={{ minHeight: `${minH}rem` }}
      />

      {showLinkModal && (
        <InsertLinkModal
          onInsert={handleInsertLink}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}

function ToolBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      className="rounded px-1.5 py-0.5 text-xs leading-none transition-colors duration-150 hover-bg"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-4 w-px bg-gray-200" />;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
