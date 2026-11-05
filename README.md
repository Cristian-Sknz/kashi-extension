# Kashi — Spotify lyrics in a script you can read

Kashi converts the lyrics already displayed by Spotify, locally on your device. The web extension targets **Microsoft Edge first**, with Chrome support. A separate **Spicetify extension** runs inside the Spotify desktop lyrics view.

## Download

Get the [latest release](https://github.com/Cristian-Sknz/kashi-extension/releases/latest) and choose the ZIP for your Spotify client.

| Package | Client |
| --- | --- |
| [Kashi-Web.zip](https://github.com/Cristian-Sknz/kashi-extension/releases/latest/download/Kashi-Web.zip) | Spotify Web in Edge or Chrome |
| [Kashi-Spicetify.zip](https://github.com/Cristian-Sknz/kashi-extension/releases/latest/download/Kashi-Spicetify.zip) | Spotify desktop with Spicetify |

See the [changelog](CHANGELOG.md) for changes since the previous release and the [compatibility record](docs/testing/spotify-compatibility.md) for tested scenarios.

## Features

- [x] Japanese → romaji, hiragana or katakana.
- [x] Korean → romanized Korean; Chinese → pinyin with tone marks; Russian → Latin transliteration.
- [x] Disable conversion and restore the original lyrics immediately.
- [x] Keep settings between sessions on the same installation.
- [x] Reapply converted text when Spotify rewrites a supported lyric line.
- [x] Local conversion and bounded local cache; no conversion server or account/token access.
- [x] Separate browser and Spicetify packages, built with Bun.
- [ ] Chrome Web Store publication. See [what is needed to publish](docs/chrome-web-store.md).

Kashi changes the writing system, not the meaning: it does not translate songs or retrieve missing lyrics. It is an independent project, not affiliated with Spotify.

## Install in Edge or Chrome

1. Download and extract `Kashi-Web.zip`, or build the project from source.
2. Open `edge://extensions/` in Edge or `chrome://extensions/` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select `dist/web/`, or the extracted folder containing `manifest.json`.
4. Reload Spotify Web, play a song with available lyrics and open the lyrics view.

To update, extract the new ZIP into the same folder, click **Reload** on Kashi's extension card, then refresh Spotify. See the official instructions for [Edge](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) and [Chrome](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

Removing the browser extension clears its local settings and cache. The browser package is distributed here for manual installation.

## Install in Spotify desktop with Spicetify

Install a compatible Spotify client and [Spicetify](https://spicetify.app/docs/getting-started) first. Confirm Spicetify works with your installed Spotify version before adding Kashi.

On Windows, extract `Kashi-Spicetify.zip` and copy its `kashi.js` into `%APPDATA%\spicetify\Extensions\`. If you built from source, use `dist/spicetify/kashi.js`. Then run:

```sh
spicetify config extensions kashi.js
spicetify apply
```

No dictionary folder, API key, Chrome extension, or server is needed for the desktop package. The `config extensions` command appends Kashi to existing extensions. [Spicetify installation reference](https://spicetify.app/docs/customization/extensions)

Open Spotify's own lyrics view. Other extensions that replace that view may require disabling their replacement view; their custom markup is not a supported target.

To update, replace the installed `kashi.js` with the new file and run `spicetify apply`. To disable the desktop extension:

```sh
spicetify config extensions kashi.js-
spicetify apply
```

Keep the included license notices when redistributing either package. Spotify updates can require updating/reapplying Spicetify before Kashi can run again. [Spicetify update instructions](https://spicetify.app/docs/getting-started#updating)

## Controls

The **Kashi icon** appears beside Spotify's artwork/Canvas/artist/lyrics controls in the player header. Click it to open a settings popup over the player. Close it with **Escape**, the close button or a click outside. The icon is attached separately from the lyrics, so settings remain accessible while the lyrics are loading. If Spotify replaces the header, Kashi reattaches its icon.

- **Convert lyrics:** turn conversion on/off; turning it off restores the original text without reloading.
- **Language:** automatic detection, or a manual Japanese/Chinese/Korean/Russian override. Use Japanese when a song contains only kanji, which cannot reliably be distinguished from Chinese by script alone.
- **Japanese:** choose romaji, hiragana or katakana. Romaji renders the particle `を` (and standalone `ヲ`) as **wo**, retaining the remaining Hepburn spellings. This affects Japanese lyrics; it does not convert other languages into Japanese scripts.
- **Retry:** retry after a conversion or dictionary-loading error.

Settings are stored separately in each browser profile and desktop installation. They are not synchronized between Edge, Chrome and Spotify desktop. The first Japanese conversion initializes the dictionary; later conversions reuse it.

## Limits and troubleshooting

- Spotify must already provide lyrics for the song/account. Kashi does not bypass lyrics availability or account restrictions.
- Supported hooks are `data-testid="lyrics-line"` and the historical `fullscreen-lyric`. When desktop builds omit test IDs, Kashi also detects `div[dir="auto"]` lines inside the container defining `--lyrics-color-active`. Layout changes can require another adapter update.
- Lines with several text segments, such as word-timed lyrics or combined annotations, are left intact to preserve their structure. This release targets single-text lyric lines and line-level highlighting.
- Dictionary readings and automatic language detection can be wrong, especially for names and ambiguous text; unsupported readings can remain in Japanese. Romaji spacing follows the Japanese tokenizer within Japanese passages. Original non-Japanese spelling, symbols such as `θ`, and surrounding spaces are preserved.
- If no Kashi icon appears, open Spotify's Now Playing/lyrics view so its media header is visible, reload the extension/page, and check the [compatibility record](docs/testing/spotify-compatibility.md). The header is located by `role="radiogroup"` containing a `button[role="radio"][value="lyrics"]`, independently of its language and hashed classes. In desktop, confirm Spicetify is applied and Kashi is enabled.
- If desktop shows **Waiting for lyrics** while Spotify displays lyrics, install the latest desktop package, reapply Spicetify and try another song. Report persistent cases with your Spotify and Spicetify versions.
- If conversion fails, use **Retry**. The original lyrics remain available. Storage failures do not prevent conversion; an unsaved setting is reported in the controls.

See [privacy and data removal](PRIVACY.md), [dependency choices](docs/testing/dependencies.md), and the [publication checklist](docs/chrome-web-store.md).

## Build

Use [Bun](https://bun.sh/) 1.4.2, the version validated for this checkout:

```sh
bun install --frozen-lockfile
bun run build
bun run package
bun run check:package
```

| Output | Purpose |
| --- | --- |
| `dist/web/` | Unpacked extension for Edge/Chrome |
| `build/Kashi-Web.zip` | Browser extension archive; `manifest.json` is at its root |
| `dist/spicetify/kashi.js` | Desktop extension, including the Japanese dictionary |
| `build/Kashi-Spicetify.zip` | Desktop archive with code and notices |

Both packages include the full Japanese dictionary in a losslessly compressed form. The desktop JavaScript embeds it and is approximately 16.5 MB.

## Development

```sh
bun test
bun run typecheck
bun run build:web
bun run build:desktop
bun run watch:web
```

The watcher rebuilds after source/resources/manifest changes. Reload the unpacked extension and Spotify after rebuilding. `bun test` also builds and exercises both distributed bundles with real Japanese dictionary data, alongside lifecycle/cache regression tests.

For a browser integration harness with synthetic Spotify markup:

```sh
bun run build
bun scripts/preview.ts
```

Visit `http://127.0.0.1:4317/` for the web bundle or `/desktop` for the desktop bundle. Add `?overlay=1` to test the controls against an isolated, transformed lyrics container with a click-intercepting layer above it. This local harness uses mock platform storage/player APIs and does not replace a test in Spotify itself. Stop it with Ctrl+C when finished.

The runtime uses TypeScript, Kuroshiro/Kuromoji, pinyin-pro, es-hangul and cyrillic-to-translit-js. React renders the settings controls in Shadow DOM. The integration uses the native Popover API when available. See [third-party notices](THIRD_PARTY_NOTICES.md).
