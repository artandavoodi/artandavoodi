# Artistic website delivery checklist

## Artist enquiries and press (2026-10-16)
- Press previews are equal 140px squares with face-oriented crops; only the approved press selection links to original downloads. Gallery pages do not offer downloads.
- Shared document focus controls use the registered visibility-on/off pair and preserve a restore control. Local switching was checked; hosted deployment verification remains separate.
- Press portrait previews use one square frame; original files and download actions remain separate.
- Enquiry purposes route to the matching public inbox. The current action explicitly opens email, not a claimed server delivery.
- Separate Apps Script project created for artist enquiries; label project must not be reused or changed.
- Owner authorization completed and the separate enquiry spreadsheet was created successfully. Public-inbox routing is configured server-side.
- Direct submission remains pending dedicated CAPTCHA keys, public web-app deployment and a hosted delivery test. The separate Cloud project is “Artan Artist Website”; do not create another project or reuse label keys.
- CAPTCHA API activation currently awaits approval of Google Cloud terms. Do not add billing or a paid plan without separate approval.
- The independent Apps Script source is `tools/site/artist-enquiries.gs`; its Google project is “Artan Davoodi Artist Enquiries”. Do not configure it with label storage or credentials.
- Retain desktop-only section snapping; mobile/tablet scroll naturally.

## Outstanding release gates (2026-10-16)
- Keep direct artist enquiries open until dedicated CAPTCHA keys, public deployment, a real CAPTCHA submission, spreadsheet storage and notification delivery are verified.
- Keep live checkout disabled until merchant/legal requirements and hosted purchase, webhook, entitlement, private-download and cross-account access checks are satisfied. Local source checks are not evidence of real payment delivery.
- Keep owner Google sign-in and password-recovery checks open until the full hosted journeys are confirmed; SMTP invitation delivery alone does not verify recovery.
- Legal review, physical-product details, additional score/chord source material, replacement icon vectors and private Studio operations remain pending where previously deferred. Do not mark them complete from visual or static checks.

## Branded email follow-up (2026-10-14)

The historical initialization checklist below is not a current deployment report.
The artist website and independent store are deployed. The store's iCloud SMTP
sender is `contact@artandavoodi.com`; an invitation delivery was confirmed.
SMTP delivery alone does not register an inbox brand logo.

- [x] Inspect existing iCloud custom domains and mail authentication read-only.
  All twelve confirmed aliases already exist across the four domains. Preserve
  MX, SPF, DKIM and DMARC; review any proposed DNS change separately.
  Neuroartan is authoritative on Cloudflare; the other three remain on Porkbun.
  DMARC was absent on Neuroartan, artist and label domains. Neuroartan's `sig1`
  DKIM CNAME was absent at its authoritative server; validate before repairing.
- [ ] Verify Apple Business eligibility and account access before enrolling brands.
  No Developer Program purchase is needed merely to investigate branded mail.
- [ ] Register separate brand/domain identities for Neuroartan, Artan Records,
  Artan Davoodi and Artan.live using their existing canonical logo assets.
  Do not claim business verification or register fabricated business information.
- [ ] Scope public senders: Neuroartan `contact`/`info`; artist `contact`/`music`/
  `press`; Artan.live `music`/`press`; Artan Records `contact`/`collaborate`.
  Founder/personal aliases remain private and are not public-facing senders.
- [ ] Distinguish inbox branding from logos inside transactional email templates.
  Inbox display depends on recipient-provider support and brand verification.
- [ ] Configure transactional templates only in each owning application's
  dedicated backend. Do not create Supabase projects solely for mailbox logos,
  reuse store credentials across brands, or mix customer data.
- [ ] Test each sender's delivery, reply address, logo rendering and accessibility.
  Do not mark this complete merely because a logo asset was uploaded.

References: https://business.apple.com/ and
https://support.apple.com/en-us/108340.

## Separate backend setup status (2026-10-14)

- Neuroartan: existing ICOS project preserved. Custom SMTP saved after the owner
  entered the password directly, then verified enabled after reload. Sender is
  `contact@neuroartan.com`, sender name Neuroartan, iCloud SMTP port 587.
  Actual message delivery and branded-template rendering remain unverified.
- Artan Store: existing project and `contact@artandavoodi.com` sender preserved.
- Artan Records: isolated Free organization created; no backend project created.
  Intended public authentication sender is `contact@artanrecords.com`.
- Artan.live: isolated Free organization created; no backend project created.
  Intended public music-account sender is `music@artan.live`.
- Both new project forms explicitly block creation because the owner already has
  two active free projects. No upgrade, pausing, deletion or data merger approved.
- Organization creation is not database provisioning, email activation or brand
  verification. No frontend credentials or live account claims are added for
  nonexistent projects. Passwords and residential details must stay out of Git.

## Next-session owner-dependent gates

The owner requested deferral of steps requiring their input while away at work.
Keep the setup browser tabs open; do not schedule unattended account operations.

- Decide paid capacity for the two blocked backend projects. Do not pause existing
  projects, bypass free quotas, purchase plans or merge brand databases.
- Verify Neuroartan email arrival and complete the store's fresh recovery flow.
  Password entry and submission belong to the owner; never request email tokens.
- Resolve Apple Business eligibility, legal-address spelling and any agreement
  acceptance before registering inbox logos; no paid Developer enrollment planned.
- Review mail-authentication repairs before DNS changes. Preserve website routing,
  existing mail delivery and all unrelated domain verification records.
- Stripe live review, merchant disclosures and deployed/tested payment fulfillment
  are still sales gates. Checkout must remain disabled until these are satisfied.

## Autonomous reliability work (2026-10-14)

- Store chrome is rendered at build time from the pinned fragments and the same
  content renderer used by runtime fallback. No parallel theme or icon owner added.
- Account forms reject overlapping requests, expose busy state and restore their
  original enabled/disabled controls after success or failure.
- Failed OAuth callbacks are distinguished from expired recovery links, stripped
  from the address bar and retained through session refresh as actionable guidance.
- Store account responses are `no-store`; the storefront uses `no-referrer`.
  Verify those headers on Cloudflare, not merely in the local `_headers` file.
- The label's obsolete Docs/Studio commands now fail explicitly instead of
  reporting success without building anything. Independent surface checks pass.
- Offline store guards cover request locking, recovery classification and rendered
  chrome. Browser regressions also cover failed callbacks and script-free branding.
  These do not establish real OAuth sign-in, payment fulfillment or cross-user RLS.

## Scope

`artandavoodi.com`: artistic expression, art, music and publications.
`artan.live`: existing central professional hub; leave unchanged in this phase.
Migration is deferred until the new site is ready and its scope is approved.

## Ordered work

1. [x] Create independent local Git repository and modular layer folders.
2. [x] Establish separate asset categories, JSON catalogues, and asset validation.
3. [ ] Audit and transfer the approved shared style sources; preserve exact tokens
   and keep an explicit version/source record.
4. [ ] Build and wire the first public shell, section fragments and JSON renderers;
   verify responsive layout, accessibility, themes, imports and asset loading.
5. [x] Create the public GitHub repository `artandavoodi` and push the local `main`
   checkpoint. Remote: `git@github.com:artandavoodi/artandavoodi.git`.
6. [x] Configure GitHub Pages from `main` /docs and verify the generated site URL.
7. [ ] Configure the custom domain in GitHub Pages, then verify DNS and HTTPS.
8. [ ] Connect `artandavoodi.com` and verify DNS, HTTPS and canonical redirects.
   Inspect existing DNS first; preserve any existing email records.
9. [ ] Configure iCloud+ custom email for `artandavoodi.com`: select desired email
   addresses, inspect the account's available domain setup, follow Apple's supplied
   DNS records, and verify incoming/outgoing mail. User handles Apple authentication.
   No addresses, DNS values, or successful email setup are assumed yet.
10. [ ] Add approved artist portrait, gallery collections, releases, artwork and
   artistic publications; verify ownership, credits, image metadata and links.
11. [ ] Plan and approve content migration separately; establish one catalogue
    owner before updating the central hub's links or removing any old content.

## Current boundaries

GitHub, hosting, DNS and iCloud+ email are pending. No external account, domain,
email or publication changes have been made. The asset foundation is validated;
the website runtime and visual equivalence are not yet implemented or verified.
