export type PrayerCategory =
  | 'thanksgiving'
  | 'petitions'
  | 'intercession'
  | 'rosary'
  | 'novena'
  | 'family'
  | 'work'
  | 'study'
  | 'custom'
  | 'prayers';

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
  answered: boolean;
  createdAt: string;
  updatedAt: string;
  lastPrayed: string | null;
  tags: string[];
}

export type PrayerFilterType = 'all' | 'favorites' | 'answered' | 'recent' | 'traditional';

export type PrayerFilter =
  | { type: PrayerFilterType }
  | { type: 'category'; category: PrayerCategory };

export const PRAYER_FILTER_LABELS: Record<PrayerFilterType, string> = {
  all: 'All Prayers',
  favorites: 'Favorites',
  answered: 'Answered',
  recent: 'Recent',
  traditional: 'Traditional',
};
