import type { TextWork } from '../../../types';

interface WorkManifestEntry {
  id: string;
  name: string;
  author?: string;
  group: string;
  dataPath: string;
  order: number;
}

const WORK_MANIFEST: WorkManifestEntry[] = [
  {
    id: 'catechism',
    name: 'Catechism of the Catholic Church',
    group: 'Catechism',
    dataPath: '/data/catechism.json',
    order: 1,
  },
  {
    id: 'summa-fp',
    name: 'Prima Pars',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-fp.json',
    order: 2,
  },
  {
    id: 'summa-fs',
    name: 'Prima Secundae',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-fs.json',
    order: 3,
  },
  {
    id: 'summa-ss',
    name: 'Secunda Secundae',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-ss.json',
    order: 4,
  },
  {
    id: 'summa-tp',
    name: 'Tertia Pars',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-tp.json',
    order: 5,
  },
  {
    id: 'summa-x1',
    name: 'Supplementum',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-x1.json',
    order: 6,
  },
  {
    id: 'summa-x2',
    name: 'Appendix',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-x2.json',
    order: 7,
  },
  {
    id: 'summa-xp',
    name: 'Extra',
    author: 'St. Thomas Aquinas',
    group: 'Summa Theologiae',
    dataPath: '/data/summa/summa-xp.json',
    order: 8,
  },
  {
    id: 'confessions',
    name: 'Confessions',
    author: 'St. Augustine',
    group: 'Confessions',
    dataPath: '/data/confessions.json',
    order: 9,
  },
  {
    id: 'imitation',
    name: 'The Imitation of Christ',
    author: 'Thomas à Kempis',
    group: 'Imitation of Christ',
    dataPath: '/data/imitation.json',
    order: 10,
  },
  {
    id: 'devout-life',
    name: 'Introduction to the Devout Life',
    author: 'St. Francis de Sales',
    group: 'Devout Life',
    dataPath: '/data/devout-life.json',
    order: 11,
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
      sectionCount: 0,
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

    const response = await fetch(entry.dataPath);
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
