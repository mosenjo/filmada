# Filmada editor setup

Filmada's `/admin/` interface uses Decap CMS with GitHub Open Authoring and the editorial workflow. Contributors without repository access work in a fork and submit a pull request; maintainers retain control of publication.

## Authentication still required

GitHub requires a server-side OAuth exchange. GitHub Pages cannot safely store or use the OAuth client secret, so Filmada needs a small OAuth proxy on a separate HTTPS endpoint before sign-in can work.

The remaining account-side setup is:

1. Create a GitHub OAuth App owned by the Filmada repository steward.
2. Set its homepage to `https://filmada.org/` and its callback to the OAuth proxy's `/callback` endpoint.
3. Deploy a maintained Decap-compatible OAuth proxy on a separate host or subdomain.
4. Store the GitHub client secret only in that host's encrypted secret storage.
5. Add the proxy's public `base_url` and `auth_endpoint` to `public/admin/config.yml`.
6. Test sign-in first with the steward account and then with a GitHub user who has no repository access.

Never commit the OAuth client secret, access tokens or contributor credentials to this repository.

## Acceptance test

Before announcing `/admin/` publicly, verify that:

- a contributor can sign in without repository access;
- saving creates a branch in the contributor's fork;
- “Ready for review” opens a pull request rather than publishing;
- validation runs on the pull request;
- an invalid record cannot be merged;
- merging a valid record deploys the site;
- French and English content stay synchronized.

The last point needs special attention because Filmada currently stores French editorial translations separately in `data/translations.fr.json`.
