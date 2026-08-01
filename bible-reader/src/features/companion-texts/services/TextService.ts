import type { TextWork } from '../../../types';

export interface SectionSummary {
  id: string;
  label: string;
}

export interface WorkManifestEntry {
  id: string;
  name: string;
  author?: string;
  group: string;
  dataPath: string;
  order: number;
  sections: SectionSummary[];
}

const WORK_MANIFEST: WorkManifestEntry[] = [
  {
    id: 'catechism',
    name: 'Catechism of the Catholic Church',
    group: 'Catechism',
    dataPath: '/data/catechism.json',
    order: 1,
    sections: [
      { id: 'prologue', label: 'Prologue' },
      { id: 'part-1', label: 'Part I: The Profession of Faith' },
      { id: 'part-2', label: 'Part II: The Celebration of the Christian Mystery' },
      { id: 'part-3', label: 'Part III: Life in Christ' },
      { id: 'part-4', label: 'Part IV: Christian Prayer' },
    ],
  },
  {
    id: 'summa-fp',
    name: 'Prima Pars',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-fp.json',
    order: 2,
    sections: [],
  },
  {
    id: 'summa-fs',
    name: 'Prima Secundae',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-fs.json',
    order: 3,
    sections: [],
  },
  {
    id: 'summa-ss',
    name: 'Secunda Secundae',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-ss.json',
    order: 4,
    sections: [],
  },
  {
    id: 'summa-tp',
    name: 'Tertia Pars',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-tp.json',
    order: 5,
    sections: [],
  },
  {
    id: 'summa-x1',
    name: 'Supplementum',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-x1.json',
    order: 6,
    sections: [],
  },
  {
    id: 'summa-x2',
    name: 'Appendix',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-x2.json',
    order: 7,
    sections: [],
  },
  {
    id: 'summa-xp',
    name: 'Extra',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-xp.json',
    order: 8,
    sections: [],
  },
  {
    id: 'confessions',
    name: 'Confessions',
    author: 'St. Augustine',
    group: 'Confessions',
    dataPath: '/data/confessions.json',
    order: 9,
    sections: [
      { id: 'book-1', label: 'Book I' },
      { id: 'book-2', label: 'Book II' },
      { id: 'book-3', label: 'Book III' },
      { id: 'book-4', label: 'Book IV' },
      { id: 'book-5', label: 'Book V' },
      { id: 'book-6', label: 'Book VI' },
      { id: 'book-7', label: 'Book VII' },
      { id: 'book-8', label: 'Book VIII' },
      { id: 'book-9', label: 'Book IX' },
      { id: 'book-10', label: 'Book X' },
      { id: 'book-11', label: 'Book XI' },
      { id: 'book-12', label: 'Book XII' },
      { id: 'book-13', label: 'Book XIII' },
    ],
  },
  {
    id: 'imitation-book-1',
    name: 'Book 1: Admonitions Profitable for the Spiritual Life',
    author: 'Thomas à Kempis',
    group: 'Imitation of Christ',
    dataPath: '/data/imitation/imitation-book-1.json',
    order: 10,
    sections: [],
  },
  {
    id: 'imitation-book-2',
    name: 'Book 2: Directions for the Interior Life',
    author: 'Thomas à Kempis',
    group: 'Imitation of Christ',
    dataPath: '/data/imitation/imitation-book-2.json',
    order: 11,
    sections: [],
  },
  {
    id: 'imitation-book-3',
    name: 'Book 3: Of Interior Consolation',
    author: 'Thomas à Kempis',
    group: 'Imitation of Christ',
    dataPath: '/data/imitation/imitation-book-3.json',
    order: 12,
    sections: [],
  },
  {
    id: 'imitation-book-4',
    name: 'Book 4: Of the Blessed Sacrament',
    author: 'Thomas à Kempis',
    group: 'Imitation of Christ',
    dataPath: '/data/imitation/imitation-book-4.json',
    order: 13,
    sections: [],
  },
  {
    id: 'devout-life-part-1',
    name: 'Part 1: Counsels and Practices for the Soul\'s Guidance',
    author: 'St. Francis de Sales',
    group: 'Devout Life',
    dataPath: '/data/devout-life/devout-life-part-1.json',
    order: 14,
    sections: [],
  },
  {
    id: 'devout-life-part-2',
    name: 'Part 2: Counsels for Uplifting the Soul to God in Prayer',
    author: 'St. Francis de Sales',
    group: 'Devout Life',
    dataPath: '/data/devout-life/devout-life-part-2.json',
    order: 15,
    sections: [],
  },
  {
    id: 'devout-life-part-3',
    name: 'Part 3: Counsels Concerning the Practice of Virtue',
    author: 'St. Francis de Sales',
    group: 'Devout Life',
    dataPath: '/data/devout-life/devout-life-part-3.json',
    order: 16,
    sections: [],
  },
  {
    id: 'devout-life-part-4',
    name: 'Part 4: Counsels Concerning Ordinary Temptations',
    author: 'St. Francis de Sales',
    group: 'Devout Life',
    dataPath: '/data/devout-life/devout-life-part-4.json',
    order: 17,
    sections: [],
  },
  {
    id: 'devout-life-part-5',
    name: 'Part 5: Counsels for Renewing and Confirming the Soul in Devotion',
    author: 'St. Francis de Sales',
    group: 'Devout Life',
    dataPath: '/data/devout-life/devout-life-part-5.json',
    order: 18,
    sections: [],
  },
];

export interface WorkSummary {
  id: string;
  name: string;
  author?: string;
  group: string;
  sectionCount: number;
  order: number;
}

export class TextService {
  private cache = new Map<string, TextWork>();
  private manifest = WORK_MANIFEST;

  async loadWorks(): Promise<WorkSummary[]> {
    return this.manifest.map((entry) => ({
      id: entry.id,
      name: entry.name,
      author: entry.author,
      group: entry.group,
      sectionCount: entry.sections.length,
      order: entry.order,
    }));
  }

  getManifest(): WorkManifestEntry[] {
    return [...this.manifest];
  }

  getManifestEntry(workId: string): WorkManifestEntry | undefined {
    return this.manifest.find((e) => e.id === workId);
  }

  async loadWork(workId: string): Promise<TextWork> {
    const entry = this.manifest.find((e) => e.id === workId);
    if (!entry) {
      throw new Error(`Unknown work: ${workId}`);
    }

    const cached = this.cache.get(workId);
    if (cached) {
      return cached;
    }

    const dataUrl = new URL(entry.dataPath.replace(/^\//, ''), import.meta.env.BASE_URL).toString();
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${workId}: ${response.statusText}`);
    }

    const data: TextWork = await response.json();
    this.cache.set(workId, data);
    return data;
  }

  async loadSection(workId: string, sectionId: string) {
    const work = await this.loadWork(workId);
    return work.sections.find((s) => s.id === sectionId);
  }

  getGroups(): string[] {
    const groups = new Set(this.manifest.map((e) => e.group));
    return Array.from(groups);
  }

  getWorksByGroup(group: string): WorkManifestEntry[] {
    return this.manifest
      .filter((e) => e.group === group)
      .sort((a, b) => a.order - b.order);
  }
}
