import { romanize } from 'es-hangul';
import { pinyin } from 'pinyin-pro';
import cyrillicToTranslit from 'cyrillic-to-translit-js';
import { createJapaneseConverter } from './japanese';

export type JapaneseScript = 'romaji' | 'hiragana' | 'katakana';
export type Language = 'Japanese' | 'Chinese' | 'Korean' | 'Russian';
export type ConvertOptions = { japaneseScript: JapaneseScript; language?: Language };
export type Convert = (texts: readonly string[], options: ConvertOptions) => Promise<string[]>;

const kana = /[\u3041-\u3096\u30a1-\u30fa\uff66-\uff9f]/u;
const han = /\p{Script=Han}/u;
const hangul = /\p{Script=Hangul}/u;
const cyrillic = /[\u0401\u0451\u0410-\u044f]/u;

export function detectLanguage(text: string): Language | undefined {
  if (kana.test(text)) return 'Japanese';
  if (hangul.test(text)) return 'Korean';
  if (cyrillic.test(text)) return 'Russian';
  // ponytail: Han alone is ambiguous; use the language override for Japanese-only kanji.
  if (han.test(text)) return 'Chinese';
}

export function createConverter(dictionaryUrl: string): Convert {
  const japanese = createJapaneseConverter(dictionaryUrl);
  const russian = cyrillicToTranslit({ preset: 'ru' });
  return async (texts, options) => {
    const context = options.language ?? detectLanguage(texts.join('\n'));
    return Promise.all(
      texts.map(async text => {
        const language =
          options.language ??
          (context === 'Japanese' && han.test(text) ? 'Japanese' : detectLanguage(text));
        switch (language) {
          case 'Japanese':
            return japanese(text, options.japaneseScript);
          case 'Chinese':
            return text.replace(/\p{Script=Han}+/gu, part => pinyin(part, { toneType: 'symbol' }));
          case 'Korean':
            return romanize(text);
          case 'Russian':
            return russian.transform(text);
          default:
            return text;
        }
      }),
    );
  };
}
