const CopyPlugin = require('copy-webpack-plugin');
const config = require('./webpack.config.js')
const path = require("path");

/** @type {import('webpack').Configuration} */
module.exports = {
  ...config,
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: path.resolve(__dirname, '..', 'public'),
        globOptions: {
          ignore: ['**/kuromoji/**']
        }
      }]
    })
  ]
}