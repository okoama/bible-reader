import type { ResearchProject, WorkspaceBackup } from '../../../types';
import { db } from '../../../lib/database/database';

export class BackupService {
  async exportBackup(): Promise<WorkspaceBackup> {
    const [notes, highlights, bookmarks, prayers, readingProgress, collections, projects] = await Promise.all([
      db.notes.toArray(),
      db.highlights.toArray(),
      db.bookmarks.toArray(),
      db.prayers.toArray(),
      db.readingProgress.toArray(),
      db.collections.toArray(),
      db.projects.toArray(),
    ]);

    let workspaceSettings = null;
    try {
      const raw = localStorage.getItem('workspace-settings');
      if (raw) workspaceSettings = JSON.parse(raw);
    } catch {}

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { notes, highlights, bookmarks, prayers, readingProgress, collections, projects, workspaceSettings },
    };
  }

  async importBackup(backup: WorkspaceBackup): Promise<void> {
    if (!backup || backup.version !== 1) throw new Error('Invalid backup file');

    await db.transaction(
      'rw',
      [db.notes, db.highlights, db.bookmarks, db.prayers, db.readingProgress, db.collections, db.projects],
      async () => {
        await Promise.all([
          db.notes.clear(),
          db.highlights.clear(),
          db.bookmarks.clear(),
          db.prayers.clear(),
          db.readingProgress.clear(),
          db.collections.clear(),
          db.projects.clear(),
        ]);
        await Promise.all([
          db.notes.bulkAdd(backup.data.notes),
          db.highlights.bulkAdd(backup.data.highlights),
          db.bookmarks.bulkAdd(backup.data.bookmarks),
          db.prayers.bulkAdd(backup.data.prayers),
          db.readingProgress.bulkAdd(backup.data.readingProgress),
          db.collections.bulkAdd(backup.data.collections),
          db.projects.bulkAdd(backup.data.projects ?? []),
        ]);
      },
    );

    if (backup.data.workspaceSettings) {
      localStorage.setItem('workspace-settings', JSON.stringify(backup.data.workspaceSettings));
    }
  }

  downloadBackup(backup: WorkspaceBackup): void {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible-reader-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
