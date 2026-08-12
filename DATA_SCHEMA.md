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

## Cinema history

History records document cinema and audiovisual culture in Madagascar: works, makers, screenings, venues, institutions, festivals, technologies and policy. General national events belong here only when the record explains a direct and sourced effect on cinema.

## Practical guides

Resource guides preserve useful material from earlier Filmada pages while it is checked and updated. Archival examples must never be presented as active calls without confirming their current status, eligibility, deadline and official link.

## Recovered directory records

Records recovered from Filmada's earlier community directory use `archival: true` and remain `needs-review` until the person or an editor confirms them. A recovered person may include a professional name, standardised roles, professional summary, organisation and selected work.

The public repository must not contain private addresses, old telephone numbers, personal email addresses, personal social accounts, equipment inventories or software inventories from the historical spreadsheet. Contact information may be added only when it is current, professional and explicitly approved for publication.
