import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    ...(mode === 'ssr' && {
      lib: {
        entry: './src/entry-server.tsx',
        name: 'server',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react-router-dom'],
      },
      ssr: true,
    }),
  },
}));
