# Database

The app persists user data in IndexedDB using Dexie.

## Database file

- `bible-reader/src/lib/database/database.ts`

This file defines the schema and version history for the local database.

## Tables

- `notes`
- `highlights`
- `bookmarks`
- `prayers`
- `readingProgress`
- `collections`
- `sessions`
- `projects`
- `verseFavorites`

## Version history

The schema has evolved through Dexie versions:

- `version(2)` adds notes, highlights, bookmarks, prayers, readingProgress
- `version(3)` adds prayer categories, favorites, tags, and lastPrayed
- `version(4)` adds prayer `answered`
- `version(5)` adds favorites for notes and bookmarks
- `version(6)` adds collections
- `version(7)` adds sessions
- `version(8)` adds projects
- `version(9)` adds project associations on notes, bookmarks, prayers, and collections
- `version(10)` adds verse favorites
- `version(11)` cleans up prayer indexes

## Repositories

Each data type has a repository wrapper in `bible-reader/src/lib/repositories/`.

Examples:

- `BookmarkRepository.ts`
- `CollectionRepository.ts`
- `HighlightRepository.ts`
- `NoteRepository.ts`
- `PrayerRepository.ts`
- `ReadingProgressRepository.ts`
- `ResearchProjectRepository.ts`
- `StudySessionRepository.ts`
- `VerseFavoriteRepository.ts`

These repositories provide data access methods and abstract Dexie usage from UI components.

## Backup schema

Backup metadata is defined in `bible-reader/src/types/workspaceBackup.ts`.

A workspace backup contains:

- `version` — backup schema version
- `appVersion` — application version
- `createdAt` — backup creation timestamp
- `exportedAt` — optional export time
- `data` — workspace payload
  - `notes`
  - `highlights`
  - `bookmarks`
  - `prayers`
  - `readingProgress`
  - `collections`
  - `projects` (optional)
  - `workspaceSettings`

## Backup service

- `bible-reader/src/features/backup/services/BackupService.ts`

This service:

- exports current DB state into a versioned backup object
- downloads backups as JSON
- imports backups with normalization and migration
- restores notes, highlights, bookmarks, prayers, reading progress, collections, projects, and settings
