# Changelog

## 2026.1105.0

Kashi is back after more than two years without a release. I used AI to help pick the project back up, update the code for the current Spotify clients, and add regression tests.

### Changes

- Added a dedicated Spicetify package for Spotify desktop alongside the Edge and Chrome extension for Spotify Web.
- Bundled the Japanese dictionary and converters in both packages. Japanese, Korean, Chinese and Russian lyrics are processed locally, and the web extension only requests access to Spotify Web and local extension storage.
- Added a React settings panel next to Spotify’s media controls. Choose a language or Japanese script, disable conversion to restore the original lyrics, or retry a failed conversion.
- Reapply converted lyrics when Spotify rewrites a supported line, preserving the original text node and seek controls. Added a fallback for desktop clients that omit lyric test IDs.
- Improved mixed Japanese lines and contextual Chinese pinyin. Japanese supports romaji, hiragana and katakana, with the particle `を` rendered as `wo` in romaji.
- Moved builds and ZIP packaging to Bun. Split the automated tests by responsibility and added checks that run both built bundles with the packaged dictionary.

### Installation

The previous Light and Dict downloads are replaced by two packages.

- **Spotify Web** · Extract `Kashi-Web.zip` and load the folder as an unpacked extension in Edge or Chrome.
- **Spotify desktop** · Extract `Kashi-Spicetify.zip`, copy `kashi.js` into the Spicetify Extensions folder, then run `spicetify config extensions kashi.js` and `spicetify apply`.

[Installation guide](https://github.com/Cristian-Sknz/kashi-extension#download) · [Full changelog since 2024.0701.0](https://github.com/Cristian-Sknz/kashi-extension/compare/2024.0701.0...2026.1105.0)
