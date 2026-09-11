# Artan Davoodi

Independent artistic website for music releases, artistic publications, and artwork.
Intended domain: `artandavoodi.com`.

`artan.live` remains the professional hub and public resume. This repository owns
the artistic website only; cross-links will connect the two sites.

## Current status

Local repository foundation created on 2026-09-11, on branch `main`.
No runtime page, GitHub remote, deployment, or custom-domain binding exists yet.
Folder markers preserve the intended structure until their first owner files are added.

## Architecture

Follow the audited `artan-live` separation:

- `docs/`: deployable public site, with a lightweight root HTML mount shell later.
- `docs/assets/fragments/`: navigation, footer, and section HTML structures.
- `docs/assets/data/`: JSON content, release/publication records and configuration.
- `docs/assets/css/core/`: global token bridge, foundations, and style entry point.
- `docs/assets/css/layers/`: site/section CSS and layer importer.
- `docs/assets/js/core/`: app entry, fragment loading, and shared systems.
- `docs/assets/js/layers/`: section importers and data renderers.
- `docs/assets/media/`: approved artwork and media.
- `tools/`: local validation tools.
- `planning/`: architecture decisions and implementation continuity.

HTML mounts structure; JSON owns content; JS loads and renders; CSS consumes the
shared design tokens. Do not embed styling, content registries, or runtime logic
into the page shell.

## Next steps

1. Create and connect the GitHub repository after confirming account and visibility.
2. Implement a minimal publishable shell using the audited shared style source.
3. Verify the deployed site, then configure the custom domain and HTTPS.
4. Add and manage artistic content through JSON and modular renderers.

The domain cannot serve this repository until a deployable shell and hosting exist.
See `planning/architecture.md` for the audited design references.
## Asset foundation

Public media is separated into portrait, gallery, music (albums, EPs, singles),
publications and brand folders. JSON catalogue registration lives in
`docs/assets/data/site.json`; empty catalogues wait for approved content.
Run `node tools/validate-assets.mjs` to check catalogue structure and media paths.
See `planning/assets.md` for record rules and `planning/TODO.md` for the ordered
GitHub, deployment, domain, iCloud+ email and deferred migration work.
