const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const lessPluginGlob = require('less-plugin-glob')

const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

const CopyPlugin = require('copy-webpack-plugin');

const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Visualizer = require('webpack-visualizer-plugin');
const WebpackBar = require('webpackbar');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = (env, argv) => {
  // console.log('----', env);
  // console.log('----', argv);

  const postcssLoaderOptions = {
    plugins: [
      autoprefixer({ browsers: ['last 10 versions', 'ie >= 6'] })
    ]
  };

  const copyPlugins = [
    { from:path.join(__dirname, 'lib'), to:'lib' },
    { from:path.join(__dirname, 'images'), to:'images' },
    { from:path.join(__dirname, 'src/unsupported-browser.html'), to:'unsupported-browser.html' }
  ]

  if (argv.mode === 'production') {
    postcssLoaderOptions.plugins.push(cssnano({ preset: 'default' }));
  } else if (argv.mode === 'development') {
    copyPlugins.push({ from:path.join(__dirname, 'mock'), to:'mock' })
  }

  const config = {
    cache: false,
    node: { // Related to these issues https://github.com/request/request/issues/1691 & https://github.com/request/request/issues/1529
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    entry: {
      // app: './src/app.jsx'
      app: ['babel-polyfill', './src/app.jsx'], /* with @babel/polyfill js size increases */
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        app: path.resolve(__dirname, 'src'),
        core: path.resolve(__dirname, 'node_modules/react-ui/build/src'),
        'cibd-base': path.resolve(__dirname, 'node_modules/cibd-ui-base/build/src'),
        'cibd-event': path.resolve(__dirname, 'node_modules/cibd-ui-event/build/src'),
        'cibd-analysis': 'D:/React/cibd-ui-analysis/build/src',//path.resolve(__dirname, 'node_modules/cibd-ui-analysis/build/src'),
        pluginsPath: path.resolve(__dirname, 'src/plugins'),
        widgetsPath: path.resolve(__dirname, 'src/widgetsPath'),
        /*
        'gis-track': path.resolve(__dirname, 'node_modules/gis/build/src'),
        chart: path.resolve(__dirname, 'node_modules/react-chart/build/src'),
        vbda: path.resolve(__dirname, 'node_modules/vbda-ui/build/src'),
        */
        // vbda: path.resolve(__dirname, '../vbda-ui/build/src'),
        // vbda: 'D:/codespace/vbda-ui_refactor/src',
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', {
              loader: 'postcss-loader',
              options: postcssLoaderOptions
            }]
          })
        },
        {
          test: /\.less$/i,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', {
              loader: 'postcss-loader',
              options: postcssLoaderOptions
            },
            {
              loader: 'less-loader',
              options: {
                paths: [
                  path.resolve(path.join(__dirname, 'less')) // needed for lessPluginGlob
                ],
                plugins: [
                  lessPluginGlob//require('less-plugin-glob')
                ]
              }
            }]
          })
        },
        {/* Try url-loader and fallback with file-loader to maximize web page data transfer */
          test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
          loader: 'url-loader?limit=50000&name=build/css/[name]-[hash].[ext]'
          /*
          use: [{
            loader: 'file-loader',
            options: {
              name() {
                return (argv.mode === 'development') ? 'images/[path]-[hash].[ext]' : 'images/[hash].[ext]';
              }
            }
          }]
          */
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'build/js/[name].[hash].bundle.js'
    },
    plugins: [
      new ExtractTextPlugin('build/css/[name].[hash].bundle.css'),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        title: '全國毒品資料庫 - 台灣高等檢察署',
        template: 'src/index.html',
        filename: 'index.html',
        favicon: 'images/favicon.ico',
        meta: {
          charset: 'utf-8',
          viewport: 'width=device-width, initial-scale=1'
        }
      }),
      new MergeJsonWebpackPlugin({
        debug: true,
        prefixFileName: true,
        output: {
          groupBy: [
            {
              pattern: './locales/en/*.json',
              fileName: 'build/locales/en.json'
            },
            {
              pattern: './locales/zh/*.json',
              fileName: 'build/locales/zh.json'
            }
          ]
        },
        globOptions: {
          nosort: true
        }
      }),
      new ExtraWatchWebpackPlugin({
        // files: [ 'path/to/file', 'src/**/*.json' ],
        dirs: ['locales']
      }),
      new WebpackBar(),
      // To strip all locales except “en”, “es-us” and “zh-tw”
      // (“en” is built into Moment and can’t be removed)
      new MomentLocalesPlugin({
        localesToKeep: ['es-us', 'zh-tw']
      }),
      new CopyPlugin(copyPlugins),
      new CleanWebpackPlugin()
    ],
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true, // GZip
      noInfo: true, // Supress webpack bundle info. Errors and warnings will still be shown.
      stats: 'minimal', // some bundle information, but not all of it.
      hot: true,
      // host: '0.0.0.0',
      port: 3006,
      https: false,
      historyApiFallback: true,
      proxy: {
        '/api': {
          //target: 'http://localhost:3004',
          target: 'http://192.168.10.204:8081',
          secure: false,
          changeOrigin: true,
          headers: {
            Connection: 'keep-alive'
          }
        },
        '/unit': {
          //target: 'http://localhost:3004',
          target: 'http://192.168.10.182:8080',
          secure: false,
          changeOrigin: true,
          headers: {
            Connection: 'keep-alive'
          }
        }
      }
    },
    optimization: {
      /* splitChunks - remove js duplicate dependency */
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            name: 'vendor',
            enforce: true
          },
        }
      },
      runtimeChunk: true
    }
  };

  if (argv.mode === 'development') {
    config.devtool = 'source-map';
    //config.output.filename = 'build/js/[name].[hash].bundle.js';
    //config.plugins[0] = new ExtractTextPlugin('build/css/[name].[hash].bundle.css');

    // Use style-loader to hot reload css
    config.module.rules[1] = {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    };
    config.module.rules[2] = {
      test: /\.less$/,
      use: [{
        loader: 'style-loader' // creates style nodes from JS strings
      }, {
        loader: 'css-loader' // translates CSS into CommonJS
      }, {
        loader: 'less-loader', // compiles Less to CSS
        options: {
          paths: [
            path.resolve(path.join(__dirname, 'less')) // needed for lessPluginGlob
          ],
          plugins: [
            lessPluginGlob//require('less-plugin-glob')
          ]
        }
      }]
    };
  } else if (argv.mode === 'production') {
    // config.plugins.push(new CleanWebpackPlugin());
  }

  if (argv.analyze === 'true') {
    config.plugins.push(new BundleAnalyzerPlugin());
    config.plugins.push(new Visualizer());
  }

  return config;
};

/** packages to install
 * moment-locales-webpack-plugin
 * webpackbar
 * webpack-visualizer-plugin
 */
