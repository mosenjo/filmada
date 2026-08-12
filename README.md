# Filmada

Filmada is an open, collaborative directory of Madagascar's film and audiovisual field.

Website: [filmada.org](https://filmada.org) · Repository: [mosenjo/filmada](https://github.com/mosenjo/filmada)

It documents the people, films, organisations, places, opportunities, resources and history that shape Malagasy cinema. Its purpose is to make the field easier to discover, understand and join.

## Current status

Filmada is live in French at [filmada.org](https://filmada.org), with an English version under [`/en/`](https://filmada.org/en/). It is published automatically from this repository through GitHub Pages.

The directory currently contains 110 people, 12 films, 5 organisations, 4 places, 11 themes, 9 cinema-history entries and 2 practical guides. Most records recovered from the earlier community directory are marked `needs-review`; verification is an ongoing editorial process rather than a claim that the directory is complete.

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

Visitors can use the French or English form at [filmada.org/contribute](https://filmada.org/contribute/) to prepare a public GitHub contribution. See [CONTRIBUTING.md](CONTRIBUTING.md) for the editorial rules.

The form-based editor at `/admin` is configured for review-based contributions. Its GitHub sign-in requires the separate OAuth setup described in [ADMIN_SETUP.md](ADMIN_SETUP.md); no authentication secret belongs in this public repository.

## Licensing

The website code is available under the [MIT License](LICENSE). Filmada's structured directory data and original editorial text are available under [Creative Commons Attribution 4.0](DATA_LICENSE.md), except where a record or third-party asset states otherwise.
