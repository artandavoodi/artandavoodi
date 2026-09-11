# Artistic website foundation

Date: 2026-09-11
Status: local repository foundation only

## Product boundary

`artandavoodi.com` owns the artistic persona and full artistic catalogue.
`artan.live` remains the professional hub and may link to or summarize that work.
Do not maintain independently edited duplicate catalogues after migration.
No catalogue or domain migration has occurred.

## Verified reference architecture

Reference repository: `/Users/artan/Documents/Neuroartan/artan-live`.
Reference HEAD: `ebcf2f0679a0f61bd9fa5be170ee585fdc592bda`.
Its working tree contains startup/theme fixes from the preceding refresher session;
the commit identifier alone does not include those changes.

Reference owners, relative to that repository:

- `docs/assets/js/core/app.js`: app initialization and page dispatch.
- `docs/assets/js/core/fragments.js`: fragment mounting.
- `docs/assets/js/core/02-systems/theme.js`: theme state and storage handling.
- `docs/assets/css/core/00-orchestrator/style.css`: stylesheet entry.
- `docs/assets/css/core/01-tokens/tokens.css`: token bridge.
- `docs/assets/css/core/01-tokens/source/control-center.tokens.css`: imported token source.
- `docs/assets/css/core/01-tokens/source/neuroartan.tokens.css`: imported token source.
- `docs/assets/css/core/01-tokens/source/artan-live.aliases.css`: semantic aliases.
- `docs/assets/css/layers/00-orchestrator/00-layers-all.css`: site layer import.
- `docs/assets/fragments/navigation.html` and `footer.html`: shared chrome.
- `docs/assets/data/music/releases.json`: existing music catalogue for later review.

The Neuroartan website's current token owners also exist under
`/Users/artan/Documents/Neuroartan/website/docs/assets/css/core/01-tokens/`.
The older token copies in artan-live have not yet been compared for equivalence
with those current owners; do that before transferring styles.

## Design implementation gate

Preserve the approved typography, spacing, surfaces, theme behavior, controls and
navigation character. Audit exact dependencies before copying a token source.
Use a deliberate, version-recorded local distribution of approved shared styles
or a shared package once selected; never load sibling filesystem paths in production.
No shared package or synchronization process is claimed to exist yet.
Do not copy the large site stylesheet wholesale or create approximate local values.

## Delivery sequence

1. Local repository and modular folders: created.
2. GitHub repository and remote: public `artandavoodi` created and local `main`
   pushed on 2026-09-11. GitHub Pages is not enabled yet.
3. Token-source audit and minimal deployable shell: pending.
4. Hosting, DNS, custom domain and HTTPS verification: pending.
5. Catalogue migration and content management: pending.

## Verification

Check that `git rev-parse --show-toplevel` resolves to this repository, branch is
`main`, no remote is configured, and sibling repositories remain untouched.
Runtime and visual verification begins after the first page and import chain exist.
