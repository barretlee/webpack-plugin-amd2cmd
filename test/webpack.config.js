'use strict';

var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var RaxWebpackPlugin = require('rax-webpack-plugin');

var Amd2Cmd = require('../lib/index');

module.exports = {
  entry: {
    'bundle': path.join(__dirname, './mod/index.js')
  },
  output: {
    libraryTarget: 'amd',
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx', ''],
    alias: {
      'react': 'rax'
    }
  },
  externals: ['rax', /^@ali\/tile-\w+/i, 'tida'],
  plugins: [
    new RaxWebpackPlugin({
      target: 'amd',
      externalBuiltinModules: true
    }),
    new Amd2Cmd({
      groupName: 'group',
      modName: 'mod',
      dealDeps: function() {
        console.log(arguments);
      }
    }),
    new webpack.NoErrorsPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })
  ],
  module: {
    loaders: [{
        test: /\.jsx?$/,
        loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
        query: {
          babelrc: false,
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-rax')
          ]
        }
      },
      {
        test: /\.css$/,
        loader: 'stylesheet-loader'
      }
    ]
  }
};