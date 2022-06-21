const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, 'src', 'index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'umd'),
    filename: '[name].min.js',
    libraryTarget: 'umd',
    library: 'WalletConnectCore',
    umdNamedDefine: true,
    globalObject: 'this',
  },
};
