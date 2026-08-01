import { useEffect, useState } from 'react';

const GOLD = '#B8962E';

const ROTATING_MESSAGES = [
  'Opening the scroll…',
  'Turning the pages…',
  'Sharpening the quill…',
  'Consulting the concordance…',
  'Trimming the lamps…',
  'Unrolling the codex…',
  'Gathering the flock…',
  'Preparing the table…',
  'Seeking wisdom…',
  'Lighting the candles…',
  'Weighing the words…',
  'Restoring the illuminated page…',
  'Consulting the Fathers…',
  'Composing in the scriptorium…',
];

const VERSES: Array<{ text: string; ref: string }> = [
  { text: 'Thy word is a lamp unto my feet, and a light unto my path.', ref: 'Psalm 119:105' },
  { text: 'The unfolding of thy words gives light.', ref: 'Psalm 119:130' },
  { text: 'Wisdom is better than rubies.', ref: 'Proverbs 8:11' },
  { text: 'Let the word of Christ dwell in you richly.', ref: 'Colossians 3:16' },
  { text: 'Behold, I have graven thee upon the palms of my hands.', ref: 'Isaiah 49:16' },
  { text: 'Thy testimonies are wonderful.', ref: 'Psalm 119:129' },
  { text: 'The things that have been written are written for our instruction.', ref: 'Romans 15:4' },
  { text: 'Faith cometh by hearing, and hearing by the word of God.', ref: 'Romans 10:17' },
  { text: 'Meditate upon these things; give thyself wholly to them.', ref: '1 Timothy 4:15' },
  { text: 'Thy testimonies are my delight and my counsellors.', ref: 'Psalm 119:24' },
];

type LoadingIndicatorProps = {
  message?: string;
  compact?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  verse?: boolean;
  overlay?: boolean;
};

const SIZES: Record<NonNullable<LoadingIndicatorProps['size']>, { ring: number; cross: string; message: string; gap: string }> = {
  xs: { ring: 14, cross: 'text-[8px]', message: 'text-[11px]', gap: 'gap-1.5' },
  sm: { ring: 22, cross: 'text-xs', message: 'text-xs', gap: 'gap-2' },
  md: { ring: 44, cross: 'text-lg', message: 'text-sm', gap: 'gap-3' },
  lg: { ring: 64, cross: 'text-2xl', message: 'text-base', gap: 'gap-4' },
};

export default function LoadingIndicator({
  message,
  compact = false,
  size = 'md',
  className = '',
  verse = false,
  overlay = false,
}: LoadingIndicatorProps) {
  const [index, setIndex] = useState(0);
  const [verseIndex, setVerseIndex] = useState(0);

  useEffect(() => {
    const labelTimer = setInterval(() => setIndex((i) => (i + 1) % ROTATING_MESSAGES.length), 2600);
    const verseTimer = setInterval(() => setVerseIndex((i) => (i + 1) % VERSES.length), 5200);
    return () => {
      clearInterval(labelTimer);
      clearInterval(verseTimer);
    };
  }, []);

  const label = message ?? ROTATING_MESSAGES[index];
  const dims = SIZES[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center ${dims.gap} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className="relative flex items-center justify-center rounded-full"
        style={{ width: dims.ring, height: dims.ring }}
        aria-hidden="true"
      >
        <span
          className="absolute inset-0 rounded-full border-2 border-dotted"
          style={{ borderColor: 'rgba(185,150,46,0.45)', animation: 'spin 1.6s linear infinite' }}
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: GOLD, animation: 'spin 0.9s linear infinite reverse' }}
        />
        <span
          className="animate-flicker"
          style={{ color: GOLD, textShadow: '0 0 8px rgba(185,150,46,0.65)', filter: 'drop-shadow(0 0 4px rgba(185,150,46,0.5))' }}
        >
          <span className={dims.cross}>✠</span>
        </span>
      </span>
      {!compact && (
        <p className={`font-serif italic tracking-wide ${dims.message}`} style={{ color: GOLD }}>
          {label}
        </p>
      )}
      {!compact && verse && (
        <div className="mt-1 flex max-w-sm flex-col items-center gap-0.5 text-center">
          <span className="flex-1 h-px w-24 bg-gradient-to-r from-transparent via-[#B8962E]/40 to-transparent" />
          <p className="font-serif text-xs leading-snug opacity-70">{VERSES[verseIndex].text}</p>
          <p className="text-[10px] tracking-widest uppercase opacity-40">{VERSES[verseIndex].ref}</p>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={`fixed inset-0 z-[70] flex items-center justify-center bg-[var(--bg)] ${className}`}>
        {content}
      </div>
    );
  }

  return content;
}
