import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 250,
      ignored: ["**/cmsdata/**", "**/dist/**", "**/.git/**"],
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
