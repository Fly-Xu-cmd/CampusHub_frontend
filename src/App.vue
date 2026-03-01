<script setup lang="ts">
import { onLaunch, onShow } from "@dcloudio/uni-app";
import { useSystemStore } from "@/store/system";
import { useUserStore } from "@/store/user";
import { onMounted } from "vue";
import { initWebSocket } from "@/utils/websocket";

const systemStore = useSystemStore();
const userStore = useUserStore();

onLaunch(() => {
  // 1. 初始化系统布局信息
  systemStore.initSystemInfo();
  userStore.initUserStore();

  // 注意：WebSocket 初始化已由 userStore.restoreFromStorage() 处理
  // 不需要在此处重复初始化，避免多重连接问题
});

onShow(() => {
  // 应用从后台恢复时，更新离线时间
  const currentTime = Math.floor(Date.now() / 1000);
  uni.setStorageSync("last_offline_time", currentTime);
  console.log("[App] 应用进入前台，已更新离线时间");
});

onMounted(() => {
  // 仅在客户端执行
  // 稍微延迟一丢丢，确保样式文件真的解析完了
  // #ifdef H5
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
  // #endif
});
</script>

<style lang="scss">
@use "@/styles/variables.scss" as *;
@import "@/styles/iconfont.css";

/* 全局样式 */
view,
text,
button,
image,
scroll-view,
swiper,
input,
picker {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* 所有元素（包括view）默认使用border-box */
}
</style>
