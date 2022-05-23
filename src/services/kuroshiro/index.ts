import axios from 'axios';
import Kuroshiro from 'kuroshiro';

import RomanizeService, { Lyrics } from '..';
import loader from './loader';

const API_ENDPOINT = 'https://kashi-api.vercel.app/api/romanize';

type APIData = {
  lyrics: string[];
};

export default class KuroshiroService implements RomanizeService {

  async romanize(lyrics: Lyrics): Promise<Lyrics> {
    return this.useKuromojiDict(lyrics).catch(async () => await this.useKashiAPI(lyrics))
  }

  async useKuromojiDict(lyrics: Lyrics) {
    return loader.then(async (kuroshiro) => {
      const data = await Promise.all(lyrics.map(({ text }) => {
        if (Kuroshiro.Util.hasJapanese(text)) {
          return kuroshiro.convert(text, {
            to: 'romaji',
            mode: 'spaced',
            romajiSystem: 'hepburn',
          })
        }
        return Promise.resolve(text);
      }));
  
      for (var lyric of lyrics) {
        lyric.node.textContent = lyric.romaji = data[lyric.index];
      }
      return lyrics;
    });
  }

  async useKashiAPI(lyrics: Lyrics) {
    const response = await axios.post<APIData>(API_ENDPOINT, {
      lyrics: lyrics.map(({text}) => text)
    });
  
    for (var lyric of lyrics) {
      lyric.node.textContent = lyric.romaji = response.data.lyrics[lyric.index];
    }
    return lyrics;
  }
}