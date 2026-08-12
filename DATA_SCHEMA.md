# Filmada data schema

Filmada stores one JSON file per record under `data/`. Every record has a permanent lowercase `id`, a review `status`, human-readable content and relationships expressed through other record IDs.

## Status values

- `draft`: incomplete and not ready for public display
- `needs-review`: imported or submitted information awaiting editorial verification
- `verified`: checked against structured sources
- `published`: approved for public display

## Sources

A finished source contains a short note explaining what it supports and a direct URL. Imported records may temporarily contain a note with a null URL; validation and editorial work should progressively eliminate those.

## Stability

An ID must not change after publication. Names and titles may change without breaking relationships or public URLs.

## Opportunities

Opportunities should contain an official URL and an optional ISO date deadline. Expired opportunities remain available to the historical archive but should not appear among current calls.
