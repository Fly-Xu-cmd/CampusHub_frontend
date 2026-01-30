import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "@/styles/iconfont.css";
/**
 * 创建应用实例
 * @returns 包含app实例的对象
 */
export function createApp() {
  const app = createSSRApp(App);
  // 创建并配置pinia
  const pinia = createPinia();
  app.use(pinia);
  return {
    app,
  };
}
