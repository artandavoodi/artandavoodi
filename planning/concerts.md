# Concert schedule ownership

The single schedule is `docs/assets/data/concerts.json`. The artist site publishes
it at `/concerts/`; other surfaces link to that canonical page rather than keeping
separate event databases. Empty schedules do not publish fictional events.

Each event requires `id`, `name`, `startDate` (ISO 8601 including timezone offset),
`timeZone` (IANA, for example Europe/Zagreb), `venue`, `city` and `country`.
`ticketUrl` is optional and must be an official HTTPS ticket destination.
Only confirmed public performances belong in this file.

Build and validate before publishing. Dates are sorted chronologically, displayed
in the venue's timezone and exposed in MusicEvent structured data. No automatic
current-date filtering removes past performances or changes builds overnight.
