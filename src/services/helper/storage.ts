import { Lyrics } from '..';

type Lyric = Omit<Lyrics[number], 'node'>;

type StoredLyrics = {
  version: string;
  lyrics: Lyric[];
};

export function storeLyrics(title: string, lyrics: Lyrics) {
  const toStorage = lyrics.map<Lyric>(({ index, text, romaji }) => {
    return { index, text, romaji };
  });

  chrome.storage.sync.set({ [title]: {
      version: Kashi.version,
      lyrics: toStorage,
    }
  }, () => {
      console.debug(`'${title}' has been successfully stored`);
    }
  );
}

export async function getStoredLyrics(title: string): Promise<StoredLyrics> {
  return new Promise(async (resolve) => {
    chrome.storage.sync.get([title], (result) => {
      if (result[title]) {
        console.debug(`lyrics of '${title}' have been loaded`);
        resolve(result[title]);
      }
      resolve(null);
    })
  });
}

type ApplyStoredOptions = { title: string; lyrics: Lyrics; };
type AppluStoredReturn = [boolean, Lyrics];
type ApplyStoredLyrics = (options: ApplyStoredOptions) => Promise<AppluStoredReturn>;

export const applyStoredLyrics: ApplyStoredLyrics = async ({ title, lyrics }) => {
  const stored = await getStoredLyrics(title);

  if (stored === null 
    || stored.version !== Kashi.version 
    || stored.lyrics.length !== lyrics.length) {
    return [false, lyrics];
  }

  return [true, replaceLyrics(stored.lyrics, lyrics)];
}

function replaceLyrics(stored: Lyric[], lyrics: Lyrics) {
  return lyrics.map((lyric) => {
    const value = stored.find((stored) => stored.index === lyric.index);
    if (value?.romaji) {
      lyric.node.textContent = lyric.romaji = value.romaji;
    }

    return lyric;
  });
}