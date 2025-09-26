import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist/legacy/build/pdf'],
  },
  worker: {
    format: 'es',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    ...(command === 'build' && process.argv.includes('--ssr') ? {
      ssr: true,
      outDir: 'dist/server',
      rollupOptions: {
        input: 'src/entry-server.tsx',
        output: {
          format: 'es'
        }
      }
    } : {}),
  },
}));