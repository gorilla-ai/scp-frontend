const path = require('path');
const webpack = require('webpack');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const extractCSS = new ExtractTextPlugin({
//     filename: '../css/vendor.css',
//     allChunks: true
// });

var cfg = {
    mode: 'development',
    entry: {
        app: ['babel-polyfill', './src/app.js']
        // vendor: [
        //     'bluebird',
        //     'classnames',
        //     'jquery',
        //     'lodash',
        //     'loglevel',
        //     'loglevel-prefix-persist/client',
        //     'moment',
        //     'object-path-immutable',
        //     'react',
        //     'react-dom',
        //     'react-dom/server',
        //     'underscore.string'
        // ],
    },
    resolve: {
        alias: {
          'react-ui': path.resolve(__dirname, 'node_modules/react-ui')
          //chewbacca: path.resolve(__dirname, '../chewbacca-ui/src') // Local
          //chewbacca: path.resolve(__dirname, 'node_modules/chewbacca-ui/build/src') // Prod
        },
        modules: ['node_modules']
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'build/files'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            // {
            //   test: /\.less$/,
            //   use: extractLESS.extract({
            //     fallback: 'style-loader',
            //     use: ['css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]!less-loader']
            //   })
            // },
            {
                test: /\.less$/i,
                use: [
                  // compiles Less to CSS
                  'style-loader',
                  'css-loader',
                  'less-loader',
                ],
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)(\?.+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000,
                        name: '[hash:base64:5].[ext]',
                        publicPath: '../assets',
                        outputPath: '../assets'
                    }
                }
            },
            {
                test: /\.json$/,
                type: 'javascript/auto',
                loader: 'json-loader'
            }
        ]
    },/*
    eslint: {
        configFile: './.eslintrc'
    },*/
    plugins: [
        // new ExtractTextPlugin("../css/vendor.css", {
        //     allChunks: true
        // }),
        // new webpack.optimize.CommonsChunkPlugin(
        //     /* chunkName= */"vendor", 
        //     /* filename= */"vendor.js"
        // )
        //extractCSS
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
          template: 'index.html',
          filename: '../index.html'
        }),
        new CleanWebpackPlugin()
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 450000,
        maxSize: 900000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        enforceSizeThreshold: 50000,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime~${entrypoint.name}`,
      }
    }
};

if (process.env.NODE_ENV === 'production') {
    cfg.plugins = cfg.plugins.concat(
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         screw_ie8: true
        //     }
        // }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify("production")
            }
        })
    )
}

module.exports = cfg