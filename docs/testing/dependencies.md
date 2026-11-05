# Dependency decisions

Checked November 3, 2026. Versions were confirmed against the npm registry and installed with Bun 1.4.2. Candidates were compared locally with pinyin 2.11.2 and aromanize 0.1.5 in an ignored temporary installation.

| Area | Decision | Reason |
| --- | --- | --- |
| Japanese | Kuroshiro 1.2.1 + kuroshiro-analyzer-kuromoji 1.1.0; explicit Kuromoji 0.1.2 | Retain the parser/conversion family; use stable releases rather than the 2.x beta. Verify romaji, hiragana, katakana and actual kanji dictionary conversion. |
| Chinese | Replace pinyin 2.11.2 with pinyin-pro 3.29.5 | Contextual readings improved the tested examples below. Convert Han runs while preserving surrounding Latin text/spacing/punctuation. |
| Korean | Replace aromanize 0.1.5 with es-hangul 2.4.0 | Keeps the common examples and handles palatalization in 같이 as `gachi`. |
| Russian | Keep cyrillic-to-translit-js 3.2.1 | The existing mapping already distinguishes Cyrillic `р`→`r` and `п`→`p` from Latin `p`. |
| Interface | React and React DOM 19.3.1 | React renders the trigger and settings panel. Shadow DOM isolates the styles, and the browser handles the native popover. |
| Build | Bun.build; fflate 0.8.3 for ZIP scripts only | No Webpack/plugins, Axios or server fallback. Runtime gzip decompression uses native DecompressionStream. |

## Observed outputs

| Input | Old package | New package |
| --- | --- | --- |
| 汉语拼音 | hàn yǔ pīn yīn | hàn yǔ pīn yīn |
| 睡着了 | shuì zhuó le | shuì zháo le |
| 音乐 | yīn lè | yīn yuè |
| 重庆 | zhòng qìng | chóng qìng |
| 안녕하세요 | annyeonghaseyo | annyeonghaseyo |
| 한국어! | hangugeo! | hangugeo! |
| 호랑이 | horangi | horangi |
| 백마 | baengma | baengma |
| 같이 | gati | gachi |
| 빨간색이에요 | ppalgansaegieyo | ppalgansaegieyo |

These checks support the chosen migrations, not a claim of perfect readings for every song. Expected Korean examples also occur in [es-hangul's tests](https://github.com/toss/es-hangul/blob/main/src/pronunciation/romanize/romanize.spec.ts); pinyin-pro documents contextual readings in its [project examples](https://github.com/zh-lx/pinyin-pro).

## Size tradeoff

Bun browser-target ESM builds exporting just the converter, minified without source maps:

| Converter | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| pinyin 2.11.2 | 110,057 | 69,618 |
| pinyin-pro 3.29.5 | 305,834 | 140,957 |
| aromanize 0.1.5 | 10,338 | 2,895 |
| es-hangul 2.4.0 | 14,526 | 5,143 |

The replacements are larger; the reason to migrate is the observed conversion behavior and modern package interfaces. No claim is made about the old complete extension bundle, which was not rebuilt. Japanese compressed dictionary resources total 17,791,956 bytes, separately from JavaScript. The desktop build embeds base64 copies, yielding approximately 24 MB of JavaScript. Exact full package sizes are printed by the build/packaging scripts.

Local bundle checks observed Japanese initialization/conversion on the order of one to a few seconds (including decoding in the desktop case), but this is not a controlled performance benchmark or a guarantee for Spotify. It initializes only when Japanese conversion is needed and reuses the initialized analyzer afterwards.

## Browser compatibility adaptation

The old Kuromoji loader couples URL construction to Node `path` and loads through Node/XHR implementations. The build substitutes only the dictionary loader: it preserves the upstream dictionaries/parser, reads packaged web resources or embedded desktop bytes, and decompresses with the native gzip stream API. Both built bundles are tested with actual dictionary files; the desktop check rejects any network fetch.

Japanese conversion processes Japanese runs separately so tokenization does not insert spaces into non-Japanese words or alter their original symbols. IPADIC marks `其` as unknown in the conventional spelling `其れ`; Kashi normalizes that complete spelling to `それ` for analysis in all three Japanese modes. Bare `其` and other unknown readings are preserved rather than assigned a guessed pronunciation. This lexical correction applies independently of song/track ID. Disabling conversion restores the original spelling.

From 2026.1104.0, the user's requested romaji convention renders the particle `を` and standalone `ヲ` as `wo`. The analyzer adapter changes the pronunciation only for those literal tokens, preserving their reading field for hiragana/katakana and retaining Hepburn for other tokens. There is no global `o` replacement or change to non-Japanese text.

All executable code is bundled. License and IPADIC notices are generated from installed dependencies and shipped in both archives. See [third-party notices](../../THIRD_PARTY_NOTICES.md).
