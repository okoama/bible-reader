# Bible Reader

Catholic Study Desk is a local-first reading and annotation workspace for Catholic Scripture and spiritual classics. It is built as a PWA so it can install in Chrome/Edge, run in its own window, and work offline after installation.

## Overview

This app bundles public-domain Catholic texts and provides a lightweight reader experience with annotations, project organization, bookmarks, highlights, notes, and devotional tracking. The entire workspace and user data are stored locally in the browser, so the app works without a backend or online service.

## Features

- Full offline reading experience
- Installable PWA with desktop/start menu support
- Bible reading with chapter/verse navigation
- Offline highlights, bookmarks, and notes
- Research projects for organizing study themes
- Collections and custom devotional passages
- Workspace backup and restore with versioned metadata
- Dark-themed user interface and focused study layout
- Keyboard shortcuts and accessible navigation

## Screenshots

> Replace these image references with actual screenshots from your app.

- Dashboard overview
  ![Dashboard screenshot](./assets/screenshots/dashboard.png)
- Reading view with highlights and notes
  ![Reader screenshot](./assets/screenshots/reader.png)
- Project editor and workspace panel
  ![Project editor screenshot](./assets/screenshots/project-editor.png)

## Installation

1. Install Node.js 18+ if needed.
2. Open a terminal and navigate to the app folder:

```bash
cd bible-reader/bible-reader
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open the URL shown in the terminal (usually `http://localhost:5173`).

## Development Setup

- Run lint checks:

```bash
npm run lint
```

- Build the production bundle:

```bash
npm run build
```

- Preview the production build:

```bash
npm run preview
```

## Project Structure

- `bible-reader/` — main application folder
  - `public/` — static assets, bundled text data, PWA manifest, service worker
  - `src/` — application source code
    - `components/` — shared UI components and layout pieces
    - `features/` — feature modules such as reader, backup, bookmarks, projects, search, and settings
    - `lib/` — utility code, database, hooks, and contexts
    - `types/` — shared TypeScript interfaces and domain models
    - `layouts/` — application shell and main layout
  - `tools/` — helper scripts for generating assets and importing text

## License

This project is licensed under the MIT License. See `package-lock.json` for license metadata.

## Credits

- Built with React, Vite, and Tailwind CSS
- Public-domain Catholic texts included for offline study
- Designed for local-first, installable, offline-first use
