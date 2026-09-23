import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/tasks": {
        target: "https://ayets-taskflow-manager.onrender.com",
        changeOrigin: true,
      },
      "/api": {
        target: "https://ayets-taskflow-manager.onrender.com",
        changeOrigin: true,
      },
    },
  },
});

