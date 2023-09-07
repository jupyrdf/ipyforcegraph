const SyncModuleIdsPlugin = require('webpack/lib/ids/SyncModuleIdsPlugin');

let plugins = [];

if(!process.env.IGNORE_MODULE_IDS) {
  plugins.push(
    new SyncModuleIdsPlugin({path: 'webpack.module.ids.lock'})
  )
}

module.exports = {
  output: {
    clean: true,
  },
  devtool: 'source-map',
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: process.env.TOTAL_COVERAGE
          ? ['@ephesoft/webpack.istanbul.loader']
          : ['source-map-loader'],
      },
      {
        test: /zstd\.wasm/,
        type: 'asset/resource',
      },
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],
  plugins
};
