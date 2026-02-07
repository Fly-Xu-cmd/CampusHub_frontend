<script setup lang="ts">
import { onLaunch, onShow } from "@dcloudio/uni-app";
import { useSystemStore } from "@/store/system";
import { useUserStore } from "@/store/user";
import { onMounted } from "vue";

const systemStore = useSystemStore();
const userStore = useUserStore();

onLaunch(() => {
  // 1. 初始化系统布局信息
  systemStore.initSystemInfo();
  userStore.initUserStore();
});
onShow(() => {});

onMounted(() => {
  // 仅在客户端执行
  // 稍微延迟一丢丢，确保样式文件真的解析完了
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
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
