'use strict';

const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['es6', '.js']
  },
  entry: {
    entry: './src/client.js'
  },
  output: {
    path: __dirname + '/app/js/',
    filename: 'client.js'
  },
  externals: {
    'socket.io-client': 'io',
    'js-cookie': 'Cookies',
    'jquery': '$'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [[
            'env', {
              targets: {
                browsers: ['last 2 versions']
              }
            }
          ]]
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};
