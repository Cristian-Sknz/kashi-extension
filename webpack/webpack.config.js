const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  target: 'browserslist',
  entry: {
    background: path.join(__dirname, '..', "src/index.ts"),
    content: path.join(__dirname, '..',"src/content.ts")
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
    extensions: [".ts", ".js"],
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