const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCSS = new ExtractTextPlugin({
    filename: '../css/vendor.css',
    allChunks: true
});

var cfg = {
    mode: 'development',
    entry: {
        app: ['./src/app.js']
        // vendor: [
        //     'classnames',
        //     'lodash',
        //     'loglevel',
        //     'loglevel-prefix-persist/client',
        //     'moment',
        //     'react',
        //     'react-dom',
        //     'react-router'
        // ],
    },
    resolve: {
        alias: {
            // core: path.resolve(__dirname, 'node_modules/react-ui/build/src')
            core: path.resolve(__dirname, '../src')
        },
        modules: ['node_modules']
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'build/js'),
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
                test: /\.css$/,
                use: extractCSS.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                })
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)(\?.+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 50000,
                        name: '[hash:base64:5].[ext]',
                        publicPath: '../assets',
                        outputPath: '../assets'
                    }
                }
            },
            {
                test: /\.json$/,
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
        extractCSS        
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/
                }
            }
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