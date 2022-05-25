const { DefinePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

const { author, version } = require('../package.json');
const manifest = require('../manifest.json')

const path = require("path");

/** 
 * @type { import('webpack').Configuration } 
*/
module.exports = {
  target: 'browserslist',
  entry: {
    content: path.join(__dirname, '..',"src/index.ts")
  },
  output: {
    path: path.join(__dirname, '..', "dist/"),
    filename: "[name].js"
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      use: "ts-loader"
    }]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      path: require.resolve("path-browserify")
    }
  },
  performance: {
    hints: false
  },
  plugins: [
    new DefinePlugin({
      Kashi: {
        version: JSON.stringify(version)
      }
    }),
    new CopyPlugin({
      patterns: [{
        from: path.resolve(__dirname, '..', 'public')
      }]
    }),
    new GenerateJsonPlugin('manifest.json', {
      ...manifest,
      author,
      version,
    }),
  ]
};