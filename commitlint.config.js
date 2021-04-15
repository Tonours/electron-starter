module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // workspace packages
        'app-main',
        'app-preload',
        'app-renderer',
        '*',
      ],
    ],
  },
}