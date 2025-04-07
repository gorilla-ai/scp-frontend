/* eslint-disable import/no-extraneous-dependencies */

process.env.NODE_ENV = 'development'; // Set development

const path = require('path');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

const lessPluginGlob = require('less-plugin-glob');
const autoprefixer = require('autoprefixer');
// const cssnano = require('cssnano');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Visualizer = require('webpack-visualizer-plugin');

const common = require('./webpack.common.js');

const postcssLoaderOptions = {
  plugins: [
    autoprefixer({ browsers: ['> 0.5%, last 2 versions, not dead'] }),
    // cssnano({ preset: 'default' })
  ]
};

const copyPlugins = [
  { from: path.join(__dirname, 'images'), to: 'images' },
  { from: path.join(__dirname, 'mock'), to: 'mock' }
];

module.exports = (env, argv) => {
  const config = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
      app: './src/app.jsx'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          include: path.resolve(__dirname, 'src'),
          use: ['babel-loader', 'react-hot-loader/webpack']
        },
        {
          test: /\.(le|c)ss$/,
          use: [
            {
              loader: 'style-loader' // creates style nodes from JS strings
            },
            {
              loader: 'css-loader' // translates CSS into CommonJS
            },
            {
              loader: 'postcss-loader', // translates CSS into CommonJS
              options: postcssLoaderOptions
            },
            {
              loader: 'less-loader', // compiles Less to CSS
              options: {
                paths: [
                  path.resolve(path.join(__dirname, 'less')) // needed for lessPluginGlob
                ],
                plugins: [
                  lessPluginGlob // require('less-plugin-glob')
                ]
              }
            }
          ],
        }
      ]
    },
    plugins: [
      new CopyPlugin(copyPlugins),
      /*
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'build/css/[name].[hash].css',
        chunkFilename: 'build/css/[name].[hash].css'
      })
      */
    ]
  });

  if (argv.analyze === 'true') {
    config.plugins.push(new BundleAnalyzerPlugin());
    config.plugins.push(new Visualizer());
  }

  return config;
};
