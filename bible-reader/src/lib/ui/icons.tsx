import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

export function BibleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 4h18v16H3z" />
      <path d="M3 4h9v16H3z" />
      <path d="M6 8v8" />
      <path d="M2 12h8" />
    </Icon>
  );
}

export function BooksIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4h14v16H4z" />
      <path d="M4 4h7v16H4z" />
      <path d="M14 8l2 1v6l-2 1" />
      <path d="M2 6v14a2 2 0 002 2h14" />
    </Icon>
  );
}

export function CandleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 2c0 3-1 5-1 7s1 3 3 3 3-1 3-3-1-4-1-7c0-1-2-1-4 0z" />
      <path d="M8 12h8v4H8z" />
      <path d="M7 16h10v3a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
      <path d="M12 21v1" />
    </Icon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2l1.5 5 5-1.5-2 4.5 4.5 2-4.5 2 2 4.5-5-1.5L12 22l-1.5-5-5 1.5 2-4.5L3 12l4.5-2-2-4.5 5 1.5z" />
    </Icon>
  );
}

export function GraphIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="12" r="7" />
      <circle cx="15" cy="12" r="7" />
      <path d="M12 9l2 3-2 3-2-3z" />
    </Icon>
  );
}

export function TabletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 16h16v4H4z" />
      <path d="M6 16l2-4h8l2 4" />
      <path d="M14 3c-1 1-2 4-2 6s0 4-2 5" />
      <path d="M16 8l3-3c1-1 1-2 0-3" />
      <path d="M10 14l3-3" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h16" />
      <path d="M4 20l3-8h10l3 8" />
      <path d="M8 12l4-6 4 6" />
      <path d="M12 6v6" />
    </Icon>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 4h18v16H3z" />
      <path d="M3 4h9v16H3z" />
      <path d="M15 8l2 1v6l-2 1" />
      <path d="M17 9v6" />
    </Icon>
  );
}
