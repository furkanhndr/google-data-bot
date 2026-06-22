const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    'service-worker': './src/background/service-worker.ts',
    'content':        './src/content/scraper.ts',
    'auth-sync':      './src/content/auth-sync.ts',
    'popup':          './src/popup/popup.ts',
  },
  output: {
    path:     path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean:    true,
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use:  'ts-loader',
      exclude: /node_modules/,
    }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@googlebusinessdata/shared-types': path.resolve(__dirname, '../packages/shared-types/src/index.ts'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'manifest.json', to: 'manifest.json' },
      ],
    }),
  ],
  // MV3 service workers must not be bundled as modules
  optimization: { minimize: false },
}
