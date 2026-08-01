import { useRef } from 'react';
import type { ReactNode } from 'react';
import LoadingIndicator from '../../shared/components/LoadingIndicator';

export type ContentSection = {
  id: string;
  label: string;
};

type ContentReaderProps = {
  title: string;
  subtitle?: string;
  sections?: ContentSection[];
  currentSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  showSections?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
};

export default function ContentReader({
  title,
  subtitle,
  sections = [],
  currentSectionId = null,
  onSelectSection,
  showSections = true,
  loading = false,
  loadingMessage = 'Opening the scroll…',
  emptyMessage = 'Select a section to begin reading.',
  children,
}: ContentReaderProps) {
  const sectionsRef = useRef<HTMLDivElement>(null);

  const handleSectionsKeyDown = (e: React.KeyboardEvent) => {
    const container = sectionsRef.current;
    if (!container) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    if (buttons.length === 0) return;
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    e.preventDefault();
    let nextIndex = currentIndex;
    if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = buttons.length - 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
    buttons[nextIndex]?.focus();
  };

  return (
    <div className="mx-auto reading-width reader-card py-8 px-12">
      <h2 className="heading-book">{title}</h2>
      {subtitle && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8962E]/40 to-transparent" />
            <span className="text-xs text-[#B8962E]/60" aria-hidden="true">✠</span>
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8962E]/40 to-transparent" />
          </div>
          <p className="mb-6 text-sm tracking-widest opacity-75 text-center">{subtitle}</p>
        </>
      )}

      {showSections && sections.length > 0 && onSelectSection && (
        <div ref={sectionsRef} onKeyDown={handleSectionsKeyDown} role="group" aria-label={`${title} sections`} className={`mb-6 ${sections.length > 60 ? 'max-h-60 overflow-y-auto border rounded-lg p-2' : 'flex flex-wrap gap-1'}`}>
          <div className={sections.length > 60 ? 'space-y-0.5' : 'flex flex-wrap gap-1'}>
            {sections.map((section) => {
              const isSelected = currentSectionId === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`rounded-xl px-3 py-1.5 text-sm btn-stone ${
                    isSelected ? 'selected' : ''
                  } ${sections.length > 60 ? 'w-full text-left' : ''}`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingIndicator message={loadingMessage} className="py-12" />
        ) : currentSectionId ? (
          children
        ) : (
          <p className="py-12 text-center opacity-50 italic">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
