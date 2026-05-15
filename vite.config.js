import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Strip console.* and debugger statements from production builds so we
  // don't leak user IDs / emails / session payloads via the browser console.
  // Dev still keeps them.
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
