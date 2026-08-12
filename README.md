# Filmada

Filmada is an open, collaborative directory of Madagascar's film and audiovisual field.

It documents the people, films, organisations, places, opportunities, resources and history that shape Malagasy cinema. Its purpose is to make the field easier to discover, understand and join.

## Current status

Filmada is being rebuilt in public. Its initial dataset was migrated from a 2026 prototype and currently contains 10 people, 12 films, 4 places, 11 themes and 6 historical entries.

Imported records are marked `needs-review`. Their source notes are leads for editors, not finished citations.

## Principles

- Open data, open code and traceable changes
- Reliable sources and respectful descriptions
- Forms that non-technical contributors can use
- A small editorial workflow instead of anonymous editing
- Stable, portable data that does not depend on one hosting provider
- Low maintenance by design

## Collections

- People
- Films and audiovisual works
- Organisations
- Opportunities
- Resources
- History
- Places and themes used to connect the directory

## Local preview

Requires Node.js 22 or newer.

```sh
npm run check
npm run build
npm run dev
```

No package installation is required. The production website is written to `dist/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Filmada is preparing a form-based editorial interface at `/admin` so contributors will not need to edit JSON or use Git directly.

## Licensing

The intended licensing model is MIT for the website code and Creative Commons Attribution 4.0 for the directory data and original editorial text. The final license files will be added after the project owner confirms this choice and before the repository is made public.
