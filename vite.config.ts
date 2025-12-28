import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html", // Giriş qapısı
        admin: "admin.html", // Admin qapısı
        // gələcəkdə dashboard: 'dashboard.html'
      },
    },
  },
});
