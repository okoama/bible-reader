# Architecture

## Overview

`Bible Reader` is a local-first, installable progressive web app built with React, TypeScript, Tailwind CSS, and Vite.

The app bundles public-domain Catholic texts and stores user data in IndexedDB via Dexie. It is designed for desktop study use and supports offline reading, local backups, projects, and annotations.

## Core layers

- `public/` — static assets, PWA manifest, service worker, bundled text sources.
- `src/` — application source.
  - `components/` — shared UI and layout components.
  - `features/` — feature-specific domains such as bible, reader, backup, notes, prayers, projects, search, settings, graph.
  - `layouts/` — application shell and page layout.
  - `lib/` — lower-level utilities, database, repositories, contexts, hooks.
  - `types/` — shared domain models and type definitions.

## Technology stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Dexie for IndexedDB persistence

## Data flow

1. Static text data is loaded from `public/data/`.
2. Reader and text services normalize manifest entries.
3. UI components render content and manage user interactions.
4. User data is persisted through Dexie repositories.
5. Backup/export logic serializes workspace state into a versioned JSON object.

## PWA support

- `public/manifest.webmanifest` declares icons, theme color, and display settings.
- `public/sw.js` caches app shell assets and provides navigation fallback.
- `src/components/status-bar/StatusBar.tsx` handles the install prompt UI.

## Offline behavior

- Bundled text is available from `public/data/`.
- The service worker precaches shell assets and routes navigation requests to `index.html`.
- User data is stored locally in IndexedDB and remains available when offline.

## Design intent

- No backend dependency
- Local-only persistence and privacy
- Installable desktop-style study environment
- First-class support for Catholic canon and public domain spiritual works
