/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const WebpackBar = require('webpackbar');

const CreateFileWebpack = require('create-file-webpack');


module.exports = {
  node: { // Related to these issues https://github.com/request/request/issues/1691 & https://github.com/request/request/issues/1529
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      core: path.resolve(__dirname, 'node_modules/react-ui/build/src'),
      // gis: path.resolve(__dirname, 'node_modules/gis/build')
      gis: path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {/* Try url-loader and fallback with file-loader to maximize web page data transfer */
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
        loader: 'url-loader?limit=50000&name=build/css/[name].[hash].[ext]'
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'build/js/[name]-[hash].js' // add [hash] for caching if needed
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'GIS example 範例',
      template: 'src/index.html',
      filename: 'index.html',
      favicon: 'images/favicon.ico',
      meta: {
        charset: 'utf-8',
        viewport: 'width=device-width, initial-scale=1'
      }
    }),
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          append: true,
          module: 'esri-leaflet-debug',
          entry: 'https://unpkg.com/esri-leaflet@2.2.4/dist/esri-leaflet-debug.js'
        },
      ],
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
      dirs: ['locales', 'less']
    }),
    new WebpackBar(),
    // To strip all locales except “en”, “es-us” and “zh-tw”
    // (“en” is built into Moment and can’t be removed)
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-tw']
    }),
    new CleanWebpackPlugin(),
    new CreateFileWebpack({
      // path to folder in which the file will be created
      path: './dist/build/js',
      // file name
      fileName: 'modernizr.min.js',
      // content of the file
      content: '/* can do: import/export or write javascript here  */'
    })
  ],
  devServer: {
    index: '', // specify to enable root proxying
    contentBase: path.join(__dirname, 'dist'),
    compress: true, // GZip
    noInfo: true, // Supress webpack bundle info. Errors and warnings will still be shown.
    stats: 'minimal', // some bundle information, but not all of it.
    hot: true,
    // host: '0.0.0.0', // default to localhost
    port: 8098,
    https: false,
    historyApiFallback: true,
    // proxy: [{
    //   // context: ['/'], // Only proxy all + index page, but not others build by webpack like js/css/images/locales for local development.
    //   context: (pathname, req) => {
    //     if (/^\/(build|images|lib|mock)\//i.test(pathname)) {
    //       // Serve from local
    //       return false;
    //     }

    //     // Serve from proxy
    //     return true;
    //   },
    //   target: 'http://192.168.10.182:8080',
    //   secure: false,
    //   changeOrigin: true,
    //   headers: {
    //     Connection: 'keep-alive'
    //   }
    // }],
    before(app) {
      app.post('/mock/*', (req, res) => {
        res.redirect(303, req.originalUrl);
      });
      app.put('/mock/*', (req, res) => {
        res.redirect(303, req.originalUrl);
      });
      app.patch('/mock/*', (req, res) => {
        res.redirect(303, req.originalUrl);
      });
      app.delete('/mock/*', (req, res) => {
        res.redirect(303, req.originalUrl);
      });
    },
    /*
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Access-Control-Allow-Origin": "*"
    },
    */
  },
  // REMOVE OPTIMIZATION COZ, NEED TO SET SPECIFIC FILE NAME FOR app.js/vendor.js & app.css/vendor.css
  optimization: {
    /* splitChunks - remove js duplicate dependency */
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true
          /*
          Tells webpack to ignore splitChunks.minSize, splitChunks.minChunks,
          splitChunks.maxAsyncRequests and splitChunks.maxInitialRequests options
          and always create chunks for this cache group.
          */
        },
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  }
};

/*
// package.json old settings for webpack
"start": "webpack-dev-server --open --mode development",
"start-prod": "NODE_ENV=production webpack-dev-server --open --mode production",
"build-prod": "NODE_ENV=production webpack --progress --mode production",
"build-dev": "webpack --progress --mode development",
"analyze-prod": "NODE_ENV=production webpack --progress --mode production --analyze true",
"analyze-dev": "webpack --progress --mode development --analyze true",
"test": "echo \"Error: no test specified\" && exit 1"
*/
