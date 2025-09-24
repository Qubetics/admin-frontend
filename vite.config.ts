import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill Node.js built-in modules.
      protocolImports: true,
    }),
  ],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
      process: "process/browser",
      util: "util",
      stream: "stream-browserify",
      events: "events",
    },
  },
  optimizeDeps: {
    include: ["buffer", "process"],
  },
  server: {
    proxy: {
      '/api': { // Proxy requests starting with /api
        target: 'https://dvpn-admin-api.qubetics.work', // Your backend server address
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,
        ws: true,
      },
    },
  },
});