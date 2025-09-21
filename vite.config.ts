import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const normalizeBasePath = (value?: string) => {
  if (!value || value === "/") {
    return "/";
  }

  const trimmed = value.replace(/\/+$/, "").replace(/^\/+/, "");
  return `/${trimmed}/`;
};

const base = normalizeBasePath(process.env.VITE_APP_BASE_PATH);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
