module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime',
    [
      'ramda',
      {
        useES: false,
      },
    ],
  ],
};