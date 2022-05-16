import axios from 'axios';
import Kuroshiro from 'kuroshiro';
import loader from './loader';

export type Lyric = {
  index: number;
  node: Node;
  text: string;
  romaji?: string;
};

export type Lyrics = Lyric[];

type APIData = {
  lyrics: string;
};

function isJapanese(input: string) {
  if (input.startsWith('「') && input.endsWith('」')) {
    return Kuroshiro.Util.isJapanese(input.substring(1, input.length - 1));
  }

  return Kuroshiro.Util.isJapanese(input);
}

export async function toRomaji(lyrics: Lyrics) {
  return loader.then(async (value) => {
    const data = await Promise.all(lyrics.map(({text}) => {
      if (isJapanese(text)) {
        return value.convert(text.replace(/\s/g, ''), {
          to: 'romaji',
          mode: 'spaced',
          romajiSystem: 'hepburn',
        });
      }
    
      return Promise.resolve(text);
    }));

    for (var lyric of lyrics) {
      lyric.node.textContent = lyric.romaji = data[lyric.index];
    }
    return lyrics;
  }).catch(() => useKashiAPI(lyrics));
}

async function useKashiAPI(lyrics: Lyrics) {
  const response = await axios.post<APIData>('https://kashi-api.vercel.app/api/romanize', {
    lyrics: lyrics.map(({text}) => text)
  });

  for (var lyric of lyrics) {
    lyric.node.textContent = lyric.romaji = response.data.lyrics[lyric.index];
  }
  return lyrics;
}