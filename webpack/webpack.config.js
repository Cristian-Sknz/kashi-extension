const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  target: 'browserslist',
  entry: {
    content: path.join(__dirname, '..',"src/index.ts")
  },
  output: {
    path: path.join(__dirname, '..', "dist/"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: path.resolve(__dirname, '..', 'public')
      }]
    })
  ]
};