declare module 'kuroshiro' {
  export interface KuroshiroAnalyzer {}

  export type RomajiSystem ='nippon' | 'passport'| 'hepburn'
  export type SyllabarySystem = 'hiragana' | 'katakana' | 'romaji';
  export type ConvertMode = 'normal' | 'spaced' | 'okurigana' | 'furigana';

  export interface KuroshiroUtils {
    isHiragana(char: string): boolean;
    isKatakana(char: string): boolean;
    isKana(char: string): boolean;
    isKanji(char: string): boolean;
    isJapanese(char: string): boolean;
    hasHiragana(str: string): boolean;
    hasKatakana(str: string): boolean;
    hasKana(str: string): boolean;
    hasKanji(str: string): boolean;
    hasJapanese(str: string): boolean;

    kanaToHiragna(str: string): string;
    kanaToKatakana(str: string): string
    kanaToRomaji(str: string, system: RomajiSystem): string
  }

  export type KuroshiroConverterOptions = {
    romajiSystem?: RomajiSystem;
    to?: SyllabarySystem;
    mode?: ConvertMode;
    delimiter_start?: '(' | string;
    delimiter_end?: '(' | string;
  }

  export default class Kuroshiro {
    public static Util: KuroshiroUtils;
    init<T extends KuroshiroAnalyzer>(analyzer: T): Promise<void>;
    convert(str: string, options?: KuroshiroConverterOptions): Promise<string>
  }
}