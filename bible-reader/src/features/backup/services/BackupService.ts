import type { ResearchProject, WorkspaceBackup } from '../../../types';
import { db } from '../../../lib/database/database';
import { APP_VERSION, BACKUP_VERSION } from '../../../lib/appInfo';

export class BackupService {
  private normalizeBackup(raw: unknown): WorkspaceBackup {
    const backup = raw as WorkspaceBackup & { exportedAt?: string; appVersion?: string; createdAt?: string };
    if (!backup || typeof backup !== 'object' || typeof backup.version !== 'number' || !backup.data || typeof backup.data !== 'object') {
      throw new Error('Invalid backup file');
    }

    const createdAt = backup.createdAt ?? backup.exportedAt ?? new Date().toISOString();
    const appVersion = backup.appVersion ?? '0.0.0';

    return {
      version: backup.version,
      appVersion,
      createdAt,
      exportedAt: backup.exportedAt,
      data: {
        notes: backup.data.notes ?? [],
        highlights: backup.data.highlights ?? [],
        bookmarks: backup.data.bookmarks ?? [],
        prayers: backup.data.prayers ?? [],
        readingProgress: backup.data.readingProgress ?? [],
        collections: backup.data.collections ?? [],
        projects: backup.data.projects ?? [],
        workspaceSettings: backup.data.workspaceSettings ?? null,
      },
    };
  }

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
      version: BACKUP_VERSION,
      appVersion: APP_VERSION,
      createdAt: new Date().toISOString(),
      data: { notes, highlights, bookmarks, prayers, readingProgress, collections, projects, workspaceSettings },
    };
  }

  private migrateBackup(backup: WorkspaceBackup): WorkspaceBackup {
    if (backup.version === BACKUP_VERSION) {
      return backup;
    }

    // Future backup migration steps go here.
    // Example:
    // if (backup.version === 1) {
    //   backup = migrateFromV1ToV2(backup);
    // }

    return backup;
  }

  async importBackup(rawBackup: unknown): Promise<void> {
    let backup = this.normalizeBackup(rawBackup);
    if (backup.version !== BACKUP_VERSION) {
      // Add future migrations here when backup schema changes.
      // eslint-disable-next-line no-console
      console.warn(`Importing backup version ${backup.version} into app version ${APP_VERSION}`);
      backup = this.migrateBackup(backup);
    }

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
