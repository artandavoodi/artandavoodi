# Public document generation

Release and artist JSON remain the editorial source of truth. Run `npm run build`
after editing content, then `npm run check` before committing generated files.
No server or framework migration is required. GitHub Pages continues serving docs.

`tools/site/home.html` owns the homepage shell. `tools/site/render.mjs` owns
semantic document templates and schema generation; `tools/build-site.mjs` owns
orchestration. Do not hand-edit generated homepage, catalogue or release HTML.

Canonical routes are `/`, `/music/` and `/music/<release-id>/`. Gone uses `/music/gone/`;
its JSON alias keeps `/music/gone-demo/` redirecting to the new address. Album tracks have stable fragment anchors within
their parent document, not thin standalone pages. Legacy query routes are noindex
and resolve to canonical documents when JavaScript runs.

The homepage and music catalogue are progressively enhanced by existing runtime
modules. Read-more and track links have genuine destinations; ordinary clicks
open the canonical release document. Album-track links open their track anchor.
Story and other populated sections have shareable anchors in that document. Generated
release documents use native details disclosures and remain readable without JS.

Structured data, social metadata and sitemap are generated from the same content.
Missing credits, stories and links are not invented. Sitemap lastmod is omitted
until reliable content-modification dates are tracked. robots.txt permits crawling.

Verified locally: build, checks, repeat-build determinism, HTTP 200 for generated
routes, HTTP 404 for an unknown release, catalogue Read More, Nari's direct anchor
and story disclosure, and the Salim page at 390px without horizontal overflow or
broken images. No browser warnings/errors were captured during those checks.
Full keyboard/accessibility and production Search Console checks remain pending.
The CI workflow checks generation freshness; it does not change Pages deployment
settings or prevent an independently configured branch deployment from running.
After deployment inspect canonical URLs in Search Console and submit sitemap.xml.
Indexing and rich results are not guaranteed by valid structured data.

## Publication and metadata policy

`interface.json` owns primary metadata fields, conditional status visibility,
section metadata and archive asset labels. `music/publication.js` is shared by
the browser preview and document generator. ISRC and UPC stay in catalogue data;
recording ISRC stays in structured data, not visible copy. This is identification,
not a guarantee of search ranking. Existing legal-name data is unchanged: JSON
under docs is public, not private storage.

Mark unapproved prose with `editorial: { "story": "draft" }` on its record.
Marked fields are omitted from documents; change to `approved` after review.
Existing unmarked copy remains published for compatibility. Draft source text is
still public in the catalogue JSON; do not store confidential drafts there.
Empty sections and archive tabs without published files are not rendered.
Track credits and production identical to the album are displayed once at album
level; distinct track information still appears in its own disclosure.

Archive entries support `title` (or existing `label`), local `path` or HTTPS `url`,
optional `instrument`, `arrangement`, `version`, and `status: "draft"` until ready.
An optional `preview` uses the existing image shape: `src`, `alt`, `width`, `height`.
Use an actual score-page image as the preview and a direct PDF link for reading;
no embedded PDF viewer, fabricated score or empty download button is required.
The checks validate published assets and reject artist-profile URLs on releases.

Outstanding editorial inputs: actual scores and permission to publish them,
track-specific stories, keys and other verified musical details. Separate track
documents remain deferred until enough unique approved material exists; current
track anchors remain shareable and crawlable within their album documents.
