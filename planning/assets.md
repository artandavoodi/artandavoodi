# Asset and content ownership

## Status

2026-09-11: local asset foundation. Catalogues are intentionally empty until
content is selected; no invented releases, biography, photos, or cover images.
The existing artan-live catalogue remains unchanged.

## Directory contract

All paths below are relative to `docs/`. Public media belongs here, never private
masters, credentials, unpublished contracts, or unrestricted high-resolution originals.

- `assets/brand/logo/`: artist identity marks, separate from photographic media.
- `assets/media/portrait/`: approved public artist portraits.
- `assets/media/gallery/<collection-id>/`: photographs grouped by collection.
- `assets/media/music/albums/<release-id>/cover/`: album artwork.
- `assets/media/music/eps/<release-id>/cover/`: EP artwork.
- `assets/media/music/singles/<release-id>/cover/`: single artwork.
- Each release may additionally own `icons/` and `audio/` when used by a renderer.
- `assets/media/publications/<publication-id>/cover/`: publication artwork.
- Each publication may additionally own `previews/` when approved for public access.

Release-specific folders are created when a real catalogue item is added, avoiding
fake example records and unused per-release folders. Empty category folders use
`.gitkeep` solely to preserve them in Git.

## JSON contract

`assets/data/site.json` registers catalogue paths. Data owns content; fragment HTML
owns structure; section JS owns rendering; section CSS consumes approved tokens.
Asset paths are site-root-relative without a leading slash, such as
`assets/media/music/singles/gone/cover/gone-cover.webp`.
Renderers must resolve these against the public site base, never the current
nested page URL. This avoids the relative-image-path problem when reusing a record.

Image records use `src`, `alt`, `width`, `height`, and optional `caption` and `credit`.
Dimensions describe the actual file; they are not style constants. Use meaningful
alt text. Do not invent dimensions, credits, licenses, or permission claims.

Artist profile owns `name`, `biography`, optional `portrait`, and `links`.
Gallery items own `id`, `collection`, and `image`.
Music items own `id`, `title`, `category` (`albums`, `eps`, or `singles`), `cover`,
and `links`; optional release date, credits, tracks, and identifiers may be added
with a corresponding validator/renderer update.
Publications own `id`, `title`, `cover`, and `links`.
Links contain `label` and an HTTPS `url`.

Use lowercase kebab-case IDs and filenames. One canonical file per image variant;
intentional formats/sizes use descriptive names, never Finder-style ` 2`, `copy`,
or `(1)` suffixes. Do not duplicate an image between catalogues: reference its
existing canonical public path when the same artwork is used twice.

## Layer wiring

Future `docs/index.html` mounts fragments only. `assets/js/core/app.js` will load
the site registry and invoke section importers. The artist, music, publications,
and gallery sections each have their own fragment, CSS, and JS folder now.
No empty runtime scripts or fake mounted panels are claimed to exist.

## Shared style gate

Use the exact artan-live token bridge documented in `architecture.md` as the
visible baseline. Compare its imported token snapshot with current Neuroartan
owners before transfer. No independent palette, font, spacing scale, or radius
scale has been added in this step. Visual equivalence remains unverified until
the shared styles and first real page are mounted and browser-tested.

## Validation

Run `node tools/validate-assets.mjs` from the repository root. It verifies catalogue
registration, required fields, unique IDs, safe existing media paths, image
metadata, HTTPS links, category ownership, and duplicate-style image filenames.
It does not verify the truth of credits, dimensions, publication rights, or visual
quality; inspect those before adding an item to a public catalogue.
