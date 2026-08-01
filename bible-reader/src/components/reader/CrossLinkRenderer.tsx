import { useCallback, useRef } from 'react';
import type { CrossLinkType } from '../../types';

const LINK_RE = /\[\[(note|prayer|collection|passage|article):([^\]|]+)(?:\|([^\]]*))?\]\]/;
const LINK_RE_G = /\[\[(note|prayer|collection|passage|article):([^\]|]+)(?:\|([^\]]*))?\]\]/g;

type CrossLinkRendererProps = {
  html: string;
  onNavigate: (type: CrossLinkType, id: string) => void;
};

export default function CrossLinkRenderer({ html, onNavigate }: CrossLinkRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const el = target.closest('[data-crosslink-type]') as HTMLElement | null;
    if (el) {
      const type = el.getAttribute('data-crosslink-type') as CrossLinkType;
      const id = el.getAttribute('data-crosslink-id') ?? '';
      e.preventDefault();
      e.stopPropagation();
      onNavigate(type, id);
    }
  }, [onNavigate]);

  if (!LINK_RE.test(html)) {
    return <div ref={ref} className="prose-sm" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const rendered = html.replace(LINK_RE_G, (_match, type: string, id: string, label?: string) => {
    const display = (label ?? id).trim();
    return `<span data-crosslink-type="${type}" data-crosslink-id="${id.trim()}" style="color:#2563eb;text-decoration:underline;cursor:pointer;">${display}</span>`;
  });

  return (
    <div
      ref={ref}
      className="prose-sm"
      dangerouslySetInnerHTML={{ __html: rendered }}
      onClick={handleClick}
    />
  );
}
