# Importers

This project includes tooling for generating app assets and preparing text data.

## PWA icon generator

- `bible-reader/bible-reader/tools/pwa-icons/generate-icons.mjs`

This Node script generates the app icon files used by the PWA manifest:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`
- `public/icons/apple-touch-icon-180.png`

The script renders a small icon using custom vector math and writes PNG files.

## Text import pipeline

The repo contains placeholder importer directories for source data preparation:

- `bible-reader/bible-reader/tools/bible-importer/`
- `bible-reader/bible-reader/tools/text-importer/`

These directories are intended for tooling that converts raw text sources into the JSON structures used by the app. They are not currently populated with source scripts in this repository.

## Static data sources

Bundled text data is stored under:

- `bible-reader/bible-reader/public/data/bible/`
- `bible-reader/bible-reader/public/data/catechism.json`
- `bible-reader/bible-reader/public/data/confessions.json`
- `bible-reader/bible-reader/public/data/devout-life/`
- `bible-reader/bible-reader/public/data/imitation/`
- `bible-reader/bible-reader/public/data/summa/`

## Updating static data

If new public-domain texts are added:

1. Create a manifest entry in the relevant text service.
2. Add the new JSON data to `public/data/`.
3. Update navigation and reader routing to recognize the new work.

Note: The app does not currently include a documented import workflow for raw source text files.
