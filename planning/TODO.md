# Artistic website delivery checklist

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
6. [ ] Configure hosting, deploy a verified minimal site and test its hosting URL.
7. [ ] Connect `artandavoodi.com` and verify DNS, HTTPS and canonical redirects.
   Inspect existing DNS first; preserve any existing email records.
8. [ ] Configure iCloud+ custom email for `artandavoodi.com`: select desired email
   addresses, inspect the account's available domain setup, follow Apple's supplied
   DNS records, and verify incoming/outgoing mail. User handles Apple authentication.
   No addresses, DNS values, or successful email setup are assumed yet.
9. [ ] Add approved artist portrait, gallery collections, releases, artwork and
   artistic publications; verify ownership, credits, image metadata and links.
10. [ ] Plan and approve content migration separately; establish one catalogue
    owner before updating the central hub's links or removing any old content.

## Current boundaries

GitHub, hosting, DNS and iCloud+ email are pending. No external account, domain,
email or publication changes have been made. The asset foundation is validated;
the website runtime and visual equivalence are not yet implemented or verified.
