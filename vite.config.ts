import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// base: "./" 使构建产物可直接部署到 GitHub Pages 的任意子路径。
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // worker/ 独立于 src 的 tsconfig 项目之外（需要 Workers 运行时类型，和主应用的 DOM 类型冲突），
    // 单独把它的测试也纳入同一次 `npm test`，但不会被 `tsc --noEmit`（只 include "src"）触碰到。
    include: ["src/tests/**/*.test.{ts,tsx}", "worker/**/*.test.ts"],
  },
});
