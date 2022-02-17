const { ProvidePlugin } = require('webpack');

module.exports = {
  reactScriptsVersion: 'react-scripts' /* (default value) */,

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        buffer: require.resolve('buffer/'),
        http: false,
        https: false,
        url: false,
        util: false
      };

      return webpackConfig;
    },
    plugins: [new ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })]
  }
};
