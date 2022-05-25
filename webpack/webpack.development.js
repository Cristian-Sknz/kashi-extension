const config = require('./webpack.common.js');

/** 
 * @type { import('webpack').Configuration } 
*/
module.exports = {
  ...config,
  mode: 'development',
  devtool: 'inline-source-map',
}