const { throwUnexpectedConfigError } = require('@craco/craco');

const { ProvidePlugin } = require('webpack');

module.exports = {
  reactScriptsVersion: 'react-scripts' /* (default value) */,

  babel: {
    presets: [],
    plugins: [],
    loaderOptions: (babelLoaderOptions, { env, paths }) => {
      return babelLoaderOptions;
    }
  },
  typescript: {
    enableTypeChecking: true /* (default value)  */
  },

  jest: {
    babel: {
      addPresets: true /* (default value) */,
      addPlugins: true /* (default value) */
    },
    configure: (jestConfig, { env, paths, resolve, rootDir }) => {
      return jestConfig;
    }
  },
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
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    return devServerConfig;
  },
  plugins: [
    {
      plugin: {
        overrideCracoConfig: ({ cracoConfig, pluginOptions, context: { env, paths } }) => {
          return cracoConfig;
        },
        overrideWebpackConfig: ({ webpackConfig, cracoConfig, pluginOptions, context: { env, paths } }) => {
          return webpackConfig;
        },
        overrideDevServerConfig: ({
          devServerConfig,
          cracoConfig,
          pluginOptions,
          context: { env, paths, proxy, allowedHost }
        }) => {
          return devServerConfig;
        },
        overrideJestConfig: ({ jestConfig, cracoConfig, pluginOptions, context: { env, paths, resolve, rootDir } }) => {
          return jestConfig;
        }
      },
      options: {}
    }
  ]
};
