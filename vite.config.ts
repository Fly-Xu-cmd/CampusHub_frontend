import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
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
});
