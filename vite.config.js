import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ["react-icons"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React and related libraries
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Group UI libraries
          "vendor-ui": ["react-bootstrap", "react-toastify", "react-icons"],
          // Group utility libraries
          "vendor-utils": ["axios", "react-hook-form"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
  },
});
