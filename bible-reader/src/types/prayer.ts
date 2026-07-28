export type PrayerCategory =
  | 'thanksgiving'
  | 'petitions'
  | 'intercession'
  | 'rosary'
  | 'novena'
  | 'family'
  | 'work'
  | 'study'
  | 'custom';

export const PRAYER_CATEGORIES: { value: PrayerCategory; label: string }[] = [
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'petitions', label: 'Petitions' },
  { value: 'intercession', label: 'Intercession' },
  { value: 'rosary', label: 'Rosary' },
  { value: 'novena', label: 'Novena' },
  { value: 'family', label: 'Family' },
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'custom', label: 'Custom' },
];

export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: PrayerCategory;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastPrayed: string | null;
  tags: string[];
}
