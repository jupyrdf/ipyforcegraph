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
        use: [
          {
            'loader': 'source-map-loader',
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                if (resourcePath.includes('@bokuweb/zstd-wasm')) {
                  // doesn't ship `/lib`
                  return false;
                }
                return true;
              },
            },

          }
        ],
      },
      {
        test: /zstd\.wasm/,
        type: 'asset/resource',
      },
    ],
  },
};
