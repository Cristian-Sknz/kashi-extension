declare module 'aromanize/base' {
  export type TransliterationRule =
    | 'rr'
    | 'rr-translit'
    | 'skats'
    | 'ebi'
    | 'konsevich';

  export default class Aromanize {
    static romanize(str: string): string;
    static hangulToLatin(str: string, rule: TransliterationRule);
  }
}