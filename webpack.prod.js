const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins');

function appVersion () {
  return (process.env.docker_env || 'test') + ":" + (process.env.docker_sha || 'test');
}

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new BugsnagSourceMapUploaderPlugin({
      apiKey: "YOURBUGSNAGAPIKEY",
      appVersion: appVersion()
    })
  ]
});