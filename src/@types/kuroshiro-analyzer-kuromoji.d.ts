declare module 'kuroshiro-analyzer-kuromoji' {
  import { KuroshiroAnalyzer } from 'kuroshiro';

  type KuromojiAnalyzerOptions = {
    dictPath: string;
  }
  export default class KuromojiAnalyzer implements KuroshiroAnalyzer {
    constructor(options?: KuromojiAnalyzerOptions)
  }
}