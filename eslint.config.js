import eslint from 'eslint';
   export default [
    {
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
          // Browser globals
          window: 'readonly',
          document: 'readonly',
          navigator: 'readonly',
          console: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
          requestAnimationFrame: 'readonly',
          cancelAnimationFrame: 'readonly',
          localStorage: 'readonly',
          sessionStorage: 'readonly',
          fetch: 'readonly',
          alert: 'readonly',
          confirm: 'readonly',
          jest: 'readonly',
          describe: 'readonly',
          it: 'readonly',
          test: 'readonly',
          expect: 'readonly',
          beforeEach: 'readonly',
          afterEach: 'readonly',
          beforeAll: 'readonly',
          afterAll: 'readonly'
        }
      },
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
      rules: {
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['warn'],
        'no-console': ['warn', { allow: ['warn', 'error'] }]
      }
    }
];
