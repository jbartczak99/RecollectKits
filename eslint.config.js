import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Generated bundles / framework output — never lint or track these.
  globalIgnores(['dist', 'build', '.react-router']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // React Router route modules legitimately export framework conventions
      // (meta, links, loaders, error boundaries) alongside their component.
      // Allow those names so they don't trip the fast-refresh rule.
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: [
            'meta',
            'links',
            'headers',
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'ErrorBoundary',
            'HydrateFallback',
            'shouldRevalidate',
            'handle',
          ],
        },
      ],
    },
  },
  {
    // Route config + framework entry: not components, no fast refresh involved.
    files: ['src/routes.js', 'src/entry.client.jsx', 'react-router.config.js'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
