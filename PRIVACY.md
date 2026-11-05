# Kashi privacy policy

Last updated: November 3, 2026.

Kashi reads the lyric text displayed in the supported Spotify lyrics view and converts its writing system on your device. It does not translate or download lyrics, read your Spotify credentials, or request access to your account, playlists, contacts or listening history through Spotify's API.

## Processing and network access

Conversion runs locally. The Japanese dictionary and executable code are included in the package. The browser extension loads dictionary files from its own installed resources; the desktop extension includes them inside its JavaScript file. Kashi does not send lyrics, preferences or cached conversions to a conversion service, analytics service or developer server. It includes no telemetry or advertising.

Spotify continues to operate its own service and network connections independently. Those connections are governed by Spotify's policies.

## Local data

Kashi stores the conversion toggle, language selection and Japanese script preference. It can also cache original lyric text and converted text to avoid repeated work. The cache is limited to 100 entries and approximately 5 MiB of serialized data; older entries are removed as the limit is reached. Preferences remain until changed or deleted.

The browser version uses the extension's `chrome.storage.local` area, rather than synchronized browser storage. The desktop version uses Spotify's local storage under the keys `kashi:settings:v1` and `kashi:cache:v1`. Browser profiles and the desktop client have separate data. Desktop data is in the Spotify renderer's storage, so it is not an isolated secret store against other code running in that renderer.

## Removing data

- Browser: remove the Kashi extension to remove its local extension storage. Turning off conversion restores the text but does not clear saved settings/cache.
- Desktop: disable Kashi in Spicetify first. If you use Spotify's developer console, remove only Kashi's entries with `localStorage.removeItem('kashi:settings:v1')` and `localStorage.removeItem('kashi:cache:v1')`. Removing the JavaScript file alone does not delete those entries. Clearing all Spotify app storage is broader and can remove unrelated Spotify data.

For questions, use the [project issue tracker](https://github.com/Cristian-Sknz/kashi-extension/issues).
