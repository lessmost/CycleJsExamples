'use strict'

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const entriesConfig = require('../entries.config');

const host = 'http://localhost'
const port = 8000

const entries = {};
Object.keys(entriesConfig).forEach((key) => {
  entries[key] = [
    `webpack-dev-server/client?${host}:${port.toString()}`,
    'webpack/hot/dev-server',
    entriesConfig[key]
  ];
});

const config = {
  entry: entries,
  devtool: "source-map",
  output: {
    filename: '[name].bundle.js',
    path: '/'
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
    new webpack.HotModuleReplacementPlugin(),
    new ProgressBarPlugin()
  ]
}

const compiler = webpack(config)
compiler.plugin('done', () => {
  console.log(`App is running at ${host}:${port}`)
})
const server = new WebpackDevServer(compiler, {
  historyApiFallback: true,
  hot: true,
  contentBase: './public',
  stats: 'errors-only'
})
server.listen(port)
