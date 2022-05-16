import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

const instance = new Kuroshiro();

const { getURL } = chrome.runtime;
  
const analyzer = new KuromojiAnalyzer({
  dictPath: getURL("./kuromoji/dict/")
});

export default (() => instance.init(analyzer).then(() => instance))();