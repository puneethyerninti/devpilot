// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: "0.0.0.0"
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
});
