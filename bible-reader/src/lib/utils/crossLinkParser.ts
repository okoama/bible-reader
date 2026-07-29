import type { CrossLink, CrossLinkType } from '../../types';

const LINK_REGEX = /\[\[(note|prayer|collection|passage|article):([^\]|]+)(?:\|([^\]]*))?\]\]/g;

export function parseCrossLinks(text: string): CrossLink[] {
  const links: CrossLink[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(LINK_REGEX.source, 'g');
  while ((match = re.exec(text)) !== null) {
    links.push({
      type: match[1] as CrossLinkType,
      id: match[2].trim(),
      label: (match[3] ?? match[2]).trim(),
      raw: match[0],
    });
  }
  return links;
}

export function formatCrossLink(type: CrossLinkType, id: string, label?: string): string {
  if (label && label !== id) {
    return `[[${type}:${id}|${label}]]`;
  }
  return `[[${type}:${id}]]`;
}
