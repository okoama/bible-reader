# Folder Structure

This section describes the key folders in the repository.

## Root

- `AGENTS.md` — workspace agent guidance.
- `ARCHITECTURE.md` — high-level architecture notes.
- `CHANGELOG.md` — project change log.
- `README.md` — user-facing project overview.
- `PRD.md` — product requirements document.
- `TODO.md` — local task list.
- `docs/` — developer documentation.

## `bible-reader/`

The main application folder.

### Top-level files

- `package.json` — app dependencies and scripts.
- `tsconfig.json` — TypeScript configuration.
- `tsconfig.app.json` — app-specific build settings.
- `tsconfig.node.json` — Node-specific build settings.
- `vite.config.ts` — Vite build configuration.
- `index.html` — app shell entry point.
- `README.md` — local app readme.
- `eslint.config.js` — lint rules.

### `public/`

Contains static assets.

- `manifest.webmanifest` — PWA manifest.
- `sw.js` — service worker.
- `icons/` — app icon files.
- `data/` — bundled content sources.
  - `bible/` — Bible JSON files.
  - `catechism.json` — Catechism content.
  - `confessions.json` — Confessions content.
  - `devout-life/` — Devout Life content.
  - `imitation/` — Imitation of Christ content.
  - `summa/` — Summa Theologiae content.

### `src/`

Contains application code.

- `App.tsx` — root app component.
- `main.tsx` — React entry point.
- `index.css` — global styles and Tailwind import.

#### `src/components/`

Shared UI primitives and layout components.

- `header/`
- `sidebar/`
- `right-panel/`
- `status-bar/`
- `tabs/`
- `toast/`

#### `src/features/`

Feature domains organized by responsibility.

- `annotations/`
- `backup/`
- `bible/`
- `bookmarks/`
- `collections/`
- `companion-texts/`
- `dashboard/`
- `favorites/`
- `help/`
- `knowledge-graph/`
- `notes/`
- `prayers/`
- `projects/`
- `reader/`
- `search/`
- `settings/`
- `study-sessions/`
- `shared/`

#### `src/layouts/`

- `AppLayout.tsx` — app shell and main layout.

#### `src/lib/`

Utilities, data access, and shared logic.

- `constants.ts` — app-wide constants.
- `contexts/` — React context providers.
- `database/` — Dexie database schema and initialization.
- `hooks/` — reusable hooks.
- `repositories/` — data access wrappers.
- `ui/` — UI utilities.
- `utils/` — general helpers.

#### `src/types/`

Shared TypeScript models.

- `bibleBook.ts`
- `bibleChapter.ts`
- `bibleVerse.ts`
- `bookmark.ts`
- `collection.ts`
- `crossLink.ts`
- `highlight.ts`
- `index.ts`
- `knowledgeGraph.ts`
- `note.ts`
- `prayer.ts`
- `readingProgress.ts`
- `researchProject.ts`
- `studySession.ts`
- `tab.ts`
- `textWork.ts`
- `verseFavorite.ts`
- `verseRef.ts`
- `workspaceBackup.ts`
- `workspaceSettings.ts`

### `tools/`

Utility scripts used for asset generation and data preparation.

- `pwa-icons/` — icon generation script.
- `bible-importer/` — importer placeholders for Bible data.
- `text-importer/` — importer placeholders for companion text data.
