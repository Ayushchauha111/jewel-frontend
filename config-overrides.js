const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallback for 'crypto'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
  };

  // Add plugins for 'process' and 'Buffer' (if needed)
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Production optimizations
  if (env === 'production') {
    // Enable tree-shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
      // Split chunks more aggressively
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for large libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // Separate chunk for react-icons
          reactIcons: {
            name: 'react-icons',
            test: /[\\/]node_modules[\\/]react-icons[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Separate chunk for MUI
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Optimize module resolution for tree-shaking
    config.resolve = {
      ...config.resolve,
      mainFields: ['browser', 'module', 'main'],
    };
  }

  return config;
};