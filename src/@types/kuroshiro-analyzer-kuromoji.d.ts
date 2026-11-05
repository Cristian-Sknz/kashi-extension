declare module 'kuroshiro-analyzer-kuromoji' {
  import { KuroshiroAnalyzer } from 'kuroshiro';

  type KuromojiAnalyzerOptions = {
    dictPath: string;
  };
  export type KuromojiToken = {
    surface_form: string;
    reading?: string;
    pronunciation?: string;
  };
  export default class KuromojiAnalyzer implements KuroshiroAnalyzer {
    constructor(options?: KuromojiAnalyzerOptions);
    init(): Promise<void>;
    parse(text?: string): Promise<KuromojiToken[]>;
  }
}
