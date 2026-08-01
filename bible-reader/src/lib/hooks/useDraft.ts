import { useCallback, useEffect, useRef, useState } from 'react';

export interface DraftData {
  title: string;
  content: string;
  savedAt: string;
}

const DRAFT_PREFIX = 'draft:';
const AUTO_SAVE_INTERVAL = 3000;

function loadDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function saveDraft(key: string, data: DraftData): void {
  try {
    localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(data));
  } catch {}
}

function removeDraft(key: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + key);
  } catch {}
}

export function useDraft(
  draftKey: string,
  title: string,
  content: string,
): {
  hasDraft: boolean;
  restoreDraft: () => DraftData | null;
  clearDraft: () => void;
} {
  const [hasDraft, setHasDraft] = useState(false);
  const titleRef = useRef(title);
  const contentRef = useRef(content);

  useEffect(() => {
    const existing = loadDraft(draftKey);
    if (existing && (existing.title || existing.content)) {
      setHasDraft(true);
    }
  }, [draftKey]);

  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (titleRef.current || contentRef.current) {
        saveDraft(draftKey, {
          title: titleRef.current,
          content: contentRef.current,
          savedAt: new Date().toISOString(),
        });
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [draftKey]);

  const restoreDraft = useCallback((): DraftData | null => {
    const data = loadDraft(draftKey);
    setHasDraft(false);
    return data;
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    removeDraft(draftKey);
    setHasDraft(false);
  }, [draftKey]);

  return { hasDraft, restoreDraft, clearDraft };
}
