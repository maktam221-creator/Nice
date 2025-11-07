import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // Vite plugins.
    plugins: [react()],
    // Vite build options.
    build: {
      chunkSizeWarningLimit: 1000, // Set warning limit to 1000 kB.
    },
    // Define global constants for replacement.
    define: {
      // This makes process.env variables available in your client-side code.
      // Make sure to only expose non-sensitive variables.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    }
  }
});
