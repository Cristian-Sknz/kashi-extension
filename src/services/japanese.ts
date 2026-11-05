import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import type { JapaneseScript } from '.';

const JAPANESE_RUN =
  /([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー〆\u3099\u309a\uff9e\uff9f]+)/u;

export function createJapaneseConverter(dictionaryUrl: string) {
  let ready: Promise<Kuroshiro> | undefined;
  return async (text: string, to: JapaneseScript): Promise<string> => {
    const parts = text.split(JAPANESE_RUN);
    if (parts.length === 1) return text;
    if (!ready) {
      const instance = new Kuroshiro();
      const analyzer = new KuromojiAnalyzer({ dictPath: dictionaryUrl });
      const parse = analyzer.parse.bind(analyzer);
      analyzer.parse = async text => {
        const tokens = await parse(text);
        for (const token of tokens) {
          // Keep Hepburn elsewhere; only literal wo kana get this pronunciation override.
          if (token.surface_form === 'を' || token.surface_form === 'ヲ')
            token.pronunciation = 'ウォ';
        }
        return tokens;
      };
      ready = instance
        .init(analyzer)
        .then(() => instance)
        .catch(error => {
          ready = undefined;
          throw error;
        });
    }
    const instance = await ready;
    const converted = await Promise.all(
      parts.map(async (part, index) => {
        if (index % 2 === 0) return part;
        // IPADIC lacks this conventional pronoun spelling. Normalize the word, not bare 其.
        const source = part.replaceAll('其れ', 'それ');
        const result = await instance.convert(source, {
          to,
          mode: to === 'romaji' ? 'spaced' : 'normal',
          romajiSystem: 'hepburn',
        });
        if (to === 'hiragana') return Kuroshiro.Util.kanaToHiragna(result);
        if (to === 'katakana') return Kuroshiro.Util.kanaToKatakana(result);
        return result;
      }),
    );
    return converted.join('');
  };
}
