module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'import'
  ],
  env: {
    'browser': true
  },
  globals: {
    'io': false,
    'Cookies': false,
    '$': false,
  }
};
