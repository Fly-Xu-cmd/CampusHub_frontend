import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [uni()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BASE_URL || "http://192.168.10.9:8888",
          changeOrigin: true, // 关键：启用跨域
          // 不需要路径重写，因为我们的 API 路径已经以 /api 开头
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 这是为了屏蔽 Wot Design Uni 内部的旧语法警告
          api: "modern-compiler", // 使用现代编译器
          silenceDeprecations: ["legacy-js-api", "import", "global-builtin"],
          // 如果你需要覆盖主题色，可以在这里加 additionalData
        },
      },
    },
  };
});
