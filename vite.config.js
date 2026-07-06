import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" giúp app chạy đúng dù deploy ở GitHub Pages dạng
// https://<user>.github.io/<repo-name>/ mà không cần sửa gì thêm.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
