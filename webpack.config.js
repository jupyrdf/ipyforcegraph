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
        use: 'source-map-loader',
      },
      {
        test: /zstd\.wasm/,
        type: 'asset/resource',
      },
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],
};
