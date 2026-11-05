# Preparing Kashi for the Chrome Web Store

Checked against official documentation on November 3, 2026. This is a preparation checklist; Kashi has not been submitted or approved.

## Account

- [ ] Register a developer account, choose an email you monitor, accept the applicable agreements and pay the one-time fee shown during registration. Confirm the current amount in the dashboard. [Registration](https://developer.chrome.com/docs/webstore/register)
- [ ] Complete the account email/security verification required by the dashboard, including two-step verification for publication. [Developer account setup](https://developer.chrome.com/docs/webstore/set-up-account), [two-step verification requirement](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification)

## Extension package

- [x] Manifest V3, scoped to `https://open.spotify.com/*`, with only the `storage` API permission.
- [x] Dictionary resources limited to Spotify Web rather than all websites.
- [x] Executable code and dictionaries packaged locally; no remote conversion endpoint or downloaded JavaScript.
- [x] Scripts generate `build/Kashi-Web.zip` with a valid version and root manifest, and verify its contents. Rebuild and run verification before every upload.
- [ ] Finish authenticated Edge/Chrome playback validation and capture the tested versions. [Compatibility record](testing/spotify-compatibility.md)

Manifest V3 requires submitted functionality to be discernible from the packaged code; external data sources are different from executable remote logic. Kashi's current design includes both its code and conversion data locally. [MV3 requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements)

Upload **Kashi-Web.zip**, not the Spicetify archive or the repository source. Keep third-party notices in the package.

## Listing and reviewer instructions

- [ ] Prepare a concise name, description, category, language and support link. Explain local script conversion, supported languages, the toggle, Japanese modes and Spotify lyrics availability.
- [x] Existing 128×128 icon is included; review its appearance before submission.
- [ ] Capture at least one real product screenshot (1280×800 preferred; 640×400 is also documented). Up to five screenshots are allowed. Do not submit the synthetic development harness as if it were Spotify.
- [ ] Optionally prepare a 440×280 small promotional image, 1400×560 marquee image or demonstration video. These promotional assets are not required by the listing documentation consulted.
- [ ] Provide reviewer steps: sign into Spotify with an account able to view lyrics; open a song with Japanese/Korean/Chinese/Russian lyrics; enable/disable conversion and exercise the Japanese choices. Include stable example songs only after checking their current lyrics availability. Do not place your credentials in the package or listing.

Sources: [listing fields](https://developer.chrome.com/docs/webstore/cws-dashboard-listing), [image specifications](https://developer.chrome.com/docs/webstore/images).

## Privacy and purpose

- [x] A [privacy policy](../PRIVACY.md) describes local processing, storage and deletion.
- [ ] Publish that policy at a publicly accessible URL and put it in the dashboard's privacy policy field.
- [ ] Complete the single-purpose description and justify `storage` and site access: Kashi converts the lyrics visible on Spotify and remembers the user's choices/local cache.
- [ ] Complete data-use disclosures using the dashboard's definitions. Explain that lyric text is processed/cached locally and not transmitted by Kashi; do not make broader claims than the implemented behavior.

Sources: [privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy), [program policies](https://developer.chrome.com/docs/webstore/program-policies/policies).

## Submit

- [ ] Run `bun install --frozen-lockfile`, `bun test`, `bun run typecheck`, `bun run package` and `bun run check:package` against the final source. Tests build both bundles.
- [ ] Upload the browser ZIP, finish the listing/privacy/distribution fields and send it for review. Respond to any actual review feedback before describing it as published. [Publication workflow](https://developer.chrome.com/docs/webstore/publish)

Edge can install compatible extensions from the Chrome Web Store when other stores are allowed. A separate Microsoft Edge Add-ons publication is optional future work, not part of this submission. [Microsoft instructions](https://support.microsoft.com/en-us/edge/add-turn-off-or-remove-extensions-in-microsoft-edge)
