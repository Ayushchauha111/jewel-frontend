const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Suppress source-map parsing warnings (e.g. html5-qrcode ships broken .ts source map refs)
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    /Failed to parse source map/,
  ];

  // Exclude html5-qrcode from source-map-loader so it doesn't try to parse broken maps
  const html5QrcodeExclude = /node_modules[\\/]html5-qrcode/;
  const addExclude = (rule) => {
    if (!rule) return;
    const prev = rule.exclude;
    if (prev) {
      rule.exclude = [
        ...(Array.isArray(prev) ? prev : [prev]),
        html5QrcodeExclude,
      ];
    } else {
      rule.exclude = html5QrcodeExclude;
    }
  };
  const checkRule = (r) =>
    r.enforce === 'pre' &&
    r.use &&
    r.use.some((u) => (typeof u === 'string' ? u.includes('source-map-loader') : u.loader && u.loader.includes('source-map-loader')));
  const walkRules = (rules) => {
    if (!rules) return;
    for (const r of rules) {
      if (checkRule(r)) addExclude(r);
      if (r.oneOf) walkRules(r.oneOf);
    }
  };
  walkRules(config.module.rules);

  // Node polyfills for webpack 5 (CRA5 drops them; needed by styled-components, axios, etc.)
  const processPkg = path.dirname(require.resolve('process/package.json'));
  const processBrowserFile = path.join(processPkg, 'browser.js');
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': processBrowserFile,
  };
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    process: processBrowserFile,
    buffer: require.resolve('buffer/'),
    stream: false,
    util: false,
  };
  // Allow ESM packages (e.g. axios) to resolve 'process/browser' without .js extension
  config.resolve.fullySpecified = false;

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

    config.resolve.mainFields = ['browser', 'module', 'main'];
  }

  return config;
};