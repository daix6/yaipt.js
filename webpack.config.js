var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: {
    yaipt: './index.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './'
  },
  module: {
    loaders: [{
      test: /\.ts$/,
      exclude: ['node_modules'],
      loader: 'ts-loader'
    }],
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: process.cwd(),
    compress: true,
    hot: true,
    inline: true,
    port: 9000,
    publicPath: '/'
  }
}
