const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtTextPlugin = require('extract-text-webpack-plugin');

const PORT = 8098;

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: path.resolve(__dirname, 'src/index.js'),
    'esri-leaflet-debug': path.resolve(__dirname, 'node_modules/esri-leaflet/dist/esri-leaflet-debug.js')
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.jsx', '.js', '.less', '.css', '.json', '.html'],
    alias: {
      '@GIS_README' : path.resolve(__dirname, 'node_modules/gis/README.md'),
      '@images'     : path.resolve(__dirname, 'src/assets/images/'),
      '@less'       : path.resolve(__dirname, 'src/assets/less/'),
      '@json'       : path.resolve(__dirname, 'src/assets/json/'),
      gis           : path.resolve(__dirname, '../build/src/'),
      services      : path.resolve(__dirname, 'src/services/'),
      components    : path.resolve(__dirname, 'src/components/')
    }
  },
  devtool: 'source-map',
  devServer: {
    port: PORT,
    contentBase: './build',
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html')
    }),
    new ExtTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new CopyPlugin([{
      test: /\.png$/,
      from: path.resolve(__dirname, 'src/assets/images'),
      to: 'assets'
    }])
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules)/,
      use: 'babel-loader'
    }, {
      test: /\.(css|less)$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            strictMath: true,
            noIeCompat: true,
          },
        }
      ]
    }, {
      test: /\.md$/,
      include: [path.resolve(__dirname, 'node_modules/gis')],
      use: [
        'html-loader',
        'markdown-loader'
      ]
    }, {
      test: /\.png$/,
      use: [{
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
          name: '[name].[ext]'
        }
      }]
    }, {
      test: /\.(eot|ttf|woff|woff2|svg|svgz|ico)(\?.+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash:8].[ext]'
        }
      }]
    }]
  }
};
