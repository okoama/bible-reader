import type { ReactNode } from 'react';

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
  emptyMessage = 'Select a section to begin reading.',
  children,
}: ContentReaderProps) {
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
        <div className={`mb-6 ${sections.length > 60 ? 'max-h-60 overflow-y-auto border rounded-lg p-2' : 'flex flex-wrap gap-1'}`}>
          <div className={sections.length > 60 ? 'space-y-0.5' : 'flex flex-wrap gap-1'}>
            {sections.map((section) => {
              const isSelected = currentSectionId === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectSection(section.id)}
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
          <div className="flex items-center justify-center gap-2 py-12 text-sm opacity-60">
            <svg className="h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.14 0l-2.83-2.83M9.76 9.76L6.93 6.93" />
            </svg>
            Loading...
          </div>
        ) : currentSectionId ? (
          children
        ) : (
          <p className="py-12 text-center opacity-50 italic">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
