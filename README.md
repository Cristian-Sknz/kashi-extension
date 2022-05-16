# Kashi Chrome Extension

Chrome/Opera extension to romanize Japanese song lyrics on Spotify

### Motivation

> The romanized letters feature has been requested on Spotify for quite some time. For me to see the romanized lyrics of my favorite Japanese artists, I had to use a third-party service, it sometimes took a little time. So I decided to create this extension that brings this feature to Spotify as it is not officially implemented.

## Features

- [ ] Chrome Web Store
- [x] Romanize Spotify lyrics
- [ ] Loading indicating that romanization is taking place.
- [ ] Option to disable romanization
- [ ] Follow the browser extension design pattern

## Installation

1. Download the [latest release](https://github.com/Cristian-Sknz/kashi-extension/releases) here on Github
2. Choose the type you want to use:
  - `Light` this version is lighter, as it does not use the packages for romanization, but it may take longer to romanize the letters.
  - `Dict` this version is heavier, as it uses a packages for romanization, but the letters are romanized instantly.
3. After completing the previous steps...
    1. Go to [_chrome://extensions_](chrome://extensions) in Google Chrome or `extensions` in Opera
    2. With the developer mode checkbox ticked, click **Load unpacked extension...** and select the _extracted folder_.

<img src="https://user-images.githubusercontent.com/61399406/168503678-9dd58841-61f6-400e-9c38-39e149ce5b99.png" width="800">

## Development

Use `npm install` or `yarn install` to install the dependencies, you will have to use an editor that supports Typescript.
