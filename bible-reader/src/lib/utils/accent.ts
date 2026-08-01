import type { AccentName } from '../../types';

export const ACCENT_COLORS: Record<AccentName, { base: string; hover: string; light: string; lighter: string; ring: string }> = {
  blue: { base: '#2563eb', hover: '#1d4ed8', light: '#eff6ff', lighter: '#dbeafe', ring: '#3b82f6' },
  emerald: { base: '#059669', hover: '#047857', light: '#ecfdf5', lighter: '#d1fae5', ring: '#10b981' },
  violet: { base: '#7c3aed', hover: '#6d28d9', light: '#f5f3ff', lighter: '#ede9fe', ring: '#8b5cf6' },
  amber: { base: '#d97706', hover: '#b45309', light: '#fffbeb', lighter: '#fef3c7', ring: '#f59e0b' },
  rose: { base: '#e11d48', hover: '#be123c', light: '#fff1f2', lighter: '#fce7f3', ring: '#f43f5e' },
};
