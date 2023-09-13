const SyncModuleIdsPlugin = require('webpack/lib/ids/SyncModuleIdsPlugin');

let plugins = [];

if (!process.env.IGNORE_MODULE_IDS) {
  const path = require('path');
  const lib = path.resolve(__dirname, 'lib');
  const style = path.resolve(__dirname, 'style');
  plugins.push(
    new SyncModuleIdsPlugin({
      path: 'webpack.module.ids.json',
      mode: 'update',
      test: (module) => {
        const r = `${module.userRequest}`;
        return r.indexOf(lib) === 0 || r.indexOf(style) == 0;
      },
    })
  );
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
  plugins,
};
