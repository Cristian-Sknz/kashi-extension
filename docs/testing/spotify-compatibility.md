# Compatibility and validation

Updated November 5, 2026. The release checks use Bun 1.4.2 and TypeScript 7.0.2.

## Release checks

- The automated suite exercises all four converters, all three Japanese output scripts, the settings and cache, and the lyrics and popup lifecycle.
- Both built bundles are run in a DOM test environment with the real Japanese dictionary. The desktop test rejects network fetches.
- Both bundles were exercised in Chromium against the [local test page](../../tests/preview.html). Checks included opening the native popover, changing options, restoring focus with Escape, and remounting the Spotify-style header.
- Package checks verify the web manifest, bundle entry points, license notices and local dictionary resources.

## Spotify client checks

| Client | Observed | Pending |
| --- | --- | --- |
| Edge on Windows | An earlier development build loaded in authenticated Spotify Web and converted Japanese lyrics to romaji. | Release-build playback, settings and other language modes. |
| Chrome | Both bundles passed the local Chromium harness. | Installation and playback in authenticated Spotify Web. |
| Spotify desktop | The React build was installed and applied with Spicetify 2.46.4 on Windows. The patched Spotify client pointed to the verified bundle and opened successfully. | Conversion and extended playback in the authenticated client. |

## Lyrics and controls

The [header fixture](../../tests/fixtures/spotify-media-header.html) retains only the semantic structure of Spotify's media header. The settings trigger is placed beside the radiogroup containing the `value="lyrics"` button.

Kashi detects the `lyrics-line` and `fullscreen-lyric` test IDs. On desktop builds without those IDs, it also looks for `div[dir="auto"]` within a container defining `--lyrics-color-active`. Lines with multiple nonempty text nodes are kept intact to preserve word timing and annotations.

The suite reproduces the rewrite behavior in [issue #2](https://github.com/Cristian-Sknz/kashi-extension/issues/2) and verifies that Cyrillic `р` is converted while Latin `p` is preserved, as discussed in [issue #1](https://github.com/Cristian-Sknz/kashi-extension/issues/1).

## Manual playback checks

1. Open a song with lyrics in each supported language. Try every Japanese script and toggle conversion while a song is playing.
2. Let several lines advance, click a line to seek, and check that highlighting and scrolling still work.
3. Change songs quickly, leave and reopen lyrics, and restart Spotify to check for stale text, duplicate controls or lost preferences.
