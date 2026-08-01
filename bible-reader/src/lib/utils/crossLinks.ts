import type { CrossLinkType } from '../../types';

export function formatCrossLink(type: CrossLinkType, id: string, label?: string): string {
  if (label && label !== id) {
    return `[[${type}:${id}|${label}]]`;
  }
  return `[[${type}:${id}]]`;
}
