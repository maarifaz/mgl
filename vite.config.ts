import { defineConfig } from "vite";

export default defineConfig({
  base: "https://github.com/maarifaz/mgl", // GitHub Pages reponun adı bu olduğu için bunu yazmalısın.
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
      },
    },
  },
});
