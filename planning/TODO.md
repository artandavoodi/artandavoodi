# Artistic website delivery checklist

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

- Neuroartan: existing ICOS project preserved. Unsaved SMTP preparation uses
  `contact@neuroartan.com`, sender name Neuroartan, iCloud SMTP port 587.
  Owner entry of an app-specific password and delivery verification are pending.
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
