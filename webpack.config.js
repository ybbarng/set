const path = require('path');
const eslintFormatter = require('eslint-friendly-formatter');

module.exports = {
  resolve: {
    extensions: ['es6', '.js'],
  },
  entry: {
    entry: './src/client.js',
  },
  output: {
    path: path.join(__dirname, 'app/js/'),
    filename: 'client.js',
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
};
