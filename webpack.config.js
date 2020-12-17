const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const eslintFormatter = require('eslint-formatter-friendly');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['es6', '.js'],
  },
  entry: {
    client: './src/js/client.js',
  },
  output: {
    path: path.join(__dirname, 'app/js/'),
    filename: '[name].[chunkhash].js',
  },
  externals: {
    'socket.io-client': 'io',
    'js-cookie': 'Cookies',
    'jquery': '$',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [[
            '@babel/preset-env', {
              targets: {
                browsers: ['last 2 versions'],
              },
            },
          ]],
        },
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      formatter: eslintFormatter,
    }),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      filename: '../index.html',
    }),
    new CleanWebpackPlugin(),
  ],
};
