const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    popup: './popup_enhanced.js',
    content: './content.js',
    background: './background.js',
    options: './options.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true // Clean output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@ai': path.resolve(__dirname, 'src/ai'),
      '@medical': path.resolve(__dirname, 'src/medicalAnalysis')
    }
  },
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        ai: {
          test: /[\\/]src[\\/]ai[\\/]/,
          name: 'ai-modules',
          chunks: 'all',
          priority: 5
        },
        medical: {
          test: /[\\/]src[\\/]medicalAnalysis[\\/]/,
          name: 'medical-modules',
          chunks: 'all',
          priority: 5
        },
        utils: {
          test: /[\\/]src[\\/]utils[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 3
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    })
  ],
  performance: {
    maxEntrypointSize: 250000,
    maxAssetSize: 250000,
    hints: 'warning'
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map'
};
