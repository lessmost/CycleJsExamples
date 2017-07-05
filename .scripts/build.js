'use strict'

const fs = require('fs-extra')
const path = require('path')
const mkdirp = require('mkdirp')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const entriesConfig = require('../entries.config');

const buildPath = path.join(process.cwd(), 'build')
const publicPath = path.join(process.cwd(), 'public')

mkdirp.sync(buildPath)

const entries = {};
Object.keys(entriesConfig).forEach((key) => {
  entries[key] = [
    entriesConfig[key]
  ];
});

const compiler = webpack({
  entry: entries,
  output: {
    filename: '[name].bundle.js',
    path: './public/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['env', 'stage-0']
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
})

compiler.run((err, stats) => {
  if (err) {
    console.log(err)
  } else {
    fs.copySync(publicPath, buildPath)
  }
})
