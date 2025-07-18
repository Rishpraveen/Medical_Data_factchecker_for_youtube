const path = require('path');

// Separate config for caption fetcher bundle
module.exports = {
  entry: './src/utils/captionFetcher.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'caption-fetcher-bundle.js',
    library: 'CaptionFetcher',
    libraryTarget: 'global'
  },
  mode: 'production',
  target: 'webworker',
  resolve: {
    extensions: ['.js']
  }
};
