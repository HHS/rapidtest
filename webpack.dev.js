const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: "development",
  output: {
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'https://localhost:8080',
        'secure': false
      }
    }
  }
});
