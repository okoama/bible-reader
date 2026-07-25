Product Requirements Document: Catholic Study & Annotation Library
Status: Draft Owner: Kiwi (personal project) Platform: Browser-installable web app (PWA), targeting Windows desktop use Audience: Single user, personal tool, no accounts/sign-in

1. Overview
A personal study and annotation workspace for Catholic scripture and spiritual classics. The app bundles five public-domain texts important to Catholic study and devotion, and lets the user read, highlight, annotate, and write commentary and prayers tied directly to specific passages — all stored locally/offline, with no copyrighted content requiring a license or live API dependency.
This is a web app that installs like a native app (via Edge/Chrome "Install"), not a compiled .exe. It opens in its own window, appears in the Start menu, and works offline for reading once installed. This is a deliberate scope tradeoff, not a limitation the user is unaware of.
2. Goals
Provide one unified place to read, highlight, and annotate Catholic scripture and classic spiritual works
Include the full Catholic canon (with deuterocanonical books) — non-negotiable
Support long-form commentary and short prayers, not just highlights
Work fully offline for reading; no ongoing API costs or internet dependency
Feel like a dedicated study desk: multiple texts, notes, and prayers visible and navigable at once, not a single scrolling page
3. Non-goals (out of scope for v1)
Multi-user accounts, sign-in, or cloud sync across devices
A native compiled Windows executable
Licensed/copyrighted translations (RSV-CE, NRSV-CE, NABRE, ESV-CE, NIV, etc.)
Editing or correcting the source texts themselves
Audio/video content, liturgical calendar, or Mass readings
Mobile-first design (desktop study use is the primary case, though the PWA may incidentally work on mobile)
4. Content Library (v1)
All five texts are public domain and bundled directly into the app (no live fetch required for reading):
Text
Structure
Catholic Bible
Old Testament + New Testament, grouped with deuterocanonical books in proper Catholic order (Tobit, Judith, Wisdom, Sirach, Baruch, 1–2 Maccabees, plus additions to Daniel and Esther)
Summa Theologiae (Aquinas)
Part → Question → Article, each Article showing Objections → Sed Contra ("On the contrary") → Respondeo ("I answer that") → Replies to Objections
Catechism of the Catholic Church
Four parts (Creed, Sacraments, Commandments, Prayer), navigable/linkable by numbered paragraph
The Imitation of Christ (à Kempis)
Four books, each with chapters
Confessions of St. Augustine
Thirteen books, each with chapters
Introduction to the Devout Life (St. Francis de Sales)
Five parts, each with chapters

4.1 Bible translation — open decision
Every officially approved Catholic translation (RSV-CE, RSV-2CE, NRSV-CE, NABRE, ESV-CE) is copyrighted and unavailable for free bundling or offline use; API routes either cost money, forbid local storage, or omit the deuterocanonical books entirely (confirmed for ESV API specifically). Two public-domain options remain, both including the full Catholic canon:
World English Bible with Deuterocanon (WEBBE) — modern, easy-reading English; fully public domain; no imprimatur
Catholic Public Domain Version (CPDV) — translated from the Latin Vulgate using Challoner's Douay-Rheims as a guide; more traditional register; fully public domain
(Douay-Rheims 1899 remains available as a fallback but was explicitly deprioritized for its archaic English)
Decision needed before build: WEB w/ Deuterocanon, CPDV, or both with a toggle. Recommendation: WEB w/ Deuterocanon for readability, unless the more traditional/Vulgate-adjacent register of CPDV matters more than ease of reading.
5. Core Features
5.1 Readers
Bible reader: book/chapter navigation tree (OT/NT, deuterocanon inline in Catholic order); selectable verse-level text; remembers last position per book
Summa reader: Part/Question/Article navigation tree; structured display per article (Objections / Sed Contra / Respondeo / Replies)
Companion texts reader: shared reader component for Catechism, Imitation of Christ, Confessions, and Introduction to the Devout Life, each respecting its native structure (paragraph numbers for the Catechism, book/chapter for the other three)
5.2 Annotation system
Highlight any passage (verse, paragraph, or article) with color-coded highlights
Attach a note or longer-form commentary to any highlighted passage or arbitrary location, with rich text formatting (bold, italics, headings, lists)
Bookmarks for quick return to specific passages
Tagging on notes/commentary, with filtering by book, tag, or type (note vs. commentary)
Full-text search across all personal notes and commentary
Clicking a note/highlight from a list jumps directly back to its source passage
5.3 Prayers
Personal prayer journal: write, edit, and store prayers
Organize by category (intercession, thanksgiving, novenas, Rosary, liturgical, user-defined categories)
Starter collection of well-known traditional prayers (Our Father, Hail Mary, Memorare, Act of Contrition, etc.), editable/extendable by the user
Mark favorites, search prayers, focused single-prayer reading view
5.4 Layout
Desktop-style three-pane layout: left sidebar (library/navigation), center pane (reading), right pane (notes/prayers for current passage)
Illuminated-manuscript-inspired visual style: cream/parchment backgrounds, crimson and gold accents, serif type for source text, clean sans/serif for personal notes
6. Data Model (conceptual)
Bundled content (read-only, ships with the app):
Books (Bible) — id, name, testament, canonical order
Verses — book_id, chapter, verse, text
SummaArticles — part, question, article, objections[], sed_contra, respondeo, replies[]
CompanionWorks — work_id, title, structure_type
CompanionSections — work_id, part/book, chapter/paragraph_number, text
User data (stored locally, the only thing persisted to a database):
Highlights — id, source_type, source_ref, color, created_at
Notes — id, source_type, source_ref (nullable, for free-standing notes), body (rich text), type (note/commentary), tags[], created_at
Bookmarks — id, source_type, source_ref, label, created_at
Prayers — id, title, body, category, is_favorite, created_at
ReadingProgress — work_id, last_position
7. Non-functional requirements
Offline-first for reading: all five bundled texts must be readable with no internet connection once installed
Privacy: only the user's own notes/prayers/highlights touch a database; source texts are static bundled content
No ongoing cost: no paid API dependency for core reading functionality
Installable: must support "Install app" flow in Edge/Chrome, producing a Start-menu-accessible window distinct from a browser tab
8. Open questions
Bible translation: WEB w/ Deuterocanon vs. CPDV vs. both with a toggle (§4.1)
Should highlight colors carry semantic meaning (e.g., a fixed palette with suggested uses) or be freeform?
Any additional companion texts planned for a later version (e.g., other saints' writings), which might affect how generically the companion-text reader should be built now?
Export/backup: is a manual export of notes/prayers (e.g., to a file) needed in v1, or is local persistence sufficient for now?
9. Success criteria for v1
All five texts are fully readable offline with correct structural navigation
A highlight + note can be created on any passage in any of the five texts and correctly re-opens that passage when clicked from a notes list
Prayers can be created, categorized, favorited, and searched
The app installs on Windows via Edge/Chrome and opens in its own window without a browser address bar
No copyrighted text is bundled or fetched