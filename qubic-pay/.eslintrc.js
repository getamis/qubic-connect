// eslint-disable-next-line @typescript-eslint/no-var-requires

module.exports = {
  root: true,
  extends: [
    'airbnb',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    "plugin:import/typescript",
    'plugin:react-hooks/recommended'
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      "typescript": {
        "alwaysTryTypes": true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        "project": ".",
      },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
    '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
    'arrow-body-style': 0,
    'import/prefer-default-export': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    "import/no-unresolved": "error",
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-param-reassign': 0,
    'no-shadow': 0,
    'no-underscore-dangle': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/destructuring-assignment': 0,
    'react/no-did-mount-set-state': 0,
    'react/no-multi-comp': 0,
    'react/sort-comp': 0,
    'no-lonely-if': 0,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'react/prefer-stateless-function': 'off',
    'react/require-default-props': 0,
    'react/default-props-match-prop-types': 0,
    'react/jsx-props-no-spreading': 0,
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-unreachable': 2,
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['error'],
      },
    },
    {
      files: ['*.test.ts', '*.test.tx'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
  ],
};
