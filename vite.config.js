import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // The React Router plugin handles React/JSX transformation itself, so we no
  // longer include @vitejs/plugin-react separately (it would double-transform).
  plugins: [reactRouter()],
  // Strip console.* and debugger statements from PRODUCTION builds only, so we
  // don't leak user IDs / emails / session payloads via the browser console.
  // Dev (and `--mode development` builds) keep them for debugging.
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
