const config = require('./webpack.common.js');
const ZipPlugin = require('zip-webpack-plugin');

/** 
 * @type { import('webpack').Configuration } 
*/
module.exports = {
  ...config,
  mode: 'production',
  plugins: [
    ...config.plugins,
    new ZipPlugin({
      filename: 'Kashi-Dict.zip',
      exclude: [/\.zip$/],
      path: '../build/'
    }),
    new ZipPlugin({
      filename: 'Kashi-Light.zip',
      exclude: ['kuromoji', /\.zip$/],
      path: '../build/'
    }),
  ]
};