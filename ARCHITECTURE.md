# Architecture

## Stack

- React
- TypeScript
- Vite
- Tailwind

## Storage

- Local-first persistence via IndexedDB
- User annotations and study data stored in Dexie
- Bundled public-domain texts are shipped with the app as static data

## Data Flow

Bundled content
↓
Readers / content loaders
↓
Repositories
↓
React components

## Bible Data Structure

### Books

- Books are identified by a stable string ID such as `genesis`, `matthew`, or `tobit`.
- The app uses these IDs for navigation, references, and reading progress.
- Book metadata should include the display title and canonical ordering information.

### Chapters

- Chapters are organized as an array of chapter records under each book.
- Each chapter is typically keyed by its chapter number, such as `1`, `2`, `3`.
- Chapter-level structure is used for navigation and for grouping verses.

### Verses

- Verses are stored as individual records or as entries inside a chapter's verse array.
- Each verse should include at least:
  - `id` or `verseId`
  - `chapter`
  - `verse`
  - `text`
- The storage shape should be simple and predictable for rendering in the reader.

### Deuterocanonical Books

- Yes, deuterocanonical books are included in the Catholic Bible structure.
- In the app model, they should be treated as first-class books in the same data set as the rest of the Bible.
- Their placement should follow the Catholic ordering used in the PRD.

### Verse Formatting

- Verses should be stored as plain text by default.
- If formatting is needed later, it should be represented explicitly rather than embedded in the raw text.
- The initial model should avoid mixing formatting markup with the content itself unless the UI requires it.

## User Data Model

- Notes
- Highlights
- Bookmarks
- Prayers
- Reading progress

These are stored locally and are separate from the bundled Bible content.

## Annotation Workflow
User selects text
Selection toolbar appears
Choose:
- Highlight
- Note
- Bookmark
Save
Stored in IndexedDB
Annotation appears immediately