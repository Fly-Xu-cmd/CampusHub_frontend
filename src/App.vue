<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useSystemStore } from '@/store/system';

const systemStore = useSystemStore();

onLaunch(() => {
  // 1. 初始化系统布局信息
  systemStore.initSystemInfo();
});

onShow(()=>{

});

</script>

<style lang="scss">
@use "@/styles/variables.scss" as *;
@import "@/styles/iconfont.css";

/* 全局样式 */
view, text, button, image, scroll-view, swiper, input, picker {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* 所有元素（包括view）默认使用border-box */
}
</style>