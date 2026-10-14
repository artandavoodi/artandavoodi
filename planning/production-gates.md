# Production completion checkpoints

## Implemented and locally validated

- Native concert, press, privacy and release documents use the shared header and footer.
- Gallery viewers deliberately retain minimal controls.
- Concert records generate canonical pages, calendar downloads and lifecycle schema.
- Cancelled/postponed concerts have no purchase action; no public event is invented.
- The artist homepage has a primary listening action and remains account-free.
- Privacy copy distinguishes the portfolio from the separately authenticated store.
- Release artist IDs propagate through the approved label catalogue synchronization.
- Label validation includes enquiry and spreadsheet-retention safety tests.
- Label synchronization can verify Docs/Studio ownership without modifying either.
- Store backend types, dedicated-project boundaries and checkout destinations are checked.
- Store CI tests actual migrations with two identities in disposable PostgreSQL.

## Remaining verification or owner-dependent decisions

- Owner vectors pending: Listen/play and Store/bag are empty in the Neuroartan canonical registry; Archive is empty in the artist registry. Existing shared dot is the explicit interim artwork, not a replacement icon. Remove each registry `fallbackSrc` after its vector is supplied and synchronize consumers before release.
- Canonical Listen vector: `/Users/artan/Documents/Neuroartan/website/docs/registry/icons/public/assets/core/media/play/play.svg`.
- Canonical Store vector: `/Users/artan/Documents/Neuroartan/website/docs/registry/icons/public/assets/core/commerce/shopping/bag.svg`.
- Artist Archive vector: `/Users/artan/Documents/Neuroartan/artandavoodi/docs/assets/icons/actions/archive.svg`.
- Store Orders vector is also empty: `/Users/artan/Documents/Neuroartan/website/docs/registry/icons/public/assets/core/commerce/orders/order.svg`. The pinned store manifest confirms its other authentication vectors are populated. Apple/phone providers remain deferred, not enabled by artwork.

- Hosted payment functions and webhook deployment, followed by sandbox payment-to-file verification.
- Real Google sign-in and email-to-password recovery completed by the account owner.
- Hosted Supabase authorization/storage verification; CI does not emulate its full services.
- A real label CAPTCHA submission and verification of the resulting row and email.
- Hosted retention-trigger run history and separate notification-mail retention review.
- Approved merchant disclosures, licence/refund/tax/shipping terms and privacy review.
- Account deletion and order-record retention policy before implementing destructive operations.
- Real products, stock, variants and fulfilment requirements before physical sales.
- Private artist onboarding/signing/Studio operations after their independent backend decision.
- Physical iPhone Safari and assistive-technology checks beyond browser emulation.

Live checkout remains disabled. Do not treat a successful build, a configured
provider or a completed CI test as proof of these hosted or legal requirements.
