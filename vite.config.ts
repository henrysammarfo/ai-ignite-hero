import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/solstice": {
        target: "https://instructions.solstice.finance",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/solstice/, ""),
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
