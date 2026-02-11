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
  base: "/provider/",
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
    host: true,
    proxy: {
      "/api": {
        target: "https://dvpn-node-operator.qubetics.work",
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
});
