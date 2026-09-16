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
