/* global module, require, process */

const path = require('path');

function generate(options) {
  return {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './lib/index.ts',
    output: {
      path: path.resolve(options.output.path),
      library: 'WDXLab-Events',
      libraryTarget: 'umd',
    },
    resolve: {
      extensions: ['.js', '.ts', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            ...(options.useBabel ? ['babel-loader'] : []),
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
  };
}

module.exports = [
  generate({
    output: {
      path: 'dist/es6',
    },
  }),
  generate({
    output: {
      path: 'dist/es5',
    },
    useBabel: true,
  }),
];
