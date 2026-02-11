<template>
  <view class="tab-bar-container" :style="{ bottom: tabBarBottom }">
    <view class="tab-bar-content">
      <view class="nav-item" :class="{ active: isActiveTab('pages/home/index') }" @tap="switchTab('/pages/home/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="faxian1" size="40rpx" />
        </view>
      </view>
      <view class="nav-item" :class="{ active: isActiveTab('pages/message/index') }" @tap="switchTab('/pages/message/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="message" size="40rpx" />
        </view>
      </view>

      <view class="nav-item center-item" @tap="handlePublish">
        <view class="plus-btn">
          <text class="plus-icon">＋</text>
        </view>
      </view>

      <view class="nav-item" :class="{ active: isActiveTab('pages/ticket/index') }" @tap="switchTab('/pages/ticket/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="ticket" size="40rpx" />
        </view>
      </view>

      <view class="nav-item" :class="{ active: isActiveTab('pages/profile/index') }" @tap="switchTab('/pages/profile/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="geren" size="40rpx" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSystemStore } from '@/store/system';

const systemStore = useSystemStore();

// 使用 ref 而不是 computed，避免 SSR 不匹配
const currentPath = ref('');

// 计算底部位置：基础距离 + 安全区域高度
const tabBarBottom = computed(() => {
  const baseBottom = 20; // 基础距离 rpx
  const safeBottom = systemStore.safeAreaInsetsBottom; // px
  // 转换 rpx 到 px（设计稿 750px 宽度）
  const baseBottomPx = baseBottom * (systemStore.windowWidth / 750);
  return `${baseBottomPx + safeBottom}px`;
});

// 在客户端挂载后获取当前路径
onMounted(() => {
  const pages = getCurrentPages();
  currentPath.value = pages[pages.length - 1]?.route || '';
});

// 判断是否是激活的 tab
const isActiveTab = (path: string): boolean => {
  // 移除查询参数并比较
  const basePath = (route: string) => {
    const match = route.match(/^\/pages\/[^\/]+/);
    return match ? match[0] : route;
  };

  return basePath(currentPath.value) === basePath(path);
};

const switchTab = (url: string) => {
  uni.navigateTo({
    url,
    animationType: 'none',
    animationDuration: 200
  });
};

const handlePublish = () => {
  uni.navigateTo({ url: '/pages/publish/index' });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.tab-bar-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 80rpx); /* 两侧留白 */
  z-index: 999;
}

.tab-bar-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px); /* 毛玻璃效果 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.1);
  border-radius: 56rpx;
  height: 120rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;

  .icon {
    font-size: 40rpx;
    color: #8ea6c4;
    transition: color 0.3s;
  }

  &.active .icon {
    color: $accent-color; /* 橙色高亮 */
  }
}

/* 中间凸起按钮样式 */
.center-item {
  margin-top: -60rpx; /* 向上凸起 */

  .plus-btn {
    width: 96rpx;
    height: 96rpx;
    background: #1e293b; /* 深色背景 */
    border-radius: 36rpx;
    transform: rotate(45deg); /* 菱形外观 */
    display: flex;
    align-items: center;
    justify-content: center;
    border: 8rpx solid #F8FAFC; /* 模拟外部遮罩 */
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);

    .plus-icon {
      font-size: 44rpx;
      color: white;
      transform: rotate(-45deg); /* 图标转回来 */
      font-weight: bold;
    }
  }
}
</style>
