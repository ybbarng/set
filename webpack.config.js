const path = require('path');
const eslintFormatter = require('eslint-friendly-formatter');
const CleanWebpackPlugin = require('clean-webpack-plugin');
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
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          formatter: eslintFormatter,
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [[
            'env', {
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
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      filename: '../index.html',
    }),
    new CleanWebpackPlugin('./app/js'),
  ],
};
