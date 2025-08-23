import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: false, // Set to true if you need HTTPS for production testing
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  define: {
    global: "globalThis",
    'process.env': {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['@web3auth/modal', '@web3auth/base', '@web3auth/solana-provider'],
    exclude: ['@web3auth/modal-react-hooks']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'web3auth': ['@web3auth/modal', '@web3auth/base', '@web3auth/solana-provider']
        }
      }
    }
  }
}));
