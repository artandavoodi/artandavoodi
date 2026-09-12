# Artistic site content management

## September 12, 2026 foundation

Artist is the default homepage: portrait, name and featured references only.
Music, Art & Gallery and Hub are separate hash destinations with browser history.
Publications are not in the menu. Contact links are confined to Hub.
The reference sitemap is https://www.pinkfloyd.com/ (featured work and separate
music/archive destinations). Identity, portrait, X and release details come from
the local artan-live public sources. No other repository was edited.

## Editing owners

- `docs/assets/data/artist/profile.json`: artist name and canonical portrait.
- `docs/assets/data/featured.json`: curated homepage references. Each entry uses
  `catalogue`, `id`, `href` and `enabled`; title/image come from the original record.
  Music, publications and products are registered catalogues. A future book or
  merchandise item needs a real catalogue record and destination before featuring.
- `docs/assets/data/music/releases.json`: releases and listening links.
- `docs/assets/data/music/context.json`: labels, music projects, instruments/studio.
  Add records with `id`, `title`, `description`, optional `image` and `links` to the
  relevant section. Empty sections stay unpublished. Artan Records is the only
  populated label; its text states the verified Gone (Demo) release credit.
- `docs/assets/data/gallery/images.json`: separate portrait and artwork collections.
  Each item has `id`, `collection` and `image` (src, alt, width, height).
  The existing portrait is reused by reference, never copied into the gallery.
- `docs/assets/data/hub.json`: public hub, X/Twitter and email connections.
- `docs/assets/data/icons.json`: local icon paths and monochrome theme behavior.
- `docs/assets/data/metadata/site.json`: shared identity and destination metadata.

## Remaining editorial work

Add verified albums/EPs, their cover art and listening links; original artworks;
music-project and instrument details; and artist-approved biography if wanted.
No biography is displayed on the minimal homepage. No release, product,
instrument, or artwork has been invented. Hash destinations are client-side
views, not separately indexed server pages; metadata updates after navigation.

## Checks

Run `npm run check` and `git diff --check`. Verify all four menu destinations,
featured navigation, cover/details interaction, label disclosure and theme icons
in the local browser before publication. No GitHub push or publication performed.

Verified locally: all four destinations, featured-to-music navigation, cover and
metadata toggle, Artan Records disclosure, loaded portrait, X/email/hub links,
and dark-mode icon filtering. Browser console reported no errors. Phone (390px)
homepage/gallery and tablet (834px) music view had no horizontal overflow.
Desktop homepage reviewed visually. Hardware-device testing is still outstanding.
